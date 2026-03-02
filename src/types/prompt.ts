export interface Prompt {
  id: string;
  title: string;
  tags: string[];
  content: string;
  isPinned: boolean;
  pinnedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
