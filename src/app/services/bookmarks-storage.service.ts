import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Bookmark {
    title: string;
    date: string;
    time: string;
    url: string;
    tags: string[]; // Added tags property
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

    add(bookmark: Bookmark): void {
        const bookmarks = this.getAll();
        bookmarks.push(bookmark);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookmarks));
        this.bookmarksChanged.next();
    }

    delete(bookmark: Bookmark): void {
        const bookmarks = this.getAll();
        const index = bookmarks.findIndex(b =>
            b.title === bookmark.title &&
            b.date === bookmark.date &&
            b.time === bookmark.time &&
            b.url === bookmark.url
        );
        if (index !== -1) {
            bookmarks.splice(index, 1);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookmarks));
            this.bookmarksChanged.next();
        }
    }

    clear(): void {
        localStorage.removeItem(this.STORAGE_KEY);
        this.bookmarksChanged.next();
    }
}
