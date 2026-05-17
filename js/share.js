/* ============================================================
   FitTracker Pro — Share v3.0
   Cartes stats + Apple Music + YouTube + Partage
   + Carte photos avant/après + Supersets
   ============================================================ */

const Share = {

  // ════════════════════════════════════════════════════════
  // PLAYLISTS
  // ════════════════════════════════════════════════════════
  PLAYLISTS: {
    reprise: {
      nom:         'Motivation Fitness',
      description: 'Pour bien démarrer',
      emoji:       '🌱',
      url:         'https://music.apple.com/fr/search?term=motivation+fitness+workout',
      urlYoutube:  'https://www.youtube.com/results?search_query=motivation+fitness+playlist',
      genre:       'Pop / Urban'
    },
    construction: {
      nom:         'Rap FR Workout',
      description: 'Pour les séances intenses',
      emoji:       '💪',
      url:         'https://music.apple.com/fr/search?term=rap+francais+workout+2024',
      urlYoutube:  'https://www.youtube.com/results?search_query=rap+francais+sport+playlist+2024',
      genre:       'Rap FR'
    },
    intensite: {
      nom:         'Électro Sport',
      description: 'Pour dépasser tes limites',
      emoji:       '🔥',
      url:         'https://music.apple.com/fr/search?term=electro+sport+workout',
      urlYoutube:  'https://www.youtube.com/results?search_query=electro+sport+workout+playlist',
      genre:       'Electronic / EDM'
    },
    peak: {
      nom:         'Hip-Hop Gym',
      description: 'Pour les jours de PR',
      emoji:       '🏆',
      url:         'https://music.apple.com/fr/search?term=hip+hop+gym+workout',
      urlYoutube:  'https://www.youtube.com/results?search_query=hip+hop+gym+workout+playlist',
      genre:       'Hip-Hop'
    },
    jambes: {
      nom:         'Hard Rap FR',
      description: 'Pour les séances jambes',
      emoji:       '🦵',
      url:         'https://music.apple.com/fr/search?term=hard+rap+francais+sport',
      urlYoutube:  'https://www.youtube.com/results?search_query=hard+rap+francais+sport',
      genre:       'Rap Français'
    },
    cardio: {
      nom:         'Dance Cardio Mix',
      description: 'Rythme parfait pour le cardio',
      emoji:       '🚴',
      url:         'https://music.apple.com/fr/search?term=dance+cardio+workout',
      urlYoutube:  'https://www.youtube.com/results?search_query=dance+cardio+workout+playlist',
      genre:       'Dance / Pop'
    },
    repos: {
      nom:         'Chill Récupération',
      description: 'Stretching & récupération',
      emoji:       '😴',
      url:         'https://music.apple.com/fr/search?term=chill+relaxation+stretching',
      urlYoutube:  'https://www.youtube.com/results?search_query=chill+stretching+music+playlist',
      genre:       'Ambient / Chill'
    },
    decharge: {
      nom:         'Lo-Fi Study & Train',
      description: 'Décharge active — concentration',
      emoji:       '🧘',
      url:         'https://music.apple.com/fr/search?term=lofi+hip+hop+study',
      urlYoutube:  'https://www.youtube.com/results?search_query=lofi+hip+hop+study+beats',
      genre:       'Lo-Fi / Ambient'
    }
  },

  // ════════════════════════════════════════════════════════
  // PLAYLIST DU JOUR
  // ════════════════════════════════════════════════════════
  getPlaylistDuJour() {
    try {
      let seance = null, phase = { nom:'Construction' };
      try { seance = Programme.getSeanceduJour?.();  } catch(e) {}
      try { phase  = Programme.getPhaseActuelle?.(); } catch(e) {}

      // Décharge automatique
      try {
        if (Programme.isDecharge?.()) {
          return this.PLAYLISTS.decharge;
        }
      } catch(e) {}

      if (!seance) return this.PLAYLISTS.repos;

      if (seance.id?.includes('jambes'))  return this.PLAYLISTS.jambes;
      if (seance.id?.includes('cardio'))  return this.PLAYLISTS.cardio;
      if (seance.id?.includes('full'))    return this.PLAYLISTS.construction;

      switch(phase.nom) {
        case 'Reprise':      return this.PLAYLISTS.reprise;
        case 'Construction': return this.PLAYLISTS.construction;
        case 'Intensité':    return this.PLAYLISTS.intensite;
        case 'Peak':         return this.PLAYLISTS.peak;
        case 'Décharge':     return this.PLAYLISTS.decharge;
        default:             return this.PLAYLISTS.construction;
      }
    } catch(e) {
      return this.PLAYLISTS.construction;
    }
  },

  // ════════════════════════════════════════════════════════
  // GÉNÉRER CARTE (Canvas 1080×1080)
  // ════════════════════════════════════════════════════════
  async genererCarte(type = 'semaine') {
    const canvas  = document.createElement('canvas');
    canvas.width  = 1080;
    canvas.height = 1080;
    const ctx     = canvas.getContext('2d');

    switch(type) {
      case 'semaine':     await this._carteSemanale(ctx, canvas);  break;
      case 'pr':          await this._cartePR(ctx, canvas);        break;
      case 'streak':      await this._carteStreak(ctx, canvas);    break;
      case 'profil':      await this._carteProfil(ctx, canvas);    break;
      case 'avant_apres': await this._carteAvantApres(ctx, canvas);break;
      default:            await this._carteSemanale(ctx, canvas);
    }

    return canvas;
  },

  // ════════════════════════════════════════════════════════
  // CARTE SEMAINE
  // ════════════════════════════════════════════════════════
  async _carteSemanale(ctx, canvas) {
    const W = canvas.width;
    const H = canvas.height;

    let profil   = { nom:'Athlète', avatar:'💪' };
    let seances  = 0, volume = 0;
    let streak   = { count:0, max:0 };
    let xp       = { total:0, pourcentage:0, niveau:{ emoji:'💪', numero:1, nom:'Débutant' } };
    let phase    = { nom:'Reprise', couleur:'#8bf0bb', emoji:'🌱' };
    let prs      = 0;
    let comp     = { delta:0 };

    try { profil  = Tracker.getProfil();                  } catch(e) {}
    try { seances = Tracker.getSeancesParSemaine();       } catch(e) {}
    try { volume  = Tracker.getVolumeSemaine();           } catch(e) {}
    try { streak  = Tracker.getStreak();                  } catch(e) {}
    try { xp      = Gamification.getXP();                } catch(e) {}
    try { phase   = Programme.getPhaseActuelle();        } catch(e) {}
    try { prs     = Object.keys(Tracker.getAllPRs()).length; } catch(e) {}
    try { comp    = Tracker.getComparaisonSemaines();    } catch(e) {}

    // ── Fond
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0,   '#09092d');
    grad.addColorStop(0.5, '#1a1a4e');
    grad.addColorStop(1,   '#09092d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Cercles déco
    this._drawCircle(ctx, -100, -100, 400, 'rgba(75,75,249,0.08)');
    this._drawCircle(ctx, W+100, H+100, 500, 'rgba(75,75,249,0.06)');
    this._drawCircle(ctx, W/2, H/2, 600, 'rgba(75,75,249,0.03)');

    // Grille points
    ctx.fillStyle = 'rgba(75,75,249,0.15)';
    for (let x = 40; x < W; x += 40)
      for (let y = 40; y < H; y += 40) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI*2);
        ctx.fill();
      }

    // Header
    ctx.fillStyle = '#4b4bf9';
    this._roundRect(ctx, 60, 60, 200, 56, 28);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 22px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ PowerApp', 160, 95);

    // Phase badge
    ctx.fillStyle   = (phase.couleur||'#8bf0bb') + '33';
    this._roundRect(ctx, W-280, 60, 220, 56, 28);
    ctx.fill();
    ctx.strokeStyle = phase.couleur||'#8bf0bb';
    ctx.lineWidth   = 2;
    this._roundRect(ctx, W-280, 60, 220, 56, 28);
    ctx.stroke();
    ctx.fillStyle = phase.couleur||'#8bf0bb';
    ctx.font      = 'bold 20px system-ui';
    ctx.fillText(`${phase.emoji||'🌱'} ${phase.nom}`, W-170, 95);

    // Titre
    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 72px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Ma Semaine', W/2, 220);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font      = '32px system-ui';
    ctx.fillText(
      `${profil.nom} · ${Utils.formatDateCourt(
        Utils.debutSemaine(Utils.aujourd_hui())
      )}`,
      W/2, 270
    );

    // Ligne séparatrice
    const lineGrad = ctx.createLinearGradient(60, 0, W-60, 0);
    lineGrad.addColorStop(0,   'transparent');
    lineGrad.addColorStop(0.5, '#4b4bf9');
    lineGrad.addColorStop(1,   'transparent');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(60, 310);
    ctx.lineTo(W-60, 310);
    ctx.stroke();

    // Stats cards
    const stats = [
      { label:'Séances', val:`${seances}`,                emoji:'📅', color:'#4b4bf9' },
      { label:'Volume',  val:Utils.formatVolume(volume),  emoji:'🏋️', color:'#8bf0bb' },
      { label:'Streak',  val:`${streak.count}🔥`,         emoji:'⚡', color:'#f9ef77' },
      { label:'Records', val:`${prs}`,                    emoji:'🏆', color:'#bfa1ff' }
    ];

    const cardW  = 220;
    const cardH  = 220;
    const startX = (W - (cardW*4 + 30*3)) / 2;

    stats.forEach((stat, i) => {
      const x = startX + i * (cardW + 30);
      const y = 350;

      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      this._roundRect(ctx, x, y, cardW, cardH, 24);
      ctx.fill();

      ctx.strokeStyle = stat.color + '44';
      ctx.lineWidth   = 2;
      this._roundRect(ctx, x, y, cardW, cardH, 24);
      ctx.stroke();

      ctx.font      = '48px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(stat.emoji, x + cardW/2, y + 72);

      ctx.fillStyle = stat.color;
      ctx.font      = 'bold 52px system-ui';
      ctx.fillText(stat.val, x + cardW/2, y + 140);

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font      = '24px system-ui';
      ctx.fillText(stat.label, x + cardW/2, y + 185);
    });

    // Delta volume vs S-1
    const deltaColor = (comp.delta||0) >= 0 ? '#8bf0bb' : '#ff8d96';
    ctx.fillStyle = deltaColor;
    ctx.font      = 'bold 28px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${(comp.delta||0) >= 0 ? '+' : ''}${comp.delta||0}% vs semaine précédente`,
      W/2, 600
    );

    // XP Bar
    const xpY = 640;
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    this._roundRect(ctx, 60, xpY, W-120, 100, 20);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 32px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(
      `${xp.niveau.emoji} Niv.${xp.niveau.numero} — ${xp.niveau.nom}`,
      100, xpY + 42
    );

    ctx.fillStyle = '#f9ef77';
    ctx.font      = 'bold 32px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(`${xp.total} XP`, W-100, xpY + 42);

    const bX = 100, bY = xpY + 65;
    const bW = W - 200, bH = 16;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    this._roundRect(ctx, bX, bY, bW, bH, 8);
    ctx.fill();

    const xpFill = ctx.createLinearGradient(bX, 0, bX+bW, 0);
    xpFill.addColorStop(0, '#4b4bf9');
    xpFill.addColorStop(1, '#f9ef77');
    ctx.fillStyle = xpFill;
    this._roundRect(
      ctx, bX, bY,
      Math.max(20, bW * (xp.pourcentage/100)), bH, 8
    );
    ctx.fill();

    // Heatmap 7j
    const hmY     = 785;
    const hmCellW = 100;
    const hmCellH = 80;
    const hmStartX = (W - (7*hmCellW + 6*12)) / 2;
    const jours   = ['L','M','M','J','V','S','D'];

    let heatmap = {};
    try { heatmap = Tracker.getHeatmapData(7); } catch(e) {}

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font      = '22px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Cette semaine', W/2, hmY - 20);

    for (let i = 6; i >= 0; i--) {
      const date  = Utils.ajouterJours(Utils.aujourd_hui(), -i);
      const etat  = heatmap[date] || 'none';
      const idx   = 6 - i;
      const x     = hmStartX + idx * (hmCellW + 12);
      const y     = hmY;

      ctx.fillStyle =
        etat === 'done'   ? '#4b4bf9' :
        etat === 'missed' ? 'rgba(255,141,150,0.4)' :
        etat === 'rest'   ? 'rgba(139,240,187,0.2)' :
                            'rgba(255,255,255,0.06)';
      this._roundRect(ctx, x, y, hmCellW, hmCellH, 12);
      ctx.fill();

      ctx.fillStyle = etat === 'done'
        ? '#ffffff' : 'rgba(255,255,255,0.5)';
      ctx.font      = 'bold 24px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(jours[idx], x + hmCellW/2, y + 30);

      ctx.font = '28px system-ui';
      ctx.fillText(
        etat === 'done'   ? '✅' :
        etat === 'missed' ? '❌' :
        etat === 'rest'   ? '😴' : '·',
        x + hmCellW/2, y + 62
      );
    }

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font      = '22px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(
      'PowerApp · EverGPT · ' + Utils.aujourd_hui(),
      W/2, H - 40
    );
  },

  // ════════════════════════════════════════════════════════
  // CARTE PR
  // ════════════════════════════════════════════════════════
  async _cartePR(ctx, canvas) {
    const W = canvas.width;
    const H = canvas.height;

    let profil = { nom:'Athlète' };
    let prs    = {};

    try { profil = Tracker.getProfil();  } catch(e) {}
    try { prs    = Tracker.getAllPRs();  } catch(e) {}

    const top = Object.entries(prs)
      .filter(([,v]) => (v.rm1||0) > 0)
      .sort(([,a],[,b]) => (b.rm1||0) - (a.rm1||0))
      .slice(0, 3);

    // Fond doré
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0,   '#1a1200');
    grad.addColorStop(0.5, '#2a1f00');
    grad.addColorStop(1,   '#09092d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    this._drawCircle(ctx, W/2, H/2, 500, 'rgba(249,239,119,0.05)');
    this._drawCircle(ctx, W/2, 200, 300, 'rgba(249,239,119,0.08)');

    // Titre
    ctx.fillStyle = '#f9ef77';
    ctx.font      = 'bold 42px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 MES RECORDS PERSONNELS', W/2, 120);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font      = '30px system-ui';
    ctx.fillText(profil.nom, W/2, 170);

    if (top.length === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font      = '36px system-ui';
      ctx.fillText('Lance tes séances pour voir tes records !', W/2, H/2);
    } else {
      const medals = ['🥇','🥈','🥉'];

      top.forEach(([ref, pr], i) => {
        const ex = (window.EXERCICES||{})[ref] || {};
        const y  = 230 + i * 240;

        const cGrad = ctx.createLinearGradient(60, y, W-60, y+210);
        cGrad.addColorStop(0, i===0
          ? 'rgba(249,239,119,0.15)' : 'rgba(255,255,255,0.05)');
        cGrad.addColorStop(1, 'rgba(75,75,249,0.05)');

        ctx.fillStyle = cGrad;
        this._roundRect(ctx, 60, y, W-120, 210, 24);
        ctx.fill();

        ctx.strokeStyle = i === 0
          ? 'rgba(249,239,119,0.5)' : 'rgba(255,255,255,0.1)';
        ctx.lineWidth   = 2;
        this._roundRect(ctx, 60, y, W-120, 210, 24);
        ctx.stroke();

        ctx.font      = '60px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText(medals[i], 100, y + 92);

        ctx.fillStyle = '#ffffff';
        ctx.font      = 'bold 38px system-ui';
        ctx.fillText(`${ex.emoji||'💪'} ${ex.nom||ref}`, 180, y + 72);

        ctx.fillStyle = '#f9ef77';
        ctx.font      = 'bold 50px system-ui';
        ctx.textAlign = 'right';
        ctx.fillText(`${pr.poids}kg × ${pr.reps}`, W-100, y + 82);

        ctx.fillStyle = '#bfa1ff';
        ctx.font      = '30px system-ui';
        ctx.fillText(`~${pr.rm1}kg 1RM`, W-100, y + 130);

        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font      = '24px system-ui';
        ctx.fillText(pr.date||'', W-100, y + 175);
      });
    }

    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font      = '22px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('PowerApp · EverGPT', W/2, H - 40);
  },

  // ════════════════════════════════════════════════════════
  // CARTE STREAK
  // ════════════════════════════════════════════════════════
  async _carteStreak(ctx, canvas) {
    const W = canvas.width;
    const H = canvas.height;

    let streak = { count:0, max:0 };
    let profil = { nom:'Athlète' };
    let xp     = { total:0, niveau:{ emoji:'💪', numero:1, nom:'Débutant' } };

    try { streak = Tracker.getStreak();   } catch(e) {}
    try { profil = Tracker.getProfil();   } catch(e) {}
    try { xp     = Gamification.getXP(); } catch(e) {}

    // Fond feu
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0,   '#1a0500');
    grad.addColorStop(0.5, '#2a0f00');
    grad.addColorStop(1,   '#09092d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    this._drawCircle(ctx, W/2, H/2, 600, 'rgba(255,141,50,0.06)');

    // Grande flamme
    ctx.font      = '200px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('🔥', W/2, 400);

    // Nombre
    ctx.fillStyle = '#ff8d00';
    ctx.font      = 'bold 160px system-ui';
    ctx.fillText(`${streak.count}`, W/2, 620);

    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 52px system-ui';
    ctx.fillText('JOURS CONSÉCUTIFS', W/2, 700);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font      = '32px system-ui';
    ctx.fillText(profil.nom, W/2, 770);

    ctx.fillStyle = '#f9ef77';
    ctx.font      = '28px system-ui';
    ctx.fillText(
      `🏆 Record personnel : ${streak.max} jours`,
      W/2, 840
    );

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font      = '26px system-ui';
    ctx.fillText(
      `${xp.niveau.emoji} ${xp.niveau.nom} · ${xp.total} XP`,
      W/2, 920
    );

    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font      = '22px system-ui';
    ctx.fillText('PowerApp · EverGPT', W/2, H - 40);
  },

  // ════════════════════════════════════════════════════════
  // CARTE PROFIL
  // ════════════════════════════════════════════════════════
  async _carteProfil(ctx, canvas) {
    const W = canvas.width;
    const H = canvas.height;

    let profil   = { nom:'Athlète', avatar:'💪' };
    let xp       = { total:0, pourcentage:0, niveau:{ emoji:'💪', numero:1, nom:'Débutant' } };
    let streak   = { count:0, max:0 };
    let total    = 0, prs = 0, trophees = 0;
    let infos    = { label:'S1', cycle:1, phase:{ emoji:'🌱' } };

    try { profil   = Tracker.getProfil();                      } catch(e) {}
    try { xp       = Gamification.getXP();                    } catch(e) {}
    try { streak   = Tracker.getStreak();                      } catch(e) {}
    try { total    = Tracker.getTotalSeances();                } catch(e) {}
    try { prs      = Object.keys(Tracker.getAllPRs()).length;  } catch(e) {}
    try { trophees = Gamification.getTrophees()
            .filter(t => t.debloquee).length;                  } catch(e) {}
    try { infos    = Programme.getInfosProgramme();            } catch(e) {}

    // Fond
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#09092d');
    grad.addColorStop(1, '#1a1a4e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    this._drawCircle(ctx, W/2, 300, 500, 'rgba(75,75,249,0.08)');

    // Avatar
    ctx.fillStyle = '#4b4bf9';
    ctx.beginPath();
    ctx.arc(W/2, 220, 120, 0, Math.PI*2);
    ctx.fill();

    ctx.font      = '100px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(profil.avatar||'💪', W/2, 260);

    // Nom
    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 56px system-ui';
    ctx.fillText(profil.nom||'Athlète', W/2, 390);

    // Niveau
    ctx.fillStyle = '#f9ef77';
    ctx.font      = 'bold 32px system-ui';
    ctx.fillText(
      `${xp.niveau.emoji} Niveau ${xp.niveau.numero} — ${xp.niveau.nom}`,
      W/2, 450
    );

    // XP Bar
    const bX = 140, bY = 480, bW = W-280;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    this._roundRect(ctx, bX, bY, bW, 20, 10);
    ctx.fill();

    const xpGrad = ctx.createLinearGradient(bX, 0, bX+bW, 0);
    xpGrad.addColorStop(0, '#4b4bf9');
    xpGrad.addColorStop(1, '#f9ef77');
    ctx.fillStyle = xpGrad;
    this._roundRect(
      ctx, bX, bY,
      Math.max(20, bW*(xp.pourcentage/100)), 20, 10
    );
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font      = '22px system-ui';
    ctx.fillText(`${xp.total} XP`, W/2, bY + 50);

    // Stats grid
    const gridS = [
      { label:'Séances',  val:total,       color:'#4b4bf9', emoji:'📅' },
      { label:'Streak',   val:streak.count,color:'#f9ef77', emoji:'🔥' },
      { label:'Records',  val:prs,         color:'#bfa1ff', emoji:'🏆' },
      { label:'Trophées', val:trophees,    color:'#8bf0bb', emoji:'🎖️' }
    ];

    const gW = 220, gStartX = (W-(gW*4+24*3))/2;

    gridS.forEach((s, i) => {
      const x = gStartX + i*(gW+24);
      const y = 580;

      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      this._roundRect(ctx, x, y, gW, 180, 20);
      ctx.fill();

      ctx.strokeStyle = s.color + '33';
      ctx.lineWidth   = 2;
      this._roundRect(ctx, x, y, gW, 180, 20);
      ctx.stroke();

      ctx.font      = '44px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(s.emoji, x+gW/2, y+60);

      ctx.fillStyle = s.color;
      ctx.font      = 'bold 52px system-ui';
      ctx.fillText(`${s.val}`, x+gW/2, y+125);

      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font      = '22px system-ui';
      ctx.fillText(s.label, x+gW/2, y+162);
    });

    // Programme info
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    this._roundRect(ctx, 60, 810, W-120, 100, 20);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 30px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${infos.phase?.emoji||'🌱'} ${infos.label} · Cycle ${infos.cycle}`,
      W/2, 872
    );

    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font      = '22px system-ui';
    ctx.fillText('PowerApp · EverGPT', W/2, H-40);
  },

  // ════════════════════════════════════════════════════════
  // CARTE AVANT / APRÈS
  // ════════════════════════════════════════════════════════
  async _carteAvantApres(ctx, canvas) {
    const W = canvas.width;
    const H = canvas.height;

    let photos = [], profil = { nom:'Athlète' };
    try { photos = Tracker.getPhotos?.() || []; } catch(e) {}
    try { profil = Tracker.getProfil();          } catch(e) {}

    // Fond
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#09092d');
    grad.addColorStop(1, '#1a0030');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    this._drawCircle(ctx, W/2, H/2, 500, 'rgba(191,161,255,0.05)');

    // Titre
    ctx.fillStyle = '#bfa1ff';
    ctx.font      = 'bold 52px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('📸 MA PROGRESSION', W/2, 100);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font      = '28px system-ui';
    ctx.fillText(profil.nom||'', W/2, 150);

    if (photos.length >= 2) {
      // Avant
      const avant = photos[photos.length - 1];
      const apres = photos[0];

      const phW = 460;
      const phH = 600;
      const phY = 200;

      // Charger images
      const loadImg = (src) => new Promise((res, rej) => {
        const img = new Image();
        img.onload  = () => res(img);
        img.onerror = () => res(null);
        img.src     = src;
      });

      const [imgAvant, imgApres] = await Promise.all([
        loadImg(avant.image),
        loadImg(apres.image)
      ]);

      // Zone avant
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      this._roundRect(ctx, 40, phY, phW, phH, 20);
      ctx.fill();

      if (imgAvant) {
        ctx.save();
        ctx.beginPath();
        this._roundRect(ctx, 40, phY, phW, phH, 20);
        ctx.clip();
        // Centrer et couvrir
        const ratio = Math.max(phW/imgAvant.width, phH/imgAvant.height);
        const dW = imgAvant.width * ratio;
        const dH = imgAvant.height * ratio;
        ctx.drawImage(
          imgAvant,
          40 + (phW-dW)/2, phY + (phH-dH)/2,
          dW, dH
        );
        ctx.restore();
      }

      // Label AVANT
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      this._roundRect(ctx, 40, phY+phH-60, phW, 60, 0);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font      = 'bold 32px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('AVANT', 40+phW/2, phY+phH-20);

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font      = '22px system-ui';
      ctx.fillText(avant.date||'', 40+phW/2, phY+phH+30);

      // Zone après
      ctx.fillStyle = 'rgba(75,75,249,0.1)';
      this._roundRect(ctx, W-40-phW, phY, phW, phH, 20);
      ctx.fill();

      if (imgApres) {
        ctx.save();
        ctx.beginPath();
        this._roundRect(ctx, W-40-phW, phY, phW, phH, 20);
        ctx.clip();
        const ratio = Math.max(phW/imgApres.width, phH/imgApres.height);
        const dW = imgApres.width * ratio;
        const dH = imgApres.height * ratio;
        ctx.drawImage(
          imgApres,
          W-40-phW + (phW-dW)/2, phY + (phH-dH)/2,
          dW, dH
        );
        ctx.restore();
      }

      // Bordure photo après
      ctx.strokeStyle = '#4b4bf9';
      ctx.lineWidth   = 4;
      this._roundRect(ctx, W-40-phW, phY, phW, phH, 20);
      ctx.stroke();

      // Label MAINTENANT
      ctx.fillStyle = '#4b4bf9';
      this._roundRect(ctx, W-40-phW, phY+phH-60, phW, 60, 0);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font      = 'bold 32px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('MAINTENANT', W-40-phW+phW/2, phY+phH-20);

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font      = '22px system-ui';
      ctx.fillText(apres.date||'', W-40-phW+phW/2, phY+phH+30);

      // Flèche centrale
      ctx.fillStyle = '#f9ef77';
      ctx.font      = '60px system-ui';
      ctx.fillText('→', W/2, phY+phH/2);

      // Delta jours
      try {
        const diff = Utils.diffJours(avant.date, apres.date);
        if (diff > 0) {
          ctx.fillStyle = '#f9ef77';
          ctx.font      = 'bold 28px system-ui';
          ctx.fillText(`${diff} jours de progression`, W/2, phY+phH+80);
        }
      } catch(e) {}

    } else {
      // Pas assez de photos
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font      = '36px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(
        'Ajoute des photos dans Stats > Photos',
        W/2, H/2
      );
    }

    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font      = '22px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('PowerApp · EverGPT', W/2, H-40);
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

  _drawCircle(ctx, x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();
  },

  // ════════════════════════════════════════════════════════
  // TÉLÉCHARGER
  // ════════════════════════════════════════════════════════
  async telecharger(type = 'semaine') {
    Utils.toast('⏳ Génération en cours...', 'info', 2000);
    try {
      const canvas = await this.genererCarte(type);
      const link   = document.createElement('a');
      link.download = `powerapp-${type}-${Utils.aujourd_hui()}.png`;
      link.href     = canvas.toDataURL('image/png');
      link.click();
      Utils.toast('✅ Carte téléchargée !', 'success');
    } catch(e) {
      console.error('[Share] Erreur téléchargement:', e);
      Utils.toast('❌ Erreur génération', 'error');
    }
  },

  // ════════════════════════════════════════════════════════
  // PARTAGER (Web Share API)
  // ════════════════════════════════════════════════════════
  async partager(type = 'semaine') {
    Utils.toast('⏳ Préparation...', 'info', 2000);
    try {
      const canvas = await this.genererCarte(type);

      canvas.toBlob(async blob => {
        const file = new File(
          [blob],
          `powerapp-${type}.png`,
          { type:'image/png' }
        );

        if (navigator.share
            && navigator.canShare?.({ files:[file] })) {
          await navigator.share({
            title: '⚡ PowerApp',
            text:  `Mes stats fitness — ${Utils.aujourd_hui()}`,
            files: [file]
          });
          Utils.toast('✅ Partagé !', 'success');
        } else {
          // Fallback → téléchargement
          const link    = document.createElement('a');
          link.download = `powerapp-${type}.png`;
          link.href     = URL.createObjectURL(blob);
          link.click();
          Utils.toast('💾 Image téléchargée !', 'success');
        }
      }, 'image/png');

    } catch(e) {
      console.error('[Share] Erreur partage:', e);
      Utils.toast('❌ Erreur partage', 'error');
    }
  },

  // ════════════════════════════════════════════════════════
  // RENDER PAGE PARTAGE
  // ════════════════════════════════════════════════════════
  render(container) {
    if (!container) return;

    let playlist = this.PLAYLISTS.construction;
    let phase    = { nom:'Construction', emoji:'🏗️' };
    let hasPhotos = false;

    try { playlist  = this.getPlaylistDuJour();        } catch(e) {}
    try { phase     = Programme.getPhaseActuelle();    } catch(e) {}
    try { hasPhotos = (Tracker.getPhotos?.()?.length||0) >= 2; } catch(e) {}

    const cartes = [
      {
        type:'semaine',
        emoji:'📅',
        titre:'Résumé semaine',
        desc:'Séances, volume, streak, heatmap'
      },
      {
        type:'pr',
        emoji:'🏆',
        titre:'Mes records',
        desc:'Top 3 exercices + 1RM estimé'
      },
      {
        type:'streak',
        emoji:'🔥',
        titre:'Mon streak',
        desc:'Jours consécutifs + record'
      },
      {
        type:'profil',
        emoji:'👤',
        titre:'Mon profil',
        desc:'Niveau, XP, trophées, stats'
      },
      {
        type:'avant_apres',
        emoji:'📸',
        titre:'Avant / Après',
        desc:hasPhotos
          ? 'Progression photos'
          : '⚠️ Ajoute 2 photos dans Stats > Photos'
      }
    ];

    container.innerHTML = `

      <!-- Apple Music + YouTube -->
      <div class="card mb-md"
           style="background:linear-gradient(135deg,
                  rgba(250,40,40,0.12),
                  rgba(75,75,249,0.12));
                  border-color:rgba(250,40,40,0.35)">
        <div class="card-label" style="color:#ff3b30">
          🎵 Playlist du jour
        </div>

        <div style="margin-top:var(--space-md)">
          <div style="font-size:2rem;margin-bottom:4px">
            ${playlist.emoji}
          </div>
          <div style="font-weight:700;font-size:1.1rem">
            ${playlist.nom}
          </div>
          <div style="font-size:.78rem;color:var(--text-muted);
                      margin-top:4px">
            ${playlist.description} · ${playlist.genre}
          </div>
          <div style="font-size:.72rem;color:var(--fd-lavender);
                      margin-top:4px">
            📍 Phase ${phase.nom} ${phase.emoji}
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;
                    gap:var(--space-sm);
                    margin-top:var(--space-md)">
          <a href="${playlist.url}" target="_blank" rel="noopener"
             style="display:flex;align-items:center;
                    justify-content:center;gap:6px;
                    padding:var(--space-md);
                    background:#ff3b30;color:white;
                    border-radius:var(--radius-full);
                    font-weight:700;font-size:.82rem;
                    text-decoration:none">
            🍎 Apple Music
          </a>
          <a href="${playlist.urlYoutube}" target="_blank"
             rel="noopener"
             style="display:flex;align-items:center;
                    justify-content:center;gap:6px;
                    padding:var(--space-md);
                    background:#ff0000;color:white;
                    border-radius:var(--radius-full);
                    font-weight:700;font-size:.82rem;
                    text-decoration:none">
            ▶ YouTube
          </a>
        </div>

        <!-- Toutes les playlists -->
        <details style="margin-top:var(--space-md)">
          <summary style="font-size:.75rem;font-weight:700;
                          color:var(--text-muted);
                          cursor:pointer;
                          text-transform:uppercase;
                          letter-spacing:.06em">
            Toutes les playlists (${Object.keys(this.PLAYLISTS).length})
          </summary>
          <div style="margin-top:var(--space-sm)">
            ${Object.entries(this.PLAYLISTS).map(([, pl]) => `
              <div style="display:flex;align-items:center;
                          justify-content:space-between;
                          padding:var(--space-sm) 0;
                          border-bottom:1px solid var(--border-color)">
                <div>
                  <span style="font-size:.85rem;font-weight:600">
                    ${pl.emoji} ${pl.nom}
                  </span>
                  <span style="font-size:.68rem;
                               color:var(--text-muted);
                               margin-left:6px">
                    ${pl.genre}
                  </span>
                </div>
                <div style="display:flex;gap:8px">
                  <a href="${pl.url}"
                     target="_blank" rel="noopener"
                     style="font-size:.78rem;color:#ff3b30;
                            text-decoration:none;
                            font-weight:700">🍎</a>
                  <a href="${pl.urlYoutube}"
                     target="_blank" rel="noopener"
                     style="font-size:.78rem;color:#ff0000;
                            text-decoration:none;
                            font-weight:700">▶</a>
                </div>
              </div>`).join('')}
          </div>
        </details>
      </div>

      <!-- Cartes partage -->
      <div class="section-title">📸 Partager mes stats</div>

      ${cartes.map(carte => `
        <div class="card mb-md">
          <div class="flex items-center gap-md mb-md">
            <div style="font-size:2rem">${carte.emoji}</div>
            <div>
              <div style="font-weight:700">${carte.titre}</div>
              <div style="font-size:.75rem;
                          color:var(--text-muted)">
                ${carte.desc}
              </div>
            </div>
          </div>

          <!-- Zone aperçu -->
          <div id="preview-${carte.type}"
               style="width:100%;height:160px;
                      background:var(--bg-input);
                      border-radius:var(--radius-md);
                      display:flex;align-items:center;
                      justify-content:center;
                      font-size:.82rem;
                      color:var(--text-muted);
                      margin-bottom:var(--space-md);
                      overflow:hidden;
                      cursor:pointer;
                      transition:opacity .2s"
               onclick="Share.afficherApercu('${carte.type}')">
            👆 Cliquer pour aperçu
          </div>

          <div style="display:grid;
                      grid-template-columns:1fr 1fr;
                      gap:var(--space-sm)">
            <button onclick="Share.telecharger('${carte.type}')"
                    class="btn-secondary"
                    style="font-size:.82rem">
              💾 Télécharger
            </button>
            <button onclick="Share.partager('${carte.type}')"
                    class="btn-primary"
                    style="font-size:.82rem">
              📤 Partager
            </button>
          </div>
        </div>`).join('')}
    `;
  },

  // ════════════════════════════════════════════════════════
  // APERÇU
  // ════════════════════════════════════════════════════════
  async afficherApercu(type) {
    const el = document.getElementById(`preview-${type}`);
    if (!el) return;

    el.innerHTML = `
      <div style="color:var(--text-muted)">⏳ Génération...</div>`;
    el.style.opacity = '.7';

    try {
      const canvas = await this.genererCarte(type);
      const img    = document.createElement('img');
      img.src      = canvas.toDataURL('image/png');
      img.style.cssText =
        'width:100%;height:100%;object-fit:cover;border-radius:8px';
      el.innerHTML  = '';
      el.style.opacity = '1';
      el.appendChild(img);
    } catch(e) {
      el.innerHTML = `
        <div style="color:var(--fd-coral)">
          ❌ Erreur aperçu
        </div>`;
      el.style.opacity = '1';
    }
  }
};

window.Share = Share;
console.log('✅ Share v3.0 chargé');
