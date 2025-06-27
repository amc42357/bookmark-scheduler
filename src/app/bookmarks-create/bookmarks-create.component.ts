import { Component, ViewChild, ElementRef, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, Inject, LOCALE_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { A11yModule } from '@angular/cdk/a11y';
import { TranslateModule } from '@ngx-translate/core';

import { BookmarksStorageService } from '../services/bookmarks-storage.service';
import { RECURRENCE_OPTIONS, Bookmark, SEPARATOR_KEYS } from './bookmarks-create.model';
import { getTodayDate, getCurrentTime } from '../utils/date-utils';
import { captureTabInfo } from '../utils/chrome-utils';
import { normalizeUrl, notifyBookmarkAdded, addTagUtil, removeTagUtil } from '../utils/bookmarks-create.utils';

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
    A11yModule,
    TranslateModule
  ],
  templateUrl: './bookmarks-create.component.html',
  styleUrls: ['./bookmarks-create.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BookmarksCreateComponent implements AfterViewInit {
  @ViewChild('titleInput') titleInput!: ElementRef<HTMLInputElement>;

  readonly form: FormGroup;
  readonly RECURRENCE_OPTIONS = RECURRENCE_OPTIONS;
  readonly separatorKeys = SEPARATOR_KEYS;
  readonly addTagUtil = addTagUtil;
  readonly removeTagUtil = removeTagUtil;
  isSubmitting = false;
  currentLocale: string;

  constructor(
    private readonly fb: FormBuilder,
    private readonly bookmarksStorage: BookmarksStorageService,
    @Inject(LOCALE_ID) localeId: string
  ) {
    this.currentLocale = localeId.startsWith('es') ? 'es' : 'en';
    this.form = this.initForm();
  }

  private initForm(): FormGroup {
    const initialValues = {
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
    };

    return this.fb.group(initialValues);
  }

  ngAfterViewInit() {
    requestAnimationFrame(() => this.titleInput?.nativeElement.focus());
  }

  // Form control getter for template
  get control() {
    return (key: string) => this.form.get(key);
  }

  // Individual control getters for template type safety
  get title() { return this.form.get('title'); }
  get url() { return this.form.get('url'); }
  get date() { return this.form.get('date'); }
  get time() { return this.form.get('time'); }
  get tags() { return this.form.get('tags'); }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    try {
      this.isSubmitting = true;
      const bookmark: Bookmark = {
        ...this.form.value,
        uuid: uuidv4(),
        url: normalizeUrl(this.form.value.url)
      };
      
      await this.bookmarksStorage.add(bookmark);
      notifyBookmarkAdded();
      this.form.reset(this.initForm().value);
    } finally {
      this.isSubmitting = false;
    }
  }

  onUseCurrentTab(): void {
    captureTabInfo(this.form);
    ['title', 'url'].forEach(control => this.control(control)?.markAsTouched());
  }

  onDateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input?.value;
    if (!value?.includes('/')) return;

    const [first, second, year] = value.split('/');
    if (!first || !second || !year) return;

    const [dd, mm] = this.currentLocale === 'es' 
      ? [first, second] 
      : [second, first];

    this.control('date')?.setValue(`${year}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`);
  }

  onDateBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.value);
    
    if (!match) return;
    
    const [, year, month, day] = match;
    input.value = this.currentLocale === 'es'
      ? `${day}/${month}/${year}`
      : `${month}/${day}/${year}`;
  }
}
