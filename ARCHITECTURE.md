# Architecture miniPLM

## Vue d'ensemble

miniPLM est une application de gestion du cycle de vie des produits (PLM) construite avec une architecture client-serveur moderne:

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Angular 18)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Components (Standalone)                            │  │
│  │  - LoginComponent                                   │  │
│  │  - DashboardComponent                               │  │
│  │  - ItemListComponent, ItemDetailComponent           │  │
│  │  - EcrListComponent, EcrDetailComponent             │  │
│  │  - ShellComponent (Layout avec sidebar)             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Services & Guards                                  │  │
│  │  - AuthService (JWT management)                     │  │
│  │  - PlmApiService (API calls)                        │  │
│  │  - authGuard (route protection)                     │  │
│  │  - authInterceptor (add JWT token)                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Material Components & RxJS                         │  │
│  │  - Tables, Dialogs, Cards, Chips                    │  │
│  │  - Observables, Subscriptions, forkJoin             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP (JWT)
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Spring Boot)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  REST Controllers (/api/v1/...)                     │  │
│  │  - AuthController (POST /login)                     │  │
│  │  - ItemController (CRUD items & revisions)          │  │
│  │  - FolderController (tree structure)                │  │
│  │  - ChangeRequestController (ECR workflow)           │  │
│  │  - DocumentController (uploads)                     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Services (Business Logic)                          │  │
│  │  - AuthService (JWT generation)                     │  │
│  │  - ItemService (lifecycle management)               │  │
│  │  - BomService (Bill of Materials)                   │  │
│  │  - ChangeRequestService (ECR workflow)              │  │
│  │  - DocumentService (file handling)                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Data Access Layer (JPA)                            │  │
│  │  - UserRepository, ItemRepository                   │  │
│  │  - FolderRepository, BomRepository                  │  │
│  │  - ChangeRequestRepository                          │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Security & Validation                              │  │
│  │  - JwtTokenProvider (token generation/validation)   │  │
│  │  - AuthenticationFilter (intercept requests)        │  │
│  │  - @Valid annotations (input validation)            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ SQL
┌─────────────────────────────────────────────────────────────┐
│                   Database (H2/MySQL)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tables                                             │  │
│  │  - users                - items                      │  │
│  │  - item_revisions       - item_revisions_bom        │  │
│  │  - folders              - documents                 │  │
│  │  - change_requests      - lifecycle_history         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Flux de Données

### 1. Authentification (Login)

```
User Input (Username/Password)
  ↓
LoginComponent.onLogin()
  ↓
AuthService.login() ➜ POST /api/v1/auth/login
  ↓
Backend: AuthController.login()
  ↓ Valide credentials
  ↓
JWT Token + User Data
  ↓
Frontend: Store token in localStorage
  ↓
AuthService.currentUserSubject.next(user)
  ↓
Route guard + Navigation
```

### 2. Récupérer une Liste d'Items

```
User Navigation ➜ /items
  ↓
ItemListComponent.ngOnInit()
  ↓
PlmApiService.searchItems(query?)
  ↓ authInterceptor ajoute JWT
  ↓
GET /api/v1/items?query=...
  ↓
Backend: ItemController.search()
  ↓ Query → Repository
  ↓
Observable<Item[]>
  ↓
Component.items = items
  ↓
Template rendu avec *ngFor
```

### 3. Checkout/Modification d'Item

```
User Click "Checkout"
  ↓
ItemDetailComponent.doCheckout()
  ↓
PlmApiService.checkout(revisionId)
  ↓ POST /api/v1/revisions/{id}/checkout
  ↓
Backend: RevisionController.checkout()
  ↓ Set checkedOutBy = currentUser
  ↓ Set checkedOutDate = now
  ↓
ItemRevision (updated)
  ↓
Frontend: Update selectedRevision
  ↓
Template: Enable edit buttons
```

### 4. Workflow ECR

```
User: "Créer une ECR"
  ↓
CreateEcrDialogComponent
  ↓
Sélectionner revisions impactées
  ↓
PlmApiService.createEcr(request)
  ↓ POST /api/v1/change-requests
  ↓
Backend: ChangeRequestService
  ↓ Create ECR + link revisions
  ↓
ChangeRequest (status=OPEN)
  ↓
Frontend: Dialog closed, liste rafraîchie
  ↓
Approver: Peut valider/rejeter
```

## Modèles de Données Clés

### Item & Revision

```
Item
├── id: String (UUID)
├── itemId: String (Business ID, ex: "PRT-000001")
├── name: String
├── description: String
├── type: ItemType (PART|ASSEMBLY|DOCUMENT)
├── owner: User
├── createdAt: LocalDateTime
├── folderId: String (nullable)
└── revisions: List<ItemRevision>
    ├── id: String
    ├── revisionId: String (A, B, C, etc.)
    ├── lifecycleState: LifecycleState (WORKING|UNDER_REVIEW|RELEASED|OBSOLETE)
    ├── checkedOutBy: User (nullable)
    ├── checkedOutDate: LocalDateTime (nullable)
    └── [metadata]
```

### BOM (Bill of Materials)

```
BomLine
├── id: String
├── parentRevisionId: String (parent item revision)
├── childRevision: ItemRevision (component)
├── quantity: Integer
└── sequenceNumber: Integer
```

### Change Request (ECR)

```
ChangeRequest
├── id: String
├── title: String
├── description: String
├── status: ChangeRequestStatus (OPEN|IN_PROGRESS|APPROVED|REJECTED|CLOSED)
├── requester: User
├── createdAt: LocalDateTime
└── impactedRevisions: List<ItemRevision>
```

## Lifecycle d'une Révision

```
┌─────────────────────────────────────────┐
│  WORKING (WIP)                          │
│  - État initial à la création            │
│  - Ingénieur: peut checkout/modifier     │
│  - Transition: Submit for Review         │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  UNDER_REVIEW (En Validation)           │
│  - Approuvé: peut checkout/modifier      │
│  - Transition: Approve/Reject            │
└──────────┬───────────────┬──────────────┘
           ↓               ↓
    RELEASED       WORKING (rejeté)
           ↓               ↓
    ┌──────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  RELEASED (Libéré)                      │
│  - Lecture seule (sauf Approver)         │
│  - Accessible dans les BOM               │
│  - Transition: Make Obsolete             │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  OBSOLETE (Obsolète)                    │
│  - Archive, lecture seule                │
│  - Pas accessible dans les BOM           │
└─────────────────────────────────────────┘
```

## Sécurité

### Authentication & Authorization

1. **Login**
   - Utilisateur envoie username/password
   - Backend valide contre la base de données
   - Génère JWT token (exp: 24h)
   - Token retourné au client

2. **Token Management**
   - Stocké dans localStorage
   - Envoyé dans header Authorization
   - Validé à chaque requête

3. **Role-Based Access Control (RBAC)**
   - 4 rôles: ADMIN, ENGINEER, APPROVER, VIEWER
   - Chaque rôle a des permissions spécifiques
   - Backend vérifie les permissions
   - Frontend masque les boutons non autorisés

### Validation

**Frontend**:
- Validation de formulaire avec Validators
- Client-side checks pour UX immédiat

**Backend**:
- @Valid annotations
- Input sanitization
- SQL injection prevention (parameterized queries)

## Performance

### Optimisations Frontend

- **Lazy Loading**: Routes chargées à la demande
- **OnPush Change Detection**: Certains composants
- **Unsubscribe**: Pattern pour éviter les memory leaks
- **Pagination**: Listes virtualisées pour grandes données
- **Debounce**: Recherche (300ms)

### Optimisations Backend

- **Lazy Loading**: Relations JPA
- **Pagination**: Requêtes avec limit/offset
- **Caching**: Entités fréquemment lues
- **Indexing**: Colonnes de recherche/tri
- **Connection Pooling**: HikariCP

## Extensibilité

### Ajouter un Nouveau Module

1. **Backend**:
   - Créer Entity, Repository, Service, Controller
   - Ajouter les endpoints REST
   - Écrire les tests

2. **Frontend**:
   - Créer Component(s)
   - Ajouter au PlmApiService
   - Ajouter route dans app.routes.ts
   - Mettre à jour le sidebar si nécessaire

### Ajouter une Nouvelle Permission

```java
// Backend
public enum Permission {
  CREATE_ITEM, MODIFY_ITEM, DELETE_ITEM,
  APPROVE_ECR, REJECT_ECR,
  // Add new permission
  VIEW_REPORTS
}

// Frontend
if (this.auth.hasPermission('VIEW_REPORTS')) {
  // Show menu item
}
```

## Déploiement

### Frontend (Vercel)

```bash
# Vercel détecte angular.json automatiquement
vercel deploy
# Crée une build optimisée et déploie
```

### Backend (Render/Fly.io)

```bash
# Railway.app ou Fly.io
# Connexion Git automatique
# Build: mvn clean package
# Run: java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### Database

- **Dev**: H2 in-memory
- **Prod**: MySQL sur RDS / managed service

## Monitoring & Logging

### Frontend
- Chrome DevTools
- Error boundary components
- Sentry (optionnel)

### Backend
- Spring Boot Actuator
- ELK Stack (optionnel)
- Application logs à /logs

## Roadmap

1. **Real-time Notifications**: WebSocket pour les ECR
2. **Advanced Search**: Elasticsearch integration
3. **Audit Trail**: Tracking complet des modifications
4. **Batch Operations**: Export/Import de données
5. **Mobile App**: React Native

---

**Architecture modifiée**: Juillet 2026
