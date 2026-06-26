import { Download, FileText, Trash2, Upload } from 'lucide-react';
import { useRef, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { useDeleteDocument, useUploadDocument } from '@/features/clients/api';
import type { ClientDocument } from '@/types';

function formatSize(bytes?: number | null) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

interface DocumentsSectionProps {
  clientId: string;
  documents: ClientDocument[];
  editable?: boolean;
}

export function DocumentsSection({ clientId, documents, editable = false }: DocumentsSectionProps) {
  const upload = useUploadDocument(clientId);
  const remove = useDeleteDocument(clientId);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload.mutate(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Documentos</h3>
        {editable && (
          <>
            <input ref={inputRef} type="file" className="hidden" onChange={handleFile} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={upload.isPending}
            >
              <Upload className="size-4" />
              {upload.isPending ? 'Enviando…' : 'Enviar arquivo'}
            </Button>
          </>
        )}
      </div>

      {upload.isError && (
        <p className="text-sm text-destructive">{(upload.error as Error).message}</p>
      )}

      {documents.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum documento enviado.</p>
      ) : (
        <ul className="divide-y rounded-xl border">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center gap-3 px-4 py-2.5">
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{doc.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(doc.size)}
                  {doc.uploadedBy ? ` · ${doc.uploadedBy.name}` : ''} ·{' '}
                  {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <Button asChild variant="ghost" size="icon" title="Abrir">
                <a href={doc.url} target="_blank" rel="noreferrer">
                  <Download className="size-4" />
                </a>
              </Button>
              {editable && (
                <Button
                  variant="ghost"
                  size="icon"
                  title="Excluir"
                  onClick={() => remove.mutate(doc.id)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
