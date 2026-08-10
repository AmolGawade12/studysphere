import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { 
  Calendar, Plus, Clock, Edit2, Trash2, 
  Loader2, CheckSquare, Square, AlertCircle
} from 'lucide-react';
import taskService, { MockTask } from '../services/taskService';
import subjectService from '../services/subjectService';
import progressService from '../services/progressService';
import { Modal } from '../components/Modal';

export const Planner: React.FC = () => {
  const { showToast } = useToast();

  const [tasks, setTasks] = useState<MockTask[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'upcoming'>('today');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [duration, setDuration] = useState(45);
  const [priority, setPriority] = useState('Medium');
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchTasksAndSubjects = async () => {
    try {
      setLoading(true);
      const subjectsData = await subjectService.getAll();
      setSubjects(subjectsData);
      if (subjectsData.length > 0) {
        setSubjectId(subjectsData[0].id);
      }
      
      const data = await taskService.getAll();
      setTasks(data);
    } catch (err) {
      showToast('Failed to load study tasks.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndSubjects();
  }, []);

  // Filter tasks based on tabs
  const filteredTasks = tasks.filter(task => {
    if (!task.due_date) return activeTab === 'upcoming';
    
    const taskDate = new Date(task.due_date);
    taskDate.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);

    if (activeTab === 'today') {
      return taskDate.getTime() === today.getTime();
    } else if (activeTab === 'week') {
      return taskDate.getTime() > today.getTime() && taskDate.getTime() <= oneWeekLater.getTime();
    } else {
      return taskDate.getTime() > oneWeekLater.getTime();
    }
  });

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setTitle('');
    setDescription('');
    setDueDate(new Date().toISOString().split('T')[0]);
    setDuration(45);
    setPriority('Medium');
    setSubjectId(subjects.length > 0 ? subjects[0].id : null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (task: MockTask) => {
    setIsEditing(true);
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.due_date || '');
    setDuration(task.duration);
    setPriority(task.priority);
    setSubjectId(task.subject_id || (subjects.length > 0 ? subjects[0].id : null));
    setModalOpen(true);
  };

  const handleOpenDeleteModal = (id: number) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter a task title.', 'warning');
      return;
    }

    setFormLoading(true);
    try {
      const taskData = {
        title,
        description,
        due_date: dueDate,
        duration,
        priority,
        subject_id: subjectId
      };

      if (isEditing && editingId !== null) {
        const updated = await taskService.update(editingId, taskData);
        setTasks(prev => prev.map(t => t.id === editingId ? updated : t));
        showToast('Task updated successfully!', 'success');
      } else {
        const created = await taskService.create(taskData);
        setTasks(prev => [created, ...prev]);
        showToast('New task added successfully!', 'success');
      }
      setModalOpen(false);
    } catch (err) {
      showToast('Failed to save task.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleComplete = async (task: MockTask) => {
    const updatedStatus = !task.completed;
    try {
      const updated = await taskService.update(task.id, { completed: updatedStatus });
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
      
      if (updatedStatus) {
        showToast(`Task "${task.title}" completed! 🚀`, 'success');
      } else {
        showToast(`Task "${task.title}" marked incomplete.`, 'info');
      }
    } catch (err) {
      showToast('Failed to toggle task state.', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;
    try {
      await taskService.delete(deleteId);
      setTasks(prev => prev.filter(t => t.id !== deleteId));
      showToast('Task deleted successfully.', 'success');
      setDeleteModalOpen(false);
    } catch (err) {
      showToast('Failed to delete task.', 'error');
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-slate-400 font-semibold">Loading planner tasks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Study Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
            Schedule learning slots, structure tasks, and monitor timelines
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md text-xs transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        {[
          { id: 'today', label: 'Today' },
          { id: 'week', label: 'This Week' },
          { id: 'upcoming', label: 'Upcoming' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 px-1 focus:outline-none transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-650 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3.5">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => {
            const prioColor = 
              task.priority === 'High' ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' :
              task.priority === 'Medium' ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' :
              'text-slate-500 bg-slate-50 dark:bg-slate-800/40';

            return (
              <div 
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  task.completed 
                    ? 'border-slate-100 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-900/10' 
                    : 'border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-sm'
                }`}
              >
                {/* Checkbox and Text details */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => handleToggleComplete(task)}
                    className="mt-0.5 text-slate-400 hover:text-indigo-600 focus:outline-none cursor-pointer"
                  >
                    {task.completed ? (
                      <CheckSquare className="w-5. h-5.5 text-indigo-600 checkbox-animate" />
                    ) : (
                      <Square className="w-5. h-5.5" />
                    )}
                  </button>

                  <div className="text-left min-w-0 space-y-1">
                    <h3 className={`text-xs sm:text-sm font-bold text-slate-850 dark:text-slate-100 truncate ${task.completed ? 'line-through text-slate-450 dark:text-slate-500' : ''}`}>
                      {task.title}
                    </h3>
                    {task.description && !task.completed && (
                      <p className="text-[11px] text-slate-400 truncate max-w-lg">
                        {task.description}
                      </p>
                    )}
                    
                    {/* Meta info tags */}
                    <div className="flex items-center gap-2 flex-wrap text-[10px] font-semibold text-slate-400 uppercase tracking-wide pt-0.5">
                      <span 
                        className="px-1.5 py-0.5 rounded text-[8px] font-bold text-white shadow-sm"
                        style={{ backgroundColor: task.subject_details?.color || '#cbd5e1' }}
                      >
                        {task.subject_details?.name || 'General'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {task.duration} min
                      </span>
                      {task.due_date && (
                        <>
                          <span>•</span>
                          <span>Due: {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${prioColor}`}>
                        {task.priority} Priority
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions (Edit / Delete) */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(task)}
                    className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-lg focus:outline-none"
                    title="Edit Task"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenDeleteModal(task.id)}
                    className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 rounded-lg focus:outline-none"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          /* Empty tab state */
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/85 p-16 rounded-3xl text-center max-w-xl mx-auto space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">No tasks in this slot</h4>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                Keep your workspace productive by scheduling revision goals.
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
            >
              + Create study task
            </button>
          </div>
        )}
      </div>

      {/* Task Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Task' : 'Add New Task'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Task Title</label>
            <input
              type="text"
              placeholder="e.g. Study Inheritance properties"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 dark:text-slate-100 rounded-xl"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Instructions / Description</label>
            <textarea
              placeholder="e.g. Write code sample utilizing subclass overriding..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 dark:text-slate-100 rounded-xl"
            />
          </div>

          {/* Subject associated */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Course Subject</label>
            <select
              value={subjectId || ''}
              onChange={(e) => setSubjectId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 dark:text-slate-100 rounded-xl"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
              <option value="">No Association (General)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Due date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 dark:text-slate-100 rounded-xl"
                required
              />
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duration (min)</label>
              <input
                type="number"
                min={5}
                max={480}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 45)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 dark:text-slate-100 rounded-xl"
                required
              />
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 dark:text-slate-100 rounded-xl"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
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
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              isEditing ? 'Save Changes' : 'Schedule Task'
            )}
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Task Deletion"
      >
        <div className="space-y-4 text-left">
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Are you sure you want to remove this planner task?
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-750 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-750 text-white text-xs font-bold rounded-xl"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default Planner;
