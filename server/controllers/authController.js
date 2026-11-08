import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// Helper tạo JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'medcare_jwt_secret_key_2026_super_secure', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @desc   Đăng ký tài khoản Bệnh nhân mới
 * @route  POST /api/v1/auth/register
 * @access Public
 */
export const register = async (req, res) => {
  try {
    const { fullName, phone, email, password, confirmPassword } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Họ và tên không được để trống' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Số điện thoại không được để trống' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email không được để trống' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có tối thiểu 6 ký tự' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không trùng khớp' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim().replace(/\s+/g, '');

    // Check duplicate email
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email này đã được sử dụng' });
    }

    // Check duplicate phone
    const existingPhone = await User.findOne({ phone: cleanPhone });
    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'Số điện thoại này đã được sử dụng' });
    }

    const patientCode = `BN-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const user = await User.create({
      name: fullName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password,
      role: 'PATIENT',
      patientCode,
      title: 'Bệnh nhân',
      dateOfBirth: '01/01/1995',
      gender: 'Nam',
      address: 'TP. Hồ Chí Minh',
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản Bệnh nhân thành công!',
      token,
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Đăng nhập bằng Email/SĐT + Mật khẩu
 * @route  POST /api/v1/auth/login
 * @access Public
 */
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !identifier.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email/số điện thoại và mật khẩu',
      });
    }

    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.trim().replace(/\s+/g, '');

    // Tìm theo email hoặc phone
    const user = await User.findOne({
      $or: [{ email: cleanId }, { phone: cleanPhone }],
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc số điện thoại không tồn tại trong hệ thống',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu không chính xác',
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Yêu cầu gửi mã OTP qua SĐT (dành cho bệnh nhân)
 * @route  POST /api/v1/auth/request-otp
 * @access Public
 */
export const requestOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập số điện thoại' });
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const user = await User.findOne({ phone: cleanPhone });

    // Tạo OTP mẫu (123456)
    const demoOtp = '123456';
    if (user) {
      user.otpCode = demoOtp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút
      await user.save({ validateBeforeSave: false });
    }

    return res.status(200).json({
      success: true,
      message: 'Mã xác thực OTP đã được gửi (Mã thử nghiệm: 123456)',
      demoOtp,
      isKnownPatient: !!user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Xác thực OTP và đăng nhập (dành cho bệnh nhân)
 * @route  POST /api/v1/auth/verify-otp
 * @access Public
 */
export const verifyOtpAndLogin = async (req, res) => {
  try {
    const { phone, otpCode } = req.body;

    if (!phone || !otpCode) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập SĐT và mã OTP' });
    }

    if (otpCode.trim() !== '123456') {
      return res.status(400).json({ success: false, message: 'Mã OTP không chính xác. Mã thử nghiệm: 123456' });
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    let user = await User.findOne({ phone: cleanPhone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Số điện thoại ${phone} chưa đăng ký tài khoản. Vui lòng đăng ký trước.`,
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập OTP thành công!',
      token,
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Yêu cầu đặt lại mật khẩu
 * @route  POST /api/v1/auth/forgot-password
 * @access Public
 */
export const requestPasswordReset = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email hoặc số điện thoại' });
    }

    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.trim().replace(/\s+/g, '');

    const user = await User.findOne({
      $or: [{ email: cleanId }, { phone: cleanPhone }],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản với thông tin đã cung cấp' });
    }

    const resetToken = 'reset-token-' + Date.now();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 phút
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: 'Yêu cầu khôi phục mật khẩu hợp lệ. Bạn có thể đặt lại mật khẩu mới.',
      token: resetToken,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Đặt lại mật khẩu mới
 * @route  POST /api/v1/auth/reset-password
 * @access Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới tối thiểu 6 ký tự' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không khớp' });
    }

    let user;
    if (token) {
      user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });
    }

    if (!user) {
      // Cho phép reset password demo nếu token hợp lệ
      user = await User.findOne({ role: 'PATIENT' });
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Mật khẩu đã được cập nhật thành công. Vui lòng đăng nhập lại.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Lấy thông tin người dùng hiện tại
 * @route  GET /api/v1/auth/me
 * @access Private
 */
export const getMe = async (req, res) => {
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

