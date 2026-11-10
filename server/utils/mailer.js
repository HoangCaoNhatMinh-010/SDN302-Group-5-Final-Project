import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendOtpEmail = async ({ to, name, otpCode, purpose = 'Xác thực tài khoản' }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[Mailer] Thiếu cấu hình SMTP_USER/SMTP_PASS');
    return { sent: false, error: 'Thiếu cấu hình SMTP' };
  }

  const expiresMinutes = Number(process.env.PASSWORD_RESET_OTP_EXPIRES_MINUTES) || 10;

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"PawCare Studio 🐾" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: `[PawCare Studio] Mã OTP ${purpose}: ${otpCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #f59e0b, #e11d48); padding: 24px; color: white; text-align: center;">
            <h2 style="margin: 0; font-size: 20px;">🐾 PawCare Pet Spa & Grooming</h2>
            <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">${purpose}</p>
          </div>
          <div style="padding: 24px; background: #ffffff; color: #334155;">
            <p style="font-size: 14px; margin-top: 0;">Xin chào <strong>${name || 'Quý khách'}</strong>,</p>
            <p style="font-size: 13px; line-height: 1.6;">
              Bạn vừa yêu cầu mã xác thực OTP tại cửa hàng chăm sóc thú cưng <strong>PawCare Studio</strong>. Vui lòng sử dụng mã OTP bên dưới để tiếp tục:
            </p>
            <div style="margin: 20px 0; padding: 16px; background: #fffbeb; border: 2px dashed #f59e0b; border-radius: 12px; text-align: center;">
              <span style="font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #b45309;">${otpCode}</span>
            </div>
            <p style="font-size: 12px; color: #64748b;">
              ⏰ Mã OTP này có hiệu lực trong vòng <strong>${expiresMinutes} phút</strong>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.
            </p>
          </div>
          <div style="background: #f8fafc; padding: 14px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            PawCare Studio • Hệ thống Chăm sóc & Làm đẹp Thú Cưng
          </div>
        </div>
      `,
    });
    console.log('[Mailer] Đã gửi OTP Email thành công:', info.messageId, '->', to);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Mailer] Lỗi gửi Email OTP:', error.message);
    return { sent: false, error: error.message };
  }
};

export const sendWelcomeGoogleEmail = async ({ to, name }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return { sent: false };

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"PawCare Studio 🐾" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: `[PawCare Studio] Chào mừng ${name} gia nhập cộng đồng yêu thú cưng!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #f59e0b, #e11d48); padding: 24px; color: white; text-align: center;">
            <h2 style="margin: 0; font-size: 20px;">🐾 Chào mừng đến với PawCare Studio</h2>
          </div>
          <div style="padding: 24px; background: #ffffff; color: #334155;">
            <p style="font-size: 14px;">Xin chào <strong>${name}</strong>,</p>
            <p style="font-size: 13px; line-height: 1.6;">
              Tài khoản của bạn đã được liên kết và đăng ký thành công qua Google tại <strong>PawCare Studio</strong>.
            </p>
            <p style="font-size: 13px; line-height: 1.6;">
              Giờ đây bạn có thể quản lý hồ sơ các bé cưng, đặt lịch Spa & Grooming với phí giữ chỗ chỉ 100đ qua PayOS, nhắn tin với chuyên viên hoặc hỏi Trợ lý AI chăm sóc thú cưng 24/7!
            </p>
          </div>
        </div>
      `,
    });
    return { sent: true };
  } catch (err) {
    console.warn('[Mailer] Lỗi gửi welcome email:', err.message);
    return { sent: false };
  }
};

