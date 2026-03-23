import { useState, useRef, useEffect, type FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, LogOut } from 'lucide-react';
import { 
  determineColor, 
  getColorClass, 
  getBorderColorClass, 
  type ResponseColor 
} from '@/lib/colorLogic';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  color?: ResponseColor;
}

interface ChatProps {
  userEmail: string;
  onLogout: () => void;
}

const Chat = ({ userEmail, onLogout }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    
    // Auth Guardrail Check (Redundant safety)
    if (!userEmail.endsWith('@petasight.com')) {
      alert("Unauthorized domain.");
      return;
    }

    if (!text || isLoading) return;

    // Priority: Determine color BEFORE sending to AI for immediate UI feedback
    const localColor = determineColor(text);
    const userMsg: Message = { role: 'user', content: text };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Invoke Supabase Edge Function (The Gemini 3.1 Pro Backend)
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          userInput: text,
          colorHint: localColor,
        },
      });

      if (error) throw error;

      // Handle AI Sentiment override if local logic was neutral ('amber')
      const aiSentiment = data?.sentiment as ResponseColor | undefined;
      const finalColor = localColor === 'amber' && aiSentiment ? aiSentiment : localColor;

      const assistantMsg: Message = {
        role: 'assistant',
        content: data?.reply || 'Ошибка системы. / System error.',
        color: finalColor,
      };
      
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat Error:', err);
      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          content: 'Произошла критическая ошибка. / A critical error occurred.', 
          color: 'red' 
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* WCAG Compliant Header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 bg-card">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Президент Российской Федерации</h1>
          <p className="text-xs text-muted-foreground font-mono">{userEmail}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
          aria-label="Log out of session"
        >
          <LogOut className="mr-1.5 h-4 w-4" />
          Exit
        </Button>
      </header>

      {/* Message History Area */}
      <main 
        className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 space-y-6" 
        role="log" 
        aria-live="polite" 
        aria-label="Chat history"
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center space-y-2">
            <div className="w-16 h-1 w-16 bg-blue-600 mb-4 rounded-full opacity-50" />
            <p className="text-muted-foreground text-sm max-w-sm">
              Вход выполнен. Ожидаю ваших докладов.
              <br />
              <span className="italic opacity-70">Access granted. Awaiting your reports.</span>
            </p>
          </div>
        )}

        <div className="mx-auto max-w-3xl space-y-6">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm transition-all ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-12'
                    : `border-l-8 ${msg.color ? getBorderColorClass(msg.color) : 'border-l-slate-500'} 
                       ${msg.color ? getColorClass(msg.color) : 'bg-card text-foreground'} mr-12`
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm prose-slate max-w-none dark:prose-invert">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm font-medium">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-in fade-in slide-in-from-left-2">
              <div className="rounded-2xl bg-muted px-5 py-3 text-sm text-muted-foreground italic">
                Президент обдумывает ответ...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input Footer */}
      <footer className="border-t border-border bg-card p-4 sm:p-6">
        <form onSubmit={send} className="mx-auto flex max-w-3xl gap-3">
          <Input
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Введите директиву... / Enter directive..."
            disabled={isLoading}
            className="flex-1 h-12 bg-background border-2 focus-visible:ring-blue-600"
            autoComplete="off"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="h-12 px-6 bg-blue-700 hover:bg-blue-800 text-white font-bold"
            aria-label="Send directive to President"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </footer export default Chat;
    </div>
  );
};

export default Chat;