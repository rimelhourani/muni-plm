import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PlmApiService } from '../../../services/plm-api.service';
import { AuthService } from '../../../services/auth.service';
import { Item, ItemType, LifecycleState } from '../../../models/plm.models';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CreateItemDialogComponent } from '../create-item-dialog/create-item-dialog.component';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatTableModule, MatIconModule, MatButtonModule,
    MatChipsModule, MatInputModule, MatFormFieldModule, MatSelectModule,
    MatProgressSpinnerModule, MatDialogModule, MatTooltipModule
  ],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div>
          <h1 class="page-title">PLM Items</h1>
          <p class="page-subtitle">{{ items.length }} item(s) found</p>
        </div>
        <button mat-raised-button color="primary" (click)="openCreateDialog()" id="btn-create-item"
                *ngIf="canCreate">
          <mat-icon>add</mat-icon>
          New Item
        </button>
      </header>

      <!-- Search bar -->
<mat-card class="search-card">
        <mat-card-content>
          <div class="search-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-icon matPrefix>search</mat-icon>
              <input matInput [formControl]="searchCtrl" placeholder="Search by name or ID, e.g. engine, PRT-000003..." id="input-search" />
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-center">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <!-- Items table -->
      <mat-card class="table-card" *ngIf="!loading">
        <mat-card-content>
          <table mat-table [dataSource]="items" class="plm-table">

            <ng-container matColumnDef="itemId">
              <th mat-header-cell *matHeaderCellDef>Business ID</th>
              <td mat-cell *matCellDef="let item">
                <span class="item-id-badge">{{ item.itemId }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let item">
                <div class="item-name-cell">
                  <mat-icon class="type-icon">{{ getIcon(item.type) }}</mat-icon>
                  <span>{{ item.name }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let item">
                <span class="type-chip" [class]="'type-' + item.type.toLowerCase()">{{ typeLabel(item.type) }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="revisions">
              <th mat-header-cell *matHeaderCellDef>Révisions</th>
              <td mat-cell *matCellDef="let item">
                <div class="rev-chips">
                  <span *ngFor="let rev of item.revisions" class="rev-chip" [class]="'rev-' + rev.lifecycleState.toLowerCase()">
                    Rev {{ rev.revisionId }}
                  </span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="state">
              <th mat-header-cell *matHeaderCellDef>State (Latest)</th>
              <td mat-cell *matCellDef="let item">
                <span *ngIf="item.revisions.length > 0" class="state-badge" [class]="'badge-' + latestRev(item).lifecycleState.toLowerCase()">
                  {{ stateLabel(latestRev(item).lifecycleState) }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="owner">
              <th mat-header-cell *matHeaderCellDef>Propriétaire</th>
              <td mat-cell *matCellDef="let item">
                <div class="owner-cell">
                  <div class="owner-avatar">{{ item.owner.username[0].toUpperCase() }}</div>
                  {{ item.owner.username }}
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let item">
                <button mat-icon-button [routerLink]="['/items', item.id]" matTooltip="Ouvrir le détail" [id]="'btn-open-' + item.itemId">
                  <mat-icon>open_in_new</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row" [routerLink]="['/items', row.id]"></tr>
          </table>

          <div *ngIf="items.length === 0" class="empty-state">
            <mat-icon>inventory_2</mat-icon>
            <p>Aucun item trouvé.</p>
            <button mat-raised-button color="primary" (click)="openCreateDialog()" *ngIf="canCreate">Create first item</button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 32px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-title { font-size: 1.75rem; font-weight: 700; color: white; margin: 0 0 4px; }
    .page-subtitle { color: rgba(255,255,255,0.4); margin: 0; font-size: 0.875rem; }
    .loading-center { display: flex; justify-content: center; padding: 80px; }

    .search-card { background: #1e293b !important; border-radius: 12px !important; border: 1px solid rgba(255,255,255,0.07) !important; margin-bottom: 16px; }
    :host ::ng-deep .search-card .mat-mdc-card-content { padding: 16px !important; }
    .search-row { display: flex; gap: 12px; align-items: center; }
    .search-field { flex: 1; }

    .table-card { background: #1e293b !important; border-radius: 12px !important; border: 1px solid rgba(255,255,255,0.07) !important; }
    :host ::ng-deep .table-card .mat-mdc-card-content { padding: 0 !important; }

    .plm-table { width: 100%; background: transparent; }
    :host ::ng-deep .plm-table th.mat-mdc-header-cell { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.4); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid rgba(255,255,255,0.07); }
    :host ::ng-deep .plm-table td.mat-mdc-cell { border-bottom: 1px solid rgba(255,255,255,0.04); color: rgba(255,255,255,0.8); font-size: 0.875rem; }
    .table-row { cursor: pointer; transition: background 0.1s; }
    :host ::ng-deep .table-row:hover td { background: rgba(255,255,255,0.04); }

    .item-id-badge { font-family: monospace; font-size: 0.8rem; background: rgba(99,102,241,0.15); color: #818cf8; padding: 3px 8px; border-radius: 4px; }

    .item-name-cell { display: flex; align-items: center; gap: 8px; }
    .type-icon { font-size: 18px; width: 18px; height: 18px; color: rgba(255,255,255,0.4); }

    .type-chip { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; padding: 3px 8px; border-radius: 4px; }
    .type-part { background: rgba(56,189,248,0.15); color: #38bdf8; }
    .type-assembly { background: rgba(99,102,241,0.15); color: #818cf8; }
    .type-document { background: rgba(249,115,22,0.15); color: #fb923c; }

    .rev-chips { display: flex; flex-wrap: wrap; gap: 4px; }
    .rev-chip { font-size: 0.65rem; font-weight: 600; padding: 2px 6px; border-radius: 3px; }
    .rev-working { background: rgba(234,179,8,0.15); color: #fbbf24; }
    .rev-under_review { background: rgba(168,85,247,0.15); color: #c084fc; }
    .rev-released { background: rgba(34,197,94,0.15); color: #4ade80; }
    .rev-obsolete { background: rgba(148,163,184,0.1); color: #94a3b8; }

    .state-badge { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; padding: 3px 8px; border-radius: 4px; }
    .badge-working { background: rgba(234,179,8,0.15); color: #fbbf24; }
    .badge-under_review { background: rgba(168,85,247,0.15); color: #c084fc; }
    .badge-released { background: rgba(34,197,94,0.15); color: #4ade80; }
    .badge-obsolete { background: rgba(148,163,184,0.1); color: #94a3b8; }

    .owner-cell { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; }
    .owner-avatar { width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; flex-shrink: 0; }

    .empty-state { text-align: center; padding: 60px; color: rgba(255,255,255,0.3); }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; }
    .empty-state p { margin: 0 0 16px; }

    :host ::ng-deep .mat-mdc-form-field .mdc-text-field { background: rgba(255,255,255,0.05) !important; }

    :host ::ng-deep .mat-mdc-form-field input {
      color: white !important;
      caret-color: white;
    }

    :host ::ng-deep .mat-mdc-text-field-wrapper {
      height: 56px;
    }

    :host ::ng-deep .mat-mdc-form-field-flex {
      align-items: center;
      height: 56px;
    }

    :host ::ng-deep .mdc-floating-label {
      color: rgba(255,255,255,0.5) !important;
      top: 50%;
    }

    :host ::ng-deep .mdc-floating-label--float-above {
      color: rgba(255,255,255,0.7) !important;
    }

    :host ::ng-deep .mat-mdc-form-field .mdc-notched-outline__leading,
    :host ::ng-deep .mat-mdc-form-field .mdc-notched-outline__notch,
    :host ::ng-deep .mat-mdc-form-field .mdc-notched-outline__trailing {
      border-color: rgba(255,255,255,0.2) !important;
    }

    :host ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__leading,
    :host ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__notch,
    :host ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__trailing {
      border-color: #6366f1 !important;
    }

    :host ::ng-deep .mat-mdc-form-field-icon-prefix {
      color: rgba(255,255,255,0.5);
      padding-right: 8px;
    }
  `]
})
export class ItemListComponent implements OnInit {
  items: Item[] = [];
  loading = true;
  displayedColumns = ['itemId', 'name', 'type', 'revisions', 'state', 'owner', 'actions'];
  searchCtrl = this.fb.control('');

  constructor(
    private api: PlmApiService,
    public auth: AuthService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {}

  get canCreate(): boolean {
    return this.auth.hasRole('ADMIN', 'ENGINEER');
  }

  ngOnInit() {
    this.loadItems();
    this.searchCtrl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(q => {
      this.loadItems(q ?? undefined);
    });
  }

  loadItems(query?: string) {
    this.loading = true;
    this.api.searchItems(query).subscribe({
      next: items => { this.items = items; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openCreateDialog() {
    const ref = this.dialog.open(CreateItemDialogComponent, { width: '480px', panelClass: 'dark-dialog' });
    ref.afterClosed().subscribe(result => {
      if (result) this.loadItems();
    });
  }

  latestRev(item: Item) {
    return item.revisions[item.revisions.length - 1];
  }

  getIcon(type: ItemType): string {
    return type === 'ASSEMBLY' ? 'widgets' : type === 'DOCUMENT' ? 'description' : 'settings';
  }

  typeLabel(type: ItemType): string {
    return type === 'ASSEMBLY' ? 'Assemblage' : type === 'DOCUMENT' ? 'Document' : 'Pièce';
  }

  stateLabel(state: LifecycleState): string {
    const map: Record<string, string> = { WORKING: 'WIP', UNDER_REVIEW: 'Review', RELEASED: 'Libéré', OBSOLETE: 'Obsolète' };
    return map[state] ?? state;
  }
}