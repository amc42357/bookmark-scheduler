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
import { BookmarkSchedulerService } from '../services/bookmark-scheduler.service';

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
    constructor(private readonly bookmarksStorage: BookmarksStorageService, private readonly chromeTabs: ChromeTabsService, private readonly bookmarkScheduler: BookmarkSchedulerService) { }
    ngOnInit() {
        this.loadBookmarks();
        this.subscription = this.bookmarksStorage.bookmarksChanged.subscribe(() => {
            this.loadBookmarks();
            this.bookmarkScheduler.startScheduler();
        });
    }
    ngOnDestroy() {
        this.subscription?.unsubscribe();
    }
    loadBookmarks() {
        this.bookmarks = this.bookmarksStorage.getAll().map(b => ({ ...b, selected: false }));
        this.updateAllTags();
        this.updateSelectedBookmarks();
        this.updateSelectAllChecked();
    }
    updateAllTags() {
        const tagSet = new Set<string>();
        this.bookmarks.forEach(b => (b.tags ?? []).forEach(t => tagSet.add(t)));
        this.allTags = Array.from(tagSet).sort((a, b) => a.localeCompare(b));
    }
    remove(bookmark: Bookmark) {
        if (!this.removeMode) return;
        this.bookmarksStorage.delete(bookmark);
        this.loadBookmarks();
    }
    removeSelected() {
        if (!this.removeMode) return;
        this.selectedBookmarks.forEach(b => this.bookmarksStorage.delete(b));
        this.loadBookmarks();
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
