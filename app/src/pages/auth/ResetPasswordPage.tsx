import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthShell } from '@/features/auth/AuthShell';
import { useResetPassword } from '@/features/auth/api';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const reset = useResetPassword();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (password.length < 6) {
      setLocalError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (password !== confirm) {
      setLocalError('As senhas não conferem');
      return;
    }
    reset.mutate({ token, password });
  };

  if (!token) {
    return (
      <AuthShell title="Link inválido" subtitle="O link de redefinição está incompleto">
        <p className="text-sm text-muted-foreground">
          Solicite um novo link em{' '}
          <Link to="/forgot-password" className="text-primary hover:underline">
            recuperar senha
          </Link>
          .
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Nova senha"
      subtitle="Defina a sua nova senha de acesso"
      footer={
        <Link to="/login" className="text-primary hover:underline">
          Voltar para o login
        </Link>
      }
    >
      {reset.isSuccess ? (
        <p className="text-sm text-muted-foreground">
          {reset.data.message}{' '}
          <Link to="/login" className="text-primary hover:underline">
            Entrar agora
          </Link>
          .
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">Nova senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirmar senha</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          {(localError || reset.isError) && (
            <p className="text-sm text-destructive">
              {localError ?? (reset.error as Error).message}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={reset.isPending}>
            {reset.isPending ? 'Salvando…' : 'Redefinir senha'}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
