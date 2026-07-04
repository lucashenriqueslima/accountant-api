// Tipos do domínio — espelham o schema do Prisma no backend.

export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
export type Department = 'FISCAL' | 'CONTABIL' | 'PESSOAL' | 'SOCIETARIO' | 'FINANCEIRO';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type CardFrequency = 'MONTHLY' | 'YEARLY';
export type TaxRegime = 'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL' | 'MEI';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
  active: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Client {
  id: string;
  name: string;
  tradeName?: string | null;
  document: string;
  taxRegime: TaxRegime;
  email?: string | null;
  phone?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

// Título pré-salvo para agilizar a criação de tarefas.
export interface CardType {
  id: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
}

// Modelo de card — tarefa recorrente que o cron transforma em cartões
// todo dia às 00:01 (coluna "A fazer" do quadro, sem responsável).
export interface CardTemplate {
  id: string;
  title: string;
  description?: string | null;
  priority: Priority;
  frequency: CardFrequency;
  active: boolean;
  boardId: string;
  board?: { id: string; name: string } | null;
  clientId?: string | null;
  client?: { id: string; name: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CardLabel {
  cardId: string;
  labelId: string;
  label: Label;
}

export interface Card {
  id: string;
  title: string;
  description?: string | null;
  position: number;
  priority: Priority;
  dueDate?: string | null;
  completedAt?: string | null;
  deletedAt?: string | null;
  columnId: string;
  column?: { id: string; name: string; boardId: string } | null;
  clientId?: string | null;
  client?: Client | null;
  assigneeId?: string | null;
  assignee?: User | null;
  labels: CardLabel[];
}

export type CardAction = 'CREATED' | 'UPDATED' | 'MOVED' | 'ASSIGNED' | 'DELETED';

export interface CardActivity {
  id: string;
  action: CardAction;
  detail?: string | null;
  createdAt: string;
  user?: { id: string; name: string } | null;
}

export interface CardWithActivities extends Card {
  activities: CardActivity[];
}

// Anexo de uma tarefa. Quando `commentId` é nulo, pertence à própria tarefa
// (aba "Anexos"); caso contrário, pertence a um comentário.
export interface CardAttachment {
  id: string;
  cardId: string;
  commentId?: string | null;
  filename: string;
  mimeType?: string | null;
  size?: number | null;
  url: string;
  createdAt: string;
  uploadedBy?: { id: string; name: string } | null;
}

export interface CardComment {
  id: string;
  cardId: string;
  body: string; // HTML (rich text)
  createdAt: string;
  updatedAt: string;
  author?: { id: string; name: string } | null;
  attachments: CardAttachment[];
}

export type CardEmailStatus = 'SENT' | 'FAILED';

export interface CardEmail {
  id: string;
  cardId: string;
  recipients: string; // destinatários separados por vírgula
  cc?: string | null;
  subject: string;
  body: string; // HTML
  attachments?: string | null; // nomes dos arquivos, separados por vírgula
  status: CardEmailStatus;
  error?: string | null;
  createdAt: string;
  sentBy?: { id: string; name: string } | null;
}

export interface ClientDocument {
  id: string;
  filename: string;
  mimeType?: string | null;
  size?: number | null;
  url: string;
  createdAt: string;
  uploadedBy?: { id: string; name: string } | null;
}

export interface ClientWithDocuments extends Client {
  documents: ClientDocument[];
}

export interface Column {
  id: string;
  name: string;
  position: number;
  color?: string | null;
  boardId: string;
  cards: Card[];
}

export interface Board {
  id: string;
  name: string;
  description?: string | null;
  department: Department;
  position: number;
}

export interface BoardWithColumns extends Board {
  columns: Column[];
}
