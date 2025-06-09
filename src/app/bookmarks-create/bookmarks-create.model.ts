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

const ENTER_KEY_CODE = 13;
const COMMA_KEY_CODE = 188;
export const SEPARATOR_KEYS = [ENTER_KEY_CODE, COMMA_KEY_CODE];
