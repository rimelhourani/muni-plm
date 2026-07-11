package com.miniplm.loader;

import com.miniplm.dto.RegisterRequestDto;
import com.miniplm.model.*;
import com.miniplm.repository.*;
import com.miniplm.service.AuthService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DemoDataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final FolderRepository folderRepository;
    private final ItemRepository itemRepository;
    private final ItemRevisionRepository itemRevisionRepository;
    private final BomLineRepository bomLineRepository;
    private final DocumentFileRepository documentFileRepository;
    private final LifecycleHistoryRepository lifecycleHistoryRepository;

    public DemoDataLoader(UserRepository userRepository, AuthService authService,
                          FolderRepository folderRepository, ItemRepository itemRepository,
                          ItemRevisionRepository itemRevisionRepository, BomLineRepository bomLineRepository,
                          DocumentFileRepository documentFileRepository, LifecycleHistoryRepository lifecycleHistoryRepository) {
        this.userRepository = userRepository;
        this.authService = authService;
        this.folderRepository = folderRepository;
        this.itemRepository = itemRepository;
        this.itemRevisionRepository = itemRevisionRepository;
        this.bomLineRepository = bomLineRepository;
        this.documentFileRepository = documentFileRepository;
        this.lifecycleHistoryRepository = lifecycleHistoryRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            // Already seeded
            return;
        }

        System.out.println("--- Démarrage de l'initialisation des données de démo PLM ---");

        // 1. Enregistrement des utilisateurs (qui crée aussi leurs dossiers Home)
        RegisterRequestDto adminReq = new RegisterRequestDto();
        adminReq.setUsername("admin");
        adminReq.setPassword("admin123");
        adminReq.setEmail("admin@plm.com");
        adminReq.setRole(Role.ADMIN);
        authService.registerUser(adminReq);

        RegisterRequestDto engReq = new RegisterRequestDto();
        engReq.setUsername("engineer");
        engReq.setPassword("engineer123");
        engReq.setEmail("engineer@plm.com");
        engReq.setRole(Role.ENGINEER);
        authService.registerUser(engReq);

        RegisterRequestDto appReq = new RegisterRequestDto();
        appReq.setUsername("approver");
        appReq.setPassword("approver123");
        appReq.setEmail("approver@plm.com");
        appReq.setRole(Role.APPROVER);
        authService.registerUser(appReq);

        RegisterRequestDto viewReq = new RegisterRequestDto();
        viewReq.setUsername("viewer");
        viewReq.setPassword("viewer123");
        viewReq.setEmail("viewer@plm.com");
        viewReq.setRole(Role.VIEWER);
        authService.registerUser(viewReq);

        User engineerUser = userRepository.findByUsername("engineer").orElseThrow();
        User approverUser = userRepository.findByUsername("approver").orElseThrow();

        // Récupérer le dossier Home de l'ingénieur
        Folder engHome = folderRepository.findByOwnerAndParentFolderIsNull(engineerUser).orElseThrow();

        // Créer un sous-dossier "Drone Project"
        Folder droneFolder = new Folder("Projet Drone FPV", engHome, engineerUser);
        droneFolder = folderRepository.save(droneFolder);

        // 2. Création des Items composant le drone (Libérés/RELEASED pour l'entraînement)
        
        // 2.1 Moteur
        Item motorItem = new Item("PRT-000003", "Moteur Brushless 2207 2450KV", "Moteur haute performance pour drone FPV", ItemType.PART, engineerUser, droneFolder);
        motorItem = itemRepository.save(motorItem);
        ItemRevision motorRevA = new ItemRevision(motorItem, "A", LifecycleState.RELEASED, engineerUser);
        motorRevA = itemRevisionRepository.save(motorRevA);
        motorItem.getRevisions().add(motorRevA);
        lifecycleHistoryRepository.save(new LifecycleHistory(motorRevA, null, LifecycleState.WORKING, engineerUser, "Initialisation"));
        lifecycleHistoryRepository.save(new LifecycleHistory(motorRevA, LifecycleState.WORKING, LifecycleState.RELEASED, approverUser, "Validation automatique"));

        // 2.2 Châssis
        Item frameItem = new Item("PRT-000002", "Chassis Carbone 5 pouces", "Châssis ultraléger en carbone 3K", ItemType.PART, engineerUser, droneFolder);
        frameItem = itemRepository.save(frameItem);
        ItemRevision frameRevA = new ItemRevision(frameItem, "A", LifecycleState.RELEASED, engineerUser);
        frameRevA = itemRevisionRepository.save(frameRevA);
        frameItem.getRevisions().add(frameRevA);
        lifecycleHistoryRepository.save(new LifecycleHistory(frameRevA, null, LifecycleState.WORKING, engineerUser, "Initialisation"));
        lifecycleHistoryRepository.save(new LifecycleHistory(frameRevA, LifecycleState.WORKING, LifecycleState.RELEASED, approverUser, "Validation automatique"));

        // 2.3 Batterie
        Item batteryItem = new Item("PRT-000004", "Batterie LiPo 4S 1500mAh", "Batterie LiPo 75C taux de décharge", ItemType.PART, engineerUser, droneFolder);
        batteryItem = itemRepository.save(batteryItem);
        ItemRevision batteryRevA = new ItemRevision(batteryItem, "A", LifecycleState.RELEASED, engineerUser);
        batteryRevA = itemRevisionRepository.save(batteryRevA);
        batteryItem.getRevisions().add(batteryRevA);
        lifecycleHistoryRepository.save(new LifecycleHistory(batteryRevA, null, LifecycleState.WORKING, engineerUser, "Initialisation"));
        lifecycleHistoryRepository.save(new LifecycleHistory(batteryRevA, LifecycleState.WORKING, LifecycleState.RELEASED, approverUser, "Validation automatique"));

        // 2.4 Hélice
        Item propellerItem = new Item("PRT-000005", "Helice Tripale 5043", "Hélices en polycarbonate durable", ItemType.PART, engineerUser, droneFolder);
        propellerItem = itemRepository.save(propellerItem);
        ItemRevision propellerRevA = new ItemRevision(propellerItem, "A", LifecycleState.RELEASED, engineerUser);
        propellerRevA = itemRevisionRepository.save(propellerRevA);
        propellerItem.getRevisions().add(propellerRevA);
        lifecycleHistoryRepository.save(new LifecycleHistory(propellerRevA, null, LifecycleState.WORKING, engineerUser, "Initialisation"));
        lifecycleHistoryRepository.save(new LifecycleHistory(propellerRevA, LifecycleState.WORKING, LifecycleState.RELEASED, approverUser, "Validation automatique"));

        // 2.5 Assemblage Principal (Drone)
        Item droneItem = new Item("ASM-000001", "Drone Quadricoptere FPV", "Assemblage complet d'un drone FPV de course", ItemType.ASSEMBLY, engineerUser, droneFolder);
        droneItem = itemRepository.save(droneItem);
        ItemRevision droneRevA = new ItemRevision(droneItem, "A", LifecycleState.RELEASED, engineerUser);
        droneRevA = itemRevisionRepository.save(droneRevA);
        droneItem.getRevisions().add(droneRevA);
        lifecycleHistoryRepository.save(new LifecycleHistory(droneRevA, null, LifecycleState.WORKING, engineerUser, "Initialisation"));
        lifecycleHistoryRepository.save(new LifecycleHistory(droneRevA, LifecycleState.WORKING, LifecycleState.RELEASED, approverUser, "Validation automatique"));

        // 3. Construction de la BOM de l'assemblage Drone
        bomLineRepository.save(new BomLine(droneRevA, frameRevA, 1, 10));
        bomLineRepository.save(new BomLine(droneRevA, motorRevA, 4, 20));
        bomLineRepository.save(new BomLine(droneRevA, batteryRevA, 1, 30));
        bomLineRepository.save(new BomLine(droneRevA, propellerRevA, 4, 40));

        // Attacher des documents fictifs sur la révision A du Drone
        DocumentFile specDoc = new DocumentFile(droneRevA, "cahier_des_charges_drone.pdf", "uploads/mock_cahier_des_charges.pdf", "application/pdf", 102456L, 1);
        documentFileRepository.save(specDoc);

        // 4. Création d'un sous-dossier "Drafts" avec des items en cours de review / de travail
        Folder draftFolder = new Folder("Projets en Cours", engHome, engineerUser);
        draftFolder = folderRepository.save(draftFolder);

        // 4.1 Caméra (WORKING)
        Item cameraItem = new Item("PRT-000007", "Camera FPV 1200TVL", "Module de caméra ultra-rapide faible latence", ItemType.PART, engineerUser, draftFolder);
        cameraItem = itemRepository.save(cameraItem);
        ItemRevision cameraRevA = new ItemRevision(cameraItem, "A", LifecycleState.WORKING, engineerUser);
        cameraRevA = itemRevisionRepository.save(cameraRevA);
        cameraItem.getRevisions().add(cameraRevA);
        lifecycleHistoryRepository.save(new LifecycleHistory(cameraRevA, null, LifecycleState.WORKING, engineerUser, "Initialisation"));

        // 4.2 Émetteur vidéo (WORKING)
        Item vtxItem = new Item("PRT-000008", "Emetteur Video 5.8Ghz", "Émetteur vidéo réglable 25/200/600mW", ItemType.PART, engineerUser, draftFolder);
        vtxItem = itemRepository.save(vtxItem);
        ItemRevision vtxRevA = new ItemRevision(vtxItem, "A", LifecycleState.WORKING, engineerUser);
        vtxRevA = itemRevisionRepository.save(vtxRevA);
        vtxItem.getRevisions().add(vtxRevA);
        lifecycleHistoryRepository.save(new LifecycleHistory(vtxRevA, null, LifecycleState.WORKING, engineerUser, "Initialisation"));

        // 4.3 Assemblage Caméra (UNDER_REVIEW)
        Item cameraAssemblyItem = new Item("ASM-000006", "Module Camera FPV Assemble", "Assemblage du capteur de vision et de son émetteur", ItemType.ASSEMBLY, engineerUser, draftFolder);
        cameraAssemblyItem = itemRepository.save(cameraAssemblyItem);
        ItemRevision camAssRevA = new ItemRevision(cameraAssemblyItem, "A", LifecycleState.UNDER_REVIEW, engineerUser);
        camAssRevA = itemRevisionRepository.save(camAssRevA);
        cameraAssemblyItem.getRevisions().add(camAssRevA);
        lifecycleHistoryRepository.save(new LifecycleHistory(camAssRevA, null, LifecycleState.WORKING, engineerUser, "Initialisation"));
        lifecycleHistoryRepository.save(new LifecycleHistory(camAssRevA, LifecycleState.WORKING, LifecycleState.UNDER_REVIEW, engineerUser, "Soumission pour approbation"));

        bomLineRepository.save(new BomLine(camAssRevA, cameraRevA, 1, 10));
        bomLineRepository.save(new BomLine(camAssRevA, vtxRevA, 1, 20));

        System.out.println("--- Données de démo initialisées avec succès ! ---");
    }
}
