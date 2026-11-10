import jwt from 'jsonwebtoken';
import Owner from '../models/Owner.js';
import User from '../models/User.js';
import { findOwnerForIdentity } from '../utils/resolveOwner.js';

// Helper tạo JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @desc   Đăng ký tài khoản khách hàng mới
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
    if (!/^0\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, message: 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.' });
    }

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

    let ownerLinkStatus = 'LINKED';
    try {
      const matchedOwner = await findOwnerForIdentity({ email: cleanEmail, phone: cleanPhone });
      if (matchedOwner) ownerLinkStatus = 'PENDING';
    } catch (error) {
      if (error.statusCode === 403 || error.statusCode === 409) {
        ownerLinkStatus = 'PENDING';
      } else {
        throw error;
      }
    }

    const owner = ownerLinkStatus === 'LINKED'
      ? await Owner.create({
        full_name: fullName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        is_active: true,
      })
      : null;

    const user = await User.create({
      name: fullName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password,
      role: 'PET_OWNER',
      patientCode,
      ownerId: owner?._id,
      ownerLinkStatus,
      title: 'Khách hàng',
      dateOfBirth: '',
      gender: 'Nam',
      address: '',
    });

    return res.status(201).json({
      success: true,
      message: ownerLinkStatus === 'PENDING'
        ? 'Tài khoản đã tạo. Cửa hàng cần xác minh và liên kết hồ sơ thú cưng trước khi bạn sử dụng tính năng đặt lịch.'
        : 'Đăng ký tài khoản khách hàng thành công!',
      user,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
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
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.',
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
 * @desc   Yêu cầu gửi mã OTP qua SĐT cho khách hàng
 * @route  POST /api/v1/auth/request-otp
 * @access Public
 */
export const requestOtp = async (_req, res) => {
  return res.status(503).json({
    success: false,
    message: 'Đăng nhập OTP chưa khả dụng vì cửa hàng chưa cấu hình nhà cung cấp SMS.',
  });
};

/**
 * @desc   Xác thực OTP và đăng nhập cho khách hàng
 * @route  POST /api/v1/auth/verify-otp
 * @access Public
 */
export const verifyOtpAndLogin = async (_req, res) => {
  return res.status(503).json({
    success: false,
    message: 'Đăng nhập OTP chưa khả dụng vì cửa hàng chưa cấu hình nhà cung cấp SMS.',
  });
};

/**
 * @desc   Yêu cầu đặt lại mật khẩu
 * @route  POST /api/v1/auth/forgot-password
 * @access Public
 */
export const requestPasswordReset = async (_req, res) => {
  return res.status(503).json({
    success: false,
    message: 'Khôi phục mật khẩu chưa khả dụng vì cửa hàng chưa cấu hình kênh xác minh.',
  });
};

/**
 * @desc   Đặt lại mật khẩu mới
 * @route  POST /api/v1/auth/reset-password
 * @access Public
 */
export const resetPassword = async (_req, res) => {
  return res.status(503).json({
    success: false,
    message: 'Đặt lại mật khẩu chưa khả dụng vì cửa hàng chưa cấu hình kênh xác minh.',
  });
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
