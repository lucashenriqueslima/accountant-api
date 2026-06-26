import { ArrowLeft, Pencil } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useClient } from '@/features/clients/api';
import { DocumentsSection } from '@/features/clients/components/DocumentsSection';
import { taxRegimeLabels } from '@/features/boards/constants';

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-b py-3 last:border-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm">{value}</dd>
    </div>
  );
}

export function ClientShowPage() {
  const { id } = useParams();
  const { data: client, isLoading, isError } = useClient(id);

  return (
    <>
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/clientes">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">Detalhes do cliente</h1>
        </div>
        {client && (
          <Button asChild variant="outline">
            <Link to={`/clientes/${client.id}/editar`}>
              <Pencil className="size-4" />
              Editar
            </Link>
          </Button>
        )}
      </header>

      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : isError || !client ? (
          <p className="text-sm text-destructive">Cliente não encontrado.</p>
        ) : (
          <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
            <section>
              <h2 className="mb-2 text-sm font-semibold">{client.tradeName ?? client.name}</h2>
              <dl className="rounded-xl border px-5">
                <Field label="Razão social / Nome" value={client.name} />
                <Field label="CNPJ / CPF" value={client.document} />
                <Field label="Regime" value={taxRegimeLabels[client.taxRegime]} />
                <Field label="E-mail" value={client.email || '—'} />
                <Field label="Telefone" value={client.phone || '—'} />
                <Field
                  label="Status"
                  value={
                    <Badge variant={client.active ? 'default' : 'outline'}>
                      {client.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  }
                />
              </dl>
            </section>

            <section>
              <DocumentsSection clientId={client.id} documents={client.documents} />
            </section>
          </div>
        )}
      </div>
    </>
  );
}
