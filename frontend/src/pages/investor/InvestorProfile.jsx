import React, { useState, useEffect } from 'react';
import { User, Building2, DollarSign, Globe, Linkedin, Save, Briefcase, TrendingUp, CheckCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { investorAPI } from '../../api/services';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input, { Select } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const INVESTOR_TYPES = [
  { value: 'Angel Investor', label: 'Angel Investor' },
  { value: 'Venture Capital', label: 'Venture Capital' },
  { value: 'Private Equity', label: 'Private Equity' },
  { value: 'Corporate VC', label: 'Corporate VC' },
  { value: 'Government Fund', label: 'Government Fund' },
  { value: 'Family Office', label: 'Family Office' },
  { value: 'Accelerator', label: 'Accelerator' },
];

const ALL_INDUSTRIES = [
  'AI/ML', 'FinTech', 'HealthTech', 'EdTech', 'AgriTech', 'CleanTech',
  'E-Commerce', 'SaaS', 'IoT', 'Blockchain', 'Cybersecurity', 'Gaming', 'Real Estate', 'Logistics', 'Other'
];

const ALL_STAGES = ['Idea', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Growth'];

export default function InvestorProfile() {
  const { user } = useSelector(s => s.auth);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firmName: '',
    investorType: 'Angel Investor',
    bio: '',
    preferredIndustries: [],
    preferredStages: [],
    minInvestment: 100000,
    maxInvestment: 10000000,
    portfolioSize: 0,
    totalDeployed: 0,
    successfulExits: 0,
    website: '',
    linkedin: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    investorAPI.getMe()
      .then(r => {
        if (r.data.data) {
          setForm(prev => ({
            ...prev,
            ...r.data.data,
            preferredIndustries: r.data.data.preferredIndustries || [],
            preferredStages: r.data.data.preferredStages || [],
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const toggleIndustry = (ind) => {
    setForm(prev => {
      const exists = prev.preferredIndustries.includes(ind);
      return {
        ...prev,
        preferredIndustries: exists
          ? prev.preferredIndustries.filter(i => i !== ind)
          : [...prev.preferredIndustries, ind],
      };
    });
  };

  const toggleStage = (stg) => {
    setForm(prev => {
      const exists = prev.preferredStages.includes(stg);
      return {
        ...prev,
        preferredStages: exists
          ? prev.preferredStages.filter(s => s !== stg)
          : [...prev.preferredStages, stg],
      };
    });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const res = await investorAPI.update(form);
      setForm(res.data.data);
      toast.success('Investor profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading investor profile..." />;

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <User className="text-blue-500" size={24} /> Investor Profile
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage your investment preferences and firm details</p>
        </div>
        <Button onClick={handleSubmit} loading={saving} icon={Save}>
          Save Profile
        </Button>
      </div>

      {/* User Info Overview */}
      <Card>
        <CardBody className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{user?.name}</h2>
            <p className="text-xs text-slate-400">{user?.email} • {form.investorType}</p>
            {form.firmName && <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">{form.firmName}</p>}
          </div>
        </CardBody>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Building2 size={18} className="text-blue-500" /> Basic & Firm Details
          </h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Firm / Organization Name"
              name="firmName"
              placeholder="e.g. Apex Venture Partners"
              value={form.firmName}
              onChange={e => handleChange('firmName', e.target.value)}
            />
            <Select
              label="Investor Type"
              name="investorType"
              value={form.investorType}
              onChange={e => handleChange('investorType', e.target.value)}
              options={INVESTOR_TYPES}
            />
          </div>

          <Input
            label="Bio / Investment Thesis"
            name="bio"
            rows={3}
            placeholder="Describe your investment focus, experience, value proposition to founders..."
            value={form.bio}
            onChange={e => handleChange('bio', e.target.value)}
          />
        </CardBody>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-500" /> Investment Preferences
          </h2>
        </CardHeader>
        <CardBody className="space-y-5">
          {/* Preferred Industries */}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Preferred Industries (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_INDUSTRIES.map(ind => {
                const selected = form.preferredIndustries.includes(ind);
                return (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => toggleIndustry(ind)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selected
                        ? 'gradient-primary text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}{ind}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Stages */}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Preferred Stages
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_STAGES.map(stg => {
                const selected = form.preferredStages.includes(stg);
                return (
                  <button
                    key={stg}
                    type="button"
                    onClick={() => toggleStage(stg)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selected
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}{stg}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Investment Range */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Minimum Investment (INR)"
              name="minInvestment"
              type="number"
              placeholder="100000"
              value={form.minInvestment}
              onChange={e => handleChange('minInvestment', Number(e.target.value))}
              icon={DollarSign}
            />
            <Input
              label="Maximum Investment (INR)"
              name="maxInvestment"
              type="number"
              placeholder="10000000"
              value={form.maxInvestment}
              onChange={e => handleChange('maxInvestment', Number(e.target.value))}
              icon={DollarSign}
            />
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs text-blue-700 dark:text-blue-300 font-medium">
            Investment Range Summary: ₹{(form.minInvestment / 100000).toFixed(0)} Lakhs – ₹{(form.maxInvestment / 100000).toFixed(0)} Lakhs INR
          </div>
        </CardBody>
      </Card>

      {/* Online & Social */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Globe size={18} className="text-emerald-500" /> Links & Contact
          </h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Website URL"
              name="website"
              type="url"
              placeholder="https://yourfirm.com"
              value={form.website}
              onChange={e => handleChange('website', e.target.value)}
              icon={Globe}
            />
            <Input
              label="LinkedIn URL"
              name="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/..."
              value={form.linkedin}
              onChange={e => handleChange('linkedin', e.target.value)}
              icon={Linkedin}
            />
          </div>
        </CardBody>
      </Card>

      {/* Footer Submit Button */}
      <div className="flex justify-end pt-2">
        <Button onClick={handleSubmit} loading={saving} icon={Save} size="lg">
          Save Investor Profile
        </Button>
      </div>
    </div>
  );
}
