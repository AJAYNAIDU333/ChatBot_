import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim().toLowerCase().endsWith('@petasight.com')) {
      setError('');
      onLogin(email.trim().toLowerCase());
    } else {
      setError('Unauthorized');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md px-6">
        <div className="rounded-xl border border-border bg-card p-8 shadow-2xl">
          <h1 className="mb-2 text-center text-3xl font-bold text-foreground tracking-tight">
            GATEKEEPER
          </h1>
          <p className="mb-8 text-center text-muted-foreground text-sm">
            Petasight personnel only
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="name@petasight.com"
                required
                aria-describedby={error ? 'login-error' : undefined}
                aria-invalid={!!error}
                className="bg-input text-foreground placeholder:text-muted-foreground border-border focus:ring-ring"
              />
            </div>

            {error && (
              <div
                id="login-error"
                role="alert"
                className="rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-center text-sm font-semibold text-destructive"
              >
                {error}
              </div>
            )}

            <Button type="submit" className="w-full text-primary-foreground bg-primary hover:bg-primary/90 font-semibold text-base py-5">
              Enter
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
