import { apiRequest } from './api';
import { mockDb } from './mockDb';

export const progressService = {
  getAnalytics: async () => {
    try {
      return await apiRequest('/progress/');
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_MOCK') {
        const subjects = mockDb.getSubjects();
        const results = mockDb.getQuizResults();
        const tasks = mockDb.getTasks();
        const sessions = mockDb.getSessions();

        // 1. Total Study Hours
        const totalHours = subjects.reduce((sum, s) => sum + s.study_hours, 0);

        // 2. Quiz Average
        const quizAvg = results.length > 0
          ? results.reduce((sum, r) => sum + r.percentage, 0) / results.length
          : 0;

        // 3. Tasks Completed
        const completedTasks = tasks.filter(t => t.completed).length;
        const tasksCompletedPct = tasks.length > 0
          ? (completedTasks / tasks.length) * 100
          : 0;

        // 4. Streak
        let streak = 0;
        const studySessions = sessions.filter(s => s.session_type === 'study');
        if (studySessions.length > 0) {
          // Sort unique dates descending
          const dates = Array.from(new Set(studySessions.map(s => s.created_at.split('T')[0])))
            .map(d => new Date(d))
            .sort((a, b) => b.getTime() - a.getTime());

          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);

          if (dates.length > 0) {
            const firstDate = dates[0];
            firstDate.setHours(0, 0, 0, 0);

            if (firstDate.getTime() === today.getTime() || firstDate.getTime() === yesterday.getTime()) {
              streak = 1;
              let currentDate = firstDate;
              for (let i = 1; i < dates.length; i++) {
                const nextDate = dates[i];
                nextDate.setHours(0, 0, 0, 0);
                const diffTime = currentDate.getTime() - nextDate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                  streak++;
                  currentDate = nextDate;
                } else if (diffDays === 0) {
                  continue;
                } else {
                  break;
                }
              }
            }
          }
        }

        // 5. Weekly Study Time (7 days)
        const weeklyStudyTime: any[] = [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
          const dateStr = d.toISOString().split('T')[0];

          const daySessions = studySessions.filter(s => s.created_at.split('T')[0] === dateStr);
          const totalMin = daySessions.reduce((sum, s) => sum + s.duration, 0);
          
          weeklyStudyTime.push({
            day: dayName,
            hours: parseFloat((totalMin / 60).toFixed(1))
          });
        }

        // 6. Subject Progress
        const subjectProgress = subjects.map(s => ({
          id: s.id,
          name: s.name,
          progress: s.progress,
          study_hours: s.study_hours,
          color: s.color
        }));

        // 7. Quiz Performance
        const quizPerformance = results.slice(0, 5).map(r => ({
          id: r.id,
          title: r.quiz_title,
          percentage: r.percentage,
          completed_at: new Date(r.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }));

        return {
          stats: {
            total_study_hours: parseFloat(totalHours.toFixed(1)),
            quiz_average: parseFloat(quizAvg.toFixed(1)),
            tasks_completed: parseFloat(tasksCompletedPct.toFixed(1)),
            study_streak: streak
          },
          weekly_study_time: weeklyStudyTime,
          subject_progress: subjectProgress,
          quiz_performance: quizPerformance
        };
      }
      throw err;
    }
  },

  logStudySession: async (session: { subject_id?: number | null; duration: number; session_type: string }) => {
    try {
      return await apiRequest('/study-sessions/', {
        method: 'POST',
        body: JSON.stringify(session)
      });
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_MOCK') {
        const sessions = mockDb.getSessions();
        
        const newSession = {
          id: Date.now(),
          subject_id: session.subject_id || null,
          duration: session.duration,
          session_type: session.session_type,
          created_at: new Date().toISOString()
        };
        sessions.unshift(newSession);
        mockDb.saveSessions(sessions);

        // If it was a study session, increment subject hours
        if (session.subject_id && session.session_type === 'study') {
          const subjects = mockDb.getSubjects();
          const idx = subjects.findIndex(s => s.id === session.subject_id);
          if (idx !== -1) {
            const hoursAdded = session.duration / 60;
            subjects[idx].study_hours = parseFloat((subjects[idx].study_hours + hoursAdded).toFixed(2));
            subjects[idx].progress = Math.min(100, subjects[idx].progress + Math.floor(session.duration / 10));
            mockDb.saveSubjects(subjects);
          }
        }

        return newSession;
      }
      throw err;
    }
  }
};
export default progressService;
