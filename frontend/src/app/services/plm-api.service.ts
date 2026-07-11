import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Item, ItemRevision, Folder, BomLine, DocumentFile,
  LifecycleHistoryEntry, ChangeRequest, User,
  CreateItemRequest, CreateFolderRequest, AddBomLineRequest,
  PromoteLifecycleRequest, CreateChangeRequestDto, ChangeRequestStatus
} from '../models/plm.models';

@Injectable({ providedIn: 'root' })
export class PlmApiService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ---- Users ----
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/users`);
  }

  // ---- Folders ----
  getRootFolder(): Observable<Folder> {
    return this.http.get<Folder>(`${this.api}/folders/root`);
  }

  getFolder(id: string): Observable<Folder> {
    return this.http.get<Folder>(`${this.api}/folders/${id}`);
  }

  createFolder(req: CreateFolderRequest): Observable<Folder> {
    return this.http.post<Folder>(`${this.api}/folders`, req);
  }

  moveItemToFolder(folderId: string, itemId: string): Observable<Folder> {
    return this.http.post<Folder>(`${this.api}/folders/${folderId}/items/${itemId}`, {});
  }

  // ---- Items ----
  searchItems(query?: string): Observable<Item[]> {
    let params = new HttpParams();
    if (query) params = params.set('query', query);
    return this.http.get<Item[]>(`${this.api}/items`, { params });
  }

  createItem(req: CreateItemRequest): Observable<Item> {
    return this.http.post<Item>(`${this.api}/items`, req);
  }

  getItem(id: string): Observable<Item> {
    return this.http.get<Item>(`${this.api}/items/${id}`);
  }

  // ---- Revisions ----
  getRevision(id: string): Observable<ItemRevision> {
    return this.http.get<ItemRevision>(`${this.api}/revisions/${id}`);
  }

  updateRevision(id: string, body: { name: string; description: string }): Observable<ItemRevision> {
    return this.http.put<ItemRevision>(`${this.api}/revisions/${id}`, body);
  }

  createRevision(itemId: string, body: { revisionId: string }): Observable<ItemRevision> {
    return this.http.post<ItemRevision>(`${this.api}/items/${itemId}/revisions`, body);
  }

  checkout(revisionId: string): Observable<ItemRevision> {
    return this.http.post<ItemRevision>(`${this.api}/revisions/${revisionId}/checkout`, {});
  }

  checkin(revisionId: string): Observable<ItemRevision> {
    return this.http.post<ItemRevision>(`${this.api}/revisions/${revisionId}/checkin`, {});
  }

  cancelCheckout(revisionId: string): Observable<ItemRevision> {
    return this.http.post<ItemRevision>(`${this.api}/revisions/${revisionId}/cancel-checkout`, {});
  }

  promoteLifecycle(revisionId: string, req: PromoteLifecycleRequest): Observable<ItemRevision> {
    return this.http.post<ItemRevision>(`${this.api}/revisions/${revisionId}/lifecycle`, req);
  }

  getHistory(revisionId: string): Observable<LifecycleHistoryEntry[]> {
    return this.http.get<LifecycleHistoryEntry[]>(`${this.api}/revisions/${revisionId}/history`);
  }

  // ---- BOM ----
  getBom(revisionId: string): Observable<BomLine[]> {
    return this.http.get<BomLine[]>(`${this.api}/revisions/${revisionId}/bom`);
  }

  addBomLine(revisionId: string, req: AddBomLineRequest): Observable<BomLine> {
    return this.http.post<BomLine>(`${this.api}/revisions/${revisionId}/bom`, req);
  }

  deleteBomLine(revisionId: string, bomLineId: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/revisions/${revisionId}/bom/${bomLineId}`);
  }

  getWhereUsed(revisionId: string): Observable<ItemRevision[]> {
    return this.http.get<ItemRevision[]>(`${this.api}/revisions/${revisionId}/where-used`);
  }

  // ---- Documents ----
  getDocuments(revisionId: string): Observable<DocumentFile[]> {
    return this.http.get<DocumentFile[]>(`${this.api}/revisions/${revisionId}/documents`);
  }

  uploadDocument(revisionId: string, file: File): Observable<DocumentFile> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<DocumentFile>(`${this.api}/revisions/${revisionId}/documents`, formData);
  }

  downloadDocument(docId: string): string {
    return `${this.api}/documents/${docId}/download`;
  }

  // ---- ECR ----
  getEcrs(): Observable<ChangeRequest[]> {
    return this.http.get<ChangeRequest[]>(`${this.api}/change-requests`);
  }

  getEcr(id: string): Observable<ChangeRequest> {
    return this.http.get<ChangeRequest>(`${this.api}/change-requests/${id}`);
  }

  createEcr(req: CreateChangeRequestDto): Observable<ChangeRequest> {
    return this.http.post<ChangeRequest>(`${this.api}/change-requests`, req);
  }

  updateEcrStatus(id: string, status: ChangeRequestStatus): Observable<ChangeRequest> {
    return this.http.put<ChangeRequest>(`${this.api}/change-requests/${id}/status?status=${status}`, {});
  }
}
