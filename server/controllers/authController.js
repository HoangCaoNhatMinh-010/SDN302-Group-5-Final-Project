import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { OtpVerification } from '../models/OtpVerification.js';
import { sendOtpEmail, sendWelcomeGoogleEmail } from '../utils/mailer.js';

// Helper tạo JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'medcare_jwt_secret_key_2026_super_secure', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @desc   Bước 1 Đăng ký: Kiểm tra thông tin & Gửi mã OTP xác thực tới Gmail
 * @route  POST /api/v1/auth/register/send-otp
 * @access Public
 */
export const sendRegisterOtp = async (req, res) => {
  try {
    const { fullName, phone, email, password, confirmPassword } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Họ và tên không được để trống' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Số điện thoại không được để trống' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Địa chỉ Gmail / Email không được để trống' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có tối thiểu 6 ký tự' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không trùng khớp' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim().replace(/\s+/g, '');

    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email này đã được sử dụng trong hệ thống' });
    }

    const existingPhone = await User.findOne({ phone: cleanPhone });
    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'Số điện thoại này đã được đăng ký bởi tài khoản khác' });
    }

    const expiresMinutes = Number(process.env.PASSWORD_RESET_OTP_EXPIRES_MINUTES) || 10;
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

    // Xóa OTP cũ của email này nếu có
    await OtpVerification.deleteMany({ email: cleanEmail });

    await OtpVerification.create({
      email: cleanEmail,
      phone: cleanPhone,
      fullName: fullName.trim(),
      password,
      otpCode,
      expiresAt,
    });

    const mailRes = await sendOtpEmail({
      to: cleanEmail,
      name: fullName.trim(),
      otpCode,
      purpose: 'Xác thực đăng ký tài khoản',
    });

    if (!mailRes.sent) {
      return res.status(500).json({
        success: false,
        message: `Không thể gửi mã xác thực tới email ${cleanEmail}. Vui lòng kiểm tra lại địa chỉ Gmail.`,
      });
    }

    return res.status(200).json({
      success: true,
      emailSent: true,
      targetEmail: cleanEmail,
      expiresMinutes,
      message: `Mã OTP xác thực 6 số đã được gửi tới Gmail ${cleanEmail}. Vui lòng kiểm tra hộp thư!`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Bước 2 Đăng ký: Xác thực OTP Gmail & Tạo tài khoản Khách hàng
 * @route  POST /api/v1/auth/register
 * @access Public
 */
export const register = async (req, res) => {
  try {
    const { email, otpCode, fullName, phone, password, confirmPassword } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email không được để trống' });
    }
    if (!otpCode || !otpCode.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập mã OTP 6 số đã nhận qua Gmail' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const verification = await OtpVerification.findOne({
      email: cleanEmail,
      otpCode: otpCode.trim(),
      expiresAt: { $gt: Date.now() },
    });

    if (!verification) {
      return res.status(400).json({
        success: false,
        message: 'Mã xác thực Gmail không chính xác hoặc đã hết hạn. Vui lòng kiểm tra lại hoặc gửi lại mã mới.',
      });
    }

    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email này đã được đăng ký' });
    }

    const finalName = verification.fullName || (fullName && fullName.trim()) || cleanEmail.split('@')[0];
    const finalPhone = verification.phone || (phone && phone.trim().replace(/\s+/g, ''));
    const finalPassword = verification.password || password;

    if (!finalPassword || finalPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu không hợp lệ' });
    }

    const patientCode = `PAW-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const user = await User.create({
      name: finalName,
      email: cleanEmail,
      phone: finalPhone,
      password: finalPassword,
      role: 'PATIENT',
      isEmailVerified: true,
      patientCode,
      title: 'Khách hàng (Chủ thú cưng)',
      dateOfBirth: '01/01/1995',
      gender: 'Nam',
      address: 'TP. Hồ Chí Minh',
    });

    // Dọn dẹp OTP đã sử dụng
    await OtpVerification.deleteMany({ email: cleanEmail });

    await Notification.create({
      userId: user._id,
      title: 'Chào mừng thành viên mới! 🐾',
      message: `Tài khoản ${user.name} đã xác thực Gmail thành công và sẵn sàng đặt lịch tại PawCare Studio.`,
      type: 'system',
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Xác thực Gmail & Đăng ký tài khoản thành công!',
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

    if (user.authProvider === 'google' && !user.password) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản này được liên kết với Google. Vui lòng chọn "Đăng nhập bằng Google".',
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email/Số điện thoại hoặc mật khẩu không chính xác',
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
 * @desc   Yêu cầu gửi mã OTP qua Email (hỗ trợ nhập Email hoặc SĐT đã đăng ký)
 * @route  POST /api/v1/auth/request-otp
 * @access Public
 */
export const requestOtp = async (req, res) => {
  try {
    const rawId = req.body.identifier || req.body.phone || req.body.email;
    if (!rawId || !rawId.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email hoặc số điện thoại' });
    }

    const cleanId = rawId.trim().toLowerCase();
    const cleanPhone = rawId.trim().replace(/\s+/g, '');

    const user = await User.findOne({
      $or: [{ email: cleanId }, { phone: cleanPhone }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản nào với email hoặc số điện thoại này. Vui lòng đăng ký trước.',
      });
    }

    const expiresMinutes = Number(process.env.PASSWORD_RESET_OTP_EXPIRES_MINUTES) || 10;
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.otpCode = otpCode;
    user.otpExpires = new Date(Date.now() + expiresMinutes * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const mailRes = await sendOtpEmail({
      to: user.email,
      name: user.name,
      otpCode,
      purpose: 'Đăng nhập nhanh',
    });

    return res.status(200).json({
      success: true,
      emailSent: mailRes.sent,
      targetEmail: user.email,
      expiresMinutes,
      message: mailRes.sent
        ? `Mã OTP 6 số đã được gửi tới Gmail (${user.email}). Hiệu lực ${expiresMinutes} phút!`
        : `Hệ thống đã tạo mã OTP (không gửi được email: ${mailRes.error}). Mã tạm: ${otpCode}`,
      ...(!mailRes.sent ? { fallbackOtp: otpCode } : {}),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Xác thực OTP và đăng nhập
 * @route  POST /api/v1/auth/verify-otp
 * @access Public
 */
export const verifyOtpAndLogin = async (req, res) => {
  try {
    const rawId = req.body.identifier || req.body.phone || req.body.email;
    const { otpCode } = req.body;

    if (!rawId || !otpCode) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập Email/SĐT và mã OTP' });
    }

    const cleanId = rawId.trim().toLowerCase();
    const cleanPhone = rawId.trim().replace(/\s+/g, '');

    const user = await User.findOne({
      $or: [{ email: cleanId }, { phone: cleanPhone }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Tài khoản không tồn tại. Vui lòng đăng ký tài khoản mới.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.',
      });
    }

    const cleanOtp = otpCode.trim();
    const isValidStoredOtp =
      user.otpCode &&
      user.otpCode === cleanOtp &&
      user.otpExpires &&
      user.otpExpires.getTime() > Date.now();

    if (!isValidStoredOtp) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP không chính xác hoặc đã hết hạn. Vui lòng kiểm tra lại hộp thư hoặc gửi lại mã mới.',
      });
    }

    // Xóa OTP sau khi dùng
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Xác thực OTP & Đăng nhập thành công!',
      token,
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Yêu cầu gửi mã OTP khôi phục mật khẩu qua Email
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

    const expiresMinutes = Number(process.env.PASSWORD_RESET_OTP_EXPIRES_MINUTES) || 10;
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordToken = otpCode;
    user.resetPasswordExpires = new Date(Date.now() + expiresMinutes * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const mailRes = await sendOtpEmail({
      to: user.email,
      name: user.name,
      otpCode,
      purpose: 'Khôi phục mật khẩu',
    });

    return res.status(200).json({
      success: true,
      emailSent: mailRes.sent,
      targetEmail: user.email,
      expiresMinutes,
      message: mailRes.sent
        ? `Mã OTP 6 số khôi phục mật khẩu đã được gửi tới email ${user.email}. Hiệu lực ${expiresMinutes} phút.`
        : `Đã tạo mã OTP khôi phục (lỗi SMTP: ${mailRes.error}). Mã tạm: ${otpCode}`,
      ...(!mailRes.sent ? { token: otpCode } : {}),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Đặt lại mật khẩu mới bằng mã OTP Email
 * @route  POST /api/v1/auth/reset-password
 * @access Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { otp, token, identifier, newPassword, confirmPassword } = req.body;
    const otpOrToken = (otp || token || '').trim();

    if (!otpOrToken) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập mã OTP 6 số đã nhận qua email' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới tối thiểu 6 ký tự' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không khớp' });
    }

    const query = {
      resetPasswordToken: otpOrToken,
      resetPasswordExpires: { $gt: Date.now() },
    };

    if (identifier && identifier.trim()) {
      const cleanId = identifier.trim().toLowerCase();
      const cleanPhone = identifier.trim().replace(/\s+/g, '');
      query.$or = [{ email: cleanId }, { phone: cleanPhone }];
    }

    const user = await User.findOne(query);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP khôi phục mật khẩu không chính xác hoặc đã hết hạn (10 phút).',
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Mật khẩu đã được cập nhật thành công! Vui lòng đăng nhập lại bằng mật khẩu mới.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Đăng nhập / Tự động đăng ký bằng Google Account
 * @route  POST /api/v1/auth/google
 * @access Public
 */
export const googleLogin = async (req, res) => {
  try {
    let { email, name, avatar, googleId, credential } = req.body;

    // Nếu nhận được Google ID Token (JWT credential từ Google Identity Services)
    if (credential) {
      try {
        const base64Payload = credential.split('.')[1];
        const decodedPayload = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf8'));
        email = decodedPayload.email || email;
        name = decodedPayload.name || name;
        avatar = decodedPayload.picture || avatar;
        googleId = decodedPayload.sub || googleId;
      } catch (decodeErr) {
        return res.status(400).json({ success: false, message: 'Token Google không hợp lệ' });
      }
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Không nhận được email tài khoản Google' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: cleanEmail });

    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      const patientCode = `PAW-GG-${Math.floor(1000 + Math.random() * 9000)}`;
      user = await User.create({
        name: (name && name.trim()) || cleanEmail.split('@')[0],
        email: cleanEmail,
        googleId: googleId || `gg_${Date.now()}`,
        authProvider: 'google',
        role: 'PATIENT',
        avatar:
          avatar ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        title: 'Khách hàng (Google)',
        patientCode,
        dateOfBirth: '01/01/1995',
        gender: 'Nam',
        address: 'TP. Hồ Chí Minh',
      });

      await Notification.create({
        userId: user._id,
        title: 'Chào mừng thành viên mới từ Google! 🐾',
        message: `Xin chào ${user.name}, tài khoản PawCare Studio của bạn đã được khởi tạo thành công qua Google.`,
        type: 'system',
      });

      // Gửi email chào mừng qua SMTP Gmail (không chặn response)
      sendWelcomeGoogleEmail({ to: user.email, name: user.name }).catch(() => {});
    } else {
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.',
        });
      }
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        await user.save({ validateBeforeSave: false });
      }
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      isNewUser,
      message: isNewUser
        ? 'Đăng ký & Đăng nhập bằng Google thành công!'
        : 'Đăng nhập bằng Google thành công!',
      token,
      user,
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
