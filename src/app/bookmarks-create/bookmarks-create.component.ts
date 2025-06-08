import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { BookmarksStorageService } from '../services/bookmarks-storage.service';
import { v4 as uuidv4 } from 'uuid';

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
        MatChipsModule
    ],
    templateUrl: './bookmarks-create.component.html',
    styleUrls: ['./bookmarks-create.component.scss']
})
export class BookmarksCreateComponent {
    readonly form: FormGroup;
    tags: string[] = [];
    tagInput: string = '';
    minDate: string;
    constructor(
        readonly fb: FormBuilder,
        readonly bookmarksStorage: BookmarksStorageService
    ) {
        this.form = this.fb.group({
            title: ['', Validators.required],
            date: ['', Validators.required],
            time: ['', Validators.required],
            url: ['', [Validators.required]],
            tags: [[]]
        });
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        this.minDate = `${yyyy}-${mm}-${dd}`;
        this.setFormDefaults();
    }
    private setFormDefaults() {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        this.form.patchValue({
            date: `${yyyy}-${mm}-${dd}`,
            time: `${hh}:${min}`
        });
    }
    onSubmit() {
        if (this.form.valid) {
            this.form.patchValue({ tags: this.tags });
            const bookmark = { ...this.form.value, uuid: uuidv4() };
            this.bookmarksStorage.add(bookmark);
            this.form.reset();
            this.tags = [];
            this.setFormDefaults();
        } else {
            this.form.markAllAsTouched();
        }
    }

    captureTabInfo() {
        const chromeTabs = (window as any)?.chrome?.tabs;
        if (chromeTabs) {
            chromeTabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
                if (tabs && tabs.length > 0) {
                    this.form.patchValue({
                        title: tabs[0].title ?? '',
                        url: tabs[0].url ?? ''
                    });
                }
            });
        } else {
            // Fallback for normal web usage
            this.form.patchValue({
                title: document.title,
                url: window.location.href
            });
        }
    }

    addTag(event: any) {
        const input = event.input;
        const value = event.value?.trim();
        if (value && !this.tags.includes(value)) {
            this.tags.push(value);
        }
        if (input) {
            input.value = '';
        }
    }
    removeTag(tag: string) {
        const index = this.tags.indexOf(tag);
        if (index >= 0) {
            this.tags.splice(index, 1);
        }
    }
}
