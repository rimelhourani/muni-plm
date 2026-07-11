# Guide de Contribution - miniPLM

Merci de votre intérêt pour contribuer à miniPLM ! Ce document fournit les directives pour contribuer au projet.

## Code de Conduite

Soyez respectueux, inclusif et professionnel dans tous les échanges. Tout incident sera traité avec sérieux.

## Comment Contribuer

### 1. Signaler un Bug

Créez une issue avec:
- **Titre descriptif**: Inclure le composant affecté (ex: "[Frontend] Les items ne se chargent pas")
- **Description**: Décrire le comportement attendu vs actuel
- **Étapes pour reproduire**: Instructions claires et concises
- **Environnement**: Système, navigateur, version Node/Java
- **Logs**: Inclure les erreurs pertinentes

### 2. Proposer une Nouvelle Fonctionnalité

Créez une issue avec:
- **Titre**: Format "[Feature] Description brève"
- **Contexte**: Pourquoi cette fonctionnalité est utile
- **Description**: Comportement attendu
- **Cas d'usage**: Exemples concrets
- **Alternatives**: Approches différentes envisagées

### 3. Soumettre du Code

#### Préparer votre Environnement

```bash
# 1. Fork le repository
# (Cliquez sur "Fork" sur GitHub)

# 2. Cloner votre fork
git clone https://github.com/VOTRE_USERNAME/muni-plm.git
cd muni-plm

# 3. Ajouter l'upstream
git remote add upstream https://github.com/rimelhourani/muni-plm.git

# 4. Créer une branche de feature
git checkout -b feature/ma-nouvelle-fonctionnalite
# ou
git checkout -b fix/mon-bug-fix
```

#### Workflow de Développement

```bash
# Développer et tester
npm test          # Frontend
mvn test         # Backend

# Commiter avec des messages clairs
git add .
git commit -m "feat: ajouter la fonctionnalité X"
git commit -m "fix: corriger le bug Y"
git commit -m "docs: mettre à jour la documentation"

# Pousser vers votre fork
git push origin feature/ma-nouvelle-fonctionnalite
```

#### Créer une Pull Request

1. Allez sur GitHub et créez une PR
2. **Titre**: Format `[Frontend/Backend] Description brève`
3. **Description**:
   - Résumé des changements
   - Issues liées (ex: Fixes #123)
   - Description technique des modifications
   - Tout breaking change

4. **Checklist**:
```markdown
- [ ] Code testé localement
- [ ] Tests unitaires ajoutés/modifiés
- [ ] Documentation mise à jour
- [ ] Aucune console.log en production
- [ ] Pas de breaking changes (ou documenté)
```

## Standards de Code

### Frontend (Angular/TypeScript)

**Conventions**:
- Utiliser `camelCase` pour les variables et méthodes
- Utiliser `PascalCase` pour les classes et composants
- Utiliser `kebab-case` pour les fichiers
- 2 espaces pour l'indentation

**Exemple**:
```typescript
// Bon
private getUserDetails(userId: string): Observable<User> {
  return this.apiService.getUser(userId);
}

// Mauvais
private get_user_details(userId: string): Observable<User> {
  return this.apiService.getUser(userId);
}
```

**Standalone Components**:
Tous les nouveaux composants doivent être standalone:
```typescript
@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: '...',
  styles: ['...']
})
```

**Services**:
Injecter les dépendances avec `@Injectable()`:
```typescript
@Injectable({ providedIn: 'root' })
export class MyService {
  constructor(private http: HttpClient) {}
}
```

### Backend (Java/Spring Boot)

**Conventions**:
- Utiliser `camelCase` pour les variables et méthodes
- Utiliser `PascalCase` pour les classes
- Utiliser `UPPER_CASE` pour les constantes
- 4 espaces pour l'indentation

**Exemple**:
```java
// Bon
@Service
@RequiredArgsConstructor
public class UserService {
  private final UserRepository userRepository;
  
  public User getUserById(String id) {
    return userRepository.findById(id).orElseThrow(...);
  }
}

// Mauvais
@Service
public class UserService {
  @Autowired
  private UserRepository user_repository;  // ❌ Mauvaise convention
}
```

**Annotations Spring**:
- Utiliser Lombok: `@RequiredArgsConstructor`, `@Data`, `@Getter`, `@Setter`
- Utiliser les annotations de validation: `@NotBlank`, `@Email`, etc.

## Messages de Commit

Suivre le format Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Changements de documentation
- `style`: Formatage (sans changement fonctionnel)
- `refactor`: Refactorisation du code
- `perf`: Amélioration de performance
- `test`: Ajout ou modification de tests
- `chore`: Tâches de maintenance

**Exemples**:
```
feat(items): ajouter la pagination des items
fix(auth): corriger l'expiration du token JWT
docs(readme): mettre à jour les instructions d'installation
refactor(api): améliorer la structure des services
```

## Tests

### Obligations Minimales

- Tout nouveau code doit avoir des tests unitaires
- La couverture de code doit rester ≥ 80%
- Les tests doivent passer avant la PR

### Frontend

```bash
cd frontend
npm test

# Vérifier la couverture
npm test -- --code-coverage
```

### Backend

```bash
cd backend
mvn test

# Avec couverture
mvn test jacoco:report
```

## Documentation

Pour tout nouveau code significatif, ajouter:
- **Comments JSDoc**: Pour les classes, méthodes publiques
- **README**: Mettre à jour si changement d'API/structure
- **CHANGELOG.md**: Documenter les changements majeurs

**Exemple JSDoc**:
```typescript
/**
 * Récupère les détails d'un utilisateur
 * @param userId - L'ID unique de l'utilisateur
 * @returns Observable contenant les données utilisateur
 * @throws NotFoundException si l'utilisateur n'existe pas
 */
getUser(userId: string): Observable<User> {
  // Implementation
}
```

## Performance et Accessibilité

### Frontend
- [ ] Pas de memoria leak (unsubscribe)
- [ ] Lazy loading pour les grandes listes
- [ ] ARIA labels pour l'accessibilité
- [ ] Alt text pour les images
- [ ] Lighthouse score ≥ 90

### Backend
- [ ] Pas de N+1 queries
- [ ] Pagination pour les grandes données
- [ ] Index pour les colonnes de recherche fréquente
- [ ] Caching approprié

## Review Process

1. **Automatic Checks**:
   - Build doit passer
   - Tests doivent réussir
   - Linting sans erreurs

2. **Manual Review**:
   - Minimum 1 approbation requise
   - Examen du code et architecture
   - Feedback constructif

3. **Merge**:
   - Rebase sur main (pas de merge commits)
   - Delete branch après merge
   - Update documentation si nécessaire

## Questions ?

- Consultez le [README.md](./README.md)
- Consultez le [DEVELOPMENT.md](./DEVELOPMENT.md)
- Ouvrez une discussion sur GitHub

---

**Merci de votre contribution !** 🎉
