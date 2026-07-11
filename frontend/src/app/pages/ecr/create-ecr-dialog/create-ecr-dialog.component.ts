import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PlmApiService } from '../../../services/plm-api.service';
import { ItemRevision } from '../../../models/plm.models';

@Component({
  selector: 'app-create-ecr-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatProgressSpinnerModule, MatCheckboxModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>Nouvelle Demande de Changement (ECR)</h2>
      <mat-dialog-content>
        <div *ngIf="error" class="error-msg">{{ error }}</div>
        <form [formGroup]="form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Titre *</mat-label>
            <input matInput formControlName="title" id="input-ecr-title" placeholder="ex: Remplacement du moteur brushless" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="4" id="input-ecr-desc" placeholder="Décrivez la raison et l'impact du changement..."></textarea>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Révisions impactées</mat-label>
            <mat-select formControlName="impactedRevisionIds" multiple id="select-ecr-revisions">
              <mat-option *ngFor="let rev of revisions" [value]="rev.id">
                {{ rev.itemBusinessId }} Rev {{ rev.revisionId }} — {{ rev.itemName }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close id="btn-cancel-ecr">Annuler</button>
        <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid || loading" id="btn-confirm-ecr">
          <mat-spinner *ngIf="loading" diameter="18" class="inline-spinner"></mat-spinner>
          <span *ngIf="!loading">Créer l'ECR</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container { background: #1e293b; color: white; min-width: 460px; }
    :host ::ng-deep .mat-mdc-dialog-title { color: white !important; }
    .full-width { width: 100%; margin-bottom: 8px; }
    .error-msg { color: #f87171; background: rgba(239,68,68,0.1); padding: 8px 12px; border-radius: 6px; margin-bottom: 12px; font-size: 0.85rem; }
    .inline-spinner { display: inline-block; }
    :host ::ng-deep .mat-mdc-form-field .mdc-text-field { background: rgba(255,255,255,0.05) !important; }
    :host ::ng-deep .mat-mdc-form-field label { color: rgba(255,255,255,0.5) !important; }
    :host ::ng-deep .mat-mdc-form-field input, :host ::ng-deep .mat-mdc-form-field textarea { color: white !important; }
    :host ::ng-deep .mat-mdc-select-value { color: white !important; }
  `]
})
export class CreateEcrDialogComponent implements OnInit {
  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    impactedRevisionIds: [[]]
  });
  revisions: ItemRevision[] = [];
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private api: PlmApiService, private dialogRef: MatDialogRef<CreateEcrDialogComponent>) {}

  ngOnInit() {
    this.api.searchItems().subscribe(items => {
      this.revisions = items.flatMap(i => i.revisions);
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    const { title, description, impactedRevisionIds } = this.form.value;
    this.api.createEcr({
      title: title!,
      description: description || undefined,
      impactedRevisionIds: (impactedRevisionIds as any[]) || []
    }).subscribe({
      next: (ecr) => { this.loading = false; this.dialogRef.close(ecr); },
      error: (err) => { this.error = err.error?.message || 'Erreur lors de la création'; this.loading = false; }
    });
  }
}
