import { Paperclip, Send, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { HtmlContent, RichTextEditor } from '@/components/ui/rich-text-editor';
import { useAuth } from '@/features/auth/AuthContext';
import { htmlToText } from '@/lib/sanitize-html';
import type { CardAttachment } from '@/types';
import {
  useCardComments,
  useCreateCardComment,
  useDeleteCardComment,
} from '../thread-api';
import { formatDateTime, initials } from './utils';

/// Pílula compacta para um anexo de comentário (abre/baixa o arquivo).
function AttachmentChip({ attachment }: { attachment: CardAttachment }) {
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noreferrer"
      title={attachment.filename}
      className="inline-flex max-w-[200px] items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-1 text-xs transition-colors hover:bg-muted"
    >
      <Paperclip className="size-3 shrink-0" />
      <span className="truncate">{attachment.filename}</span>
    </a>
  );
}

export function CommentsTab({ cardId }: { cardId: string }) {
  const { user, hasRole } = useAuth();
  const { data: comments, isLoading } = useCardComments(cardId);
  const createComment = useCreateCardComment(cardId);
  const deleteComment = useDeleteCardComment(cardId);

  const [body, setBody] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const canSubmit = htmlToText(body).length > 0 && !createComment.isPending;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await createComment.mutateAsync({ body, files });
    setBody('');
    setFiles([]);
  };

  return (
    <div className="space-y-5">
      {/* Composição de novo comentário */}
      <div className="space-y-2">
        <RichTextEditor
          value={body}
          onChange={setBody}
          placeholder="Escrever um comentário…"
          ariaLabel="Novo comentário"
          onPickFiles={(picked) => setFiles((prev) => [...prev, ...picked])}
        />

        {files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {files.map((file, i) => (
              <span
                key={`${file.name}-${i}`}
                className="inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-1 text-xs"
              >
                <Paperclip className="size-3" />
                <span className="max-w-[160px] truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Remover ${file.name}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end">
          <Button type="button" size="sm" disabled={!canSubmit} onClick={handleSubmit}>
            <Send className="size-4" />
            {createComment.isPending ? 'Enviando…' : 'Comentar'}
          </Button>
        </div>

        {createComment.isError && (
          <p className="text-sm text-destructive">{(createComment.error as Error).message}</p>
        )}
      </div>

      {/* Lista de comentários */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : !comments || comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum comentário ainda.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => {
            const canDelete = comment.author?.id === user?.id || hasRole('ADMIN');
            return (
              <li key={comment.id} className="flex gap-3">
                <Avatar className="size-7 shrink-0">
                  <AvatarFallback className="text-[10px]">
                    {comment.author ? initials(comment.author.name) : '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{comment.author?.name ?? 'Usuário'}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(comment.createdAt)}
                    </span>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => deleteComment.mutate(comment.id)}
                        className="ml-auto text-muted-foreground hover:text-destructive"
                        aria-label="Excluir comentário"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="mt-1 rounded-lg border bg-card px-3 py-2">
                    <HtmlContent html={comment.body} />
                    {comment.attachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {comment.attachments.map((att) => (
                          <AttachmentChip key={att.id} attachment={att} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
