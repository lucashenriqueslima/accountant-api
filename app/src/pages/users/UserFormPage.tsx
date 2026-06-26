import { ArrowLeft } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api';
import {
  useCreateUser,
  useUpdateUser,
  useUser,
  type UserInput,
} from '@/features/users/api';
import { roleOptions } from '@/features/users/constants';
import type { Role } from '@/types';

export function UserFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: existing } = useUser(id);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser(id ?? '');

  const [form, setForm] = useState<UserInput>({
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    active: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        email: existing.email,
        password: '',
        role: existing.role,
        active: existing.active,
      });
    }
  }, [existing]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isEdit) {
        const payload: Partial<UserInput> = {
          name: form.name,
          email: form.email,
          role: form.role,
          active: form.active,
        };
        if (form.password) payload.password = form.password;
        await updateUser.mutateAsync(payload);
      } else {
        await createUser.mutateAsync(form);
      }
      navigate('/usuarios');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar');
    }
  };

  const pending = createUser.isPending || updateUser.isPending;

  return (
    <>
      <header className="flex items-center gap-3 border-b px-6 py-4">
        <Button asChild variant="ghost" size="icon">
          <Link to="/usuarios">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">{isEdit ? 'Editar usuário' : 'Novo usuário'}</h1>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">
              Senha {isEdit && <span className="text-muted-foreground">(deixe em branco para manter)</span>}
            </Label>
            <Input
              id="password"
              type="password"
              required={!isEdit}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role">Papel</Label>
            <select
              id="role"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              className="size-4 rounded border-input"
            />
            Usuário ativo
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? 'Salvando…' : 'Salvar'}
            </Button>
            <Button asChild type="button" variant="outline">
              <Link to="/usuarios">Cancelar</Link>
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
