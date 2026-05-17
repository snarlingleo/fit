/* ============================================================
   FitTracker Pro — Utils.js v3.0
   Utilitaires globaux + Dates + Storage + Graphiques
   + Export/Import + Toast + Confirm + Vibration
   ============================================================ */

'use strict';

const Utils = {

  // ════════════════════════════════════════════════════════
  // STORAGE
  // ════════════════════════════════════════════════════════
  storage: {

    get(cle, defaut = null) {
      try {
        const val = localStorage.getItem(cle);
        if (val === null) return defaut;
        return JSON.parse(val);
      } catch(e) {
        return defaut;
      }
    },

    set(cle, valeur) {
      try {
        localStorage.setItem(cle, JSON.stringify(valeur));
        return true;
      } catch(e) {
        console.warn('[Storage] Erreur set:', cle, e);
        return false;
      }
    },

    remove(cle) {
      try {
        localStorage.removeItem(cle);
        return true;
      } catch(e) { return false; }
    },

    existe(cle) {
      return localStorage.getItem(cle) !== null;
    },

    // Taille estimée du localStorage
    taille() {
      try {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const cle = localStorage.key(i);
          const val = localStorage.getItem(cle) || '';
          total += cle.length + val.length;
        }
        const ko = Math.round(total / 1024);
        return ko < 1024
          ? `${ko} Ko`
          : `${(ko/1024).toFixed(1)} Mo`;
      } catch(e) {
        return '— Ko';
      }
    },

    // Toutes les clés avec préfixe
    clesPar(prefixe) {
      const cles = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const cle = localStorage.key(i);
          if (cle?.startsWith(prefixe)) cles.push(cle);
        }
      } catch(e) {}
      return cles;
    },

    // Vider toutes les clés avec préfixe
    viderPar(prefixe) {
      this.clesPar(prefixe).forEach(c =>
        localStorage.removeItem(c)
      );
    }
  },

  // ════════════════════════════════════════════════════════
  // DATES
  // ════════════════════════════════════════════════════════

  // Date du jour au format YYYY-MM-DD
  aujourd_hui() {
    return new Date().toISOString().split('T')[0];
  },

  // Ajouter N jours à une date string
  ajouterJours(dateStr, n) {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      d.setDate(d.getDate() + n);
      return d.toISOString().split('T')[0];
    } catch(e) {
      return dateStr;
    }
  },

  // Différence en jours entre deux dates
  diffJours(dateDebut, dateFin) {
    try {
      const d1 = new Date(dateDebut + 'T00:00:00');
      const d2 = new Date(dateFin  + 'T00:00:00');
      return Math.round(
        (d2 - d1) / (1000 * 60 * 60 * 24)
      );
    } catch(e) { return 0; }
  },

  // Début de semaine (Lundi)
  debutSemaine(dateStr) {
    try {
      const d   = new Date(dateStr + 'T00:00:00');
      const day = d.getDay();
      // 0=Dim → 6, 1=Lun → 0, ..., 6=Sam → 5
      const diff = day === 0 ? -6 : 1 - day;
      d.setDate(d.getDate() + diff);
      return d.toISOString().split('T')[0];
    } catch(e) {
      return dateStr;
    }
  },

  // Fin de semaine (Dimanche)
  finSemaine(dateStr) {
    try {
      const debut = this.debutSemaine(dateStr);
      return this.ajouterJours(debut, 6);
    } catch(e) {
      return dateStr;
    }
  },

  // Index du jour de la semaine (0=Lun, 6=Dim)
  indexJourSemaine(dateStr) {
    try {
      const d   = new Date(dateStr + 'T00:00:00');
      const day = d.getDay();
      return day === 0 ? 6 : day - 1;
    } catch(e) { return 0; }
  },

  // Heure actuelle (entier 0-23)
  heureActuelle() {
    return new Date().getHours();
  },

  // Nombre de semaines depuis une date
  semainesDepuis(dateStr) {
    try {
      const diff = this.diffJours(dateStr, this.aujourd_hui());
      return Math.max(1, Math.floor(diff / 7));
    } catch(e) { return 1; }
  },

  // Formater date en "12 Jan"
  formatDateCourt(dateStr) {
    if (!dateStr) return '';
    try {
      const d    = new Date(dateStr + 'T00:00:00');
      const mois = [
        'Jan','Fév','Mar','Avr','Mai','Jun',
        'Jul','Aoû','Sep','Oct','Nov','Déc'
      ];
      return `${d.getDate()} ${mois[d.getMonth()]}`;
    } catch(e) { return dateStr; }
  },

  // Formater date en "Lundi 12 Janvier"
  formatDateLong(dateStr) {
    if (!dateStr) return '';
    try {
      const d    = new Date(dateStr + 'T00:00:00');
      const jours = [
        'Dimanche','Lundi','Mardi','Mercredi',
        'Jeudi','Vendredi','Samedi'
      ];
      const mois = [
        'Janvier','Février','Mars','Avril',
        'Mai','Juin','Juillet','Août',
        'Septembre','Octobre','Novembre','Décembre'
      ];
      return `${jours[d.getDay()]} ${d.getDate()} ${mois[d.getMonth()]}`;
    } catch(e) { return dateStr; }
  },

  // Formater date générique
  formatDate(dateStr, format = 'court') {
    return format === 'long'
      ? this.formatDateLong(dateStr)
      : this.formatDateCourt(dateStr);
  },

  // Est-ce aujourd'hui ?
  estAujourdhui(dateStr) {
    return dateStr === this.aujourd_hui();
  },

  // Est-ce cette semaine ?
  estCetteSemaine(dateStr) {
    const debut = this.debutSemaine(this.aujourd_hui());
    const fin   = this.finSemaine(this.aujourd_hui());
    return dateStr >= debut && dateStr <= fin;
  },

  // ════════════════════════════════════════════════════════
  // FORMATAGE
  // ════════════════════════════════════════════════════════

  // Volume en kg / tonnes
  formatVolume(kg) {
    if (!kg || isNaN(kg)) return '0kg';
    if (kg >= 1000) {
      return `${(kg/1000).toFixed(1)}T`;
    }
    return `${Math.round(kg)}kg`;
  },

  // Durée en secondes → "1h 23min" ou "23min"
  formatDuree(secondes) {
    if (!secondes || isNaN(secondes)) return '0min';
    const s = Math.round(secondes);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;

    if (h > 0) {
      return m > 0 ? `${h}h ${m}min` : `${h}h`;
    }
    if (m > 0) {
      return sec > 0 ? `${m}min ${sec}s` : `${m}min`;
    }
    return `${sec}s`;
  },

  // Durée en format MM:SS pour timer
  formatDureeMin(secondes) {
    if (!secondes || isNaN(secondes)) return '0:00';
    const s = Math.max(0, Math.round(secondes));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, '0')}`;
  },

  // Arrondir à 2 décimales
  arrondir(val, decimales = 1) {
    const factor = Math.pow(10, decimales);
    return Math.round((val||0) * factor) / factor;
  },

  // Nombre aléatoire dans une liste
  random(liste) {
    if (!liste?.length) return null;
    return liste[Math.floor(Math.random() * liste.length)];
  },

  // ════════════════════════════════════════════════════════
  // TOAST NOTIFICATIONS
  // ════════════════════════════════════════════════════════
  toast(message, type = 'info', duree = 3000) {
    try {
      const container = document.getElementById(
        'toast-container'
      );
      if (!container) {
        console.log(`[Toast] ${type}: ${message}`);
        return;
      }

      const colors = {
        success: { bg:'var(--fd-mint)',   text:'#09092d' },
        error:   { bg:'var(--fd-coral)',  text:'#09092d' },
        warning: { bg:'#ffa500',          text:'#09092d' },
        info:    { bg:'var(--fd-indigo)', text:'white'   },
        pr:      { bg:'var(--fd-lemon)',  text:'#09092d' }
      };

      const c = colors[type] || colors.info;

      const toast = document.createElement('div');
      toast.style.cssText = `
        background:${c.bg};
        color:${c.text};
        padding:10px 18px;
        border-radius:99px;
        font-size:.82rem;
        font-weight:700;
        max-width:100%;
        text-align:center;
        pointer-events:auto;
        box-shadow:0 4px 20px rgba(0,0,0,0.3);
        animation:toastIn .3s ease;
        cursor:pointer;
        word-break:break-word`;

      toast.textContent = message;
      toast.onclick     = () => toast.remove();

      container.appendChild(toast);

      // Auto-remove
      setTimeout(() => {
        toast.style.animation = 'toastOut .3s ease forwards';
        setTimeout(() => toast.remove(), 300);
      }, duree);

    } catch(e) {
      console.log(`[Toast] ${message}`);
    }
  },

  // ════════════════════════════════════════════════════════
  // MODAL CONFIRM
  // ════════════════════════════════════════════════════════
  confirmer(titre, message) {
    return new Promise((resolve) => {
      try {
        const modal = document.getElementById('modal-confirm');
        if (!modal) { resolve(window.confirm(message)); return; }

        const titleEl = document.getElementById('modal-confirm-title');
        const msgEl   = document.getElementById('modal-confirm-msg');
        const btnOui  = document.getElementById('modal-confirm-oui');
        const btnNon  = document.getElementById('modal-confirm-non');

        if (titleEl) titleEl.textContent = titre;
        if (msgEl)   msgEl.textContent   = message;

        modal.classList.remove('hidden');

        const cleanup = (val) => {
          modal.classList.add('hidden');
          btnOui.onclick = null;
          btnNon.onclick = null;
          resolve(val);
        };

        if (btnOui) btnOui.onclick = () => cleanup(true);
        if (btnNon) btnNon.onclick = () => cleanup(false);

      } catch(e) {
        resolve(window.confirm(message));
      }
    });
  },

  // ════════════════════════════════════════════════════════
  // VIBRATION
  // ════════════════════════════════════════════════════════
  vibrer(pattern = [200]) {
    try {
      if (navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch(e) {}
  },

  vibrerSuccess() {
    this.vibrer([100, 50, 100]);
  },

  vibrerPR() {
    this.vibrer([200, 100, 200, 100, 400]);
  },

  vibrerErreur() {
    this.vibrer([300, 100, 300]);
  },

  // ════════════════════════════════════════════════════════
  // CONFETTI
  // ════════════════════════════════════════════════════════
  confetti(duree = 3000) {
    try {
      const canvas = document.getElementById(
        'confetti-canvas'
      );
      if (!canvas) return;

      const ctx    = canvas.getContext('2d');
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;

      const particles = [];
      const colors    = [
        '#4b4bf9','#f9ef77','#8bf0bb',
        '#ff8d96','#bfa1ff','#ffffff'
      ];

      // Créer particules
      for (let i = 0; i < 120; i++) {
        particles.push({
          x:     Math.random() * canvas.width,
          y:     -Math.random() * canvas.height * 0.5,
          w:     Math.random() * 10 + 5,
          h:     Math.random() * 6 + 3,
          color: colors[Math.floor(Math.random()*colors.length)],
          vx:    (Math.random() - 0.5) * 4,
          vy:    Math.random() * 4 + 2,
          rot:   Math.random() * 360,
          vrot:  (Math.random() - 0.5) * 8,
          opacity: 1
        });
      }

      const debut = Date.now();

      const animer = () => {
        const elapsed = Date.now() - debut;
        if (elapsed > duree) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
          p.x   += p.vx;
          p.y   += p.vy;
          p.rot += p.vrot;
          p.vy  += 0.1; // gravité

          // Fade out sur les 20% finaux
          if (elapsed > duree * 0.8) {
            p.opacity = Math.max(0,
              1 - (elapsed - duree*0.8) / (duree*0.2)
            );
          }

          if (p.y > canvas.height + 20) {
            p.y = -20;
            p.x = Math.random() * canvas.width;
          }

          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x + p.w/2, p.y + p.h/2);
          ctx.rotate((p.rot * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
          ctx.restore();
        });

        requestAnimationFrame(animer);
      };

      animer();
    } catch(e) {}
  },

  // ════════════════════════════════════════════════════════
  // EXPORT / IMPORT
  // ════════════════════════════════════════════════════════
  exporterJSON() {
    try {
      const data = {};

      // Collecter toutes les données localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const cle = localStorage.key(i);
        if (!cle?.startsWith('ft_')) continue;
        try {
          data[cle] = JSON.parse(localStorage.getItem(cle));
        } catch(e) {
          data[cle] = localStorage.getItem(cle);
        }
      }

      const export_data = {
        version:   '3.0',
        app:       'PowerApp',
        date:      this.aujourd_hui(),
        timestamp: Date.now(),
        donnees:   data
      };

      const blob = new Blob(
        [JSON.stringify(export_data, null, 2)],
        { type:'application/json' }
      );
      const link    = document.createElement('a');
      link.download = `powerapp-backup-${this.aujourd_hui()}.json`;
      link.href     = URL.createObjectURL(blob);
      link.click();

      this.toast('📤 Données exportées !', 'success');
    } catch(e) {
      console.error('[Utils] Erreur export:', e);
      this.toast('❌ Erreur export', 'error');
    }
  },

  async importerJSON(fichier = null) {
    try {
      if (!fichier) {
        // Ouvrir file picker
        return new Promise((resolve) => {
          const input  = document.createElement('input');
          input.type   = 'file';
          input.accept = '.json';
          input.onchange = async (e) => {
            const f = e.target.files?.[0];
            if (f) {
              await this._traiterImport(f);
              resolve(true);
            } else {
              resolve(false);
            }
          };
          input.click();
        });
      } else {
        await this._traiterImport(fichier);
      }
    } catch(e) {
      console.error('[Utils] Erreur import:', e);
      this.toast('❌ Erreur import', 'error');
    }
  },

  async _traiterImport(fichier) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const raw  = JSON.parse(e.target.result);
          const data = raw.donnees || raw;

          if (!data || typeof data !== 'object') {
            throw new Error('Format invalide');
          }

          // Compter les clés
          const nb = Object.keys(data).length;

          const ok = await this.confirmer(
            '📥 Importer les données ?',
            `${nb} entrées trouvées. Tes données actuelles seront remplacées.`
          );

          if (!ok) { resolve(false); return; }

          // Importer
          let imported = 0;
          Object.entries(data).forEach(([cle, val]) => {
            try {
              localStorage.setItem(
                cle, JSON.stringify(val)
              );
              imported++;
            } catch(e) {}
          });

          this.toast(
            `✅ ${imported} données importées !`,
            'success', 4000
          );
          console.log(`[Utils] Import OK: ${imported} clés`);

          // Recharger après 1.5s
          setTimeout(() => window.location.reload(), 1500);
          resolve(true);

        } catch(err) {
          this.toast('❌ Fichier invalide', 'error');
          reject(err);
        }
      };

      reader.onerror = reject;
      reader.readAsText(fichier);
    });
  },

  // ════════════════════════════════════════════════════════
  // GRAPHIQUES (Canvas minimaliste)
  // ════════════════════════════════════════════════════════
  graphiques: {

    // Couleurs par défaut
    COULEURS: {
      indigo:   '#4b4bf9',
      mint:     '#8bf0bb',
      lemon:    '#f9ef77',
      coral:    '#ff8d96',
      lavender: '#bfa1ff',
      muted:    'rgba(255,255,255,0.15)'
    },

    // ─── Graphique en barres ───────────────────────────
    barres(canvas, labels, valeurs, options = {}) {
      if (!canvas || !labels?.length) return;

      const ctx  = canvas.getContext('2d');
      const W    = canvas.offsetWidth  || canvas.width  || 300;
      const H    = canvas.offsetHeight || canvas.height || 140;

      canvas.width  = W;
      canvas.height = H;

      ctx.clearRect(0, 0, W, H);

      if (!valeurs?.length) return;

      const color  = options.color  || this.COULEURS.indigo;
      const color2 = options.color2 || null;
      const padL   = 8, padR = 8, padT = 20, padB = 24;
      const max    = Math.max(...valeurs, 1);
      const n      = valeurs.length;
      const barW   = Math.floor(
        (W - padL - padR - (n-1)*4) / n
      );
      const chartH = H - padT - padB;

      valeurs.forEach((val, i) => {
        const x   = padL + i * (barW + 4);
        const pct = val / max;
        const bH  = Math.max(2, Math.round(pct * chartH));
        const y   = padT + chartH - bH;

        // Couleur dégradée si color2
        if (color2) {
          const grad = ctx.createLinearGradient(
            x, y, x, y + bH
          );
          grad.addColorStop(0, color);
          grad.addColorStop(1, color2);
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = color;
        }

        // Barre arrondie
        this._roundRect(ctx, x, y, barW, bH, 4);
        ctx.fill();

        // Valeur au-dessus si place
        if (val > 0 && barW >= 20) {
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.font      = '10px system-ui';
          ctx.textAlign = 'center';
          const label = val >= 1000
            ? `${(val/1000).toFixed(1)}T`
            : `${val}`;
          ctx.fillText(label, x + barW/2, y - 4);
        }

        // Label en bas
        if (labels[i]) {
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.font      = '10px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText(
            labels[i],
            x + barW/2,
            H - padB + 14
          );
        }
      });
    },

    // ─── Graphique en ligne ───────────────────────────
    ligne(canvas, labels, series, options = {}) {
      if (!canvas || !labels?.length) return;

      const ctx  = canvas.getContext('2d');
      const W    = canvas.offsetWidth  || canvas.width  || 300;
      const H    = canvas.offsetHeight || canvas.height || 140;

      canvas.width  = W;
      canvas.height = H;

      ctx.clearRect(0, 0, W, H);

      if (!series?.length) return;

      const padL = 40, padR = 12, padT = 16, padB = 24;
      const chartW = W - padL - padR;
      const chartH = H - padT - padB;
      const n      = labels.length;

      // Calculer min/max global
      const toutesValeurs = series.flatMap(s => s.valeurs || []);
      const max = Math.max(...toutesValeurs, 1);
      const min = Math.min(...toutesValeurs, 0);
      const range = Math.max(max - min, 1);

      // Grille horizontale
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth   = 1;
      [0, 0.25, 0.5, 0.75, 1].forEach(pct => {
        const y = padT + chartH - pct * chartH;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(W - padR, y);
        ctx.stroke();
      });

      // Axe Y labels
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font      = '10px system-ui';
      ctx.textAlign = 'right';
      [0, 0.5, 1].forEach(pct => {
        const val = Math.round(min + pct * range);
        const y   = padT + chartH - pct * chartH;
        const lbl = val >= 1000
          ? `${(val/1000).toFixed(1)}T`
          : `${val}`;
        ctx.fillText(lbl, padL - 4, y + 4);
      });

      // Dessiner chaque série
      const defaultColors = [
        this.COULEURS.indigo,
        this.COULEURS.mint,
        this.COULEURS.lemon,
        this.COULEURS.coral
      ];

      series.forEach((serie, si) => {
        const valeurs = serie.valeurs || [];
        if (!valeurs.length) return;

        const color  = serie.color || defaultColors[si % 4];
        const points = valeurs.map((v, i) => ({
          x: padL + (i / Math.max(n-1, 1)) * chartW,
          y: padT + chartH - ((v-min)/range) * chartH
        }));

        // Zone remplie sous la ligne
        if (options.fill !== false) {
          ctx.beginPath();
          ctx.moveTo(points[0].x, padT + chartH);
          points.forEach(p => ctx.lineTo(p.x, p.y));
          ctx.lineTo(points[points.length-1].x, padT + chartH);
          ctx.closePath();

          const grad = ctx.createLinearGradient(
            0, padT, 0, padT + chartH
          );
          grad.addColorStop(0, color + '40');
          grad.addColorStop(1, color + '00');
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Ligne
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth   = 2.5;
        ctx.lineJoin    = 'round';
        ctx.lineCap     = 'round';

        points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else {
            // Courbe de Bézier douce
            const prev = points[i-1];
            const cpx  = (prev.x + p.x) / 2;
            ctx.bezierCurveTo(
              cpx, prev.y, cpx, p.y, p.x, p.y
            );
          }
        });
        ctx.stroke();

        // Points
        points.forEach((p, i) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();

          // Valeur si dernier point ou options.showValues
          if (i === points.length - 1
              || options.showValues) {
            ctx.fillStyle = color;
            ctx.font      = '10px system-ui';
            ctx.textAlign = 'center';
            const v = valeurs[i];
            const lbl = v >= 1000
              ? `${(v/1000).toFixed(1)}T`
              : `${v}`;
            ctx.fillText(lbl, p.x, p.y - 8);
          }
        });
      });

      // Labels X
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font      = '10px system-ui';
      ctx.textAlign = 'center';
      labels.forEach((l, i) => {
        const x = padL + (i / Math.max(n-1, 1)) * chartW;
        ctx.fillText(l, x, H - padB + 14);
      });
    },

    // ─── Graphique donut ──────────────────────────────
    donut(canvas, segments, options = {}) {
      if (!canvas || !segments?.length) return;

      const ctx  = canvas.getContext('2d');
      const W    = canvas.offsetWidth  || canvas.width  || 200;
      const H    = canvas.offsetHeight || canvas.height || 200;

      canvas.width  = W;
      canvas.height = H;

      ctx.clearRect(0, 0, W, H);

      const cx      = W / 2;
      const cy      = H / 2;
      const rayon   = Math.min(W, H) / 2 - 20;
      const epaisseur = options.epaisseur || 28;
      const total   = segments.reduce((a,s) => a+s.val, 0);
      if (total === 0) return;

      let angle = -Math.PI / 2;

      segments.forEach(seg => {
        const sweep = (seg.val / total) * Math.PI * 2;

        ctx.beginPath();
        ctx.arc(cx, cy, rayon, angle, angle + sweep);
        ctx.arc(
          cx, cy,
          rayon - epaisseur,
          angle + sweep, angle,
          true
        );
        ctx.closePath();
        ctx.fillStyle = seg.color || '#4b4bf9';
        ctx.fill();

        // Gap entre segments
        angle += sweep + 0.02;
      });

      // Texte central
      if (options.centre) {
        ctx.fillStyle = options.centre.color || '#ffffff';
        ctx.font      = `bold ${options.centre.size||22}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(options.centre.texte, cx, cy);
        ctx.textBaseline = 'alphabetic';
      }
    },

    // ─── Radar chart ─────────────────────────────────
    radar(canvas, labels, valeurs, options = {}) {
      if (!canvas || !labels?.length) return;

      const ctx  = canvas.getContext('2d');
      const W    = canvas.offsetWidth  || canvas.width  || 240;
      const H    = canvas.offsetHeight || canvas.height || 240;

      canvas.width  = W;
      canvas.height = H;

      ctx.clearRect(0, 0, W, H);

      const cx    = W / 2;
      const cy    = H / 2;
      const r     = Math.min(W, H) / 2 - 30;
      const n     = labels.length;
      const max   = options.max || Math.max(...valeurs, 1);
      const color = options.color || '#4b4bf9';

      // Grilles polygonales
      [0.25, 0.5, 0.75, 1].forEach(pct => {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth   = 1;

        for (let i = 0; i < n; i++) {
          const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(angle) * r * pct;
          const y = cy + Math.sin(angle) * r * pct;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      });

      // Axes
      for (let i = 0; i < n; i++) {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.moveTo(cx, cy);
        ctx.lineTo(
          cx + Math.cos(angle) * r,
          cy + Math.sin(angle) * r
        );
        ctx.stroke();

        // Labels
        const lx = cx + Math.cos(angle) * (r + 18);
        const ly = cy + Math.sin(angle) * (r + 18);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font      = '11px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labels[i], lx, ly);
      }

      // Zone données
      ctx.beginPath();
      valeurs.forEach((val, i) => {
        const pct   = Math.min(val / max, 1);
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * r * pct;
        const y = cy + Math.sin(angle) * r * pct;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();

      ctx.fillStyle   = color + '33';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth   = 2;
      ctx.stroke();

      // Points
      valeurs.forEach((val, i) => {
        const pct   = Math.min(val / max, 1);
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * r * pct;
        const y = cy + Math.sin(angle) * r * pct;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      ctx.textBaseline = 'alphabetic';
    },

    // ─── Helper roundRect canvas ─────────────────────
    _roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x+r, y);
      ctx.lineTo(x+w-r, y);
      ctx.quadraticCurveTo(x+w, y, x+w, y+r);
      ctx.lineTo(x+w, y+h-r);
      ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
      ctx.lineTo(x+r, y+h);
      ctx.quadraticCurveTo(x, y+h, x, y+h-r);
      ctx.lineTo(x, y+r);
      ctx.quadraticCurveTo(x, y, x+r, y);
      ctx.closePath();
    }
  },

  // ════════════════════════════════════════════════════════
  // DEBOUNCE / THROTTLE
  // ════════════════════════════════════════════════════════
  debounce(fn, delai = 300) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delai);
    };
  },

  throttle(fn, delai = 300) {
    let dernierAppel = 0;
    return function(...args) {
      const now = Date.now();
      if (now - dernierAppel >= delai) {
        dernierAppel = now;
        fn.apply(this, args);
      }
    };
  },

  // ════════════════════════════════════════════════════════
  // FORMULES FITNESS
  // ════════════════════════════════════════════════════════

  // Formule Epley : 1RM estimé
  calculer1RM(poids, reps) {
    if (!poids || !reps) return 0;
    if (reps === 1) return poids;
    return Math.round(poids * (1 + reps / 30));
  },

  // IMC
  calculerIMC(poids, taille) {
    if (!poids || !taille) return null;
    const t = taille / 100;
    return this.arrondir(poids / (t * t));
  },

  categorieIMC(imc) {
    if (!imc) return '—';
    if (imc < 18.5) return 'Insuffisance pondérale';
    if (imc < 25)   return 'Poids normal';
    if (imc < 30)   return 'Surpoids';
    return 'Obésité';
  },

  // Calories de base (Harris-Benedict)
  calculerCalories(poids, taille, age, sexe = 'H') {
    if (!poids || !taille) return 2000;
    const a = age || 25;
    if (sexe === 'H') {
      return Math.round(
        88.362 + (13.397 * poids)
        + (4.799 * taille) - (5.677 * a)
      );
    }
    return Math.round(
      447.593 + (9.247 * poids)
      + (3.098 * taille) - (4.330 * a)
    );
  },

  // Protéines recommandées
  calculerProteines(poids, objectif = 'force') {
    const ratio = {
      force:       2.2,
      prise_masse: 2.0,
      seche:       2.5,
      endurance:   1.6,
      forme:       1.8
    };
    return Math.round(poids * (ratio[objectif] || 1.8));
  },

  // ════════════════════════════════════════════════════════
  // DIVERS
  // ════════════════════════════════════════════════════════

  // Générer un ID unique
  genId(prefixe = 'id') {
    return `${prefixe}_${Date.now()}_${Math.random()
      .toString(36).substr(2, 6)}`;
  },

  // Tronquer un texte
  tronquer(texte, max = 50) {
    if (!texte) return '';
    if (texte.length <= max) return texte;
    return texte.substr(0, max) + '...';
  },

  // Capitaliser première lettre
  capitaliser(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // Deep clone d'un objet
  clone(obj) {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch(e) {
      return obj;
    }
  },

  // Vérifier si mobile
  estMobile() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      .test(navigator.userAgent);
  },

  // Vérifier si PWA installée
  estPWA() {
    return window.matchMedia('(display-mode: standalone)')
      .matches
      || window.navigator.standalone === true;
  },

  // Copier dans le presse-papier
  async copier(texte) {
    try {
      await navigator.clipboard.writeText(texte);
      this.toast('📋 Copié !', 'success', 1500);
      return true;
    } catch(e) {
      // Fallback
      const el       = document.createElement('textarea');
      el.value       = texte;
      el.style.position = 'fixed';
      el.style.opacity  = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      el.remove();
      this.toast('📋 Copié !', 'success', 1500);
      return true;
    }
  },

  // Formater un nombre avec séparateur milliers
  formatNombre(n) {
    if (!n || isNaN(n)) return '0';
    return Number(n).toLocaleString('fr-FR');
  },

  // Pourcentage
  pct(valeur, total) {
    if (!total) return 0;
    return Math.round((valeur / total) * 100);
  },

  // Clamp une valeur
  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }
};

// ════════════════════════════════════════════════════════════
// TIMER REPOS (global)
// ════════════════════════════════════════════════════════════
const timerRepos = {
  _interval:   null,
  _restant:    0,
  _actif:      false,
  _onTick:     null,
  _onFin:      null,
  _son:        null,

  demarrer(secondes, onTick = null, onFin = null) {
    this.arreter();

    this._restant = secondes;
    this._actif   = true;
    this._onTick  = onTick;
    this._onFin   = onFin;

    // Afficher le timer
    this._afficherTimer(secondes);

    this._interval = setInterval(() => {
      this._restant--;

      if (this._onTick) {
        try { this._onTick(this._restant); } catch(e) {}
      }

      // Bip à 3 secondes
      if (this._restant === 3) {
        this.jouerSon('beep');
      }

      this._mettreAJourTimer(this._restant);

      if (this._restant <= 0) {
        this.arreter();
        this.jouerSon('rest');
        Utils.vibrer([300, 100, 300]);
        this._cacherTimer();

        if (this._onFin) {
          try { this._onFin(); } catch(e) {}
        }
      }
    }, 1000);
  },

  arreter() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
    this._actif   = false;
    this._restant = 0;
    this._cacherTimer();
  },

  _afficherTimer(secondes) {
    let el = document.getElementById('timer-repos-overlay');
    if (!el) {
      el    = document.createElement('div');
      el.id = 'timer-repos-overlay';
      el.style.cssText = `
        position:fixed;
        bottom:calc(var(--nav-height,60px) + 16px);
        right:16px;
        z-index:900;
        background:var(--fd-indigo);
        color:white;
        padding:12px 20px;
        border-radius:var(--radius-full, 99px);
        font-size:1.1rem;font-weight:800;
        box-shadow:0 4px 20px rgba(75,75,249,0.5);
        display:flex;align-items:center;gap:8px;
        cursor:pointer;
        animation:bounceIn .3s ease;
        font-variant-numeric:tabular-nums`;

      el.onclick = () => this.arreter();
      document.body.appendChild(el);
    }

    el.innerHTML = `
      💤 <span id="timer-display">
        ${Utils.formatDureeMin(secondes)}
      </span>`;
  },

  _mettreAJourTimer(secondes) {
    const el = document.getElementById('timer-display');
    if (el) el.textContent = Utils.formatDureeMin(secondes);
  },

  _cacherTimer() {
    const el = document.getElementById('timer-repos-overlay');
    if (el) {
      el.style.transition = 'opacity .3s';
      el.style.opacity    = '0';
      setTimeout(() => el.remove(), 300);
    }
  },

  jouerSon(type = 'beep') {
    try {
      const config = Utils.storage.get(
        'ft_notifs_config', {}
      );
      if (config.son === false) return;

      const sons = {
        beep: './assets/sounds/beep.mp3',
        pr:   './assets/sounds/pr.mp3',
        rest: './assets/sounds/rest.mp3'
      };

      const src = sons[type] || sons.beep;

      // Web Audio API fallback si fichier non disponible
      try {
        const audio = new Audio(src);
        audio.volume = 0.5;
        audio.play().catch(() => {
          this._jouerSonSynth(type);
        });
      } catch(e) {
        this._jouerSonSynth(type);
      }
    } catch(e) {}
  },

  _jouerSonSynth(type) {
    try {
      const ctx   = new (window.AudioContext
        || window.webkitAudioContext)();
      const osc   = ctx.createOscillator();
      const gain  = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const configs = {
        beep: { freq:880, duree:.1,  type:'sine'   },
        pr:   { freq:523, duree:.4,  type:'square' },
        rest: { freq:440, duree:.2,  type:'sine'   }
      };

      const cfg = configs[type] || configs.beep;

      osc.frequency.setValueAtTime(
        cfg.freq, ctx.currentTime
      );
      osc.type = cfg.type;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001, ctx.currentTime + cfg.duree
      );

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + cfg.duree);
    } catch(e) {}
  }
};

// ════════════════════════════════════════════════════════════
// INJECTION CSS ANIMATIONS
// ════════════════════════════════════════════════════════════
(function _injecterAnimations() {
  const css = `
    @keyframes toastIn {
      from { opacity:0; transform:translateY(10px) scale(.95) }
      to   { opacity:1; transform:translateY(0)    scale(1)   }
    }
    @keyframes toastOut {
      from { opacity:1; transform:scale(1)   }
      to   { opacity:0; transform:scale(.9)  }
    }
    @keyframes spin {
      from { transform:rotate(0deg)   }
      to   { transform:rotate(360deg) }
    }
    @keyframes fadeIn {
      from { opacity:0 }
      to   { opacity:1 }
    }
    @keyframes bounceIn {
      0%   { transform:scale(0); opacity:0  }
      70%  { transform:scale(1.1)           }
      100% { transform:scale(1); opacity:1  }
    }
    @keyframes pulse {
      0%,100% { opacity:1   }
      50%     { opacity:.5  }
    }
    @keyframes slideUp {
      from { transform:translateY(20px); opacity:0 }
      to   { transform:translateY(0);    opacity:1 }
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
})();

window.Utils      = Utils;
window.timerRepos = timerRepos;

console.log('✅ Utils.js v3.0 chargé');
