/* ============================================================
   FitTracker Pro — Social.js v1.0
   Partage Instagram + Stories + Réseaux sociaux
   Génération visuels + Templates + Watermark
   ============================================================ */

const Social = {

  // ════════════════════════════════════════════════════════
  // CONFIG
  // ════════════════════════════════════════════════════════
  CONFIG: {
    watermark:   'PowerApp · EverGPT',
    hashtags:    '#fitness #powerapp #musculation #progrès',
    hashtagsEN:  '#fitness #powerapp #gym #progress',
    instagramUrl:'https://www.instagram.com/',
    twitterUrl:  'https://twitter.com/intent/tweet',
    whatsappUrl: 'https://wa.me/?text=',
    telegramUrl: 'https://t.me/share/url'
  },

  // ════════════════════════════════════════════════════════
  // TEMPLATES STORIES (9:16 — 1080×1920)
  // ════════════════════════════════════════════════════════
  TEMPLATES: {
    pr_story: {
      id:          'pr_story',
      nom:         'Story PR',
      emoji:       '🏆',
      desc:        'Annonce un nouveau record',
      format:      '9:16',
      w: 1080, h: 1920
    },
    semaine_story: {
      id:          'semaine_story',
      nom:         'Story Semaine',
      emoji:       '📅',
      desc:        'Résumé de ta semaine',
      format:      '9:16',
      w: 1080, h: 1920
    },
    streak_story: {
      id:          'streak_story',
      nom:         'Story Streak',
      emoji:       '🔥',
      desc:        'Célèbre ta régularité',
      format:      '9:16',
      w: 1080, h: 1920
    },
    niveau_story: {
      id:          'niveau_story',
      nom:         'Story Niveau',
      emoji:       '⭐',
      desc:        'Nouveau niveau atteint',
      format:      '9:16',
      w: 1080, h: 1920
    },
    // Posts carrés (1:1 — 1080×1080)
    post_semaine: {
      id:          'post_semaine',
      nom:         'Post Semaine',
      emoji:       '📊',
      desc:        'Stats hebdomadaires',
      format:      '1:1',
      w: 1080, h: 1080
    },
    post_profil: {
      id:          'post_profil',
      nom:         'Post Profil',
      emoji:       '👤',
      desc:        'Carte profil athlète',
      format:      '1:1',
      w: 1080, h: 1080
    }
  },

  // ════════════════════════════════════════════════════════
  // GÉNÉRER UN VISUEL
  // ════════════════════════════════════════════════════════
  async generer(templateId, options = {}) {
    const tmpl = this.TEMPLATES[templateId];
    if (!tmpl) {
      Utils.toast('Template introuvable', 'error');
      return null;
    }

    const canvas  = document.createElement('canvas');
    canvas.width  = tmpl.w;
    canvas.height = tmpl.h;
    const ctx     = canvas.getContext('2d');

    switch(templateId) {
      case 'pr_story':     await this._storyPR(ctx, tmpl, options);     break;
      case 'semaine_story':await this._storySemaine(ctx, tmpl, options); break;
      case 'streak_story': await this._storyStreak(ctx, tmpl, options);  break;
      case 'niveau_story': await this._storyNiveau(ctx, tmpl, options);  break;
      case 'post_semaine': await this._postSemaine(ctx, tmpl, options);  break;
      case 'post_profil':  await this._postProfil(ctx, tmpl, options);   break;
      default:
        await this._storyPR(ctx, tmpl, options);
    }

    return canvas;
  },

  // ════════════════════════════════════════════════════════
  // STORY — PR (9:16)
  // ════════════════════════════════════════════════════════
  async _storyPR(ctx, tmpl, options) {
    const { w, h } = tmpl;

    let profil = { nom:'Athlète', avatar:'💪' };
    let prs    = {};
    let xp     = { niveau:{ emoji:'💪', nom:'Débutant', numero:1 } };

    try { profil = Tracker.getProfil();  } catch(e) {}
    try { prs    = Tracker.getAllPRs();  } catch(e) {}
    try { xp     = Gamification.getXP(); } catch(e) {}

    // Sélection PR (le plus récent ou celui passé en option)
    const prRef = options.exoRef
      || Object.keys(prs)[0];
    const pr    = prRef ? prs[prRef] : null;
    const ex    = prRef
      ? (window.EXERCICES||{})[prRef] || {}
      : {};

    // ── Fond dégradé doré ──
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0,   '#1a0d00');
    grad.addColorStop(0.4, '#2d1a00');
    grad.addColorStop(1,   '#09092d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Cercles décoratifs
    this._cercle(ctx, w/2, h*0.35, 700, 'rgba(249,239,119,0.06)');
    this._cercle(ctx, w/2, h*0.35, 500, 'rgba(249,239,119,0.04)');
    this._cercle(ctx, -200, h*0.8, 600, 'rgba(75,75,249,0.08)');

    // ── Points grille ──
    ctx.fillStyle = 'rgba(249,239,119,0.08)';
    for (let x = 60; x < w; x += 60)
      for (let y = 60; y < h; y += 60) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI*2);
        ctx.fill();
      }

    // ── Bandeau "NOUVEAU RECORD" ──
    const bandeauGrad = ctx.createLinearGradient(0, 280, w, 360);
    bandeauGrad.addColorStop(0, '#f9ef77');
    bandeauGrad.addColorStop(1, '#ffca28');
    ctx.fillStyle = bandeauGrad;
    ctx.fillRect(0, 290, w, 120);

    ctx.fillStyle = '#09092d';
    ctx.font      = 'bold 64px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 NOUVEAU RECORD !', w/2, 372);

    // ── Trophée géant ──
    ctx.font      = '320px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(249,239,119,0.15)';
    ctx.fillText('🏆', w/2, 680);

    // ── Exercice + Performance ──
    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 72px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${ex.emoji||'💪'} ${ex.nom||prRef||'Record'}`,
      w/2, 820
    );

    if (pr) {
      // Poids principal
      ctx.fillStyle = '#f9ef77';
      ctx.font      = 'bold 180px system-ui';
      ctx.fillText(`${pr.poids}kg`, w/2, 1060);

      // ×reps
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font      = 'bold 72px system-ui';
      ctx.fillText(`× ${pr.reps} répétitions`, w/2, 1160);

      // 1RM
      ctx.fillStyle = '#bfa1ff';
      ctx.font      = 'bold 52px system-ui';
      ctx.fillText(
        `Equivalent 1RM : ~${pr.rm1}kg`,
        w/2, 1270
      );
    }

    // ── Ligne déco ──
    const lineGrad = ctx.createLinearGradient(60, 0, w-60, 0);
    lineGrad.addColorStop(0,   'transparent');
    lineGrad.addColorStop(0.5, '#f9ef77');
    lineGrad.addColorStop(1,   'transparent');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth   = 3;
    ctx.beginPath();
    ctx.moveTo(100, 1340);
    ctx.lineTo(w-100, 1340);
    ctx.stroke();

    // ── Profil athlète ──
    this._cercle(ctx, w/2, 1470, 90, '#4b4bf9');
    ctx.font      = '80px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(profil.avatar||'💪', w/2, 1505);

    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 52px system-ui';
    ctx.fillText(profil.nom||'Athlète', w/2, 1590);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font      = '38px system-ui';
    ctx.fillText(
      `${xp.niveau.emoji} ${xp.niveau.nom}`,
      w/2, 1650
    );

    // ── Hashtags ──
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font      = '32px system-ui';
    ctx.fillText(
      this._getHashtags(),
      w/2, 1760
    );

    // ── Watermark ──
    this._watermark(ctx, w, h);
  },

  // ════════════════════════════════════════════════════════
  // STORY — SEMAINE (9:16)
  // ════════════════════════════════════════════════════════
  async _storySemaine(ctx, tmpl, options) {
    const { w, h } = tmpl;

    let profil  = { nom:'Athlète', avatar:'💪' };
    let seances = 0, volume = 0;
    let streak  = { count:0 };
    let prs     = 0;
    let phase   = { nom:'Reprise', emoji:'🌱' };
    let xp      = { niveau:{ emoji:'💪', nom:'Débutant' } };

    try { profil  = Tracker.getProfil();                  } catch(e) {}
    try { seances = Tracker.getSeancesParSemaine();       } catch(e) {}
    try { volume  = Tracker.getVolumeSemaine();           } catch(e) {}
    try { streak  = Tracker.getStreak();                  } catch(e) {}
    try { prs     = Object.keys(Tracker.getAllPRs()).length; } catch(e) {}
    try { phase   = Programme.getPhaseActuelle();         } catch(e) {}
    try { xp      = Gamification.getXP();                } catch(e) {}

    // ── Fond ──
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0,   '#09092d');
    grad.addColorStop(0.5, '#1a1a4e');
    grad.addColorStop(1,   '#09092d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    this._cercle(ctx, w/2, h*0.2, 600, 'rgba(75,75,249,0.1)');
    this._cercle(ctx, 0, h*0.7, 500, 'rgba(139,240,187,0.05)');

    // Grille
    ctx.fillStyle = 'rgba(75,75,249,0.12)';
    for (let x = 60; x < w; x += 60)
      for (let y = 60; y < h; y += 60) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI*2);
        ctx.fill();
      }

    // ── Header ──
    ctx.fillStyle = '#4b4bf9';
    this._roundRect(ctx, 80, 100, 300, 80, 40);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 38px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ PowerApp', 230, 150);

    // Phase badge
    ctx.fillStyle = (phase.couleur||'#8bf0bb') + '33';
    this._roundRect(ctx, w-380, 100, 300, 80, 40);
    ctx.fill();
    ctx.strokeStyle = phase.couleur||'#8bf0bb';
    ctx.lineWidth   = 2;
    this._roundRect(ctx, w-380, 100, 300, 80, 40);
    ctx.stroke();
    ctx.fillStyle = phase.couleur||'#8bf0bb';
    ctx.font      = 'bold 36px system-ui';
    ctx.fillText(
      `${phase.emoji} ${phase.nom}`,
      w-230, 150
    );

    // ── Titre ──
    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 100px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MA SEMAINE', w/2, 340);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font      = '48px system-ui';
    ctx.fillText(
      Utils.formatDateCourt?.(
        Utils.debutSemaine(Utils.aujourd_hui())
      ) || '',
      w/2, 410
    );

    // ── Séparateur ──
    const lineGrad = ctx.createLinearGradient(60, 0, w-60, 0);
    lineGrad.addColorStop(0,   'transparent');
    lineGrad.addColorStop(0.5, '#4b4bf9');
    lineGrad.addColorStop(1,   'transparent');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth   = 3;
    ctx.beginPath();
    ctx.moveTo(80, 450);
    ctx.lineTo(w-80, 450);
    ctx.stroke();

    // ── Stats cards ──
    const statsData = [
      {
        val:   `${seances}`,
        label: 'Séances',
        emoji: '📅',
        color: '#4b4bf9'
      },
      {
        val:   Utils.formatVolume(volume),
        label: 'Volume',
        emoji: '🏋️',
        color: '#8bf0bb'
      },
      {
        val:   `${streak.count}🔥`,
        label: 'Streak',
        emoji: '⚡',
        color: '#f9ef77'
      },
      {
        val:   `${prs}`,
        label: 'Records',
        emoji: '🏆',
        color: '#bfa1ff'
      }
    ];

    const cardW = 440, cardH = 300;
    const positions = [
      { x:80,    y:500 },
      { x:560,   y:500 },
      { x:80,    y:840 },
      { x:560,   y:840 }
    ];

    statsData.forEach((s, i) => {
      const { x, y } = positions[i];

      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      this._roundRect(ctx, x, y, cardW, cardH, 32);
      ctx.fill();

      ctx.strokeStyle = s.color + '44';
      ctx.lineWidth   = 2;
      this._roundRect(ctx, x, y, cardW, cardH, 32);
      ctx.stroke();

      ctx.font      = '72px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(s.emoji, x + cardW/2, y + 100);

      ctx.fillStyle = s.color;
      ctx.font      = 'bold 80px system-ui';
      ctx.fillText(s.val, x + cardW/2, y + 215);

      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font      = '38px system-ui';
      ctx.fillText(s.label, x + cardW/2, y + 270);
    });

    // ── Heatmap 7j ──
    const hmY = 1200;
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font      = '36px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Cette semaine', w/2, hmY - 20);

    const jours    = ['L','M','M','J','V','S','D'];
    const hmCellW  = 130;
    const hmCellH  = 100;
    const hmStartX = (w - (7*hmCellW + 6*10)) / 2;

    let heatmap = {};
    try { heatmap = Tracker.getHeatmapData(7); } catch(e) {}

    for (let i = 6; i >= 0; i--) {
      const date = Utils.ajouterJours(Utils.aujourd_hui(), -i);
      const etat = heatmap[date] || 'none';
      const idx  = 6 - i;
      const x    = hmStartX + idx * (hmCellW + 10);
      const y    = hmY;

      ctx.fillStyle =
        etat === 'done'   ? '#4b4bf9' :
        etat === 'missed' ? 'rgba(255,141,150,0.4)' :
        etat === 'rest'   ? 'rgba(139,240,187,0.2)' :
                            'rgba(255,255,255,0.06)';
      this._roundRect(ctx, x, y, hmCellW, hmCellH, 14);
      ctx.fill();

      ctx.fillStyle = etat === 'done'
        ? '#ffffff' : 'rgba(255,255,255,0.4)';
      ctx.font      = 'bold 36px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(jours[idx], x + hmCellW/2, y + 38);

      ctx.font = '40px system-ui';
      ctx.fillText(
        etat === 'done'   ? '✅' :
        etat === 'missed' ? '❌' :
        etat === 'rest'   ? '😴' : '·',
        x + hmCellW/2, y + 82
      );
    }

    // ── Profil ──
    this._cercle(ctx, w/2, 1460, 110, '#4b4bf9');
    ctx.font      = '90px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(profil.avatar||'💪', w/2, 1500);

    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 64px system-ui';
    ctx.fillText(profil.nom||'Athlète', w/2, 1600);

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font      = '42px system-ui';
    ctx.fillText(
      `${xp.niveau.emoji} ${xp.niveau.nom}`,
      w/2, 1670
    );

    // ── Hashtags ──
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font      = '34px system-ui';
    ctx.fillText(this._getHashtags(), w/2, 1780);

    this._watermark(ctx, w, h);
  },

  // ════════════════════════════════════════════════════════
  // STORY — STREAK (9:16)
  // ════════════════════════════════════════════════════════
  async _storyStreak(ctx, tmpl, options) {
    const { w, h } = tmpl;

    let streak = { count:0, max:0 };
    let profil = { nom:'Athlète', avatar:'💪' };
    let xp     = { total:0, niveau:{ emoji:'💪', nom:'Débutant' } };

    try { streak = Tracker.getStreak();   } catch(e) {}
    try { profil = Tracker.getProfil();   } catch(e) {}
    try { xp     = Gamification.getXP(); } catch(e) {}

    // ── Fond feu ──
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0,   '#1a0500');
    grad.addColorStop(0.4, '#2d0a00');
    grad.addColorStop(1,   '#09092d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    this._cercle(ctx, w/2, h*0.4, 700, 'rgba(255,100,0,0.08)');
    this._cercle(ctx, w/2, h*0.4, 500, 'rgba(255,150,0,0.05)');

    // ── Flammes décoratives ──
    ctx.font      = '220px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,100,0,0.15)';
    ctx.fillText('🔥', w*0.2, h*0.5);
    ctx.fillText('🔥', w*0.8, h*0.5);

    // ── Badge "STREAK" ──
    const bGrad = ctx.createLinearGradient(0, 300, w, 400);
    bGrad.addColorStop(0, '#ff6b00');
    bGrad.addColorStop(1, '#ff8d00');
    ctx.fillStyle = bGrad;
    ctx.fillRect(0, 310, w, 130);

    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 72px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('🔥 STREAK EN FEU !', w/2, 395);

    // ── Flamme principale ──
    ctx.font      = '380px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('🔥', w/2, 980);

    // ── Nombre jours ──
    ctx.fillStyle = '#ff8d00';
    ctx.font      = 'bold 260px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${streak.count}`, w/2, 1300);

    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 78px system-ui';
    ctx.fillText('JOURS CONSÉCUTIFS', w/2, 1400);

    // ── Record ──
    ctx.fillStyle = '#f9ef77';
    ctx.font      = '52px system-ui';
    ctx.fillText(
      `🏆 Record : ${streak.max} jours`,
      w/2, 1500
    );

    // ── Profil ──
    this._cercle(ctx, w/2, 1650, 100, '#ff6b00');
    ctx.font      = '80px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(profil.avatar||'💪', w/2, 1685);

    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 58px system-ui';
    ctx.fillText(profil.nom||'Athlète', w/2, 1780);

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font      = '38px system-ui';
    ctx.fillText(
      `${xp.niveau.emoji} ${xp.niveau.nom}`,
      w/2, 1840
    );

    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font      = '32px system-ui';
    ctx.fillText(this._getHashtags(), w/2, 1880);

    this._watermark(ctx, w, h);
  },

  // ════════════════════════════════════════════════════════
  // STORY — NIVEAU (9:16)
  // ════════════════════════════════════════════════════════
  async _storyNiveau(ctx, tmpl, options) {
    const { w, h } = tmpl;

    let xp     = {
      total:0,
      pourcentage:0,
      niveau:{ emoji:'💪', numero:1, nom:'Débutant',
               xpMin:0, xpSuivant:500 }
    };
    let profil = { nom:'Athlète', avatar:'💪' };
    let streak = { count:0 };
    let total  = 0;

    try { xp     = Gamification.getXP();    } catch(e) {}
    try { profil = Tracker.getProfil();     } catch(e) {}
    try { streak = Tracker.getStreak();     } catch(e) {}
    try { total  = Tracker.getTotalSeances(); } catch(e) {}

    // ── Fond indigo ──
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0,   '#09092d');
    grad.addColorStop(0.5, '#1a1a6e');
    grad.addColorStop(1,   '#09092d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    this._cercle(ctx, w/2, h*0.35, 700, 'rgba(75,75,249,0.15)');
    this._cercle(ctx, w/2, h*0.35, 500, 'rgba(191,161,255,0.08)');

    // ── Badge niveau ──
    const nGrad = ctx.createLinearGradient(0, 300, w, 420);
    nGrad.addColorStop(0, '#4b4bf9');
    nGrad.addColorStop(1, '#7b2ff7');
    ctx.fillStyle = nGrad;
    ctx.fillRect(0, 300, w, 140);

    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 68px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(
      `⭐ NIVEAU ${xp.niveau.numero} ATTEINT !`,
      w/2, 392
    );

    // ── Emoji niveau géant ──
    ctx.font      = '380px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(xp.niveau.emoji, w/2, 950);

    // ── Nom niveau ──
    ctx.fillStyle = '#f9ef77';
    ctx.font      = 'bold 120px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(xp.niveau.nom, w/2, 1100);

    // ── XP Bar ──
    const bX = 100, bY = 1160;
    const bW = w-200, bH = 30;

    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    this._roundRect(ctx, bX, bY, bW, bH, 15);
    ctx.fill();

    const xpFill = ctx.createLinearGradient(bX, 0, bX+bW, 0);
    xpFill.addColorStop(0, '#4b4bf9');
    xpFill.addColorStop(1, '#f9ef77');
    ctx.fillStyle = xpFill;
    this._roundRect(
      ctx, bX, bY,
      Math.max(30, bW*(xp.pourcentage/100)), bH, 15
    );
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font      = '42px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${xp.total.toLocaleString()} XP`,
      w/2, 1250
    );

    // ── Stats ──
    const stats2 = [
      { val:`${total}`, label:'Séances', color:'#8bf0bb' },
      { val:`${streak.count}🔥`, label:'Streak', color:'#f9ef77' }
    ];

    stats2.forEach((s, i) => {
      const x = i === 0 ? w*0.25 : w*0.75;
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      this._roundRect(ctx, x-200, 1310, 400, 220, 28);
      ctx.fill();

      ctx.fillStyle = s.color;
      ctx.font      = 'bold 80px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(s.val, x, 1415);

      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font      = '40px system-ui';
      ctx.fillText(s.label, x, 1470);
    });

    // ── Profil ──
    this._cercle(ctx, w/2, 1660, 100, '#4b4bf9');
    ctx.font      = '80px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(profil.avatar||'💪', w/2, 1695);

    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 56px system-ui';
    ctx.fillText(profil.nom||'Athlète', w/2, 1790);

    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font      = '32px system-ui';
    ctx.fillText(this._getHashtags(), w/2, 1870);

    this._watermark(ctx, w, h);
  },

  // ════════════════════════════════════════════════════════
  // POST CARRÉ — SEMAINE (1:1)
  // ════════════════════════════════════════════════════════
  async _postSemaine(ctx, tmpl, options) {
    // Déléguer au Share existant
    try {
      const shareCanvas = await Share.genererCarte('semaine');
      ctx.drawImage(shareCanvas, 0, 0, tmpl.w, tmpl.h);
    } catch(e) {
      // Fallback basique
      ctx.fillStyle = '#09092d';
      ctx.fillRect(0, 0, tmpl.w, tmpl.h);
      ctx.fillStyle = '#ffffff';
      ctx.font      = 'bold 60px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Ma Semaine', tmpl.w/2, tmpl.h/2);
    }
    this._watermark(ctx, tmpl.w, tmpl.h);
  },

  // ════════════════════════════════════════════════════════
  // POST CARRÉ — PROFIL (1:1)
  // ════════════════════════════════════════════════════════
  async _postProfil(ctx, tmpl, options) {
    try {
      const shareCanvas = await Share.genererCarte('profil');
      ctx.drawImage(shareCanvas, 0, 0, tmpl.w, tmpl.h);
    } catch(e) {
      ctx.fillStyle = '#09092d';
      ctx.fillRect(0, 0, tmpl.w, tmpl.h);
      ctx.fillStyle = '#ffffff';
      ctx.font      = 'bold 60px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Mon Profil', tmpl.w/2, tmpl.h/2);
    }
    this._watermark(ctx, tmpl.w, tmpl.h);
  },

  // ════════════════════════════════════════════════════════
  // HELPERS CANVAS
  // ════════════════════════════════════════════════════════
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
  },

  _cercle(ctx, x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();
  },

  _watermark(ctx, w, h) {
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font      = '28px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(this.CONFIG.watermark, w/2, h - 30);
  },

  _getHashtags() {
    try {
      const lang = i18n?.getLangue?.() || 'fr';
      return lang === 'en'
        ? this.CONFIG.hashtagsEN
        : this.CONFIG.hashtags;
    } catch(e) {
      return this.CONFIG.hashtags;
    }
  },

  // ════════════════════════════════════════════════════════
  // PARTAGER SUR LES RÉSEAUX
  // ════════════════════════════════════════════════════════
  async partager(templateId, reseau = 'auto', options = {}) {
    Utils.toast('⏳ Génération du visuel...', 'info', 2000);

    try {
      const canvas = await this.generer(templateId, options);
      if (!canvas) return;

      canvas.toBlob(async blob => {
        const tmpl = this.TEMPLATES[templateId];
        const file = new File(
          [blob],
          `powerapp-${templateId}-${Utils.aujourd_hui()}.png`,
          { type:'image/png' }
        );

        switch(reseau) {
          case 'instagram':
            await this._partagerInstagram(file, tmpl);
            break;
          case 'whatsapp':
            await this._partagerWhatsapp(file);
            break;
          case 'telegram':
            await this._partagerTelegram(file);
            break;
          case 'twitter':
            await this._partagerTwitter(file);
            break;
          default:
            await this._partagerAuto(file);
        }
      }, 'image/png');

    } catch(e) {
      console.error('[Social] Erreur partage:', e);
      Utils.toast('❌ Erreur lors du partage', 'error');
    }
  },

  async telecharger(templateId, options = {}) {
    Utils.toast('⏳ Génération...', 'info', 2000);
    try {
      const canvas = await this.generer(templateId, options);
      if (!canvas) return;
      const link    = document.createElement('a');
      link.download = `powerapp-${templateId}-${Utils.aujourd_hui()}.png`;
      link.href     = canvas.toDataURL('image/png');
      link.click();
      Utils.toast('✅ Visuel téléchargé !', 'success');
    } catch(e) {
      Utils.toast('❌ Erreur téléchargement', 'error');
    }
  },

  async _partagerAuto(file) {
    if (navigator.share
        && navigator.canShare?.({ files:[file] })) {
      await navigator.share({
        title: '⚡ PowerApp',
        text:  `${this._getHashtags()}`,
        files: [file]
      });
      Utils.toast('✅ Partagé !', 'success');
    } else {
      // Fallback download
      const link    = document.createElement('a');
      link.download = file.name;
      link.href     = URL.createObjectURL(file);
      link.click();
      Utils.toast('💾 Image téléchargée !', 'success');
    }
  },

  async _partagerInstagram(file, tmpl) {
    // Instagram ne supporte pas le partage direct via API
    // → Télécharger + ouvrir l'app
    const link    = document.createElement('a');
    link.download = file.name;
    link.href     = URL.createObjectURL(file);
    link.click();

    setTimeout(() => {
      Utils.toast(
        '📸 Image téléchargée ! Ouvre Instagram pour la partager.',
        'info', 5000
      );
      window.open(this.CONFIG.instagramUrl, '_blank');
    }, 1000);
  },

  async _partagerWhatsapp(file) {
    if (navigator.share
        && navigator.canShare?.({ files:[file] })) {
      await navigator.share({
        text:  `💪 ${this._getHashtags()}`,
        files: [file]
      });
    } else {
      const texte = encodeURIComponent(
        `💪 Mes stats PowerApp — ${this._getHashtags()}`
      );
      window.open(
        `${this.CONFIG.whatsappUrl}${texte}`,
        '_blank'
      );
    }
  },

  async _partagerTelegram(file) {
    if (navigator.share
        && navigator.canShare?.({ files:[file] })) {
      await navigator.share({ files:[file] });
    } else {
      const url = encodeURIComponent(window.location.href);
      const txt = encodeURIComponent(
        `💪 Mes stats PowerApp ${this._getHashtags()}`
      );
      window.open(
        `${this.CONFIG.telegramUrl}?url=${url}&text=${txt}`,
        '_blank'
      );
    }
  },

  async _partagerTwitter(file) {
    const texte = encodeURIComponent(
      `💪 Ma semaine d'entraînement sur PowerApp ! ${this._getHashtags()}`
    );
    window.open(
      `${this.CONFIG.twitterUrl}?text=${texte}`,
      '_blank'
    );
  },

  // ════════════════════════════════════════════════════════
  // APERÇU
  // ════════════════════════════════════════════════════════
  async afficherApercu(templateId, containerId, options = {}) {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = `
      <div style="text-align:center;padding:var(--space-md);
                  color:var(--text-muted)">
        ⏳ Génération...
      </div>`;

    try {
      const canvas = await this.generer(templateId, options);
      if (!canvas) return;

      const img         = document.createElement('img');
      img.src           = canvas.toDataURL('image/png');
      img.style.cssText = `
        width:100%;
        border-radius:var(--radius-lg);
        display:block`;

      el.innerHTML = '';
      el.appendChild(img);
    } catch(e) {
      el.innerHTML = `
        <div style="color:var(--fd-coral);
                    text-align:center;
                    padding:var(--space-md)">
          ❌ Erreur aperçu
        </div>`;
    }
  },

  // ════════════════════════════════════════════════════════
  // RENDER PAGE SOCIALE
  // ════════════════════════════════════════════════════════
  render(container) {
    if (!container) return;

    const templates = Object.values(this.TEMPLATES);
    const stories   = templates.filter(t => t.format==='9:16');
    const posts     = templates.filter(t => t.format==='1:1');

    // Détecter PRs récents pour stories PR
    let prsRecents = [];
    try {
      const semaine = Utils.debutSemaine(Utils.aujourd_hui());
      prsRecents = Object.entries(Tracker.getAllPRs())
        .filter(([,pr]) => (pr.date||'') >= semaine)
        .slice(0, 3);
    } catch(e) {}

    container.innerHTML = `

      <!-- Header -->
      <div class="card mb-md"
           style="background:linear-gradient(135deg,
                  rgba(255,59,48,0.12),
                  rgba(75,75,249,0.12));
                  border-color:rgba(255,59,48,0.3)">
        <div style="text-align:center">
          <div style="font-size:2rem;margin-bottom:4px">
            📱
          </div>
          <div style="font-weight:700;font-size:1.1rem">
            Partager mes performances
          </div>
          <div style="font-size:.75rem;
                      color:var(--text-muted);
                      margin-top:4px">
            Génère des visuels pro pour tes réseaux sociaux
          </div>
        </div>
      </div>

      <!-- PRs récents à célébrer -->
      ${prsRecents.length > 0 ? `
        <div class="card mb-md"
             style="border-color:var(--fd-lemon);
                    background:rgba(249,239,119,0.06)">
          <div class="card-label"
               style="color:var(--fd-lemon)">
            🏆 Célèbre tes records de la semaine !
          </div>
          ${prsRecents.map(([ref, pr]) => {
            const ex = (window.EXERCICES||{})[ref]||{};
            return `
              <div style="display:flex;
                          justify-content:space-between;
                          align-items:center;
                          padding:var(--space-sm) 0;
                          border-bottom:1px solid
                          var(--border-color)">
                <div>
                  <span style="font-size:.88rem;
                               font-weight:600">
                    ${ex.emoji||'💪'} ${ex.nom||ref}
                  </span>
                  <div style="font-size:.68rem;
                              color:var(--fd-lemon)">
                    ${pr.poids}kg × ${pr.reps}
                    · ~${pr.rm1}kg 1RM
                  </div>
                </div>
                <button onclick="Social._celebrerPR('${ref}')"
                        class="btn-secondary btn-sm"
                        style="font-size:.72rem;
                               border-color:var(--fd-lemon);
                               color:var(--fd-lemon)">
                  🎉 Story
                </button>
              </div>`;
          }).join('')}
        </div>` : ''}

      <!-- Stories Instagram (9:16) -->
      <div class="section-title">📱 Stories (9:16)</div>
      <div style="display:grid;
                  grid-template-columns:repeat(2,1fr);
                  gap:var(--space-md);
                  margin-bottom:var(--space-lg)">
        ${stories.map(tmpl => `
          <div class="card"
               style="text-align:center;cursor:pointer"
               onclick="Social._ouvrirTemplate(
                 '${tmpl.id}')">
            <div style="font-size:2.5rem;
                        margin-bottom:var(--space-sm)">
              ${tmpl.emoji}
            </div>
            <div style="font-weight:700;
                        font-size:.88rem;
                        margin-bottom:4px">
              ${tmpl.nom}
            </div>
            <div style="font-size:.68rem;
                        color:var(--text-muted);
                        margin-bottom:var(--space-sm)">
              ${tmpl.desc}
            </div>
            <div style="font-size:.62rem;
                        color:var(--fd-lavender);
                        font-weight:600">
              ${tmpl.w}×${tmpl.h}px
            </div>
          </div>`).join('')}
      </div>

      <!-- Posts carrés (1:1) -->
      <div class="section-title">🖼️ Posts carrés (1:1)</div>
      <div style="display:grid;
                  grid-template-columns:repeat(2,1fr);
                  gap:var(--space-md);
                  margin-bottom:var(--space-lg)">
        ${posts.map(tmpl => `
          <div class="card"
               style="text-align:center;cursor:pointer"
               onclick="Social._ouvrirTemplate(
                 '${tmpl.id}')">
            <div style="font-size:2.5rem;
                        margin-bottom:var(--space-sm)">
              ${tmpl.emoji}
            </div>
            <div style="font-weight:700;
                        font-size:.88rem;
                        margin-bottom:4px">
              ${tmpl.nom}
            </div>
            <div style="font-size:.68rem;
                        color:var(--text-muted);
                        margin-bottom:var(--space-sm)">
              ${tmpl.desc}
            </div>
            <div style="font-size:.62rem;
                        color:var(--fd-lavender);
                        font-weight:600">
              ${tmpl.w}×${tmpl.h}px
            </div>
          </div>`).join('')}
      </div>

      <!-- Hashtags -->
      <div class="card mb-md">
        <div class="card-label">
          #️⃣ Hashtags recommandés
        </div>
        <div style="margin-top:var(--space-sm);
                    font-size:.82rem;
                    color:var(--fd-indigo);
                    line-height:1.8;
                    word-break:break-all">
          ${this.CONFIG.hashtags}
        </div>
        <button class="btn-secondary mt-md"
                style="font-size:.78rem"
                onclick="Social._copierHashtags()">
          📋 Copier les hashtags
        </button>
      </div>

      <!-- Conseils partage -->
      <div class="card">
        <div class="card-label">💡 Conseils partage</div>
        ${[
          '📱 Stories : format idéal pour Instagram & Facebook',
          '🖼️ Posts : format carré parfait pour le feed',
          '💾 Télécharge d\'abord, puis partage depuis l\'app',
          '🎨 Les visuels sont générés en 1080px — haute qualité',
          '🔁 Partage régulièrement pour inspirer ta communauté'
        ].map(c => `
          <div style="font-size:.78rem;padding:6px 0;
                      border-bottom:1px solid
                      var(--border-color)">
            ${c}
          </div>`).join('')}
      </div>

      <!-- Modal aperçu (caché) -->
      <div id="social-modal-overlay"
           style="display:none;
                  position:fixed;inset:0;z-index:500;
                  background:rgba(0,0,0,0.85);
                  overflow-y:auto;padding:var(--space-lg)"
           onclick="Social._fermerModal(event)">
        <div id="social-modal-inner"
             style="max-width:480px;margin:0 auto;
                    background:var(--bg-card);
                    border-radius:var(--radius-lg);
                    overflow:hidden">
          <div id="social-modal-content"></div>
        </div>
      </div>
    `;
  },

  // ════════════════════════════════════════════════════════
  // MODAL TEMPLATE
  // ════════════════════════════════════════════════════════
  async _ouvrirTemplate(templateId, options = {}) {
    const tmpl   = this.TEMPLATES[templateId];
    if (!tmpl) return;

    const overlay = document.getElementById(
      'social-modal-overlay'
    );
    const content = document.getElementById(
      'social-modal-content'
    );
    if (!overlay || !content) return;

    content.innerHTML = `
      <div style="padding:var(--space-md)">
        <div style="display:flex;
                    justify-content:space-between;
                    align-items:center;
                    margin-bottom:var(--space-md)">
          <div style="font-weight:700">
            ${tmpl.emoji} ${tmpl.nom}
          </div>
          <button onclick="Social._fermerModal()"
                  style="background:none;border:none;
                         font-size:1.2rem;cursor:pointer;
                         color:var(--text-muted)">
            ✕
          </button>
        </div>

        <!-- Aperçu -->
        <div id="social-preview-${templateId}"
             style="width:100%;
                    background:var(--bg-input);
                    border-radius:var(--radius-md);
                    min-height:200px;
                    display:flex;align-items:center;
                    justify-content:center;
                    font-size:.82rem;
                    color:var(--text-muted);
                    margin-bottom:var(--space-md);
                    overflow:hidden">
          ⏳ Génération...
        </div>

        <!-- Réseaux sociaux -->
        <div style="font-size:.72rem;font-weight:700;
                    text-transform:uppercase;
                    letter-spacing:.06em;
                    color:var(--text-muted);
                    margin-bottom:var(--space-sm)">
          Partager sur
        </div>

        <div style="display:grid;
                    grid-template-columns:repeat(2,1fr);
                    gap:var(--space-sm);
                    margin-bottom:var(--space-md)">
          ${[
            {
              id:    'instagram',
              label: '📸 Instagram',
              bg:    'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',
              color: 'white'
            },
            {
              id:    'whatsapp',
              label: '💬 WhatsApp',
              bg:    '#25d366',
              color: 'white'
            },
            {
              id:    'twitter',
              label: '🐦 Twitter/X',
              bg:    '#1da1f2',
              color: 'white'
            },
            {
              id:    'telegram',
              label: '✈️ Telegram',
              bg:    '#0088cc',
              color: 'white'
            }
          ].map(r => `
            <button onclick="Social.partager(
                      '${templateId}','${r.id}')"
                    style="padding:var(--space-md);
                           background:${r.bg};
                           color:${r.color};
                           border:none;
                           border-radius:var(--radius-md);
                           font-size:.82rem;font-weight:700;
                           cursor:pointer">
              ${r.label}
            </button>`).join('')}
        </div>

        <button onclick="Social.telecharger('${templateId}')"
                class="btn-secondary"
                style="width:100%;font-size:.82rem">
          💾 Télécharger
        </button>
      </div>
    `;

    overlay.style.display = 'block';

    // Générer aperçu
    this.afficherApercu(
      templateId,
      `social-preview-${templateId}`,
      options
    );
  },

  _fermerModal(event) {
    const overlay = document.getElementById(
      'social-modal-overlay'
    );
    if (!overlay) return;
    if (!event || event.target === overlay) {
      overlay.style.display = 'none';
    }
  },

  async _celebrerPR(exoRef) {
    await this._ouvrirTemplate(
      'pr_story', { exoRef }
    );
  },

  _copierHashtags() {
    try {
      navigator.clipboard.writeText(this.CONFIG.hashtags);
      Utils.toast('📋 Hashtags copiés !', 'success');
    } catch(e) {
      Utils.toast(
        'Copie manuelle : ' + this.CONFIG.hashtags,
        'info', 5000
      );
    }
  }
};

window.Social = Social;
console.log('✅ Social.js v1.0 chargé');
