import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Bookmark {
    uuid: string;
    title: string;
    date: string;
    time: string;
    url: string;
    tags: string[];
    selected?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class BookmarksStorageService {
    private readonly STORAGE_KEY = 'bookmarks';
    bookmarksChanged = new Subject<void>();

    async getAll(): Promise<Bookmark[]> {
        return new Promise<Bookmark[]>((resolve) => {
            chrome.storage.local.get([this.STORAGE_KEY], (result) => {
                resolve(result[this.STORAGE_KEY] ?? []);
            });
        });
    }

    private getInsertIndex(bookmarks: Bookmark[], bookmark: Bookmark): number {
        const newDateTime = new Date(`${bookmark.date}T${bookmark.time}`);
        return bookmarks.findIndex(b => {
            const bDateTime = new Date(`${b.date}T${b.time}`);
            return newDateTime.getTime() < bDateTime.getTime();
        });
    }

    async add(bookmark: Bookmark): Promise<void> {
        await this.removePastBookmarks();
        const bookmarks = await this.getAll();
        const insertIndex = this.getInsertIndex(bookmarks, bookmark);
        if (insertIndex === -1) {
            bookmarks.push(bookmark);
        } else {
            bookmarks.splice(insertIndex, 0, bookmark);
        }
        await new Promise<void>(resolve => {
            chrome.storage.local.set({ [this.STORAGE_KEY]: bookmarks }, () => {
                this.bookmarksChanged.next();
                resolve();
            });
        });
    }

    async delete(bookmark: Bookmark): Promise<void> {
        const bookmarks = await this.getAll();
        const index = bookmarks.findIndex(b => b.uuid === bookmark.uuid);
        if (index === -1)
            return;
        bookmarks.splice(index, 1);
        await new Promise<void>(resolve => {
            chrome.storage.local.set({ [this.STORAGE_KEY]: bookmarks }, () => {
                this.bookmarksChanged.next();
                resolve();
            });
        });
    }

    async clear(): Promise<void> {
        await new Promise<void>(resolve => {
            chrome.storage.local.remove(this.STORAGE_KEY, () => {
                this.bookmarksChanged.next();
                resolve();
            });
        });
    }

    /**
     * Removes bookmarks whose date and time are before now.
     */
    private async removePastBookmarks(): Promise<void> {
        const now = new Date();
        const bookmarks: Bookmark[] = await this.getAll();
        const filtered = bookmarks.filter(b => {
            const bDateTime = new Date(`${b.date}T${b.time}`);
            return bDateTime.getTime() >= now.getTime();
        });
        await new Promise<void>(resolve => {
            chrome.storage.local.set({ [this.STORAGE_KEY]: filtered }, () => {
                this.bookmarksChanged.next();
                resolve();
            });
        });
    }
}
