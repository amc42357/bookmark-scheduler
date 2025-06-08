import { Injectable } from '@angular/core';
import { BookmarksStorageService, Bookmark } from './bookmarks-storage.service';

@Injectable({ providedIn: 'root' })
export class BookmarkAlarmService {
    private readonly alarmedUuids = new Set<string>();
    private intervalId: any;

    constructor(private readonly bookmarksStorage: BookmarksStorageService) {
        this.startAlarmChecker();
    }

    private startAlarmChecker() {
        this.checkAlarms();
        this.intervalId = setInterval(() => this.checkAlarms(), 30000); // check every 30 seconds
    }

    private checkAlarms() {
        const bookmarks: Bookmark[] = this.bookmarksStorage.getAll();
        const now = new Date();
        bookmarks.forEach(bookmark => {
            if (this.alarmedUuids.has(bookmark.uuid)) return;
            const bookmarkDate = new Date(`${bookmark.date}T${bookmark.time}`);
            // Allow a 30s window for the alarm to trigger
            if (Math.abs(bookmarkDate.getTime() - now.getTime()) < 30000) {
                this.triggerAlarm(bookmark);
                this.alarmedUuids.add(bookmark.uuid);
            }
        });
    }

    private triggerAlarm(bookmark: Bookmark) {
        // You can replace this with a custom notification or sound
        window.alert(`Bookmark Reminder!\n${bookmark.title}\n${bookmark.url}`);
    }
}
