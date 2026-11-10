import crypto from 'crypto';
import mongoose from 'mongoose';
import { Appointment } from '../models/Appointment.js';
import { Notification } from '../models/Notification.js';

const PAYOS_API_URL = 'https://api-merchant.payos.vn/v2/payment-requests';

const buildPayosSignature = (dataObj, checksumKey) => {
  const sortedKeys = Object.keys(dataObj).sort();
  const queryString = sortedKeys.map((key) => `${key}=${dataObj[key]}`).join('&');
  return crypto.createHmac('sha256', checksumKey).update(queryString).digest('hex');
};

/**
 * @desc   Tạo liên kết thanh toán PayOS cho lịch hẹn (Phí cố định 100 VND)
 * @route  POST /api/v1/payments/create-payos-link
 * @access Private
 */
export const createPayosPaymentLink = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ success: false, message: 'Mã lịch hẹn không hợp lệ' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch hẹn' });
    }

    if (appointment.paymentStatus === 'PAID') {
      return res.status(200).json({
        success: true,
        alreadyPaid: true,
        message: 'Lịch hẹn này đã được thanh toán phí đặt lịch rồi.',
        data: appointment,
      });
    }

    const amount = Number(process.env.PAYOS_BOOKING_FEE) || 100; // Cố định 100 VND
    const orderCode = Number(`${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 899)}`);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const returnUrl = `${clientUrl}/patient/appointments?payment=success&orderCode=${orderCode}&appointmentId=${appointment._id}`;
    const cancelUrl = `${clientUrl}/patient/appointments?payment=cancelled&orderCode=${orderCode}&appointmentId=${appointment._id}`;
    const description = `PawCare ${appointment.code || orderCode}`.slice(0, 25);

    const clientId = process.env.PAYOS_CLIENT_ID || '';
    const apiKey = process.env.PAYOS_API_KEY || '';
    const checksumKey = process.env.PAYOS_CHECKSUM_KEY || '';

    const signData = {
      amount,
      cancelUrl,
      description,
      orderCode,
      returnUrl,
    };

    const signature = checksumKey ? buildPayosSignature(signData, checksumKey) : '';

    const payload = {
      orderCode,
      amount,
      description,
      buyerName: appointment.patientName || req.user?.name || 'Khach hang PawCare',
      buyerEmail: req.user?.email || 'customer@pawcare.vn',
      buyerPhone: req.user?.phone || '0901234567',
      items: [
        {
          name: `Phi dat lich cham soc thu cung (${appointment.petName || 'Pet'})`,
          quantity: 1,
          price: amount,
        },
      ],
      returnUrl,
      cancelUrl,
      signature,
    };

    let payosLiveResult = null;
    let payosNotice = '';

    // Gọi trực tiếp cổng PayOS API V2
    if (clientId && apiKey && checksumKey) {
      try {
        const payosRes = await fetch(PAYOS_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': clientId,
            'x-api-key': apiKey,
          },
          body: JSON.stringify(payload),
        });
        const payosJson = await payosRes.json();

        if (payosJson && payosJson.code === '00' && payosJson.data) {
          payosLiveResult = payosJson.data;
        } else {
          payosNotice = payosJson?.desc || payosJson?.message || 'PayOS từ chối yêu cầu (kiểm tra Checksum Key hoặc số tiền tối thiểu)';
          console.warn('[PayOS API Notice]:', payosJson);
        }
      } catch (fetchErr) {
        payosNotice = `Không thể kết nối PayOS API: ${fetchErr.message}`;
        console.warn('[PayOS Fetch Error]:', fetchErr.message);
      }
    } else {
      payosNotice = 'Thiếu cấu hình PayOS Keys trong .env';
    }

    // Lưu thông tin giao dịch vào Appointment
    appointment.bookingFee = amount;
    appointment.paymentMethod = 'PAYOS';
    appointment.paymentStatus = 'PENDING';
    appointment.payosOrderCode = orderCode;
    appointment.payosCheckoutUrl = payosLiveResult?.checkoutUrl || '';
    await appointment.save();

    return res.status(200).json({
      success: true,
      mode: payosLiveResult ? 'payos_live' : 'payos_sandbox',
      payosNotice,
      data: {
        appointmentId: appointment._id,
        orderCode,
        amount,
        description,
        checkoutUrl: payosLiveResult?.checkoutUrl || null,
        qrCode: payosLiveResult?.qrCode || null,
        accountNumber: payosLiveResult?.accountNumber || '19036888999888',
        accountName: payosLiveResult?.accountName || 'PAWCARE PET SPA STUDIO',
        bin: payosLiveResult?.bin || '970407',
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Xác minh và cập nhật trạng thái thanh toán PayOS
 * @route  POST /api/v1/payments/verify-payos
 * @access Private
 */
export const verifyPayosPayment = async (req, res) => {
  try {
    const { orderCode, appointmentId, simulateSuccess = false } = req.body;

    let appointment = null;
    if (appointmentId && mongoose.Types.ObjectId.isValid(appointmentId)) {
      appointment = await Appointment.findById(appointmentId);
    } else if (orderCode) {
      appointment = await Appointment.findOne({ payosOrderCode: Number(orderCode) });
    }

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt lịch tương ứng' });
    }

    if (appointment.paymentStatus === 'PAID') {
      return res.status(200).json({
        success: true,
        message: 'Lịch hẹn đã được thanh toán hoàn tất.',
        data: appointment,
      });
    }

    let isPaidFromGateway = false;
    const clientId = process.env.PAYOS_CLIENT_ID;
    const apiKey = process.env.PAYOS_API_KEY;

    // Kiểm tra trạng thái trực tiếp từ PayOS nếu có orderCode
    if (orderCode && clientId && apiKey) {
      try {
        const checkRes = await fetch(`${PAYOS_API_URL}/${orderCode}`, {
          method: 'GET',
          headers: {
            'x-client-id': clientId,
            'x-api-key': apiKey,
          },
        });
        const checkJson = await checkRes.json();
        if (checkJson?.code === '00' && checkJson?.data?.status === 'PAID') {
          isPaidFromGateway = true;
        }
      } catch (err) {
        console.warn('[PayOS Verify Warning]:', err.message);
      }
    }

    if (!isPaidFromGateway && !simulateSuccess) {
      return res.status(400).json({
        success: false,
        message: 'Giao dịch chưa được ghi nhận thanh toán trên PayOS. Vui lòng quét mã QR hoặc thử lại.',
      });
    }

    appointment.paymentStatus = 'PAID';
    appointment.paidAt = new Date();
    await appointment.save();

    await Notification.create({
      userId: appointment.patientId,
      title: 'Thanh toán PayOS thành công (100đ) 💳',
      message: `Phí đặt lịch cố định 100 VNĐ cho bé ${appointment.petName} (Mã ${appointment.code}) đã được thanh toán thành công qua PayOS.`,
      type: 'appointment',
    });

    return res.status(200).json({
      success: true,
      message: 'Thanh toán phí đặt lịch 100đ qua PayOS thành công! 🐾',
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Webhook nhận thông báo thanh toán tự động từ PayOS
 * @route  POST /api/v1/payments/payos-webhook
 * @access Public
 */
export const handlePayosWebhook = async (req, res) => {
  try {
    const { data, code } = req.body;
    if (code === '00' && data?.orderCode) {
      const appointment = await Appointment.findOne({ payosOrderCode: Number(data.orderCode) });
      if (appointment && appointment.paymentStatus !== 'PAID') {
        appointment.paymentStatus = 'PAID';
        appointment.paidAt = new Date();
        await appointment.save();

        await Notification.create({
          userId: appointment.patientId,
          title: 'Xác nhận thanh toán PayOS 💳',
          message: `Đã nhận 100 VNĐ phí giữ chỗ cho lịch hẹn [${appointment.code}].`,
          type: 'appointment',
        });
      }
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

