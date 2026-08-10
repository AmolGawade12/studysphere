import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { 
  BookOpen, Plus, Edit2, Trash2, 
  Clock, Calendar, Award, Loader2, ArrowRight
} from 'lucide-react';
import { subjectService } from '../services/subjectService';
import { Modal } from '../components/Modal';

interface SubjectsProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Subjects: React.FC<SubjectsProps> = ({ onNavigate }) => {
  const { showToast } = useToast();

  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [formLoading, setFormLoading] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await subjectService.getAll();
      setSubjects(data);
    } catch (err) {
      showToast('Failed to load subjects list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setName('');
    setDescription('');
    setColor('#6366f1');
    setModalOpen(true);
  };

  const handleOpenEditModal = (subject: any) => {
    setIsEditing(true);
    setEditingId(subject.id);
    setName(subject.name);
    setDescription(subject.description);
    setColor(subject.color || '#6366f1');
    setModalOpen(true);
  };

  const handleOpenDeleteModal = (id: number) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a subject name.', 'warning');
      return;
    }

    setFormLoading(true);
    try {
      if (isEditing && editingId !== null) {
        const updated = await subjectService.update(editingId, { name, description, color });
        setSubjects(prev => prev.map(s => s.id === editingId ? updated : s));
        showToast('Subject updated successfully!', 'success');
      } else {
        const created = await subjectService.create({ name, description, color });
        setSubjects(prev => [created, ...prev]);
        showToast('New subject created successfully! 🚀', 'success');
      }
      setModalOpen(false);
    } catch (err) {
      showToast('Failed to save subject. Please try again.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;
    try {
      await subjectService.delete(deleteId);
      setSubjects(prev => prev.filter(s => s.id !== deleteId));
      showToast('Subject deleted successfully.', 'success');
      setDeleteModalOpen(false);
    } catch (err) {
      showToast('Failed to delete subject.', 'error');
    }
  };

  const colorOptions = [
    { label: 'Indigo', hex: '#6366f1' },
    { label: 'Blue', hex: '#3b82f6' },
    { label: 'Purple', hex: '#a855f7' },
    { label: 'Pink', hex: '#ec4899' },
    { label: 'Red', hex: '#f43f5e' },
    { label: 'Orange', hex: '#f97316' },
    { label: 'Amber', hex: '#f59e0b' },
    { label: 'Emerald', hex: '#10b981' },
    { label: 'Teal', hex: '#14b8a6' },
    { label: 'Cyan', hex: '#06b6d4' }
  ];

  if (loading && subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400 font-semibold">Loading subjects...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            My Subjects
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
            Organize study material, quiz stats, and track course progress
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 text-xs transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </button>
      </div>

      {/* Grid of Subject Cards */}
      {subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(sub => (
            <div 
              key={sub.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/85 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between h-[210px] text-left group"
            >
              {/* Upper Section */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  {/* Subject Circle */}
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: sub.color || '#6366f1' }}
                  >
                    <BookOpen className="w-5 h-5" />
                  </div>
                  {/* Action buttons */}
                  <div className="flex items-center gap-1 opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenEditModal(sub)}
                      className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg focus:outline-none transition-colors"
                      title="Edit Subject"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleOpenDeleteModal(sub.id)}
                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 rounded-lg focus:outline-none transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-base text-slate-850 dark:text-slate-100 group-hover:text-indigo-500 transition-colors line-clamp-1">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed h-[36px]">
                    {sub.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Lower Section (Metrics & Progress) */}
              <div className="border-t border-slate-100 dark:border-slate-800/80 px-5 py-4 bg-slate-50/20 dark:bg-slate-800/10 space-y-3">
                {/* Stats row */}
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1 uppercase">
                    <Clock className="w-3.5 h-3.5" />
                    {sub.study_hours || 0} Hours Studied
                  </span>
                  <span>{sub.progress || 0}% MASTERY</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${sub.progress || 0}%`, backgroundColor: sub.color || '#6366f1' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/85 p-16 rounded-3xl text-center max-w-xl mx-auto space-y-5 animate-fade-in shadow-sm">
          <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mx-auto shadow-inner">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-extrabold text-lg text-slate-850 dark:text-slate-200">No subjects yet</h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
              Create subjects (e.g. Java, Computer Networks) to link notes, generate custom study quizzes, and aggregate metrics.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-xl text-xs transition-all shadow-md cursor-pointer hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Add Your First Subject
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Subject' : 'Add New Subject'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Name input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject Name</label>
            <input
              type="text"
              placeholder="e.g. Computer Networks"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 dark:text-slate-100 rounded-xl"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
            <textarea
              placeholder="e.g. OSI layer configuration, IP addressing rules..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 dark:text-slate-100 rounded-xl"
            />
          </div>

          {/* Color Picker Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Color Identity</label>
            <div className="grid grid-cols-5 gap-2.5">
              {colorOptions.map((opt, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setColor(opt.hex)}
                  className={`w-full aspect-square rounded-xl border transition-all flex items-center justify-center focus:outline-none cursor-pointer ${
                    color === opt.hex 
                      ? 'border-slate-800 dark:border-slate-200 ring-2 ring-indigo-500/20 scale-105 shadow-sm' 
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: opt.hex }}
                  title={opt.label}
                >
                  {color === opt.hex && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={formLoading}
            className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg mt-5 text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            {formLoading ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                Saving...
              </>
            ) : (
              isEditing ? 'Save Changes' : 'Create Subject'
            )}
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-5 text-left">
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Are you sure you want to delete this subject? 
            <strong className="text-rose-500 font-bold block mt-2">
              Warning: This will permanently delete all notes, planners, and quizzes linked to this subject.
            </strong>
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl focus:outline-none"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl focus:outline-none shadow-md shadow-rose-600/10"
            >
              Delete Subject
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default Subjects;
