import { Notification } from '../models/Notification.js';

/**
 * @desc   Lấy danh sách thông báo của người dùng
 * @route  GET /api/v1/notifications
 * @access Private
 */
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const unreadCount = await Notification.countDocuments({ userId: req.user.id, read: false });

    return res.status(200).json({
      success: true,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Đánh dấu đã đọc một thông báo
 * @route  PUT /api/v1/notifications/:id/read
 * @access Private
 */
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Thông báo không tồn tại' });
    }

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Đánh dấu tất cả thông báo đã đọc
 * @route  PUT /api/v1/notifications/read-all
 * @access Private
 */
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });

    return res.status(200).json({
      success: true,
      message: 'Đã đánh dấu tất cả thông báo là đã đọc',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

