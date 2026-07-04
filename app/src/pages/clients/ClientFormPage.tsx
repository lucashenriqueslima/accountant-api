import { ArrowLeft, LayoutTemplate } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api';
import { CardTemplatesManagerDialog } from '@/features/card-templates/CardTemplatesManagerDialog';
import { useClient, useCreateClient, useUpdateClient, type ClientInput } from '@/features/clients/api';
import { taxRegimeOptions } from '@/features/clients/constants';
import { DocumentsSection } from '@/features/clients/components/DocumentsSection';
import type { TaxRegime } from '@/types';

const selectClass =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

export function ClientFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: existing } = useClient(id);
  const createClient = useCreateClient();
  const updateClient = useUpdateClient(id ?? '');

  const [form, setForm] = useState<ClientInput>({
    name: '',
    tradeName: '',
    document: '',
    taxRegime: 'SIMPLES_NACIONAL',
    email: '',
    phone: '',
    active: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        tradeName: existing.tradeName ?? '',
        document: existing.document,
        taxRegime: existing.taxRegime,
        email: existing.email ?? '',
        phone: existing.phone ?? '',
        active: existing.active,
      });
    }
  }, [existing]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isEdit) await updateClient.mutateAsync(form);
      else {
        const created = await createClient.mutateAsync(form);
        // Vai direto para a edição para permitir anexar documentos.
        navigate(`/clientes/${created.id}/editar`);
        return;
      }
      navigate('/clientes');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar');
    }
  };

  const pending = createClient.isPending || updateClient.isPending;

  return (
    <>
      <header className="flex items-center gap-3 border-b px-6 py-4">
        <Button asChild variant="ghost" size="icon">
          <Link to="/clientes">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">{isEdit ? 'Editar cliente' : 'Novo cliente'}</h1>
        {isEdit && existing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => setTemplatesOpen(true)}
          >
            <LayoutTemplate className="size-4" />
            Modelos de Tarefa
          </Button>
        )}
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl space-y-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Razão social / Nome</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tradeName">Nome fantasia</Label>
                <Input
                  id="tradeName"
                  value={form.tradeName}
                  onChange={(e) => setForm((f) => ({ ...f, tradeName: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="document">CNPJ / CPF</Label>
                <Input
                  id="document"
                  required
                  value={form.document}
                  onChange={(e) => setForm((f) => ({ ...f, document: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="taxRegime">Regime tributário</Label>
                <select
                  id="taxRegime"
                  value={form.taxRegime}
                  onChange={(e) => setForm((f) => ({ ...f, taxRegime: e.target.value as TaxRegime }))}
                  className={selectClass}
                >
                  {taxRegimeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                className="size-4 rounded border-input"
              />
              Cliente ativo
            </label>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? 'Salvando…' : 'Salvar'}
              </Button>
              <Button asChild type="button" variant="outline">
                <Link to="/clientes">Cancelar</Link>
              </Button>
            </div>
          </form>

          {isEdit && existing ? (
            <div className="border-t pt-6">
              <DocumentsSection clientId={existing.id} documents={existing.documents} editable />
            </div>
          ) : (
            !isEdit && (
              <p className="border-t pt-6 text-sm text-muted-foreground">
                Salve o cliente para habilitar o envio de documentos.
              </p>
            )
          )}
        </div>
      </div>

      {isEdit && existing && (
        <CardTemplatesManagerDialog
          open={templatesOpen}
          onOpenChange={setTemplatesOpen}
          clientId={existing.id}
          clientName={existing.tradeName ?? existing.name}
        />
      )}
    </>
  );
}
