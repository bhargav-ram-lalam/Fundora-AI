import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Rocket, Globe, Users, DollarSign, Code, Brain } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { startupAPI } from '../../api/services';
import { setStartup } from '../../features/startup/startupSlice';
import Button from '../../components/common/Button';
import Input, { Select } from '../../components/common/Input';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ProgressBar } from '../../components/common/Progress';
import toast from 'react-hot-toast';

const INDUSTRIES = ['AI/ML','FinTech','HealthTech','EdTech','AgriTech','CleanTech','E-Commerce','SaaS','IoT','Blockchain','Cybersecurity','Gaming','Real Estate','Logistics','Other'];
const STAGES = ['Idea','Pre-Seed','Seed','Series A','Series B','Series C+','Growth'];
const TABS = ['Basic Info', 'Team', 'Business', 'Technology', 'Funding', 'Online'];

export default function StartupProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { startup } = useSelector(s => s.startup);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState({
    name: '', tagline: '', industry: '', stage: 'Idea', foundedYear: '', country: 'India', city: '',
    founderDetails: { name: '', title: '', linkedin: '', experience: '', education: '' },
    teamMembers: [],
    teamSize: 1,
    problemStatement: '', proposedSolution: '', targetMarket: '', marketSize: '',
    businessModel: '', revenueModel: '', currentRevenue: '0', projectedRevenue: '',
    competitors: [], uniqueValueProp: '',
    techStack: [], hasPrototype: false, hasPatent: false,
    fundingRequired: '', fundingCurrency: 'INR', fundingPurpose: '', previousFunding: 0, equityOffered: 0,
    isRegistered: false, registrationType: '',
    website: '', demoVideo: '', linkedin: '', twitter: '', instagram: '',
  });

  useEffect(() => {
    startupAPI.getMy()
      .then(r => { setForm(r.data.data); dispatch(setStartup(r.data.data)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field, value) => setForm(p => ({ ...p, [field]: value }));
  const handleNested = (parent, field, value) => setForm(p => ({ ...p, [parent]: { ...p[parent], [field]: value } }));

  const addTeamMember = () => setForm(p => ({ ...p, teamMembers: [...p.teamMembers, { name: '', role: '', linkedin: '', experience: '' }] }));
  const updateTeamMember = (i, field, value) => setForm(p => { const t = [...p.teamMembers]; t[i] = { ...t[i], [field]: value }; return { ...p, teamMembers: t }; });
  const removeTeamMember = (i) => setForm(p => ({ ...p, teamMembers: p.teamMembers.filter((_, idx) => idx !== i) }));

  const handleSubmit = async () => {
    if (!form.name || !form.industry) return toast.error('Please fill in startup name and industry');
    setSaving(true);
    try {
      let res;
      if (form._id) {
        res = await startupAPI.update(form._id, form);
      } else {
        res = await startupAPI.create(form);
      }
      dispatch(setStartup(res.data.data));
      setForm(res.data.data);
      setSavedOnce(true);
      toast.success('Startup profile saved!');
      // Nudge user to re-run AI analysis so improvements are scored
      if (form._id) {
        setTimeout(() => toast(
          (t) => (
            <span className="flex items-center gap-2">
              Profile updated! Re-run AI Analysis to get fresh scores.
              <button onClick={() => { toast.dismiss(t.id); navigate('/founder/ai-analysis'); }}
                className="text-blue-600 font-semibold underline text-xs">Go →</button>
            </span>
          ), { duration: 6000, icon: '🧠' }
        ), 500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner text="Loading startup profile..." />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Rocket className="text-blue-500" size={24} /> Startup Profile
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Complete your profile to attract investors</p>
        </div>
        <Button onClick={handleSubmit} loading={saving} icon={Save}>Save Profile</Button>
      </div>

      {/* Completeness */}
      {form._id && (
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between mb-1.5">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Profile Completeness</span>
                <span className="text-sm font-bold text-blue-600">{form.profileCompleteness || 0}%</span>
              </div>
              <ProgressBar value={form.profileCompleteness || 0} color="gradient" size="md" />
            </div>
          </CardBody>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl overflow-x-auto">
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === i ? 'gradient-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <Card>
        <CardBody className="space-y-5">
          {activeTab === 0 && (
            <>
              <div className="grid md:grid-cols-2 gap-5">
                <Input label="Startup Name" name="name" placeholder="e.g. TechVenture AI" value={form.name} onChange={e => handleChange('name', e.target.value)} required />
                <Input label="Tagline" name="tagline" placeholder="One line description" value={form.tagline} onChange={e => handleChange('tagline', e.target.value)} />
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                <Select label="Industry" name="industry" value={form.industry} onChange={e => handleChange('industry', e.target.value)} options={INDUSTRIES.map(i => ({ value: i, label: i }))} placeholder="Select industry" required />
                <Select label="Stage" name="stage" value={form.stage} onChange={e => handleChange('stage', e.target.value)} options={STAGES.map(s => ({ value: s, label: s }))} />
                <Input label="Founded Year" name="foundedYear" type="number" placeholder="2024" value={form.foundedYear} onChange={e => handleChange('foundedYear', e.target.value)} />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <Input label="Country" name="country" value={form.country} onChange={e => handleChange('country', e.target.value)} />
                <Input label="City" name="city" placeholder="Bangalore" value={form.city} onChange={e => handleChange('city', e.target.value)} />
              </div>
            </>
          )}

          {activeTab === 1 && (
            <>
              <div className="grid md:grid-cols-2 gap-5 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <h3 className="col-span-2 text-sm font-semibold text-blue-700 dark:text-blue-400">Lead Founder Details</h3>
                <Input label="Founder Name" name="fname" placeholder="Full name" value={form.founderDetails?.name} onChange={e => handleNested('founderDetails', 'name', e.target.value)} />
                <Input label="Title/Role" name="ftitle" placeholder="CEO & Co-Founder" value={form.founderDetails?.title} onChange={e => handleNested('founderDetails', 'title', e.target.value)} />
                <Input label="LinkedIn URL" name="flinkedin" placeholder="https://linkedin.com/in/..." value={form.founderDetails?.linkedin} onChange={e => handleNested('founderDetails', 'linkedin', e.target.value)} />
                <Input label="Years of Experience" name="fexp" placeholder="5 years in AI/ML" value={form.founderDetails?.experience} onChange={e => handleNested('founderDetails', 'experience', e.target.value)} />
                <Input label="Education" name="fedu" placeholder="IIT Delhi, B.Tech CS" value={form.founderDetails?.education} onChange={e => handleNested('founderDetails', 'education', e.target.value)} className="col-span-2" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Team Members</h3>
                <Button onClick={addTeamMember} size="sm" variant="outline" icon={Plus}>Add Member</Button>
              </div>
              {form.teamMembers?.map((m, i) => (
                <div key={i} className="grid md:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl relative">
                  <Input placeholder="Name" value={m.name} onChange={e => updateTeamMember(i, 'name', e.target.value)} />
                  <Input placeholder="Role (e.g. CTO)" value={m.role} onChange={e => updateTeamMember(i, 'role', e.target.value)} />
                  <Input placeholder="LinkedIn" value={m.linkedin} onChange={e => updateTeamMember(i, 'linkedin', e.target.value)} />
                  <Input placeholder="Experience" value={m.experience} onChange={e => updateTeamMember(i, 'experience', e.target.value)} />
                  <button onClick={() => removeTeamMember(i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              ))}
              <Input label="Total Team Size" name="teamSize" type="number" placeholder="5" value={form.teamSize} onChange={e => handleChange('teamSize', parseInt(e.target.value))} />
            </>
          )}

          {activeTab === 2 && (
            <>
              <Input label="Problem Statement" name="problemStatement" rows={4} placeholder="What problem are you solving?" value={form.problemStatement} onChange={e => handleChange('problemStatement', e.target.value)} />
              <Input label="Proposed Solution" name="proposedSolution" rows={4} placeholder="How does your product solve it?" value={form.proposedSolution} onChange={e => handleChange('proposedSolution', e.target.value)} />
              <div className="grid md:grid-cols-2 gap-5">
                <Input label="Target Market" name="targetMarket" placeholder="e.g. SMBs in India" value={form.targetMarket} onChange={e => handleChange('targetMarket', e.target.value)} />
                <Input label="Market Size" name="marketSize" placeholder="e.g. $50B TAM" value={form.marketSize} onChange={e => handleChange('marketSize', e.target.value)} />
              </div>
              <Input label="Business Model" name="businessModel" rows={3} placeholder="How does your business work?" value={form.businessModel} onChange={e => handleChange('businessModel', e.target.value)} />
              <Input label="Revenue Model" name="revenueModel" rows={3} placeholder="How do you generate revenue?" value={form.revenueModel} onChange={e => handleChange('revenueModel', e.target.value)} />
              <Input label="Unique Value Proposition" name="uniqueValueProp" rows={2} placeholder="What makes you different?" value={form.uniqueValueProp} onChange={e => handleChange('uniqueValueProp', e.target.value)} />
            </>
          )}

          {activeTab === 3 && (
            <>
              <Input label="Tech Stack (comma separated)" name="techStack" placeholder="React, Node.js, TensorFlow, AWS" value={form.techStack?.join(', ')} onChange={e => handleChange('techStack', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} icon={Code} />
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.hasPrototype} onChange={e => handleChange('hasPrototype', e.target.checked)} className="w-4 h-4 rounded" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">We have a working prototype/MVP</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.hasPatent} onChange={e => handleChange('hasPatent', e.target.checked)} className="w-4 h-4 rounded" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">We have patents/IP</span>
                </label>
              </div>
            </>
          )}

          {activeTab === 4 && (
            <>
              <div className="grid md:grid-cols-2 gap-5">
                <Input label="Funding Required" name="fundingRequired" type="number" placeholder="5000000" value={form.fundingRequired} onChange={e => handleChange('fundingRequired', e.target.value)} icon={DollarSign} suffix="INR" />
                <Input label="Equity Offered (%)" name="equityOffered" type="number" placeholder="10" value={form.equityOffered} onChange={e => handleChange('equityOffered', e.target.value)} suffix="%" />
              </div>
              <Input label="Previous Funding (if any)" name="previousFunding" type="number" placeholder="0" value={form.previousFunding} onChange={e => handleChange('previousFunding', e.target.value)} icon={DollarSign} />
              <Input label="Funding Purpose" name="fundingPurpose" rows={3} placeholder="How will you use the funds?" value={form.fundingPurpose} onChange={e => handleChange('fundingPurpose', e.target.value)} />
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isRegistered} onChange={e => handleChange('isRegistered', e.target.checked)} className="w-4 h-4 rounded" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Company is legally registered</span>
                </label>
              </div>
              {form.isRegistered && (
                <Input label="Registration Type" name="registrationType" placeholder="e.g. Private Limited" value={form.registrationType} onChange={e => handleChange('registrationType', e.target.value)} />
              )}
            </>
          )}

          {activeTab === 5 && (
            <>
              <Input label="Website" name="website" type="url" placeholder="https://yourstartup.com" value={form.website} onChange={e => handleChange('website', e.target.value)} icon={Globe} />
              <Input label="Demo Video URL" name="demoVideo" type="url" placeholder="https://youtube.com/watch?v=..." value={form.demoVideo} onChange={e => handleChange('demoVideo', e.target.value)} />
              <div className="grid md:grid-cols-3 gap-5">
                <Input label="LinkedIn" name="linkedin" placeholder="https://linkedin.com/company/..." value={form.linkedin} onChange={e => handleChange('linkedin', e.target.value)} />
                <Input label="Twitter" name="twitter" placeholder="https://twitter.com/..." value={form.twitter} onChange={e => handleChange('twitter', e.target.value)} />
                <Input label="Instagram" name="instagram" placeholder="https://instagram.com/..." value={form.instagram} onChange={e => handleChange('instagram', e.target.value)} />
              </div>
            </>
          )}
        </CardBody>
      </Card>

      <div className="flex justify-between">
        {activeTab > 0 && <Button onClick={() => setActiveTab(activeTab - 1)} variant="secondary">← Previous</Button>}
        {activeTab < TABS.length - 1 ? (
          <Button onClick={() => setActiveTab(activeTab + 1)} className="ml-auto">Next →</Button>
        ) : (
          <Button onClick={handleSubmit} loading={saving} icon={Save} className="ml-auto">Save Profile</Button>
        )}
      </div>
    </div>
  );
}
