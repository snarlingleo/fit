/* ============================================================
   PowerApp — Firebase (version CDN compatible)
   ============================================================ */

// Charger Firebase via script dynamique
(async function() {
  try {
    // Import dynamique Firebase
    const { initializeApp } = await import(
      'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'
    );
    const {
      getAuth,
      createUserWithEmailAndPassword,
      signInWithEmailAndPassword,
      signOut,
      onAuthStateChanged,
      sendPasswordResetEmail,
      updateProfile
    } = await import(
      'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'
    );
    const {
      getFirestore,
      doc, setDoc, getDoc, updateDoc,
      collection
    } = await import(
      'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
    );

    // ── Config ─────────────────────────────────────────────────
    const firebaseConfig = {
      apiKey:            "AIzaSyCP3nUlEO851VHyz4OMr7GpG_P4MHf10gk",
      authDomain:        "powerapp-pro.firebaseapp.com",
      projectId:         "powerapp-pro",
      storageBucket:     "powerapp-pro.firebasestorage.app",
      messagingSenderId: "6168840989",
      appId:             "1:6168840989:web:fe25ee6f83a750097b6ff4"
    };

    // ── Init ───────────────────────────────────────────────────
    const firebaseApp = initializeApp(firebaseConfig);
    const auth        = getAuth(firebaseApp);
    const db          = getFirestore(firebaseApp);

    window.FirebaseUser = {
      user:      null,
      isLoading: true,
      isLogged:  false
    };

    // ── CloudDB ────────────────────────────────────────────────
    window.CloudDB = {
      _userDoc() {
        const uid = window.FirebaseUser.user?.uid;
        if (!uid) return null;
        return doc(db, 'users', uid);
      },

      async initialiserProfil(user, prenom) {
        try {
          const ref = doc(db, 'users', user.uid);
          await setDoc(ref, {
            ft_profil: {
              nom:          prenom,
              email:        user.email,
              avatar:       '💪',
              dateCreation: new Date().toISOString()
            },
            dateCreation: new Date().toISOString()
          });
        } catch(e) { console.warn('initialiserProfil:', e); }
      },

      async chargerTout() {
        const ref = this._userDoc();
        if (!ref) return;
        try {
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data();
            Object.entries(data).forEach(([cle, valeur]) => {
              if (cle !== 'dateCreation' && cle !== 'lastSync') {
                try {
                  localStorage.setItem(
                    cle, JSON.stringify(valeur)
                  );
                } catch(e) {}
              }
            });
            console.log('✅ Données cloud chargées');
          }
        } catch(e) { console.warn('chargerTout:', e); }
      },

      async syncDonnees() {
        if (!window.FirebaseUser.isLogged) return;
        const cles = [
          'ft_profil','ft_seances','ft_prs',
          'ft_mesures','ft_journal','ft_objectifs',
          'ft_streak','ft_xp','ft_defis',
          'ft_blessures','ft_humeur','ft_fatigue',
          'ft_theme','ft_programme_debut'
        ];
        const data = {};
        cles.forEach(cle => {
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
            console.log('☁️ Sync OK');
          }
        } catch(e) { console.warn('sync:', e); }
      }
    };

    // ── Auth ───────────────────────────────────────────────────
    window.Auth = {
      async inscrire(email, mdp, prenom) {
        try {
          const result = await createUserWithEmailAndPassword(
            auth, email, mdp
          );
          await updateProfile(result.user, {
            displayName: prenom
          });
          await CloudDB.initialiserProfil(result.user, prenom);

          // Sauvegarder profil local
          try {
            Tracker.sauvegarderProfil({ nom: prenom });
          } catch(e) {}

          return { ok: true };
        } catch(e) {
          return { ok: false, erreur: this._err(e.code) };
        }
      },

      async connecter(email, mdp) {
        try {
          await signInWithEmailAndPassword(auth, email, mdp);
          return { ok: true };
        } catch(e) {
          return { ok: false, erreur: this._err(e.code) };
        }
      },

      async deconnecter() {
        try {
          const ok = await Utils.confirmer(
            'Se déconnecter ?',
            'Tes données sont sauvegardées dans le cloud.'
          );
          if (!ok) return;
          await signOut(auth);
        } catch(e) { console.warn(e); }
      },

      async resetMotDePasse(email) {
        try {
          await sendPasswordResetEmail(auth, email);
          return { ok: true };
        } catch(e) {
          return { ok: false, erreur: this._err(e.code) };
        }
      },

      _err(code) {
        const map = {
          'auth/email-already-in-use':   'Email déjà utilisé.',
          'auth/weak-password':          'Mot de passe trop court (6 min).',
          'auth/invalid-email':          'Email invalide.',
          'auth/user-not-found':         'Aucun compte avec cet email.',
          'auth/wrong-password':         'Mot de passe incorrect.',
          'auth/invalid-credential':     'Email ou mot de passe incorrect.',
          'auth/too-many-requests':      'Trop de tentatives. Réessaie plus tard.',
          'auth/network-request-failed': 'Problème de connexion.'
        };
        return map[code] || 'Erreur : ' + code;
      }
    };

    // ── Observer Auth ──────────────────────────────────────────
    onAuthStateChanged(auth, async (user) => {
      window.FirebaseUser.isLoading = false;

      if (user) {
        window.FirebaseUser.user     = user;
        window.FirebaseUser.isLogged = true;
        console.log('✅ Connecté :', user.email);

        // Charger données cloud
        await CloudDB.chargerTout();

        // Masquer page auth
        document.getElementById('auth-page')
          ?.classList.add('hidden');

        // Lancer app
        if (window._appEnAttente) {
          window._appEnAttente = false;

          // Vérifier si onboarding nécessaire
          let profil = {};
          try { profil = Tracker.getProfil(); } catch(e) {}

          if (!profil.nom || profil.nom === 'Athlète') {
            // Pré-remplir avec displayName Firebase
            if (user.displayName) {
              try {
                Tracker.sauvegarderProfil({
                  nom: user.displayName
                });
              } catch(e) {}
            }
            try { afficherOnboarding(); } catch(e) {
              lancerApp();
            }
          } else {
            lancerApp();
          }
        }

      } else {
        window.FirebaseUser.user     = null;
        window.FirebaseUser.isLogged = false;
        console.log('👤 Non connecté');

        // Afficher page auth
        try { afficherPageAuth(); } catch(e) {
          console.warn('afficherPageAuth non dispo:', e);
        }
      }
    });

    // ── Sync auto ──────────────────────────────────────────────
    setInterval(() => {
      if (window.FirebaseUser.isLogged) {
        CloudDB.syncDonnees();
      }
    }, 30000);

    window.addEventListener('beforeunload', () => {
      if (window.FirebaseUser.isLogged) {
        CloudDB.syncDonnees();
      }
    });

    console.log('✅ Firebase prêt !');

  } catch(e) {
    console.error('❌ Firebase erreur:', e);
    // Fallback — lancer app sans Firebase
    window.Auth    = null;
    window.CloudDB = null;
  }
})();
