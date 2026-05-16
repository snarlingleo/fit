# 🏋️ FitTracker Pro

> **Ton coach de salle personnel — Programme long terme Basic-Fit**  
> PWA installable · 100% offline · Sans serveur · Gratuit

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![PWA](https://img.shields.io/badge/PWA-ready-green)
![License](https://img.shields.io/badge/license-MIT-purple)

---

## 📱 Demo

🔗 **[Voir l'app en live](https://TON-USERNAME.github.io/fittracker-pro)**

---

## ✨ Features

### 🏋️ Programme
- ✅ Programme **long terme infini** — cycles de 16 semaines qui se renouvellent
- ✅ **5 séances/semaine** adaptées Basic-Fit
- ✅ **50+ exercices** avec GIF démo, description, conseils
- ✅ **4 phases** : Reprise → Construction → Intensité → Peak
- ✅ Progression automatique des charges par cycle
- ✅ Warm-up et étirements adaptés par séance

### ⏱️ Live Séance
- ✅ Timer repos avec compte à rebours visuel
- ✅ Son + Vibration (Web Audio API)
- ✅ RPE (effort ressenti) par série
- ✅ Chrono global de séance
- ✅ Détection automatique des PRs
- ✅ Confetti + célébration fin de séance

### 📊 Stats & Tracking
- ✅ Historique complet des séances
- ✅ Calcul 1RM automatique (formule Epley)
- ✅ Graphiques progression par exercice
- ✅ Heatmap calendrier (style GitHub)
- ✅ Volume total et comparaison semaines
- ✅ Score Forme composé (Récup + Assiduité + Progression)

### 🎮 Gamification
- ✅ Système XP + 7 niveaux (Débutant → Légende)
- ✅ 24 trophées débloquables
- ✅ Streak quotidien avec record
- ✅ Défis semaine

### 🔔 Notifications Intelligentes
- ✅ Rappel quotidien à heure configurable
- ✅ Détection d'absence (1j / 2j / 5j+)
- ✅ Alerte streak en danger
- ✅ Célébration semaine parfaite
- ✅ 3 tons : Motivant / Doux / Sévère

### 👤 Profil
- ✅ Journal d'entraînement
- ✅ Objectifs personnalisés avec suivi
- ✅ Gestion des blessures
- ✅ Coach IA adaptatif
- ✅ Export JSON / CSV
- ✅ QR Code sync

### 📱 PWA
- ✅ Installable sur iOS & Android
- ✅ 100% offline (Service Worker)
- ✅ Thème Dark / Light
- ✅ Shortcuts PWA

---

## 🚀 Installation

### Option 1 — GitHub Pages (recommandée)
```bash
# Fork ce repo puis active GitHub Pages
# Settings → Pages → Deploy from branch → main
```
L'app sera disponible sur :  
`https://TON-USERNAME.github.io/fittracker-pro`

### Option 2 — Local
```bash
# Clone
git clone https://github.com/TON-USERNAME/fittracker-pro.git
cd fittracker-pro

# Ouvrir avec un serveur local
# Option A : VS Code Live Server
# Option B : Python
python3 -m http.server 8000
# → http://localhost:8000
```

### Installer sur téléphone
1. Ouvre l'app dans **Chrome mobile**
2. Menu `⋮` → **"Ajouter à l'écran d'accueil"**
3. ✅ Installée comme une app native !

---

## 📁 Structure

```
fittracker-pro/
├── index.html          # App shell SPA
├── style.css           # Design system complet
├── manifest.json       # Configuration PWA
├── service-worker.js   # Cache offline + notifications
│
├── js/
│   ├── app.js          # Router + toutes les pages
│   ├── programme.js    # 50+ exercices + séances + cycles
│   ├── tracker.js      # Suivi progression + PRs + streak
│   ├── timer.js        # Timer repos + chrono séance
│   ├── stats.js        # Calculs + graphiques Canvas
│   ├── gamification.js # XP + niveaux + trophées
│   ├── coach.js        # Messages adaptatifs + analyse
│   ├── notifications.js# Rappels + alertes absence
│   └── utils.js        # Helpers + graphiques + export
│
└── assets/
    ├── icons/          # PWA icons (72/96/128/192/512px)
    ├── exercices/      # GIFs démonstration (36 exercices)
    └── sounds/         # Sons (beep, finish, PR, level-up)
```

---

## 🛠️ Technologies

| Tech | Usage |
|------|-------|
| HTML5 | Structure SPA |
| CSS3 Custom Properties | Design system + thèmes |
| JavaScript Vanilla ES6+ | Logique complète |
| Service Worker API | Offline + notifications |
| Web Audio API | Sons sans fichiers |
| Canvas API | Graphiques natifs |
| LocalStorage | Persistance données |
| Web App Manifest | PWA installable |

> **Zéro dépendance externe.** Pas de React, pas de Vue, pas de jQuery.  
> Fonctionne partout, même sans connexion.

---

## 🗺️ Roadmap

### v1.0 — MVP ✅
- [x] Programme 5 séances/semaine Basic-Fit
- [x] Timer repos + Live séance
- [x] Tracking PRs + streak
- [x] Notifications intelligentes
- [x] Gamification XP + trophées
- [x] PWA installable offline

### v1.1 — En cours 🔄
- [ ] GIFs exercices (assets à ajouter)
- [ ] Graphiques interactifs améliorés
- [ ] Mode Superset
- [ ] Export PDF progression

### v1.2 — Planifié 📋
- [ ] Mode circuit training
- [ ] Sync multi-appareils (IndexedDB)
- [ ] Photos de progression
- [ ] Partage séance

### v2.0 — Future 🚀
- [ ] Backend optionnel (sync cloud)
- [ ] Mode coach partagé
- [ ] IA recommandations avancées
- [ ] Apple Watch / WearOS

---

## 🎨 Design System

Basé sur la palette **Foundever** adaptée fitness :

| Variable | HEX | Usage |
|----------|-----|-------|
| `--fd-indigo` | `#4b4bf9` | Couleur principale |
| `--fd-midnight` | `#09092d` | Fond dark |
| `--fd-mint` | `#8bf0bb` | Succès / PRs |
| `--fd-lemon` | `#f9ef77` | Timer / Highlights |
| `--fd-coral` | `#ff8d96` | Alertes / Erreurs |
| `--fd-lavender` | `#bfa1ff` | Labels / Accents |

---

## 📊 Programme Basic-Fit

| Jour | Séance | Groupes |
|------|--------|---------|
| Lundi | Pectoraux + Triceps | Bench, Incliné, Écarté, Dips |
| Mardi | Dos + Biceps | Tractions, Rowing, Tirage, Curl |
| Mercredi | Épaules + Bras | Militaire, Latérales, Face Pull |
| Jeudi | **Repos** | Récupération active |
| Vendredi | Jambes + Fessiers | Squat, Presse, Fentes, Curl |
| Samedi | Full Body + Gainage | Deadlift, Planche, Abdos |
| Dimanche | **Repos** | Repos complet |

---

## 🤝 Contribution

1. Fork le projet
2. Crée ta branche : `git checkout -b feature/ma-feature`
3. Commit : `git commit -m 'Add: ma feature'`
4. Push : `git push origin feature/ma-feature`
5. Ouvre une **Pull Request**

---

## 📄 License

MIT License — Libre d'utilisation et de modification.

---

<div align="center">
  <strong>Built with 💪 by Othmane</strong><br>
  <sub>Powered by EverGPT</sub>
</div>
