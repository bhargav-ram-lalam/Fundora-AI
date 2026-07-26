import React, { useState, useEffect, useCallback } from 'react';
import { Upload, FileText, Trash2, File, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { proposalAPI } from '../../api/services';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input, { Select } from '../../components/common/Input';
import { StatusBadge } from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';

const DOC_TYPES = [
  { value: 'business_plan', label: 'Business Plan' },
  { value: 'pitch_deck', label: 'Pitch Deck' },
  { value: 'financial', label: 'Financial Document' },
  { value: 'prototype', label: 'Prototype / Image' },
  { value: 'other', label: 'Other' },
];

function UploadDropzone({ onDrop, uploading }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.ms-powerpoint': ['.ppt'], 'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'], 'image/*': ['.jpg', '.png', '.gif'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1, maxSize: 20 * 1024 * 1024,
  });

  return (
    <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
      <input {...getInputProps()} />
      <Upload className={`mx-auto mb-3 ${isDragActive ? 'text-blue-500' : 'text-slate-400'}`} size={40} />
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{isDragActive ? 'Drop your file here!' : 'Drag & drop or click to upload'}</p>
      <p className="text-xs text-slate-400 mt-1">PDF, PPT, PPTX, DOC, DOCX, Images • Max 20MB</p>
      {uploading && <p className="text-xs text-blue-500 mt-2 font-medium">Uploading...</p>}
    </div>
  );
}

export default function DocumentUpload() {
  const { startup } = useSelector(s => s.startup);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'business_plan', description: '' });
  const [selectedFile, setSelectedFile] = useState(null);

  const loadProposals = () => {
    if (!startup?._id) return setLoading(false);
    proposalAPI.getByStartup(startup._id).then(r => setProposals(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadProposals(); }, [startup]);

  const onDrop = useCallback(files => {
    if (files[0]) { setSelectedFile(files[0]); setForm(p => ({ ...p, title: files[0].name })); }
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return toast.error('Please select a file');
    if (!startup?._id) return toast.error('Please create your startup profile first');
    setUploading(true);
    const fd = new FormData();
    fd.append('file', selectedFile);
    fd.append('startupId', startup._id);
    fd.append('title', form.title || selectedFile.name);
    fd.append('type', form.type);
    fd.append('description', form.description);
    try {
      await proposalAPI.upload(fd);
      toast.success('Document uploaded!');
      setShowModal(false);
      setSelectedFile(null);
      setForm({ title: '', type: 'business_plan', description: '' });
      loadProposals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return;
    await proposalAPI.delete(id);
    setProposals(p => p.filter(d => d._id !== id));
    toast.success('Deleted');
  };

  const formatSize = bytes => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  const typeIcons = { business_plan: '📋', pitch_deck: '🎯', financial: '💰', prototype: '🖼️', other: '📄' };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><FileText className="text-blue-500" size={24} /> Documents</h1>
          <p className="text-slate-500 text-sm mt-1">Upload your business plan, pitch deck, and financial documents</p>
        </div>
        <Button icon={Upload} onClick={() => setShowModal(true)}>Upload Document</Button>
      </div>

      {proposals.length === 0 ? (
        <Card>
          <CardBody className="text-center py-16">
            <Upload className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">No documents yet</h3>
            <p className="text-sm text-slate-400 mb-6">Upload your business plan, pitch deck, or financial documents to attract investors.</p>
            <Button icon={Upload} onClick={() => setShowModal(true)}>Upload First Document</Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proposals.map(doc => (
            <Card key={doc._id} hover>
              <CardBody>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{typeIcons[doc.type] || '📄'}</span>
                  <button onClick={() => handleDelete(doc._id)} className="p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1 truncate">{doc.title}</h3>
                <p className="text-xs text-slate-400 mb-3">{DOC_TYPES.find(t => t.value === doc.type)?.label} • {formatSize(doc.fileSize || 0)}</p>
                <StatusBadge status={doc.analysisStatus || 'pending'} />
              </CardBody>
            </Card>
          ))}
          <Card hover className="border-dashed border-2 cursor-pointer" onClick={() => setShowModal(true)}>
            <CardBody className="flex flex-col items-center justify-center text-center min-h-[160px]">
              <Upload className="text-slate-300 mb-2" size={32} />
              <p className="text-sm text-slate-400">Upload another document</p>
            </CardBody>
          </Card>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Upload Document"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleUpload} loading={uploading} icon={Upload}>Upload</Button></>}>
        <div className="space-y-4">
          <UploadDropzone onDrop={onDrop} uploading={uploading} />
          {selectedFile && (
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200">
              <CheckCircle className="text-green-500" size={18} />
              <div>
                <p className="text-sm font-medium text-green-700">{selectedFile.name}</p>
                <p className="text-xs text-green-500">{formatSize(selectedFile.size)}</p>
              </div>
            </div>
          )}
          <Select label="Document Type" name="type" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} options={DOC_TYPES} />
          <Input label="Title" name="title" placeholder="Document title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <Input label="Description (optional)" name="description" rows={2} placeholder="Brief description..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </div>
      </Modal>
    </div>
  );
}
