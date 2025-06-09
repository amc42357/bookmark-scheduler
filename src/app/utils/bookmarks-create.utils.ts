// Utility functions for BookmarksCreateComponent
// Provides helpers for URL normalization, Chrome messaging, and tag management in forms
import { FormGroup } from '@angular/forms';

/**
 * Interface for the event used in addTagUtil.
 */
export interface TagInputEvent {
    input: HTMLInputElement;
    value: string;
}

/**
 * Ensures the URL starts with 'https://' or 'http://'.
 * @param url The URL to normalize.
 * @returns The normalized URL with protocol.
 */
export function normalizeUrl(url: string): string {
    return url && !/^https?:\/\//i.test(url) ? 'https://' + url : url;
}

/**
 * Notifies the Chrome extension that a bookmark was added.
 */
export function notifyBookmarkAdded(): void {
    (window as any)?.chrome?.runtime?.sendMessage?.({ type: 'BOOKMARK_ADDED' });
}

/**
 * Adds a tag to the 'tags' FormControl if it does not already exist.
 * @param form The FormGroup containing the 'tags' FormControl.
 * @param event The tag input event containing the input element and value.
 */
export function addTagUtil(form: FormGroup, event: TagInputEvent): void {
    const { input, value } = event;
    const tag = value?.trim();
    if (tag) {
        const tags = form.get('tags')?.value ?? [];
        if (!tags.includes(tag)) {
            form.get('tags')?.setValue([...tags, tag]);
        }
    }
    if (input) {
        input.value = '';
    }
}

/**
 * Removes a tag from the 'tags' FormControl.
 * @param form The FormGroup containing the 'tags' FormControl.
 * @param tag The tag to remove.
 */
export function removeTagUtil(form: FormGroup, tag: string): void {
    const tags = form.get('tags')?.value ?? [];
    form.get('tags')?.setValue(tags.filter((t: string) => t !== tag));
}
