import { Mail, MessageSquare, Paperclip } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCard } from './api';
import { AttachmentsTab } from './card-detail/AttachmentsTab';
import { CommentsTab } from './card-detail/CommentsTab';
import { EmailsTab } from './card-detail/EmailsTab';
import { isDoneColumnName } from './status';

interface CardDetailDialogProps {
  cardId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/// Modal de detalhes da tarefa (estilo Trello): comentários, anexos e e-mails.
export function CardDetailDialog({ cardId, open, onOpenChange }: CardDetailDialogProps) {
  const { data: card, isLoading } = useCard(open && cardId ? cardId : undefined);
  const isDone = isDoneColumnName(card?.column?.name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="flex max-h-[90dvh] max-w-3xl flex-col gap-0 overflow-hidden p-0"
      >
        {!card ? (
          <div className="p-6">
            <DialogHeader className="text-left">
              <DialogTitle>Tarefa</DialogTitle>
            </DialogHeader>
            <p className="mt-4 text-sm text-muted-foreground">
              {isLoading ? 'Carregando…' : 'Tarefa não encontrada.'}
            </p>
          </div>
        ) : (
          <>
            <DialogHeader className="border-b px-4 py-4 text-left sm:px-6">
              <DialogTitle className="pr-8">{card.title}</DialogTitle>
              {card.column && (
                <p className="text-xs text-muted-foreground">
                  na lista <span className="font-medium text-foreground">{card.column.name}</span>
                </p>
              )}
            </DialogHeader>

            <Tabs defaultValue="comments" className="flex min-h-0 flex-1 flex-col">
              <div className="border-b px-4 py-2 sm:px-6">
                <TabsList>
                  <TabsTrigger value="comments">
                    <MessageSquare className="size-4" />
                    Comentários
                  </TabsTrigger>
                  <TabsTrigger value="attachments">
                    <Paperclip className="size-4" />
                    Anexos
                  </TabsTrigger>
                  <TabsTrigger value="emails">
                    <Mail className="size-4" />
                    E-mail
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
                <TabsContent value="comments">
                  <CommentsTab cardId={card.id} />
                </TabsContent>
                <TabsContent value="attachments">
                  <AttachmentsTab cardId={card.id} />
                </TabsContent>
                <TabsContent value="emails">
                  <EmailsTab card={card} isDone={isDone} />
                </TabsContent>
              </div>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
