/* ============================================================
   PowerApp — Firebase Configuration
   ============================================================ */

// Import Firebase SDKs via CDN (pas de npm nécessaire !)
import { initializeApp }        from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth,
         createUserWithEmailAndPassword,
         signInWithEmailAndPassword,
         signOut,
         onAuthStateChanged,
         sendPasswordResetEmail,
         updateProfile }        from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore,
         doc, setDoc, getDoc,
         updateDoc, deleteDoc,
         collection, getDocs,
         onSnapshot }           from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ─── CONFIG ───────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyCP3nUlEO851VHyz4OMr7GpG_P4MHf10gk",
  authDomain:        "powerapp-pro.firebaseapp.com",
  projectId:         "powerapp-pro",
  storageBucket:     "powerapp-pro.firebasestorage.app",
  messagingSenderId: "6168840989",
  appId:             "1:6168840989:web:fe25ee6f83a750097b6ff4",
  measurementId:     "G-E3LZ98GCS3"
};

// ─── INITIALISATION ───────────────────────────────────────────
const firebaseApp = initializeApp(firebaseConfig);
const auth        = getAuth(firebaseApp);
const db          = getFirestore(firebaseApp);

// ─── ÉTAT UTILISATEUR GLOBAL ──────────────────────────────────
window.FirebaseUser = {
  user:      null,
  isLoading: true,
  isLogged:  false
};

// ─── OBSERVER AUTH ────────────────────────────────────────────
onAuthStateChanged(auth, async (user) => {
  window.FirebaseUser.isLoading = false;

  if (user) {
    window.FirebaseUser.user    = user;
    window.FirebaseUser.isLogged = true;
    console.log('✅ Connecté :', user.email);

    // Charger les données cloud
    await CloudDB.chargerTout();

    // Lancer l'app si elle attend
    if (window._appEnAttente) {
      window._appEnAttente = false;
      lancerApp();
    }
  } else {
    window.FirebaseUser.user     = null;
    window.FirebaseUser.isLogged = false;
    console.log('👤 Non connecté');

    // Afficher la page de connexion
    afficherPageAuth();
  }
});

// ════════════════════════════════════════════════════════════
// AUTH — Inscription / Connexion / Déconnexion
// ════════════════════════════════════════════════════════════
const Auth = {

  // ─── INSCRIPTION ────────────────────────────────────────────
  async inscrire(email, motDePasse, prenom) {
    try {
      const result = await createUserWithEmailAndPassword(
        auth, email, motDePasse
      );

      // Ajouter le prénom au profil Firebase
      await updateProfile(result.user, {
        displayName: prenom
      });

      // Créer le profil dans Firestore
      await CloudDB.initialiserProfil(result.user, prenom);

      Utils.toast(`Bienvenue ${prenom} ! 🎉`, 'success', 3000);
      return { ok: true };

    } catch(e) {
      return { ok: false, erreur: Auth._traduireErreur(e.code) };
    }
  },

  // ─── CONNEXION ───────────────────────────────────────────────
  async connecter(email, motDePasse) {
    try {
      await signInWithEmailAndPassword(auth, email, motDePasse);
      Utils.toast('Content de te revoir ! 💪', 'success');
      return { ok: true };

    } catch(e) {
      return { ok: false, erreur: Auth._traduireErreur(e.code) };
    }
  },

  // ─── DÉCONNEXION ─────────────────────────────────────────────
  async deconnecter() {
    const ok = await Utils.confirmer(
      'Se déconnecter ?',
      'Tes données sont sauvegardées dans le cloud.'
    );
    if (!ok) return;

    await signOut(auth);
    Utils.toast('À bientôt ! 👋', 'info');
  },

  // ─── RESET MOT DE PASSE ──────────────────────────────────────
  async resetMotDePasse(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      Utils.toast('Email envoyé ! Vérifie ta boîte mail 📧', 'success');
      return { ok: true };
    } catch(e) {
      return { ok: false, erreur: Auth._traduireErreur(e.code) };
    }
  },

  // ─── TRADUCTION ERREURS ───────────────────────────────────────
  _traduireErreur(code) {
    const erreurs = {
      'auth/email-already-in-use':    'Cet email est déjà utilisé.',
      'auth/weak-password':           'Mot de passe trop faible (6 caractères min).',
      'auth/invalid-email':           'Email invalide.',
      'auth/user-not-found':          'Aucun compte avec cet email.',
      'auth/wrong-password':          'Mot de passe incorrect.',
      'auth/too-many-requests':       'Trop de tentatives. Réessaie plus tard.',
      'auth/network-request-failed':  'Problème de connexion internet.',
      'auth/invalid-credential':      'Email ou mot de passe incorrect.'
    };
    return erreurs[code] || 'Une erreur est survenue. Réessaie.';
  }
};

// ════════════════════════════════════════════════════════════
// CLOUD DB — Synchronisation Firestore
// ════════════════════════════════════════════════════════════
const CloudDB = {

  // ─── CHEMIN UTILISATEUR ───────────────────────────────────────
  _userDoc() {
    const uid = window.FirebaseUser.user?.uid;
    if (!uid) return null;
    return doc(db, 'users', uid);
  },

  _userCollection(nom) {
    const uid = window.FirebaseUser.user?.uid;
    if (!uid) return null;
    return collection(db, 'users', uid, nom);
  },

  // ─── INITIALISER PROFIL (nouvelle inscription) ───────────────
  async initialiserProfil(user, prenom) {
    const ref = doc(db, 'users', user.uid);
    await setDoc(ref, {
      profil: {
        nom:       prenom,
        email:     user.email,
        avatar:    '💪',
        dateCreation: new Date().toISOString()
      },
      dateCreation: new Date().toISOString()
    });
  },

  // ─── SAUVEGARDER DONNÉES ─────────────────────────────────────
  async sauvegarder(cle, valeur) {
    const ref = this._userDoc();
    if (!ref) return;

    try {
      await updateDoc(ref, { [cle]: valeur });
    } catch(e) {
      // Document n'existe pas encore → créer
      await setDoc(ref, { [cle]: valeur }, { merge: true });
    }
  },

  // ─── CHARGER TOUTES LES DONNÉES ──────────────────────────────
  async chargerTout() {
    const ref = this._userDoc();
    if (!ref) return;

    try {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();

        // Restaurer dans localStorage pour compatibilité
        Object.entries(data).forEach(([cle, valeur]) => {
          if (cle !== 'dateCreation') {
            try {
              localStorage.setItem(cle, JSON.stringify(valeur));
            } catch(e) {}
          }
        });

        console.log('✅ Données cloud chargées');
      }
    } catch(e) {
      console.warn('Erreur chargement cloud:', e);
    }
  },

  // ─── SYNC AUTOMATIQUE ────────────────────────────────────────
  // Appelée à chaque modification de données importantes
  async syncDonnees() {
    if (!window.FirebaseUser.isLogged) return;

    const clesImportantes = [
      'ft_profil',
      'ft_seances',
      'ft_prs',
      'ft_mesures',
      'ft_journal',
      'ft_objectifs',
      'ft_streak',
      'ft_xp',
      'ft_defis',
      'ft_blessures',
      'ft_humeur',
      'ft_fatigue',
      'ft_theme',
      'ft_programme_debut'
    ];

    const data = {};
    clesImportantes.forEach(cle => {
      const val = localStorage.getItem(cle);
      if (val) {
        try { data[cle] = JSON.parse(val); }
        catch(e) { data[cle] = val; }
      }
    });

    try {
      const ref = this._userDoc();
      if (ref) {
        await setDoc(ref, {
          ...data,
          lastSync: new Date().toISOString()
        }, { merge: true });
        console.log('☁️ Sync cloud OK');
      }
    } catch(e) {
      console.warn('Erreur sync:', e);
    }
  }
};

// ─── SYNC AUTO toutes les 30 secondes ─────────────────────────
setInterval(() => {
  if (window.FirebaseUser.isLogged) {
    CloudDB.syncDonnees();
  }
}, 30000);

// ─── SYNC à chaque fermeture de page ──────────────────────────
window.addEventListener('beforeunload', () => {
  if (window.FirebaseUser.isLogged) {
    CloudDB.syncDonnees();
  }
});

window.Auth    = Auth;
window.CloudDB = CloudDB;
window.auth    = auth;
window.db      = db;

console.log('✅ Firebase chargé — PowerApp Pro');
