import mongoose from 'mongoose';
import Notification from '../models/Notification.js';

const ownerFilterFor = (req) => (req.user.ownerId ? { owner_id: req.user.ownerId } : null);
const toNotificationDto = (notification) => ({
  id: notification._id.toString(),
  title: notification.type === 'CANCEL' ? 'Lịch chăm sóc đã hủy' : 'Cập nhật lịch chăm sóc thú cưng',
  message: notification.content,
  createdAt: notification.created_at || notification.createdAt,
  scheduled_at: notification.scheduled_at,
  type: notification.type,
  read: Boolean(notification.read_at),
});

/**
 * @desc   Lấy danh sách thông báo của người dùng
 * @route  GET /api/v1/notifications
 * @access Private
 */
export const getMyNotifications = async (req, res) => {
  try {
    const ownerFilter = ownerFilterFor(req);
    if (!ownerFilter) {
      return res.status(200).json({ success: true, unreadCount: 0, data: [] });
    }
    const notifications = await Notification.collection
      .find(ownerFilter)
      .sort({ created_at: -1 })
      .limit(100)
      .toArray();
    const unreadCount = notifications.filter((notification) => !notification.read_at).length;

    return res.status(200).json({
      success: true,
      unreadCount,
      data: notifications.map(toNotificationDto),
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
    const ownerFilter = ownerFilterFor(req);
    if (!ownerFilter) {
      return res.status(404).json({ success: false, message: 'Thông báo không tồn tại' });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Thông báo không tồn tại' });
    }
    const result = await Notification.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(req.params.id), ...ownerFilter },
      { $set: { read_at: new Date() } }
    );
    if (!result.matchedCount) {
      return res.status(404).json({ success: false, message: 'Thông báo không tồn tại' });
    }

    return res.status(200).json({
      success: true,
      message: 'Đã đánh dấu thông báo là đã đọc.',
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
    const ownerFilter = ownerFilterFor(req);
    if (ownerFilter) {
      await Notification.collection.updateMany(
        { ...ownerFilter, read_at: { $exists: false } },
        { $set: { read_at: new Date() } }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Đã đánh dấu tất cả thông báo là đã đọc',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
