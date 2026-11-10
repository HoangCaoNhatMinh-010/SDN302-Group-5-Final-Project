import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle,
  ExternalLink,
  QrCode,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { useToast } from '../../context/ToastContext';
import { Button, Modal, Badge } from '../common';

export const PayosPaymentModal = ({ isOpen, onClose, paymentData, onPaymentSuccess }) => {
  const toast = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  if (!paymentData) return null;

  const {
    appointmentId,
    orderCode,
    amount = 100,
    description,
    checkoutUrl,
    accountNumber = '19036888999888',
    accountName = 'PAWCARE PET SPA STUDIO',
    bin = '970407',
    mode,
    payosNotice,
  } = paymentData;

  const vietQrUrl = `https://img.vietqr.io/image/${bin}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
    description || `PawCare ${orderCode}`
  )}&accountName=${encodeURIComponent(accountName)}`;

  const handleConfirmPayment = async (simulate = false) => {
    setError('');
    setIsVerifying(true);
    try {
      const res = await paymentService.verifyPayosPayment({
        orderCode,
        appointmentId,
        simulateSuccess: simulate,
      });
      toast.success(res.message || 'Thanh toán PayOS 100đ thành công! 🐾');
      if (onPaymentSuccess) onPaymentSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Chưa xác nhận được giao dịch thanh toán.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isVerifying && onClose()}
      title="Thanh toán Phí Đặt Lịch qua PayOS 💳"
      size="md"
    >
      <div className="space-y-4 text-xs">
        {/* Header PayOS */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              <span className="font-extrabold text-sm tracking-tight">Cổng thanh toán PayOS</span>
            </div>
            <p className="text-emerald-50 mt-0.5 text-[11px]">
              Mã đơn hàng: <strong className="font-mono">{orderCode}</strong>
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-emerald-100 block">Phí đặt lịch cố định</span>
            <span className="text-xl font-black">{Number(amount).toLocaleString('vi-VN')} đ</span>
          </div>
        </div>

        {/* Notice if Sandbox Fallback */}
        {mode !== 'payos_live' && payosNotice && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <p className="font-bold">Thông báo từ PayOS API ({payosNotice})</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Hệ thống đang kích hoạt chế độ <strong>PayOS Sandbox QR (100đ)</strong> để bạn kiểm thử quy trình thanh toán hoàn chỉnh. (Lưu ý: Nếu cần dùng PayOS Live API, vui lòng kiểm tra lại đủ 64 ký tự Checksum Key trong <code>server/.env</code>).
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* QR Code Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex flex-col items-center justify-center bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <img
              src={vietQrUrl}
              alt="VietQR PayOS"
              className="w-44 h-44 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <QrCode className="w-3.5 h-3.5" />
              Quét mã QR bằng App Ngân hàng
            </span>
          </div>

          <div className="space-y-2.5">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Chủ tài khoản</span>
              <span className="font-bold text-slate-800">{accountName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Số tài khoản</span>
              <span className="font-mono font-bold text-slate-900">{accountNumber}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Số tiền thanh toán</span>
              <span className="font-extrabold text-emerald-700 text-sm">{Number(amount).toLocaleString('vi-VN')} VNĐ</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Nội dung chuyển khoản</span>
              <span className="font-mono font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded inline-block">
                {description}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isVerifying}
            className="w-full sm:w-auto"
          >
            Thanh toán sau
          </Button>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            {checkoutUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                onClick={() => window.open(checkoutUrl, '_blank', 'noopener,noreferrer')}
                className="w-full sm:w-auto border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                Mở trang PayOS
              </Button>
            )}

            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isVerifying}
              leftIcon={<CheckCircle className="w-4 h-4" />}
              onClick={() => handleConfirmPayment(mode !== 'payos_live')}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white font-bold"
            >
              {mode === 'payos_live' ? 'Kiểm tra đã thanh toán' : 'Xác nhận đã thanh toán (100đ)'}
            </Button>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Giao dịch được mã hóa bảo mật chuẩn PayOS (Client ID: 329be973...)
        </p>
      </div>
    </Modal>
  );
};

