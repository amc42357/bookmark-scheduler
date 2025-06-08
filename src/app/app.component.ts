import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatTabsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCardModule,
    MatToolbarModule,
    ReactiveFormsModule,
    CommonModule,
    MatListModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: navigator.language }
  ]
})
export class AppComponent {
  title = 'bookmark-scheduler';
  form: FormGroup;
  events: Array<{ name: string; url: string; date: string; time: string }> = [];
  selectedTabIndex = 0;

  constructor(
    readonly fb: FormBuilder
  ) {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    this.form = this.fb.group({
      name: ['', Validators.required],
      url: ['', [Validators.required, Validators.minLength(5)]],
      date: ['', Validators.required],
      time: [currentTime, Validators.required]
    });
  }

  captureCurrentTabUrl() {
    // Chrome extension API: get current tab URL
    if ((window as any).chrome?.tabs) {
      (window as any).chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
        if (tabs && tabs.length > 0) {
          const url = tabs[0].url;
          const title = tabs[0].title ?? '';
          this.form.patchValue({ url, name: title });
          // Use background script messaging to copy to clipboard (CSP safe)
          if ((window as any).chrome?.runtime?.id) {
            (window as any).chrome.runtime.sendMessage({ action: 'copyToClipboard', text: url });
          }
        }
      });
    } else if (navigator.clipboard) {
      // Fallback: try to read from clipboard (not the same, but a fallback)
      navigator.clipboard.readText().then(text => {
        this.form.patchValue({ url: text, name: '' });
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const { name, url, date, time } = this.form.value;
      this.events = [
        ...this.events,
        { name, url, date, time }
      ];
      this.form.reset({ name: '', url: '', date: '', time: '' });
      this.selectedTabIndex = 1; // Automatically switch to the event list after save
    }
  }

  showEvents() {
    this.selectedTabIndex = 1;
  }

  deleteEvent(eventToDelete: { url: string; date: string; time: string }) {
    this.events = this.events.filter(event => event !== eventToDelete);
  }

  editEvent(eventToEdit: { url: string; date: string; time: string }) {
    // Placeholder for edit functionality. You can implement a dialog or inline editing here.
    alert('Edit event functionality coming soon!');
  }
}
