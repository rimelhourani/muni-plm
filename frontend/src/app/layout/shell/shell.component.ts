import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatTreeModule } from '@angular/material/tree';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { AuthService } from '../../services/auth.service';
import { PlmApiService } from '../../services/plm-api.service';
import { Folder, ChildFolder, ChildItem } from '../../models/plm.models';

interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'item';
  itemType?: string;
  children?: TreeNode[];
  expanded?: boolean;
  loading?: boolean;
  folderId?: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule,
    MatButtonModule, MatTooltipModule, MatChipsModule,
    MatProgressSpinnerModule, MatExpansionModule
  ],
  template: `
    <div class="shell-wrapper">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-mark">
            <mat-icon>precision_manufacturing</mat-icon>
          </div>
          <div class="brand-text">
            <span class="brand-name">miniPLM</span>
            <span class="brand-sub">Training Platform</span>
          </div>
        </div>

        <!-- Navigation links -->
        <nav class="sidebar-nav">
          <a class="nav-item" routerLink="/dashboard" routerLinkActive="active" id="nav-dashboard">
            <mat-icon>dashboard</mat-icon><span>Tableau de bord</span>
          </a>
          <a class="nav-item" routerLink="/items" routerLinkActive="active" id="nav-items">
            <mat-icon>inventory_2</mat-icon><span>Tous les Items</span>
          </a>
          <a class="nav-item" routerLink="/ecr" routerLinkActive="active" id="nav-ecr">
            <mat-icon>change_circle</mat-icon><span>Demandes ECR</span>
          </a>
        </nav>

        <!-- Folder tree (My Teamcenter) -->
        <div class="folder-tree-section">
          <div class="section-label">
            <mat-icon>folder_special</mat-icon>
            <span>Mon Espace de Travail</span>
          </div>

          <div class="folder-tree" *ngIf="!treeLoading">
            <ng-container *ngTemplateOutlet="treeNodeTpl; context: { nodes: treeNodes, depth: 0 }"></ng-container>
          </div>
          <div class="tree-loading" *ngIf="treeLoading">
            <mat-spinner diameter="20"></mat-spinner>
          </div>
        </div>

        <!-- User info -->
        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">{{ userInitial }}</div>
            <div class="user-details">
              <span class="user-name">{{ auth.currentUser?.username }}</span>
              <span class="user-role">{{ roleLabel }}</span>
            </div>
          </div>
          <button mat-icon-button (click)="auth.logout()" matTooltip="Se déconnecter" id="btn-logout" class="logout-btn">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>

    <!-- Tree template -->
    <ng-template #treeNodeTpl let-nodes="nodes" let-depth="depth">
      <div *ngFor="let node of nodes" class="tree-node" [style.padding-left.px]="depth * 14 + 8">
        <div class="tree-node-row"
             [class.active]="selectedNodeId === node.id"
             (click)="selectNode(node)">
          <mat-icon class="tree-expand-icon" *ngIf="node.type === 'folder'"
                    (click)="$event.stopPropagation(); toggleNode(node)">
            {{ node.expanded ? 'folder_open' : 'folder' }}
          </mat-icon>
          <mat-icon class="tree-item-icon" *ngIf="node.type === 'item'">
            {{ node.itemType === 'ASSEMBLY' ? 'widgets' : node.itemType === 'DOCUMENT' ? 'description' : 'settings' }}
          </mat-icon>
          <span class="tree-node-name" [title]="node.name">{{ node.name }}</span>
          <mat-spinner *ngIf="node.loading" diameter="12" class="node-spinner"></mat-spinner>
        </div>
        <ng-container *ngIf="node.expanded && node.children">
          <ng-container *ngTemplateOutlet="treeNodeTpl; context: { nodes: node.children, depth: depth + 1 }"></ng-container>
        </ng-container>
      </div>
    </ng-template>
  `,
  styles: [`
    .shell-wrapper { display: flex; height: 100vh; overflow: hidden; background: #0f172a; font-family: 'Inter', sans-serif; }

    /* Sidebar */
    .sidebar {
      width: 260px;
      min-width: 260px;
      background: #1e293b;
      border-right: 1px solid rgba(255,255,255,0.07);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .brand-mark {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .brand-mark mat-icon { color: white; font-size: 20px; width: 20px; height: 20px; }
    .brand-name { display: block; font-size: 1rem; font-weight: 700; color: white; letter-spacing: -0.3px; }
    .brand-sub { display: block; font-size: 0.65rem; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.5px; }

    /* Nav */
    .sidebar-nav { padding: 12px 8px; border-bottom: 1px solid rgba(255,255,255,0.07); }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      color: rgba(255,255,255,0.55);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.15s;
      cursor: pointer;
    }
    .nav-item mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .nav-item:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.9); }
    .nav-item.active { background: rgba(99,102,241,0.15); color: #818cf8; }
    .nav-item.active mat-icon { color: #818cf8; }

    /* Folder tree */
    .folder-tree-section { flex: 1; overflow: hidden; display: flex; flex-direction: column; padding: 12px 0; }
    .section-label {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 16px 8px;
      font-size: 0.65rem;
      font-weight: 600;
      color: rgba(255,255,255,0.3);
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .section-label mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .folder-tree { flex: 1; overflow-y: auto; padding: 0 4px; }
    .folder-tree::-webkit-scrollbar { width: 3px; }
    .folder-tree::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
    .tree-loading { display: flex; justify-content: center; padding: 16px; }

    .tree-node-row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 8px;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.1s;
      color: rgba(255,255,255,0.6);
      font-size: 0.8rem;
    }
    .tree-node-row:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.85); }
    .tree-node-row.active { background: rgba(99,102,241,0.15); color: #818cf8; }
    .tree-expand-icon, .tree-item-icon { font-size: 16px; width: 16px; height: 16px; flex-shrink: 0; }
    .tree-node-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .node-spinner { flex-shrink: 0; }

    /* Main */
    .main-content { flex: 1; overflow-y: auto; background: #0f172a; }

    /* Footer */
    .sidebar-footer {
      padding: 12px 16px;
      border-top: 1px solid rgba(255,255,255,0.07);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .user-info { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
      flex-shrink: 0;
    }
    .user-details { min-width: 0; }
    .user-name { display: block; font-size: 0.8rem; color: rgba(255,255,255,0.85); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .user-role { display: block; font-size: 0.65rem; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.5px; }
    .logout-btn { color: rgba(255,255,255,0.4) !important; flex-shrink: 0; }
    .logout-btn:hover { color: rgba(239,68,68,0.8) !important; }
  `]
})
export class ShellComponent implements OnInit {
  treeNodes: TreeNode[] = [];
  treeLoading = true;
  selectedNodeId: string | null = null;

  constructor(public auth: AuthService, private api: PlmApiService, private router: Router) {}

  ngOnInit() {
    this.loadFolderTree();
  }

  get userInitial(): string {
    return (this.auth.currentUser?.username?.[0] ?? '?').toUpperCase();
  }

  get roleLabel(): string {
    const roles: any = { ADMIN: 'Administrateur', ENGINEER: 'Ingénieur', APPROVER: 'Approbateur', VIEWER: 'Lecteur' };
    return roles[this.auth.currentUser?.role ?? ''] ?? '';
  }

  loadFolderTree() {
    this.treeLoading = true;
    this.api.getRootFolder().subscribe({
      next: (folder) => {
        this.treeNodes = [this.folderToNode(folder)];
        this.treeLoading = false;
      },
      error: () => { this.treeLoading = false; }
    });
  }

  folderToNode(folder: Folder): TreeNode {
    const children: TreeNode[] = [
      ...folder.subFolders.map(sf => ({
        id: sf.id,
        name: sf.name,
        type: 'folder' as const,
        children: [],
        expanded: false,
        loading: false
      })),
      ...folder.items.map(item => ({
        id: item.id,
        name: `${item.itemId} — ${item.name}`,
        type: 'item' as const,
        itemType: item.type
      }))
    ];
    return {
      id: folder.id,
      name: folder.name,
      type: 'folder',
      children,
      expanded: true,
      loading: false
    };
  }

  toggleNode(node: TreeNode) {
    if (node.type !== 'folder') return;
    node.expanded = !node.expanded;
    if (node.expanded && node.children?.length === 0) {
      node.loading = true;
      this.api.getFolder(node.id).subscribe({
        next: (folder) => {
          node.children = [
            ...folder.subFolders.map(sf => ({ id: sf.id, name: sf.name, type: 'folder' as const, children: [], expanded: false })),
            ...folder.items.map(i => ({ id: i.id, name: `${i.itemId} — ${i.name}`, type: 'item' as const, itemType: i.type }))
          ];
          node.loading = false;
        },
        error: () => { node.loading = false; }
      });
    }
  }

  selectNode(node: TreeNode) {
    this.selectedNodeId = node.id;
    if (node.type === 'item') {
      this.router.navigate(['/items', node.id]);
    }
  }
}
