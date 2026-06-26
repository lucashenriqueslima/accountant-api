import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ClientsTable } from '@/features/clients/components/ClientsTable';
import { useClients } from '@/features/clients/api';

export function ClientsPage() {
  const { data: clients, isLoading, isError, error } = useClients();

  return (
    <>
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Empresas e pessoas atendidas pelo escritório.
          </p>
        </div>
        <Button asChild>
          <Link to="/clientes/novo">
            <Plus className="size-4" />
            Novo cliente
          </Link>
        </Button>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : isError ? (
          <p className="text-sm text-destructive">Erro ao carregar: {(error as Error).message}</p>
        ) : (
          <ClientsTable data={clients ?? []} />
        )}
      </div>
    </>
  );
}
