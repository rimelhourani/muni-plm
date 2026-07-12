// Models for Mini PLM Frontend

export type Role = 'ADMIN' | 'ENGINEER' | 'APPROVER' | 'VIEWER';
export type ItemType = 'PART' | 'ASSEMBLY' | 'DOCUMENT';
export type LifecycleState = 'WORKING' | 'UNDER_REVIEW' | 'RELEASED' | 'OBSOLETE';
export type ChangeRequestStatus = 'OPEN' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'CLOSED';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
}

export interface Folder {
  id: string;
  name: string;
  parentFolderId: string | null;
  owner: User;
  createdAt: string;
  subFolders: ChildFolder[];
  items: ChildItem[];
}

export interface ChildFolder {
  id: string;
  name: string;
}

export interface ChildItem {
  id: string;
  itemId: string;
  name: string;
  type: ItemType;
}

export interface Item {
  id: string;
  itemId: string;
  name: string;
  description: string;
  type: ItemType;
  owner: User;
  createdAt: string;
  folderId: string | null;
  revisions: ItemRevision[];
}

export interface ItemRevision {
  id: string;
  itemId: string;
  itemBusinessId: string;
  itemName: string;
  itemDescription: string;
  itemType: ItemType;
  revisionId: string;
  lifecycleState: LifecycleState;
  createdAt: string;
  createdBy: User;
  checkedOutBy: User | null;
  checkedOutDate: string | null;
}

export interface BomLine {
  id: string;
  parentRevisionId: string;
  childRevision: ItemRevision;
  quantity: number;
  sequenceNumber: number;
}

export interface DocumentFile {
  id: string;
  fileName: string;
  filePath: string;
  contentType: string;
  fileSize: number;
  version: number;
  uploadDate: string;
}

export interface LifecycleHistoryEntry {
  id: string;
  previousState: LifecycleState | null;
  newState: LifecycleState | null;
  changedBy: User;
  changeDate: string;
  comment: string;
}

export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  status: ChangeRequestStatus;
  requester: User;
  createdAt: string;
  impactedRevisions: ItemRevision[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role?: string;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface CreateItemRequest {
  itemId?: string;
  name: string;
  description?: string;
  type: ItemType;
  folderId?: string;
}

export interface CreateFolderRequest {
  name: string;
  parentFolderId?: string;
}

export interface AddBomLineRequest {
  childRevisionId: string;
  quantity: number;
  sequenceNumber?: number;
}

export interface PromoteLifecycleRequest {
  newState: LifecycleState;
  comment?: string;
}

export interface CreateChangeRequestDto {
  title: string;
  description?: string;
  impactedRevisionIds: string[];
}

export interface DashboardStats {
  totalItems: number;
  byState: { [key in LifecycleState]?: number };
  openEcrs: number;
  recentRevisions: ItemRevision[];
}
