// Utility functions for tag management
export function addTag(tags: string[], value: string): boolean {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
        tags.push(trimmed);
        return true;
    }
    return false;
}

export function removeTag(tags: string[], tag: string): boolean {
    const index = tags.indexOf(tag);
    if (index >= 0) {
        tags.splice(index, 1);
        return true;
    }
    return false;
}
