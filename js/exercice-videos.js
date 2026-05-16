/* ============================================================
   FitTracker Pro — Exercice Videos
   YouTube thumbnails + vidéos démo pour chaque exercice
   Chaînes : Jeff Nippard, Athlean-X, Alan Thrall, RP Strength
   ============================================================ */

const ExerciceVideos = {

  // ─── Base de données vidéos ───────────────────────────────
  // Format : { id, titre, chaine, debut }
  // debut = timestamp de départ (secondes) pour aller direct au bon moment

  VIDEOS: {

    // ══════════════════════════════════════════════════════
    // PECTORAUX
    // ══════════════════════════════════════════════════════

    bench_press: {
      id:     'vcBig73ojpE',
      titre:  'Développé couché — Technique parfaite',
      chaine: 'Jeff Nippard',
      debut:  0
    },
    incline_halteres: {
      id:     'QsYre__-aro',
      titre:  'Incliné haltères — Technique',
      chaine: 'Jeff Nippard',
      debut:  0
    },
    chest_press_machine: {
      id:     'xUm0BiZCWlQ',
      titre:  'Presse pectoraux machine',
      chaine: 'Athlean-X',
      debut:  0
    },
    ecarte_poulie: {
      id:     'Iwe6AmxVf7o',
      titre:  'Écarté poulie — Cable fly',
      chaine: 'Jeff Nippard',
      debut:  0
    },
    dips: {
      id:     'yN6TQRqDaA0',
      titre:  'Dips — Technique complète',
      chaine: 'Athlean-X',
      debut:  0
    },
    pompes: {
      id:     'IODxDxX7oi4',
      titre:  'Pompes — Technique parfaite',
      chaine: 'Jeff Nippard',
      debut:  0
    },

    // ══════════════════════════════════════════════════════
    // DOS
    // ══════════════════════════════════════════════════════

    tractions: {
      id:     'eGo4IYlbE5g',
      titre:  'Tractions — Technique complète',
      chaine: 'Jeff Nippard',
      debut:  0
    },
    rowing_barre: {
      id:     'FWJR5Ve8bnQ',
      titre:  'Rowing barre — Technique',
      chaine: 'Alan Thrall',
      debut:  0
    },
    lat_pulldown: {
      id:     'CAwf7n6Tuhs',
      titre:  'Tirage vertical — Technique',
      chaine: 'Jeff Nippard',
      debut:  0
    },
    rowing_machine: {
      id:     'GZbfZ033f74',
      titre:  'Rowing machine — Technique',
      chaine: 'Athlean-X',
      debut:  0
    },
    soulevé_terre: {
      id:     'op9kVnSso6Q',
      titre:  'Soulevé de terre — Technique',
      chaine: 'Alan Thrall',
      debut:  0
    },
    pullover: {
      id:     'FK4rHfGTSaE',
      titre:  'Pullover haltère — Technique',
      chaine: 'Athlean-X',
      debut:  0
    },

    // ══════════════════════════════════════════════════════
    // ÉPAULES
    // ══════════════════════════════════════════════════════

    dev_militaire: {
      id:     'qEwKCR5JCog',
      titre:  'Développé militaire — Technique',
      chaine: 'Jeff Nippard',
      debut:  0
    },
    elev_laterales: {
      id:     'kDqklk1ZESo',
      titre:  'Élévations latérales — Technique',
      chaine: 'Jeff Nippard',
      debut:  0
    },
    shoulder_press_machine: {
      id:     'Wqq43dKW1TU',
      titre:  'Presse épaules machine',
      chaine: 'Athlean-X',
      debut:  0
    },
    face_pull: {
      id:     'rep-qVOkqgk',
      titre:  'Face pull — Technique parfaite',
      chaine: 'Athlean-X',
      debut:  0
    },
    oiseau: {
      id:     'ttvoBvDOjGQ',
      titre:  'Oiseau haltères — Technique',
      chaine: 'Jeff Nippard',
      debut:  0
    },

    // ══════════════════════════════════════════════════════
    // BICEPS
    // ══════════════════════════════════════════════════════

    curl_halteres: {
      id:     '6Q6knRxaBlE',
      titre:  'Curl haltères — Technique',
      chaine: 'Jeff Nippard',
      debut:  0
    },
    curl_barre: {
      id:     'kwG2ipFRgfo',
      titre:  'Curl barre — Technique',
      chaine: 'Athlean-X',
      debut:  0
    },
    curl_marteau: {
      id:     'TwD-YGVP4Bk',
      titre:  'Curl marteau — Technique',
      chaine: 'Jeff Nippard',
      debut:  0
    },
    curl_machine: {
      id:     'soxrZlIl35U',
      titre:  'Curl machine — Technique',
      chaine: 'Athlean-X',
      debut:  0
    },

    // ══════════════════════════════════════════════════════
    // TRICEPS
    // ══════════════════════════════════════════════════════

    ext_triceps_poulie: {
      id:     'vB5OHsJ3EME',
      titre:  'Extension triceps poulie',
      chaine: 'Jeff Nippard',
      debut:  0
    },
    barre_front: {
      id:     'd_KZxkY_5cM',
      titre:  'Skull crusher — Technique',
      chaine: 'Jeff Nippard',
      debut:  0
    },
    dips_triceps: {
      id:     'yN6TQRqDaA0',
      titre:  'Dips triceps — Technique',
      chaine: 'Athlean-X',
      debut:  0
    },

    // ══════════════════════════════════════════════════════
    // JAMBES
    // ══════════════════════════════════════════════════════

    squat: {
      id:     'ultWZbUMPL8',
      titre:  'Squat — Technique parfaite',
      chaine: 'Alan Thrall',
      debut:  0
    },
    presse_cuisses: {
      id:     'IZxyjW7MPJQ',
      titre:  'Presse cuisses — Technique',
      chaine: 'Jeff Nippard',
      debut:  0
    },
    fentes: {
      id:     'D7KaRcUTQeE',
      titre:  'Fentes — Technique complète',
      chaine: 'Jeff Nippard',
      debut:  0
    },
    leg_curl: {
      id:     'ELOCsoDSmrg',
      titre:  'Leg curl — Technique',
      chaine: 'Jeff Nippard',
      debut:  0
    },
    leg_extension: {
      id:     'YyvSfVjQeL0',
      titre:  'Leg extension — Technique',
      chaine: 'Athlean-X',
      debut:  0
    },
    mollets: {
      id:     'JbyjNymZOt0',
      titre:  'Mollets — Technique',
      chaine: 'Jeff Nippard',
      debut:  0
    },
    hip_thrust: {
      id:     'SEdqd1n0cvg',
      titre:  'Hip thrust — Technique',
      chaine: 'Jeff Nippard',
      debut:  0
    },

    // ══════════════════════════════════════════════════════
    // GAINAGE / ABDOS
    // ══════════════════════════════════════════════════════

    planche: {
      id:     'pSHjTRCQxIw',
      titre:  'Planche — Technique parfaite',
      chaine: 'Athlean-X',
      debut:  0
    },
    crunch_machine: {
      id:     'XjlCaFmcGEE',
      titre:  'Crunch machine — Technique',
      chaine: 'Athlean-X',
      debut:  0
    },
    releve_jambes: {
      id:     'l4kQd9eWclE',
      titre:  'Relevé de jambes — Technique',
      chaine: 'Athlean-X',
      debut:  0
    },
    russian_twist: {
      id:     'wkD8rjkodUI',
      titre:  'Russian twist — Technique',
      chaine: 'Athlean-X',
      debut:  0
    },

    // ══════════════════════════════════════════════════════
    // CARDIO
    // ══════════════════════════════════════════════════════

    rameur: {
      id:     'H0r_ZzSIEZk',
      titre:  'Rameur — Technique parfaite',
      chaine: 'Concept2',
      debut:  0
    },
    velo: {
      id:     'g8SBcAGJT3k',
      titre:  'Vélo stationnaire — Réglages',
      chaine: 'Athlean-X',
      debut:  0
    }
  },

  // ─── Récupérer les URLs thumbnail ─────────────────────────
  getThumbnail(exerciceRef, qualite = 'hqdefault') {
    const video = this.VIDEOS[exerciceRef];
    if (!video) return null;
    // Qualités disponibles :
    // default → 120x90
    // mqdefault → 320x180
    // hqdefault → 480x360  ← on utilise celle-ci
    // sddefault → 640x480
    // maxresdefault → 1280x720 (pas toujours dispo)
    return `https://img.youtube.com/vi/${video.id}/${qualite}.jpg`;
  },

  // ─── Générer l'URL embed ───────────────────────────────────
  getEmbedURL(exerciceRef) {
    const video = this.VIDEOS[exerciceRef];
    if (!video) return null;
    return [
      `https://www.youtube.com/embed/${video.id}`,
      `?autoplay=1`,
      `&mute=1`,
      `&loop=1`,
      `&playlist=${video.id}`,
      `&controls=1`,
      `&rel=0`,
      `&modestbranding=1`,
      `&start=${video.debut}`
    ].join('');
  },

  // ─── Générer le HTML thumbnail cliquable ──────────────────
  renderThumbnail(exerciceRef, options = {}) {
    const {
      height    = '220px',
      showInfo  = true,
      className = ''
    } = options;

    const video     = this.VIDEOS[exerciceRef];
    const ex        = window.EXERCICES?.[exerciceRef] || {};
    const thumbURL  = this.getThumbnail(exerciceRef);

    if (!video || !thumbURL) {
      // Fallback SVG animé si pas de vidéo
      return window.ExerciceSVGs?.get(exerciceRef) || `
        <div style="width:100%;height:${height};display:flex;
                    align-items:center;justify-content:center;
                    font-size:4rem">
          ${ex.emoji || '💪'}
        </div>`;
    }

    const uid = `yt_${exerciceRef}_${Date.now()}`;

    return `
      <div id="${uid}"
           onclick="ExerciceVideos.ouvrirVideo('${exerciceRef}')"
           style="width:100%;height:${height};position:relative;
                  overflow:hidden;cursor:pointer;
                  border-radius:var(--radius-md) var(--radius-md) 0 0;
                  background:#000">

        <!-- Thumbnail YouTube -->
        <img src="${thumbURL}"
             alt="${ex.nom || exerciceRef}"
             style="width:100%;height:100%;
                    object-fit:cover;
                    transition:transform 0.3s ease,opacity 0.3s ease"
             onerror="this.parentElement.innerHTML=
               '<div style=width:100%;height:100%;display:flex;
                align-items:center;justify-content:center;
                font-size:4rem;background:var(--fd-indigo-dim)>
                ${ex.emoji || '💪'}</div>'"
             onmouseover="this.style.transform='scale(1.05)'"
             onmouseout="this.style.transform='scale(1)'" />

        <!-- Overlay dégradé -->
        <div style="position:absolute;inset:0;
                    background:linear-gradient(
                      to top,
                      rgba(9,9,45,0.85) 0%,
                      rgba(9,9,45,0.1) 50%,
                      transparent 100%)">
        </div>

        <!-- Bouton Play -->
        <div style="position:absolute;top:50%;left:50%;
                    transform:translate(-50%,-60%);
                    width:56px;height:56px;border-radius:50%;
                    background:rgba(75,75,249,0.9);
                    display:flex;align-items:center;
                    justify-content:center;
                    box-shadow:0 0 24px rgba(75,75,249,0.6);
                    transition:transform 0.2s ease"
             onmouseover="this.style.transform='translate(-50%,-60%) scale(1.1)'"
             onmouseout="this.style.transform='translate(-50%,-60%) scale(1)'">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>

        ${showInfo ? `
          <!-- Info en bas -->
          <div style="position:absolute;bottom:0;left:0;right:0;
                      padding:var(--space-sm) var(--space-md)">
            <div style="display:flex;align-items:center;gap:6px">
              <!-- Logo YouTube mini -->
              <svg width="16" height="12" viewBox="0 0 24 17" fill="#ff0000">
                <path d="M23.5 2.5s-.3-1.8-1-2.5c-1-1-2-1-2.5-1.1
                         C17 .7 12 .7 12 .7s-5 0-8 .2C3.5.9 2.5 1 1.5 2
                         .8 2.7.5 4.5.5 4.5S.2 6.6.2 8.5v1.8c0 1.9.3 3.8.3
                         3.8s.3 1.8 1 2.5c1 1 2.3.9 2.8 1 2 .2 8.7.3 8.7.3
                         s5 0 8-.2c.5-.1 1.5-.1 2.5-1.1.7-.7 1-2.5 1-2.5s
                         .3-2.1.3-4v-1.8c0-1.9-.3-4-.3-4z"/>
                <path d="M9.7 11.5V5l6.6 3.3-6.6 3.2z" fill="white"/>
              </svg>
              <span style="font-size:.65rem;color:rgba(255,255,255,0.7);
                           font-weight:500">
                ${video.chaine}
              </span>
            </div>
            <div style="font-size:.7rem;color:rgba(255,255,255,0.5);
                        margin-top:2px;
                        white-space:nowrap;overflow:hidden;
                        text-overflow:ellipsis">
              ${video.titre}
            </div>
          </div>
        ` : ''}

        <!-- Badge HD -->
        <div style="position:absolute;top:var(--space-sm);
                    right:var(--space-sm);
                    background:rgba(0,0,0,0.7);
                    color:white;font-size:.6rem;
                    font-weight:700;padding:2px 6px;
                    border-radius:4px;letter-spacing:.05em">
          HD
        </div>
      </div>
    `;
  },

  // ─── Ouvrir vidéo dans modal ───────────────────────────────
  ouvrirVideo(exerciceRef) {
    const video = this.VIDEOS[exerciceRef];
    const ex    = window.EXERCICES?.[exerciceRef] || {};
    if (!video) return;

    // Créer modal si elle n'existe pas
    let modal = document.getElementById('modal-video');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-video';
      modal.style.cssText = `
        position:fixed;inset:0;z-index:9999;
        display:flex;align-items:center;
        justify-content:center;
        background:rgba(9,9,45,0.95);
        backdrop-filter:blur(12px);
        padding:var(--space-md);
      `;
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div style="width:100%;max-width:420px;
                  border-radius:var(--radius-xl);
                  overflow:hidden;
                  box-shadow:0 40px 80px rgba(0,0,0,0.8),
                             0 0 40px rgba(75,75,249,0.3)">

        <!-- Header modal -->
        <div style="background:var(--bg-card);
                    padding:var(--space-md);
                    display:flex;align-items:center;
                    justify-content:space-between;
                    border-bottom:1px solid var(--border-color)">
          <div>
            <div style="font-weight:700;font-size:.95rem">
              ${ex.emoji || '💪'} ${ex.nom || exerciceRef}
            </div>
            <div style="font-size:.7rem;color:var(--text-muted);
                        margin-top:2px">
              📺 ${video.chaine} · Démo technique
            </div>
          </div>
          <button onclick="ExerciceVideos.fermerVideo()"
                  style="width:32px;height:32px;border-radius:50%;
                         background:rgba(255,255,255,0.1);border:none;
                         color:white;font-size:1rem;cursor:pointer;
                         display:flex;align-items:center;
                         justify-content:center">
            ✕
          </button>
        </div>

        <!-- iFrame YouTube -->
        <div style="position:relative;padding-bottom:56.25%;height:0;
                    background:#000">
          <iframe
            src="${this.getEmbedURL(exerciceRef)}"
            style="position:absolute;top:0;left:0;
                   width:100%;height:100%;border:none"
            allow="accelerometer;autoplay;clipboard-write;
                   encrypted-media;gyroscope;picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>

        <!-- Footer modal -->
        <div style="background:var(--bg-card);
                    padding:var(--space-md)">
          <div style="display:flex;gap:var(--space-sm)">
            <a href="https://www.youtube.com/watch?v=${video.id}"
               target="_blank"
               style="flex:1;padding:var(--space-sm);
                      background:rgba(255,0,0,0.15);
                      border:1px solid rgba(255,0,0,0.3);
                      border-radius:var(--radius-md);
                      color:#ff4444;font-size:.8rem;
                      font-weight:600;text-align:center;
                      text-decoration:none;
                      display:flex;align-items:center;
                      justify-content:center;gap:6px">
              <svg width="14" height="10" viewBox="0 0 24 17" fill="#ff4444">
                <path d="M23.5 2.5s-.3-1.8-1-2.5c-1-1-2-1-2.5-1.1
                         C17 .7 12 .7 12 .7s-5 0-8 .2C3.5.9 2.5 1 1.5 2
                         .8 2.7.5 4.5.5 4.5S.2 6.6.2 8.5v1.8c0 1.9.3 3.8.3
                         3.8s.3 1.8 1 2.5c1 1 2.3.9 2.8 1 2 .2 8.7.3 8.7.3
                         s5 0 8-.2c.5-.1 1.5-.1 2.5-1.1.7-.7 1-2.5 1-2.5s
                         .3-2.1.3-4v-1.8c0-1.9-.3-4-.3-4z"/>
                <path d="M9.7 11.5V5l6.6 3.3-6.6 3.2z" fill="white"/>
              </svg>
              Voir sur YouTube
            </a>
            <button onclick="ExerciceVideos.fermerVideo()"
                    style="flex:1;padding:var(--space-sm);
                           background:var(--fd-indigo-dim);
                           border:1px solid var(--fd-indigo);
                           border-radius:var(--radius-md);
                           color:var(--fd-indigo);font-size:.8rem;
                           font-weight:600;cursor:pointer">
              ✅ Compris !
            </button>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    // Fermer en cliquant sur l'overlay
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.fermerVideo();
    });
  },

  // ─── Fermer la modal vidéo ────────────────────────────────
  fermerVideo() {
    const modal = document.getElementById('modal-video');
    if (!modal) return;
    // Stopper la vidéo proprement
    modal.innerHTML = '';
    modal.style.display = 'none';
  },

  // ─── Charger thumbnail dans un élément existant ───────────
  async chargerDans(exerciceRef, elementId, options = {}) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const html = this.renderThumbnail(exerciceRef, options);

    el.style.transition = 'opacity 0.3s ease';
    el.style.opacity    = '0';

    setTimeout(() => {
      el.innerHTML     = html;
      el.style.opacity = '1';
      el.style.padding = '0';
      el.style.background = 'transparent';
    }, 100);
  },

  // ─── Stats ────────────────────────────────────────────────
  stats() {
    const total = Object.keys(this.VIDEOS).length;
    console.log(`📺 ${total} vidéos YouTube référencées`);
    return total;
  }
};

window.ExerciceVideos = ExerciceVideos;
console.log(`✅ ExerciceVideos chargé — ${Object.keys(ExerciceVideos.VIDEOS).length} vidéos`);
