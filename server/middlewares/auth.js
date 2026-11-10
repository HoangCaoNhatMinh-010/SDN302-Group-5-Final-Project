import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const match = authorization.match(/^Bearer\s+(\S+)$/i);
  if (!match) {
    return res.status(401).json({
      success: false,
      message: 'Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.',
    });
  }
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ success: false, message: 'Máy chủ chưa cấu hình JWT_SECRET.' });
  }

  let decoded;
  try {
    decoded = jwt.verify(match[1], process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.',
      });
    }
    return next(error);
  }

  try {
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản người dùng này không còn tồn tại trên hệ thống.',
      });
    }
    if (!currentUser.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.',
      });
    }
    req.user = currentUser;
    return next();
  } catch (error) {
    return next(error);
  }
};

export const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền thực hiện thao tác này.',
    });
  }
  return next();
};
