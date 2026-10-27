import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { ShieldCheck, UserCheck, Lock, Mail, User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { name: string; email: string; role: 'customer' | 'admin' } | null;
  onLogin: (user: { name: string; email: string; role: 'customer' | 'admin' }) => void;
  onLogout: () => void;
  onSwitchToAdmin: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  onSwitchToAdmin,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onLogin({
      name: name || email.split('@')[0],
      email,
      role: 'customer',
    });
    onClose();
  };

  const handleQuickLogin = (demoRole: 'customer' | 'admin') => {
    if (demoRole === 'admin') {
      onLogin({
        name: 'Vishnu Admin',
        email: 'admin@flashguard.io',
        role: 'admin',
      });
      onSwitchToAdmin();
    } else {
      onLogin({
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'customer',
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={currentUser ? 'User Account' : isRegister ? 'Create FlashGuard Account' : 'Sign in to FlashGuard'}
      subtitle={
        currentUser
          ? `Logged in as ${currentUser.email}`
          : 'Participate in high-speed flash sales with AI anti-bot protection'
      }
      maxWidth="md"
    >
      {currentUser ? (
        <div className="space-y-4 py-2">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-slate-900">{currentUser.name}</div>
              <div className="text-xs text-slate-500">{currentUser.email}</div>
              <div className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                {currentUser.role} Account
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                onSwitchToAdmin();
                onClose();
              }}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Switch to Operations Dashboard
            </button>
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-xs rounded-xl transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Fast demo profile buttons */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 space-y-2">
            <div className="text-[11px] font-semibold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              1-Click Demo Profiles (For Evaluation)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('customer')}
                className="py-1.5 px-2 bg-white border border-indigo-200 hover:border-indigo-400 rounded-lg text-xs font-semibold text-slate-700 hover:bg-indigo-50/50 transition-colors text-left"
              >
                Customer: <span className="font-normal text-slate-500">John Doe</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="py-1.5 px-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg text-xs font-semibold text-white transition-colors text-left"
              >
                Operations: <span className="font-normal text-indigo-300">Admin</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              {isRegister ? 'Register & Continue' : 'Sign In'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-indigo-600 hover:underline font-semibold"
            >
              {isRegister ? 'Sign in' : 'Register now'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
