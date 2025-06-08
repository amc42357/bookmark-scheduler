console.log('Background script loaded');

type Bookmark = {
    date: string;
    time: string;
    url: string;
    uuid: string;
};

let timerId: ReturnType<typeof setTimeout> | undefined;

function checkAndOpenDueBookmarks() {
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
            due.forEach(b => chrome.tabs.create({ url: b.url }));
            const dueUuids = new Set(due.map(b => b.uuid));
            const remaining = bookmarks.filter(b => !dueUuids.has(b.uuid));
            chrome.storage.local.set({ bookmarks: remaining }, () => scheduleNextCheckWithTime(nextTime));
        } else {
            scheduleNextCheckWithTime(nextTime);
        }
    });
}

function scheduleNextCheckWithTime(nextTime: number | null) {
    if (timerId !== undefined) clearTimeout(timerId);
    if (nextTime !== null) {
        const delay = Math.max(nextTime - Date.now(), 0);
        timerId = setTimeout(checkAndOpenDueBookmarks, delay);
    }
}

checkAndOpenDueBookmarks();