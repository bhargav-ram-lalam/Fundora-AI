import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, Zap, Eye, EyeOff } from 'lucide-react';
import { loginStart, loginSuccess, loginFailure } from '../../features/auth/authSlice';
import { authAPI } from '../../api/services';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(s => s.auth);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    dispatch(loginStart());
    try {
      const { data } = await authAPI.login(form);
      dispatch(loginSuccess(data));
      toast.success(`Welcome back, ${data.user.name}!`);
      const paths = { admin: '/admin', investor: '/investor', founder: '/founder' };
      navigate(paths[data.user.role] || '/founder');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      dispatch(loginFailure(msg));
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen gradient-bg dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-xl">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold gradient-text">Fundora AI</h1>
              <p className="text-xs text-slate-400">AI Funding Platform</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Welcome back</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Sign in to your Fundora AI account</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Email Address" name="email" type="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} icon={Mail} required />
            <div>
              <Input label="Password" name="password" type={showPass ? 'text' : 'password'}
                placeholder="Enter your password" value={form.password} onChange={handleChange} icon={Lock} required />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <input type="checkbox" className="rounded" /> Remember me
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={loading} fullWidth size="lg">Sign In</Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700">Create one →</Link>
            </p>
          </div>

          {/* Demo accounts */}
          <div className="mt-5 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">🔑 Demo Accounts</p>
            <div className="space-y-1 text-xs text-blue-600 dark:text-blue-300">
              <p><strong>Admin:</strong> admin@fundai.demo / FundAI@2024</p>
              <p><strong>Investor:</strong> investor@fundai.demo / FundAI@2024</p>
              <p><strong>Founder:</strong> Register with role "founder"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
