# Examen-WEB1-finale-
# README - Application de Prise de Notes (NOTEO~)

## Description
NOTEO~ est une application web de prise de notes moderne et intuitive avec une interface utilisateur élégante et des fonctionnalités avancées. Elle permet aux utilisateurs de créer, organiser et gérer leurs notes avec des fonctionnalités comme le marquage de favoris, les notes importantes, le support Markdown, et plus encore.

## Fonctionnalités principales
- **Authentification utilisateur** : Inscription et connexion sécurisées
- **Création de notes** : 
  - Support Markdown (gras, italique, titres, listes, code)
  - Options de couleur
  - Marquer comme important/favori
  - Ajout de tags
- **Organisation des notes** : 
  - Colonnes triables (Toutes, Favoris, Importantes)
  - Tri par date ou alphabétique
  - Recherche instantanée
- **Modèles prédéfinis** : Réunion, To-Do, Idée, Journal
- **Thème clair/sombre** : Adapté à toutes les préférences
- **Export des notes** : Format JSON
- **Interface animée** : Fond dynamique et transitions fluides

## Structure des fichiers
```
.
├── index.html          # Structure principale de l'application
├── styles.css          # Styles CSS avec thème clair/sombre
├── script.js           # Logique de l'application
└── import.png          # Exemple d'image (non utilisé dans l'application)
```

## Technologies utilisées
- HTML5, CSS3, JavaScript vanilla
- Font Awesome pour les icônes
- Google Fonts (Inter et JetBrains Mono)
- Stockage local (localStorage) pour la persistance des données
- Markdown léger pour la mise en forme du texte

## Installation
1. Clonez ou téléchargez le dépôt
2. Ouvrez `index.html` dans un navigateur web moderne
3. Créez un compte ou connectez-vous pour commencer à utiliser l'application

## Utilisation
1. **Créer une note** :
   - Remplissez le titre et le contenu
   - Utilisez la barre d'outils pour la mise en forme Markdown
   - Optionnel : ajoutez un tag, une couleur ou marquez comme important
   - Cliquez sur "Ajouter la note"

2. **Organiser les notes** :
   - Utilisez les colonnes pour filtrer (Toutes, Favoris, Importantes)
   - Triez par date ou ordre alphabétique
   - Utilisez la barre de recherche pour trouver des notes spécifiques

3. **Modèles** :
   - Cliquez sur l'icône "Modèles" pour accéder aux modèles prédéfinis
   - Sélectionnez un modèle pour pré-remplir votre note

4. **Thème** :
   - Basculez entre thème clair et sombre avec l'icône en haut à droite

## Personnalisation
Vous pouvez facilement personnaliser :
- Les couleurs dans `:root` dans styles.css
- Les modèles de notes dans `noteTemplates` dans script.js
- Les animations dans les sections correspondantes de styles.css

## Compatibilité
L'application est conçue pour fonctionner sur tous les navigateurs modernes et est responsive pour une utilisation sur mobile et tablette.

## Auteur
SANDRATRA
Jimmy

## Licence
Libre d'utilisation 
