import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PlmApiService } from '../../services/plm-api.service';
import { Item, ItemRevision, ChangeRequest, LifecycleState } from '../../models/plm.models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatIconModule, MatButtonModule, MatChipsModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="dashboard">
      <header class="page-header">
        <div>
          <h1 class="page-title">Tableau de bord</h1>
          <p class="page-subtitle">Vue d'ensemble de votre base de données PLM</p>
        </div>
      </header>

      <div *ngIf="loading" class="loading-center">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <ng-container *ngIf="!loading">
        <!-- KPI Cards -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-icon kpi-blue"><mat-icon>inventory_2</mat-icon></div>
            <div class="kpi-content">
              <div class="kpi-value">{{ totalItems }}</div>
              <div class="kpi-label">Items Total</div>
            </div>
          </div>
          <div class="kpi-card" *ngFor="let stat of lifecycleStats">
            <div class="kpi-icon" [class]="'kpi-' + stat.color"><mat-icon>{{ stat.icon }}</mat-icon></div>
            <div class="kpi-content">
              <div class="kpi-value">{{ stat.count }}</div>
              <div class="kpi-label">{{ stat.label }}</div>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon kpi-orange"><mat-icon>change_circle</mat-icon></div>
            <div class="kpi-content">
              <div class="kpi-value">{{ openEcrs }}</div>
              <div class="kpi-label">ECR Ouverts</div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="section-grid">
          <!-- Recent Items -->
          <mat-card class="section-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>schedule</mat-icon>
              <mat-card-title>Activité Récente</mat-card-title>
              <mat-card-subtitle>Dernières révisions modifiées</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="activity-list">
                <div *ngFor="let rev of recentRevisions" class="activity-row" [routerLink]="['/items', rev.itemId]">
                  <div class="activity-icon-wrap" [class]="'state-' + rev.lifecycleState.toLowerCase()">
                    <mat-icon>{{ getItemIcon(rev.itemType) }}</mat-icon>
                  </div>
                  <div class="activity-info">
                    <div class="activity-name">{{ rev.itemBusinessId }} · Rev {{ rev.revisionId }}</div>
                    <div class="activity-meta">{{ rev.itemName }}</div>
                  </div>
                  <div class="state-badge" [class]="'badge-' + rev.lifecycleState.toLowerCase()">
                    {{ stateLabel(rev.lifecycleState) }}
                  </div>
                </div>
                <div *ngIf="recentRevisions.length === 0" class="empty-state">Aucune activité récente</div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Open ECRs -->
          <mat-card class="section-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>change_circle</mat-icon>
              <mat-card-title>Demandes de Changement</mat-card-title>
              <mat-card-subtitle>ECR en cours de traitement</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="activity-list">
                <div *ngFor="let ecr of activeEcrs" class="activity-row" [routerLink]="['/ecr', ecr.id]">
                  <div class="activity-icon-wrap ecr-icon">
                    <mat-icon>engineering</mat-icon>
                  </div>
                  <div class="activity-info">
                    <div class="activity-name">{{ ecr.title }}</div>
                    <div class="activity-meta">Par {{ ecr.requester.username }} · {{ ecr.impactedRevisions.length }} item(s)</div>
                  </div>
                  <div class="state-badge" [class]="'badge-ecr-' + ecr.status.toLowerCase()">
                    {{ ecrStatusLabel(ecr.status) }}
                  </div>
                </div>
                <div *ngIf="activeEcrs.length === 0" class="empty-state">Aucune ECR active</div>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button routerLink="/ecr" id="btn-view-all-ecr">Voir toutes les ECR</button>
            </mat-card-actions>
          </mat-card>
        </div>

        <!-- Concept guide -->
        <mat-card class="concept-card">
          <mat-card-content>
            <div class="concept-header">
              <mat-icon>school</mat-icon>
              <span>Guide des Concepts PLM</span>
            </div>
            <div class="concept-grid">
              <div class="concept-item" *ngFor="let c of concepts">
                <mat-icon [style.color]="c.color">{{ c.icon }}</mat-icon>
                <div>
                  <div class="concept-name">{{ c.name }}</div>
                  <div class="concept-desc">{{ c.desc }}</div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </ng-container>
    </div>
  `,
  styles: [`
    .dashboard { padding: 32px; max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 32px; }
    .page-title { font-size: 1.75rem; font-weight: 700; color: white; margin: 0 0 4px; }
    .page-subtitle { color: rgba(255,255,255,0.4); margin: 0; font-size: 0.875rem; }
    .loading-center { display: flex; justify-content: center; padding: 80px; }

    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .kpi-card {
      background: #1e293b;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      border: 1px solid rgba(255,255,255,0.07);
      transition: border-color 0.2s;
    }
    .kpi-card:hover { border-color: rgba(99,102,241,0.3); }
    .kpi-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .kpi-icon mat-icon { font-size: 22px; width: 22px; height: 22px; color: white; }
    .kpi-blue { background: rgba(99,102,241,0.2); }
    .kpi-yellow { background: rgba(234,179,8,0.2); }
    .kpi-purple { background: rgba(168,85,247,0.2); }
    .kpi-green { background: rgba(34,197,94,0.2); }
    .kpi-gray { background: rgba(148,163,184,0.2); }
    .kpi-orange { background: rgba(249,115,22,0.2); }
    .kpi-value { font-size: 1.75rem; font-weight: 700; color: white; line-height: 1; }
    .kpi-label { font-size: 0.75rem; color: rgba(255,255,255,0.45); margin-top: 4px; }

    .section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    @media (max-width: 900px) { .section-grid { grid-template-columns: 1fr; } }

    .section-card { background: #1e293b !important; border-radius: 12px !important; border: 1px solid rgba(255,255,255,0.07) !important; }
    :host ::ng-deep .section-card .mat-mdc-card-header { padding: 20px 20px 0; }
    :host ::ng-deep .section-card .mat-mdc-card-title { color: white !important; font-size: 0.95rem !important; }
    :host ::ng-deep .section-card .mat-mdc-card-subtitle { color: rgba(255,255,255,0.4) !important; }
    :host ::ng-deep .section-card .mat-mdc-card-content { padding: 16px 20px !important; }
    :host ::ng-deep .section-card .mat-mdc-card-avatar mat-icon { color: #818cf8; }

    .activity-list { display: flex; flex-direction: column; gap: 4px; }
    .activity-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .activity-row:hover { background: rgba(255,255,255,0.04); }
    .activity-icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .activity-icon-wrap mat-icon { font-size: 18px; width: 18px; height: 18px; color: white; }
    .state-working { background: rgba(234,179,8,0.15); }
    .state-under_review { background: rgba(168,85,247,0.15); }
    .state-released { background: rgba(34,197,94,0.15); }
    .state-obsolete { background: rgba(148,163,184,0.15); }
    .ecr-icon { background: rgba(249,115,22,0.15); }

    .activity-info { flex: 1; min-width: 0; }
    .activity-name { font-size: 0.85rem; font-weight: 500; color: rgba(255,255,255,0.85); }
    .activity-meta { font-size: 0.75rem; color: rgba(255,255,255,0.4); }

    .state-badge {
      font-size: 0.65rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 3px 8px;
      border-radius: 4px;
      white-space: nowrap;
    }
    .badge-working { background: rgba(234,179,8,0.15); color: #fbbf24; }
    .badge-under_review { background: rgba(168,85,247,0.15); color: #c084fc; }
    .badge-released { background: rgba(34,197,94,0.15); color: #4ade80; }
    .badge-obsolete { background: rgba(148,163,184,0.1); color: #94a3b8; }
    .badge-ecr-open { background: rgba(99,102,241,0.15); color: #818cf8; }
    .badge-ecr-in_progress { background: rgba(249,115,22,0.15); color: #fb923c; }
    .badge-ecr-approved { background: rgba(34,197,94,0.15); color: #4ade80; }
    .badge-ecr-rejected { background: rgba(239,68,68,0.15); color: #f87171; }
    .badge-ecr-closed { background: rgba(148,163,184,0.1); color: #94a3b8; }

    .empty-state { color: rgba(255,255,255,0.25); font-size: 0.85rem; text-align: center; padding: 20px; }

    .concept-card { background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05)) !important; border: 1px solid rgba(99,102,241,0.2) !important; border-radius: 12px !important; }
    :host ::ng-deep .concept-card .mat-mdc-card-content { padding: 20px !important; }
    .concept-header { display: flex; align-items: center; gap: 8px; color: #818cf8; font-weight: 600; margin-bottom: 16px; font-size: 0.9rem; }
    .concept-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
    .concept-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px; }
    .concept-item mat-icon { flex-shrink: 0; margin-top: 2px; font-size: 20px; width: 20px; height: 20px; }
    .concept-name { font-size: 0.85rem; font-weight: 600; color: rgba(255,255,255,0.85); margin-bottom: 2px; }
    .concept-desc { font-size: 0.75rem; color: rgba(255,255,255,0.4); line-height: 1.4; }
  `]
})
export class DashboardComponent implements OnInit {
  loading = true;
  totalItems = 0;
  openEcrs = 0;
  lifecycleStats: any[] = [];
  recentRevisions: ItemRevision[] = [];
  activeEcrs: ChangeRequest[] = [];

  concepts = [
    { icon: 'inventory_2', color: '#818cf8', name: 'Item & Item Revision', desc: 'Un Item est le master PLM. Ses révisions (A, B, C...) portent l\'état du cycle de vie.' },
    { icon: 'account_tree', color: '#4ade80', name: 'BOM (Bill of Materials)', desc: 'Structure produit arborescente. Un assemblage contient des composants avec quantités.' },
    { icon: 'lock', color: '#fbbf24', name: 'Checkout / Checkin', desc: 'Verrouille une révision pour modification exclusive. Semblable au locking Teamcenter.' },
    { icon: 'swap_horiz', color: '#c084fc', name: 'Cycle de Vie', desc: 'WIP → Under Review → Released → Obsolete. Seul un Approbateur peut libérer.' },
    { icon: 'change_circle', color: '#fb923c', name: 'ECR (Engineering Change)', desc: 'Demande formelle de modification liée aux Items impactés, avec workflow d\'approbation.' },
    { icon: 'folder_special', color: '#38bdf8', name: 'Home Folder', desc: 'Espace de travail personnel (My Teamcenter). Organise les Items dans des dossiers.' },
  ];

  constructor(private api: PlmApiService) {}

  ngOnInit() {
    forkJoin({
      items: this.api.searchItems(),
      ecrs: this.api.getEcrs()
    }).subscribe({
      next: ({ items, ecrs }) => {
        this.totalItems = items.length;

        // Flatten all revisions
        const allRevisions = items.flatMap(i => i.revisions);
        const stateCounts: Record<string, number> = {};
        allRevisions.forEach(r => {
          stateCounts[r.lifecycleState] = (stateCounts[r.lifecycleState] ?? 0) + 1;
        });

        this.lifecycleStats = [
          { label: 'En Travail', state: 'WORKING', count: stateCounts['WORKING'] ?? 0, icon: 'edit_note', color: 'yellow' },
          { label: 'En Validation', state: 'UNDER_REVIEW', count: stateCounts['UNDER_REVIEW'] ?? 0, icon: 'pending_actions', color: 'purple' },
          { label: 'Libérés', state: 'RELEASED', count: stateCounts['RELEASED'] ?? 0, icon: 'check_circle', color: 'green' },
          { label: 'Obsolètes', state: 'OBSOLETE', count: stateCounts['OBSOLETE'] ?? 0, icon: 'archive', color: 'gray' },
        ];

        this.recentRevisions = allRevisions
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 8);

        this.activeEcrs = ecrs.filter(e => e.status === 'OPEN' || e.status === 'IN_PROGRESS');
        this.openEcrs = this.activeEcrs.length;

        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  getItemIcon(type: string): string {
    return type === 'ASSEMBLY' ? 'widgets' : type === 'DOCUMENT' ? 'description' : 'settings';
  }

  stateLabel(state: LifecycleState): string {
    const map: Record<string, string> = { WORKING: 'WIP', UNDER_REVIEW: 'Review', RELEASED: 'Libéré', OBSOLETE: 'Obsolète' };
    return map[state] ?? state;
  }

  ecrStatusLabel(status: string): string {
    const map: Record<string, string> = { OPEN: 'Ouvert', IN_PROGRESS: 'En cours', APPROVED: 'Approuvé', REJECTED: 'Rejeté', CLOSED: 'Clôturé' };
    return map[status] ?? status;
  }
}
