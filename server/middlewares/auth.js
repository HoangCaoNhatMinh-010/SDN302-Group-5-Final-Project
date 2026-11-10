import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token || token === 'undefined' || token === 'null' || token === 'demo-token') {
      return res.status(401).json({
        success: false,
        message: 'Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'medcare_jwt_secret_key_2026_super_secure');
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
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện thao tác này.',
      });
    }
    next();
  };
};
