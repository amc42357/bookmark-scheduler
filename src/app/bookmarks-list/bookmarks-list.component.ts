// Bookmarks List Component (was ListEventsComponent)
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookmarksStorageService, Bookmark } from '../services/bookmarks-storage.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Subscription } from 'rxjs';

@Component({
    selector: 'bookmarks-list',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule, MatChipsModule],
    templateUrl: './bookmarks-list.component.html',
    styleUrls: ['./bookmarks-list.component.scss']
})
export class BookmarksListComponent implements OnInit, OnDestroy {
    bookmarks: Bookmark[] = [];
    allTags: string[] = [];
    selectedTag: string | null = null;
    private subscription?: Subscription;
    constructor(private readonly bookmarksStorage: BookmarksStorageService) { }
    ngOnInit() {
        this.loadBookmarks();
        this.subscription = this.bookmarksStorage.bookmarksChanged.subscribe(() => {
            this.loadBookmarks();
        });
    }
    ngOnDestroy() {
        this.subscription?.unsubscribe();
    }
    loadBookmarks() {
        this.bookmarks = this.bookmarksStorage.getAll();
        this.updateAllTags();
    }
    updateAllTags() {
        const tagSet = new Set<string>();
        this.bookmarks.forEach(b => (b.tags ?? []).forEach(t => tagSet.add(t)));
        this.allTags = Array.from(tagSet).sort((a, b) => a.localeCompare(b));
    }
    remove(bookmark: Bookmark) {
        this.bookmarksStorage.delete(bookmark);
        this.loadBookmarks();
    }
    edit(bookmark: Bookmark) {
        // TODO: Implement navigation to edit component or open dialog
        alert('Edit feature coming soon!');
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
        if (bookmark.url && typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
                if (tabs.length > 0 && tabs[0].id) {
                    chrome.tabs.update(tabs[0].id, { url: bookmark.url });
                }
            });
        } else if (bookmark.url) {
            window.location.href = bookmark.url;
        }
    }
}
