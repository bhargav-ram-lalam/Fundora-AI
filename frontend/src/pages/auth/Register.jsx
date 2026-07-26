import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { User, Mail, Lock, Zap, Rocket, TrendingUp, Shield } from 'lucide-react';
import { loginSuccess } from '../../features/auth/authSlice';
import { authAPI } from '../../api/services';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

const roles = [
  { value: 'founder', label: 'Startup Founder', icon: Rocket, desc: 'I have a startup idea or business', color: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  { value: 'investor', label: 'Investor', icon: TrendingUp, desc: 'I\'m looking to invest in startups', color: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' },
  { value: 'admin', label: 'Administrator', icon: Shield, desc: 'Platform administrator', color: 'border-red-500 bg-red-50 dark:bg-red-900/20' },
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'founder' });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      dispatch(loginSuccess(data));
      toast.success('Account created! Welcome to Fundora AI 🎉');
      const paths = { admin: '/admin', investor: '/investor', founder: '/founder' };
      navigate(paths[data.user.role]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen gradient-bg dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Create your account</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">From Idea to Investment with Artificial Intelligence</p>
        </div>

        <div className="glass-card rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Full Name" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} icon={User} required />
            <Input label="Email Address" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} icon={Mail} required />
            <Input label="Password" name="password" type="password" placeholder="Min 8 characters" value={form.password} onChange={handleChange} icon={Lock} required />

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">I am a...</label>
              <div className="grid grid-cols-1 gap-3">
                {roles.map(({ value, label, icon: Icon, desc, color }) => (
                  <label key={value} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.role === value ? color : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                    <input type="radio" name="role" value={value} checked={form.role === value} onChange={handleChange} className="sr-only" />
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.role === value ? 'gradient-primary' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      <Icon size={16} className={form.role === value ? 'text-white' : 'text-slate-400'} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</p>
                      <p className="text-xs text-slate-400">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" loading={loading} fullWidth size="lg">Create Account</Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">Sign in →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
