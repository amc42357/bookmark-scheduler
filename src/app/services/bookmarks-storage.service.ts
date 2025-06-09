import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { getBookmarkDateTime } from '../utils/date-utils';
import type { Bookmark } from '../bookmarks-create/bookmarks-create.model';

@Injectable({
    providedIn: 'root'
})
export class BookmarksStorageService {
    private static readonly STORAGE_KEY = 'bookmarks'; // Key for Chrome local storage
    bookmarksChanged = new Subject<void>(); // Emits when bookmarks are updated

    /**
     * Retrieves all bookmarks from Chrome local storage.
     * @returns Promise resolving to an array of bookmarks (empty if none exist)
     */
    async getAll(): Promise<Bookmark[]> {
        return new Promise<Bookmark[]>((resolve) => {
            chrome.storage.local.get([BookmarksStorageService.STORAGE_KEY], (result) => {
                resolve(result[BookmarksStorageService.STORAGE_KEY] ?? []);
            });
        });
    }

    /**
     * Finds the index to insert a new bookmark so the list remains sorted by date and time.
     * @param bookmarks Current list of bookmarks
     * @param bookmark The new bookmark to insert
     * @returns Index at which to insert, or -1 to append at the end
     */
    private getInsertIndex(bookmarks: Bookmark[], bookmark: Bookmark): number {
        const newDateTime = getBookmarkDateTime(bookmark);
        return bookmarks.findIndex(b => newDateTime < getBookmarkDateTime(b));
    }

    /**
     * Adds a new bookmark, ensuring the list is sorted and past bookmarks are removed.
     * Notifies subscribers after saving.
     * @param bookmark The bookmark to add
     */
    async add(bookmark: Bookmark): Promise<void> {
        await this.removePastBookmarks();
        const bookmarks = await this.getAll();
        const insertIndex = this.getInsertIndex(bookmarks, bookmark);
        if (insertIndex === -1) {
            bookmarks.push(bookmark); // Append if no later bookmark exists
        } else {
            bookmarks.splice(insertIndex, 0, bookmark); // Insert at correct position
        }
        await this.saveBookmarks(bookmarks);
    }

    /**
     * Deletes a bookmark by its UUID and updates storage.
     * Notifies subscribers after saving.
     * @param bookmark The bookmark to delete
     */
    async delete(bookmark: Bookmark): Promise<void> {
        const bookmarks = (await this.getAll()).filter(b => b.uuid !== bookmark.uuid);
        await this.saveBookmarks(bookmarks);
    }

    /**
     * Removes all bookmarks from storage and notifies subscribers.
     */
    async clear(): Promise<void> {
        chrome.storage.local.remove(BookmarksStorageService.STORAGE_KEY, () => {
            this.bookmarksChanged.next();
        });
    }

    /**
     * Removes bookmarks scheduled before the current time and updates storage.
     * Notifies subscribers after saving.
     */
    private async removePastBookmarks(): Promise<void> {
        const now = new Date();
        const bookmarks = await this.getAll();
        await this.saveBookmarks(bookmarks.filter(b => getBookmarkDateTime(b) >= now));
    }

    /**
     * Saves the provided bookmarks array to storage and notifies subscribers.
     * @param bookmarks The array of bookmarks to save
     */
    private async saveBookmarks(bookmarks: Bookmark[]): Promise<void> {
        chrome.storage.local.set({ [BookmarksStorageService.STORAGE_KEY]: bookmarks }, () => {
            this.bookmarksChanged.next();
        });
    }
}
