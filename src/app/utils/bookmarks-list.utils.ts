// Utility functions for bookmarks-list.component
import type { Bookmark } from '../bookmarks-create/bookmarks-create.model';

/**
 * Returns a sorted array of unique tags from a list of bookmarks.
 */
export function extractAllTags(bookmarks: Bookmark[]): string[] {
    return Array.from(
        new Set(bookmarks.flatMap(b => b.tags ?? []))
    ).sort((a, b) => a.localeCompare(b));
}

/**
 * Removes all selected bookmarks from storage.
 */
export async function removeBookmarks(storage: any, bookmarks: Bookmark[]): Promise<void> {
    for (const b of bookmarks) {
        await storage.delete(b);
    }
}
