import { Injectable } from '@angular/core';
import { BookmarksStorageService, Bookmark } from './bookmarks-storage.service';
import { ChromeTabsService } from './chrome-tabs.service';

@Injectable({ providedIn: 'root' })
export class BookmarkAlarmService {
    private readonly alarmedUuids = new Set<string>();
    private intervalId!: any;

    constructor(
        private readonly bookmarksStorage: BookmarksStorageService,
        private readonly chromeTabs: ChromeTabsService
    ) {
        this.startAlarmChecker();
    }

    private startAlarmChecker() {
        console.log('BookmarkAlarmService initialized, starting alarm checker...');
        this.checkAlarms();
        this.intervalId = setInterval(() => this.checkAlarms(), 5000);
    }

    private checkAlarms() {
        const bookmarks: Bookmark[] = this.bookmarksStorage.getAll();
        const now = new Date();
        if (!bookmarks || bookmarks.length === 0) {
            console.log('No bookmarks found, skipping alarm check.');
            return;
        }
        console.log(`Checking ${bookmarks.length} bookmarks for alarms at ${now.toISOString()}`);
        const currentBookmarks = bookmarks
            .filter(bookmark => {
                if (this.alarmedUuids.has(bookmark.uuid)) return false;
                const bookmarkDate = new Date(`${bookmark.date}T${bookmark.time}`);
                const diff = bookmarkDate.getTime() - now.getTime();
                return diff <= 5 * 60 * 1000;
            });
        currentBookmarks.forEach(bookmark => {
            const bookmarkDate = new Date(`${bookmark.date}T${bookmark.time}`);
            const diff = bookmarkDate.getTime() - now.getTime();
            this.startRoutingForBookmark(bookmark, diff, currentBookmarks.length > 1);
            this.alarmedUuids.add(bookmark.uuid);
        });
    }

    private startRoutingForBookmark(bookmark: Bookmark, msUntilAlarm: number, background: boolean) {
        console.log(`Starting timer for bookmark: ${bookmark.title} (${bookmark.uuid}), will trigger in ${msUntilAlarm} ms at ${bookmark.date}T${bookmark.time}`);
        const interval = setInterval(() => {
            const now = new Date();
            const bookmarkDate = new Date(`${bookmark.date}T${bookmark.time}`);
            if (now >= bookmarkDate) {
                this.triggerAlarm(bookmark, background);
                clearInterval(interval);
            } else {
                this.bookmarksStorage.bookmarksChanged.next();
            }
        }, 1000);
    }

    private triggerAlarm(bookmark: Bookmark, background: boolean) {
        this.chromeTabs.openBookmark(bookmark, background);
        this.bookmarksStorage.delete(bookmark);
        this.alarmedUuids.delete(bookmark.uuid);
    }
}
