import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
    selector: 'app-schedule-bookmark-form',
    standalone: true,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule,
        ReactiveFormsModule
    ],
    templateUrl: './schedule-bookmark-form.component.html',
    styleUrls: ['./schedule-bookmark-form.component.scss']
})
export class ScheduleBookmarkFormComponent {
    @Input() form!: FormGroup;
    @Output() submitForm = new EventEmitter<void>();
    @Output() captureUrl = new EventEmitter<void>();

    onSubmit() {
        this.submitForm.emit();
    }

    captureCurrentTabUrl() {
        this.captureUrl.emit();
    }
}
