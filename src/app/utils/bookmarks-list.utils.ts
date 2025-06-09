// Utility functions for bookmarks-list.component
import { Bookmark } from '../services/bookmarks-storage.service';

/**
 * Returns a sorted array of unique tags from a list of bookmarks.
 */
export function extractAllTags(bookmarks: Bookmark[]): string[] {
    const tagSet = new Set<string>();
    bookmarks.forEach(b => (b.tags ?? []).forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
}

/**
 * Removes all selected bookmarks from storage.
 */
export async function removeBookmarks(storage: any, bookmarks: Bookmark[]): Promise<void> {
    for (const b of bookmarks) {
        await storage.delete(b);
    }
}
