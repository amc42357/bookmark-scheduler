// This background script listens for messages from the popup/content script to copy text to the clipboard.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'copyToClipboard' && typeof request.text === 'string') {
        // Use the clipboard API in the background context
        if (navigator.clipboard) {
            navigator.clipboard.writeText(request.text).then(() => {
                sendResponse({ success: true });
            }).catch(() => {
                sendResponse({ success: false });
            });
            // Indicate async response
            return true;
        }
    }
});
