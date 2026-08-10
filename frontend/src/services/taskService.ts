import { apiRequest } from './api';
import { mockDb, MockTask } from './mockDb';

export const taskService = {
  getAll: async () => {
    try {
      return await apiRequest('/tasks/');
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_MOCK') {
        const tasks = mockDb.getTasks();
        const subjects = mockDb.getSubjects();
        return tasks.map(t => ({
          ...t,
          subject_details: subjects.find(s => s.id === t.subject_id) || null
        }));
      }
      throw err;
    }
  },

  create: async (task: { title: string; description: string; due_date: string; duration: number; priority: string; subject_id?: number | null }) => {
    try {
      return await apiRequest('/tasks/', {
        method: 'POST',
        body: JSON.stringify(task)
      });
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_MOCK') {
        const tasks = mockDb.getTasks();
        const subjects = mockDb.getSubjects();
        const subject = subjects.find(s => s.id === task.subject_id);

        const newTask: MockTask = {
          id: Date.now(),
          subject_id: task.subject_id || null,
          title: task.title,
          description: task.description || '',
          due_date: task.due_date,
          duration: task.duration,
          priority: task.priority,
          completed: false,
          created_at: new Date().toISOString()
        };

        tasks.unshift(newTask);
        mockDb.saveTasks(tasks);

        return {
          ...newTask,
          subject_details: subject || null
        };
      }
      throw err;
    }
  },

  update: async (id: number, task: Partial<MockTask>) => {
    try {
      return await apiRequest(`/tasks/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(task)
      });
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_MOCK') {
        const tasks = mockDb.getTasks();
        const idx = tasks.findIndex(t => t.id === id);
        if (idx !== -1) {
          tasks[idx] = { ...tasks[idx], ...task };
          mockDb.saveTasks(tasks);
          
          const subjects = mockDb.getSubjects();
          return {
            ...tasks[idx],
            subject_details: subjects.find(s => s.id === tasks[idx].subject_id) || null
          };
        }
        throw new Error('Task not found');
      }
      throw err;
    }
  },

  delete: async (id: number) => {
    try {
      await apiRequest(`/tasks/${id}/`, { method: 'DELETE' });
      return true;
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_MOCK') {
        let tasks = mockDb.getTasks();
        tasks = tasks.filter(t => t.id !== id);
        mockDb.saveTasks(tasks);
        return true;
      }
      throw err;
    }
  }
};
export type { MockTask };
export default taskService;
