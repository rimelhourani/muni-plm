import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PlmApiService } from '../../../services/plm-api.service';
import { AuthService } from '../../../services/auth.service';
import { ChangeRequest, ChangeRequestStatus } from '../../../models/plm.models';

@Component({
  selector: 'app-ecr-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatIconModule, MatButtonModule, MatChipsModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="detail-container" *ngIf="!loading; else loadingTpl">
      <div class="breadcrumb">
        <a routerLink="/ecr" class="bc-link">ECR</a>
        <mat-icon class="bc-sep">chevron_right</mat-icon>
        <span class="bc-current">{{ ecr?.title }}</span>
      </div>

      <div class="ecr-header">
        <div class="ecr-icon-wrap"><mat-icon>engineering</mat-icon></div>
        <div class="ecr-meta">
          <h1 class="ecr-title">{{ ecr?.title }}</h1>
          <div class="ecr-tags">
            <span class="status-badge" [class]="'status-' + ecr?.status?.toLowerCase()">{{ statusLabel(ecr?.status) }}</span>
            <span class="tag-meta"><mat-icon>person</mat-icon> {{ ecr?.requester?.username }}</span>
            <span class="tag-meta"><mat-icon>schedule</mat-icon> {{ ecr?.createdAt | date:'medium' }}</span>
          </div>
          <p class="ecr-desc">{{ ecr?.description || '(Pas de description)' }}</p>
        </div>
      </div>

      <!-- Workflow Actions -->
      <div class="actions-panel" *ngIf="availableTransitions.length > 0">
        <div class="actions-label">Actions disponibles :</div>
        <div class="actions-buttons">
          <button *ngFor="let t of availableTransitions" mat-raised-button [color]="t.color"
                  (click)="updateStatus(t.target)" [id]="'btn-ecr-' + t.target">
            <mat-icon>{{ t.icon }}</mat-icon>
            {{ t.label }}
          </button>
        </div>
      </div>

      <!-- Impacted Items -->
      <mat-card class="impacts-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>inventory_2</mat-icon>
          <mat-card-title>Révisions Impactées</mat-card-title>
          <mat-card-subtitle>{{ ecr?.impactedRevisions?.length || 0 }} révision(s) concernée(s)</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="impact-list">
            <div *ngFor="let rev of ecr?.impactedRevisions" class="impact-row" [routerLink]="['/items', rev.itemId]">
              <div class="impact-icon" [class]="'type-bg-' + rev.itemType?.toLowerCase()">
                <mat-icon>{{ getIcon(rev.itemType) }}</mat-icon>
              </div>
              <div class="impact-info">
                <div class="impact-name">{{ rev.itemBusinessId }} Rev {{ rev.revisionId }} — {{ rev.itemName }}</div>
                <div class="impact-state">
                  <span class="state-badge" [class]="'badge-' + rev.lifecycleState?.toLowerCase()">{{ stateLabel(rev.lifecycleState) }}</span>
                </div>
              </div>
              <mat-icon class="open-icon">open_in_new</mat-icon>
            </div>
            <div *ngIf="!ecr?.impactedRevisions?.length" class="empty-impacts">Aucune révision impactée.</div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <ng-template #loadingTpl>
      <div class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>
    </ng-template>
  `,
  styles: [`
    .detail-container { padding: 24px 32px; }
    .loading-center { display: flex; justify-content: center; padding: 80px; }
    .breadcrumb { display: flex; align-items: center; gap: 4px; margin-bottom: 20px; }
    .bc-link { color: rgba(255,255,255,0.4); text-decoration: none; font-size: 0.85rem; }
    .bc-link:hover { color: #818cf8; }
    .bc-sep { font-size: 16px; color: rgba(255,255,255,0.2); }
    .bc-current { font-size: 0.85rem; color: rgba(255,255,255,0.7); }

    .ecr-header { background: #1e293b; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; display: flex; gap: 20px; margin-bottom: 16px; }
    .ecr-icon-wrap { width: 56px; height: 56px; border-radius: 14px; background: rgba(249,115,22,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .ecr-icon-wrap mat-icon { color: #fb923c; font-size: 26px; width: 26px; height: 26px; }
    .ecr-meta { flex: 1; }
    .ecr-title { font-size: 1.4rem; font-weight: 700; color: white; margin: 0 0 10px; }
    .ecr-tags { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 10px; }
    .tag-meta { display: flex; align-items: center; gap: 4px; font-size: 0.8rem; color: rgba(255,255,255,0.4); }
    .tag-meta mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .ecr-desc { color: rgba(255,255,255,0.45); font-size: 0.875rem; margin: 0; }

    .status-badge { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 10px; border-radius: 6px; }
    .status-open { background: rgba(99,102,241,0.15); color: #818cf8; }
    .status-in_progress { background: rgba(249,115,22,0.15); color: #fb923c; }
    .status-approved { background: rgba(34,197,94,0.15); color: #4ade80; }
    .status-rejected { background: rgba(239,68,68,0.15); color: #f87171; }
    .status-closed { background: rgba(148,163,184,0.1); color: #94a3b8; }

    .actions-panel { background: rgba(99,102,241,0.07); border: 1px solid rgba(99,102,241,0.2); border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
    .actions-label { font-size: 0.8rem; color: rgba(255,255,255,0.5); font-weight: 500; }
    .actions-buttons { display: flex; gap: 8px; flex-wrap: wrap; }

    .impacts-card { background: #1e293b !important; border-radius: 12px !important; border: 1px solid rgba(255,255,255,0.07) !important; }
    :host ::ng-deep .impacts-card .mat-mdc-card-header { padding: 20px 20px 0; }
    :host ::ng-deep .impacts-card .mat-mdc-card-title { color: white !important; font-size: 0.95rem !important; }
    :host ::ng-deep .impacts-card .mat-mdc-card-subtitle { color: rgba(255,255,255,0.4) !important; }
    :host ::ng-deep .impacts-card .mat-mdc-card-content { padding: 16px 20px !important; }
    :host ::ng-deep .impacts-card .mat-mdc-card-avatar mat-icon { color: #818cf8; }

    .impact-list { display: flex; flex-direction: column; gap: 8px; }
    .impact-row { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; cursor: pointer; transition: background 0.15s; }
    .impact-row:hover { background: rgba(255,255,255,0.04); }
    .impact-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .impact-icon mat-icon { font-size: 20px; width: 20px; height: 20px; color: white; }
    .type-bg-part { background: rgba(56,189,248,0.15); }
    .type-bg-assembly { background: rgba(99,102,241,0.15); }
    .type-bg-document { background: rgba(249,115,22,0.15); }
    .impact-info { flex: 1; }
    .impact-name { font-size: 0.875rem; color: rgba(255,255,255,0.85); font-weight: 500; }
    .impact-state { margin-top: 4px; }
    .state-badge { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; padding: 3px 8px; border-radius: 4px; }
    .badge-working { background: rgba(234,179,8,0.15); color: #fbbf24; }
    .badge-under_review { background: rgba(168,85,247,0.15); color: #c084fc; }
    .badge-released { background: rgba(34,197,94,0.15); color: #4ade80; }
    .badge-obsolete { background: rgba(148,163,184,0.1); color: #94a3b8; }
    .open-icon { font-size: 16px; width: 16px; height: 16px; color: rgba(255,255,255,0.2); }

    .empty-impacts { color: rgba(255,255,255,0.3); font-size: 0.875rem; text-align: center; padding: 20px; }
  `]
})
export class EcrDetailComponent implements OnInit {
  ecr: ChangeRequest | null = null;
  loading = true;

  constructor(private route: ActivatedRoute, private api: PlmApiService, public auth: AuthService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getEcr(id).subscribe({
      next: ecr => { this.ecr = ecr; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get availableTransitions(): any[] {
    if (!this.ecr) return [];
    const s = this.ecr.status;
    const isApprover = this.auth.hasRole('ADMIN', 'APPROVER');
    const transitions = [];
    if (s === 'OPEN') transitions.push({ target: 'IN_PROGRESS', label: 'Démarrer l\'analyse', icon: 'play_arrow', color: 'accent' });
    if (s === 'IN_PROGRESS' && isApprover) {
      transitions.push({ target: 'APPROVED', label: 'Approuver', icon: 'check_circle', color: 'primary' });
      transitions.push({ target: 'REJECTED', label: 'Rejeter', icon: 'cancel', color: 'warn' });
    }
    if (s === 'APPROVED' || s === 'REJECTED') transitions.push({ target: 'CLOSED', label: 'Clôturer', icon: 'archive', color: '' });
    return transitions;
  }

  updateStatus(status: ChangeRequestStatus) {
    if (!this.ecr) return;
    this.api.updateEcrStatus(this.ecr.id, status).subscribe({
      next: ecr => { this.ecr = ecr; },
      error: err => alert(err.error?.message || 'Erreur lors de la mise à jour')
    });
  }

  statusLabel(status: any): string {
    const map: Record<string, string> = { OPEN: 'Ouvert', IN_PROGRESS: 'En cours', APPROVED: 'Approuvé', REJECTED: 'Rejeté', CLOSED: 'Clôturé' };
    return map[status] ?? status;
  }

  stateLabel(state: any): string {
    const map: Record<string, string> = { WORKING: 'En Travail', UNDER_REVIEW: 'En Validation', RELEASED: 'Libéré', OBSOLETE: 'Obsolète' };
    return map[state] ?? state;
  }

  getIcon(type: any): string {
    return type === 'ASSEMBLY' ? 'widgets' : type === 'DOCUMENT' ? 'description' : 'settings';
  }
}
