// Tipos do domínio — espelham o schema do Prisma no backend.

export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
export type Department = 'FISCAL' | 'CONTABIL' | 'PESSOAL' | 'SOCIETARIO' | 'FINANCEIRO';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
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
