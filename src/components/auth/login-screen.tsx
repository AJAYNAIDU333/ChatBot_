"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Landmark } from "lucide-react"; // Import the Landmark icon
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Sign-in failed");
        return;
      }
      router.push("/chat");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md border-border/80 shadow-lg">
        <CardHeader className="space-y-4 text-center">
          {/* Diplomatic Icon Section */}
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/10">
              <Landmark className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Petasight Diplomatic Portal
            </CardTitle>
            <CardDescription className="text-sm">
              Identity verification in progress. <br />
              Access restricted to authorized delegates.
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider font-semibold opacity-70">
                Diplomatic Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(ev) => {
                  setEmail(ev.target.value);
                  setError(null);
                }}
                placeholder="delegate@petasight.com"
                disabled={pending}
                className="bg-muted/30"
                aria-invalid={!!error}
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>
            
            {error ? (
              <Alert variant="destructive" id="login-error" role="alert">
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full font-semibold" disabled={pending}>
              {pending ? "Authenticating..." : "Enter Embassy"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}