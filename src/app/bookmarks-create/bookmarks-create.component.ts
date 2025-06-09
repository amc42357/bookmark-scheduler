import { Component, ViewChild, ElementRef, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { BookmarksStorageService } from '../services/bookmarks-storage.service';
import { RECURRENCE_OPTIONS, Bookmark, SEPARATOR_KEYS } from './bookmarks-create.model';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

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
        MatProgressSpinnerModule,
        MatTooltipModule,
        TranslateModule
    ],
    templateUrl: './bookmarks-create.component.html',
    styleUrls: ['./bookmarks-create.component.scss'],
    // Add schemas to allow aria-label on mat-chip-grid
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BookmarksCreateComponent implements AfterViewInit {
    readonly form: FormGroup;
    readonly RECURRENCE_OPTIONS = RECURRENCE_OPTIONS;
    readonly separatorKeys = SEPARATOR_KEYS;
    isSubmitting = false;

    @ViewChild('titleInput') titleInput!: ElementRef<HTMLInputElement>;

    // Expose utility functions for template usage
    addTagUtil = addTagUtil;
    removeTagUtil = removeTagUtil;

    constructor(
        private readonly fb: FormBuilder,
        private readonly bookmarksStorage: BookmarksStorageService
    ) {
        const initial = this.getInitialFormState();
        this.form = this.fb.group({
            title: [initial.title, Validators.required],
            date: [initial.date, Validators.required],
            time: [initial.time, Validators.required],
            url: [
                initial.url,
                [
                    Validators.required,
                    Validators.pattern(/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i)
                ]
            ],
            recurrence: [initial.recurrence, Validators.required],
            tags: [initial.tags]
        });
    }

    private getInitialFormState() {
        return {
            title: '',
            date: getTodayDate(),
            time: getCurrentTime(),
            url: '',
            recurrence: RECURRENCE_OPTIONS[0],
            tags: []
        };
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
        this.form.reset(this.getInitialFormState());
        this.isSubmitting = false;
    }

    onUseCurrentTab() {
        captureTabInfo(this.form);
        this.form.get('title')?.markAsTouched();
        this.form.get('url')?.markAsTouched();
    }

    get title() { return this.form.get('title'); }
    get url() { return this.form.get('url'); }
    get date() { return this.form.get('date'); }
    get time() { return this.form.get('time'); }
    get tags() { return this.form.get('tags'); }
}
