import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PlmApiService } from '../../../services/plm-api.service';

@Component({
  selector: 'app-create-item-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>New Item PLM</h2>
      <mat-dialog-content>
        <p class="dialog-hint">Un Item sera créé avec sa Révision A (statut : En Travail).</p>

        <div *ngIf="error" class="error-msg">{{ error }}</div>

        <form [formGroup]="form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Name de l'item *</mat-label>
            <input matInput formControlName="name" id="input-item-name" placeholder="ex: Moteur Brushless 2207" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Type *</mat-label>
            <mat-select formControlName="type" id="select-item-type">
              <mat-option value="PART">Pièce (PART)</mat-option>
              <mat-option value="ASSEMBLY">Assemblage (ASSEMBLY)</mat-option>
              <mat-option value="DOCUMENT">Document</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3" id="input-item-desc"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Business ID (optionnel, auto-généré si vide)</mat-label>
            <input matInput formControlName="itemId" id="input-item-id" placeholder="ex: PRT-000099" />
          </mat-form-field>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close id="btn-cancel-create">Cancel</button>
        <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid || loading" id="btn-confirm-create">
          <mat-spinner *ngIf="loading" diameter="18" class="inline-spinner"></mat-spinner>
          <span *ngIf="!loading">Create Item</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container { background: #1e293b; color: white; min-width: 420px; }
    :host ::ng-deep .mat-mdc-dialog-title { color: white !important; }
    .dialog-hint { font-size: 0.8rem; color: rgba(255,255,255,0.4); margin-bottom: 16px; }
    .full-width { width: 100%; margin-bottom: 8px; }
    .error-msg { color: #f87171; background: rgba(239,68,68,0.1); padding: 8px 12px; border-radius: 6px; margin-bottom: 12px; font-size: 0.85rem; }
    .inline-spinner { display: inline-block; }
    :host ::ng-deep .mat-mdc-form-field .mdc-text-field { background: rgba(255,255,255,0.05) !important; }
    :host ::ng-deep .mat-mdc-form-field label { color: rgba(255,255,255,0.5) !important; }
    :host ::ng-deep .mat-mdc-form-field input, :host ::ng-deep .mat-mdc-form-field textarea { color: white !important; }
    :host ::ng-deep .mat-mdc-select-value { color: white !important; }
  `]
})
export class CreateItemDialogComponent {
  form = this.fb.group({
    name: ['', Validators.required],
    type: ['PART', Validators.required],
    description: [''],
    itemId: ['']
  });
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private api: PlmApiService, private dialogRef: MatDialogRef<CreateItemDialogComponent>) {}

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { name, type, description, itemId } = this.form.value;
    this.api.createItem({
      name: name!,
      type: type as any,
      description: description || undefined,
      itemId: itemId || undefined
    }).subscribe({
      next: (item) => {
        this.loading = false;
        this.dialogRef.close(item);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error creating item';
        this.loading = false;
      }
    });
  }
}
