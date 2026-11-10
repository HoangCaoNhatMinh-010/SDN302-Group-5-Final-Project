import { User } from '../models/User.js';
import { findOwnerForIdentity, resolveOwner } from '../utils/resolveOwner.js';

const parseOwnerBirthDate = (value) => {
  if (!value) return null;
  const match = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1])));
  return date.getUTCFullYear() === Number(match[3])
    && date.getUTCMonth() === Number(match[2]) - 1
    && date.getUTCDate() === Number(match[1])
    ? date
    : null;
};

/**
 * @desc   Lấy thông tin hồ sơ người dùng
 * @route  GET /api/v1/profile
 * @access Private
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Cập nhật hồ sơ người dùng
 * @route  PUT /api/v1/profile
 * @access Private
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, dateOfBirth, gender, address, avatar } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Họ và tên không được để trống' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email không được để trống' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Số điện thoại không được để trống' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });

    // Kiểm tra trùng email với người khác
    const emailExist = await User.findOne({ email: cleanEmail, _id: { $ne: req.user.id } });
    if (emailExist) {
      return res.status(400).json({ success: false, message: 'Email này đã được sử dụng bởi người dùng khác' });
    }

    // Kiểm tra trùng phone với người khác
    const phoneExist = await User.findOne({ phone: cleanPhone, _id: { $ne: req.user.id } });
    if (phoneExist) {
      return res.status(400).json({ success: false, message: 'Số điện thoại này đã được sử dụng bởi người dùng khác' });
    }

    if (dateOfBirth !== undefined && dateOfBirth !== '' && !parseOwnerBirthDate(dateOfBirth)) {
      return res.status(400).json({ success: false, message: 'Ngày sinh phải theo định dạng DD/MM/YYYY.' });
    }

    user.name = name.trim();
    user.email = cleanEmail;
    user.phone = cleanPhone;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (gender !== undefined) user.gender = gender;
    if (address !== undefined) user.address = address;
    if (avatar !== undefined) user.avatar = avatar;

    if (user.role === 'PATIENT' && user.ownerLinkStatus !== 'PENDING') {
      const matchingOwner = await findOwnerForIdentity({ email: cleanEmail, phone: cleanPhone });
      if (matchingOwner && user.ownerId && !matchingOwner._id.equals(user.ownerId)) {
        return res.status(409).json({
          success: false,
          message: 'Email hoặc số điện thoại thuộc hồ sơ chủ thú cưng khác. Vui lòng liên hệ cửa hàng để xác minh.',
        });
      }

      const owner = await resolveOwner(user);
      owner.full_name = user.name;
      owner.email = user.email;
      owner.phone = user.phone;
      if (user.address !== undefined) owner.address = user.address;
      if (user.dateOfBirth !== undefined) {
        owner.date_of_birth = user.dateOfBirth ? parseOwnerBirthDate(user.dateOfBirth) : undefined;
      }
      if (user.gender) {
        owner.gender = { Nam: 'male', Nữ: 'female', Khác: 'other' }[user.gender];
      }
      await owner.save();
    }
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin hồ sơ thành công!',
      data: user,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Đổi mật khẩu người dùng
 * @route  PUT /api/v1/profile/change-password
 * @access Private
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập mật khẩu hiện tại' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới tối thiểu 6 ký tự' });
    }
    if (newPassword === currentPassword) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không trùng khớp' });
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác' });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Đổi mật khẩu thành công!',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
