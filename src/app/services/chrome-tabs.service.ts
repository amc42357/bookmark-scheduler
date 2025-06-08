import { Injectable } from '@angular/core';
import { Bookmark } from './bookmarks-storage.service';

@Injectable({ providedIn: 'root' })
export class ChromeTabsService {
    openBookmark(bookmark: Bookmark, background: boolean = false): boolean {
        if (!bookmark.url || typeof chrome === 'undefined' || !chrome.tabs) return false;

        chrome.tabs.query({ url: bookmark.url }, ([tab]) => {
            if (tab && typeof tab.id === 'number') {
                chrome.tabs.update(tab.id, { active: !background });
                chrome.windows.update(tab.windowId, { focused: !background });
            } else {
                chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => {
                    if (activeTab && typeof activeTab.id === 'number') {
                        if (background) {
                            chrome.tabs.create({ url: bookmark.url, active: false });
                        } else {
                            chrome.tabs.update(activeTab.id, { url: bookmark.url });
                        }
                    }
                });
            }
        });
        return true;
    }
}
