// Utility functions for date and time formatting
export function getTodayDate(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

export function getCurrentTime(): string {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${min}`;
}

/**
 * Helper to get a Date object from a bookmark's date and time.
 */
export function getBookmarkDateTime(bookmark: { date: string; time: string }): Date {
    // Handles both 'YYYY-MM-DDTHH:mm' and 'YYYY-MM-DDTHH:mm:ss' formats
    return new Date(`${bookmark.date}T${bookmark.time}`);
}
