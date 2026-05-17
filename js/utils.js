/* ============================================================
   FitTracker Pro — Utils v3.0
   Fonctions utilitaires globales + ExerciseGIF
   + formatDateLong + chrono + timer amélioré
   ============================================================ */

const Utils = {

  // ════════════════════════════════════════════════════════
  // DATES
  // ════════════════════════════════════════════════════════
  aujourd_hui() {
    return new Date().toISOString().split('T')[0];
  },

  formatDate(dateStr, options = {}) {
    try {
      const date     = new Date(dateStr + 'T00:00:00');
      const defaults = {
        weekday: 'long', day: 'numeric',
        month: 'long', year: 'numeric'
      };
      return date.toLocaleDateString('fr-FR',
        { ...defaults, ...options }
      );
    } catch(e) { return dateStr; }
  },

  formatDateCourt(dateStr) {
    return this.formatDate(dateStr, {
      day: 'numeric', month: 'short'
    });
  },

  formatDateLong(dateStr) {
    return this.formatDate(dateStr, {
      weekday: 'long',
      day:     'numeric',
      month:   'long'
    });
  },

  jourSemaine(dateStr) {
    const jours = ['DIM','LUN','MAR','MER','JEU','VEN','SAM'];
    return jours[new Date(dateStr + 'T00:00:00').getDay()];
  },

  jourSemaineComplet(dateStr) {
    const jours = [
      'Dimanche','Lundi','Mardi','Mercredi',
      'Jeudi','Vendredi','Samedi'
    ];
    return jours[new Date(dateStr + 'T00:00:00').getDay()];
  },

  indexJourSemaine(dateStr) {
    const d = new Date(dateStr + 'T00:00:00').getDay();
    return d === 0 ? 6 : d - 1;
  },

  diffJours(date1, date2) {
    const d1 = new Date(date1 + 'T00:00:00');
    const d2 = new Date(date2 + 'T00:00:00');
    return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
  },

  ajouterJours(dateStr, n) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
  },

  debutSemaine(dateStr) {
    const d    = new Date(dateStr + 'T00:00:00');
    const jour = d.getDay();
    const diff = jour === 0 ? -6 : 1 - jour;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
  },

  finSemaine(dateStr) {
    return this.ajouterJours(this.debutSemaine(dateStr), 6);
  },

  debutMois(dateStr = null) {
    const d = dateStr
      ? new Date(dateStr + 'T00:00:00')
      : new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  },

  semainesDepuis(dateDebut) {
    return Math.floor(
      this.diffJours(dateDebut, this.aujourd_hui()) / 7
    ) + 1;
  },

  heureActuelle() {
    return new Date().getHours();
  },

  salutation() {
    const h = this.heureActuelle();
    if (h < 6)  return 'Bonne nuit';
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  },

  // ════════════════════════════════════════════════════════
  // FORMATAGE
  // ════════════════════════════════════════════════════════
  formatDuree(secondes) {
    const s = Math.round(secondes || 0);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const r = s % 60;
    if (h > 0) return `${h}h${String(m).padStart(2,'0')}`;
    if (m > 0) return `${m}min${String(r).padStart(2,'0')}s`;
    return `${r}s`;
  },

  formatDureeMin(secondes) {
    const s = Math.max(0, Math.round(secondes || 0));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`;
  },

  formatPoids(kg) {
    const unite = localStorage.getItem('ft_unite_poids') || 'kg';
    if (unite === 'lbs')
      return `${Math.round(kg * 2.20462)} lbs`;
    return `${kg} kg`;
  },

  formatVolume(kg) {
    const v = Math.round(kg || 0);
    if (v >= 1000) return `${(v/1000).toFixed(1)}T`;
    return `${v}kg`;
  },

  arrondir(val, decimales = 1) {
    const f = Math.pow(10, decimales);
    return Math.round((val || 0) * f) / f;
  },

  // ════════════════════════════════════════════════════════
  // CALCULS FITNESS
  // ════════════════════════════════════════════════════════
  calculer1RM(poids, reps) {
    if (!poids || !reps) return 0;
    if (reps === 1) return poids;
    return Math.round(poids * (1 + reps / 30));
  },

  calculerVolume(series) {
    return (series || []).reduce(
      (t, s) => t + (s.poids||0) * (s.reps||0), 0
    );
  },

  calculerIMC(poids, taille) {
    if (!poids || !taille) return null;
    const m = taille / 100;
    return this.arrondir(poids / (m * m));
  },

  categorieIMC(imc) {
    if (!imc) return null;
    if (imc < 18.5)
      return { label:'Insuffisance pondérale', color:'#bfa1ff' };
    if (imc < 25)
      return { label:'Poids normal',           color:'#8bf0bb' };
    if (imc < 30)
      return { label:'Surpoids',               color:'#f9ef77' };
    return  { label:'Obésité',                 color:'#ff8d96' };
  },

  caloriesBrulees(dureeMin, poidsKg, intensite = 'modere') {
    const MET = { leger:3.5, modere:5.5, intense:8.0 };
    const met  = MET[intensite] || MET.modere;
    return Math.round(met * (poidsKg||70) * ((dureeMin||0)/60));
  },

  // ════════════════════════════════════════════════════════
  // STORAGE
  // ════════════════════════════════════════════════════════
  storage: {
    set(cle, valeur) {
      try {
        localStorage.setItem(cle, JSON.stringify(valeur));
        return true;
      } catch(e) {
        console.error('[Storage] set:', cle, e);
        return false;
      }
    },

    get(cle, defaut = null) {
      try {
        const val = localStorage.getItem(cle);
        return val !== null ? JSON.parse(val) : defaut;
      } catch(e) {
        console.error('[Storage] get:', cle, e);
        return defaut;
      }
    },

    remove(cle) { localStorage.removeItem(cle); },

    clear(prefix = 'ft_') {
      const cles = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(prefix)) cles.push(k);
      }
      cles.forEach(k => localStorage.removeItem(k));
    },

    taille() {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) total += k.length +
          (localStorage.getItem(k) || '').length;
      }
      return (total / 1024).toFixed(2) + ' KB';
    },

    exporter() {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const cle = localStorage.key(i);
        if (cle?.startsWith('ft_')) {
          try {
            data[cle] = JSON.parse(localStorage.getItem(cle));
          } catch(e) {}
        }
      }
      return data;
    },

    importer(data) {
      let count = 0;
      for (const [cle, valeur] of Object.entries(data||{})) {
        if (cle.startsWith('ft_')) {
          try {
            localStorage.setItem(cle, JSON.stringify(valeur));
            count++;
          } catch(e) {}
        }
      }
      return count;
    }
  },

  // ════════════════════════════════════════════════════════
  // DOM
  // ════════════════════════════════════════════════════════
  dom: {
    $(sel, parent = document)  { return parent.querySelector(sel); },
    $$(sel, parent = document) { return [...parent.querySelectorAll(sel)]; },

    creer(tag, classes = '', html = '') {
      const el = document.createElement(tag);
      if (classes) el.className = classes;
      if (html)    el.innerHTML = html;
      return el;
    },

    vider(el) {
      if (typeof el === 'string')
        el = document.querySelector(el);
      if (el) el.innerHTML = '';
    },

    afficher(el) {
      if (typeof el === 'string')
        el = document.querySelector(el);
      if (el) el.classList.remove('hidden');
    },

    cacher(el) {
      if (typeof el === 'string')
        el = document.querySelector(el);
      if (el) el.classList.add('hidden');
    },

    toggle(el) {
      if (typeof el === 'string')
        el = document.querySelector(el);
      if (el) el.classList.toggle('hidden');
    }
  },

  // ════════════════════════════════════════════════════════
  // TOAST
  // ════════════════════════════════════════════════════════
  toast(message, type = 'info', duree = 3000) {
    const container =
      document.getElementById('toast-container');
    if (!container) return;

    const icons = {
      success: '✅', error: '❌',
      info: 'ℹ️', pr: '🏆', warning: '⚠️'
    };

    const toast       = document.createElement('div');
    toast.className   = `toast ${type}`;
    toast.innerHTML   = `
      <span>${icons[type] || 'ℹ️'}</span>
      <span>${message}</span>
    `;
    toast.style.pointerEvents = 'all';

    // Fermer au clic
    toast.addEventListener('click', () => {
      toast.style.opacity   = '0';
      toast.style.transform = 'scale(0.9)';
      toast.style.transition = '.2s ease';
      setTimeout(() => toast.remove(), 200);
    });

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity    = '0';
      toast.style.transform  = 'translateY(-10px)';
      toast.style.transition = '.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duree);
  },

  // ════════════════════════════════════════════════════════
  // MODAL CONFIRM
  // ════════════════════════════════════════════════════════
  confirmer(titre, message) {
    return new Promise(resolve => {
      const modal     = document.getElementById('modal-confirm');
      const titleEl   = document.getElementById('modal-confirm-title');
      const msgEl     = document.getElementById('modal-confirm-msg');
      const btnOk     = document.getElementById('modal-confirm-ok');
      const btnCancel = document.getElementById('modal-confirm-cancel');

      if (!modal) { resolve(true); return; }

      if (titleEl) titleEl.textContent = titre;
      if (msgEl)   msgEl.textContent   = message;
      modal.classList.remove('hidden');

      const cleanup = () => modal.classList.add('hidden');

      // Cloner boutons pour éviter listeners multiples
      const newOk     = btnOk?.cloneNode(true);
      const newCancel = btnCancel?.cloneNode(true);
      if (newOk)     btnOk.parentNode.replaceChild(newOk, btnOk);
      if (newCancel) btnCancel.parentNode.replaceChild(newCancel, btnCancel);

      document.getElementById('modal-confirm-ok')
        ?.addEventListener('click', () => {
          cleanup(); resolve(true);
        });
      document.getElementById('modal-confirm-cancel')
        ?.addEventListener('click', () => {
          cleanup(); resolve(false);
        });
      modal.querySelector('.modal-overlay')
        ?.addEventListener('click', () => {
          cleanup(); resolve(false);
        });
    });
  },

  // ════════════════════════════════════════════════════════
  // VIBRATION
  // ════════════════════════════════════════════════════════
  vibrer(pattern = [100]) {
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch(e) {}
  },

  vibrerSuccess() { this.vibrer([100, 50, 100]);            },
  vibrerPR()      { this.vibrer([200, 100, 200, 100, 400]); },
  vibrerFin()     { this.vibrer([300, 100, 300, 100, 600]); },
  vibrerBeep()    { this.vibrer([50]);                      },

  // ════════════════════════════════════════════════════════
  // CONFETTI
  // ════════════════════════════════════════════════════════
  confetti(duree = 3000) {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    const ctx     = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const couleurs = [
      '#4b4bf9','#f9ef77','#8bf0bb',
      '#ff8d96','#bfa1ff','#ffffff'
    ];

    const particules = Array.from({ length: 150 }, () => ({
      x:        Math.random() * canvas.width,
      y:        Math.random() * canvas.height - canvas.height,
      w:        Math.random() * 10 + 4,
      h:        Math.random() * 6 + 3,
      color:    couleurs[Math.floor(Math.random() * couleurs.length)],
      rotation: Math.random() * 360,
      vitesse:  Math.random() * 3 + 2,
      drift:    Math.random() * 2 - 1,
      opacity:  1
    }));

    let animId;
    const debut = Date.now();

    const animer = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const elapsed = Date.now() - debut;
      const fade    = Math.max(0, 1 - (elapsed - duree * 0.7)
        / (duree * 0.3));

      particules.forEach(p => {
        p.y        += p.vitesse;
        p.x        += p.drift;
        p.rotation += 3;

        ctx.save();
        ctx.globalAlpha = elapsed > duree * 0.7 ? fade : 1;
        ctx.translate(p.x + p.w/2, p.y + p.h/2);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();

        if (p.y > canvas.height) {
          p.y = -p.h;
          p.x = Math.random() * canvas.width;
        }
      });

      if (elapsed < duree) {
        animId = requestAnimationFrame(animer);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animId);
      }
    };

    animer();
  },

  // ════════════════════════════════════════════════════════
  // EXPORT / IMPORT
  // ════════════════════════════════════════════════════════
  exporterJSON() {
    const data = {
      version: '3.0.0',
      app:     'PowerApp',
      date:    this.aujourd_hui(),
      donnees: this.storage.exporter()
    };
    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: 'application/json' }
    );
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `powerapp-backup-${this.aujourd_hui()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast('✅ Données exportées !', 'success');
  },

  exporterCSV() {
    const seances = window.Tracker
      ?.getHistoriqueSeancesAvecDetails(999) || [];

    const lignes = [
      ['Date','Séance','Exercice','Séries',
       'Volume(kg)','RPE','Durée(s)']
    ];

    seances.forEach(s => {
      const nom = window.SEANCES_BASE?.[s.id]?.nom || s.id;
      ;(s.exercicesResume||[]).forEach(e => {
        lignes.push([
          s.date, nom, e.nom,
          e.nbSeries, Math.round(e.totalVol),
          s.rpesMoyen || '',
          s.duree || ''
        ]);
      });
    });

    const csv  = lignes.map(l => l.join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `powerapp-${this.aujourd_hui()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast('📊 CSV exporté !', 'success');
  },

  async importerJSON(fichiers) {
    const fichier = fichiers[0] || fichiers;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data  = JSON.parse(e.target.result);
          const count = this.storage.importer(
            data.donnees || data
          );
          this.toast(`✅ ${count} entrées importées !`, 'success');
          resolve(count);
        } catch(err) {
          this.toast('❌ Fichier invalide !', 'error');
          reject(err);
        }
      };
      reader.readAsText(fichier);
    });
  },

  // ════════════════════════════════════════════════════════
  // QR CODE
  // ════════════════════════════════════════════════════════
  async genererQR(texte, canvas) {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(texte)}`;
    const img  = new Image();
    img.crossOrigin = 'anonymous';
    img.src         = url;
    return new Promise(resolve => {
      img.onload = () => {
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0,
            canvas.width, canvas.height);
        }
        resolve(img);
      };
      img.onerror = () => resolve(null);
    });
  },

  // ════════════════════════════════════════════════════════
  // BACKUP AUTO
  // ════════════════════════════════════════════════════════
  verifierBackupAuto() {
    const dernierBackup = this.storage.get(
      'ft_dernier_backup', null
    );
    const today = this.aujourd_hui();

    if (!dernierBackup
        || this.diffJours(dernierBackup, today) >= 7) {
      this.storage.set('ft_dernier_backup', today);
      setTimeout(() => {
        this.toast(
          '💾 Backup auto disponible — Exporte tes données !',
          'info', 6000
        );
      }, 3000);
    }
  },

  // ════════════════════════════════════════════════════════
  // EXPORT PDF
  // ════════════════════════════════════════════════════════
  exporterPDF() {
    const profil = window.Tracker?.getProfil()      || {};
    const prs    = window.Tracker?.getAllPRs()       || {};
    const streak = window.Tracker?.getStreak()       || {};
    const total  = window.Tracker?.getTotalSeances() || 0;
    const xp     = window.Gamification?.getXP()      || {};
    const volume = window.Tracker?.getVolumeSemaine()|| 0;

    const contenu = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>PowerApp — Rapport ${this.aujourd_hui()}</title>
  <style>
    * { margin:0;padding:0;box-sizing:border-box; }
    body {
      font-family:system-ui,sans-serif;
      background:white;color:#09092d;
      padding:40px;max-width:800px;margin:0 auto;
    }
    .header {
      background:linear-gradient(135deg,#4b4bf9,#7b2ff7);
      color:white;padding:28px;
      border-radius:16px;margin-bottom:24px;
      display:flex;justify-content:space-between;
      align-items:center;
    }
    .header h1 { font-size:1.6rem;font-weight:800; }
    .header p  { opacity:.8;font-size:.85rem;margin-top:4px; }
    .badge {
      background:rgba(255,255,255,0.2);
      padding:8px 16px;border-radius:99px;font-weight:700;
    }
    .stats-grid {
      display:grid;grid-template-columns:repeat(4,1fr);
      gap:16px;margin-bottom:24px;
    }
    .stat-box {
      background:#f3f3f7;border-radius:12px;
      padding:16px;text-align:center;
    }
    .stat-val  { font-size:1.8rem;font-weight:800;color:#4b4bf9; }
    .stat-lbl  { font-size:.72rem;color:#666;margin-top:4px; }
    .section {
      margin-bottom:20px;border:1px solid #e5e5f0;
      border-radius:12px;overflow:hidden;
    }
    .section-title {
      background:#f3f3f7;padding:12px 20px;
      font-weight:700;font-size:.9rem;color:#4b4bf9;
      border-bottom:1px solid #e5e5f0;
    }
    .section-body { padding:20px; }
    .pr-row {
      display:flex;justify-content:space-between;
      padding:8px 0;border-bottom:1px solid #f3f3f7;
      font-size:.85rem;
    }
    .pr-row:last-child { border:none; }
    .pr-val  { font-weight:700;color:#4b4bf9; }
    .pr-gain { font-size:.72rem;color:#8bf0bb;margin-left:8px; }
    .footer {
      text-align:center;font-size:.72rem;
      color:#999;margin-top:32px;
    }
    @media print { body { padding:20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>⚡ PowerApp</h1>
      <p>Rapport · ${this.aujourd_hui()}</p>
      <p>${profil.nom || 'Athlète'} ${profil.avatar || '💪'}</p>
    </div>
    <div class="badge">
      ${xp.niveau?.emoji||'💪'} Niv.${xp.niveau?.numero||1}
      · ${xp.total||0} XP
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-box">
      <div class="stat-val">${total}</div>
      <div class="stat-lbl">Séances</div>
    </div>
    <div class="stat-box">
      <div class="stat-val">${streak.count||0}🔥</div>
      <div class="stat-lbl">Streak</div>
    </div>
    <div class="stat-box">
      <div class="stat-val">${streak.max||0}</div>
      <div class="stat-lbl">Record streak</div>
    </div>
    <div class="stat-box">
      <div class="stat-val">
        ${this.formatVolume(volume)}
      </div>
      <div class="stat-lbl">Volume semaine</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">🏆 Records personnels</div>
    <div class="section-body">
      ${Object.entries(prs).length === 0
        ? '<p style="color:#999">Aucun record</p>'
        : Object.entries(prs)
            .sort((a,b) => (b[1].rm1||0) - (a[1].rm1||0))
            .map(([ref, pr]) => {
              const ex   = window.EXERCICES?.[ref] || {};
              const gain = pr.ancienPR?.rm1
                ? `+${pr.rm1 - pr.ancienPR.rm1}kg`
                : '';
              return `
                <div class="pr-row">
                  <span>${ex.emoji||'💪'} ${ex.nom||ref}</span>
                  <span class="pr-val">
                    ${pr.poids}kg × ${pr.reps}
                    · 1RM ~${pr.rm1}kg
                    ${gain
                      ? `<span class="pr-gain">${gain}</span>`
                      : ''}
                  </span>
                </div>`;
            }).join('')}
    </div>
  </div>

  <div class="section">
    <div class="section-title">👤 Profil</div>
    <div class="section-body">
      ${[
        ['Prénom',     profil.nom    || '—'],
        ['Poids',      (profil.poids  || '—') + ' kg'],
        ['Taille',     (profil.taille || '—') + ' cm'],
        ['Niveau',     (xp.niveau?.emoji||'') + ' ' + (xp.niveau?.nom||'—')],
        ['XP total',   (xp.total||0) + ' XP'],
      ].map(([k,v]) => `
        <div class="pr-row">
          <span>${k}</span>
          <span class="pr-val">${v}</span>
        </div>`).join('')}
    </div>
  </div>

  <div class="footer">
    Généré par PowerApp ·
    ${new Date().toLocaleString('fr-FR')} · EverGPT
  </div>
</body>
</html>`;

    const w = window.open('', '_blank');
    if (!w) {
      this.toast('❌ Autorise les popups !', 'error');
      return;
    }
    w.document.write(contenu);
    w.document.close();
    setTimeout(() => w.print(), 800);
    this.toast('📄 Rapport PDF généré !', 'success');
  },

  // ════════════════════════════════════════════════════════
  // GRAPHIQUES (Canvas natif)
  // ════════════════════════════════════════════════════════
  graphiques: {

    _getCtx(canvas, h = 160) {
      if (!canvas) return null;
      const W = canvas.offsetWidth || canvas.parentElement?.offsetWidth || 320;
      const H = canvas.offsetHeight || h;
      canvas.width  = W;
      canvas.height = H;
      return { ctx: canvas.getContext('2d'), W, H };
    },

    barres(canvas, labels, valeurs, options = {}) {
      const r = this._getCtx(canvas, 160);
      if (!r) return;
      const { ctx, W, H } = r;

      const pad    = { top:20, right:16, bottom:32, left:44 };
      const maxVal = Math.max(...(valeurs||[]), 1);
      const n      = valeurs.length || 1;
      const gap    = (W - pad.left - pad.right) / n;
      const barW   = gap * 0.6;

      ctx.clearRect(0, 0, W, H);

      // Grille
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth   = 1;
      for (let i = 0; i <= 4; i++) {
        const y = pad.top +
          (H - pad.top - pad.bottom) * (i / 4);
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(W - pad.right, y);
        ctx.stroke();
      }

      // Axe Y
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font      = '10px system-ui';
      ctx.textAlign = 'right';
      for (let i = 0; i <= 4; i++) {
        const val = Math.round(maxVal * (1 - i/4));
        const y   = pad.top +
          (H - pad.top - pad.bottom) * (i/4);
        const txt = val >= 1000
          ? `${(val/1000).toFixed(1)}k`
          : `${val}`;
        ctx.fillText(txt, pad.left - 4, y + 4);
      }

      // Barres
      valeurs.forEach((val, i) => {
        const x    = pad.left + i * gap + (gap - barW) / 2;
        const barH = ((val||0) / maxVal)
          * (H - pad.top - pad.bottom);
        const y    = H - pad.bottom - barH;

        const grad = ctx.createLinearGradient(0, y, 0, H - pad.bottom);
        grad.addColorStop(0, options.color || '#4b4bf9');
        grad.addColorStop(1, (options.color || '#4b4bf9')
          .replace(')', ',0.3)').replace('rgb','rgba') ||
          'rgba(75,75,249,0.3)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barW, Math.max(barH,2), 4);
        } else {
          ctx.rect(x, y, barW, Math.max(barH,2));
        }
        ctx.fill();

        // Label X
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font      = '9px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(
          (labels[i]||''),
          x + barW/2,
          H - pad.bottom + 15
        );
      });
    },

    ligne(canvas, labels, datasets, options = {}) {
      const r = this._getCtx(canvas, 160);
      if (!r) return;
      const { ctx, W, H } = r;

      const pad     = { top:20, right:16, bottom:32, left:44 };
      const allVals = (datasets||[]).flatMap(d => d.valeurs||[]);
      const maxVal  = Math.max(...allVals, 1);
      const minVal  = Math.min(...allVals, 0);
      const range   = Math.max(maxVal - minVal, 1);
      const n       = Math.max((labels||[]).length - 1, 1);

      ctx.clearRect(0, 0, W, H);

      const getX = i =>
        pad.left + i * (W - pad.left - pad.right) / n;
      const getY = v =>
        H - pad.bottom -
        ((v - minVal) / range) * (H - pad.top - pad.bottom);

      // Grille
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth   = 1;
      for (let i = 0; i <= 4; i++) {
        const y = pad.top +
          (H - pad.top - pad.bottom) * (i/4);
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(W - pad.right, y);
        ctx.stroke();

        const val = Math.round(maxVal - range * i / 4);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font      = '10px system-ui';
        ctx.textAlign = 'right';
        ctx.fillText(val, pad.left - 4, y + 4);
      }

      // Datasets
      (datasets||[]).forEach(dataset => {
        const vals  = dataset.valeurs || [];
        const color = dataset.color   || '#4b4bf9';
        if (vals.length < 2) return;

        // Zone remplie
        const grad = ctx.createLinearGradient(
          0, pad.top, 0, H - pad.bottom
        );
        const rgb = color.startsWith('#')
          ? this._hexToRgb(color)
          : '75,75,249';
        grad.addColorStop(0, `rgba(${rgb},0.2)`);
        grad.addColorStop(1, `rgba(${rgb},0.0)`);

        ctx.beginPath();
        ctx.moveTo(getX(0), getY(vals[0]));
        for (let i = 1; i < vals.length; i++) {
          ctx.lineTo(getX(i), getY(vals[i]));
        }
        ctx.lineTo(getX(vals.length-1), H - pad.bottom);
        ctx.lineTo(getX(0),             H - pad.bottom);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // Ligne
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth   = 2.5;
        ctx.lineJoin    = 'round';
        ctx.lineCap     = 'round';
        ctx.moveTo(getX(0), getY(vals[0]));
        for (let i = 1; i < vals.length; i++) {
          ctx.lineTo(getX(i), getY(vals[i]));
        }
        ctx.stroke();

        // Points
        vals.forEach((v, i) => {
          ctx.beginPath();
          ctx.arc(getX(i), getY(v), 4, 0, Math.PI * 2);
          ctx.fillStyle   = color;
          ctx.fill();
          ctx.strokeStyle = '#09092d';
          ctx.lineWidth   = 2;
          ctx.stroke();
        });
      });

      // Labels X
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font      = '9px system-ui';
      ctx.textAlign = 'center';
      (labels||[]).forEach((l, i) => {
        ctx.fillText(l, getX(i), H - pad.bottom + 15);
      });
    },

    anneau(canvas, valeur, max, couleur = '#4b4bf9') {
      if (!canvas) return;
      const size = canvas.offsetWidth || 80;
      canvas.width  = size;
      canvas.height = size;
      const ctx   = canvas.getContext('2d');
      const cx    = size / 2;
      const cy    = size / 2;
      const r     = (size - 12) / 2;
      const angle = ((valeur||0) / (max||1))
        * Math.PI * 2 - Math.PI / 2;

      ctx.clearRect(0, 0, size, size);

      // Fond
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth   = 8;
      ctx.stroke();

      // Arc
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI/2, angle);
      ctx.strokeStyle = couleur;
      ctx.lineWidth   = 8;
      ctx.lineCap     = 'round';
      ctx.stroke();
    },

    _hexToRgb(hex) {
      const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
        .exec(hex);
      if (!r) return '75,75,249';
      return `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}`;
    }
  },

  // ════════════════════════════════════════════════════════
  // UTILITAIRES
  // ════════════════════════════════════════════════════════
  random(arr) {
    if (!arr?.length) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  },

  debounce(fn, delai = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delai);
    };
  },

  clone(obj) {
    try { return JSON.parse(JSON.stringify(obj)); }
    catch(e) { return obj; }
  },

  capitaliser(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  truncate(str, n = 30) {
    if (!str || str.length <= n) return str;
    return str.slice(0, n) + '…';
  }

}; // ← FIN Utils

// ════════════════════════════════════════════════════════
// CHRONO SÉANCE
// ════════════════════════════════════════════════════════
const chronoSeance = {
  _debut:    null,
  _intervalId: null,
  _elapsed:  0,

  demarrer(callback) {
    this._debut = Date.now() - (this._elapsed * 1000);
    this._intervalId = setInterval(() => {
      this._elapsed = Math.floor(
        (Date.now() - this._debut) / 1000
      );
      if (callback) callback(this._elapsed);
    }, 1000);
  },

  arreter() {
    clearInterval(this._intervalId);
    this._intervalId = null;
    const elapsed    = this._elapsed;
    this._elapsed    = 0;
    this._debut      = null;
    return elapsed;
  },

  pause() {
    clearInterval(this._intervalId);
    this._intervalId = null;
  },

  reprendre(callback) {
    this._debut = Date.now() - (this._elapsed * 1000);
    this.demarrer(callback);
  },

  get elapsed() { return this._elapsed; }
};

// ════════════════════════════════════════════════════════
// TIMER REPOS
// ════════════════════════════════════════════════════════
const timerRepos = {
  _intervalId: null,
  restant:     0,
  total:       0,
  actif:       false,
  enPause:     false,

  demarrer(secondes, onTick, onFin) {
    this.arreter();
    this.restant = secondes;
    this.total   = secondes;
    this.actif   = true;
    this.enPause = false;

    this.jouerSon('start');

    this._intervalId = setInterval(() => {
      if (this.enPause) return;

      this.restant--;
      if (onTick) onTick(this.restant, this.total);

      if (this.restant <= 3 && this.restant > 0) {
        this.jouerSon('beep');
      }

      if (this.restant <= 0) {
        this.arreter();
        this.jouerSon('end');
        if (onFin) onFin();
      }
    }, 1000);
  },

  arreter() {
    clearInterval(this._intervalId);
    this._intervalId = null;
    this.actif       = false;
    this.enPause     = false;
  },

  pauseReprendre() {
    this.enPause = !this.enPause;
    return this.enPause;
  },

  ajuster(delta) {
    this.restant = Math.max(0, this.restant + delta);
    this.total   = Math.max(1, this.total + delta);
  },

  reset(secondes) {
    this.arreter();
    this.restant = secondes;
    this.total   = secondes;
  },

  isActif() { return this.actif && !!this._intervalId; },

  jouerSon(type = 'beep') {
    try {
      if (!Utils.storage.get('ft_son', true)) return;
      const ctx = new (
        window.AudioContext || window.webkitAudioContext
      )();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const configs = {
        beep:  { freq:880, dur:.08, vol:.3 },
        start: { freq:523, dur:.12, vol:.2 },
        end:   { freq:659, dur:.4,  vol:.5 },
        pr:    { freq:1047,dur:.6,  vol:.6 }
      };

      const c = configs[type] || configs.beep;
      osc.frequency.value  = c.freq;
      gain.gain.value      = c.vol;
      osc.start();
      osc.stop(ctx.currentTime + c.dur);
    } catch(e) {}
  }
};

// ════════════════════════════════════════════════════════
// EXERCISE GIF
// ════════════════════════════════════════════════════════
const ExerciseGIF = {

  async chargerDans(exerciceRef, elementId, options = {}) {
    try {
      await ExerciceVideos.chargerDans(
        exerciceRef, elementId, options
      );
    } catch(e) {
      // Fallback emoji
      const el = document.getElementById(elementId);
      if (el && window.EXERCICES?.[exerciceRef]) {
        el.textContent =
          window.EXERCICES[exerciceRef].emoji || '💪';
      }
    }
  },

  async getGIF(ref)       { return null; },
  async prechargerTout(cb){ if(cb) cb(1,1); return; },
  viderCache()            { return; },

  statsCache() {
    const total = Object.keys(
      window.ExerciceVideos?.VIDEOS || {}
    ).length;
    return { total, cached: total, pct: 100 };
  }
};

window.Utils        = Utils;
window.chronoSeance = chronoSeance;
window.timerRepos   = timerRepos;
window.ExerciseGIF  = ExerciseGIF;

console.log('✅ Utils v3.0 + ExerciseGIF chargés');
