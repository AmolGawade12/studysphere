import { apiRequest } from './api';
import { mockDb, MockNote } from './mockDb';

export const noteService = {
  getAll: async (params?: { subject?: number; search?: string }) => {
    try {
      let queryString = '';
      if (params) {
        const parts = [];
        if (params.subject) parts.push(`subject=${params.subject}`);
        if (params.search) parts.push(`search=${encodeURIComponent(params.search)}`);
        if (parts.length > 0) queryString = '?' + parts.join('&');
      }
      return await apiRequest(`/notes/${queryString}`);
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_MOCK') {
        let notes = mockDb.getNotes();
        if (params) {
          if (params.subject) {
            notes = notes.filter(n => n.subject_id === params.subject);
          }
          if (params.search) {
            const query = params.search.toLowerCase();
            notes = notes.filter(n => n.title.toLowerCase().includes(query) || (n.extracted_text && n.extracted_text.toLowerCase().includes(query)));
          }
        }
        
        // Populate subject details
        const subjects = mockDb.getSubjects();
        return notes.map(n => ({
          ...n,
          subject_details: subjects.find(s => s.id === n.subject_id) || null
        }));
      }
      throw err;
    }
  },

  upload: async (formData: FormData) => {
    try {
      return await apiRequest('/notes/upload/', {
        method: 'POST',
        body: formData
      });
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_MOCK') {
        const fileObj = formData.get('file') as File;
        const title = formData.get('title') as string || (fileObj ? fileObj.name : 'Uploaded Note.pdf');
        const subjectId = formData.get('subject_id') ? parseInt(formData.get('subject_id') as string) : null;

        const sizeInBytes = fileObj ? fileObj.size : 1024 * 512;
        let fileType = 'PDF';
        if (fileObj) {
          const parts = fileObj.name.split('.');
          fileType = parts[parts.length - 1].toUpperCase();
        }

        const formatSize = (bytes: number) => {
          if (bytes < 1024) return `${bytes} B`;
          if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
          return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        };

        const notes = mockDb.getNotes();
        
        // Mock text based on file name or type
        const mockText = `This is mock extracted text for note "${title}". It contains learning materials on computer systems, code classes, software design patterns, and study guides. By organizing concepts, you can review them under StudySphere AI tutor. Make sure to try generating a quiz!`;

        const newNote: MockNote = {
          id: Date.now(),
          subject_id: subjectId,
          title,
          file: '#',
          file_type: fileType,
          file_size: formatSize(sizeInBytes),
          extracted_text: mockText,
          created_at: new Date().toISOString()
        };

        notes.unshift(newNote);
        mockDb.saveNotes(notes);

        // Fetch subject details for response structure consistency
        const subjects = mockDb.getSubjects();
        return {
          ...newNote,
          subject_details: subjects.find(s => s.id === subjectId) || null
        };
      }
      throw err;
    }
  },

  delete: async (id: number) => {
    try {
      await apiRequest(`/notes/${id}/`, { method: 'DELETE' });
      return true;
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_MOCK') {
        let notes = mockDb.getNotes();
        notes = notes.filter(n => n.id !== id);
        mockDb.saveNotes(notes);
        return true;
      }
      throw err;
    }
  }
};

export default noteService;
