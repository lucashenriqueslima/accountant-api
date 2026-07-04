import { Download, FileText, Trash2, Upload } from 'lucide-react';
import { useRef, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  useCardAttachments,
  useDeleteCardAttachment,
  useUploadCardAttachment,
} from '../thread-api';
import { formatDateTime, formatSize } from './utils';

export function AttachmentsTab({ cardId }: { cardId: string }) {
  const { data: attachments, isLoading } = useCardAttachments(cardId);
  const upload = useUploadCardAttachment(cardId);
  const remove = useDeleteCardAttachment(cardId);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload.mutate(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Anexos da tarefa</h3>
        <input ref={inputRef} type="file" className="hidden" onChange={handleFile} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending}
        >
          <Upload className="size-4" />
          {upload.isPending ? 'Enviando…' : 'Adicionar'}
        </Button>
      </div>

      {upload.isError && (
        <p className="text-sm text-destructive">{(upload.error as Error).message}</p>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : !attachments || attachments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum anexo na tarefa.</p>
      ) : (
        <ul className="divide-y rounded-xl border">
          {attachments.map((att) => (
            <li key={att.id} className="flex items-center gap-3 px-4 py-2.5">
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{att.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(att.size)}
                  {att.uploadedBy ? ` · ${att.uploadedBy.name}` : ''} · {formatDateTime(att.createdAt)}
                </p>
              </div>
              <Button asChild variant="ghost" size="icon" title="Abrir">
                <a href={att.url} target="_blank" rel="noreferrer">
                  <Download className="size-4" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Excluir"
                disabled={remove.isPending}
                onClick={() => remove.mutate(att.id)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
