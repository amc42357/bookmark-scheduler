import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';

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
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'bookmark-scheduler';
  form: FormGroup;

  constructor(
    readonly fb: FormBuilder
  ) {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    this.form = this.fb.group({
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
          this.form.patchValue({ url });
          // Use background script messaging to copy to clipboard (CSP safe)
          if ((window as any).chrome?.runtime?.id) {
            (window as any).chrome.runtime.sendMessage({ action: 'copyToClipboard', text: url });
          }
        }
      });
    } else if (navigator.clipboard) {
      // Fallback: try to read from clipboard (not the same, but a fallback)
      navigator.clipboard.readText().then(text => {
        this.form.patchValue({ url: text });
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      // Store or process the form data as needed
      console.log('Form Data:', this.form.value);
    }
  }
}
