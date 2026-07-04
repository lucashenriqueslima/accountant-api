import { Bold, Italic, List, ListOrdered, Paperclip } from 'lucide-react';
import { useEffect, useRef, type ChangeEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/sanitize-html';

// Estilos compartilhados para restaurar marcadores de lista (sem plugin de tipografia).
const richTextProse =
  'text-sm leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  /// Quando definido, exibe um botão de anexo na toolbar com os arquivos escolhidos.
  onPickFiles?: (files: File[]) => void;
  /// Restringe os tipos aceitos pelo seletor de arquivos (atributo `accept`).
  accept?: string;
}

/// Editor rich text leve, sem dependências (bold, itálico e listas via execCommand).
export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  ariaLabel,
  onPickFiles,
  accept,
}: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincroniza o DOM com `value` apenas quando o editor não está em foco
  // (ex.: limpeza externa após o envio), evitando reposicionar o cursor ao digitar.
  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.innerHTML !== value) {
      el.innerHTML = value;
    }
  }, [value]);

  const emit = () => {
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const exec = (command: string) => {
    document.execCommand(command, false);
    ref.current?.focus();
    emit();
  };

  const handlePickFiles = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) onPickFiles?.(Array.from(e.target.files));
    e.target.value = '';
  };

  const isEmpty = !value || value === '<br>' || value === '<div><br></div>';

  return (
    <div
      className={cn(
        'rounded-md border border-input bg-transparent shadow-sm focus-within:ring-1 focus-within:ring-ring',
        className,
      )}
    >
      <div className="flex items-center gap-0.5 border-b px-1.5 py-1">
        <ToolbarButton label="Negrito" onClick={() => exec('bold')}>
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Itálico" onClick={() => exec('italic')}>
          <Italic className="size-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-border" aria-hidden />
        <ToolbarButton label="Lista" onClick={() => exec('insertUnorderedList')}>
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Lista numerada" onClick={() => exec('insertOrderedList')}>
          <ListOrdered className="size-4" />
        </ToolbarButton>
        {onPickFiles && (
          <>
            <span className="mx-1 h-5 w-px bg-border" aria-hidden />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={accept}
              className="hidden"
              onChange={handlePickFiles}
            />
            <ToolbarButton label="Anexar arquivo" onClick={() => fileInputRef.current?.click()}>
              <Paperclip className="size-4" />
            </ToolbarButton>
          </>
        )}
      </div>

      <div className="relative">
        {isEmpty && placeholder && (
          <span className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground">
            {placeholder}
          </span>
        )}
        <div
          ref={ref}
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label={ariaLabel}
          onInput={emit}
          className={cn(
            'min-h-[88px] px-3 py-2 focus:outline-none',
            richTextProse,
          )}
        />
      </div>
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      // onMouseDown + preventDefault preserva a seleção antes do execCommand.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="inline-flex size-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}

/// Renderiza HTML de rich text já sanitizado, com os estilos de lista/link.
export function HtmlContent({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn(richTextProse, className)}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
