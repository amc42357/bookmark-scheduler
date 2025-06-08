console.log('Background script loaded');

type Bookmark = {
    date: string;
    time: string;
    url: string;
    uuid: string;
};

let isChecking = false;

/**
 * Checks for due bookmarks, opens them in new tabs, removes them from storage, and schedules the next check.
 */
function checkAndOpenDueBookmarks() {
    if (isChecking) return;
    isChecking = true;
    chrome.storage.local.get('bookmarks', ({ bookmarks = [] }: { bookmarks?: Bookmark[] }) => {
        const now = Date.now();
        const due: Bookmark[] = [];
        let nextTime: number | null = null;
        for (const b of bookmarks) {
            const t = new Date(`${b.date}T${b.time}`).getTime();
            if (t <= now) due.push(b);
            else if (nextTime === null || t < nextTime) nextTime = t;
        }
        if (due.length) {
            openOrFocusTab(new Set(due.map(b => b.url)));
            const dueUuids = new Set(due.map(b => b.uuid));
            const remaining = bookmarks.filter(b => !dueUuids.has(b.uuid));
            chrome.storage.local.set({ bookmarks: remaining }, () => {
                scheduleNextCheckWithTime(nextTime);
                isChecking = false;
            });
        } else {
            scheduleNextCheckWithTime(nextTime);
            isChecking = false;
        }
    });
}

/**
 * Normalizes the URL by removing the trailing slash and ensuring consistent formatting.
 */
function normalizeUrl(url: string): string {
    try {
        const u = new URL(url);
        // Remove trailing slash for consistency
        let path = u.pathname.endsWith('/') && u.pathname !== '/' ? u.pathname.slice(0, -1) : u.pathname;
        return `${u.origin}${path}${u.search}`;
    } catch {
        return url;
    }
}

/**
 * Checks if a tab with the given URL is open and focuses it, otherwise opens a new tab.
 * Optimized for O(m + n) complexity by using a Map for tab lookup.
 */
function openOrFocusTab(urls: Set<string>) {
    const urlsArray = Array.from(urls);
    chrome.tabs.query({}, (tabs) => {
        // Build a map of normalized tab URLs to tab objects for O(1) lookup
        const tabMap = new Map<string, chrome.tabs.Tab>();
        tabs.forEach(tab => {
            if (tab.url) {
                tabMap.set(normalizeUrl(tab.url), tab);
            }
        });
        urlsArray.forEach((url, index) => {
            const normalizedTarget = normalizeUrl(url);
            const existingTab = tabMap.get(normalizedTarget);
            console.log(`Checking URL: ${normalizedTarget}`);
            console.log(tabMap);
            if (existingTab?.id) {
                chrome.tabs.update(existingTab.id, { active: index === 0 });
            } else {
                chrome.tabs.create({ url, active: index === 0 });
            }
        });
    });
}

/**
 * Schedules the next alarm for checking bookmarks based on the next due time.
 * @param nextTime The timestamp (in ms) of the next due bookmark, or null if none.
 */
function scheduleNextCheckWithTime(nextTime: number | null) {
    chrome.alarms.clear('bookmarkCheck');

    if (nextTime === null) {
        return;
    }

    const delayMs = Math.max(nextTime - Date.now(), 0);
    // chrome.alarms uses minutes, so convert ms to minutes (min 0.1 min)
    const delayMin = Math.max(delayMs / 60000, 0.1);
    chrome.alarms.create('bookmarkCheck', { delayInMinutes: delayMin });
}

/**
 * Listener for alarm events. Triggers bookmark check when the scheduled alarm fires.
 */
chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === 'bookmarkCheck') {
        checkAndOpenDueBookmarks();
    }
});

/**
 * Listener for messages from the popup/UI. Reschedules alarms after a bookmark is added.
 */
chrome.runtime.onMessage.addListener(message => {
    if (message && message.type === 'BOOKMARK_ADDED') {
        checkAndOpenDueBookmarks();
    }
});

/**
 * Initial call to check and schedule bookmarks when the background script loads.
 */
checkAndOpenDueBookmarks();