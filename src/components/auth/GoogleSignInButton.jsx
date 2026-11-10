import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, User, Check, X, Sparkles } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common';

const GoogleIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
    />
  </svg>
);

const SAVED_GOOGLE_ACCOUNTS_KEY = 'pawcare_recent_google_accounts';

export const GoogleSignInButton = ({
  text = 'Tiếp tục với Google',
  redirectTo = '/patient/dashboard',
}) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const gsiContainerRef = useRef(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [error, setError] = useState('');
  const [recentAccounts, setRecentAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem(SAVED_GOOGLE_ACCOUNTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleBackendGoogleLogin = async (payload) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await authService.googleLogin(payload);
      if (response.success) {
        // Save email locally for quick re-login UX like Google One Tap
        const nextRecent = [
          {
            email: response.user.email,
            name: response.user.name,
            avatar: response.user.avatar || '',
          },
          ...recentAccounts.filter((a) => a.email !== response.user.email),
        ].slice(0, 3);
        setRecentAccounts(nextRecent);
        try {
          localStorage.setItem(SAVED_GOOGLE_ACCOUNTS_KEY, JSON.stringify(nextRecent));
        } catch {
          // ignore
        }

        login(response.user, response.token);
        toast.success(`Chào mừng ${response.user.name}! Đăng nhập Google thành công.`);
        setShowModal(false);
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập bằng Google thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  // Load real Google Identity Services if VITE_GOOGLE_CLIENT_ID is provided
  useEffect(() => {
    if (!googleClientId) return;

    const initGsi = () => {
      if (window.google?.accounts?.id && gsiContainerRef.current) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            if (response.credential) {
              handleBackendGoogleLogin({ credential: response.credential });
            }
          },
        });
        window.google.accounts.id.renderButton(gsiContainerRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          locale: 'vi',
        });
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initGsi;
    document.body.appendChild(script);
  }, [googleClientId]);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const cleanEmail = customEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Vui lòng nhập địa chỉ Gmail hợp lệ');
      return;
    }
    const derivedName = customName.trim() || cleanEmail.split('@')[0];
    handleBackendGoogleLogin({
      email: cleanEmail,
      name: derivedName,
      googleId: `google_${cleanEmail}`,
    });
  };

  if (googleClientId) {
    return <div ref={gsiContainerRef} className="w-full flex justify-center" />;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError('');
          setShowModal(true);
        }}
        className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-400 active:scale-[0.99] transition-all"
      >
        <GoogleIcon />
        <span>{text}</span>
      </button>

      {/* Google Account Chooser Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <GoogleIcon />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Đăng nhập bằng Google
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Kết nối tài khoản Google với PawCare Studio
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {error}
                </div>
              )}

              {/* Saved recent Google accounts on this browser if any */}
              {recentAccounts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500">
                    Tài khoản đã sử dụng gần đây:
                  </p>
                  {recentAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      disabled={isLoading}
                      onClick={() =>
                        handleBackendGoogleLogin({
                          email: acc.email,
                          name: acc.name,
                          avatar: acc.avatar,
                          googleId: `google_${acc.email}`,
                        })
                      }
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-primary-300 hover:bg-primary-50/40 text-left transition-all disabled:opacity-50"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {(acc.name || acc.email)[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {acc.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{acc.email}</p>
                      </div>
                      <Check className="w-4 h-4 text-primary-600 opacity-70" />
                    </button>
                  ))}
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-[11px]">
                      <span className="bg-white px-2 text-slate-400">Hoặc dùng Gmail khác</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Google Email Form */}
              <form onSubmit={handleCustomSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Địa chỉ Gmail <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      autoFocus
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="tenban@gmail.com"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Họ và tên hiển thị
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Minh Anh (tùy chọn)"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full mt-1"
                  isLoading={isLoading}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Tiếp tục với tài khoản Google
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
