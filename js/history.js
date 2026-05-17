/* ============================================================
   FitTracker Pro — History.js v1.0
   Historique complet séances + Exercices + Analyse
   Filtres + Recherche + Export + Graphiques
   ============================================================ */

const History = {

  // ════════════════════════════════════════════════════════
  // CONFIG
  // ════════════════════════════════════════════════════════
  CONFIG: {
    pageSize:    20,
    maxAffiche:  200
  },

  // ════════════════════════════════════════════════════════
  // ÉTAT UI
  // ════════════════════════════════════════════════════════
  _state: {
    page:         0,
    filtreSeance: null,
    filtreExo:    null,
    filtrePeriode:'tout',
    recherche:    '',
    vue:          'seances' // 'seances' | 'exercices' | 'prs'
  },

  // ════════════════════════════════════════════════════════
  // GETTERS SÉANCES
  // ════════════════════════════════════════════════════════
  getSeances(filtres = {}) {
    try {
      const toutes = Tracker.getHistoriqueSeances(
        this.CONFIG.maxAffiche
      );

      let result = [...toutes];

      // Filtre période
      if (filtres.periode && filtres.periode !== 'tout') {
        const debut = this._dateDebutPeriode(filtres.periode);
        result = result.filter(
          s => (s.date||'') >= debut
        );
      }

      // Filtre séance type
      if (filtres.seanceId) {
        result = result.filter(
          s => s.id === filtres.seanceId
            || s.id?.startsWith(filtres.seanceId)
        );
      }

      // Recherche texte
      if (filtres.recherche) {
        const q = filtres.recherche.toLowerCase();
        result = result.filter(s => {
          const nom = (window.SEANCES_BASE||{})[s.id]?.nom
            || s.id || '';
          return nom.toLowerCase().includes(q)
            || (s.date||'').includes(q);
        });
      }

      return result;
    } catch(e) {
      return [];
    }
  },

  // ════════════════════════════════════════════════════════
  // GETTERS EXERCICES
  // ════════════════════════════════════════════════════════
  getHistoriqueExercice(ref, limite = 50) {
    try {
      return Tracker.getHistoriqueExercice(ref, limite);
    } catch(e) { return []; }
  },

  getAllPRs() {
    try { return Tracker.getAllPRs(); }
    catch(e) { return {}; }
  },

  // ════════════════════════════════════════════════════════
  // ANALYSE
  // ════════════════════════════════════════════════════════
  analyserSeance(seanceData) {
    if (!seanceData) return null;

    const series  = seanceData.series || [];
    const volume  = series.reduce(
      (a,s) => a + (s.poids||0) * (s.reps||0), 0
    );
    const rpesMoy = series.filter(s => s.rpe > 0).length > 0
      ? Utils.arrondir(
          series.filter(s => s.rpe > 0)
            .reduce((a,s) => a + s.rpe, 0)
          / series.filter(s => s.rpe > 0).length
        )
      : null;

    // Grouper par exercice
    const parExo = {};
    series.forEach(s => {
      const ref = s.exerciceRef || s.ref;
      if (!parExo[ref]) parExo[ref] = [];
      parExo[ref].push(s);
    });

    const exercicesResume = Object.entries(parExo)
      .map(([ref, sers]) => {
        const ex  = (window.EXERCICES||{})[ref] || {};
        const vol = sers.reduce(
          (a,s) => a + (s.poids||0)*(s.reps||0), 0
        );
        const maxPoids = Math.max(...sers.map(s => s.poids||0));
        return {
          ref,
          nom:       ex.nom || ref,
          emoji:     ex.emoji || '💪',
          nbSeries:  sers.length,
          totalVol:  vol,
          maxPoids,
          reps:      sers.map(s => s.reps),
          poids:     sers.map(s => s.poids)
        };
      });

    const prsSeance = series.filter(s => s.isPR).length;

    return {
      date:            seanceData.date,
      duree:           seanceData.duree || 0,
      volume,
      nbSeries:        series.length,
      nbExercices:     Object.keys(parExo).length,
      rpesMoyen:       rpesMoy,
      prsSeance,
      exercicesResume,
      intensite:
        !rpesMoy         ? '—'  :
        rpesMoy >= 9     ? '🔴 Très intense' :
        rpesMoy >= 7.5   ? '🟠 Intense'      :
        rpesMoy >= 6     ? '🟡 Modérée'      :
                           '🟢 Légère'
    };
  },

  getStatsGlobales() {
    const seances = this.getSeances();

    if (seances.length === 0) {
      return {
        total:0, volume:0, dureeTotal:0,
        rpeMoyen:0, prsTotal:0,
        seanceParSemaine:0, meilleureSeance:null
      };
    }

    const volume     = seances.reduce(
      (a,s) => a + (s.volumeTotal||0), 0
    );
    const dureeTotal = seances.reduce(
      (a,s) => a + (s.duree||0), 0
    );
    const rpes       = seances
      .filter(s => s.rpesMoyen > 0)
      .map(s => s.rpesMoyen);
    const rpeMoyen   = rpes.length > 0
      ? Utils.arrondir(
          rpes.reduce((a,b) => a+b, 0) / rpes.length
        )
      : 0;

    // Calcul séances/semaine
    const premiere = seances[seances.length-1]?.date;
    const nbSemaines = premiere
      ? Math.max(1, Utils.semainesDepuis(premiere))
      : 1;
    const seanceParSemaine = Utils.arrondir(
      seances.length / nbSemaines
    );

    // Meilleure séance (plus gros volume)
    const meilleureSeance = seances.reduce(
      (best, s) =>
        (s.volumeTotal||0) > (best?.volumeTotal||0)
          ? s : best,
      null
    );

    return {
      total: seances.length,
      volume,
      dureeTotal,
      rpeMoyen,
      prsTotal: Object.keys(this.getAllPRs()).length,
      seanceParSemaine,
      meilleureSeance
    };
  },

  // Volume par semaine (8 dernières)
  getVolumeParSemaine(n = 8) {
    const labels  = [];
    const volumes = [];

    for (let i = n-1; i >= 0; i--) {
      const date  = Utils.ajouterJours(
        Utils.aujourd_hui(), -i*7
      );
      const debut = Utils.debutSemaine(date);
      const fin   = Utils.finSemaine(date);

      const vol = this.getSeances()
        .filter(s =>
          (s.date||'') >= debut && (s.date||'') <= fin
        )
        .reduce((a,s) => a + (s.volumeTotal||0), 0);

      labels.push(`S${n-i}`);
      volumes.push(Math.round(vol));
    }

    return { labels, volumes };
  },

  // Fréquence par jour de semaine
  getFrequenceJours() {
    const freq  = [0,0,0,0,0,0,0]; // Lun→Dim
    const noms  = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

    this.getSeances().forEach(s => {
      try {
        const idx = Utils.indexJourSemaine(s.date);
        if (idx >= 0 && idx < 7) freq[idx]++;
      } catch(e) {}
    });

    return { freq, noms };
  },

  // ════════════════════════════════════════════════════════
  // HELPERS PÉRIODE
  // ════════════════════════════════════════════════════════
  _dateDebutPeriode(periode) {
    const today = Utils.aujourd_hui();
    switch(periode) {
      case '7j':   return Utils.ajouterJours(today, -7);
      case '30j':  return Utils.ajouterJours(today, -30);
      case '90j':  return Utils.ajouterJours(today, -90);
      case '6m':   return Utils.ajouterJours(today, -180);
      case '1an':  return Utils.ajouterJours(today, -365);
      default:     return '2000-01-01';
    }
  },

  // ════════════════════════════════════════════════════════
  // RENDER PRINCIPAL
  // ════════════════════════════════════════════════════════
  render(container) {
    if (!container) return;

    const stats = this.getStatsGlobales();

    container.innerHTML = `

      <!-- Tabs -->
      <div class="tabs-container">
        <button class="tab-btn ${
          this._state.vue==='seances' ? 'active':''}"
                onclick="History._setVue('seances')">
          📅 Séances
        </button>
        <button class="tab-btn ${
          this._state.vue==='exercices' ? 'active':''}"
                onclick="History._setVue('exercices')">
          🏋️ Exercices
        </button>
        <button class="tab-btn ${
          this._state.vue==='prs' ? 'active':''}"
                onclick="History._setVue('prs')">
          🏆 Records
        </button>
        <button class="tab-btn ${
          this._state.vue==='stats' ? 'active':''}"
                onclick="History._setVue('stats')">
          📊 Analyse
        </button>
      </div>

      <!-- Stats rapides -->
      <div class="stats-grid mb-md">
        <div class="stat-card">
          <span class="stat-value"
                style="color:var(--fd-indigo)">
            ${stats.total}
          </span>
          <span class="stat-label">Séances</span>
        </div>
        <div class="stat-card">
          <span class="stat-value"
                style="color:var(--fd-mint)">
            ${Utils.formatVolume(stats.volume)}
          </span>
          <span class="stat-label">Volume total</span>
        </div>
        <div class="stat-card">
          <span class="stat-value"
                style="color:var(--fd-lemon)">
            ${Utils.formatDuree(stats.dureeTotal)}
          </span>
          <span class="stat-label">Temps total</span>
        </div>
        <div class="stat-card">
          <span class="stat-value"
                style="color:var(--fd-lavender)">
            ${stats.seanceParSemaine}/sem
          </span>
          <span class="stat-label">Fréquence</span>
        </div>
      </div>

      <!-- Contenu dynamique -->
      <div id="history-content"></div>
    `;

    this._renderVue();
  },

  // ════════════════════════════════════════════════════════
  // ROUTER VUE
  // ════════════════════════════════════════════════════════
  _setVue(vue) {
    this._state.vue  = vue;
    this._state.page = 0;

    // Mise à jour tabs
    document.querySelectorAll('.tabs-container .tab-btn')
      .forEach((btn, i) => {
        const vues = ['seances','exercices','prs','stats'];
        btn.classList.toggle('active', vues[i] === vue);
      });

    this._renderVue();
  },

  _renderVue() {
    const el = document.getElementById('history-content');
    if (!el) return;

    switch(this._state.vue) {
      case 'seances':   this._renderSeances(el);   break;
      case 'exercices': this._renderExercices(el); break;
      case 'prs':       this._renderPRs(el);       break;
      case 'stats':     this._renderStats(el);     break;
    }
  },

  // ════════════════════════════════════════════════════════
  // VUE SÉANCES
  // ════════════════════════════════════════════════════════
  _renderSeances(el) {
    const filtres = {
      periode:  this._state.filtrePeriode,
      seanceId: this._state.filtreSeance,
      recherche:this._state.recherche
    };

    const seances = this.getSeances(filtres);
    const page    = this._state.page;
    const debut   = page * this.CONFIG.pageSize;
    const fin     = debut + this.CONFIG.pageSize;
    const page_s  = seances.slice(debut, fin);
    const hasPlus = seances.length > fin;

    el.innerHTML = `

      <!-- Filtres -->
      <div class="card mb-md">
        <div style="display:grid;
                    grid-template-columns:1fr 1fr;
                    gap:var(--space-sm);
                    margin-bottom:var(--space-sm)">
          <div>
            <div class="input-label">Période</div>
            <select class="input"
                    onchange="History._filtrePeriode(
                      this.value)">
              ${[
                { val:'tout', label:'Tout' },
                { val:'7j',   label:'7 jours' },
                { val:'30j',  label:'30 jours' },
                { val:'90j',  label:'3 mois' },
                { val:'6m',   label:'6 mois' },
                { val:'1an',  label:'1 an' }
              ].map(p => `
                <option value="${p.val}"
                  ${this._state.filtrePeriode===p.val
                    ?'selected':''}>
                  ${p.label}
                </option>`).join('')}
            </select>
          </div>
          <div>
            <div class="input-label">Séance</div>
            <select class="input"
                    onchange="History._filtreSeance(
                      this.value)">
              <option value="">Toutes</option>
              ${Object.values(window.SEANCES_BASE||{})
                .map(s => `
                  <option value="${s.id}"
                    ${this._state.filtreSeance===s.id
                      ?'selected':''}>
                    ${s.emoji} ${s.nom}
                  </option>`).join('')}
            </select>
          </div>
        </div>
        <div>
          <div class="input-label">Recherche</div>
          <input class="input" id="history-search"
                 placeholder="🔍 Date, séance..."
                 value="${this._state.recherche}"
                 oninput="History._recherche(this.value)" />
        </div>
        <div style="font-size:.72rem;
                    color:var(--text-muted);
                    margin-top:var(--space-sm);
                    text-align:right">
          ${seances.length} séance${seances.length>1?'s':''}
          trouvée${seances.length>1?'s':''}
        </div>
      </div>

      <!-- Liste séances -->
      ${page_s.length === 0 ? `
        <div class="card"
             style="text-align:center;
                    padding:var(--space-xl)">
          <div style="font-size:2rem">📅</div>
          <p style="color:var(--text-muted);
                    margin-top:var(--space-sm);
                    font-size:.88rem">
            Aucune séance trouvée.<br>
            Lance ta première séance !
          </p>
        </div>` :
        page_s.map(s => this._renderCarteSeance(s))
          .join('')}

      <!-- Pagination -->
      <div style="display:flex;gap:var(--space-sm);
                  margin-top:var(--space-md)">
        ${page > 0 ? `
          <button class="btn-secondary"
                  style="flex:1"
                  onclick="History._changerPage(${page-1})">
            ← Précédent
          </button>` : ''}
        ${hasPlus ? `
          <button class="btn-secondary"
                  style="flex:1"
                  onclick="History._changerPage(${page+1})">
            Suivant →
          </button>` : ''}
      </div>

      <!-- Export -->
      <button class="btn-secondary mt-md"
              style="width:100%;font-size:.82rem"
              onclick="History._exporterSeances()">
        📊 Exporter en CSV
      </button>
    `;
  },

  // ════════════════════════════════════════════════════════
  // CARTE SÉANCE
  // ════════════════════════════════════════════════════════
  _renderCarteSeance(seance) {
    const analyse = this.analyserSeance(seance);
    const seanceInfo = (window.SEANCES_BASE||{})[seance.id]
      || { nom: seance.id || '?', emoji:'💪' };

    // Vérifier si c'est une séance express
    const isExpress = seance.id?.includes('express');

    return `
      <div class="card mb-md"
           onclick="History._detailSeance('${seance.id}',
             '${seance.date}')"
           style="cursor:pointer;
                  transition:transform .15s;
                  border-left:3px solid ${
                    seance.prsSeance > 0
                      ? 'var(--fd-lemon)'
                      : isExpress
                        ? 'var(--fd-lavender)'
                        : 'var(--fd-indigo)'
                  }">
        <div class="flex justify-between items-center mb-sm">
          <div>
            <div style="font-weight:700;font-size:.95rem">
              ${seanceInfo.emoji}
              ${isExpress ? '⚡ Express' : seanceInfo.nom}
            </div>
            <div style="font-size:.72rem;
                        color:var(--text-muted);
                        margin-top:2px">
              ${Utils.formatDateLong?.(seance.date)
                || seance.date}
            </div>
          </div>
          <div style="text-align:right">
            ${seance.prsSeance > 0 ? `
              <div style="font-size:.72rem;
                          color:var(--fd-lemon);
                          font-weight:700">
                🏆 ${seance.prsSeance} PR
              </div>` : ''}
            ${seance.duree ? `
              <div style="font-size:.72rem;
                          color:var(--text-muted)">
                ⏱️ ${Utils.formatDuree(seance.duree)}
              </div>` : ''}
          </div>
        </div>

        <!-- Stats séance -->
        <div style="display:grid;
                    grid-template-columns:repeat(4,1fr);
                    gap:var(--space-xs)">
          ${[
            {
              label: 'Volume',
              val:   Utils.formatVolume(
                analyse?.volume || seance.volumeTotal || 0
              ),
              color: 'var(--fd-mint)'
            },
            {
              label: 'Séries',
              val:   analyse?.nbSeries ||
                     seance.series?.length || '—',
              color: 'var(--fd-indigo)'
            },
            {
              label: 'Exercices',
              val:   analyse?.nbExercices || '—',
              color: 'var(--fd-lavender)'
            },
            {
              label: 'RPE',
              val:   analyse?.rpesMoyen
                     || seance.rpesMoyen || '—',
              color: 'var(--fd-lemon)'
            }
          ].map(s => `
            <div style="text-align:center;
                        padding:var(--space-xs);
                        background:var(--bg-input);
                        border-radius:var(--radius-sm)">
              <div style="font-size:.82rem;
                          font-weight:700;
                          color:${s.color}">
                ${s.val}
              </div>
              <div style="font-size:.58rem;
                          color:var(--text-muted)">
                ${s.label}
              </div>
            </div>`).join('')}
        </div>

        <!-- Intensité -->
        ${analyse?.intensite && analyse.intensite !== '—' ? `
          <div style="font-size:.68rem;
                      color:var(--text-muted);
                      margin-top:var(--space-xs);
                      text-align:right">
            ${analyse.intensite}
          </div>` : ''}
      </div>`;
  },

  // ════════════════════════════════════════════════════════
  // DÉTAIL SÉANCE
  // ════════════════════════════════════════════════════════
  _detailSeance(seanceId, date) {
    const seances = this.getSeances();
    const seance  = seances.find(
      s => s.id === seanceId && s.date === date
    ) || seances.find(s => s.date === date);

    if (!seance) return;

    const analyse   = this.analyserSeance(seance);
    const seanceInfo = (window.SEANCES_BASE||{})[seanceId]
      || { nom:seanceId, emoji:'💪' };
    const modal     = document.getElementById('modal-info');
    const content   = document.getElementById(
      'modal-info-content'
    );
    if (!modal || !content) return;

    content.innerHTML = `
      <div style="text-align:center;
                  margin-bottom:var(--space-md)">
        <div style="font-size:2rem">
          ${seanceInfo.emoji}
        </div>
        <div style="font-weight:700;font-size:1.1rem;
                    margin-top:4px">
          ${seanceInfo.nom}
        </div>
        <div style="font-size:.78rem;
                    color:var(--text-muted)">
          ${Utils.formatDate?.(date) || date}
        </div>
      </div>

      <!-- Stats globales séance -->
      <div class="stats-grid mb-md">
        <div class="stat-card">
          <span class="stat-value"
                style="color:var(--fd-mint)">
            ${Utils.formatVolume(analyse?.volume||0)}
          </span>
          <span class="stat-label">Volume</span>
        </div>
        <div class="stat-card">
          <span class="stat-value"
                style="color:var(--fd-indigo)">
            ${Utils.formatDuree(seance.duree||0)}
          </span>
          <span class="stat-label">Durée</span>
        </div>
        <div class="stat-card">
          <span class="stat-value"
                style="color:var(--fd-lemon)">
            ${analyse?.rpesMoyen||'—'}
          </span>
          <span class="stat-label">RPE moy.</span>
        </div>
        <div class="stat-card">
          <span class="stat-value"
                style="color:var(--fd-lemon)">
            ${analyse?.prsSeance||0}
          </span>
          <span class="stat-label">PRs</span>
        </div>
      </div>

      <!-- Exercices détail -->
      <div class="card-label mb-sm">🏋️ Détail exercices</div>
      ${(analyse?.exercicesResume||[]).map(exo => `
        <div style="padding:var(--space-sm) 0;
                    border-bottom:1px solid
                    var(--border-color)">
          <div class="flex justify-between items-center">
            <div>
              <span style="font-size:.88rem;
                           font-weight:600">
                ${exo.emoji} ${exo.nom}
              </span>
              <div style="font-size:.68rem;
                          color:var(--text-muted)">
                ${exo.nbSeries} séries
                · Max ${exo.maxPoids}kg
              </div>
            </div>
            <div style="text-align:right">
              <div style="font-size:.82rem;
                          font-weight:700;
                          color:var(--fd-mint)">
                ${Utils.formatVolume(exo.totalVol)}
              </div>
              <div style="font-size:.65rem;
                          color:var(--text-muted)">
                volume
              </div>
            </div>
          </div>

          <!-- Séries détaillées -->
          <div style="display:flex;flex-wrap:wrap;
                      gap:4px;margin-top:6px">
            ${exo.poids.map((p,i) => `
              <span style="padding:2px 8px;
                           background:var(--bg-input);
                           border-radius:99px;
                           font-size:.68rem;
                           color:var(--text-secondary)">
                ${p}kg×${exo.reps[i]}
              </span>`).join('')}
          </div>
        </div>`).join('')}

      <!-- Note journal si existe -->
      ${seance.note ? `
        <div style="margin-top:var(--space-md);
                    padding:var(--space-sm);
                    background:rgba(75,75,249,0.1);
                    border-radius:var(--radius-sm);
                    border-left:3px solid var(--fd-indigo)">
          <div style="font-size:.72rem;
                      color:var(--fd-lavender);
                      font-weight:700;
                      margin-bottom:4px">
            📔 Note
          </div>
          <div style="font-size:.82rem;
                      color:var(--text-secondary)">
            ${seance.note}
          </div>
        </div>` : ''}
    `;

    modal.classList.remove('hidden');
    document.getElementById('modal-info-close')
      .onclick = () => modal.classList.add('hidden');
    modal.querySelector('.modal-overlay')
      .onclick = () => modal.classList.add('hidden');
  },

  // ════════════════════════════════════════════════════════
  // VUE EXERCICES
  // ════════════════════════════════════════════════════════
  _renderExercices(el) {
    const prs  = this.getAllPRs();
    const refs = Object.keys(prs);

    // Grouper par muscle
    const parMuscle = {};
    refs.forEach(ref => {
      const ex     = (window.EXERCICES||{})[ref] || {};
      const muscle = ex.muscle || 'Autre';
      if (!parMuscle[muscle]) parMuscle[muscle] = [];
      parMuscle[muscle].push({ ref, ex, pr:prs[ref] });
    });

    el.innerHTML = `

      <!-- Recherche -->
      <div class="card mb-md">
        <input class="input"
               placeholder="🔍 Rechercher un exercice..."
               oninput="History._rechercheExo(this.value)"
               id="history-exo-search" />
      </div>

      <!-- Liste par muscle -->
      <div id="history-exo-list">
        ${Object.entries(parMuscle).length === 0 ? `
          <div class="card"
               style="text-align:center;
                      padding:var(--space-xl)">
            <div style="font-size:2rem">🏋️</div>
            <p style="color:var(--text-muted);
                      font-size:.88rem;
                      margin-top:var(--space-sm)">
              Aucun historique d'exercice.<br>
              Lance tes séances !
            </p>
          </div>` :

          Object.entries(parMuscle).map(([muscle, exos]) => `
            <div class="section-title">${muscle}</div>
            ${exos.map(({ ref, ex, pr }) => `
              <div class="card mb-md"
                   onclick="History._detailExercice('${ref}')"
                   style="cursor:pointer">
                <div class="flex justify-between
                            items-center">
                  <div>
                    <div style="font-weight:700;
                                font-size:.92rem">
                      ${ex.emoji||'💪'} ${ex.nom||ref}
                    </div>
                    <div style="font-size:.72rem;
                                color:var(--fd-mint)">
                      ${ex.muscle||''}
                    </div>
                  </div>
                  <div style="text-align:right">
                    <div style="font-size:.9rem;
                                font-weight:800;
                                color:var(--fd-lemon)">
                      ${pr.poids}kg × ${pr.reps}
                    </div>
                    <div style="font-size:.65rem;
                                color:var(--text-muted)">
                      ~${pr.rm1}kg 1RM
                    </div>
                  </div>
                </div>

                <!-- Mini graphique 1RM -->
                ${this._renderMiniGraph(ref)}
              </div>`).join('')}
          `).join('')}
      </div>
    `;
  },

  // ─── Mini graphique tendance ─────────────────────────────
  _renderMiniGraph(ref) {
    try {
      const hist = this.getHistoriqueExercice(ref, 10)
        .sort((a,b) =>
          (a.date||'').localeCompare(b.date||'')
        )
        .filter(h => h.rm1 > 0);

      if (hist.length < 2) return '';

      const max  = Math.max(...hist.map(h => h.rm1));
      const min  = Math.min(...hist.map(h => h.rm1));
      const range = Math.max(max - min, 1);
      const W    = 100, H = 24;

      const pts = hist.map((h, i) => {
        const x = (i/(hist.length-1)) * W;
        const y = H - ((h.rm1 - min)/range) * H;
        return `${x},${y}`;
      }).join(' ');

      const tendance = hist[hist.length-1].rm1
        > hist[0].rm1
        ? 'var(--fd-mint)' : 'var(--fd-coral)';

      return `
        <div style="margin-top:var(--space-xs)">
          <svg width="${W}" height="${H+4}"
               viewBox="0 0 ${W} ${H+4}"
               style="display:block">
            <polyline points="${pts}"
                      fill="none"
                      stroke="${tendance}"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"/>
            <circle cx="${pts.split(' ').pop().split(',')[0]}"
                    cy="${pts.split(' ').pop().split(',')[1]}"
                    r="3" fill="${tendance}"/>
          </svg>
          <div style="font-size:.6rem;
                      color:${tendance};
                      margin-top:1px">
            ${hist[0].rm1}kg → ${hist[hist.length-1].rm1}kg
            (${hist.length} séances)
          </div>
        </div>`;
    } catch(e) { return ''; }
  },

  // ════════════════════════════════════════════════════════
  // DÉTAIL EXERCICE
  // ════════════════════════════════════════════════════════
  _detailExercice(ref) {
    const ex   = (window.EXERCICES||{})[ref] || {};
    const hist = this.getHistoriqueExercice(ref, 30)
      .sort((a,b) =>
        (a.date||'').localeCompare(b.date||'')
      );
    const pr   = this.getAllPRs()[ref];

    const modal   = document.getElementById('modal-info');
    const content = document.getElementById(
      'modal-info-content'
    );
    if (!modal || !content) return;

    // Préparer données graphique
    const labelsChart = hist.slice(-8).map(h =>
      Utils.formatDateCourt?.(h.date) || h.date
    );
    const rm1s = hist.slice(-8).map(h => h.rm1||0);

    content.innerHTML = `
      <div style="text-align:center;
                  margin-bottom:var(--space-md)">
        <div style="font-size:2.5rem">
          ${ex.emoji||'💪'}
        </div>
        <div style="font-weight:700;font-size:1.2rem;
                    margin-top:4px">
          ${ex.nom||ref}
        </div>
        <div style="font-size:.78rem;color:var(--fd-mint)">
          ${ex.muscle||''}
        </div>
      </div>

      <!-- PR actuel -->
      ${pr ? `
        <div class="card mb-md"
             style="background:rgba(249,239,119,0.08);
                    border-color:var(--fd-lemon);
                    text-align:center">
          <div style="font-size:.72rem;
                      font-weight:700;
                      color:var(--fd-lemon);
                      margin-bottom:var(--space-sm)">
            🏆 RECORD PERSONNEL
          </div>
          <div style="display:flex;
                      justify-content:space-around">
            <div>
              <div style="font-size:1.5rem;
                          font-weight:800;
                          color:var(--fd-lemon)">
                ${pr.poids}kg
              </div>
              <div style="font-size:.65rem;
                          color:var(--text-muted)">
                Meilleur poids
              </div>
            </div>
            <div>
              <div style="font-size:1.5rem;
                          font-weight:800;
                          color:var(--fd-indigo)">
                ${pr.rm1}kg
              </div>
              <div style="font-size:.65rem;
                          color:var(--text-muted)">
                1RM estimé
              </div>
            </div>
            <div>
              <div style="font-size:1.5rem;
                          font-weight:800;
                          color:var(--fd-mint)">
                ${pr.reps}
              </div>
              <div style="font-size:.65rem;
                          color:var(--text-muted)">
                Meilleur reps
              </div>
            </div>
          </div>
          <div style="font-size:.65rem;
                      color:var(--text-muted);
                      margin-top:var(--space-sm)">
            ${pr.date||''}
          </div>
        </div>` : ''}

      <!-- Graphique progression -->
      ${hist.length >= 2 ? `
        <div class="card mb-md">
          <div class="card-label">
            📈 Progression 1RM
          </div>
          <canvas id="detail-exo-chart"
                  style="width:100%;height:140px;
                         margin-top:var(--space-sm)">
          </canvas>
        </div>` : ''}

      <!-- Historique séances -->
      <div class="card-label mb-sm">
        📅 Historique (${hist.length} séances)
      </div>
      <div style="max-height:250px;overflow-y:auto">
        ${[...hist].reverse().slice(0, 20).map(h => `
          <div style="display:flex;
                      justify-content:space-between;
                      align-items:center;
                      padding:var(--space-sm) 0;
                      border-bottom:1px solid
                      var(--border-color);
                      font-size:.82rem">
            <div>
              <span style="font-weight:600">
                ${h.poids}kg × ${h.reps}
              </span>
              ${h.rpe ? `
                <span style="font-size:.65rem;
                             color:var(--text-muted);
                             margin-left:6px">
                  RPE ${h.rpe}
                </span>` : ''}
            </div>
            <div style="text-align:right">
              <div style="color:var(--fd-indigo);
                          font-weight:600">
                ~${h.rm1||0}kg 1RM
              </div>
              <div style="font-size:.65rem;
                          color:var(--text-muted)">
                ${Utils.formatDateCourt?.(h.date)||h.date}
              </div>
            </div>
          </div>`).join('')}
      </div>
    `;

    modal.classList.remove('hidden');
    document.getElementById('modal-info-close')
      .onclick = () => modal.classList.add('hidden');
    modal.querySelector('.modal-overlay')
      .onclick = () => modal.classList.add('hidden');

    // Dessiner graphique
    if (hist.length >= 2) {
      setTimeout(() => {
        const canvas = document.getElementById(
          'detail-exo-chart'
        );
        if (canvas && window.Utils?.graphiques) {
          Utils.graphiques.ligne(
            canvas,
            labelsChart,
            [{ valeurs:rm1s, color:'#4b4bf9' }]
          );
        }
      }, 100);
    }
  },

  // ════════════════════════════════════════════════════════
  // VUE RECORDS (PRs)
  // ════════════════════════════════════════════════════════
  _renderPRs(el) {
    const prs    = this.getAllPRs();
    const sorted = Object.entries(prs)
      .sort((a,b) => (b[1].rm1||0) - (a[1].rm1||0));

    // Grouper par muscle
    const parMuscle = {};
    sorted.forEach(([ref, pr]) => {
      const ex     = (window.EXERCICES||{})[ref] || {};
      const muscle = ex.muscle || 'Autre';
      if (!parMuscle[muscle]) parMuscle[muscle] = [];
      parMuscle[muscle].push({ ref, pr, ex });
    });

    el.innerHTML = `

      <!-- Total PRs -->
      <div class="card mb-md"
           style="text-align:center;
                  background:rgba(249,239,119,0.08);
                  border-color:var(--fd-lemon)">
        <div style="font-size:2rem">🏆</div>
        <div style="font-size:1.4rem;font-weight:800;
                    color:var(--fd-lemon);margin-top:4px">
          ${sorted.length} Records Personnels
        </div>
        <div style="font-size:.75rem;
                    color:var(--text-muted);
                    margin-top:4px">
          Clique sur un exercice pour voir la progression
        </div>
      </div>

      <!-- Export PDF -->
      <button class="btn-secondary mb-md"
              style="width:100%;font-size:.82rem"
              onclick="Utils.exporterPDF()">
        📄 Exporter le rapport PDF
      </button>

      <!-- PRs par muscle -->
      ${Object.entries(parMuscle).map(([muscle, items]) => `
        <div class="section-title">${muscle}</div>
        ${items.map(({ ref, pr, ex }) => `
          <div class="card mb-md"
               onclick="History._detailExercice('${ref}')"
               style="cursor:pointer;
                      border-left:3px solid var(--fd-lemon)">
            <div class="flex justify-between items-center">
              <div>
                <div style="font-weight:700;font-size:.92rem">
                  ${ex.emoji||'💪'} ${ex.nom||ref}
                </div>
                <div style="font-size:.65rem;
                            color:var(--text-muted);
                            margin-top:2px">
                  ${Utils.formatDateCourt?.(pr.date)||pr.date||''}
                </div>
              </div>
              <div style="text-align:right">
                <div style="font-size:1rem;font-weight:800;
                            color:var(--fd-lemon)">
                  ${pr.poids}kg × ${pr.reps}
                </div>
                <div style="font-size:.7rem;
                            color:var(--fd-indigo);
                            font-weight:600">
                  ~${pr.rm1}kg 1RM
                </div>
              </div>
            </div>
          </div>`).join('')}
      `).join('')}

      ${sorted.length === 0 ? `
        <div class="card"
             style="text-align:center;
                    padding:var(--space-xl)">
          <div style="font-size:2rem">🏆</div>
          <p style="color:var(--text-muted);
                    font-size:.88rem;
                    margin-top:var(--space-sm)">
            Aucun record encore.<br>
            Commence tes séances !
          </p>
        </div>` : ''}
    `;
  },

  // ════════════════════════════════════════════════════════
  // VUE STATS / ANALYSE
  // ════════════════════════════════════════════════════════
  _renderStats(el) {
    const stats     = this.getStatsGlobales();
    const volSem    = this.getVolumeParSemaine(8);
    const freqJours = this.getFrequenceJours();

    el.innerHTML = `

      <!-- Stats détaillées -->
      <div class="card mb-md">
        <div class="card-label">📊 Vue d'ensemble</div>
        ${[
          {
            label:'Séances totales',
            val:stats.total,
            icon:'📅',
            color:'var(--fd-indigo)'
          },
          {
            label:'Volume total soulevé',
            val:Utils.formatVolume(stats.volume),
            icon:'🏋️',
            color:'var(--fd-mint)'
          },
          {
            label:'Temps total entraîné',
            val:Utils.formatDuree(stats.dureeTotal),
            icon:'⏱️',
            color:'var(--fd-lemon)'
          },
          {
            label:'RPE moyen',
            val:stats.rpeMoyen > 0
              ? `${stats.rpeMoyen}/10` : '—',
            icon:'🎯',
            color:'var(--fd-lavender)'
          },
          {
            label:'Fréquence moyenne',
            val:`${stats.seanceParSemaine}/semaine`,
            icon:'📈',
            color:'var(--fd-coral)'
          },
          {
            label:'Records personnels',
            val:stats.prsTotal,
            icon:'🏆',
            color:'var(--fd-lemon)'
          }
        ].map(s => `
          <div class="flex justify-between items-center"
               style="padding:var(--space-sm) 0;
                      border-bottom:1px solid
                      var(--border-color)">
            <span style="font-size:.85rem">
              ${s.icon} ${s.label}
            </span>
            <span style="font-size:.9rem;
                         font-weight:700;
                         color:${s.color}">
              ${s.val}
            </span>
          </div>`).join('')}
      </div>

      <!-- Meilleure séance -->
      ${stats.meilleureSeance ? `
        <div class="card mb-md"
             style="border-color:var(--fd-mint)">
          <div class="card-label"
               style="color:var(--fd-mint)">
            🌟 Meilleure séance
          </div>
          <div style="margin-top:var(--space-sm)">
            <div style="font-weight:700">
              ${(window.SEANCES_BASE||{})[
                stats.meilleureSeance.id
              ]?.nom || stats.meilleureSeance.id}
            </div>
            <div style="font-size:.78rem;
                        color:var(--text-muted);
                        margin-top:2px">
              ${Utils.formatDate?.(stats.meilleureSeance.date)
                || stats.meilleureSeance.date}
              · ${Utils.formatVolume(
                stats.meilleureSeance.volumeTotal||0
              )}
            </div>
          </div>
        </div>` : ''}

      <!-- Volume par semaine -->
      <div class="card mb-md">
        <div class="card-label">
          📈 Volume / semaine (8 dernières)
        </div>
        <canvas id="hist-vol-chart"
                style="width:100%;height:140px;
                       margin-top:var(--space-sm)">
        </canvas>
      </div>

      <!-- Fréquence par jour -->
      <div class="card mb-md">
        <div class="card-label">
          📅 Séances par jour de semaine
        </div>
        <canvas id="hist-freq-chart"
                style="width:100%;height:120px;
                       margin-top:var(--space-sm)">
        </canvas>
      </div>

      <!-- Jours préférés -->
      <div class="card mb-md">
        <div class="card-label">⭐ Jour favori</div>
        <div style="margin-top:var(--space-sm)">
          ${freqJours.freq.map((count, i) => {
            const max = Math.max(...freqJours.freq, 1);
            const pct = Math.round((count/max)*100);
            return `
              <div style="display:flex;
                          align-items:center;
                          gap:var(--space-sm);
                          margin-bottom:4px">
                <div style="width:28px;
                            font-size:.72rem;
                            color:var(--text-muted)">
                  ${freqJours.noms[i]}
                </div>
                <div style="flex:1;height:16px;
                            background:var(--bg-input);
                            border-radius:8px;
                            overflow:hidden">
                  <div style="height:100%;
                              width:${pct}%;
                              background:${pct===100
                                ? 'var(--fd-lemon)'
                                : 'var(--fd-indigo)'};
                              border-radius:8px;
                              transition:width .5s">
                  </div>
                </div>
                <div style="width:24px;
                            font-size:.72rem;
                            font-weight:700;
                            color:var(--fd-indigo);
                            text-align:right">
                  ${count}
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>
    `;

    // Dessiner graphiques
    setTimeout(() => {
      try {
        const volCanvas = document.getElementById(
          'hist-vol-chart'
        );
        if (volCanvas && window.Utils?.graphiques) {
          Utils.graphiques.barres(
            volCanvas,
            volSem.labels,
            volSem.volumes,
            { color:'#4b4bf9' }
          );
        }

        const freqCanvas = document.getElementById(
          'hist-freq-chart'
        );
        if (freqCanvas && window.Utils?.graphiques) {
          Utils.graphiques.barres(
            freqCanvas,
            freqJours.noms,
            freqJours.freq,
            { color:'#8bf0bb' }
          );
        }
      } catch(e) {}
    }, 150);
  },

  // ════════════════════════════════════════════════════════
  // CONTRÔLES FILTRES
  // ════════════════════════════════════════════════════════
  _filtrePeriode(val) {
    this._state.filtrePeriode = val;
    this._state.page = 0;
    this._renderVue();
  },

  _filtreSeance(val) {
    this._state.filtreSeance = val || null;
    this._state.page = 0;
    this._renderVue();
  },

  _recherche: Utils.debounce
    ? Utils.debounce(function(val) {
        History._state.recherche = val;
        History._state.page = 0;
        History._renderVue();
      }, 300)
    : function(val) {
        History._state.recherche = val;
        History._state.page = 0;
        History._renderVue();
      },

  _rechercheExo(val) {
    const q = val.toLowerCase();
    document.querySelectorAll(
      '#history-exo-list .card'
    ).forEach(card => {
      card.style.display =
        card.textContent.toLowerCase().includes(q)
          ? '' : 'none';
    });
  },

  _changerPage(page) {
    this._state.page = page;
    this._renderVue();
    document.getElementById('history-content')
      ?.scrollIntoView({ behavior:'smooth' });
  },

  // ════════════════════════════════════════════════════════
  // EXPORT CSV
  // ════════════════════════════════════════════════════════
  _exporterSeances() {
    try {
      const seances = this.getSeances(
        { periode: this._state.filtrePeriode }
      );

      const lignes = [
        ['Date','Séance','Volume(kg)',
         'Séries','Durée(s)','RPE moyen','PRs']
      ];

      seances.forEach(s => {
        const info = (window.SEANCES_BASE||{})[s.id]
          || { nom:s.id };
        lignes.push([
          s.date,
          info.nom,
          Math.round(s.volumeTotal||0),
          s.series?.length || 0,
          s.duree || 0,
          s.rpesMoyen || '',
          s.prsSeance || 0
        ]);
      });

      const csv  = lignes.map(l =>
        l.map(v => `"${v}"`).join(',')
      ).join('\n');
      const blob = new Blob([csv], { type:'text/csv' });
      const link = document.createElement('a');
      link.download = `historique-${Utils.aujourd_hui()}.csv`;
      link.href     = URL.createObjectURL(blob);
      link.click();

      Utils.toast('📊 CSV exporté !', 'success');
    } catch(e) {
      Utils.toast('❌ Erreur export', 'error');
    }
  }
};

window.History = History;
console.log('✅ History.js v1.0 chargé');
