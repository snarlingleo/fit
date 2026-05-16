/* ============================================================
   FitTracker Pro — Utils
   Fonctions utilitaires globales
   ============================================================ */

const Utils = {

  // ─── DATES ───────────────────────────────────────────────
  aujourd_hui() {
    return new Date().toISOString().split('T')[0];
  },

  formatDate(dateStr, options = {}) {
    const date = new Date(dateStr);
    const defaults = {
      weekday: 'long', day: 'numeric',
      month: 'long', year: 'numeric'
    };
    return date.toLocaleDateString('fr-FR', { ...defaults, ...options });
  },

  formatDateCourt(dateStr) {
    return this.formatDate(dateStr, { day: 'numeric', month: 'short' });
  },

  jourSemaine(dateStr) {
    const jours = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
    return jours[new Date(dateStr).getDay()];
  },

  jourSemaineComplet(dateStr) {
    const jours = ['Dimanche','Lundi','Mardi','Mercredi',
                   'Jeudi','Vendredi','Samedi'];
    return jours[new Date(dateStr).getDay()];
  },

  indexJourSemaine(dateStr) {
    const d = new Date(dateStr).getDay();
    return d === 0 ? 6 : d - 1;
  },

  diffJours(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
  },

  ajouterJours(dateStr, n) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
  },

  debutSemaine(dateStr) {
    const d   = new Date(dateStr);
    const jour = d.getDay();
    const diff = jour === 0 ? -6 : 1 - jour;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
  },

  finSemaine(dateStr) {
    return this.ajouterJours(this.debutSemaine(dateStr), 6);
  },

  semainesDepuis(dateDebut) {
    return Math.floor(this.diffJours(dateDebut, this.aujourd_hui()) / 7) + 1;
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

  // ─── FORMATAGE ────────────────────────────────────────────
  formatDuree(secondes) {
    const h = Math.floor(secondes / 3600);
    const m = Math.floor((secondes % 3600) / 60);
    const s = secondes % 60;
    if (h > 0) return `${h}h${String(m).padStart(2,'0')}`;
    if (m > 0) return `${m}min${String(s).padStart(2,'0')}s`;
    return `${s}s`;
  },

  formatDureeMin(secondes) {
    const m = Math.floor(secondes / 60);
    const s = secondes % 60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  },

  formatPoids(kg) {
    const unite = localStorage.getItem('ft_unite_poids') || 'kg';
    if (unite === 'lbs') return `${Math.round(kg * 2.20462)} lbs`;
    return `${kg} kg`;
  },

  formatVolume(kg) {
    if (kg >= 1000) return `${(kg/1000).toFixed(1)}T`;
    return `${kg}kg`;
  },

  arrondir(val, decimales = 1) {
    return Math.round(val * Math.pow(10, decimales)) / Math.pow(10, decimales);
  },

  // ─── CALCULS FITNESS ──────────────────────────────────────
  calculer1RM(poids, reps) {
    if (reps === 1) return poids;
    return Math.round(poids * (1 + reps / 30));
  },

  calculerVolume(series) {
    return series.reduce((total, s) => total + (s.poids * s.reps), 0);
  },

  calculerIMC(poids, taille) {
    const tailleM = taille / 100;
    return this.arrondir(poids / (tailleM * tailleM));
  },

  categorieIMC(imc) {
    if (imc < 18.5) return { label: 'Insuffisance pondérale', color: '#bfa1ff' };
    if (imc < 25)   return { label: 'Poids normal',           color: '#8bf0bb' };
    if (imc < 30)   return { label: 'Surpoids',               color: '#f9ef77' };
    return                  { label: 'Obésité',               color: '#ff8d96' };
  },

  caloriesBrulees(dureeMin, poidsKg, intensite = 'modere') {
    const MET = { leger: 3.5, modere: 5.5, intense: 8.0 };
    const met = MET[intensite] || MET.modere;
    return Math.round(met * poidsKg * (dureeMin / 60));
  },

  // ─── STORAGE ──────────────────────────────────────────────
  storage: {
    set(cle, valeur) {
      try {
        localStorage.setItem(cle, JSON.stringify(valeur));
        return true;
      } catch(e) {
        console.error('[Storage] Erreur set:', cle, e);
        return false;
      }
    },

    get(cle, defaut = null) {
      try {
        const val = localStorage.getItem(cle);
        return val !== null ? JSON.parse(val) : defaut;
      } catch(e) {
        console.error('[Storage] Erreur get:', cle, e);
        return defaut;
      }
    },

    remove(cle) { localStorage.removeItem(cle); },

    clear(prefix = 'ft_') {
      Object.keys(localStorage)
        .filter(k => k.startsWith(prefix))
        .forEach(k => localStorage.removeItem(k));
    },

    taille() {
      let total = 0;
      for (let cle in localStorage) {
        if (localStorage.hasOwnProperty(cle)) {
          total += localStorage[cle].length + cle.length;
        }
      }
      return (total / 1024).toFixed(2) + ' KB';
    },

    exporter() {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const cle = localStorage.key(i);
        if (cle.startsWith('ft_')) {
          data[cle] = JSON.parse(localStorage.getItem(cle));
        }
      }
      return data;
    },

    importer(data) {
      let count = 0;
      for (const [cle, valeur] of Object.entries(data)) {
        if (cle.startsWith('ft_')) {
          localStorage.setItem(cle, JSON.stringify(valeur));
          count++;
        }
      }
      return count;
    }
  },

  // ─── DOM ──────────────────────────────────────────────────
  dom: {
    $(selector, parent = document)   { return parent.querySelector(selector); },
    $$(selector, parent = document)  { return [...parent.querySelectorAll(selector)]; },

    creer(tag, classes = '', innerHTML = '') {
      const el = document.createElement(tag);
      if (classes)   el.className = classes;
      if (innerHTML) el.innerHTML = innerHTML;
      return el;
    },

    vider(el) {
      if (typeof el === 'string') el = document.querySelector(el);
      if (el) el.innerHTML = '';
    },

    afficher(el) {
      if (typeof el === 'string') el = document.querySelector(el);
      if (el) el.classList.remove('hidden');
    },

    cacher(el) {
      if (typeof el === 'string') el = document.querySelector(el);
      if (el) el.classList.add('hidden');
    },

    toggle(el) {
      if (typeof el === 'string') el = document.querySelector(el);
      if (el) el.classList.toggle('hidden');
    }
  },

  // ─── TOAST ────────────────────────────────────────────────
  toast(message, type = 'info', duree = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
      success: '✅', error: '❌',
      info: 'ℹ️', pr: '🏆', warning: '⚠️'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${icons[type] || 'ℹ️'}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity   = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = '0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duree);
  },

  // ─── MODAL CONFIRM ────────────────────────────────────────
  confirmer(titre, message) {
    return new Promise(resolve => {
      const modal     = document.getElementById('modal-confirm');
      const titleEl   = document.getElementById('modal-confirm-title');
      const msgEl     = document.getElementById('modal-confirm-msg');
      const btnOk     = document.getElementById('modal-confirm-ok');
      const btnCancel = document.getElementById('modal-confirm-cancel');

      titleEl.textContent = titre;
      msgEl.textContent   = message;
      modal.classList.remove('hidden');

      const cleanup = () => modal.classList.add('hidden');

      btnOk.onclick     = () => { cleanup(); resolve(true);  };
      btnCancel.onclick = () => { cleanup(); resolve(false); };
      modal.querySelector('.modal-overlay').onclick =
        () => { cleanup(); resolve(false); };
    });
  },

  // ─── VIBRATION ────────────────────────────────────────────
  vibrer(pattern = [100]) {
    if (navigator.vibrate) navigator.vibrate(pattern);
  },

  vibrerSuccess() { this.vibrer([100, 50, 100]);             },
  vibrerPR()      { this.vibrer([200, 100, 200, 100, 400]);  },
  vibrerFin()     { this.vibrer([300, 100, 300, 100, 600]);  },
  vibrerBeep()    { this.vibrer([50]);                       },

  // ─── CONFETTI ─────────────────────────────────────────────
  confetti(duree = 3000) {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    const ctx     = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const couleurs  = ['#4b4bf9','#f9ef77','#8bf0bb',
                       '#ff8d96','#bfa1ff','#ffffff'];
    const particules = Array.from({ length: 120 }, () => ({
      x:        Math.random() * canvas.width,
      y:        Math.random() * canvas.height - canvas.height,
      w:        Math.random() * 10 + 5,
      h:        Math.random() * 6 + 3,
      color:    couleurs[Math.floor(Math.random() * couleurs.length)],
      rotation: Math.random() * 360,
      vitesse:  Math.random() * 3 + 2,
      drift:    Math.random() * 2 - 1
    }));

    let animId;
    const debut = Date.now();

    const animer = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particules.forEach(p => {
        p.y += p.vitesse;
        p.x += p.drift;
        p.rotation += 3;

        ctx.save();
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

      if (Date.now() - debut < duree) {
        animId = requestAnimationFrame(animer);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animId);
      }
    };

    animer();
  },

  // ─── EXPORT / IMPORT ──────────────────────────────────────
  exporterJSON() {
    const data = {
      version: '1.0.0',
      date:    this.aujourd_hui(),
      donnees: this.storage.exporter()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)],
                          { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `fittracker-backup-${this.aujourd_hui()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast('Données exportées avec succès !', 'success');
  },

  exporterCSV() {
    const data   = this.storage.exporter();
    const lignes = [['Date','Séance','Exercice','Série','Reps','Poids','RPE']];

    for (const [cle, val] of Object.entries(data)) {
      if (!cle.startsWith('ft_') || !cle.includes('_s')) continue;
      const parts = cle.split('_');
      if (parts.length < 5) continue;
      const [, date, seance, exercice, serie] = parts;
      lignes.push([date, seance, exercice, serie,
                   val.reps, val.poids, val.rpe || '']);
    }

    const csv  = lignes.map(l => l.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `fittracker-${this.aujourd_hui()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast('CSV exporté !', 'success');
  },

  async importerJSON(fichier) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data  = JSON.parse(e.target.result);
          const count = this.storage.importer(data.donnees || data);
          this.toast(`${count} entrées importées !`, 'success');
          resolve(count);
        } catch(err) {
          this.toast('Fichier invalide !', 'error');
          reject(err);
        }
      };
      reader.readAsText(fichier);
    });
  },

  // ─── QR CODE ──────────────────────────────────────────────
  async genererQR(texte, canvas) {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(texte)}`;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    return new Promise(resolve => {
      img.onload = () => {
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        resolve(img);
      };
    });
  },

  // ─── BACKUP AUTOMATIQUE ───────────────────────────────────
  verifierBackupAuto() {
    const dernierBackup = this.storage.get('ft_dernier_backup', null);
    const aujourd_hui   = this.aujourd_hui();

    if (!dernierBackup ||
        this.diffJours(dernierBackup, aujourd_hui) >= 7) {
      this.storage.set('ft_dernier_backup', aujourd_hui);
      this.toast(
        '💾 Backup hebdomadaire disponible — Va dans Outils > Export !',
        'info', 5000
      );
    }
  },

  // ─── EXPORT PDF ───────────────────────────────────────────
  exporterPDF() {
    const profil = window.Tracker?.getProfil()       || {};
    const prs    = window.Tracker?.getAllPRs()        || {};
    const streak = window.Tracker?.getStreak()        || {};
    const total  = window.Tracker?.getTotalSeances()  || 0;
    const xp     = window.Gamification?.getXP()       || {};

    const contenu = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>FitTracker Pro — Rapport ${this.aujourd_hui()}</title>
        <style>
          * { margin:0;padding:0;box-sizing:border-box; }
          body {
            font-family: system-ui, sans-serif;
            background: white;
            color: #09092d;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            background: #4b4bf9;
            color: white;
            padding: 24px;
            border-radius: 12px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .header h1 { font-size: 1.5rem; font-weight: 800; }
          .header p  { font-size: .85rem; opacity: .8; margin-top: 4px; }
          .badge {
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 99px;
            font-weight: 700;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4,1fr);
            gap: 16px;
            margin-bottom: 24px;
          }
          .stat-box {
            background: #f3f3f7;
            border-radius: 12px;
            padding: 16px;
            text-align: center;
          }
          .stat-val {
            font-size: 1.8rem;
            font-weight: 800;
            color: #4b4bf9;
          }
          .stat-lbl { font-size:.72rem;color:#666;margin-top:4px; }
          .section {
            margin-bottom: 24px;
            border: 1px solid #e5e5f0;
            border-radius: 12px;
            overflow: hidden;
          }
          .section-title {
            background: #f3f3f7;
            padding: 12px 20px;
            font-weight: 700;
            font-size: .9rem;
            color: #4b4bf9;
            border-bottom: 1px solid #e5e5f0;
          }
          .section-body { padding: 20px; }
          .pr-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f3f3f7;
            font-size: .88rem;
          }
          .pr-val { font-weight:700;color:#4b4bf9; }
          .footer {
            text-align: center;
            font-size: .72rem;
            color: #999;
            margin-top: 32px;
          }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>🏋️ FitTracker Pro</h1>
            <p>Rapport de progression — ${this.aujourd_hui()}</p>
            <p style="margin-top:4px;font-size:.8rem">
              ${profil.nom || 'Athlète'}
            </p>
          </div>
          <div class="badge">
            ${xp.niveau?.emoji || '💪'} Niv.${xp.niveau?.numero || 1}
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-val">${total}</div>
            <div class="stat-lbl">Séances totales</div>
          </div>
          <div class="stat-box">
            <div class="stat-val">${streak.count || 0}🔥</div>
            <div class="stat-lbl">Streak actuel</div>
          </div>
          <div class="stat-box">
            <div class="stat-val">${streak.max || 0}</div>
            <div class="stat-lbl">Streak max</div>
          </div>
          <div class="stat-box">
            <div class="stat-val">${xp.total || 0}</div>
            <div class="stat-lbl">XP Total</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">🏆 Records personnels</div>
          <div class="section-body">
            ${Object.entries(prs).length === 0
              ? '<p style="color:#999;font-size:.85rem">Aucun record</p>'
              : Object.entries(prs)
                  .sort((a,b) => (b[1].poids||0) - (a[1].poids||0))
                  .map(([ref, pr]) => {
                    const ex = window.EXERCICES?.[ref] || {};
                    return `
                      <div class="pr-row">
                        <span>${ex.emoji||'💪'} ${ex.nom||ref}</span>
                        <span class="pr-val">
                          ${pr.poids}kg × ${pr.reps}
                          ${pr.rm1 ? `· ~${pr.rm1}kg 1RM` : ''}
                        </span>
                      </div>`;
                  }).join('')}
          </div>
        </div>

        <div class="section">
          <div class="section-title">👤 Profil</div>
          <div class="section-body">
            <div class="pr-row">
              <span>Prénom</span>
              <span class="pr-val">${profil.nom    || '—'}</span>
            </div>
            <div class="pr-row">
              <span>Poids</span>
              <span class="pr-val">${profil.poids  || '—'} kg</span>
            </div>
            <div class="pr-row">
              <span>Taille</span>
              <span class="pr-val">${profil.taille || '—'} cm</span>
            </div>
            <div class="pr-row">
              <span>Niveau</span>
              <span class="pr-val">
                ${xp.niveau?.emoji||''} ${xp.niveau?.nom||'—'}
              </span>
            </div>
          </div>
        </div>

        <div class="footer">
          Généré par FitTracker Pro ·
          ${new Date().toLocaleString('fr-FR')} · Powered by EverGPT
        </div>
      </body>
      </html>
    `;

    const fenetre = window.open('', '_blank');
    fenetre.document.write(contenu);
    fenetre.document.close();
    setTimeout(() => fenetre.print(), 500);
    this.toast('📄 Rapport PDF généré !', 'success');
  },

  // ─── GRAPHIQUES (Canvas natif) ────────────────────────────
  graphiques: {

    barres(canvas, labels, valeurs, options = {}) {
      if (!canvas) return;
      const ctx    = canvas.getContext('2d');
      const W      = canvas.offsetWidth;
      const H      = canvas.offsetHeight || 160;
      canvas.width  = W;
      canvas.height = H;

      const pad    = { top:20, right:16, bottom:30, left:40 };
      const maxVal = Math.max(...valeurs, 1);
      const barW   = (W - pad.left - pad.right) / valeurs.length * 0.6;
      const gap    = (W - pad.left - pad.right) / valeurs.length;

      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth   = 1;
      for (let i = 0; i <= 4; i++) {
        const y = pad.top + (H - pad.top - pad.bottom) * (i / 4);
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(W - pad.right, y);
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font      = '10px system-ui';
      ctx.textAlign = 'right';
      for (let i = 0; i <= 4; i++) {
        const val = Math.round(maxVal * (1 - i/4));
        const y   = pad.top + (H - pad.top - pad.bottom) * (i / 4);
        ctx.fillText(
          val > 1000 ? `${(val/1000).toFixed(1)}k` : val,
          pad.left - 4, y + 4
        );
      }

      valeurs.forEach((val, i) => {
        const x    = pad.left + i * gap + (gap - barW) / 2;
        const barH = (val / maxVal) * (H - pad.top - pad.bottom);
        const y    = H - pad.bottom - barH;

        const grad = ctx.createLinearGradient(0, y, 0, H - pad.bottom);
        grad.addColorStop(0, options.color || '#4b4bf9');
        grad.addColorStop(1, 'rgba(75,75,249,0.3)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, 4);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font      = '9px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i] || '', x + barW/2, H - pad.bottom + 14);
      });
    },

    ligne(canvas, labels, datasets, options = {}) {
      if (!canvas) return;
      const ctx    = canvas.getContext('2d');
      const W      = canvas.offsetWidth;
      const H      = canvas.offsetHeight || 160;
      canvas.width  = W;
      canvas.height = H;

      const pad     = { top:20, right:16, bottom:30, left:44 };
      const allVals = datasets.flatMap(d => d.valeurs);
      const maxVal  = Math.max(...allVals, 1);
      const minVal  = Math.min(...allVals, 0);
      const range   = maxVal - minVal || 1;

      ctx.clearRect(0, 0, W, H);

      const getX = i =>
        pad.left + i * (W - pad.left - pad.right) / (labels.length - 1 || 1);
      const getY = v =>
        H - pad.bottom - ((v - minVal) / range) * (H - pad.top - pad.bottom);

      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth   = 1;
      for (let i = 0; i <= 4; i++) {
        const y = pad.top + (H - pad.top - pad.bottom) * (i / 4);
        ctx.beginPath();
        ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y);
        ctx.stroke();
        const val = Math.round(maxVal - (range * i / 4));
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font      = '10px system-ui';
        ctx.textAlign = 'right';
        ctx.fillText(val, pad.left - 4, y + 4);
      }

      datasets.forEach(dataset => {
        const vals  = dataset.valeurs;
        const color = dataset.color || '#4b4bf9';
        if (vals.length < 2) return;

        const grad = ctx.createLinearGradient(0, pad.top, 0, H - pad.bottom);
        grad.addColorStop(0, color.replace(')', ',0.25)').replace('rgb','rgba'));
        grad.addColorStop(1, color.replace(')', ',0.0)').replace('rgb','rgba'));

        ctx.beginPath();
        ctx.moveTo(getX(0), getY(vals[0]));
        for (let i = 1; i < vals.length; i++)
          ctx.lineTo(getX(i), getY(vals[i]));
        ctx.lineTo(getX(vals.length-1), H - pad.bottom);
        ctx.lineTo(getX(0), H - pad.bottom);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth   = 2.5;
        ctx.lineJoin    = 'round';
        ctx.lineCap     = 'round';
        ctx.moveTo(getX(0), getY(vals[0]));
        for (let i = 1; i < vals.length; i++)
          ctx.lineTo(getX(i), getY(vals[i]));
        ctx.stroke();

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

      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font      = '9px system-ui';
      ctx.textAlign = 'center';
      labels.forEach((l, i) => ctx.fillText(l, getX(i), H - pad.bottom + 14));
    },

    anneau(canvas, valeur, max, couleur = '#4b4bf9') {
      if (!canvas) return;
      const ctx  = canvas.getContext('2d');
      const size = canvas.offsetWidth || 80;
      canvas.width  = size;
      canvas.height = size;

      const cx    = size / 2;
      const cy    = size / 2;
      const r     = (size - 12) / 2;
      const angle = (valeur / max) * Math.PI * 2 - Math.PI / 2;

      ctx.clearRect(0, 0, size, size);

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth   = 8;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI/2, angle);
      ctx.strokeStyle = couleur;
      ctx.lineWidth   = 8;
      ctx.lineCap     = 'round';
      ctx.stroke();
    }
  },

  // ─── RANDOM ───────────────────────────────────────────────
  random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  // ─── DEBOUNCE ─────────────────────────────────────────────
  debounce(fn, delai = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delai);
    };
  },

  // ─── DEEP CLONE ───────────────────────────────────────────
  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

}; // ← FIN de Utils

/* ============================================================
   ExerciseGIF v2
   ============================================================ */
const ExerciseGIF = {

  async chargerDans(exerciceRef, elementId, options = {}) {
    await ExerciceVideos.chargerDans(exerciceRef, elementId, options);
  },

  async getGIF(ref)      { return null; },
  async prechargerTout() { return;      },
  viderCache()           { return;      },

  statsCache() {
    return {
      total:  Object.keys(ExerciceVideos.VIDEOS).length,
      cached: Object.keys(ExerciceVideos.VIDEOS).length,
      pct:    100
    };
  }
};

window.ExerciseGIF = ExerciseGIF;
console.log('✅ Utils + ExerciseGIF chargés');
