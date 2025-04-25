export type Category = 'inbox' | 'drafts' | 'sent' | 'trash';
export type Priority = 'high' | 'normal' | 'low';

export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
}

export interface Email {
  id: string;
  subject: string;
  sender: string;
  recipient: string;
  content: string;
  timestamp: string;
  attachments?: File[];
  aiGenerated?: boolean;
  read: boolean;
  thread: Message[];
  folder: Category;
  deletedAt?: number;
  priority: Priority;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
}
