/* ============================================================
   FitTracker Pro — Utils
   Fonctions utilitaires globales
   ============================================================ */

const Utils = {

  // ─── DATES ───────────────────────────────────────────────
  aujourd_hui() {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
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
    const jours = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
    return jours[new Date(dateStr).getDay()];
  },

  indexJourSemaine(dateStr) {
    // 0=LUN, 1=MAR, ... 6=DIM
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
    const d = new Date(dateStr);
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
    // Formule Epley : 1RM = poids × (1 + reps/30)
    if (reps === 1) return poids;
    return Math.round(poids * (1 + reps / 30));
  },

  calculerVolume(series) {
    // series = [{poids, reps}, ...]
    return series.reduce((total, s) => total + (s.poids * s.reps), 0);
  },

  calculerIMC(poids, taille) {
    const tailleM = taille / 100;
    return this.arrondir(poids / (tailleM * tailleM));
  },

  categorieIMC(imc) {
    if (imc < 18.5) return { label: 'Insuffisance pondérale', color: '#bfa1ff' };
    if (imc < 25)   return { label: 'Poids normal', color: '#8bf0bb' };
    if (imc < 30)   return { label: 'Surpoids', color: '#f9ef77' };
    return                  { label: 'Obésité', color: '#ff8d96' };
  },

  // Calories brûlées estimées (MET × poids × heures)
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

    remove(cle) {
      localStorage.removeItem(cle);
    },

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
    $(selector, parent = document) {
      return parent.querySelector(selector);
    },

    $$(selector, parent = document) {
      return [...parent.querySelectorAll(selector)];
    },

    creer(tag, classes = '', innerHTML = '') {
      const el = document.createElement(tag);
      if (classes) el.className = classes;
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
      success: '✅',
      error:   '❌',
      info:    'ℹ️',
      pr:      '🏆',
      warning: '⚠️'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${icons[type] || 'ℹ️'}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = '0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duree);
  },

  // ─── MODAL CONFIRM ────────────────────────────────────────
  confirmer(titre, message) {
    return new Promise(resolve => {
      const modal   = document.getElementById('modal-confirm');
      const titleEl = document.getElementById('modal-confirm-title');
      const msgEl   = document.getElementById('modal-confirm-msg');
      const btnOk   = document.getElementById('modal-confirm-ok');
      const btnCancel = document.getElementById('modal-confirm-cancel');

      titleEl.textContent = titre;
      msgEl.textContent   = message;
      modal.classList.remove('hidden');

      const cleanup = () => modal.classList.add('hidden');

      btnOk.onclick = () => { cleanup(); resolve(true); };
      btnCancel.onclick = () => { cleanup(); resolve(false); };
      modal.querySelector('.modal-overlay').onclick = () => {
        cleanup(); resolve(false);
      };
    });
  },

  // ─── VIBRATION ────────────────────────────────────────────
  vibrer(pattern = [100]) {
    if (navigator.vibrate) navigator.vibrate(pattern);
  },

  vibrerSuccess()  { this.vibrer([100, 50, 100]); },
  vibrerPR()       { this.vibrer([200, 100, 200, 100, 400]); },
  vibrerFin()      { this.vibrer([300, 100, 300, 100, 600]); },
  vibrerBeep()     { this.vibrer([50]); },

  // ─── CONFETTI ─────────────────────────────────────────────
  confetti(duree = 3000) {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    const ctx    = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const couleurs = ['#4b4bf9','#f9ef77','#8bf0bb','#ff8d96','#bfa1ff','#ffffff'];
    const particules = Array.from({ length: 120 }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height - canvas.height,
      w:  Math.random() * 10 + 5,
      h:  Math.random() * 6 + 3,
      color: couleurs[Math.floor(Math.random() * couleurs.length)],
      rotation: Math.random() * 360,
      vitesse: Math.random() * 3 + 2,
      drift: Math.random() * 2 - 1
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
      date: this.aujourd_hui(),
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
    const data    = this.storage.exporter();
    const lignes  = [['Date','Séance','Exercice','Série','Reps','Poids','RPE']];

    for (const [cle, val] of Object.entries(data)) {
      // cle format : ft_YYYY-MM-DD_seanceId_exerciceRef_sX
      if (!cle.startsWith('ft_') || !cle.includes('_s')) continue;
      const parts = cle.split('_');
      if (parts.length < 5) continue;
      const [, date, seance, exercice, serie] = parts;
      lignes.push([date, seance, exercice, serie, val.reps, val.poids, val.rpe || '']);
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
    // Utilise l'API QR simple (pas de lib externe)
    // Implémentation légère via URL encode
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

  // ─── GRAPHIQUES (Canvas natif) ────────────────────────────
  graphiques: {

    barres(canvas, labels, valeurs, options = {}) {
      if (!canvas) return;
      const ctx    = canvas.getContext('2d');
      const W      = canvas.offsetWidth;
      const H      = canvas.offsetHeight || 160;
      canvas.width  = W;
      canvas.height = H;

      const pad    = { top: 20, right: 16, bottom: 30, left: 40 };
      const maxVal = Math.max(...valeurs, 1);
      const barW   = (W - pad.left - pad.right) / valeurs.length * 0.6;
      const gap    = (W - pad.left - pad.right) / valeurs.length;

      ctx.clearRect(0, 0, W, H);

      // Grille
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth   = 1;
      for (let i = 0; i <= 4; i++) {
        const y = pad.top + (H - pad.top - pad.bottom) * (i / 4);
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(W - pad.right, y);
        ctx.stroke();
      }

      // Labels Y
      ctx.fillStyle  = 'rgba(255,255,255,0.35)';
      ctx.font       = '10px system-ui';
      ctx.textAlign  = 'right';
      for (let i = 0; i <= 4; i++) {
        const val = Math.round(maxVal * (1 - i/4));
        const y   = pad.top + (H - pad.top - pad.bottom) * (i / 4);
        ctx.fillText(val > 1000 ? `${(val/1000).toFixed(1)}k` : val, pad.left - 4, y + 4);
      }

      // Barres
      valeurs.forEach((val, i) => {
        const x    = pad.left + i * gap + (gap - barW) / 2;
        const barH = ((val / maxVal) * (H - pad.top - pad.bottom));
        const y    = H - pad.bottom - barH;

        // Gradient
        const grad = ctx.createLinearGradient(0, y, 0, H - pad.bottom);
        grad.addColorStop(0, options.color || '#4b4bf9');
        grad.addColorStop(1, 'rgba(75,75,249,0.3)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, 4);
        ctx.fill();

        // Label X
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

      const pad    = { top: 20, right: 16, bottom: 30, left: 44 };
      const allVals = datasets.flatMap(d => d.valeurs);
      const maxVal  = Math.max(...allVals, 1);
      const minVal  = Math.min(...allVals, 0);
      const range   = maxVal - minVal || 1;

      ctx.clearRect(0, 0, W, H);

      const getX = (i) => pad.left + i * (W - pad.left - pad.right) / (labels.length - 1 || 1);
      const getY = (v) => H - pad.bottom - ((v - minVal) / range) * (H - pad.top - pad.bottom);

      // Grille
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth   = 1;
      for (let i = 0; i <= 4; i++) {
        const y = pad.top + (H - pad.top - pad.bottom) * (i / 4);
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(W - pad.right, y);
        ctx.stroke();

        const val = Math.round(maxVal - (range * i / 4));
        ctx.fillStyle  = 'rgba(255,255,255,0.35)';
        ctx.font       = '10px system-ui';
        ctx.textAlign  = 'right';
        ctx.fillText(val, pad.left - 4, y + 4);
      }

      // Datasets
      datasets.forEach(dataset => {
        const vals = dataset.valeurs;
        const color = dataset.color || '#4b4bf9';

        if (vals.length < 2) return;

        // Zone remplie
        const grad = ctx.createLinearGradient(0, pad.top, 0, H - pad.bottom);
        grad.addColorStop(0, color.replace(')', ',0.25)').replace('rgb','rgba'));
        grad.addColorStop(1, color.replace(')', ',0.0)').replace('rgb','rgba'));

        ctx.beginPath();
        ctx.moveTo(getX(0), getY(vals[0]));
        for (let i = 1; i < vals.length; i++) {
          ctx.lineTo(getX(i), getY(vals[i]));
        }
        ctx.lineTo(getX(vals.length - 1), H - pad.bottom);
        ctx.lineTo(getX(0), H - pad.bottom);
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
      labels.forEach((l, i) => {
        ctx.fillText(l, getX(i), H - pad.bottom + 14);
      });
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

      // Fond
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth   = 8;
      ctx.stroke();

      // Arc valeur
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
};

/* ============================================================
   ExerciseGIF v2 — Wger API (Gratuite + Sans clé)
   ============================================================ */

const ExerciseGIF = {

  // ─── Source principale : Wger (open source, gratuit) ──────
  WGER_BASE: 'https://wger.de/api/v2/exercise/',
  WGER_MEDIA: 'https://wger.de/api/v2/exerciseimage/',

  // ─── Source secondaire : ExerciseDB public (sans clé) ─────
  EXERCISEDB_BASE: 'https://exercisedb.io/api/exercises',

  // ─── Source tertiaire : GIFs hébergés GitHub (garanti) ───
  GITHUB_GIFS: {
    bench_press:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg',
    squat:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Full_Squat/0.jpg',
    tractions:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pullups/0.jpg',
    rowing_barre:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bent_Over_Row/0.jpg',
    dev_militaire:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shoulder_Press/0.jpg',
    soulevé_terre:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Deadlift/0.jpg',
    lat_pulldown:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/0.jpg',
    curl_halteres:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bicep_Curl/0.jpg',
    curl_barre:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg',
    curl_marteau:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/0.jpg',
    elev_laterales:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Laterals_to_Front_Raise/0.jpg',
    face_pull:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/0.jpg',
    presse_cuisses:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg',
    fentes:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lunges/0.jpg',
    leg_curl:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curl/0.jpg',
    leg_extension:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/0.jpg',
    mollets:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/0.jpg',
    planche:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushup/0.jpg',
    dips:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chest_Dip/0.jpg',
    pompes:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushup/0.jpg',
    ext_triceps_poulie:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushdown/0.jpg',
    barre_front:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Skullcrusher/0.jpg',
    dips_triceps:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tricep_Dips/0.jpg',
    incline_halteres:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Press/0.jpg',
    russian_twist:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Russian_Twist/0.jpg',
    releve_jambes:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/0.jpg',
    hip_thrust:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/0.jpg',
    rowing_machine:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Row/0.jpg',
    pullover:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Pullover/0.jpg',
    shoulder_press_machine:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Shoulder_Press/0.jpg',
    chest_press_machine:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bench_Press/0.jpg',
    ecarte_poulie:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/0.jpg',
    crunch_machine:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunch/0.jpg',
    rameur:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Row/0.jpg',
    velo:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stationary_Bike/0.jpg',
    oiseau:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Dumbbell_Rear_Delt_Row/0.jpg',
    curl_machine:
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bicep_Curl/0.jpg'
  },

  // ─── Cache localStorage ────────────────────────────────────
  _getCached(ref) {
    const v = localStorage.getItem(`ft_gif_${ref}`);
    return (v && v !== 'null' && v !== 'undefined') ? v : null;
  },

  _setCached(ref, url) {
    if (url) localStorage.setItem(`ft_gif_${ref}`, url);
  },

  // ─── Vérifier qu'une URL image répond bien ─────────────────
  async _testerURL(url) {
    return new Promise(resolve => {
      const img    = new Image();
      img.onload   = () => resolve(true);
      img.onerror  = () => resolve(false);
      // Timeout 5 secondes
      setTimeout(() => resolve(false), 5000);
      img.src = url;
    });
  },

  // ─── Récupérer un GIF — Cascade de fallbacks ──────────────
  async getGIF(exerciceRef) {

    // 1. Cache d'abord
    const cached = this._getCached(exerciceRef);
    if (cached) return cached;

    // 2. GitHub JSON DB (open source, fiable)
    try {
      const githubUrl = this.GITHUB_GIFS[exerciceRef];
      if (githubUrl) {
        const ok = await this._testerURL(githubUrl);
        if (ok) {
          this._setCached(exerciceRef, githubUrl);
          return githubUrl;
        }
      }
    } catch(e) {}

    // 3. Pas de GIF trouvé → retourner null (emoji fallback)
    console.warn(`[GIF] Aucun GIF trouvé pour ${exerciceRef}`);
    return null;
  },

  // ─── Charger dans un élément DOM ──────────────────────────
  async chargerDans(exerciceRef, elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const ex  = window.EXERCICES?.[exerciceRef] || {};
    const url = await this.getGIF(exerciceRef);

    if (url) {
      el.style.transition = 'opacity 0.3s ease';
      el.style.opacity    = '0';

      setTimeout(() => {
        el.innerHTML = `
          <img src="${url}"
               alt="${ex.nom || exerciceRef}"
               style="width:100%;height:100%;
                      object-fit:cover;
                      border-radius:inherit"
               onerror="
                 this.parentElement.innerHTML=
                 '<span style=font-size:3rem>${ex.emoji||'💪'}</span>';
               " />
        `;
        el.style.opacity = '1';
      }, 100);
    }
    // Si null → l'emoji reste affiché (déjà en place)
  },

  // ─── Précharger tout ──────────────────────────────────────
  async prechargerTout(onProgress = null) {
    const refs  = Object.keys(this.GITHUB_GIFS);
    let   count = 0;

    for (const ref of refs) {
      if (!this._getCached(ref)) {
        await this.getGIF(ref);
        await new Promise(r => setTimeout(r, 50));
      }
      count++;
      if (onProgress) onProgress(count, refs.length);
    }

    console.log(`✅ [GIF] ${count} GIFs préchargés`);
  },

  // ─── Stats ────────────────────────────────────────────────
  statsCache() {
    const total  = Object.keys(this.GITHUB_GIFS).length;
    const cached = Object.keys(this.GITHUB_GIFS)
      .filter(ref => this._getCached(ref)).length;
    return {
      total,
      cached,
      pct: Math.round((cached / total) * 100)
    };
  },

  // ─── Vider cache ──────────────────────────────────────────
  viderCache() {
    Object.keys(this.GITHUB_GIFS).forEach(ref => {
      localStorage.removeItem(`ft_gif_${ref}`);
    });
    console.log('[GIF] Cache vidé');
  }
};

window.ExerciseGIF = ExerciseGIF;
console.log('✅ ExerciseGIF v2 chargé — Source: GitHub Free Exercise DB');
