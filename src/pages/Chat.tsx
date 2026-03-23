import { useState, useRef, useEffect, type FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, LogOut } from 'lucide-react';
import { determineColor, getColorClass, getBorderColorClass, type ResponseColor } from '@/lib/colorLogic';
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const color = determineColor(text);
    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          userInput: text,
          colorHint: color,
        },
      });

      if (error) throw error;

      const sentiment = data?.sentiment as ResponseColor | undefined;
      const finalColor = color === 'amber' && sentiment ? sentiment : color;

      const assistantMsg: Message = {
        role: 'assistant',
        content: data?.reply || 'Ошибка. / Error occurred.',
        color: finalColor,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Произошла ошибка. / An error occurred.', color: 'red' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
        <div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">Президент</h1>
          <p className="text-xs text-muted-foreground">{userEmail}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Log out"
        >
          <LogOut className="mr-1.5 h-4 w-4" />
          Exit
        </Button>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground text-sm text-center max-w-xs">
              Добро пожаловать. Задайте вопрос Президенту России.
              <br />
              <span className="text-xs">Welcome. Ask the President of Russia a question.</span>
            </p>
          </div>
        )}
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : `bg-card border-l-4 ${msg.color ? getBorderColorClass(msg.color) : 'border-l-border'} ${msg.color ? getColorClass(msg.color) : 'text-foreground'}`
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-card px-4 py-3 text-sm text-muted-foreground">
                <span className="animate-pulse">Печатает...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="border-t border-border px-4 py-3 sm:px-6">
        <form onSubmit={send} className="mx-auto flex max-w-2xl gap-2">
          <label htmlFor="chat-input" className="sr-only">Type your message</label>
          <Input
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Напишите сообщение... / Type a message..."
            disabled={isLoading}
            className="flex-1 bg-input text-foreground placeholder:text-muted-foreground border-border"
            autoComplete="off"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="icon"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
};

export default Chat;
