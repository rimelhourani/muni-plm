import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';
import { PlmApiService } from '../../../services/plm-api.service';
import { AuthService } from '../../../services/auth.service';
import {
  Item, ItemRevision, BomLine, DocumentFile,
  LifecycleHistoryEntry, LifecycleState
} from '../../../models/plm.models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, FormsModule,
    MatTabsModule, MatCardModule, MatIconModule, MatButtonModule,
    MatChipsModule, MatTooltipModule, MatProgressSpinnerModule,
    MatSelectModule, MatFormFieldModule, MatInputModule, MatDialogModule
  ],
  template: `
    <div class="detail-container" *ngIf="!loading; else loadingTpl">
      <!-- Header breadcrumb -->
      <div class="breadcrumb">
        <a routerLink="/items" class="bc-link">Items</a>
        <mat-icon class="bc-sep">chevron_right</mat-icon>
        <span class="bc-current">{{ item?.itemId }}</span>
      </div>

      <!-- Item header -->
      <div class="item-header">
        <div class="item-icon-wrap" [class]="'type-bg-' + item?.type?.toLowerCase()">
          <mat-icon>{{ getIcon(item?.type) }}</mat-icon>
        </div>
        <div class="item-meta">
          <h1 class="item-name">{{ item?.name }}</h1>
          <div class="item-tags">
            <span class="tag-id">{{ item?.itemId }}</span>
            <span class="tag-type">{{ typeLabel(item?.type) }}</span>
            <span class="tag-owner">
              <mat-icon>person</mat-icon>
              {{ item?.owner?.username }}
            </span>
          </div>
          <p class="item-desc">{{ item?.description || '(Pas de description)' }}</p>
        </div>
        <div class="revision-selector">
          <label class="rev-label">Révision active :</label>
          <div class="rev-buttons">
            <button *ngFor="let rev of item?.revisions"
                    class="rev-btn"
                    [class.active]="selectedRevision?.id === rev.id"
                    [class]="'rev-btn rev-btn-' + rev.lifecycleState.toLowerCase()"
                    (click)="selectRevision(rev)"
                    [id]="'btn-rev-' + rev.revisionId">
              Rev {{ rev.revisionId }}
              <span class="rev-state-dot"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Revision panel -->
      <div class="revision-panel" *ngIf="selectedRevision">
        <!-- Revision toolbar -->
        <div class="rev-toolbar">
          <div class="rev-info">
            <span class="rev-badge">Révision {{ selectedRevision.revisionId }}</span>
            <span class="state-badge" [class]="'badge-' + selectedRevision.lifecycleState.toLowerCase()">
              <mat-icon class="state-icon">{{ stateIcon(selectedRevision.lifecycleState) }}</mat-icon>
              {{ stateLabel(selectedRevision.lifecycleState) }}
            </span>
            <span *ngIf="selectedRevision.checkedOutBy" class="checkout-badge">
              <mat-icon>lock</mat-icon>
              Verrouillé par {{ selectedRevision.checkedOutBy.username }}
            </span>
          </div>
          <div class="rev-actions">
            <!-- Checkout/Checkin buttons -->
            <ng-container *ngIf="canModify">
              <button mat-stroked-button color="accent" (click)="doCheckout()" id="btn-checkout"
                      *ngIf="!selectedRevision.checkedOutBy && isModifiableState(selectedRevision.lifecycleState)"
                      matTooltip="Verrouiller pour modifier">
                <mat-icon>lock_open</mat-icon> Checkout
              </button>
              <button mat-stroked-button color="warn" (click)="doCheckin()" id="btn-checkin"
                      *ngIf="myCheckout"
                      matTooltip="Valider et déverrouiller">
                <mat-icon>lock</mat-icon> Checkin
              </button>
              <button mat-stroked-button (click)="doCancelCheckout()" id="btn-cancel-checkout"
                      *ngIf="canCancelCheckout"
                      matTooltip="Annuler le checkout sans sauvegarder">
                <mat-icon>cancel</mat-icon> Annuler checkout
              </button>
            </ng-container>

            <!-- Workflow transitions -->
            <ng-container *ngIf="availableTransitions.length > 0">
              <button *ngFor="let t of availableTransitions" mat-raised-button [color]="t.color"
                      (click)="doPromote(t.target, t.label)" [id]="'btn-promote-' + t.target">
                <mat-icon>{{ t.icon }}</mat-icon>
                {{ t.label }}
              </button>
            </ng-container>

            <!-- New revision -->
            <button mat-stroked-button (click)="openNewRevisionDialog()" id="btn-new-revision"
                    *ngIf="selectedRevision.lifecycleState === 'RELEASED' && canModify">
              <mat-icon>fork_right</mat-icon> Nouvelle Révision
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <mat-tab-group animationDuration="200ms" class="rev-tabs">

          <!-- BOM Tab -->
          <mat-tab label="Structure BOM">
            <ng-template matTabLabel>
              <mat-icon class="tab-icon">account_tree</mat-icon> BOM
            </ng-template>
            <div class="tab-content">
              <div class="bom-header" *ngIf="canModify && myCheckout">
                <div class="add-bom-form">
                  <mat-form-field appearance="outline" class="bom-select">
                    <mat-label>Ajouter un composant</mat-label>
                    <mat-select [(value)]="selectedChildRevId" id="select-bom-child">
                      <mat-option *ngFor="let rev of allRevisions" [value]="rev.id">
                        {{ rev.itemBusinessId }} Rev {{ rev.revisionId }} — {{ rev.itemName }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="bom-qty">
                    <mat-label>Qté</mat-label>
                    <input matInput type="number" [(ngModel)]="bomQty" min="1" id="input-bom-qty" />
                  </mat-form-field>
                  <button mat-raised-button color="primary" (click)="addBomLine()" id="btn-add-bom">
                    <mat-icon>add</mat-icon>
                  </button>
                </div>
              </div>

              <div class="bom-tree" *ngIf="bomLines.length > 0">
                <div class="bom-row" *ngFor="let line of bomLines">
                  <div class="bom-line-info">
                    <mat-icon class="bom-icon">{{ getIcon(line.childRevision.itemType) }}</mat-icon>
                    <div>
                      <div class="bom-name">
                        <a [routerLink]="['/items', line.childRevision.itemId]" class="bom-link">
                          {{ line.childRevision.itemBusinessId }}
                        </a>
                        Rev {{ line.childRevision.revisionId }} — {{ line.childRevision.itemName }}
                      </div>
                      <div class="bom-meta">Qté: {{ line.quantity }} · Seq: {{ line.sequenceNumber }}</div>
                    </div>
                  </div>
                  <div class="bom-actions">
                    <span class="state-badge" [class]="'badge-' + line.childRevision.lifecycleState.toLowerCase()">
                      {{ stateLabel(line.childRevision.lifecycleState) }}
                    </span>
                    <button mat-icon-button color="warn" (click)="removeBomLine(line)" *ngIf="canModify && myCheckout"
                            [matTooltip]="'Retirer ' + line.childRevision.itemBusinessId" [id]="'btn-remove-bom-' + line.id">
                      <mat-icon>remove_circle</mat-icon>
                    </button>
                  </div>
                </div>
              </div>

              <div *ngIf="bomLines.length === 0" class="empty-tab">
                <mat-icon>account_tree</mat-icon>
                <p>Aucun composant dans la BOM.</p>
                <p class="empty-hint" *ngIf="item?.type !== 'ASSEMBLY'">Seuls les Assemblages peuvent avoir une BOM.</p>
                <p class="empty-hint" *ngIf="!myCheckout && canModify && item?.type === 'ASSEMBLY'">Faites un Checkout pour ajouter des composants.</p>
              </div>

              <!-- Where-Used -->
              <div class="where-used" *ngIf="whereUsed.length > 0">
                <h3 class="where-used-title"><mat-icon>search</mat-icon> Utilisé dans</h3>
                <div class="wu-row" *ngFor="let parent of whereUsed" [routerLink]="['/items', parent.itemId]">
                  <mat-icon>widgets</mat-icon>
                  <span>{{ parent.itemBusinessId }} Rev {{ parent.revisionId }} — {{ parent.itemName }}</span>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Documents Tab -->
          <mat-tab>
            <ng-template matTabLabel>
              <mat-icon class="tab-icon">attach_file</mat-icon> Documents
            </ng-template>
            <div class="tab-content">
              <div class="doc-upload" *ngIf="canModify && myCheckout">
                <label for="file-input" class="upload-area">
                  <mat-icon>cloud_upload</mat-icon>
                  <span>Cliquer pour uploader un document</span>
                  <input id="file-input" type="file" hidden (change)="uploadFile($event)" />
                </label>
              </div>
              <div class="doc-list" *ngIf="documents.length > 0">
                <div class="doc-row" *ngFor="let doc of documents">
                  <div class="doc-icon-wrap">
                    <mat-icon>{{ getDocIcon(doc.contentType) }}</mat-icon>
                  </div>
                  <div class="doc-info">
                    <div class="doc-name">{{ doc.fileName }}</div>
                    <div class="doc-meta">Version {{ doc.version }} · {{ formatSize(doc.fileSize) }} · {{ doc.uploadDate | date:'short' }}</div>
                  </div>
                  <a mat-icon-button [href]="api.downloadDocument(doc.id)" target="_blank" matTooltip="Télécharger" [id]="'btn-dl-' + doc.id">
                    <mat-icon>download</mat-icon>
                  </a>
                </div>
              </div>
              <div *ngIf="documents.length === 0" class="empty-tab">
                <mat-icon>attach_file</mat-icon>
                <p>Aucun document attaché.</p>
                <p class="empty-hint" *ngIf="!myCheckout && canModify">Faites un Checkout pour uploader des documents.</p>
              </div>
            </div>
          </mat-tab>

          <!-- Lifecycle History Tab -->
          <mat-tab>
            <ng-template matTabLabel>
              <mat-icon class="tab-icon">history</mat-icon> Historique
            </ng-template>
            <div class="tab-content">
              <div class="history-timeline" *ngIf="history.length > 0">
                <div class="history-entry" *ngFor="let entry of history">
                  <div class="history-dot" [class]="'dot-' + (entry.newState?.toLowerCase() ?? 'event')"></div>
                  <div class="history-card">
                    <div class="history-transition">
                      <span *ngIf="entry.previousState" class="state-badge" [class]="'badge-' + entry.previousState.toLowerCase()">
                        {{ stateLabel(entry.previousState) }}
                      </span>
                      <mat-icon *ngIf="entry.previousState">arrow_forward</mat-icon>
                      <span class="state-badge" [class]="'badge-' + (entry.newState?.toLowerCase() ?? '')">
                        {{ stateLabel(entry.newState!) }}
                      </span>
                    </div>
                    <div class="history-comment">{{ entry.comment }}</div>
                    <div class="history-meta">
                      <mat-icon>person</mat-icon> {{ entry.changedBy.username }}
                      <mat-icon>schedule</mat-icon> {{ entry.changeDate | date:'medium' }}
                    </div>
                  </div>
                </div>
              </div>
              <div *ngIf="history.length === 0" class="empty-tab">
                <mat-icon>history</mat-icon>
                <p>Aucun historique disponible.</p>
              </div>
            </div>
          </mat-tab>

        </mat-tab-group>
      </div>
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

    .item-header {
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      align-items: flex-start;
    }
    .item-icon-wrap {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .item-icon-wrap mat-icon { font-size: 26px; width: 26px; height: 26px; color: white; }
    .type-bg-part { background: rgba(56,189,248,0.2); }
    .type-bg-assembly { background: rgba(99,102,241,0.2); }
    .type-bg-document { background: rgba(249,115,22,0.2); }

    .item-meta { flex: 1; min-width: 0; }
    .item-name { font-size: 1.4rem; font-weight: 700; color: white; margin: 0 0 8px; }
    .item-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; align-items: center; }
    .tag-id { font-family: monospace; font-size: 0.8rem; background: rgba(99,102,241,0.15); color: #818cf8; padding: 3px 8px; border-radius: 4px; }
    .tag-type { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); padding: 3px 8px; border-radius: 4px; }
    .tag-owner { display: flex; align-items: center; gap: 4px; font-size: 0.8rem; color: rgba(255,255,255,0.4); }
    .tag-owner mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .item-desc { color: rgba(255,255,255,0.4); font-size: 0.875rem; margin: 0; }

    .revision-selector { display: flex; flex-direction: column; gap: 8px; align-items: flex-end; flex-shrink: 0; }
    .rev-label { font-size: 0.7rem; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.5px; }
    .rev-buttons { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
    .rev-btn { border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; transition: all 0.15s; }
    .rev-btn.active { border-color: #818cf8; background: rgba(99,102,241,0.2); color: white; }

    .revision-panel { }
    .rev-toolbar {
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .rev-info { display: flex; align-items: center; gap: 10px; flex: 1; flex-wrap: wrap; }
    .rev-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .rev-badge { font-family: monospace; font-weight: 700; color: white; font-size: 0.9rem; }
    .state-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 10px; border-radius: 6px; }
    .state-icon { font-size: 13px; width: 13px; height: 13px; }
    .badge-working { background: rgba(234,179,8,0.15); color: #fbbf24; }
    .badge-under_review { background: rgba(168,85,247,0.15); color: #c084fc; }
    .badge-released { background: rgba(34,197,94,0.15); color: #4ade80; }
    .badge-obsolete { background: rgba(148,163,184,0.1); color: #94a3b8; }
    .checkout-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; color: #fbbf24; background: rgba(234,179,8,0.1); padding: 4px 10px; border-radius: 6px; }
    .checkout-badge mat-icon { font-size: 14px; width: 14px; height: 14px; }

    .rev-tabs { background: transparent !important; }
    :host ::ng-deep .rev-tabs .mat-mdc-tab-header { background: #1e293b; border-radius: 12px 12px 0 0; border: 1px solid rgba(255,255,255,0.07); border-bottom: none; }
    :host ::ng-deep .rev-tabs .mat-mdc-tab-body-wrapper { background: #1e293b; border: 1px solid rgba(255,255,255,0.07); border-radius: 0 0 12px 12px; }
    :host ::ng-deep .rev-tabs .mat-mdc-tab .mdc-tab__text-label { color: rgba(255,255,255,0.4); }
    :host ::ng-deep .rev-tabs .mat-mdc-tab.mdc-tab--active .mdc-tab__text-label { color: #818cf8; }
    .tab-icon { font-size: 16px; width: 16px; height: 16px; vertical-align: middle; margin-right: 4px; }
    .tab-content { padding: 24px; }

    /* BOM */
    .bom-header { margin-bottom: 20px; }
    .add-bom-form { display: flex; align-items: flex-start; gap: 12px; }
    .bom-select { flex: 1; }
    .bom-qty { width: 80px; }
    .bom-tree { display: flex; flex-direction: column; gap: 8px; }
    .bom-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 8px;
      transition: border-color 0.15s;
    }
    .bom-row:hover { border-color: rgba(99,102,241,0.3); }
    .bom-line-info { display: flex; align-items: center; gap: 12px; }
    .bom-icon { color: rgba(255,255,255,0.4); font-size: 20px; width: 20px; height: 20px; }
    .bom-name { font-size: 0.875rem; color: rgba(255,255,255,0.85); }
    .bom-link { color: #818cf8; text-decoration: none; }
    .bom-link:hover { text-decoration: underline; }
    .bom-meta { font-size: 0.75rem; color: rgba(255,255,255,0.35); margin-top: 2px; }
    .bom-actions { display: flex; align-items: center; gap: 8px; }

    .where-used { margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; }
    .where-used-title { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.5); font-size: 0.85rem; font-weight: 600; margin: 0 0 12px; }
    .wu-row { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 6px; cursor: pointer; color: rgba(255,255,255,0.7); font-size: 0.85rem; }
    .wu-row:hover { background: rgba(255,255,255,0.04); }
    .wu-row mat-icon { color: #818cf8; font-size: 18px; width: 18px; height: 18px; }

    /* Documents */
    .upload-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 24px;
      border: 2px dashed rgba(255,255,255,0.15);
      border-radius: 12px;
      cursor: pointer;
      color: rgba(255,255,255,0.4);
      transition: all 0.2s;
      margin-bottom: 20px;
    }
    .upload-area:hover { border-color: #818cf8; color: #818cf8; }
    .upload-area mat-icon { font-size: 32px; width: 32px; height: 32px; }
    .doc-list { display: flex; flex-direction: column; gap: 8px; }
    .doc-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; }
    .doc-icon-wrap { width: 36px; height: 36px; border-radius: 8px; background: rgba(99,102,241,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .doc-icon-wrap mat-icon { color: #818cf8; font-size: 20px; width: 20px; height: 20px; }
    .doc-info { flex: 1; min-width: 0; }
    .doc-name { font-size: 0.875rem; color: rgba(255,255,255,0.85); font-weight: 500; }
    .doc-meta { font-size: 0.75rem; color: rgba(255,255,255,0.35); margin-top: 2px; }

    /* History */
    .history-timeline { display: flex; flex-direction: column; gap: 12px; padding-left: 20px; border-left: 2px solid rgba(255,255,255,0.08); }
    .history-entry { position: relative; display: flex; gap: 16px; }
    .history-dot { position: absolute; left: -25px; top: 14px; width: 10px; height: 10px; border-radius: 50%; border: 2px solid #1e293b; }
    .dot-working { background: #fbbf24; }
    .dot-under_review { background: #c084fc; }
    .dot-released { background: #4ade80; }
    .dot-obsolete { background: #94a3b8; }
    .dot-event { background: #818cf8; }
    .history-card { flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 12px 16px; }
    .history-transition { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .history-transition mat-icon { font-size: 16px; width: 16px; height: 16px; color: rgba(255,255,255,0.3); }
    .history-comment { font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-bottom: 8px; }
    .history-meta { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: rgba(255,255,255,0.35); }
    .history-meta mat-icon { font-size: 13px; width: 13px; height: 13px; }

    /* Empty states */
    .empty-tab { text-align: center; padding: 40px; color: rgba(255,255,255,0.3); }
    .empty-tab mat-icon { font-size: 40px; width: 40px; height: 40px; margin-bottom: 12px; display: block; }
    .empty-hint { font-size: 0.8rem; opacity: 0.6; margin-top: 8px; }

    /* Form fields */
    :host ::ng-deep .mat-mdc-form-field .mdc-text-field { background: rgba(255,255,255,0.05) !important; }
    :host ::ng-deep .mat-mdc-form-field label { color: rgba(255,255,255,0.5) !important; }
    :host ::ng-deep .mat-mdc-form-field input { color: white !important; }
    :host ::ng-deep .mat-mdc-select-value { color: white !important; }
  `]
})
export class ItemDetailComponent implements OnInit {
  item: Item | null = null;
  selectedRevision: ItemRevision | null = null;
  bomLines: BomLine[] = [];
  documents: DocumentFile[] = [];
  history: LifecycleHistoryEntry[] = [];
  whereUsed: ItemRevision[] = [];
  allRevisions: ItemRevision[] = [];
  loading = true;
  actionLoading = false;
  bomQty = 1;
  selectedChildRevId = '';

  constructor(
    private route: ActivatedRoute,
    public api: PlmApiService,
    public auth: AuthService,
    private dialog: MatDialog
  ) {}

  get canModify(): boolean {
    return this.auth.hasRole('ADMIN', 'ENGINEER', 'APPROVER');
  }

  get myCheckout(): boolean {
    return !!this.selectedRevision?.checkedOutBy &&
      this.selectedRevision.checkedOutBy.id === this.auth.currentUser?.id;
  }

  get canCancelCheckout(): boolean {
    return !!this.selectedRevision?.checkedOutBy &&
      (this.myCheckout || this.auth.hasRole('ADMIN'));
  }

  get availableTransitions(): any[] {
    if (!this.selectedRevision || this.selectedRevision.checkedOutBy) return [];
    const state = this.selectedRevision.lifecycleState;
    const isApprover = this.auth.hasRole('ADMIN', 'APPROVER');
    const transitions = [];
    if (state === 'WORKING') {
      transitions.push({ target: 'UNDER_REVIEW', label: 'Soumettre à validation', icon: 'send', color: 'accent' });
    }
    if (state === 'UNDER_REVIEW' && isApprover) {
      transitions.push({ target: 'RELEASED', label: 'Approuver (Libérer)', icon: 'check_circle', color: 'primary' });
      transitions.push({ target: 'WORKING', label: 'Rejeter (Renvoyer en WIP)', icon: 'replay', color: 'warn' });
    }
    if (state === 'RELEASED') {
      transitions.push({ target: 'OBSOLETE', label: 'Rendre Obsolète', icon: 'archive', color: '' });
    }
    return transitions;
  }

  isModifiableState(state: LifecycleState): boolean {
    return state === 'WORKING' || state === 'UNDER_REVIEW';
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    forkJoin({
      item: this.api.getItem(id),
      allItems: this.api.searchItems()
    }).subscribe({
      next: ({ item, allItems }) => {
        this.item = item;
        this.allRevisions = allItems.flatMap(i => i.revisions).filter(r => r.id !== item.revisions?.[item.revisions.length - 1]?.id);
        if (item.revisions?.length > 0) {
          this.selectRevision(item.revisions[item.revisions.length - 1]);
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  selectRevision(rev: ItemRevision) {
    this.selectedRevision = rev;
    this.loadRevisionData(rev.id);
  }

  loadRevisionData(revId: string) {
    forkJoin({
      bom: this.api.getBom(revId),
      docs: this.api.getDocuments(revId),
      hist: this.api.getHistory(revId),
      wu: this.api.getWhereUsed(revId)
    }).subscribe(({ bom, docs, hist, wu }) => {
      this.bomLines = bom;
      this.documents = docs;
      this.history = hist;
      this.whereUsed = wu;
    });
  }

  doCheckout() {
    if (!this.selectedRevision) return;
    this.api.checkout(this.selectedRevision.id).subscribe(rev => {
      this.updateRevision(rev);
    });
  }

  doCheckin() {
    if (!this.selectedRevision) return;
    this.api.checkin(this.selectedRevision.id).subscribe(rev => {
      this.updateRevision(rev);
      this.loadRevisionData(rev.id);
    });
  }

  doCancelCheckout() {
    if (!this.selectedRevision) return;
    this.api.cancelCheckout(this.selectedRevision.id).subscribe(rev => {
      this.updateRevision(rev);
    });
  }

  doPromote(targetState: LifecycleState, label: string) {
    if (!this.selectedRevision) return;
    const comment = prompt(`Commentaire pour "${label}" (optionnel):`);
    this.api.promoteLifecycle(this.selectedRevision.id, { newState: targetState, comment: comment ?? undefined }).subscribe({
      next: rev => {
        this.updateRevision(rev);
        this.loadRevisionData(rev.id);
      },
      error: err => alert(err.error?.message || 'Erreur lors de la transition')
    });
  }

  openNewRevisionDialog() {
    const newRevId = prompt('Identifiant de la nouvelle révision (ex: B, 02):');
    if (!newRevId || !this.item) return;
    this.api.createRevision(this.item.id, { revisionId: newRevId }).subscribe({
      next: (rev) => {
        this.api.getItem(this.item!.id).subscribe(item => {
          this.item = item;
          this.selectRevision(rev);
        });
      },
      error: err => alert(err.error?.message || 'Erreur lors de la création de la révision')
    });
  }

  addBomLine() {
    if (!this.selectedRevision || !this.selectedChildRevId) return;
    this.api.addBomLine(this.selectedRevision.id, { childRevisionId: this.selectedChildRevId, quantity: this.bomQty }).subscribe({
      next: (line) => {
        this.bomLines.push(line);
        this.selectedChildRevId = '';
        this.bomQty = 1;
      },
      error: err => alert(err.error?.message || 'Erreur lors de l\'ajout BOM')
    });
  }

  removeBomLine(line: BomLine) {
    if (!this.selectedRevision) return;
    this.api.deleteBomLine(this.selectedRevision.id, line.id).subscribe(() => {
      this.bomLines = this.bomLines.filter(b => b.id !== line.id);
    });
  }

  uploadFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.selectedRevision) return;
    this.api.uploadDocument(this.selectedRevision.id, file).subscribe({
      next: doc => { this.documents.unshift(doc); },
      error: err => alert(err.error?.message || 'Erreur lors de l\'upload')
    });
  }

  updateRevision(rev: ItemRevision) {
    this.selectedRevision = rev;
    if (this.item) {
      const idx = this.item.revisions.findIndex(r => r.id === rev.id);
      if (idx >= 0) this.item.revisions[idx] = rev;
    }
  }

  getIcon(type: any): string {
    return type === 'ASSEMBLY' ? 'widgets' : type === 'DOCUMENT' ? 'description' : 'settings';
  }

  typeLabel(type: any): string {
    return type === 'ASSEMBLY' ? 'Assemblage' : type === 'DOCUMENT' ? 'Document' : 'Pièce';
  }

  stateLabel(state: LifecycleState | null): string {
    if (!state) return '';
    const map: Record<string, string> = { WORKING: 'En Travail', UNDER_REVIEW: 'En Validation', RELEASED: 'Libéré', OBSOLETE: 'Obsolète' };
    return map[state] ?? state;
  }

  stateIcon(state: LifecycleState): string {
    const map: Record<string, string> = { WORKING: 'edit_note', UNDER_REVIEW: 'pending_actions', RELEASED: 'check_circle', OBSOLETE: 'archive' };
    return map[state] ?? 'info';
  }

  getDocIcon(contentType: string): string {
    if (!contentType) return 'description';
    if (contentType.includes('pdf')) return 'picture_as_pdf';
    if (contentType.includes('image')) return 'image';
    if (contentType.includes('video')) return 'videocam';
    return 'description';
  }

  formatSize(bytes: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
  }
}
