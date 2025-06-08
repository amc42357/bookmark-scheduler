import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { BookmarksCreateComponent } from './bookmarks-create/bookmarks-create.component';
import { BookmarksListComponent } from './bookmarks-list/bookmarks-list.component';
import { BookmarkAlarmService } from './services/bookmark-alarm.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatTabsModule, MatIconModule, BookmarksCreateComponent, BookmarksListComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private readonly alarmService: BookmarkAlarmService) { }
}
