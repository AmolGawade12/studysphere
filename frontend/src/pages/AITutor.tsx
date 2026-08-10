import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { 
  Bot, Send, Plus, Trash2, Loader2, Sparkles, 
  CornerDownLeft, MessageSquare, BookOpen, AlertCircle
} from 'lucide-react';
import aiService, { MockAIConversation, MockAIMessage } from '../services/aiService';

interface AITutorProps {
  initialParams?: { initialPrompt?: string };
  clearParams?: () => void;
}

export const AITutor: React.FC<AITutorProps> = ({ initialParams, clearParams }) => {
  const { showToast } = useToast();

  const [conversations, setConversations] = useState<MockAIConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MockAIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await aiService.getConversations();
      setConversations(data);
      if (data.length > 0) {
        setActiveConversationId(data[0].id);
        setMessages(data[0].messages);
      }
    } catch (err) {
      showToast('Failed to load conversations history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Handle external prompts (e.g. "Ask AI" clicked on dashboard/notes)
  useEffect(() => {
    if (initialParams?.initialPrompt) {
      const prompt = initialParams.initialPrompt;
      if (clearParams) clearParams(); // Clear to prevent loops

      // Trigger automatic prompt chat session
      handleNewConversationWithPrompt(prompt);
    }
  }, [initialParams]);

  // Scroll viewport down automatically on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const handleSelectConversation = (id: number) => {
    const convo = conversations.find(c => c.id === id);
    if (convo) {
      setActiveConversationId(id);
      setMessages(convo.messages);
    }
  };

  const handleNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setInput('');
  };

  const handleNewConversationWithPrompt = async (promptText: string) => {
    setChatLoading(true);
    // Temporary user message push
    const tempUserMsg: MockAIMessage = {
      id: Date.now(),
      role: 'user',
      content: promptText,
      created_at: new Date().toISOString()
    };
    setMessages([tempUserMsg]);
    setActiveConversationId(null);

    try {
      const response = await aiService.chat(promptText);
      
      // Update conversations list with the new one
      const updatedConversations = await aiService.getConversations();
      setConversations(updatedConversations);
      
      setActiveConversationId(response.conversation_id);
      setMessages(response.history);
    } catch (err) {
      showToast('AI Tutor failed to respond.', 'error');
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToSend = (customPrompt || input).trim();
    if (!promptToSend) return;

    setInput('');
    setChatLoading(true);

    // Optimistically push user message to UI
    const userMsg: MockAIMessage = {
      id: Date.now(),
      role: 'user',
      content: promptToSend,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await aiService.chat(promptToSend, activeConversationId || undefined);
      
      // Update sidebar history
      setConversations(prev => {
        const exist = prev.find(c => c.id === response.conversation_id);
        if (exist) {
          return prev.map(c => c.id === response.conversation_id ? {
            ...c,
            messages: response.history
          } : c);
        } else {
          return [{
            id: response.conversation_id,
            title: response.title,
            messages: response.history,
            created_at: new Date().toISOString()
          }, ...prev];
        }
      });

      setActiveConversationId(response.conversation_id);
      setMessages(response.history);
    } catch (err) {
      showToast('Failed to reach AI Tutor.', 'error');
    } finally {
      setChatLoading(false);
    }
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Avoid switching active conversation
    try {
      await aiService.deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      
      if (activeConversationId === id) {
        // Clear viewport
        setActiveConversationId(null);
        setMessages([]);
      }
      showToast('Conversation deleted.', 'success');
    } catch (err) {
      showToast('Failed to delete conversation.', 'error');
    }
  };

  const quickPrompts = [
    { label: "Explain polymorphism", prompt: "Explain polymorphism in Java simply, with examples." },
    { label: "Revise inheritance rules", prompt: "Explain inheritance in Java and standard subclass keywords." },
    { label: "What is a BST?", prompt: "Explain Binary Search Trees, traversal, and time complexity." },
    { label: "Active Recall Tips", prompt: "Give me bullet summaries of best study methods and Active Recall." }
  ];

  if (loading && conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-slate-400 font-semibold">Loading AI workspace...</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row h-[calc(100vh-140px)] animate-fade-in text-left">
      
      {/* Left Conversations Sidebar Panel */}
      <div className="w-full md:w-64 border-r border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between h-[30%] md:h-full bg-slate-50/30 dark:bg-slate-900/10">
        <div className="p-4 flex flex-col gap-3.5 h-full overflow-hidden">
          <button
            onClick={handleNewConversation}
            className="flex items-center justify-center gap-1.5 w-full bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold py-2.5 px-4 rounded-xl border border-indigo-100/50 dark:border-indigo-900/20 text-xs transition-colors focus:outline-none cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Conversation
          </button>
          
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 no-scrollbar">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest px-2">CONVERSATIONS</span>
            {conversations.length > 0 ? (
              conversations.map(convo => {
                const isActive = activeConversationId === convo.id;
                return (
                  <button
                    key={convo.id}
                    onClick={() => handleSelectConversation(convo.id)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-650 dark:text-slate-350 transition-all border border-transparent ${
                      isActive 
                        ? 'bg-white dark:bg-slate-800 shadow-sm border-slate-200/20 dark:border-slate-700/30 text-indigo-650 dark:text-indigo-400' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className="w-4 h-4 text-slate-450 dark:text-slate-500 flex-shrink-0" />
                      <span className="truncate">{convo.title}</span>
                    </div>
                    <span 
                      onClick={(e) => handleDeleteConversation(e, convo.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                      title="Delete Chat"
                    >
                      <Trash2 className="w-3 h-3" />
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="text-[10px] text-slate-400 font-semibold p-4 text-center">
                No chats recorded.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Main Chat Panel */}
      <div className="flex-1 flex flex-col justify-between h-[70%] md:h-full bg-white dark:bg-slate-900">
        
        {/* Chat Header banner */}
        <div className="px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/80 bg-slate-50/10 dark:bg-slate-900/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 rounded-xl">
              <Bot className="w-5. h-5.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                StudySphere AI Tutor
                <span className="text-[9px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 px-1.5 py-0.5 rounded font-extrabold shadow-sm border border-emerald-100 dark:border-transparent uppercase">ONLINE</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Your personalized academic tutor and assistant</p>
            </div>
          </div>
        </div>

        {/* Viewport bubbles */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length > 0 ? (
            messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div 
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div className={`flex items-start gap-3 max-w-[85%] sm:max-w-[75%] ${isUser ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm flex-shrink-0 ${
                      isUser 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600'
                    }`}>
                      {isUser ? 'U' : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Bubble */}
                    <div className={`px-4 py-3 rounded-2xl text-xs sm:text-sm text-left leading-relaxed ${
                      isUser 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-slate-50 dark:bg-slate-850 text-slate-750 dark:text-slate-350 border border-slate-100 dark:border-slate-850 rounded-tl-none prose dark:prose-invert font-sans'
                    }`}>
                      {isUser ? (
                        msg.content
                      ) : (
                        /* Parse simple markdown lines for clean formatting */
                        msg.content.split('\n').map((line, idx) => {
                          if (line.startsWith('###')) {
                            return <h4 key={idx} className="font-extrabold text-sm text-slate-900 dark:text-slate-100 mt-3 mb-1">{line.replace('###', '')}</h4>;
                          }
                          if (line.startsWith('**')) {
                            return <div key={idx} className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-2">{line.replaceAll('**', '')}</div>;
                          }
                          if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) {
                            return <div key={idx} className="ml-2 text-xs mt-1 font-semibold">{line}</div>;
                          }
                          if (line.startsWith('-')) {
                            return <li key={idx} className="list-disc ml-4 text-xs mt-0.5 text-slate-650 dark:text-slate-450">{line.replace('-', '').trim()}</li>;
                          }
                          if (line.startsWith('   ```')) {
                            return null; // hide raw ticks
                          }
                          if (line.includes('```')) {
                            return null; // hide raw ticks
                          }
                          if (line.trim().startsWith('class') || line.trim().startsWith('void') || line.trim().startsWith('int') || line.trim().startsWith('}') || line.trim().startsWith('{')) {
                            // Render mock java blocks
                            return <div key={idx} className="font-mono text-[11px] bg-slate-150/50 dark:bg-slate-900 p-1 px-2.5 rounded text-indigo-650 dark:text-indigo-400 ml-3 whitespace-pre">{line}</div>;
                          }
                          return <p key={idx} className="mt-1 font-medium">{line}</p>;
                        })
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            /* Welcome state bubble */
            <div className="h-full flex flex-col justify-center items-center text-center p-8 space-y-4 max-w-sm mx-auto">
              <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 flex items-center justify-center animate-bounce">
                <Bot className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-base text-slate-850 dark:text-slate-200">Start studying with AI</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Ask me to explain difficult coding methods, structure data traversals, summarize note contents, or formulate questions!
                </p>
              </div>
            </div>
          )}

          {/* AI Thinking loader bubble */}
          {chatLoading && (
            <div className="flex justify-start animate-pulse">
              <div className="flex items-start gap-3 max-w-[75%]">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-850 px-4 py-3 rounded-2xl rounded-tl-none text-xs text-slate-400 font-bold flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  AI is thinking...
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Prompts Panel */}
        {messages.length === 0 && (
          <div className="px-6 py-2 border-t border-slate-100 dark:border-slate-800/40">
            <div className="flex flex-wrap gap-2 py-1.5 justify-center">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(undefined, qp.prompt)}
                  className="px-3.5 py-1.5 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-850 dark:hover:bg-indigo-950/20 border border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 rounded-full transition-all hover:scale-103 focus:outline-none cursor-pointer"
                >
                  ✨ {qp.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar Form */}
        <div className="px-6 py-4 border-t border-slate-200/50 dark:border-slate-800/80">
          <form 
            onSubmit={handleSendMessage}
            className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1.5 pl-4 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all"
          >
            <input
              type="text"
              placeholder="Ask anything about your studies..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={chatLoading}
              className="flex-1 bg-transparent border-none focus:outline-none text-xs sm:text-sm text-slate-850 dark:text-slate-100 disabled:text-slate-400 py-2.5"
            />
            <button
              type="submit"
              disabled={chatLoading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold p-2.5 rounded-lg shadow-sm transition-transform active:scale-95 disabled:scale-100 focus:outline-none cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
export default AITutor;
