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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditEventDialogComponent } from './edit-event-dialog/edit-event-dialog.component';
import { MatConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { ListEventsComponent } from './list-events/list-events.component';
import { ScheduleBookmarkFormComponent } from './schedule-bookmark-form/schedule-bookmark-form.component';

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
    MatListModule,
    MatSnackBarModule,
    MatDialogModule,
    EditEventDialogComponent,
    MatConfirmDialogComponent,
    ListEventsComponent,
    ScheduleBookmarkFormComponent
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
  events: Array<{
    name: string;
    url: string;
    date: string;
    time: string;
    id: string;
    scheduled?: boolean;
  }> = [];
  selectedTabIndex = 0;
  private checkInterval: any;

  constructor(
    readonly fb: FormBuilder,
    readonly snackBar: MatSnackBar,
    readonly dialog: MatDialog
  ) {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const currentDate = now.toISOString().split('T')[0];
    this.form = this.fb.group({
      name: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern('https?://.+')]],
      date: [currentDate, Validators.required],
      time: [currentTime, Validators.required]
    });
    this.loadEvents();
    this.startScheduleChecker();
  }

  ngOnInit() {
    // Load selected tab index
    if ((window as any).chrome?.storage) {
      (window as any).chrome.storage.sync.get(['selectedTabIndex'], (result: any) => {
        if (result.selectedTabIndex !== undefined) {
          this.selectedTabIndex = result.selectedTabIndex;
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  private loadEvents() {
    if ((window as any).chrome?.storage) {
      (window as any).chrome.storage.sync.get(['scheduledEvents'], (result: any) => {
        if (result.scheduledEvents) {
          this.events = result.scheduledEvents;
          this.scheduleAllEvents();
        }
      });
    } else {
      const saved = localStorage.getItem('scheduledEvents');
      if (saved) {
        this.events = JSON.parse(saved);
        this.scheduleAllEvents();
      }
    }
  }

  private saveEvents() {
    const eventsToSave = this.events.map(event => ({
      ...event,
      scheduled: undefined
    }));
    if ((window as any).chrome?.storage) {
      (window as any).chrome.storage.sync.set({ scheduledEvents: eventsToSave });
    } else {
      localStorage.setItem('scheduledEvents', JSON.stringify(eventsToSave));
    }
  }

  private startScheduleChecker() {
    this.checkInterval = setInterval(() => {
      this.checkScheduledEvents();
    }, 60000);
  }

  private checkScheduledEvents() {
    const now = new Date();
    this.events.forEach(event => {
      if (event.scheduled) return;
      const eventDateTime = new Date(`${event.date}T${event.time}`);
      const timeDiff = eventDateTime.getTime() - now.getTime();
      if (timeDiff > 0 && timeDiff <= 60000) {
        this.scheduleEvent(event);
      }
    });
  }

  private scheduleAllEvents() {
    const now = new Date();
    this.events.forEach(event => {
      if (event.scheduled) return;
      const eventDateTime = new Date(`${event.date}T${event.time}`);
      if (eventDateTime > now) {
        this.scheduleEvent(event);
      }
    });
  }

  private scheduleEvent(event: any) {
    const eventDateTime = new Date(`${event.date}T${event.time}`);
    const now = new Date();
    const timeUntilEvent = eventDateTime.getTime() - now.getTime();
    if (timeUntilEvent <= 0) {
      this.openEventUrl(event);
      return;
    }
    event.scheduled = true;
    setTimeout(() => {
      this.openEventUrl(event);
    }, timeUntilEvent);
    this.showNotification(`Scheduled: ${event.name} will open at ${event.time}`);
  }

  private openEventUrl(event: any) {
    if ((window as any).chrome?.tabs) {
      (window as any).chrome.tabs.create({ url: event.url, active: true });
    } else {
      window.open(event.url, '_blank');
    }
    this.showNotification(`Opening: ${event.name}`);
  }

  private showNotification(message: string) {
    if ((window as any).chrome?.notifications) {
      (window as any).chrome.notifications.create({
        type: 'basic',
        iconUrl: 'assets/icon48.png',
        title: 'Bookmark Scheduler',
        message: message
      });
    } else {
      this.snackBar.open(message, 'OK', { duration: 3000 });
    }
  }

  captureCurrentTabUrl() {
    if ((window as any).chrome?.tabs) {
      (window as any).chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
        if (tabs && tabs.length > 0) {
          const url = tabs[0].url;
          const title = tabs[0].title ?? '';
          this.form.patchValue({ url, name: title });
          if ((window as any).chrome?.runtime?.id) {
            (window as any).chrome.runtime.sendMessage({ action: 'copyToClipboard', text: url });
          }
        }
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.readText().then(text => {
        this.form.patchValue({ url: text, name: '' });
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const { name, url, date, time } = this.form.value;
      const newEvent = {
        name,
        url,
        date,
        time,
        id: this.generateId(),
        scheduled: false
      };
      this.events = [...this.events, newEvent];
      this.scheduleEvent(newEvent);
      this.saveEvents();
      this.form.reset({
        name: '',
        url: '',
        date: this.form.get('date')?.value,
        time: this.form.get('time')?.value
      });
      this.saveTabIndex(1); // Persist tab index when switching
      this.snackBar.open('Event saved!', 'OK', { duration: 2000 });
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  deleteEvent(eventToDelete: any) {
    const dialogRef = this.dialog.open(MatConfirmDialogComponent, {
      width: '340px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete "${eventToDelete.name}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.events = this.events.filter(event => event.id !== eventToDelete.id);
        this.saveEvents();
        this.snackBar.open('Event deleted', 'OK', { duration: 2000 });
      }
    });
  }

  editEvent(eventToEdit: any) {
    const dialogRef = this.dialog.open(EditEventDialogComponent, {
      width: '340px',
      data: { ...eventToEdit }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.events.findIndex(e => e.id === result.id);
        if (index !== -1) {
          this.events[index] = { ...result, scheduled: false };
          this.saveEvents();
          this.scheduleEvent(this.events[index]);
          this.snackBar.open('Event updated!', 'OK', { duration: 2000 });
        }
      }
    });
  }

  // Add this method to save tab index
  public saveTabIndex(index: number) {
    this.selectedTabIndex = index;
    if ((window as any).chrome?.storage) {
      (window as any).chrome.storage.sync.set({ selectedTabIndex: index });
    }
  }
}
