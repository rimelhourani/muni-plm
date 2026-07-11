#!/bin/bash

# Script pour démarrer l'environnement de développement complet

echo "================================================"
echo "  miniPLM - Environnement de Développement"
echo "================================================"
echo ""

# Vérifier si les prérequis sont installés
echo "Vérification des prérequis..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

if ! command -v java &> /dev/null; then
    echo "❌ Java n'est pas installé"
    exit 1
fi

if ! command -v mvn &> /dev/null; then
    echo "❌ Maven n'est pas installé"
    exit 1
fi

echo "✓ Node.js $(node --version)"
echo "✓ npm $(npm --version)"
echo "✓ Java $(java -version 2>&1 | head -1)"
echo "✓ Maven $(mvn --version 2>&1 | head -1)"
echo ""

# Proposer le démarrage
echo "Options:"
echo "1) Démarrer le backend Spring Boot (port 8080)"
echo "2) Démarrer le frontend Angular (port 4200)"
echo "3) Démarrer les deux (recommandé)"
echo "4) Installer les dépendances uniquement"
echo ""

read -p "Choisir une option [1-4]: " choice

case $choice in
    1)
        echo "Démarrage du backend..."
        cd backend
        mvn spring-boot:run
        ;;
    2)
        echo "Installation des dépendances frontend..."
        cd frontend
        npm install
        echo ""
        echo "Démarrage du frontend..."
        npm start
        ;;
    3)
        echo "Vérification des dépendances frontend..."
        cd frontend
        if [ ! -d "node_modules" ]; then
            echo "Installation des dépendances frontend..."
            npm install
        fi
        cd ..
        
        echo ""
        echo "================================================"
        echo "Démarrage de l'environnement complet"
        echo "================================================"
        echo ""
        echo "Backend: http://localhost:8080"
        echo "API Swagger: http://localhost:8080/swagger-ui.html"
        echo "Frontend: http://localhost:4200"
        echo ""
        echo "Ouvrez deux terminaux pour lancer:"
        echo ""
        echo "Terminal 1 - Backend:"
        echo "  cd backend && mvn spring-boot:run"
        echo ""
        echo "Terminal 2 - Frontend:"
        echo "  cd frontend && npm start"
        echo ""
        ;;
    4)
        echo "Installation des dépendances frontend..."
        cd frontend
        npm install
        echo ""
        echo "✓ Dépendances installées avec succès"
        echo ""
        echo "Pour démarrer le backend:"
        echo "  cd backend && mvn spring-boot:run"
        echo ""
        echo "Pour démarrer le frontend:"
        echo "  cd frontend && npm start"
        ;;
    *)
        echo "Option invalide"
        exit 1
        ;;
esac
