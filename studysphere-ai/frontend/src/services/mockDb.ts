// StudySphere AI Local Storage Mock Database Seeder and Client
// Provides high-fidelity fallback when Django backend is offline

export interface MockProfile {
  name: string;
  email: string;
  college: string;
  course: string;
  year: string;
  profile_image?: string;
  created_at: string;
}

export interface MockUser {
  id: number;
  username: string;
  email: string;
  profile: MockProfile;
}

export interface MockSubject {
  id: number;
  name: string;
  description: string;
  progress: number;
  study_hours: number;
  color: string;
  created_at: string;
}

export interface MockNote {
  id: number;
  subject_id?: number | null;
  subject_details?: MockSubject | null;
  title: string;
  file: string;
  file_type: string;
  file_size: string;
  extracted_text: string;
  created_at: string;
}

export interface MockTask {
  id: number;
  subject_id?: number | null;
  subject_details?: MockSubject | null;
  title: string;
  description: string;
  due_date: string;
  duration: number;
  priority: string;
  completed: boolean;
  created_at: string;
}

export interface MockQuestion {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
}

export interface MockQuiz {
  id: number;
  subject_id?: number | null;
  subject_details?: MockSubject | null;
  title: string;
  topic: string;
  difficulty: string;
  total_questions: number;
  created_at: string;
  questions: MockQuestion[];
}

export interface MockQuizResult {
  id: number;
  quiz_id: number;
  quiz_title: string;
  score: number;
  total: number;
  percentage: number;
  completed_at: string;
}

export interface MockStudySession {
  id: number;
  subject_id?: number | null;
  subject_details?: MockSubject | null;
  duration: number;
  session_type: string;
  created_at: string;
}

export interface MockNotification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface MockAIMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface MockAIConversation {
  id: number;
  title: string;
  created_at: string;
  messages: MockAIMessage[];
}

const getStorageItem = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try {
    return JSON.parse(data) as T;
  } catch {
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const initializeMockDb = (force = false) => {
  if (!force && localStorage.getItem('ss_mock_seeded') === 'true') {
    return;
  }

  // 1. User & Profile
  const defaultUser: MockUser = {
    id: 1,
    username: 'student',
    email: 'student@studysphere.ai',
    profile: {
      name: 'Alex Carter',
      email: 'student@studysphere.ai',
      college: 'Tech University',
      course: 'Computer Science',
      year: '3rd Year',
      created_at: new Date().toISOString()
    }
  };
  setStorageItem('ss_user', defaultUser);
  setStorageItem('ss_token', 'mock-token-12345');

  // 2. Subjects
  const defaultSubjects: MockSubject[] = [
    { id: 1, name: 'Java Programming', description: 'Object-oriented programming and application development in Java.', progress: 75, study_hours: 18.5, color: '#6366f1', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString() },
    { id: 2, name: 'Python Basics', description: 'Core concepts of Python, scripting, and basics of algorithms.', progress: 60, study_hours: 12.0, color: '#3b82f6', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString() },
    { id: 3, name: 'Data Structures & Algorithms', description: 'Arrays, LinkedLists, Stacks, Queues, Trees, Graphs, Sorting, and Searching.', progress: 50, study_hours: 15.0, color: '#a855f7', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() },
    { id: 4, name: 'Computer Networks', description: 'OSI Model, TCP/IP, routing protocols, IP addressing, and socket programming.', progress: 40, study_hours: 8.0, color: '#06b6d4', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() }
  ];
  setStorageItem('ss_subjects', defaultSubjects);

  // 3. Notes
  const defaultNotes: MockNote[] = [
    {
      id: 1,
      subject_id: 1,
      title: 'Java OOP Overview.pdf',
      file: '#',
      file_type: 'PDF',
      file_size: '1.2 MB',
      extracted_text: 'Java is an object-oriented programming language designed to have as few implementation dependencies as possible. Polymorphism allows one interface to represent multiple implementations. Method overloading is compile-time polymorphism. Method overriding is runtime polymorphism. Classes serve as blueprints for objects. Encapsulation restricts direct access to object details. Inheritance enables a class to acquire properties of another.',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
    },
    {
      id: 2,
      subject_id: 1,
      title: 'Java Inheritance.pdf',
      file: '#',
      file_type: 'PDF',
      file_size: '850 KB',
      extracted_text: 'Inheritance in Java is a mechanism in which one object acquires all the properties and behaviors of a parent object. It is an important part of OOPs. The idea behind inheritance in Java is that you can create new classes that are built upon existing classes. When you inherit from an existing class, you can reuse methods and fields of the parent class. Key terms: subclass (child), subclass inherits, superclass (parent), extends keyword.',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
    },
    {
      id: 3,
      subject_id: 2,
      title: 'Python Functions.pdf',
      file: '#',
      file_type: 'PDF',
      file_size: '920 KB',
      extracted_text: 'A function is a block of code which only runs when it is called. You can pass data, known as parameters, into a function. A function can return data as a result. In Python, a function is defined using the def keyword. Arguments are specified after the function name, inside the parentheses. You can add as many arguments as you want, just separate them with a comma.',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
    },
    {
      id: 4,
      subject_id: 3,
      title: 'DSA Trees.pdf',
      file: '#',
      file_type: 'PDF',
      file_size: '1.5 MB',
      extracted_text: 'A tree is a non-linear hierarchical data structure that consists of nodes connected by boundaries. Binary Search Tree (BST) is a node-based binary tree data structure which has the following properties: The left subtree of a node contains only nodes with keys lesser than the parent node\'s key. The right subtree contains only nodes with keys greater than the parent node\'s key. Time complexity of searching is O(log N).',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
    }
  ];
  setStorageItem('ss_notes', defaultNotes);

  // 4. Tasks (Planner)
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().split('T')[0];
  const in3DaysStr = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().split('T')[0];

  const defaultTasks: MockTask[] = [
    { id: 1, subject_id: 1, title: 'Study Java Inheritance', description: 'Read pages 10-15 of Java Inheritance note, write inheritance sample code.', due_date: tomorrowStr, duration: 45, priority: 'High', completed: false, created_at: new Date().toISOString() },
    { id: 2, subject_id: 2, title: 'Complete Python Functions', description: 'Do practice exercises for def statements, keyword args and lambda.', due_date: todayStr, duration: 30, priority: 'Medium', completed: true, created_at: new Date().toISOString() },
    { id: 3, subject_id: 3, title: 'Revise DSA Trees', description: 'Implement BST inserts, deletes, and traversals in Python.', due_date: in3DaysStr, duration: 60, priority: 'High', completed: false, created_at: new Date().toISOString() }
  ];
  setStorageItem('ss_tasks', defaultTasks);

  // 5. Study Sessions (Pomodoro logging)
  const defaultSessions: MockStudySession[] = [];
  const daysOfWeek = [6, 5, 4, 3, 2, 1, 0];
  const testDurations = [120, 180, 90, 150, 60, 120, 90]; // matches seed data Mon-Sun duration (minutes)
  daysOfWeek.forEach((daysAgo, idx) => {
    defaultSessions.push({
      id: idx + 1,
      subject_id: idx % 2 === 0 ? 1 : 3,
      duration: testDurations[idx],
      session_type: 'study',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * daysAgo).toISOString()
    });
  });
  setStorageItem('ss_study_sessions', defaultSessions);

  // 6. Quizzes & Quiz Results
  const defaultQuizzes: MockQuiz[] = [
    {
      id: 1,
      subject_id: 1,
      title: 'Java OOP Principles',
      topic: 'OOP Foundations',
      difficulty: 'Medium',
      total_questions: 4,
      created_at: new Date().toISOString(),
      questions: [
        { id: 1, question: 'Which keyword is used for inheritance in Java?', option_a: 'implements', option_b: 'extends', option_c: 'inherit', option_d: 'super', correct_answer: 'B', explanation: 'Java uses the \'extends\' keyword to inherit properties and methods from a parent class.' },
        { id: 2, question: 'Which concept supports compile-time polymorphism?', option_a: 'Method Overriding', option_b: 'Method Overloading', option_c: 'Interface Implementation', option_d: 'Abstraction', correct_answer: 'B', explanation: 'Method Overloading involves defining multiple methods in the same class with same name but different signatures. Resolved at compile-time.' },
        { id: 3, question: 'What prevents a class from being inherited in Java?', option_a: 'static keyword', option_b: 'abstract keyword', option_c: 'final keyword', option_d: 'private keyword', correct_answer: 'C', explanation: 'Classes declared with the \'final\' keyword cannot be subclassed or extended.' },
        { id: 4, question: 'What is encapsulation?', option_a: 'Hiding data details under private fields and exposing via public getters/setters', option_b: 'Inheriting subclasses', option_c: 'Writing polymorphic constructors', option_d: 'Overriding parent methods', correct_answer: 'A', explanation: 'Encapsulation is wrapping code and data together into a single unit, hiding variables behind getters/setters.' }
      ]
    },
    {
      id: 2,
      subject_id: 2,
      title: 'Python Functions Quiz',
      topic: 'Basic Functions',
      difficulty: 'Easy',
      total_questions: 2,
      created_at: new Date().toISOString(),
      questions: [
        { id: 5, question: 'Which keyword defines a function in Python?', option_a: 'function', option_b: 'def', option_c: 'func', option_d: 'define', correct_answer: 'B', explanation: 'Python uses the \'def\' keyword to start a function definition block.' },
        { id: 6, question: 'What is a lambda function in Python?', option_a: 'A function that is recursive', option_b: 'An anonymous, one-line function', option_c: 'A special type of method override', option_d: 'A decorator pattern', correct_answer: 'B', explanation: 'Lambdas are small, anonymous, inline functions created with the \'lambda\' keyword.' }
      ]
    }
  ];
  setStorageItem('ss_quizzes', defaultQuizzes);

  const defaultQuizResults: MockQuizResult[] = [
    { id: 1, quiz_id: 1, quiz_title: 'Java OOP Principles', score: 3, total: 4, percentage: 75, completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
    { id: 2, quiz_id: 2, quiz_title: 'Python Functions Quiz', score: 2, total: 2, percentage: 100, completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() }
  ];
  setStorageItem('ss_quiz_results', defaultQuizResults);

  // 7. Notifications
  const defaultNotifications: MockNotification[] = [
    { id: 1, title: 'Java task is due today.', message: 'Your planner task \'Study Java Inheritance\' is due by end of the day today.', read: false, created_at: new Date().toISOString() },
    { id: 2, title: 'Quiz completed — 100%.', message: 'Great job! You achieved 100% on the Python Functions Quiz.', read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
    { id: 3, title: 'You studied for 2 hours today.', message: 'Nice focus streak! You logged 120 minutes of study session today.', read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() }
  ];
  setStorageItem('ss_notifications', defaultNotifications);

  // 8. AI Conversations
  const defaultAIConversations: MockAIConversation[] = [
    {
      id: 1,
      title: 'Java OOP Polymorphism',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      messages: [
        { id: 1, role: 'user', content: 'Explain polymorphism in Java.', created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
        {
          id: 2,
          role: 'assistant',
          content: '### Java Polymorphism Explained Simply 🤖\n\nPolymorphism is one of the core concepts of Object-Oriented Programming (OOP).\n\nIn Java, polymorphism allows us to perform a single action in different ways. There are two main types:\n\n1. **Compile-time Polymorphism (Method Overloading)**: Same name but different signatures inside the same class.\n2. **Runtime Polymorphism (Method Overriding)**: Subclass overrides a method defined in the parent class.\n\nBenefits include code reusability and clean design.',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 2).toISOString()
        }
      ]
    }
  ];
  setStorageItem('ss_ai_conversations', defaultAIConversations);

  localStorage.setItem('ss_mock_seeded', 'true');
  console.log("Mock Database initialized successfully!");
};

// Mock CRUD Database Client Helper
export const mockDb = {
  getUser: () => getStorageItem<MockUser | null>('ss_user', null),
  setUser: (user: MockUser) => setStorageItem('ss_user', user),
  
  getToken: () => localStorage.getItem('ss_token'),
  setToken: (token: string) => localStorage.setItem('ss_token', token),
  clearToken: () => {
    localStorage.removeItem('ss_token');
    localStorage.removeItem('ss_user');
  },

  getSubjects: () => getStorageItem<MockSubject[]>('ss_subjects', []),
  saveSubjects: (subjects: MockSubject[]) => setStorageItem('ss_subjects', subjects),
  
  getNotes: () => getStorageItem<MockNote[]>('ss_notes', []),
  saveNotes: (notes: MockNote[]) => setStorageItem('ss_notes', notes),

  getTasks: () => getStorageItem<MockTask[]>('ss_tasks', []),
  saveTasks: (tasks: MockTask[]) => setStorageItem('ss_tasks', tasks),

  getSessions: () => getStorageItem<MockStudySession[]>('ss_study_sessions', []),
  saveSessions: (sessions: MockStudySession[]) => setStorageItem('ss_study_sessions', sessions),

  getQuizzes: () => getStorageItem<MockQuiz[]>('ss_quizzes', []),
  saveQuizzes: (quizzes: MockQuiz[]) => setStorageItem('ss_quizzes', quizzes),

  getQuizResults: () => getStorageItem<MockQuizResult[]>('ss_quiz_results', []),
  saveQuizResults: (results: MockQuizResult[]) => setStorageItem('ss_quiz_results', results),

  getNotifications: () => getStorageItem<MockNotification[]>('ss_notifications', []),
  saveNotifications: (notifications: MockNotification[]) => setStorageItem('ss_notifications', notifications),

  getAIConversations: () => getStorageItem<MockAIConversation[]>('ss_ai_conversations', []),
  saveAIConversations: (conversations: MockAIConversation[]) => setStorageItem('ss_ai_conversations', conversations),
};
