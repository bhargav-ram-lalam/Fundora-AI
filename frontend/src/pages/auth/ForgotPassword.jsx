import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Zap, ArrowLeft } from 'lucide-react';
import { authAPI } from '../../api/services';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { AlertBanner } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen gradient-bg dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-xl">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Fundora AI</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Forgot Password?</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Enter your email and we'll send you a reset link</p>
        </div>

        <div className="glass-card rounded-3xl p-8 shadow-2xl">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Check your inbox!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">We've sent a password reset link to <strong>{email}</strong></p>
              <AlertBanner type="info" message="In development mode, the reset URL is logged to the backend console." />
              <Link to="/login" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                <ArrowLeft size={16} /> Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input label="Email Address" name="email" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} icon={Mail} required />
              <Button type="submit" loading={loading} fullWidth size="lg">Send Reset Link</Button>
              <div className="text-center">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
                  <ArrowLeft size={16} /> Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
