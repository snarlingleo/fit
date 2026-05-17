/* ============================================================
   PowerApp — Interface Auth (Login / Register)
   ============================================================ */

function afficherPageAuth(onglet = 'connexion') {
  // Cacher l'app
  document.getElementById('app-wrapper')
    ?.classList.add('hidden');
  document.getElementById('splash-screen')
    ?.classList.add('hidden');

  // Créer ou afficher la page auth
  let authPage = document.getElementById('auth-page');
  if (!authPage) {
    authPage = document.createElement('div');
    authPage.id = 'auth-page';
    authPage.style.cssText = `
      position:fixed;inset:0;
      background:var(--fd-midnight);
      z-index:9998;
      overflow-y:auto;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:var(--space-lg)`;
    document.body.appendChild(authPage);
  }

  authPage.classList.remove('hidden');
  authPage.innerHTML = _renderAuthPage(onglet);
}

function _renderAuthPage(onglet) {
  return `
    <div style="width:100%;max-width:400px;
                animation:fadeInUp .4s ease">

      <!-- Logo -->
      <div style="text-align:center;margin-bottom:var(--space-xl)">
        <div style="font-size:3.5rem;margin-bottom:var(--space-sm)">
          ⚡
        </div>
        <h1 style="font-size:1.8rem;font-weight:800;
                   color:white;margin-bottom:4px">
          PowerApp
        </h1>
        <p style="color:rgba(255,255,255,0.5);font-size:.85rem">
          Ton coach personnel
        </p>
      </div>

      <!-- Tabs -->
      <div style="display:grid;grid-template-columns:1fr 1fr;
                  gap:4px;background:rgba(255,255,255,0.06);
                  border-radius:var(--radius-lg);
                  padding:4px;margin-bottom:var(--space-lg)">
        <button onclick="afficherPageAuth('connexion')"
                style="padding:var(--space-sm);
                       border-radius:var(--radius-md);
                       border:none;
                       font-weight:700;font-size:.88rem;
                       cursor:pointer;transition:all .2s;
                       background:${onglet==='connexion'
                         ? 'var(--fd-indigo)' : 'transparent'};
                       color:${onglet==='connexion'
                         ? 'white' : 'rgba(255,255,255,0.5)'}">
          Connexion
        </button>
        <button onclick="afficherPageAuth('inscription')"
                style="padding:var(--space-sm);
                       border-radius:var(--radius-md);
                       border:none;
                       font-weight:700;font-size:.88rem;
                       cursor:pointer;transition:all .2s;
                       background:${onglet==='inscription'
                         ? 'var(--fd-indigo)' : 'transparent'};
                       color:${onglet==='inscription'
                         ? 'white' : 'rgba(255,255,255,0.5)'}">
          Inscription
        </button>
      </div>

      <!-- Formulaire -->
      <div style="background:rgba(255,255,255,0.05);
                  border:1px solid rgba(255,255,255,0.1);
                  border-radius:var(--radius-xl);
                  padding:var(--space-xl)">

        ${onglet === 'connexion'
          ? _renderFormConnexion()
          : _renderFormInscription()}

      </div>

      <!-- Footer -->
      <p style="text-align:center;font-size:.72rem;
                color:rgba(255,255,255,0.3);
                margin-top:var(--space-lg)">
        Powered by EverGPT ⚡
      </p>
    </div>
  `;
}

function _renderFormConnexion() {
  return `
    <h2 style="font-size:1.2rem;font-weight:700;
               color:white;margin-bottom:var(--space-lg)">
      Content de te revoir 👋
    </h2>

    <div style="margin-bottom:var(--space-md)">
      <div class="input-label" style="color:rgba(255,255,255,0.6)">
        Email
      </div>
      <input class="input" id="auth-email"
             type="email"
             placeholder="ton@email.com"
             autocomplete="email"
             style="margin-top:4px"
             onkeydown="if(event.key==='Enter')
               document.getElementById('auth-mdp').focus()" />
    </div>

    <div style="margin-bottom:var(--space-sm)">
      <div class="input-label" style="color:rgba(255,255,255,0.6)">
        Mot de passe
      </div>
      <div style="position:relative;margin-top:4px">
        <input class="input" id="auth-mdp"
               type="password"
               placeholder="••••••••"
               autocomplete="current-password"
               onkeydown="if(event.key==='Enter')
                 soumettreConnexion()" />
        <button onclick="toggleMdpVisibilite('auth-mdp')"
                style="position:absolute;right:12px;top:50%;
                       transform:translateY(-50%);
                       background:none;border:none;
                       color:rgba(255,255,255,0.4);
                       cursor:pointer;font-size:1rem"
                id="btn-eye-1">👁️</button>
      </div>
    </div>

    <!-- Mot de passe oublié -->
    <div style="text-align:right;margin-bottom:var(--space-lg)">
      <button onclick="afficherResetMdp()"
              style="background:none;border:none;
                     color:var(--fd-lavender);
                     font-size:.78rem;cursor:pointer">
        Mot de passe oublié ?
      </button>
    </div>

    <!-- Erreur -->
    <div id="auth-erreur"
         style="display:none;background:rgba(255,141,150,0.1);
                border:1px solid var(--fd-coral);
                border-radius:var(--radius-md);
                padding:var(--space-sm) var(--space-md);
                color:var(--fd-coral);font-size:.82rem;
                margin-bottom:var(--space-md)">
    </div>

    <!-- Bouton -->
    <button onclick="soumettreConnexion()"
            id="btn-auth-submit"
            class="btn-primary"
            style="font-size:1rem;font-weight:700">
      ⚡ Se connecter
    </button>

    <p style="text-align:center;font-size:.78rem;
              color:rgba(255,255,255,0.4);
              margin-top:var(--space-md)">
      Pas encore de compte ?
      <button onclick="afficherPageAuth('inscription')"
              style="background:none;border:none;
                     color:var(--fd-indigo);
                     font-weight:700;cursor:pointer">
        S'inscrire
      </button>
    </p>
  `;
}

function _renderFormInscription() {
  return `
    <h2 style="font-size:1.2rem;font-weight:700;
               color:white;margin-bottom:var(--space-lg)">
      Crée ton compte 🚀
    </h2>

    <div style="margin-bottom:var(--space-md)">
      <div class="input-label" style="color:rgba(255,255,255,0.6)">
        Prénom
      </div>
      <input class="input" id="auth-prenom"
             type="text"
             placeholder="Ton prénom"
             autocomplete="given-name"
             style="margin-top:4px"
             onkeydown="if(event.key==='Enter')
               document.getElementById('auth-email-reg').focus()" />
    </div>

    <div style="margin-bottom:var(--space-md)">
      <div class="input-label" style="color:rgba(255,255,255,0.6)">
        Email
      </div>
      <input class="input" id="auth-email-reg"
             type="email"
             placeholder="ton@email.com"
             autocomplete="email"
             style="margin-top:4px"
             onkeydown="if(event.key==='Enter')
               document.getElementById('auth-mdp-reg').focus()" />
    </div>

    <div style="margin-bottom:var(--space-md)">
      <div class="input-label" style="color:rgba(255,255,255,0.6)">
        Mot de passe
      </div>
      <div style="position:relative;margin-top:4px">
        <input class="input" id="auth-mdp-reg"
               type="password"
               placeholder="6 caractères minimum"
               autocomplete="new-password"
               onkeydown="if(event.key==='Enter')
                 document.getElementById('auth-mdp-confirm').focus()" />
        <button onclick="toggleMdpVisibilite('auth-mdp-reg')"
                style="position:absolute;right:12px;top:50%;
                       transform:translateY(-50%);
                       background:none;border:none;
                       color:rgba(255,255,255,0.4);
                       cursor:pointer;font-size:1rem">
          👁️
        </button>
      </div>
    </div>

    <div style="margin-bottom:var(--space-lg)">
      <div class="input-label" style="color:rgba(255,255,255,0.6)">
        Confirmer le mot de passe
      </div>
      <div style="position:relative;margin-top:4px">
        <input class="input" id="auth-mdp-confirm"
               type="password"
               placeholder="Répète ton mot de passe"
               autocomplete="new-password"
               onkeydown="if(event.key==='Enter')
                 soumettreInscription()" />
        <button onclick="toggleMdpVisibilite('auth-mdp-confirm')"
                style="position:absolute;right:12px;top:50%;
                       transform:translateY(-50%);
                       background:none;border:none;
                       color:rgba(255,255,255,0.4);
                       cursor:pointer;font-size:1rem">
          👁️
        </button>
      </div>
    </div>

    <!-- Erreur -->
    <div id="auth-erreur"
         style="display:none;background:rgba(255,141,150,0.1);
                border:1px solid var(--fd-coral);
                border-radius:var(--radius-md);
                padding:var(--space-sm) var(--space-md);
                color:var(--fd-coral);font-size:.82rem;
                margin-bottom:var(--space-md)">
    </div>

    <!-- Bouton -->
    <button onclick="soumettreInscription()"
            id="btn-auth-submit"
            class="btn-primary"
            style="font-size:1rem;font-weight:700">
      🚀 Créer mon compte
    </button>

    <p style="text-align:center;font-size:.78rem;
              color:rgba(255,255,255,0.4);
              margin-top:var(--space-md)">
      Déjà un compte ?
      <button onclick="afficherPageAuth('connexion')"
              style="background:none;border:none;
                     color:var(--fd-indigo);
                     font-weight:700;cursor:pointer">
        Se connecter
      </button>
    </p>
  `;
}

// ─── SOUMETTRE CONNEXION ──────────────────────────────────────
async function soumettreConnexion() {
  const email = document.getElementById('auth-email')?.value?.trim();
  const mdp   = document.getElementById('auth-mdp')?.value;
  const btn   = document.getElementById('btn-auth-submit');
  const err   = document.getElementById('auth-erreur');

  if (!email || !mdp) {
    afficherErreurAuth('Remplis tous les champs !');
    return;
  }

  // Loading
  if (btn) {
    btn.disabled     = true;
    btn.textContent  = '⏳ Connexion...';
  }

  const result = await Auth.connecter(email, mdp);

  if (!result.ok) {
    afficherErreurAuth(result.erreur);
    if (btn) {
      btn.disabled    = false;
      btn.textContent = '⚡ Se connecter';
    }
  }
  // Si ok → onAuthStateChanged gère la suite
}

// ─── SOUMETTRE INSCRIPTION ────────────────────────────────────
async function soumettreInscription() {
  const prenom   = document.getElementById('auth-prenom')?.value?.trim();
  const email    = document.getElementById('auth-email-reg')?.value?.trim();
  const mdp      = document.getElementById('auth-mdp-reg')?.value;
  const mdpConf  = document.getElementById('auth-mdp-confirm')?.value;
  const btn      = document.getElementById('btn-auth-submit');

  // Validations
  if (!prenom || !email || !mdp || !mdpConf) {
    afficherErreurAuth('Remplis tous les champs !');
    return;
  }
  if (mdp !== mdpConf) {
    afficherErreurAuth('Les mots de passe ne correspondent pas.');
    return;
  }
  if (mdp.length < 6) {
    afficherErreurAuth('Mot de passe trop court (6 caractères min).');
    return;
  }

  // Loading
  if (btn) {
    btn.disabled    = true;
    btn.textContent = '⏳ Création...';
  }

  const result = await Auth.inscrire(email, mdp, prenom);

  if (!result.ok) {
    afficherErreurAuth(result.erreur);
    if (btn) {
      btn.disabled    = false;
      btn.textContent = '🚀 Créer mon compte';
    }
  }
}

// ─── RESET MOT DE PASSE ───────────────────────────────────────
async function afficherResetMdp() {
  const email = document.getElementById('auth-email')?.value?.trim();

  const modal   = document.getElementById('modal-info');
  const content = document.getElementById('modal-info-content');

  if (!modal) return;

  content.innerHTML = `
    <h3 style="margin-bottom:var(--space-md)">
      🔑 Réinitialiser le mot de passe
    </h3>
    <p style="font-size:.85rem;color:var(--text-muted);
              margin-bottom:var(--space-md)">
      Entre ton email — on t'envoie un lien de réinitialisation.
    </p>
    <div class="input-label">Email</div>
    <input class="input mt-sm" id="reset-email"
           type="email"
           placeholder="ton@email.com"
           value="${email || ''}" />
    <button class="btn-primary mt-md"
            onclick="envoyerResetMdp()">
      📧 Envoyer le lien
    </button>
  `;

  modal.classList.remove('hidden');
  document.getElementById('modal-info-close').onclick =
    () => modal.classList.add('hidden');
}

async function envoyerResetMdp() {
  const email = document.getElementById('reset-email')?.value?.trim();
  if (!email) return;

  const result = await Auth.resetMotDePasse(email);
  if (result.ok) {
    document.getElementById('modal-info')?.classList.add('hidden');
  }
}

// ─── HELPERS ──────────────────────────────────────────────────
function afficherErreurAuth(message) {
  const err = document.getElementById('auth-erreur');
  if (err) {
    err.textContent  = '⚠️ ' + message;
    err.style.display = 'block';
  }
}

function toggleMdpVisibilite(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

// ─── BOUTON DÉCONNEXION dans le profil ────────────────────────
function renderBoutonDeconnexion() {
  const user = window.FirebaseUser.user;
  if (!user) return '';

  return `
    <div class="card mb-md"
         style="border-color:rgba(255,141,150,0.3)">
      <div class="flex items-center gap-md">
        <div>
          <div style="font-size:.82rem;font-weight:600">
            ${user.displayName || user.email}
          </div>
          <div style="font-size:.72rem;color:var(--text-muted)">
            ${user.email}
          </div>
        </div>
        <button onclick="Auth.deconnecter()"
                class="btn-secondary btn-sm"
                style="margin-left:auto;
                       color:var(--fd-coral);
                       border-color:rgba(255,141,150,0.3)">
          🚪 Déconnexion
        </button>
      </div>
    </div>
  `;
}

console.log('✅ Auth UI chargé');
