console.log('Background script loaded');

type Bookmark = {
    date: string;
    time: string;
    url: string;
    uuid: string;
};

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
    chrome.alarms.clear('bookmarkCheck');
    if (nextTime !== null) {
        const delayMs = Math.max(nextTime - Date.now(), 0);
        // chrome.alarms uses minutes, so convert ms to minutes (min 0.1 min)
        const delayMin = Math.max(delayMs / 60000, 0.1);
        chrome.alarms.create('bookmarkCheck', { delayInMinutes: delayMin });
    }
}

chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === 'bookmarkCheck') {
        checkAndOpenDueBookmarks();
    }
});

checkAndOpenDueBookmarks();