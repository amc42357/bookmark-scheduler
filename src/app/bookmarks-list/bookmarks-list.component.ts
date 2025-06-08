// Bookmarks List Component (was ListEventsComponent)
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookmarksStorageService, Bookmark } from '../services/bookmarks-storage.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Subscription } from 'rxjs';
import { ChromeTabsService } from '../services/chrome-tabs.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'bookmarks-list',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule, MatChipsModule, MatCheckboxModule, FormsModule],
    templateUrl: './bookmarks-list.component.html',
    styleUrls: ['./bookmarks-list.component.scss']
})
export class BookmarksListComponent implements OnInit, OnDestroy {
    bookmarks: Bookmark[] = [];
    allTags: string[] = [];
    selectedTag: string | null = null;
    selectedBookmarks: Bookmark[] = [];
    selectAllChecked = false;
    removeMode = false;
    editMode = false;
    private subscription?: Subscription;
    constructor(private readonly bookmarksStorage: BookmarksStorageService, private readonly chromeTabs: ChromeTabsService) { }
    ngOnInit() {
        this.loadBookmarks();
        this.subscription = this.bookmarksStorage.bookmarksChanged.subscribe(() => {
            this.loadBookmarks();
        });
    }
    ngOnDestroy() {
        this.subscription?.unsubscribe();
    }
    async loadBookmarks() {
        const bookmarks = await this.bookmarksStorage.getAll();
        this.bookmarks = bookmarks.map(b => ({ ...b, selected: false }));
        this.updateAllTags();
        this.updateSelectedBookmarks();
        this.updateSelectAllChecked();
    }
    updateAllTags() {
        const tagSet = new Set<string>();
        this.bookmarks.forEach(b => (b.tags ?? []).forEach(t => tagSet.add(t)));
        this.allTags = Array.from(tagSet).sort((a, b) => a.localeCompare(b));
    }
    async remove(bookmark: Bookmark) {
        if (!this.removeMode) return;
        await this.bookmarksStorage.delete(bookmark);
        await this.loadBookmarks();
    }
    async removeSelected() {
        if (!this.removeMode) return;
        for (const b of this.selectedBookmarks) {
            await this.bookmarksStorage.delete(b);
        }
        await this.loadBookmarks();
    }
    filterByTag(tag: string) {
        if (this.selectedTag === tag) {
            this.selectedTag = null; // Deselect if already selected
        } else {
            this.selectedTag = tag;
        }
    }
    clearTagFilter() {
        this.selectedTag = null;
    }
    filteredBookmarks() {
        if (!this.selectedTag) return this.bookmarks;
        return this.bookmarks.filter(b => (b.tags ?? []).includes(this.selectedTag!));
    }
    openLink(bookmark: Bookmark) {
        const handled = this.chromeTabs.openBookmark(bookmark);
        if (!handled && bookmark.url) {
            window.location.href = bookmark.url;
        }
    }
    toggleSelectAll() {
        this.bookmarks.forEach(b => b.selected = this.selectAllChecked);
        this.updateSelectedBookmarks();
        this.updateSelectAllChecked();
    }
    toggleRemoveMode() {
        this.removeMode = !this.removeMode;
        if (this.removeMode) {
            this.editMode = false;
        }
        if (!this.removeMode) {
            this.bookmarks.forEach(b => b.selected = false);
            this.selectAllChecked = false;
            this.selectedBookmarks = [];
        }
    }
    toggleEditMode() {
        this.editMode = !this.editMode;
        if (this.editMode) {
            this.removeMode = false;
        }
        if (!this.editMode) {
            this.bookmarks.forEach(b => b.selected = false);
            this.selectAllChecked = false;
            this.selectedBookmarks = [];
        }
    }
    updateSelectedBookmarks() {
        this.selectedBookmarks = this.bookmarks.filter(b => b.selected);
    }
    updateSelectAllChecked() {
        this.selectAllChecked = this.bookmarks.length > 0 && this.bookmarks.every(b => b.selected);
    }
    onBookmarkSelectChange(bookmark: Bookmark) {
        this.updateSelectedBookmarks();
        this.updateSelectAllChecked();
    }
}
