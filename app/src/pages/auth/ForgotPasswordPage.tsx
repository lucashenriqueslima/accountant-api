import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthShell } from '@/features/auth/AuthShell';
import { useForgotPassword } from '@/features/auth/api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const forgot = useForgotPassword();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    forgot.mutate(email);
  };

  return (
    <AuthShell
      title="Recuperar senha"
      subtitle="Enviaremos um link de redefinição para o seu e-mail"
      footer={
        <Link to="/login" className="text-primary hover:underline">
          Voltar para o login
        </Link>
      }
    >
      {forgot.isSuccess ? (
        <p className="text-sm text-muted-foreground">{forgot.data.message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@fortecontabilidade.com.br"
            />
          </div>

          {forgot.isError && (
            <p className="text-sm text-destructive">{(forgot.error as Error).message}</p>
          )}

          <Button type="submit" className="w-full" disabled={forgot.isPending}>
            {forgot.isPending ? 'Enviando…' : 'Enviar link'}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
