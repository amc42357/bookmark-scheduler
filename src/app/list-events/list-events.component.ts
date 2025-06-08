import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-list-events',
    standalone: true,
    imports: [CommonModule, MatListModule, MatIconModule],
    templateUrl: './list-events.component.html',
    styleUrls: ['./list-events.component.sass']
})
export class ListEventsComponent {
    @Input() events: any[] = [];
    @Output() edit = new EventEmitter<any>();
    @Output() delete = new EventEmitter<any>();

    editEvent(event: any) {
        this.edit.emit(event);
    }

    deleteEvent(event: any) {
        this.delete.emit(event);
    }
}
