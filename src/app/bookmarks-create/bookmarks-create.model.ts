// Bookmark type for strong typing
export type Recurrence = 'once' | 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';

export interface Bookmark {
    uuid: string;
    title: string;
    date: string;
    time: string;
    url: string;
    recurrence: Recurrence;
    tags: string[];
}
export const RECURRENCE_OPTIONS: Recurrence[] = [
    'once',
    'daily',
    'weekly',
    'bi-weekly',
    'monthly',
    'yearly',
] as const;

const ENTER_KEY_CODE = 13;
const COMMA_KEY_CODE = 188;
export const SEPARATOR_KEYS = [ENTER_KEY_CODE, COMMA_KEY_CODE];
