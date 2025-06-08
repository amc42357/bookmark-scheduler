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
        this.intervalId = setInterval(() => this.checkAlarms(), 30000);
    }

    private checkAlarms() {
        const bookmarks: Bookmark[] = this.bookmarksStorage.getAll();
        const now = new Date();
        bookmarks.forEach(bookmark => {
            if (this.alarmedUuids.has(bookmark.uuid)) return;
            const bookmarkDate = new Date(`${bookmark.date}T${bookmark.time}`);
            // Check if the alarm is within 5 minutes ahead
            const diff = bookmarkDate.getTime() - now.getTime();
            if (diff > 0 && diff <= 5 * 60 * 1000) {
                // Start routing every 1000ms until the alarm time is reached
                this.startRoutingForBookmark(bookmark, diff);
                this.alarmedUuids.add(bookmark.uuid);
            }
        });
    }

    private startRoutingForBookmark(bookmark: Bookmark, msUntilAlarm: number) {
        const interval = setInterval(() => {
            const now = new Date();
            const bookmarkDate = new Date(`${bookmark.date}T${bookmark.time}`);
            if (now >= bookmarkDate) {
                this.triggerAlarm(bookmark);
                clearInterval(interval);
            } else {
                this.bookmarksStorage.bookmarksChanged.next();
            }
        }, 1000);
    }

    private triggerAlarm(bookmark: Bookmark) {
        window.alert(`Bookmark Reminder!\n${bookmark.title}\n${bookmark.url}`);
        this.bookmarksStorage.delete(bookmark);
    }
}
