import { User } from '../models/User.js';

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

    const user = await User.findById(req.user.id);
    user.name = name.trim();
    user.email = cleanEmail;
    user.phone = cleanPhone;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (gender !== undefined) user.gender = gender;
    if (address !== undefined) user.address = address;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin hồ sơ thành công!',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
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

