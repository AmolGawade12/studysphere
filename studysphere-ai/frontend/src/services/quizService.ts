import { apiRequest } from './api';
import { mockDb, MockQuiz, MockQuizResult, MockQuestion } from './mockDb';
import { aiService } from './aiService';

export const quizService = {
  getAll: async () => {
    try {
      return await apiRequest('/quizzes/');
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_MOCK') {
        const quizzes = mockDb.getQuizzes();
        const subjects = mockDb.getSubjects();
        
        return quizzes.map(q => ({
          ...q,
          subject_details: subjects.find(s => s.id === q.subject_id) || null
        }));
      }
      throw err;
    }
  },

  getById: async (id: number) => {
    try {
      return await apiRequest(`/quizzes/${id}/`);
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_MOCK') {
        const quizzes = mockDb.getQuizzes();
        const quiz = quizzes.find(q => q.id === id);
        if (!quiz) throw new Error('Quiz not found');
        const subjects = mockDb.getSubjects();
        return {
          ...quiz,
          subject_details: subjects.find(s => s.id === quiz.subject_id) || null
        };
      }
      throw err;
    }
  },

  generate: async (params: { subject_id?: number; topic: string; difficulty: string; num_questions: number }) => {
    try {
      return await apiRequest('/quizzes/generate/', {
        method: 'POST',
        body: JSON.stringify(params)
      });
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_MOCK') {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const subjects = mockDb.getSubjects();
        const subject = subjects.find(s => s.id === params.subject_id);
        const subjectName = subject ? subject.name : 'General';
        
        // Use AI Question generator mock to fetch questions
        const aiResponse = await aiService.generateQuestions({
          text: subject ? subject.description : '',
          difficulty: params.difficulty,
          num_questions: params.num_questions
        });

        const questionsList: MockQuestion[] = aiResponse.questions.map((q: any, index: number) => ({
          id: Date.now() + index,
          question: q.question,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_answer: q.correct_answer,
          explanation: q.explanation
        }));

        const quizzes = mockDb.getQuizzes();
        const newQuiz: MockQuiz = {
          id: Date.now(),
          subject_id: params.subject_id || null,
          title: `${subjectName} - ${params.topic} Quiz`,
          topic: params.topic,
          difficulty: params.difficulty,
          total_questions: questionsList.length,
          created_at: new Date().toISOString(),
          questions: questionsList
        };

        quizzes.unshift(newQuiz);
        mockDb.saveQuizzes(quizzes);

        return {
          ...newQuiz,
          subject_details: subject || null
        };
      }
      throw err;
    }
  },

  submit: async (id: number, answers: Record<string, string>) => {
    try {
      return await apiRequest(`/quizzes/${id}/submit/`, {
        method: 'POST',
        body: JSON.stringify({ answers })
      });
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_MOCK') {
        const quizzes = mockDb.getQuizzes();
        const quiz = quizzes.find(q => q.id === id);
        if (!quiz) throw new Error('Quiz not found');

        let correctCount = 0;
        let wrongCount = 0;
        const breakdown: any[] = [];

        quiz.questions.forEach((q) => {
          const submitted = answers[q.id.toString()];
          const isCorrect = submitted === q.correct_answer;
          if (isCorrect) {
            correctCount++;
          } else {
            wrongCount++;
          }

          breakdown.push({
            question_id: q.id,
            question: q.question,
            submitted,
            correct_answer: q.correct_answer,
            is_correct: isCorrect,
            explanation: q.explanation
          });
        });

        const total = quiz.questions.length;
        const percentage = Math.round((correctCount / total) * 100);

        // Update progress of corresponding subject as a reward!
        if (quiz.subject_id) {
          const subjects = mockDb.getSubjects();
          const subIdx = subjects.findIndex(s => s.id === quiz.subject_id);
          if (subIdx !== -1 && percentage >= 50) {
            subjects[subIdx].progress = Math.min(100, subjects[subIdx].progress + 5);
            mockDb.saveSubjects(subjects);
          }
        }

        const results = mockDb.getQuizResults();
        const newResult: MockQuizResult = {
          id: Date.now(),
          quiz_id: id,
          quiz_title: quiz.title,
          score: correctCount,
          total,
          percentage,
          completed_at: new Date().toISOString()
        };

        results.unshift(newResult);
        mockDb.saveQuizResults(results);

        return {
          result: newResult,
          correct_count: correctCount,
          wrong_count: wrongCount,
          breakdown
        };
      }
      throw err;
    }
  },

  getResults: async () => {
    try {
      // Custom endpoint or filters, let's say it's gotten via progress or quizzes endpoint.
      // In DRF viewset, results is a nested property of Quiz, or we can fetch results from progress.
      // Let's implement it directly.
      const data = await apiRequest('/progress/');
      return data.quiz_performance;
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_MOCK') {
        return mockDb.getQuizResults();
      }
      throw err;
    }
  }
};

export default quizService;
