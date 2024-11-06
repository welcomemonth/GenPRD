import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.css'
})
export class DialogComponent {
  constructor(public dialogRef: MatDialogRef<DialogComponent>) {}

  onKeep(): void {
    this.dialogRef.close('保留');
  }

  onDiscard(): void {
    this.dialogRef.close('放弃');
  }

  onCancel(): void {
    this.dialogRef.close('取消');
  }
}
