import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth } from '../firebase';
import { FileText, Mail, Lock, Shield, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const translateFirebaseError = (code: string) => {
    switch (code) {
      case 'auth/invalid-email':
        return '無效的電子郵件格式。';
      case 'auth/user-disabled':
        return '此帳號已被停用。';
      case 'auth/user-not-found':
        return '找不到此電子郵件對應的使用者帳號。';
      case 'auth/wrong-password':
        return '密碼輸入錯誤，請再試一次。';
      case 'auth/email-already-in-use':
        return '此電子郵件已被註冊使用。';
      case 'auth/weak-password':
        return '密碼強度不足，請輸入至少 6 位字元。';
      case 'auth/invalid-credential':
        return '帳號或密碼不正確，請重新檢查。';
      case 'auth/popup-closed-by-user':
        return 'Google 登入視窗已被關閉，請重新點擊嘗試。';
      default:
        return '身份驗證發生錯誤，請稍後再試。';
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('請填寫所有必要欄位。');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('密碼與確認密碼不相符，請重新檢查。');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      setError(translateFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setError(translateFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-sans select-none relative overflow-hidden">
      
      {/* Visual background details to give custom polish */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />
      <div className="absolute -top-40 -left-45 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-60" />
      <div className="absolute -bottom-40 -right-45 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-60" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-white border border-gray-150 rounded-2xl shadow-xl overflow-hidden relative z-10"
      >
        <div className="p-8">
          
          {/* Header & Logo */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">SmartInvoice 智慧發票引擎</h1>
            <p className="text-xs text-gray-400 mt-1">繁體 A4 標準 A-grade 專業列印及發票管理系統</p>
          </div>

          {/* Tab Selection */}
          <div className="flex border-b border-gray-150 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition ${
                isLogin 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              登入帳號
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition ${
                !isLogin 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              註冊新帳號
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">電子郵件信箱 (Email)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">密碼 (Password)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少 6 位字元"
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                  disabled={loading}
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">確認密碼 (Confirm Password)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="請再次輸入密碼"
                    className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? '登入系統' : '完成註冊並登入'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-gray-150"></div>
            <span className="flex-shrink mx-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">或使用第三方帳號</span>
            <div className="flex-grow border-t border-gray-150"></div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full py-2.5 bg-white border border-gray-200 hover:bg-slate-50 text-gray-700 rounded-lg font-bold text-sm shadow-sm flex items-center justify-center gap-2.5 transition disabled:opacity-50 cursor-pointer"
            disabled={loading}
          >
            {/* Google G logo */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.3 1.5-.1.8-1.11 1.77l1.7 1.3c2.72-2.5 4.3-6.2 4.3-10.2M12 24c3.24 0 5.97-1.1 7.96-3l-3.88-3c-1.1.75-2.5 1.2-4.08 1.2-3.14 0-5.8-2.1-6.75-5l-4 3.1c2 4 6.13 6.7 10.75 6.7"
              />
              <path
                fill="#34A853"
                d="M12 24c4.62 0 8.75-2.7 10.75-6.7l-4-3.1c-.95 2.9-3.61 5-6.75 5-1.58 0-2.98-.45-4.08-1.2l-3.88 3c1.99 1.9 4.72 3 7.96 3"
                opacity="0" /* hidden because the first path covers it, let's make it standard Google colored G */
              />
              <path
                fill="#FBBC05"
                d="M5.25 14.1c-.24-.7-.38-1.5-.38-2.3s.14-1.6.38-2.3l-4-3.1C.45 8.1 0 10 0 12s.45 3.9 1.25 5.6l4-3.1"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.6 4.6 1.8l3.43-3.4C17.96 1.15 15.24 0 12 0 7.37 0 3.25 2.7 1.25 6.7l4 3.1c.95-2.9 3.61-5 6.75-5"
              />
            </svg>
            <span>使用 Google 帳號登入</span>
          </button>

        </div>

        {/* Footer info */}
        <div className="bg-slate-50 border-t border-gray-150 py-4 px-8 text-center text-[10px] text-gray-400 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-gray-400" />
          <span>受 Google Firebase 安全性身份驗證機制保護</span>
        </div>

      </motion.div>
    </div>
  );
}
