import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { BookmarksStorageService } from '../services/bookmarks-storage.service';
import { RECURRENCE_OPTIONS, Bookmark } from './bookmarks-create.model';
import { getTodayDate, getCurrentTime } from '../utils/date-utils';
import { captureTabInfo } from '../utils/chrome-utils';
import { normalizeUrl, notifyBookmarkAdded, addTagUtil, removeTagUtil } from '../utils/bookmarks-create.utils';
// Angular Material modules (keep as separate imports for tree-shaking and compatibility)
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'bookmarks-create',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatSelectModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './bookmarks-create.component.html',
    styleUrls: ['./bookmarks-create.component.scss']
})
export class BookmarksCreateComponent implements AfterViewInit {
    readonly form: FormGroup;
    readonly RECURRENCE_OPTIONS = RECURRENCE_OPTIONS;
    isSubmitting = false;

    @ViewChild('titleInput') titleInput!: ElementRef<HTMLInputElement>;

    constructor(
        private readonly fb: FormBuilder,
        private readonly bookmarksStorage: BookmarksStorageService
    ) {
        this.form = this.fb.group({
            title: ['', Validators.required],
            date: [getTodayDate(), Validators.required],
            time: [getCurrentTime(), Validators.required],
            url: [
                '',
                [
                    Validators.required,
                    Validators.pattern(/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i)
                ]
            ],
            recurrence: [RECURRENCE_OPTIONS[0], Validators.required],
            tags: [[]]
        });
    }

    ngAfterViewInit() {
        setTimeout(() => this.titleInput?.nativeElement.focus(), 0);
    }

    async onSubmit(): Promise<void> {
        if (!this.form.valid) {
            this.form.markAllAsTouched();
            return;
        }
        this.isSubmitting = true;
        const bookmark: Bookmark = { ...this.form.value, uuid: uuidv4() };
        bookmark.url = normalizeUrl(bookmark.url);
        await this.bookmarksStorage.add(bookmark);
        notifyBookmarkAdded();
        this.form.reset({
            title: '',
            date: getTodayDate(),
            time: getCurrentTime(),
            url: '',
            recurrence: RECURRENCE_OPTIONS[0],
            tags: []
        });
        this.isSubmitting = false;
    }

    // Expose utility functions for template usage
    addTagUtil = addTagUtil;
    captureTabInfo = captureTabInfo;
    removeTagUtil = removeTagUtil;
}
