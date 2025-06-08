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

    getAll(): Bookmark[] {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    private getInsertIndex(bookmarks: Bookmark[], bookmark: Bookmark): number {
        const newDateTime = new Date(`${bookmark.date}T${bookmark.time}`);
        return bookmarks.findIndex(b => {
            const bDateTime = new Date(`${b.date}T${b.time}`);
            return newDateTime.getTime() < bDateTime.getTime();
        });
    }

    add(bookmark: Bookmark): void {
        const bookmarks = this.getAll();
        const insertIndex = this.getInsertIndex(bookmarks, bookmark);
        if (insertIndex === -1) {
            bookmarks.push(bookmark);
        } else {
            bookmarks.splice(insertIndex, 0, bookmark);
        }
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookmarks));
        this.bookmarksChanged.next();
    }

    delete(bookmark: Bookmark): void {
        const bookmarks = this.getAll();
        const index = bookmarks.findIndex(b => b.uuid === bookmark.uuid);
        if (index === -1)
            return;
        bookmarks.splice(index, 1);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookmarks));
        this.bookmarksChanged.next();
    }

    clear(): void {
        localStorage.removeItem(this.STORAGE_KEY);
        this.bookmarksChanged.next();
    }
}
