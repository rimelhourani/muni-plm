# miniPLM - Plateforme de Formation PLM

Une application Web complète de gestion du cycle de vie des produits (PLM) basée sur les concepts Teamcenter. Projet de formation avec frontend Angular et backend Spring Boot.

## Architecture

- **Frontend**: Angular 18 standalone components avec Material Design
- **Backend**: Spring Boot 3.3.1 avec Spring Security & JWT
- **Base de données**: H2 (développement) / MySQL (production)
- **API**: REST API avec OpenAPI/Swagger

## Structure du Projet

```
├── backend/                    # Spring Boot backend
│   ├── src/
│   │   ├── main/java/
│   │   │   ├── controller/    # REST endpoints
│   │   │   ├── service/       # Business logic
│   │   │   ├── entity/        # JPA entities
│   │   │   ├── repository/    # Data access
│   │   │   ├── config/        # Security & configuration
│   │   │   └── dto/           # Data transfer objects
│   │   └── resources/
│   │       └── application.yml
│   └── pom.xml
│
└── frontend/                   # Angular frontend
    ├── src/
    │   ├── app/
    │   │   ├── pages/         # Route components
    │   │   ├── layout/        # Shell & layout
    │   │   ├── services/      # API services
    │   │   ├── guards/        # Route guards
    │   │   ├── interceptors/  # HTTP interceptors
    │   │   ├── models/        # TypeScript models
    │   │   └── app.component.ts
    │   ├── environments/      # Environment config
    │   └── styles.css         # Global styles
    ├── package.json
    └── angular.json
```

## Démarrage Rapide

### Backend

1. **Prérequis**: Java 21+, Maven 3.8+

2. **Lancer le serveur**:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Le serveur démarre sur http://localhost:8080

API Swagger: http://localhost:8080/swagger-ui.html

### Frontend

1. **Prérequis**: Node.js 18+, npm 9+

2. **Installation des dépendances**:
```bash
cd frontend
npm install
```

3. **Lancer le serveur de développement**:
```bash
npm start
```

L'application démarre sur http://localhost:4200

## Comptes de Démo

L'application inclut 4 rôles utilisateur :

| Rôle | Utilisateur | Mot de passe | Permissions |
|------|------------|-------------|------------|
| Admin | `admin` | `admin123` | Accès complet, gestion des utilisateurs |
| Ingénieur | `engineer` | `engineer123` | Créer/modifier items, checkout/checkin |
| Approbateur | `approver` | `approver123` | Valider et libérer des items/ECR |
| Lecteur | `viewer` | `viewer123` | Accès lecture seule |

## Fonctionnalités Principales

### Items & Révisions
- Créer et organiser des items (Pièces, Assemblages, Documents)
- Gérer les révisions avec cycle de vie (WIP → Validation → Libéré → Obsolète)
- Système de checkout/checkin pour le verrouillage

### Bill of Materials (BOM)
- Structure arborescente des produits
- Ajouter/retirer des composants
- Visualiser où un item est utilisé (Where-Used)

### Gestion des Documents
- Upload et téléchargement de documents
- Versioning automatique
- Historique complet

### Engineering Change Requests (ECR)
- Créer des demandes de modification
- Workflow avec approuvation
- Traçabilité des impacts sur les items

### Gestion des Dossiers
- Espace de travail personnel (Home Folder)
- Arborescence de dossiers dans le sidebar
- Navigation intuitive

## Thème & Styling

L'application utilise un thème sombre professionnel avec :
- Palette de couleurs: Bleu-violet (#0f172a, #1e293b) + Indigo (#6366f1, #818cf8)
- Material Icons pour l'iconographie
- Police Inter pour la typographie
- Tailwind CSS via Material theming

## Authentification

- **JWT Tokens** stockés localement
- **Bearer tokens** dans les headers Authorization
- **Route guards** pour protéger les pages
- **HTTP interceptor** pour injecter les tokens automatiquement

## Configuration

### Frontend (.env ou environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1'
};
```

### Backend (application.yml)
- Port: 8080
- Contexts API: /api/v1
- Base de données: H2 en développement
- JWT Secret: À configurer dans les variables d'environnement

## Développement

### Commandes Frontend
```bash
npm start         # Dev server (port 4200)
npm run build     # Production build
npm test          # Tests unitaires
```

### Commandes Backend
```bash
mvn clean install    # Build
mvn spring-boot:run  # Dev server (port 8080)
mvn test            # Tests
```

## Endpoints Principaux

- `POST /api/v1/auth/login` - Connexion
- `GET /api/v1/items` - Lister les items
- `POST /api/v1/items` - Créer un item
- `GET /api/v1/items/{id}` - Détail d'un item
- `POST /api/v1/revisions/{revId}/checkout` - Verrouiller une révision
- `POST /api/v1/revisions/{revId}/checkin` - Valider une révision
- `GET /api/v1/folders/root` - Dossier racine
- `GET /api/v1/change-requests` - Lister les ECR

Pour la liste complète, consultez l'API Swagger.

## Architecture Frontend

### Services
- **AuthService**: Authentification et gestion des sessions
- **PlmApiService**: Tous les appels API

### Guards
- **authGuard**: Vérifie l'authentification avant d'accéder aux routes protégées

### Interceptors
- **authInterceptor**: Ajoute le JWT token à chaque requête

## Notes de Conception

- **Standalone Components**: Tous les composants Angular utilisent l'API standalone
- **Reactive Forms**: Validation de formulaires avec FormBuilder
- **RxJS**: Gestion asynchrone avec Observables
- **Material Components**: Tables, dialogues, cartes, etc.
- **Dark Theme**: Styles globaux avec thème sombre cohérent

## Troubleshooting

### Le frontend ne se connecte pas au backend
- Vérifier que le backend tourne sur http://localhost:8080
- Vérifier la configuration `apiUrl` dans environment.ts
- Vérifier la CORS si nécessaire dans le backend

### Les styles CSS ne chargent pas correctement
- Vider le cache du navigateur (Ctrl+Shift+Delete)
- Reconstruire le frontend : `npm run build`

### Erreurs de compilation TypeScript
- `npm install` pour réinstaller les dépendances
- Vérifier la version de Node.js: `node --version` (doit être 18+)

## Prochaines Étapes

- Déployer sur Vercel (frontend) et cloud Java (backend)
- Ajouter des tests E2E avec Cypress
- Implémenter la pagination des listes
- Ajouter des export PDF/Excel pour les BOM
- Intégrer un système de notifications en temps réel

## Support

Pour les questions ou problèmes, consulter la documentation complète ou ouvrir une issue.

---

**Version**: 1.0.0  
**Dernière mise à jour**: Juillet 2026
