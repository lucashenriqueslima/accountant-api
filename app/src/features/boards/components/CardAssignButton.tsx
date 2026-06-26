import { useState } from 'react';
import { Check, UserPlus, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Card } from '@/types';
import { useUsers } from '@/features/users/api';
import { useAssignCard } from '../api';

interface CardAssignButtonProps {
  card: Card;
}

export function CardAssignButton({ card }: CardAssignButtonProps) {
  const [open, setOpen] = useState(false);
  const { data: users = [] } = useUsers();
  const assign = useAssignCard();

  const handleAssign = (assigneeId: string | null) => {
    assign.mutate(
      { cardId: card.id, assigneeId },
      { onSuccess: () => setOpen(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground"
          // Evita iniciar o drag do cartão ao clicar no botão.
          draggable={false}
          onDragStart={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          title="Atribuir a um usuário"
        >
          <UserPlus className="size-4" />
          <span className="sr-only">Atribuir a um usuário</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm p-0">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle className="text-base">Atribuir cartão</DialogTitle>
          <DialogDescription className="truncate">{card.title}</DialogDescription>
        </DialogHeader>

        <Command>
          <CommandInput placeholder="Buscar usuário..." />
          <CommandList>
            <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
            {card.assigneeId && (
              <CommandGroup>
                <CommandItem
                  value="remover atribuicao"
                  onSelect={() => handleAssign(null)}
                  className="text-muted-foreground"
                  disabled={assign.isPending}
                >
                  <UserX className="size-4" />
                  Remover atribuição
                </CommandItem>
              </CommandGroup>
            )}
            <CommandGroup heading="Usuários">
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.name}
                  onSelect={() => handleAssign(user.id)}
                  disabled={assign.isPending}
                >
                  <Check
                    className={cn(
                      'size-4',
                      card.assigneeId === user.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="truncate">{user.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
