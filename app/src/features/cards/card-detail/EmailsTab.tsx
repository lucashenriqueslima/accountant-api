import { ChevronDown, Lock, Mail, Paperclip, Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HtmlContent, RichTextEditor } from '@/components/ui/rich-text-editor';
import { ApiError } from '@/lib/api';
import { htmlToText } from '@/lib/sanitize-html';
import type { CardEmail, CardWithActivities } from '@/types';
import { useCardAttachments, useCardEmails, useSendCardEmail } from '../thread-api';
import { formatDateTime, formatSize } from './utils';

function parseRecipients(value: string): string[] {
  return value
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

interface EmailsTabProps {
  card: CardWithActivities;
  isDone: boolean;
}

export function EmailsTab({ card, isDone }: EmailsTabProps) {
  const { data: emails, isLoading } = useCardEmails(card.id);

  return (
    <div className="space-y-5">
      {isDone ? (
        <EmailComposer card={card} />
      ) : (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <Lock className="mt-0.5 size-4 shrink-0" />
          <p>O envio de e-mail fica disponível quando a tarefa estiver na coluna “Concluído”.</p>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">E-mails enviados</h3>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : !emails || emails.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum e-mail enviado.</p>
        ) : (
          <ul className="space-y-2">
            {emails.map((email) => (
              <SentEmailRow key={email.id} email={email} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function EmailComposer({ card }: { card: CardWithActivities }) {
  const { data: attachments } = useCardAttachments(card.id);
  const sendEmail = useSendCardEmail(card.id);

  const [to, setTo] = useState(card.client?.email ?? '');
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState(card.title);
  const [body, setBody] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const recipients = parseRecipients(to);
  const canSend =
    recipients.length > 0 && subject.trim().length > 0 && htmlToText(body).length > 0;

  const toggle = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSend = async () => {
    setError(null);
    setSent(false);
    try {
      await sendEmail.mutateAsync({
        to: recipients,
        cc: parseRecipients(cc),
        subject: subject.trim(),
        body,
        attachmentIds: selectedIds,
      });
      setSent(true);
      setBody('');
      setSelectedIds([]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível enviar o e-mail');
    }
  };

  return (
    <div className="space-y-3 rounded-xl border p-4">
      <div className="flex items-center gap-2">
        <Mail className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Novo e-mail</h3>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email-to">Para</Label>
        <Input
          id="email-to"
          placeholder="cliente@exemplo.com, outro@exemplo.com"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email-cc">Cc (opcional)</Label>
        <Input id="email-cc" value={cc} onChange={(e) => setCc(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email-subject">Assunto</Label>
        <Input id="email-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label>Mensagem</Label>
        <RichTextEditor value={body} onChange={setBody} placeholder="Escreva a mensagem…" />
      </div>

      {attachments && attachments.length > 0 && (
        <div className="space-y-1.5">
          <Label>Anexos da tarefa</Label>
          <ul className="divide-y rounded-md border">
            {attachments.map((att) => (
              <li key={att.id}>
                <label className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={selectedIds.includes(att.id)}
                    onChange={() => toggle(att.id)}
                  />
                  <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{att.filename}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatSize(att.size)}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      {sent && <p className="text-sm text-emerald-600">E-mail enviado com sucesso.</p>}

      <div className="flex justify-end">
        <Button type="button" size="sm" disabled={!canSend || sendEmail.isPending} onClick={handleSend}>
          <Send className="size-4" />
          {sendEmail.isPending ? 'Enviando…' : 'Enviar e-mail'}
        </Button>
      </div>
    </div>
  );
}

function SentEmailRow({ email }: { email: CardEmail }) {
  const [open, setOpen] = useState(false);
  const failed = email.status === 'FAILED';

  return (
    <li className="rounded-lg border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left"
      >
        <Mail className="size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{email.subject}</p>
          <p className="truncate text-xs text-muted-foreground">
            Para {email.recipients} · {formatDateTime(email.createdAt)}
            {email.sentBy ? ` · ${email.sentBy.name}` : ''}
          </p>
        </div>
        <span
          className={
            failed
              ? 'shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700'
              : 'shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700'
          }
        >
          {failed ? 'Falhou' : 'Enviado'}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="space-y-2 border-t px-4 py-3 text-sm">
          {email.cc && (
            <p className="text-xs text-muted-foreground">Cc: {email.cc}</p>
          )}
          <HtmlContent html={email.body} />
          {email.attachments && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Paperclip className="size-3" />
              {email.attachments}
            </p>
          )}
          {failed && email.error && (
            <p className="text-xs text-destructive">Erro: {email.error}</p>
          )}
        </div>
      )}
    </li>
  );
}
