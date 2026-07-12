import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PlmApiService } from '../../../services/plm-api.service';
import { AuthService } from '../../../services/auth.service';
import { ChangeRequest, ChangeRequestStatus } from '../../../models/plm.models';
import { CreateEcrDialogComponent } from '../create-ecr-dialog/create-ecr-dialog.component';

@Component({
  selector: 'app-ecr-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatIconModule, MatButtonModule, MatChipsModule,
    MatProgressSpinnerModule, MatDialogModule, MatTableModule, MatTooltipModule
  ],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div>
          <h1 class="page-title">Demandes de Changement (ECR)</h1>
          <p class="page-subtitle">Engineering Change Requests</p>
        </div>
        <button mat-raised-button color="primary" (click)="openCreateDialog()" id="btn-create-ecr">
          <mat-icon>add</mat-icon>
          Nouvelle ECR
        </button>
      </header>

      <div *ngIf="loading" class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>

      <div class="ecr-grid" *ngIf="!loading">
        <div *ngFor="let ecr of ecrs" class="ecr-card" [routerLink]="['/ecr', ecr.id]">
          <div class="ecr-card-header">
            <div class="ecr-icon-wrap">
              <mat-icon>engineering</mat-icon>
            </div>
            <div class="ecr-title-wrap">
              <div class="ecr-title">{{ ecr.title }}</div>
              <div class="ecr-requester">Par {{ ecr.requester.username }} · {{ ecr.createdAt | date:'short' }}</div>
            </div>
            <span class="status-badge" [class]="'status-' + ecr.status.toLowerCase()">
              {{ statusLabel(ecr.status) }}
            </span>
          </div>
          <p class="ecr-desc">{{ ecr.description || '(Pas de description)' }}</p>
          <div class="ecr-impacts">
            <span class="impact-chip" *ngFor="let rev of ecr.impactedRevisions">
              <mat-icon>arrow_right</mat-icon>
              {{ rev.itemBusinessId }} Rev {{ rev.revisionId }}
            </span>
            <span *ngIf="ecr.impactedRevisions.length === 0" class="no-impact">Aucun item impacté</span>
          </div>
          <div class="ecr-card-footer">
            <span class="footer-count">{{ ecr.impactedRevisions.length }} item(s) impacté(s)</span>
            <mat-icon class="open-icon">open_in_new</mat-icon>
          </div>
        </div>

        <div *ngIf="ecrs.length === 0" class="empty-state">
          <mat-icon>change_circle</mat-icon>
          <p>Aucune ECR créée.</p>
          <button mat-raised-button color="primary" (click)="openCreateDialog()">Create ECR</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 32px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-title { font-size: 1.75rem; font-weight: 700; color: white; margin: 0 0 4px; }
    .page-subtitle { color: rgba(255,255,255,0.4); margin: 0; font-size: 0.875rem; }
    .loading-center { display: flex; justify-content: center; padding: 80px; }

    .ecr-grid { display: flex; flex-direction: column; gap: 12px; }
    .ecr-card {
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: border-color 0.2s, transform 0.1s;
    }
    .ecr-card:hover { border-color: rgba(99,102,241,0.4); transform: translateY(-1px); }

    .ecr-card-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
    .ecr-icon-wrap { width: 40px; height: 40px; border-radius: 10px; background: rgba(249,115,22,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .ecr-icon-wrap mat-icon { color: #fb923c; font-size: 20px; width: 20px; height: 20px; }
    .ecr-title-wrap { flex: 1; }
    .ecr-title { font-size: 1rem; font-weight: 600; color: white; margin-bottom: 2px; }
    .ecr-requester { font-size: 0.75rem; color: rgba(255,255,255,0.35); }

    .status-badge { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 10px; border-radius: 6px; white-space: nowrap; align-self: flex-start; }
    .status-open { background: rgba(99,102,241,0.15); color: #818cf8; }
    .status-in_progress { background: rgba(249,115,22,0.15); color: #fb923c; }
    .status-approved { background: rgba(34,197,94,0.15); color: #4ade80; }
    .status-rejected { background: rgba(239,68,68,0.15); color: #f87171; }
    .status-closed { background: rgba(148,163,184,0.1); color: #94a3b8; }

    .ecr-desc { font-size: 0.875rem; color: rgba(255,255,255,0.45); margin: 0 0 12px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
    .ecr-impacts { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
    .impact-chip { display: inline-flex; align-items: center; gap: 2px; font-size: 0.72rem; background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.55); padding: 3px 8px; border-radius: 4px; }
    .impact-chip mat-icon { font-size: 12px; width: 12px; height: 12px; }
    .no-impact { font-size: 0.75rem; color: rgba(255,255,255,0.25); }

    .ecr-card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.05); }
    .footer-count { font-size: 0.75rem; color: rgba(255,255,255,0.3); }
    .open-icon { font-size: 16px; width: 16px; height: 16px; color: rgba(255,255,255,0.2); }

    .empty-state { text-align: center; padding: 60px; color: rgba(255,255,255,0.3); }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; display: block; }
    .empty-state p { margin: 0 0 16px; }
  `]
})
export class EcrListComponent implements OnInit {
  ecrs: ChangeRequest[] = [];
  loading = true;

  constructor(private api: PlmApiService, public auth: AuthService, private dialog: MatDialog) {}

  ngOnInit() { this.loadEcrs(); }

  loadEcrs() {
    this.loading = true;
    this.api.getEcrs().subscribe({
      next: ecrs => { this.ecrs = ecrs; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openCreateDialog() {
    const ref = this.dialog.open(CreateEcrDialogComponent, { width: '520px', panelClass: 'dark-dialog' });
    ref.afterClosed().subscribe(result => { if (result) this.loadEcrs(); });
  }

  statusLabel(status: ChangeRequestStatus): string {
    const map: Record<string, string> = { OPEN: 'Ouvert', IN_PROGRESS: 'En cours', APPROVED: 'Approuvé', REJECTED: 'Rejeté', CLOSED: 'Clôturé' };
    return map[status] ?? status;
  }
}
