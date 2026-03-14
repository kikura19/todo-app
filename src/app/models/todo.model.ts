export enum Category {
  WORK = 'WORK',
  PERSONAL = 'PERSONAL',
  STUDY = 'STUDY',
  OTHER = 'OTHER'
}

export interface Todo {
  id: number | null;
  task: string;
  isCompleted: boolean;
  category: Category;
}