# Guide de Développement miniPLM

## Configuration de l'Environnement de Développement

### Prérequis

- **Node.js**: v18+ (vérifier avec `node --version`)
- **npm**: v9+ (vérifier avec `npm --version`)
- **Java**: JDK 21+ (vérifier avec `java -version`)
- **Maven**: v3.8+ (vérifier avec `mvn --version`)
- **Git**: pour les opérations de gestion de version

### Installation Initiale

```bash
# 1. Cloner le repository
git clone https://github.com/rimelhourani/muni-plm.git
cd muni-plm

# 2. Installer les dépendances frontend
cd frontend
npm install

# 3. Retour à la racine
cd ..
```

## Démarrage du Serveur de Développement

### Ouvrir 2 terminaux

#### Terminal 1: Backend Spring Boot
```bash
cd backend
mvn clean install  # Première fois seulement
mvn spring-boot:run
```

Le serveur démarre sur **http://localhost:8080**

API Documentation (Swagger): http://localhost:8080/swagger-ui.html

#### Terminal 2: Frontend Angular
```bash
cd frontend
npm start
```

L'application démarre sur **http://localhost:4200**

## Workflow de Développement

### 1. Effectuer des Modifications

**Frontend** (Angular):
```bash
# Les fichiers sont automatiquement compilés lors de la sauvegarde
# Hot Module Replacement (HMR) recharge la page automatiquement
# Fichiers à modifier: src/app/pages/*, src/app/services/, etc.
```

**Backend** (Spring Boot):
```bash
# Les classes Java sont automatiquement compilées
# Pour les changements, relancer le serveur
# Utiliser spring-boot-devtools pour un rechargement plus rapide
```

### 2. Tester l'Application

**Login avec les comptes de test**:
- Admin: `admin` / `admin123`
- Engineer: `engineer` / `engineer123`
- Approver: `approver` / `approver123`
- Viewer: `viewer` / `viewer123`

**Vérifier les endpoints API**:
```bash
# Depuis le terminal ou Postman
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### 3. Debug et Console

**Frontend (Chrome DevTools)**:
- Ouvrir: F12 ou Ctrl+Shift+I
- Console: Voir les logs Angular et les erreurs réseau
- Sources: Déboguer le code TypeScript

**Backend (Logs Spring Boot)**:
- Les logs s'affichent directement dans le terminal
- Pour plus de logs: Modifier `application.yml` avec `logging.level.root: DEBUG`

## Structure du Projet

### Frontend (Angular 18)

```
src/
├── app/
│   ├── pages/
│   │   ├── login/            # Page d'authentification
│   │   ├── dashboard/        # Tableau de bord
│   │   ├── items/            # Gestion des items
│   │   │   ├── item-list/
│   │   │   ├── item-detail/
│   │   │   └── create-item-dialog/
│   │   └── ecr/              # Gestion des ECR
│   │       ├── ecr-list/
│   │       ├── ecr-detail/
│   │       └── create-ecr-dialog/
│   ├── layout/
│   │   └── shell/            # Layout principal avec sidebar
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── plm-api.service.ts
│   ├── guards/
│   │   └── auth.guard.ts
│   ├── interceptors/
│   │   └── auth.interceptor.ts
│   ├── models/
│   │   └── plm.models.ts
│   ├── app.component.ts      # Root component
│   ├── app.config.ts         # Configuration app
│   └── app.routes.ts         # Routes définition
├── environments/             # Environnements (dev, prod)
├── styles.css               # Styles globaux
├── main.ts                  # Point d'entrée
└── index.html              # HTML principal
```

### Backend (Spring Boot 3.3)

```
src/main/java/com/miniplm/
├── controller/              # REST endpoints
├── service/                 # Business logic
├── entity/                  # JPA entities
├── repository/              # Data access layer
├── config/                  # Configuration & Security
├── dto/                     # Data transfer objects
├── exception/               # Exception handling
└── BackendApplication.java  # Main class
```

## Développement des Composants

### Créer un Nouveau Composant Angular

```bash
cd frontend
# Créer manuellement le dossier et ajouter le fichier .ts
# Ou utiliser ng generate (if you have ng CLI):
# ng generate component pages/my-feature/my-feature
```

**Template de base**:
```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-feature',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="container"><!-- Template here --></div>`,
  styles: [`.container { /* Styles here */ }`]
})
export class MyFeatureComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    // Initialize component
  }
}
```

### Ajouter un Endpoint Backend

1. **Créer une entité** (`entity/MyEntity.java`):
```java
@Entity
@Table(name = "my_entities")
@Data
public class MyEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;
  
  @Column(nullable = false)
  private String name;
}
```

2. **Créer un repository** (`repository/MyEntityRepository.java`):
```java
@Repository
public interface MyEntityRepository extends JpaRepository<MyEntity, String> {
  Optional<MyEntity> findByName(String name);
}
```

3. **Créer un service** (`service/MyEntityService.java`):
```java
@Service
@RequiredArgsConstructor
public class MyEntityService {
  private final MyEntityRepository repository;
  
  public MyEntity create(MyEntity entity) {
    return repository.save(entity);
  }
}
```

4. **Créer un contrôleur** (`controller/MyEntityController.java`):
```java
@RestController
@RequestMapping("/api/v1/my-entities")
@RequiredArgsConstructor
public class MyEntityController {
  private final MyEntityService service;
  
  @PostMapping
  public ResponseEntity<MyEntity> create(@RequestBody MyEntity entity) {
    return ResponseEntity.ok(service.create(entity));
  }
}
```

## Tests

### Tests Frontend (Jasmine/Karma)
```bash
cd frontend
npm test
```

### Tests Backend (JUnit/Mockito)
```bash
cd backend
mvn test
```

## Build pour Production

### Frontend
```bash
cd frontend
npm run build
# Génère dist/miniplm-frontend/ prêt pour déploiement
```

### Backend
```bash
cd backend
mvn clean package
# Génère target/backend-0.0.1-SNAPSHOT.jar
```

## Déploiement

### Frontend (Vercel)

```bash
cd frontend

# Configuration vercel.json (à créer)
vercel env add NEXT_PUBLIC_API_URL
vercel deploy
```

### Backend (Render/Railway/Fly.io)

1. Créer un compte sur Render.com
2. Créer une nouvelle Web Service
3. Connecter le repository GitHub
4. Runtime: Java 21
5. Build Command: `mvn clean install`
6. Start Command: `java -jar target/backend-0.0.1-SNAPSHOT.jar`

## Troubleshooting

### Le frontend ne se connecte pas au backend

**Solution 1: Vérifier le proxy**
- Le backend doit tourner sur `http://localhost:8080`
- Vérifier `proxy.conf.json` dans le dossier frontend
- Vérifier `apiUrl` dans `environments/environment.ts`

**Solution 2: CORS**
- Si le frontend et backend ne sont pas sur le même domaine, ajouter CORS:

```java
@Configuration
@EnableWebMvc
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:4200")
            .allowedMethods("*");
    }
}
```

### Hot Reload ne fonctionne pas

**Frontend**:
```bash
# Arrêter le serveur (Ctrl+C)
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

**Backend**:
- Ajouter spring-boot-devtools au pom.xml pour auto-reload
- Sinon, relancer manuellement `mvn spring-boot:run`

### Port déjà utilisé

```bash
# Frontend (port 4200)
ng serve --port 4300

# Backend (port 8080)
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"
```

## Outils Recommandés

- **IDE**: IntelliJ IDEA (backend) + VS Code (frontend)
- **API Testing**: Postman ou Thunder Client
- **Git GUI**: GitKraken ou GitHub Desktop
- **Database**: DBeaver (pour H2/MySQL)

## Ressources

- [Angular Documentation](https://angular.io/docs)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Material Design Icons](https://fonts.google.com/icons)
- [RESTful API Best Practices](https://restfulapi.net/)

## Workflow Git Recommandé

```bash
# Créer une branche
git checkout -b feature/ma-fonctionnalite

# Faire des changements, commiter
git add .
git commit -m "feat: ajouter une nouvelle fonctionnalité"

# Pousser la branche
git push origin feature/ma-fonctionnalite

# Créer une Pull Request sur GitHub
# Attendre la review et le merge
```

---

**Besoin d'aide?** Consultez le README.md principal ou ouvrez une issue sur GitHub.
