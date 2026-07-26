import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Zap, CheckCircle } from 'lucide-react';
import { authAPI } from '../../api/services';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await authAPI.resetPassword(token, { password: form.password });
      setDone(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Reset Password</h2>
        </div>

        <div className="glass-card rounded-3xl p-8 shadow-2xl">
          {done ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Password Updated!</h3>
              <p className="text-sm text-slate-500">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input label="New Password" name="password" type="password" placeholder="Min 8 characters"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} icon={Lock} required />
              <Input label="Confirm Password" name="confirm" type="password" placeholder="Repeat new password"
                value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} icon={Lock} required />
              <Button type="submit" loading={loading} fullWidth size="lg">Reset Password</Button>
              <div className="text-center">
                <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700">Back to login</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
