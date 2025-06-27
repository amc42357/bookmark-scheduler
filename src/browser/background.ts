// =====================
// Type Definitions
// =====================
type Recurrence = 'once' | 'daily' | 'weekly' | 'bi-weekly' | 'monthly';

interface Bookmark {
    date: string;
    time: string;
    url: string;
    uuid: string;
    recurrence: Recurrence;
}

interface RescheduleInfo {
    next: Occurrence;
    nextT: number;
}

interface Occurrence {
    date: string;
    time: string;
}

interface ProcessedBookmarks {
    due: Bookmark[];
    toReschedule: Bookmark[];
    nextTime: number | null;
}

// =====================
// State
// =====================
let isChecking = false;

// =====================
// Utility Functions
// =====================
const normalizeUrl = (url: string): string => {
    try {
        const u = new URL(url);
        let path = u.pathname.endsWith('/') && u.pathname !== '/' ? u.pathname.slice(0, -1) : u.pathname;
        return `${u.origin}${path}${u.search}`;
    } catch {
        return url;
    }
};

const getRescheduleInfo = (bookmark: Bookmark, t: number): RescheduleInfo | null => {
    if (bookmark.recurrence === 'once') return null;
    const next = getNextOccurrence(bookmark, t);
    if (!next) return null;
    const nextT = new Date(`${next.date}T${next.time}`).getTime();
    return { next, nextT };
};

const getNextOccurrence = (bookmark: Bookmark, lastTime: number): Occurrence | null => {
    if (bookmark.recurrence === 'once') return null;
    const dt = new Date(lastTime);
    switch (bookmark.recurrence) {
        case 'daily': dt.setDate(dt.getDate() + 1); break;
        case 'weekly': dt.setDate(dt.getDate() + 7); break;
        case 'bi-weekly': dt.setDate(dt.getDate() + 14); break;
        case 'monthly': dt.setMonth(dt.getMonth() + 1); break;
        default: return null;
    }
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    const hh = String(dt.getHours()).padStart(2, '0');
    const min = String(dt.getMinutes()).padStart(2, '0');
    return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${min}` };
};

// =====================
// Bookmark Processing
// =====================
const processBookmarks = (bookmarks: Bookmark[], now: number): ProcessedBookmarks => {
    const due: Bookmark[] = [];
    let nextTime: number | null = null;
    const toReschedule: Bookmark[] = [];
    const GRACE_PERIOD_MS = 2000; // 2 seconds grace period
    for (const b of bookmarks) {
        const t = new Date(`${b.date}T${b.time}`).getTime();
        if (t <= now && t >= now - GRACE_PERIOD_MS) {
            due.push(b);
            const reschedule = getRescheduleInfo(b, t);
            if (reschedule) {
                toReschedule.push({ ...b, date: reschedule.next.date, time: reschedule.next.time });
                nextTime = nextTime === null ? reschedule.nextT : Math.min(nextTime, reschedule.nextT);
            }
        }
        if (t > now) {
            nextTime = nextTime === null ? t : Math.min(nextTime, t);
        }
    }
    return { due, toReschedule, nextTime };
};

const getUpdatedBookmarks = (bookmarks: Bookmark[], due: Bookmark[], toReschedule: Bookmark[]): Bookmark[] => {
    return bookmarks.map(b => toReschedule.find(tb => tb.uuid === b.uuid) ?? b);
};

// =====================
// Tab Management
// =====================
const openOrFocusTab = (urls: Set<string>): void => {
    const urlsArray = Array.from(urls);
    chrome.tabs.query({}, tabs => {
        urlsArray.forEach((url, index) => {
            const existingTab = tabs.find(tab => tab.url && normalizeUrl(tab.url) === normalizeUrl(url));
            if (existingTab?.id) {
                chrome.tabs.update(existingTab.id, { active: index === 0 });
            } else {
                chrome.tabs.create({ url, active: index === 0 });
            }
        });
    });
};

const openDueBookmarks = (due: Bookmark[]): void => {
    openOrFocusTab(new Set(due.map(b => b.url)));
};

// =====================
// Alarm Scheduling
// =====================
const scheduleNextCheckWithTime = (nextTime: number | null): void => {
    chrome.alarms.clear('bookmarkCheck');
    if (nextTime === null) return;
    const delayMs = Math.max(nextTime - Date.now(), 0);
    const delayMin = Math.max(delayMs / 60000, 0.1);
    chrome.alarms.create('bookmarkCheck', { delayInMinutes: delayMin });
};

// =====================
// Main Logic
// =====================
const checkAndOpenDueBookmarks = (): void => {
    if (isChecking) return;
    isChecking = true;
    chrome.storage.local.get('bookmarks', handleBookmarksCheck);
};

const handleBookmarksCheck = ({ bookmarks = [] }: { bookmarks?: Bookmark[] }): void => {
    const now = Date.now();
    const { due, toReschedule, nextTime } = processBookmarks(bookmarks, now);
    if (due.length) openDueBookmarks(due);
    const updatedBookmarks = getUpdatedBookmarks(bookmarks, due, toReschedule);
    chrome.storage.local.set({ bookmarks: updatedBookmarks }, () => {
        scheduleNextCheckWithTime(nextTime);
        isChecking = false;
    });
};

// =====================
// Event Listeners
// =====================
chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === 'bookmarkCheck') checkAndOpenDueBookmarks();
});

chrome.runtime.onMessage.addListener(message => {
    if (message?.type === 'BOOKMARK_ADDED') checkAndOpenDueBookmarks();
});

// =====================
// Initialization
// =====================
console.log('Background script loaded');
checkAndOpenDueBookmarks();