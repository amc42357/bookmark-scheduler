// Handle messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'copyToClipboard' && typeof request.text === 'string') {
        navigator.clipboard.writeText(request.text)
            .then(() => sendResponse({ success: true }))
            .catch(() => sendResponse({ success: false }));
        return true; // Indicates async response
    }

    if (request.action === 'showNotification') {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'assets/icon48.png',
            title: request.title || 'Bookmark Scheduler',
            message: request.message
        });
    }
});

// Optional: Use alarms API for more reliable scheduling
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name.startsWith('openEvent_')) {
        const eventId = alarm.name.replace('openEvent_', '');
        chrome.storage.sync.get(['scheduledEvents'], (result) => {
            const event = result.scheduledEvents.find(e => e.id === eventId);
            if (event) {
                chrome.tabs.create({ url: event.url, active: true });
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'assets/icon48.png',
                    title: 'Bookmark Scheduler',
                    message: `Opening: ${event.name}`
                });
            }
        });
    }
});
