// Bookmark type for strong typing
export interface Bookmark {
    uuid: string;
    title: string;
    date: string;
    time: string;
    url: string;
    recurrence: string;
    tags: string[];
}
export const RECURRENCE_OPTIONS = [
    'once',
    'daily',
    'weekly',
    'bi-weekly',
    'monthly',
] as const;
