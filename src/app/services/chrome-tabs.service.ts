import { Injectable } from '@angular/core';
import type { Bookmark } from './bookmarks-storage.service';
import { normalizeUrl } from '../utils/chrome-utils';

@Injectable({ providedIn: 'root' })
export class ChromeTabsService {
    /**
     * Opens a bookmark in a Chrome tab. If a tab with the normalized URL is already open, it activates and focuses that tab and its window (unless background is true).
     * If no such tab exists, it either creates a new tab in the background or updates the currently active tab, depending on the background flag.
     * @param bookmark The bookmark to open
     * @param background If true, opens in background; otherwise, focuses the tab
     * @returns true if the operation was initiated, false if not possible
     */
    openBookmark(bookmark: Bookmark, background = false): boolean {
        if (!bookmark.url || typeof chrome === 'undefined' || !chrome.tabs) return false;

        chrome.tabs.query({}, (tabs) => {
            const targetUrl = normalizeUrl(bookmark.url);
            const tab = tabs.find(t => t.url && normalizeUrl(t.url) === targetUrl);
            if (tab?.id) {
                chrome.tabs.update(tab.id, { active: !background });
                chrome.windows.update(tab.windowId, { focused: !background });
                return;
            }
            chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => {
                if (activeTab?.id) {
                    if (background) {
                        chrome.tabs.create({ url: bookmark.url, active: false });
                    } else {
                        chrome.tabs.update(activeTab.id, { url: bookmark.url });
                    }
                }
            });
        });
        return true;
    }
}
