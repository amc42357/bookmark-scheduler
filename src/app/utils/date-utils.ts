import type { Bookmark } from '../bookmarks-create/bookmarks-create.model';

// Utility functions for date and time formatting

/**
 * Returns today's date as a string in 'YYYY-MM-DD' format.
 */
export function getTodayDate(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * Returns the current time as a string in 'HH:mm' format (24-hour clock).
 */
export function getCurrentTime(): string {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${min}`;
}

/**
 * Constructs a Date object from a bookmark's date and time fields.
 * Accepts date in 'YYYY-MM-DD' and time in 'HH:mm' or 'HH:mm:ss' format.
 * @param bookmark - An object with at least 'date' and 'time' string properties (Partial<Bookmark>).
 * @returns Date object representing the combined date and time.
 */
export function getBookmarkDateTime(bookmark: Partial<Bookmark>): Date {
    return new Date(`${bookmark.date}T${bookmark.time}`);
}
