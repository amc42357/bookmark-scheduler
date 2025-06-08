import { Injectable } from '@angular/core';
import { BookmarksStorageService } from './bookmarks-storage.service';

@Injectable({ providedIn: 'root' })
export class BookmarkSchedulerService {
    private timeoutId: any;

    constructor(private readonly bookmarkStorage: BookmarksStorageService) {
    }

    startScheduler() {
        this.stopScheduler();
        const bookmarks = this.bookmarkStorage.getAll();
        if (!bookmarks.length) return;
        // Sort bookmarks by date+time ascending
        const sorted = [...bookmarks].sort((a, b) => {
            const aDate = new Date(`${a.date}T${a.time}`);
            const bDate = new Date(`${b.date}T${b.time}`);
            return aDate.getTime() - bDate.getTime();
        });
        const now = new Date();
        // Find the next bookmark in the future
        const next = sorted.find(b => {
            const bDate = new Date(`${b.date}T${b.time}`);
            return bDate > now;
        });
        if (!next) return;
        const nextDate = new Date(`${next.date}T${next.time}`);
        const msUntilNext = nextDate.getTime() - now.getTime();
        this.timeoutId = setTimeout(() => {
            window.open(next.url, '_blank');
            // Remove the triggered bookmark and schedule the next one
            this.bookmarkStorage.delete(next);
            this.startScheduler();
        }, msUntilNext);
    }

    stopScheduler() {
        clearTimeout(this.timeoutId);
    }
}