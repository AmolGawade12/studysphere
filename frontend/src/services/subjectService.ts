import { apiRequest } from './api';
import { mockDb, MockSubject } from './mockDb';

export const subjectService = {
  getAll: async () => {
    try {
      return await apiRequest('/subjects/');
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_MOCK') {
        return mockDb.getSubjects();
      }
      throw err;
    }
  },

  create: async (subject: { name: string; description: string; color?: string }) => {
    try {
      return await apiRequest('/subjects/', {
        method: 'POST',
        body: JSON.stringify(subject)
      });
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_MOCK') {
        const subjects = mockDb.getSubjects();
        const newSubject: MockSubject = {
          id: Date.now(),
          name: subject.name,
          description: subject.description,
          progress: 0,
          study_hours: 0,
          color: subject.color || '#6366f1',
          created_at: new Date().toISOString()
        };
        subjects.unshift(newSubject);
        mockDb.saveSubjects(subjects);
        return newSubject;
      }
      throw err;
    }
  },

  update: async (id: number, subject: Partial<MockSubject>) => {
    try {
      return await apiRequest(`/subjects/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(subject)
      });
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_MOCK') {
        const subjects = mockDb.getSubjects();
        const idx = subjects.findIndex(s => s.id === id);
        if (idx !== -1) {
          subjects[idx] = { ...subjects[idx], ...subject };
          mockDb.saveSubjects(subjects);
          return subjects[idx];
        }
        throw new Error('Subject not found');
      }
      throw err;
    }
  },

  delete: async (id: number) => {
    try {
      await apiRequest(`/subjects/${id}/`, { method: 'DELETE' });
      return true;
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_MOCK') {
        let subjects = mockDb.getSubjects();
        subjects = subjects.filter(s => s.id !== id);
        mockDb.saveSubjects(subjects);
        
        // Also delete tasks and notes belonging to this subject
        let notes = mockDb.getNotes().filter(n => n.subject_id !== id);
        mockDb.saveNotes(notes);

        let tasks = mockDb.getTasks().filter(t => t.subject_id !== id);
        mockDb.saveTasks(tasks);

        return true;
      }
      throw err;
    }
  }
};

export default subjectService;
