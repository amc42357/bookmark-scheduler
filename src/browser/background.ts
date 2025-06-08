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
        const now = new Date();
        // Split bookmarks into due and future
        const due: Bookmark[] = [];
        let nextTime: number | null = null;
        bookmarks.forEach(b => {
            const t = new Date(`${b.date}T${b.time}`).getTime();
            if (t <= now.getTime()) {
                due.push(b);
            } else if (nextTime === null || t < nextTime) {
                nextTime = t;
            }
        });
        // Open and remove due bookmarks
        if (due.length > 0) {
            const dueUrls = Array.from(new Set(due.map(b => b.url)));
            dueUrls.forEach(url => chrome.tabs.create({ url }));
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