import { Injectable } from '@angular/core';
import { Bookmark } from './bookmarks-storage.service';

@Injectable({ providedIn: 'root' })
export class ChromeTabsService {
    openBookmark(bookmark: Bookmark): boolean {
        if (!bookmark.url || typeof chrome === 'undefined' || !chrome.tabs) return false;

        chrome.tabs.query({ url: bookmark.url }, ([tab]) => {
            if (tab?.id) {
                chrome.tabs.update(tab.id, { active: true });
                chrome.windows.update(tab.windowId, { focused: true });
            } else {
                chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => {
                    if (activeTab?.id) chrome.tabs.update(activeTab.id, { url: bookmark.url });
                });
            }
        });
        return true;
    }
}
