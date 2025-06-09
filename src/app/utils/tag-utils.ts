// Utility functions for tag management

/**
 * Adds a trimmed tag to the tags array if it does not already exist.
 * @param tags - The array of existing tags.
 * @param value - The tag value to add (will be trimmed).
 * @returns True if the tag was added, false if it was empty or already present.
 */
export function addTag(tags: string[], value: string): boolean {
    value = value.trim();
    if (value && !tags.includes(value)) {
        tags.push(value);
        return true;
    }
    return false;
}

/**
 * Removes a tag from the tags array if it exists.
 * @param tags - The array of existing tags.
 * @param tag - The tag value to remove.
 * @returns True if the tag was removed, false if it was not found.
 */
export function removeTag(tags: string[], tag: string): boolean {
    const index = tags.indexOf(tag);
    if (index > -1) {
        tags.splice(index, 1);
        return true;
    }
    return false;
}
