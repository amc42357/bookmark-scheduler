import { Injectable } from '@angular/core';

// TODO: Implement a service that checks bookmarks at the scheduled time and opens them in a new tab or shows an alert.
@Injectable({ providedIn: 'root' })
export class BookmarkSchedulerService {
    private intervalId: any;

    constructor() { }

    startScheduler(bookmarks: { url: string; date: Date }[]) {
        this.intervalId = setInterval(() => {
            const now = new Date();
            bookmarks.forEach(bookmark => {
                // Compare up to the minute
                if (
                    bookmark.date.getFullYear() === now.getFullYear() &&
                    bookmark.date.getMonth() === now.getMonth() &&
                    bookmark.date.getDate() === now.getDate() &&
                    bookmark.date.getHours() === now.getHours() &&
                    bookmark.date.getMinutes() === now.getMinutes()
                ) {
                    // Open the link or show an alert
                    window.open(bookmark.url, '_blank');
                    // Or: alert(`Time to visit: ${bookmark.url}`);
                }
            });
        }, 60000); // Check every minute
    }

    stopScheduler() {
        clearInterval(this.intervalId);
    }
}