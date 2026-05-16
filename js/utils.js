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
   ExerciseGIF — Chargement automatique GIFs via ExerciseDB
   ============================================================ */

const ExerciseGIF = {

  // ─── IDs ExerciseDB ───────────────────────────────────────
  IDS: {
    bench_press:             '0025',
    incline_halteres:        '0090',
    chest_press_machine:     '0076',
    ecarte_poulie:           '0260',
    dips:                    '0158',
    pompes:                  '0472',
    tractions:               '0656',
    rowing_barre:            '0445',
    lat_pulldown:            '0319',
    rowing_machine:          '0513',
    soulevé_terre:           '0301',
    pullover:                '0560',
    dev_militaire:           '0526',
    elev_laterales:          '0329',
    shoulder_press_machine:  '0745',
    face_pull:               '0355',
    oiseau:                  '0342',
    curl_halteres:           '0299',
    curl_barre:              '0031',
    curl_marteau:            '0320',
    curl_machine:            '0637',
    ext_triceps_poulie:      '0076',
    barre_front:             '0065',
    dips_triceps:            '0435',
    squat:                   '0685',
    presse_cuisses:          '0356',
    fentes:                  '0700',
    leg_curl:                '0322',
    leg_extension:           '0370',
    mollets:                 '0309',
    hip_thrust:              '1460',
    planche:                 '0573',
    crunch_machine:          '0476',
    releve_jambes:           '0340',
    russian_twist:           '0553',
    rameur:                  '0667',
    velo:                    '0628'
  },

  BASE_URL: 'https://exercisedb.io/api/exercises',

  // ─── Récupérer URL d'un GIF ───────────────────────────────
  async getGIF(exerciceRef) {
    // 1. Cache localStorage d'abord
    const cached = localStorage.getItem(`ft_gif_${exerciceRef}`);
    if (cached && cached !== 'null') return cached;

    // 2. Pas d'ID connu → retourner null
    const id = this.IDS[exerciceRef];
    if (!id) return null;

    // 3. Fetch API
    try {
      const res  = await fetch(`${this.BASE_URL}/${id}`, {
        headers: { 'x-rapidapi-host': 'exercisedb.p.rapidapi.com' }
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data   = await res.json();
      const gifUrl = data.gifUrl;

      if (gifUrl) {
        localStorage.setItem(`ft_gif_${exerciceRef}`, gifUrl);
        return gifUrl;
      }
      return null;

    } catch(e) {
      console.warn(`[GIF] Erreur chargement ${exerciceRef}:`, e.message);

      // Fallback → URL alternative MuscleWiki
      const fallback = this.FALLBACK_URLS[exerciceRef];
      if (fallback) {
        localStorage.setItem(`ft_gif_${exerciceRef}`, fallback);
        return fallback;
      }
      return null;
    }
  },

  // ─── URLs de fallback (MuscleWiki) ────────────────────────
  FALLBACK_URLS: {
    bench_press:    'https://musclewiki.com/media/uploads/videos/branded/male-barbell-bench-press-front.gif',
    squat:          'https://musclewiki.com/media/uploads/videos/branded/male-barbell-squat-front.gif',
    tractions:      'https://musclewiki.com/media/uploads/videos/branded/male-bodyweight-pull-up-front.gif',
    rowing_barre:   'https://musclewiki.com/media/uploads/videos/branded/male-barbell-bent-over-row-front.gif',
    dev_militaire:  'https://musclewiki.com/media/uploads/videos/branded/male-barbell-overhead-press-front.gif',
    soulevé_terre:  'https://musclewiki.com/media/uploads/videos/branded/male-barbell-deadlift-front.gif',
    lat_pulldown:   'https://musclewiki.com/media/uploads/videos/branded/male-cable-lat-pulldown-front.gif',
    curl_halteres:  'https://musclewiki.com/media/uploads/videos/branded/male-dumbbell-bicep-curl-front.gif',
    elev_laterales: 'https://musclewiki.com/media/uploads/videos/branded/male-dumbbell-lateral-raise-front.gif',
    planche:        'https://musclewiki.com/media/uploads/videos/branded/male-bodyweight-plank-front.gif',
    fentes:         'https://musclewiki.com/media/uploads/videos/branded/male-dumbbell-lunge-front.gif',
    presse_cuisses: 'https://musclewiki.com/media/uploads/videos/branded/male-machine-leg-press-front.gif',
    dips:           'https://musclewiki.com/media/uploads/videos/branded/male-bodyweight-dip-front.gif',
    pompes:         'https://musclewiki.com/media/uploads/videos/branded/male-bodyweight-push-up-front.gif'
  },

  // ─── Précharger tous les GIFs en arrière-plan ─────────────
  async prechargerTout(onProgress = null) {
    const refs  = Object.keys(this.IDS);
    let   count = 0;

    console.log(`[GIF] Préchargement de ${refs.length} GIFs...`);

    for (const ref of refs) {
      const deja = localStorage.getItem(`ft_gif_${ref}`);
      if (!deja) {
        await this.getGIF(ref);
        await new Promise(r => setTimeout(r, 150)); // Anti-spam
      }
      count++;
      if (onProgress) onProgress(count, refs.length);
    }

    console.log('✅ GIFs préchargés');
  },

  // ─── Vider le cache GIFs ──────────────────────────────────
  viderCache() {
    Object.keys(this.IDS).forEach(ref => {
      localStorage.removeItem(`ft_gif_${ref}`);
    });
    console.log('[GIF] Cache vidé');
  },

  // ─── Stats cache ──────────────────────────────────────────
  statsCache() {
    const total   = Object.keys(this.IDS).length;
    const cached  = Object.keys(this.IDS)
      .filter(ref => localStorage.getItem(`ft_gif_${ref}`)).length;
    return { total, cached, pct: Math.round((cached/total)*100) };
  },

  // ─── Rendu HTML d'un GIF ──────────────────────────────────
  // → Appelle cette fonction dans les templates HTML
  render(exerciceRef, options = {}) {
    const {
      taille    = 'grand',   // 'grand' | 'mini'
      className = '',
      style     = ''
    } = options;

    const ex      = window.EXERCICES?.[exerciceRef] || {};
    const cached  = localStorage.getItem(`ft_gif_${exerciceRef}`);
    const isGrand = taille === 'grand';
    const w       = isGrand ? '100%'  : '70px';
    const h       = isGrand ? '220px' : '70px';
    const fs      = isGrand ? '4rem'  : '1.8rem';
    const uid     = `gif_${exerciceRef}_${Date.now()}`;

    if (cached && cached !== 'null') {
      return `
        <div style="position:relative;width:${w};height:${h}">
          <img id="img_${uid}"
               src="${cached}"
               alt="${ex.nom || exerciceRef}"
               class="${className}"
               style="width:100%;height:100%;object-fit:contain;
                      border-radius:var(--radius-md);
                      background:rgba(0,0,0,0.2);${style}"
               onerror="ExerciseGIF._onImgError('${exerciceRef}', '${uid}')" />
        </div>
      `;
    }

    // Pas en cache → placeholder emoji + chargement async
    return `
      <div id="gifbox_${uid}"
           data-ref="${exerciceRef}"
           style="width:${w};height:${h};display:flex;flex-direction:column;
                  align-items:center;justify-content:center;
                  background:var(--fd-indigo-dim);
                  border-radius:var(--radius-md);
                  gap:8px;${style}">
        <span style="font-size:${fs}">${ex.emoji || '💪'}</span>
        ${this.IDS[exerciceRef] ? `
          <span style="font-size:.65rem;color:var(--text-muted)">
            ⏳ Chargement...
          </span>
        ` : ''}
      </div>
      <script>
        (async () => {
          const url = await ExerciseGIF.getGIF('${exerciceRef}');
          const box = document.getElementById('gifbox_${uid}');
          if (url && box) {
            box.innerHTML = \`
              <img src="\${url}"
                   alt="${ex.nom || exerciceRef}"
                   style="width:100%;height:100%;object-fit:contain;
                          border-radius:var(--radius-md)"
                   onerror="this.parentElement.innerHTML='${ex.emoji || '💪'}'" />
            \`;
          }
        })();
      <\/script>
    `;
  },

  // ─── Erreur image → retry fallback ────────────────────────
  _onImgError(exerciceRef, uid) {
    localStorage.removeItem(`ft_gif_${exerciceRef}`);
    const fallback = this.FALLBACK_URLS[exerciceRef];
    const img      = document.getElementById(`img_${uid}`);
    if (img && fallback) {
      img.src = fallback;
      localStorage.setItem(`ft_gif_${exerciceRef}`, fallback);
    } else if (img) {
      const ex = window.EXERCICES?.[exerciceRef] || {};
      img.parentElement.innerHTML = `
        <div style="width:100%;height:100%;display:flex;align-items:center;
                    justify-content:center;font-size:3rem;
                    background:var(--fd-indigo-dim);border-radius:var(--radius-md)">
          ${ex.emoji || '💪'}
        </div>
      `;
    }
  },

  // ─── Charger GIF dans un élément existant ─────────────────
  async chargerDans(exerciceRef, elementId) {
    const el  = document.getElementById(elementId);
    if (!el) return;

    const ex  = window.EXERCICES?.[exerciceRef] || {};
    const url = await this.getGIF(exerciceRef);

    if (url) {
      el.innerHTML = `
        <img src="${url}"
             alt="${ex.nom || exerciceRef}"
             style="width:100%;height:100%;object-fit:contain;
                    border-radius:var(--radius-md)"
             onerror="this.parentElement.innerHTML='<span style=font-size:3rem>${ex.emoji||'💪'}</span>'" />
      `;
    }
  }
};

window.ExerciseGIF = ExerciseGIF;
console.log('✅ ExerciseGIF chargé');

// Exposer globalement
window.Utils = Utils;
console.log('✅ Utils chargé');
