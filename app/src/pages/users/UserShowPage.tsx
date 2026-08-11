import { ArrowLeft, Pencil } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUser } from '@/features/users/api';
import { roleLabels, roleStyles } from '@/features/users/constants';

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-b py-3 last:border-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm">{value}</dd>
    </div>
  );
}

export function UserShowPage() {
  const { id } = useParams();
  const { data: user, isLoading, isError } = useUser(id);

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/usuarios">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">Detalhes do usuário</h1>
        </div>
        {user && (
          <Button asChild variant="outline">
            <Link to={`/usuarios/${user.id}/editar`}>
              <Pencil className="size-4" />
              Editar
            </Link>
          </Button>
        )}
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : isError || !user ? (
          <p className="text-sm text-destructive">Usuário não encontrado.</p>
        ) : (
          <dl className="max-w-lg rounded-xl border px-5">
            <Field label="Nome" value={user.name} />
            <Field label="E-mail" value={user.email} />
            <Field
              label="Papel"
              value={
                <Badge className={cn('border-transparent', roleStyles[user.role])}>
                  {roleLabels[user.role]}
                </Badge>
              }
            />
            <Field
              label="Status"
              value={
                <Badge variant={user.active ? 'default' : 'outline'}>
                  {user.active ? 'Ativo' : 'Inativo'}
                </Badge>
              }
            />
          </dl>
        )}
      </div>
    </>
  );
}
