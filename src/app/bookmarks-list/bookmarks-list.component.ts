// --- Angular & 3rd Party Imports ---
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

// --- App Services & Utils ---
import { ChromeTabsService } from '../services/chrome-tabs.service';
import { extractAllTags, removeBookmarks } from '../utils/bookmarks-list.utils';
import { Bookmark, Recurrence } from '../bookmarks-create/bookmarks-create.model';
import { BookmarksStorageService } from '../services/bookmarks-storage.service';

@Component({
    selector: 'bookmarks-list',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatChipsModule,
        MatCheckboxModule,
        FormsModule,
        TranslateModule
    ],
    templateUrl: './bookmarks-list.component.html',
    styleUrls: ['./bookmarks-list.component.scss']
})
export class BookmarksListComponent implements OnInit, OnDestroy {
    // --- State ---
    bookmarks: (Bookmark & { selected?: boolean })[] = [];
    allTags: string[] = [];
    selectedTag: string | null = null;
    selectedBookmarks: (Bookmark & { selected?: boolean })[] = [];
    selectAllChecked = false;
    removeMode = false;
    editMode = false;
    private subscription?: Subscription;

    // --- Constructor ---
    constructor(
        private readonly bookmarksStorage: BookmarksStorageService,
        private readonly chromeTabs: ChromeTabsService
    ) { }

    // --- Lifecycle ---
    ngOnInit() {
        this.loadBookmarks();
        this.subscription = this.bookmarksStorage.bookmarksChanged.subscribe(() => this.loadBookmarks());
    }
    ngOnDestroy() {
        this.subscription?.unsubscribe();
    }

    // --- Data Loading & State ---
    async loadBookmarks() {
        const bookmarks = await this.bookmarksStorage.getAll();
        // Ensure recurrence is typed as Recurrence
        this.bookmarks = bookmarks.map(b => ({ ...b, recurrence: b.recurrence as Recurrence, selected: false }));
        this.allTags = extractAllTags(this.bookmarks);
        this.updateSelectionState();
    }

    // --- Bookmark Actions ---
    async remove(bookmark: Bookmark & { selected?: boolean }) {
        if (!this.removeMode) return;
        await this.bookmarksStorage.delete(bookmark);
        await this.loadBookmarks();
    }
    async removeSelected() {
        if (!this.removeMode) return;
        await removeBookmarks(this.bookmarksStorage, this.selectedBookmarks);
        await this.loadBookmarks();
    }

    // --- Tag Filtering ---
    filterByTag = (tag: string) => this.selectedTag = this.selectedTag === tag ? null : tag;
    clearTagFilter = () => { this.selectedTag = null; };
    filteredBookmarks() {
        return !this.selectedTag ? this.bookmarks : this.bookmarks.filter(b => (b.tags ?? []).includes(this.selectedTag!));
    }

    // --- UI Actions ---
    openLink(bookmark: Bookmark) {
        this.chromeTabs.openBookmark(bookmark);
    }
    toggleSelectAll() {
        this.bookmarks.forEach(b => b.selected = this.selectAllChecked);
        this.updateSelectionState();
    }
    private resetSelectionState() {
        this.bookmarks.forEach(b => b.selected = false);
        this.selectAllChecked = false;
        this.selectedBookmarks = [];
    }
    toggleRemoveMode() {
        this.removeMode = !this.removeMode;
        if (this.removeMode) {
            this.editMode = false;
            return;
        }
        this.resetSelectionState();
    }
    toggleEditMode() {
        this.editMode = !this.editMode;
        if (this.editMode) {
            this.removeMode = false;
            return;
        }
        this.resetSelectionState();
    }
    updateSelectionState() {
        this.selectedBookmarks = this.bookmarks.filter(b => b.selected);
        this.selectAllChecked = this.bookmarks.length > 0 && this.bookmarks.every(b => b.selected);
    }
    onBookmarkSelectChange(bookmark: Bookmark & { selected?: boolean }) {
        this.updateSelectionState();
    }
    trackByUuid(index: number, bookmark: Bookmark) {
        return bookmark.uuid;
    }

    // --- UI Logic for Template Simplification ---
    get showTagFilterBar() {
        return this.allTags.length > 0 && this.bookmarks.length > 0;
    }
    get hasBookmarks() {
        return this.bookmarks.length > 0;
    }
    get isEmpty() {
        return this.bookmarks.length === 0;
    }
    get isRemoveDisabled() {
        return this.selectedBookmarks.length === 0;
    }
}
