import { Building2, Check, ChevronsUpDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import type { ClientOption } from '../filters';

interface ClientFilterComboboxProps {
  /// Empresas que podem ser filtradas (as que têm cartões no quadro).
  options: ClientOption[];
  /// Ids das empresas selecionadas; vazio = todas.
  value: string[];
  onChange: (clientIds: string[]) => void;
  className?: string;
}

/**
 * Combobox de seleção múltipla para filtrar o quadro por empresa.
 * Busca por nome e marca/desmarca cada empresa; nenhuma marcada = todas.
 */
export function ClientFilterCombobox({
  options,
  value,
  onChange,
  className,
}: ClientFilterComboboxProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Nomes das empresas já vistas: ao trocar de quadro, uma empresa selecionada
  // pode sumir das opções — guardamos o nome para ela seguir visível (e removível).
  const [knownNames, setKnownNames] = useState<Record<string, string>>({});
  useEffect(() => {
    setKnownNames((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const option of options) {
        if (next[option.id] !== option.name) {
          next[option.id] = option.name;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [options]);

  // Fecha a lista ao clicar fora do componente.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const items = useMemo(() => {
    const byId = new Map(options.map((option) => [option.id, option.name]));
    for (const id of value) {
      if (!byId.has(id)) byId.set(id, knownNames[id] ?? 'Empresa');
    }
    return [...byId]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [options, value, knownNames]);

  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((current) => current !== id) : [...value, id]);

  const label =
    value.length === 0
      ? 'Todas as empresas'
      : value.length === 1
        ? (items.find((item) => item.id === value[0])?.name ?? '1 empresa')
        : `${value.length} empresas`;

  return (
    <div
      ref={wrapperRef}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setOpen(false);
      }}
      className={cn('relative', className)}
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Filtrar por empresa"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <Building2 className="size-4 shrink-0 text-muted-foreground" />
        <span className={cn('truncate', value.length === 0 && 'text-muted-foreground')}>
          {label}
        </span>
        <ChevronsUpDown className="ml-auto size-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-full min-w-56 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
          <Command>
            <CommandInput placeholder="Buscar empresa…" autoFocus />
            <CommandList>
              <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
              <CommandGroup>
                {items.map((item) => {
                  const selected = value.includes(item.id);
                  return (
                    <CommandItem
                      key={item.id}
                      // O id evita colisão entre empresas de mesmo nome fantasia.
                      value={`${item.name} ${item.id}`}
                      onSelect={() => toggle(item.id)}
                      className="cursor-pointer"
                    >
                      <span
                        className={cn(
                          'flex size-4 shrink-0 items-center justify-center rounded border',
                          selected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-input',
                        )}
                      >
                        <Check className={cn('size-3', !selected && 'opacity-0')} />
                      </span>
                      <span className="truncate">{item.name}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>

              {value.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      value="limpar-filtro-empresa"
                      onSelect={() => onChange([])}
                      className="cursor-pointer justify-center text-muted-foreground"
                    >
                      Limpar filtro
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
