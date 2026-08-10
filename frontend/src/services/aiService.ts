import { apiRequest } from './api';
import { mockDb, MockAIConversation, MockAIMessage } from './mockDb';

export const aiService = {
  getConversations: async () => {
    try {
      return await apiRequest('/ai/');
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_MOCK') {
        return mockDb.getAIConversations();
      }
      throw err;
    }
  },

  deleteConversation: async (id: number) => {
    try {
      await apiRequest(`/ai/${id}/`, { method: 'DELETE' });
      return true;
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_MOCK') {
        let conversations = mockDb.getAIConversations();
        conversations = conversations.filter(c => c.id !== id);
        mockDb.saveAIConversations(conversations);
        return true;
      }
      throw err;
    }
  },

  chat: async (prompt: string, conversationId?: number) => {
    try {
      return await apiRequest('/ai/chat/', {
        method: 'POST',
        body: JSON.stringify({ prompt, conversation_id: conversationId })
      });
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_MOCK') {
        // Simulate network delay for AI thinking (500ms)
        await new Promise(resolve => setTimeout(resolve, 600));

        let conversations = mockDb.getAIConversations();
        let conversation: MockAIConversation | undefined;

        if (conversationId) {
          conversation = conversations.find(c => c.id === conversationId);
        }

        if (!conversation) {
          conversation = {
            id: Date.now(),
            title: prompt.substring(0, 30) + (prompt.length > 30 ? '...' : ''),
            created_at: new Date().toISOString(),
            messages: []
          };
          conversations.unshift(conversation);
        }

        // Add user message
        const userMsg: MockAIMessage = {
          id: Date.now(),
          role: 'user',
          content: prompt,
          created_at: new Date().toISOString()
        };
        conversation.messages.push(userMsg);

        // Generate mock AI response
        let aiContent = '';
        const promptLower = prompt.toLowerCase();
        
        if (promptLower.includes('polymorphism')) {
          aiContent = `### Java Polymorphism Explained Simply 🤖\n\nPolymorphism is one of the core concepts of Object-Oriented Programming (OOP). The word comes from Greek words meaning *'many forms'*.\n\nIn Java, polymorphism allows us to perform a single action in different ways. There are two main types:\n\n1. **Compile-time Polymorphism (Method Overloading)**: Overloading occurs when multiple methods in the same class have the same name but different parameters.\n2. **Runtime Polymorphism (Method Overriding)**: Overriding occurs when a child class provides a specific implementation of a method already defined in its parent class. Java resolves this call at runtime.\n\n**Key Benefit**: It makes code highly reusable and clean, permitting you to handle generic animal collections without knowing the specific breed until runtime.`;
        } else if (promptLower.includes('inheritance')) {
          aiContent = `### Inheritance in Java 🧬\n\nInheritance is a mechanism in Java in which one class acquires the properties and behaviors of a parent class. It is represented by the \`extends\` keyword.\n\n**Key Terms:**\n- **Super Class (Parent)**: The class whose features are inherited.\n- **Sub Class (Child)**: The class that inherits the other class.\n\nExample:\n\`\`\`java\nclass Vehicle {\n    int speed = 60;\n}\nclass Car extends Vehicle {\n    int wheels = 4;\n}\n\`\`\`\nHere, \`Car\` automatically gains access to \`speed\` from \`Vehicle\`.\n\nNote: Java does *not* support multiple inheritance with classes (e.g., inheriting from two classes at once) to avoid ambiguity, but supports it through interfaces.`;
        } else if (promptLower.includes('dsa') || promptLower.includes('tree') || promptLower.includes('data structure')) {
          aiContent = `### Data Structures: Trees 🌳\n\nA Tree is a hierarchical, non-linear data structure consisting of nodes connected by edges. Unlike arrays or linked lists, which are linear, trees represent hierarchical relationships (like a file directory system).\n\n**Core Terminology:**\n- **Root**: The topmost node of the tree.\n- **Parent / Child**: Nodes connected directly; the higher one is the parent.\n- **Leaf Node**: A node with no children.\n- **Subtree**: Any node and its descendants.\n\n**Binary Search Tree (BST) Rule:**\nFor any node:\n- The value of the **left** subtree is *less than* the node's value.\n- The value of the **right** subtree is *greater than* the node's value.`;
        } else if (promptLower.includes('summarize') || promptLower.includes('summary')) {
          aiContent = `### Study Summary 📝\n\n- **Key Concept**: Core learning concepts must be structured logically for retrieval.\n- **Active Recall**: The most effective way to remember is testing yourself (flashcards or quizzes).\n- **Spaced Repetition**: Re-evaluate the subject in expanding time intervals (1 day, 3 days, 7 days).\n\nLet me know if you would like me to generate practice questions based on this topic!`;
        } else {
          aiContent = `### StudySphere AI Tutor Response 🤖\n\nI've received your query: *"${prompt}"*.\n\nHere are some helpful starting steps to master this topic:\n\n1. **Break it down**: Isolate key terms and concepts.\n2. **Map the relationships**: Draw a quick diagram linking concepts.\n3. **Practice**: Try writing a code snippet or generating a quick quiz.\n\nIs there a specific detail or code snippet you would like me to explain or write out?`;
        }

        // Add assistant message
        const assistantMsg: MockAIMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: aiContent,
          created_at: new Date().toISOString()
        };
        conversation.messages.push(assistantMsg);
        
        mockDb.saveAIConversations(conversations);

        return {
          conversation_id: conversation.id,
          title: conversation.title,
          message: assistantMsg,
          history: conversation.messages
        };
      }
      throw err;
    }
  },

  summarize: async (params: { note_id?: number; text?: string }) => {
    try {
      return await apiRequest('/ai/summarize/', {
        method: 'POST',
        body: JSON.stringify(params)
      });
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_MOCK') {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        let text = params.text || '';
        if (params.note_id) {
          const notes = mockDb.getNotes();
          const note = notes.find(n => n.id === params.note_id);
          text = note ? note.extracted_text : 'Note details.';
        }

        const preview = text.substring(0, 80) + '...';
        const summary = `### AI Note Summary 📄\n\n*Processed text starting with: "${preview}"*\n\n**1. Core Topics Identified:**\n- Fundamental architectural components and variables.\n- Class structures, function configurations, and logic paths.\n\n**2. Main Definitions & Formulas:**\n- Defined entities and methods described in the text.\n- Relational mappings between structures.\n\n**3. Key Summary Takeaways:**\n- Maintain clean styling formatting throughout variables.\n- Keep code modular and testable.\n- Optimize performance loops for larger workloads.`;

        return { summary };
      }
      throw err;
    }
  },

  generateQuestions: async (params: { note_id?: number; text?: string; difficulty?: string; num_questions?: number }) => {
    try {
      return await apiRequest('/ai/generate-questions/', {
        method: 'POST',
        body: JSON.stringify(params)
      });
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_MOCK') {
        await new Promise(resolve => setTimeout(resolve, 700));

        const fallbackQuestions = [
          {
            id: 1,
            question: "Which of the following describes Method Overloading?",
            option_a: "Defining two methods with the same name and arguments in subclasses",
            option_b: "Defining two methods with the same name but different signatures in the same class",
            option_c: "Defining a method in an interface and implementing it in a class",
            option_d: "None of the above",
            correct_answer: "B",
            explanation: "Method overloading allows a class to have multiple methods with the same name, as long as their parameter lists are different."
          },
          {
            id: 2,
            question: "What is the time complexity of searching in a balanced Binary Search Tree?",
            option_a: "O(N)",
            option_b: "O(N log N)",
            option_c: "O(log N)",
            option_d: "O(1)",
            correct_answer: "C",
            explanation: "In a balanced BST, the height is log N. Since each comparison divides the search space in half, searching takes O(log N) time."
          },
          {
            id: 3,
            question: "Which keyword is used by a class to inherit from an interface in Java?",
            option_a: "extends",
            option_b: "implements",
            option_c: "inherits",
            option_d: "super",
            correct_answer: "B",
            explanation: "In Java, a class uses the 'implements' keyword to implement an interface, and the 'extends' keyword to extend another class."
          },
          {
            id: 4,
            question: "What does a 'final' class mean in Java?",
            option_a: "The class cannot be instantiated",
            option_b: "The class cannot have any variables",
            option_c: "The class cannot be subclassed (inherited from)",
            option_d: "The class is ready for garbage collection",
            correct_answer: "C",
            explanation: "A 'final' class in Java cannot be inherited. It prevents any subclasses from extending it."
          },
          {
            id: 5,
            question: "What is the main purpose of garbage collection in Python?",
            option_a: "To speed up loop executions",
            option_b: "To automatically release unused memory allocations",
            option_c: "To check syntax errors at compilation time",
            option_d: "To encrypt user password data",
            correct_answer: "B",
            explanation: "Python's garbage collector automatically deletes objects that no longer have any active references to reclaim memory."
          }
        ];
        
        const count = params.num_questions || 5;
        return {
          questions: fallbackQuestions.slice(0, Math.min(count, fallbackQuestions.length))
        };
      }
      throw err;
    }
  }
};
export type { MockAIConversation, MockAIMessage };
export default aiService;
