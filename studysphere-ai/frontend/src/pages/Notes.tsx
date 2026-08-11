import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { 
  FileText, Search, FileUp, Eye, Bot, 
  Trash2, X, Plus, Sparkles, Loader2
} from 'lucide-react';
import noteService from '../services/noteService';
import subjectService from '../services/subjectService';
import aiService from '../services/aiService';
import { Modal } from '../components/Modal';

interface NotesProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Notes: React.FC<NotesProps> = ({ onNavigate }) => {
  const { showToast } = useToast();

  const [notes, setNotes] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<number | null>(null);

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);

  // View state
  const [activeNote, setActiveNote] = useState<any>(null);
  const [summaryText, setSummaryText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Form upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadSubjectId, setUploadSubjectId] = useState<number | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const fetchNotesAndSubjects = async () => {
    try {
      setLoading(true);
      const subjectsData = await subjectService.getAll();
      setSubjects(subjectsData);
      
      const notesData = await noteService.getAll();
      setNotes(notesData);
    } catch (err) {
      showToast('Failed to load study notes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotesAndSubjects();
  }, []);

  // Filter notes locally
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(search.toLowerCase()) || 
      (note.extracted_text && note.extracted_text.toLowerCase().includes(search.toLowerCase()));
    
    const matchesSubject = selectedSubjectFilter === null || note.subject_id === selectedSubjectFilter;
    
    return matchesSearch && matchesSubject;
  });

  const handleOpenUpload = () => {
    setUploadFile(null);
    setUploadTitle('');
    setUploadSubjectId(subjects.length > 0 ? subjects[0].id : null);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate extension
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!['.pdf', '.docx', '.txt'].includes(ext)) {
        showToast('Unsupported file type. Please upload PDF, DOCX, or TXT.', 'warning');
        return;
      }
      setUploadFile(file);
      setUploadTitle(file.name);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      showToast('Please select a file to upload.', 'warning');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    
    // Simulate upload progress interval
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 150);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle || uploadFile.name);
      if (uploadSubjectId) {
        formData.append('subject_id', uploadSubjectId.toString());
      }

      const note = await noteService.upload(formData);
      clearInterval(interval);
      setUploadProgress(100);
      
      // Delay closing modal for visual progress animation feedback
      setTimeout(() => {
        setNotes(prev => [note, ...prev]);
        showToast(`Note "${note.title}" uploaded and AI-indexed successfully!`, 'success');
        setUploadModalOpen(false);
      }, 300);

    } catch (err: any) {
      clearInterval(interval);
      showToast(err?.data?.error || 'Failed to upload note.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewNote = (note: any) => {
    setActiveNote(note);
    setViewModalOpen(true);
  };

  const handleSummarizeNote = async (note: any) => {
    setActiveNote(note);
    setSummaryText('');
    setSummaryModalOpen(true);
    setAiLoading(true);
    
    try {
      const response = await aiService.summarize({ note_id: note.id });
      setSummaryText(response.summary);
    } catch (err) {
      showToast('Failed to generate AI note summary.', 'error');
      setSummaryModalOpen(false);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAskAI = (note: any) => {
    // Navigate to AI tutor page, pre-seeding context in state/params
    onNavigate('ai-tutor', { 
      initialPrompt: `Explain the core concepts from the study note: "${note.title}". Key contents: ${note.extracted_text?.substring(0, 400)}` 
    });
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await noteService.delete(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      showToast('Note deleted successfully.', 'success');
    } catch (err) {
      showToast('Failed to delete note.', 'error');
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            My Study Notes
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
            Search note keywords, view extracted text, and generate AI summaries
          </p>
        </div>
        <button
          onClick={handleOpenUpload}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md text-xs transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer self-start sm:self-center"
        >
          <FileUp className="w-4 h-4" />
          Upload Note
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search */}
        <div className="md:col-span-4 relative">
          <input
            type="text"
            placeholder="Search note text or titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-100 transition-all"
          />
          <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-3" />
        </div>

        {/* Subject Filter Pills */}
        <div className="md:col-span-8 flex flex-wrap gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedSubjectFilter(null)}
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
              selectedSubjectFilter === null
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
            }`}
          >
            All Subjects
          </button>
          {subjects.map(sub => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectFilter(sub.id)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedSubjectFilter === sub.id
                  ? 'text-white border-transparent shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
              }`}
              style={{
                backgroundColor: selectedSubjectFilter === sub.id ? sub.color : undefined,
                boxShadow: selectedSubjectFilter === sub.id ? `0 4px 10px ${sub.color}25` : undefined
              }}
            >
              <span 
                className="w-1.5 h-1.5 rounded-full" 
                style={{ backgroundColor: selectedSubjectFilter === sub.id ? '#ffffff' : sub.color }}
              />
              {sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Notes */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map(note => {
            const extColor = 
              note.file_type === 'PDF' ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/20' :
              note.file_type === 'DOCX' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/20' :
              'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-800/50';

            return (
              <div 
                key={note.id} 
                className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/85 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-[180px]"
              >
                {/* Header section */}
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`px-2 py-1 rounded text-[10px] font-extrabold border ${extColor} flex-shrink-0`}>
                        {note.file_type}
                      </span>
                      <h3 className="text-xs font-bold text-slate-850 dark:text-slate-100 truncate pr-2" title={note.title}>
                        {note.title}
                      </h3>
                    </div>
                    {/* Delete option */}
                    <button 
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 rounded-md focus:outline-none transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Course subject indicator */}
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: note.subject_details?.color || '#cbd5e1' }}
                    />
                    <span className="text-[10px] text-slate-400 font-bold truncate max-w-[150px]">
                      {note.subject_details?.name || 'General Subject'}
                    </span>
                  </div>
                </div>

                {/* Foot indicators */}
                <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wide border-t border-slate-50 dark:border-slate-800/60 pt-3 mt-4">
                  <span>{note.file_size}</span>
                  <span>{new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>

                {/* Custom Action buttons grid */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-2 border-t border-slate-50 dark:border-slate-800/30">
                  <button 
                    onClick={() => handleViewNote(note)}
                    className="flex items-center justify-center gap-1 text-[10px] font-extrabold text-slate-600 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 focus:outline-none"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </button>
                  <button 
                    onClick={() => handleSummarizeNote(note)}
                    className="flex items-center justify-center gap-1 text-[10px] font-extrabold text-indigo-500 hover:text-indigo-600 focus:outline-none"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Summarize
                  </button>
                  <button 
                    onClick={() => handleAskAI(note)}
                    className="flex items-center justify-center gap-1 text-[10px] font-extrabold text-indigo-500 hover:text-indigo-600 focus:outline-none"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    Ask AI
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/85 p-16 rounded-3xl text-center max-w-xl mx-auto space-y-5 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-extrabold text-lg text-slate-850 dark:text-slate-200">No notes yet</h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
              Upload your first study note in PDF, DOCX or TXT format and start learning with AI.
            </p>
          </div>
          <button
            onClick={handleOpenUpload}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-xl text-xs transition-all shadow-md cursor-pointer hover:-translate-y-0.5"
          >
            <FileUp className="w-4 h-4" />
            Upload Note
          </button>
        </div>
      )}

      {/* Upload Note Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => !isUploading && setUploadModalOpen(false)}
        title="Upload Study Note"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 text-left">
          {/* File input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Study File</label>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center hover:border-indigo-500 dark:hover:border-indigo-800 transition-colors">
              <input
                type="file"
                id="study-file-input"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.docx,.txt"
              />
              <label 
                htmlFor="study-file-input"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <FileUp className="w-8 h-8 text-indigo-500" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-350">
                  {uploadFile ? uploadFile.name : 'Click to select PDF, DOCX, or TXT'}
                </span>
                <span className="text-[10px] text-slate-400">Max size limit: 10 MB</span>
              </label>
            </div>
          </div>

          {/* Title */}
          {uploadFile && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Note Title</label>
              <input
                type="text"
                placeholder="Name of note file"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 dark:text-slate-100 rounded-xl"
                required
              />
            </div>
          )}

          {/* Subject dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject Association</label>
            <select
              value={uploadSubjectId || ''}
              onChange={(e) => setUploadSubjectId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 dark:text-slate-100 rounded-xl"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
              <option value="">No Course (General)</option>
            </select>
          </div>

          {/* Progress loader */}
          {isUploading && (
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                <span>Uploading and extracting text...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isUploading || !uploadFile}
            className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg mt-5 text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            {isUploading ? 'Uploading...' : 'Confirm Upload'}
          </button>
        </form>
      </Modal>

      {/* View Extracted Text Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={activeNote ? activeNote.title : 'Study Note Extracted Text'}
      >
        <div className="space-y-4 text-left">
          <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">AI EXTRACTED TEXT</div>
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-xs sm:text-sm text-slate-700 dark:text-slate-350 leading-relaxed font-mono max-h-[50vh] overflow-y-auto border border-slate-100 dark:border-slate-900 select-text whitespace-pre-wrap">
            {activeNote?.extracted_text || 'No text extracted. Check note structure.'}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => { setViewModalOpen(false); handleSummarizeNote(activeNote); }}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl"
            >
              Summarize
            </button>
            <button
              onClick={() => { setViewModalOpen(false); handleAskAI(activeNote); }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
            >
              Ask AI Tutor
            </button>
          </div>
        </div>
      </Modal>

      {/* AI Summary Modal */}
      <Modal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        title={activeNote ? `AI Summary: ${activeNote.title}` : 'AI Summary'}
      >
        <div className="space-y-4 text-left">
          {aiLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <span className="text-xs text-slate-400 font-bold">AI is reading note and generating summary...</span>
            </div>
          ) : (
            <>
              <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Key Note Summary</div>
              <div className="bg-indigo-50/20 dark:bg-indigo-950/25 border border-indigo-100/50 dark:border-indigo-900/30 p-5 rounded-2xl text-xs sm:text-sm text-slate-700 dark:text-slate-350 leading-relaxed max-h-[50vh] overflow-y-auto select-text prose dark:prose-invert">
                {/* Visual markdown rendering mock */}
                {summaryText.split('\n').map((line, idx) => {
                  if (line.startsWith('###')) {
                    return <h4 key={idx} className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mt-3 mb-1">{line.replace('###', '')}</h4>;
                  }
                  if (line.startsWith('**')) {
                    return <div key={idx} className="font-bold text-xs text-slate-700 dark:text-slate-200 mt-2">{line.replaceAll('**', '')}</div>;
                  }
                  if (line.startsWith('-')) {
                    return <li key={idx} className="list-disc ml-4 text-xs mt-1 text-slate-650 dark:text-slate-400">{line.replace('-', '').trim()}</li>;
                  }
                  return <p key={idx} className="text-xs mt-1 leading-relaxed">{line}</p>;
                })}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setSummaryModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 text-xs font-bold rounded-xl"
                >
                  Close
                </button>
                <button
                  onClick={() => { setSummaryModalOpen(false); handleAskAI(activeNote); }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
                >
                  Discuss with AI Tutor
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
export default Notes;
