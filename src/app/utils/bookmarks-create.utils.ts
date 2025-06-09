// Utility functions for BookmarksCreateComponent
import { FormGroup } from '@angular/forms';

export function normalizeUrl(url: string): string {
    return url && !/^https?:\/\//i.test(url) ? 'https://' + url : url;
}

export function notifyBookmarkAdded(): void {
    (window as any)?.chrome?.runtime?.sendMessage?.({ type: 'BOOKMARK_ADDED' });
}

export function addTagUtil(form: FormGroup, event: { input: HTMLInputElement; value: string }): void {
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

export function removeTagUtil(form: FormGroup, tag: string): void {
    const tags = form.get('tags')?.value ?? [];
    form.get('tags')?.setValue(tags.filter((t: string) => t !== tag));
}
