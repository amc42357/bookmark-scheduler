import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { BookmarksCreateComponent } from './bookmarks-create/bookmarks-create.component';
import { BookmarksListComponent } from './bookmarks-list/bookmarks-list.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatTabsModule, MatIconModule, BookmarksCreateComponent, BookmarksListComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private readonly translate: TranslateService) {
    const browserLang = translate.getBrowserLang() ?? 'en';
    const lang = /en|es/.exec(browserLang)?.[0] ?? 'en';
    translate.use(lang);
  }
}
