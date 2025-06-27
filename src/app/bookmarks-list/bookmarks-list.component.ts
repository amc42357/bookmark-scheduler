import { BehaviorSubject, Subscription } from 'rxjs';
// --- Angular & 3rd Party Imports ---
import { Component, OnDestroy, OnInit } from '@angular/core';
import { extractAllTags, removeBookmarks } from '../utils/bookmarks-list.utils';

import { Bookmark } from '../bookmarks-create/bookmarks-create.model';
import { BookmarksStorageService } from '../services/bookmarks-storage.service';
// --- App Services & Utils ---
import { ChromeTabsService } from '../services/chrome-tabs.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

// --- State ---

// Define the type outside the class
export type SelectableBookmark = Bookmark & { selected?: boolean };

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
    bookmarks$ = new BehaviorSubject<SelectableBookmark[]>([]);
    allTags: string[] = [];
    selectedTag: string | null = null;
    selectedBookmarksSet = new Set<string>();
    selectAllChecked = false;
    removeMode = false;
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
    private mapBookmarksWithSelection(bookmarks: Bookmark[]): SelectableBookmark[] {
        return bookmarks.map(b => ({ ...b, selected: this.selectedBookmarksSet.has(b.uuid) }));
    }

    async loadBookmarks() {
        const bookmarks = await this.bookmarksStorage.getAll();
        const mapped = this.mapBookmarksWithSelection(bookmarks);
        this.bookmarks$.next(mapped);
        this.allTags = extractAllTags(bookmarks);
        this.updateSelectionState(bookmarks);
    }

    // --- Bookmark Actions ---
    async remove(bookmark: Bookmark & { selected?: boolean }) {
        if (!this.removeMode) return;
        await this.bookmarksStorage.delete(bookmark);
        await this.loadBookmarks();
    }
    async removeSelected() {
        if (!this.removeMode) return;
        const bookmarks = this.bookmarks$.value.filter(b => this.selectedBookmarksSet.has(b.uuid));
        await removeBookmarks(this.bookmarksStorage, bookmarks);
        await this.loadBookmarks();
    }

    // --- Tag Filtering ---
    filterByTag(tag: string) { this.selectedTag = this.selectedTag === tag ? null : tag; }
    clearTagFilter() { this.selectedTag = null; }
    filteredBookmarks(bookmarks: (Bookmark & { selected?: boolean })[]) {
        return !this.selectedTag ? bookmarks : bookmarks.filter(b => (b.tags ?? []).includes(this.selectedTag!));
    }

    // --- UI Actions ---
    openLink(bookmark: Bookmark) {
        this.chromeTabs.openBookmark(bookmark);
    }
    toggleSelectAll() {
        const bookmarks = this.bookmarks$.value;
        if (this.selectAllChecked) {
            bookmarks.forEach(b => this.selectedBookmarksSet.add(b.uuid));
        } else {
            this.selectedBookmarksSet.clear();
        }
        this.updateSelectionState(bookmarks);
        this.bookmarks$.next([...bookmarks]);
    }
    private resetSelectionState() {
        this.selectedBookmarksSet.clear();
        this.selectAllChecked = false;
        this.bookmarks$.next([...this.bookmarks$.value]);
    }
    toggleRemoveMode() {
        this.removeMode = !this.removeMode;
        if (!this.removeMode) {
            this.resetSelectionState();
        }
    }
    updateSelectionState(bookmarks: (Bookmark & { selected?: boolean })[]) {
        this.selectAllChecked = bookmarks.length > 0 && bookmarks.every(b => this.selectedBookmarksSet.has(b.uuid));
    }
    onBookmarkSelectChange(bookmark: Bookmark) {
        if (this.selectedBookmarksSet.has(bookmark.uuid)) {
            this.selectedBookmarksSet.delete(bookmark.uuid);
        } else {
            this.selectedBookmarksSet.add(bookmark.uuid);
        }
        this.updateSelectionState(this.bookmarks$.value);
        this.bookmarks$.next([...this.bookmarks$.value]);
    }
    trackByUuid(index: number, bookmark: Bookmark) {
        return bookmark.uuid;
    }

    // --- UI Logic for Template Simplification ---
    get showTagFilterBar() {
        return this.allTags.length > 0 && this.bookmarks$.value.length > 0;
    }
    get hasBookmarks() {
        return this.bookmarks$.value.length > 0;
    }
    get isEmpty() {
        return this.bookmarks$.value.length === 0;
    }
    get isRemoveDisabled() {
        return this.selectedBookmarksSet.size === 0;
    }
}
