// Utility for capturing Chrome tab info and updating a form
import type { Bookmark } from '../bookmarks-create/bookmarks-create.model';


// Accepts a form-like object with patchValue and get methods
export interface PatchableForm {
    patchValue: (value: Partial<Bookmark>) => void;
    get: (field: string) => { value: string } | null;
}

/**
 * Captures the current Chrome tab's title and URL, and updates the provided form.
 * If the Chrome Tabs API is unavailable, falls back to the current document's title and URL.
 * @param form - The form object to update (must implement PatchableForm)
 */
export function captureTabInfo(form: PatchableForm) {
    const patch = (title: string, url: string) => form.patchValue({
        title: title ?? '',
        url: url ?? ''
    });
    const chromeTabs = (window as any)?.chrome?.tabs;
    if (chromeTabs) {
        chromeTabs.query({ active: true, currentWindow: true }, (tabs: Bookmark[]) => patch(tabs[0]?.title, tabs[0]?.url));
        return;
    }
    const currentUrl = form.get('url')?.value;
    patch(document.title, currentUrl ?? window.location.href);
}

/**
 * Normalizes a URL for consistent tab comparison.
 * Removes trailing slashes (except for root), preserves search params.
 * @param url - The URL string to normalize
 * @returns The normalized URL string
 */
export function normalizeUrl(url: string): string {
    try {
        const u = new URL(url);
        let path = u.pathname.endsWith('/') && u.pathname !== '/' ? u.pathname.slice(0, -1) : u.pathname;
        return `${u.origin}${path}${u.search}`;
    } catch {
        return url;
    }
}
