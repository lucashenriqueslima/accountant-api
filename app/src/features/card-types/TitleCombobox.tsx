import { Command as CommandPrimitive } from 'cmdk';
import { Check, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import type { CardType } from '@/types';

interface TitleComboboxProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  cardTypes: CardType[];
  /** Abre a modal de gerenciamento de tipos de tarefa. */
  onManage: () => void;
  required?: boolean;
}

/**
 * Campo de título que se comporta como um combobox: o usuário digita livremente
 * e os tipos de tarefa (títulos pré-salvos) aparecem como sugestões para seleção.
 * Qualquer texto livre — que não seja um tipo salvo — também é aceito.
 */
export function TitleCombobox({
  id,
  value,
  onChange,
  cardTypes,
  onManage,
  required,
}: TitleComboboxProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fecha a lista de sugestões ao clicar fora do componente.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <CommandPrimitive ref={wrapperRef} className="relative overflow-visible bg-transparent">
      <div className="flex items-center rounded-md border border-input shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring">
        <CommandPrimitive.Input
          id={id}
          value={value}
          onValueChange={(next) => {
            onChange(next);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setOpen(false);
          }}
          required={required}
          autoComplete="off"
          placeholder="Digite ou selecione um título…"
          className="flex h-9 w-full bg-transparent px-3 py-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Gerenciar tipos de tarefa"
          onClick={() => {
            setOpen(false);
            onManage();
          }}
          className="mr-0.5 size-8 shrink-0 text-muted-foreground"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {open && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
          <CommandList>
            <CommandEmpty>
              Nenhum tipo encontrado. Continue digitando para um título livre.
            </CommandEmpty>
            <CommandGroup heading="Tipos de tarefa">
              {cardTypes.map((type) => (
                <CommandItem
                  key={type.id}
                  value={type.title}
                  onSelect={() => {
                    onChange(type.title);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn('mr-2 size-4', value === type.title ? 'opacity-100' : 'opacity-0')}
                  />
                  {type.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </div>
      )}
    </CommandPrimitive>
  );
}
