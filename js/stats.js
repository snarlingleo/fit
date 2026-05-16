/* ============================================================
   FitTracker Pro — Stats
   Calculs avancés + rendu graphiques + Suivi corporel
   ============================================================ */

const Stats = {

  // ─── DASHBOARD PRINCIPAL ──────────────────────────────────
  getDashboard() {
    const streak     = Tracker.getStreak();
    const profil     = Tracker.getProfil();
    const prs        = Tracker.getAllPRs();
    const volume     = Tracker.getVolumeSemaine();
    const seances    = Tracker.getTotalSeances();
    const scoreForme = Tracker.calculerScoreForme();
    const infos      = Programme.getInfosProgramme();

    return {
      totalSeances:  seances,
      streak:        streak.count,
      streakMax:     streak.max,
      volumeSemaine: volume,
      totalPRs:      Object.keys(prs).length,
      scoreForme,
      infos,
      profil
    };
  },

  // ─── TOP EXERCICES ────────────────────────────────────────
  getTopExercices(limite = 5) {
    const prs     = Tracker.getAllPRs();
    const entries = Object.entries(prs)
      .filter(([,v]) => v.rm1 > 0)
      .sort(([,a],[,b]) => (b.rm1||0) - (a.rm1||0))
      .slice(0, limite);

    return entries.map(([ref, pr]) => ({
      ref,
      nom:   EXERCICES[ref]?.nom   || ref,
      emoji: EXERCICES[ref]?.emoji || '💪',
      ...pr
    }));
  },

  // ─── VOLUME PAR SEMAINE ───────────────────────────────────
  getVolumeParSemaine(n = 8) {
    return Tracker.getVolumeParSemaine(n);
  },

  // ─── PROGRESSION EXERCICE ─────────────────────────────────
  getProgressionExercice(ref, periode = 30) {
    const hist  = Tracker.getHistoriqueExercice(ref, 200);
    const debut = Utils.ajouterJours(Utils.aujourd_hui(), -periode);
    const filtre = hist.filter(h => h.date >= debut);
    const parSemaine = {};

    filtre.forEach(h => {
      const sem = Utils.debutSemaine(h.date);
      if (!parSemaine[sem] || h.rm1 > (parSemaine[sem].rm1||0)) {
        parSemaine[sem] = h;
      }
    });

    return Object.entries(parSemaine)
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        label: Utils.formatDateCourt(date),
        poids: data.poids || 0,
        reps:  data.reps  || 0,
        rm1:   data.rm1   || 0
      }));
  },

  // ─── COMPARAISON SEMAINES ─────────────────────────────────
  getComparaisonSemaines() {
    const cette = Tracker.getVolumeSemaine();
    const avant = Tracker.getVolumeSemaine(
      Utils.ajouterJours(Utils.aujourd_hui(), -7)
    );
    const delta = avant > 0
      ? Math.round(((cette - avant) / avant) * 100)
      : 0;
    return { cette, avant, delta };
  },

  // ─── HEATMAP ──────────────────────────────────────────────
  getHeatmap(semaines = 12) {
    return Tracker.getHeatmapData(semaines * 7);
  },

  // ─── 1RM PAR EXERCICE ─────────────────────────────────────
  get1RMTable() {
    const prs   = Tracker.getAllPRs();
    const table = [];

    Object.entries(prs).forEach(([ref, pr]) => {
      if (!pr.rm1) return;
      const ex = EXERCICES[ref];
      if (!ex) return;
      table.push({
        ref,
        nom:   ex.nom,
        emoji: ex.emoji,
        rm1:   pr.rm1,
        poids: pr.poids,
        reps:  pr.reps,
        date:  pr.date
      });
    });

    return table.sort((a,b) => b.rm1 - a.rm1);
  },

  // ─── SUIVI CORPOREL ───────────────────────────────────────
  getEvolutionPoids() {
    const mesures = Tracker.getMesures();
    const poids   = Tracker.getHistoriquePoids(30);

    // Fusionner mesures + poids standalone
    const tous = [
      ...mesures.filter(m => m.poids).map(m => ({
        date:  m.date,
        poids: m.poids
      })),
      ...poids
    ];

    // Dédoublonner par date (garder dernier)
    const parDate = {};
    tous.forEach(e => { parDate[e.date] = e.poids; });

    return Object.entries(parDate)
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([date, poids]) => ({
        date,
        label: Utils.formatDateCourt(date),
        poids
      }));
  },

  getEvolutionMensurations() {
    return Tracker.getMesures()
      .filter(m => m.bras || m.poitrine || m.taille2 || m.hanches)
      .sort((a,b) => a.date.localeCompare(b.date))
      .map(m => ({ ...m, label: Utils.formatDateCourt(m.date) }));
  },

  getStatsCorps() {
    const profil  = Tracker.getProfil();
    const mesures = Tracker.getDerniereMesure() || {};
    const poids   = mesures.poids  || profil.poids  || 0;
    const taille  = mesures.taille || profil.taille || 0;
    const imc     = poids && taille ? Utils.calculerIMC(poids, taille) : null;
    const catIMC  = imc ? Utils.categorieIMC(imc) : null;

    // Première mesure vs maintenant
    const toutes     = Tracker.getMesures();
    const premiere   = toutes[0] || {};
    const deltaPoids = premiere.poids
      ? Utils.arrondir(poids - premiere.poids)
      : null;

    // Calories brûlées cette semaine
    const seances   = Tracker.getHistoriqueSeances(10);
    const calSemaine = seances
      .filter(s => s.date >= Utils.debutSemaine(Utils.aujourd_hui()))
      .reduce((acc, s) => {
        const dureeMin = Math.round((s.duree || 0) / 60);
        return acc + Utils.caloriesBrulees(dureeMin, poids, 'intense');
      }, 0);

    return {
      poids, taille, imc, catIMC,
      deltaPoids, calSemaine,
      premiere, mesureActuelle: mesures
    };
  },

  // ─── RENDU PAGE STATS ─────────────────────────────────────
  render(tab = 'dashboard') {
    const container = document.getElementById('page-content');
    if (!container) return;

    container.innerHTML = `
      <div class="tabs-container">
        ${['dashboard','corps','charges','graphiques','calendrier','trophees']
          .map(t => `
            <button class="tab-btn ${tab===t?'active':''}"
                    onclick="Stats.render('${t}')">
              ${{
                dashboard:  '📊 Dashboard',
                corps:      '⚖️ Corps',
                charges:    '🏋️ Charges',
                graphiques: '📈 Graphiques',
                calendrier: '🗓️ Calendrier',
                trophees:   '🏆 Trophées'
              }[t]}
            </button>`).join('')}
      </div>
      <div id="stats-content"></div>
    `;

    const content = document.getElementById('stats-content');

    switch(tab) {
      case 'dashboard':  this._renderDashboard(content);  break;
      case 'corps':      this._renderCorps(content);      break;
      case 'charges':    this._renderCharges(content);    break;
      case 'graphiques': this._renderGraphiques(content); break;
      case 'calendrier': this._renderCalendrier(content); break;
      case 'trophees':   this._renderTrophees(content);   break;
    }
  },

  // ─── DASHBOARD ────────────────────────────────────────────
  _renderDashboard(el) {
    const dash = this.getDashboard();
    const top  = this.getTopExercices();
    const comp = this.getComparaisonSemaines();
    const vol  = this.getVolumeParSemaine(8);

    el.innerHTML = `
      <div class="stats-grid mb-md">
        <div class="stat-card">
          <span class="stat-value">${dash.totalSeances}</span>
          <span class="stat-label">Séances</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${dash.streak}🔥</span>
          <span class="stat-label">Streak</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">
            ${Utils.formatVolume(dash.volumeSemaine)}
          </span>
          <span class="stat-label">Volume</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${dash.totalPRs}</span>
          <span class="stat-label">PRs</span>
        </div>
      </div>

      <div class="card mb-md">
        <div class="card-label">📊 Semaine en cours vs précédente</div>
        <div class="flex items-center justify-between mt-md">
          <div class="text-center">
            <div style="font-size:1.2rem;font-weight:700;
                        color:var(--fd-indigo)">
              ${Utils.formatVolume(comp.cette)}
            </div>
            <div style="font-size:.72rem;color:var(--text-muted)">
              Cette semaine
            </div>
          </div>
          <div class="text-center">
            <div style="font-size:1.4rem;font-weight:800;color:${
              comp.delta >= 0 ? 'var(--fd-mint)' : 'var(--fd-coral)'
            }">
              ${comp.delta >= 0 ? '+' : ''}${comp.delta}%
            </div>
          </div>
          <div class="text-center">
            <div style="font-size:1.2rem;font-weight:700;
                        color:var(--text-secondary)">
              ${Utils.formatVolume(comp.avant)}
            </div>
            <div style="font-size:.72rem;color:var(--text-muted)">
              Semaine préc.
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-md">
        <div class="card-label">🏆 Top Exercices — Records</div>
        ${top.length === 0 ? `
          <p style="color:var(--text-muted);text-align:center;
                    padding:var(--space-lg)">
            Aucun PR enregistré — commence tes séances !
          </p>` :
          top.map((ex, i) => `
            <div class="flex items-center justify-between"
                 style="padding:var(--space-sm) 0;
                        border-bottom:1px solid var(--border-color)">
              <div class="flex items-center gap-md">
                <span style="font-size:1.1rem;opacity:.5">
                  ${['🥇','🥈','🥉','4️⃣','5️⃣'][i]}
                </span>
                <div>
                  <div style="font-size:.9rem;font-weight:600">
                    ${ex.emoji} ${ex.nom}
                  </div>
                  <div style="font-size:.72rem;color:var(--text-muted)">
                    1RM estimé:
                    <strong style="color:var(--fd-lavender)">
                      ${ex.rm1}kg
                    </strong>
                  </div>
                </div>
              </div>
              <div style="text-align:right">
                <div style="font-size:.9rem;font-weight:700;
                            color:var(--fd-indigo)">
                  ${ex.poids}kg × ${ex.reps}
                </div>
                <div style="font-size:.68rem;color:var(--text-muted)">
                  ${ex.date || ''}
                </div>
              </div>
            </div>`).join('')}
      </div>

      <div class="chart-container mb-md">
        <div class="chart-title">📈 Volume par semaine (kg)</div>
        <canvas id="chart-volume" class="chart-canvas" height="160"></canvas>
      </div>
    `;

    requestAnimationFrame(() => {
      const canvas = document.getElementById('chart-volume');
      if (canvas && vol.length > 0) {
        Utils.graphiques.barres(
          canvas,
          vol.map(v => v.label),
          vol.map(v => v.volume),
          { color: '#4b4bf9' }
        );
      }
    });
  },

  // ─── SUIVI CORPS ──────────────────────────────────────────
  _renderCorps(el) {
    const stats   = this.getStatsCorps();
    const evolPoids = this.getEvolutionPoids();
    const evolMens  = this.getEvolutionMensurations();
    const derniere  = Tracker.getDerniereMesure() || {};

    el.innerHTML = `

      <!-- IMC + Stats -->
      <div class="card mb-md"
           style="background:linear-gradient(135deg,
                  rgba(75,75,249,0.2) 0%,
                  rgba(139,240,187,0.1) 100%)">
        <div class="card-label">🧮 Bilan corporel</div>
        <div class="stats-grid mt-md">
          <div class="stat-card">
            <span class="stat-value">${stats.poids || '—'}</span>
            <span class="stat-label">Poids (kg)</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">${stats.taille || '—'}</span>
            <span class="stat-label">Taille (cm)</span>
          </div>
          <div class="stat-card">
            <span class="stat-value"
                  style="color:${stats.catIMC?.color || 'var(--fd-mint)'}">
              ${stats.imc || '—'}
            </span>
            <span class="stat-label">IMC</span>
          </div>
          <div class="stat-card">
            <span class="stat-value"
                  style="color:var(--fd-lemon)">
              ${stats.calSemaine || 0}
            </span>
            <span class="stat-label">Cal/semaine</span>
          </div>
        </div>

        ${stats.catIMC ? `
          <div style="margin-top:var(--space-md);padding:var(--space-sm);
                      background:${stats.catIMC.color}22;
                      border:1px solid ${stats.catIMC.color}44;
                      border-radius:var(--radius-sm);
                      text-align:center;font-size:.82rem;
                      color:${stats.catIMC.color};font-weight:600">
            ${stats.catIMC.label}
          </div>` : ''}

        ${stats.deltaPoids !== null ? `
          <div style="margin-top:var(--space-sm);text-align:center;
                      font-size:.8rem;color:var(--text-muted)">
            Depuis le début :
            <span style="font-weight:700;color:${
              stats.deltaPoids <= 0
                ? 'var(--fd-mint)'
                : 'var(--fd-coral)'
            }">
              ${stats.deltaPoids > 0 ? '+' : ''}${stats.deltaPoids} kg
            </span>
          </div>` : ''}
      </div>

      <!-- Nouvelle mesure -->
      <div class="card mb-md">
        <div class="card-label">📏 Ajouter une mesure</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;
                    gap:var(--space-sm);margin-top:var(--space-md)">
          ${[
            { id:'c-poids',    label:'Poids (kg)',    val: stats.poids    || '' },
            { id:'c-taille',   label:'Taille (cm)',   val: stats.taille   || '' },
            { id:'c-bras',     label:'Bras (cm)',     val: derniere.bras     || '' },
            { id:'c-poitrine', label:'Poitrine (cm)', val: derniere.poitrine || '' },
            { id:'c-tour',     label:'Tour taille (cm)', val: derniere.taille2 || '' },
            { id:'c-hanches',  label:'Hanches (cm)',  val: derniere.hanches  || '' }
          ].map(f => `
            <div>
              <div class="input-label">${f.label}</div>
              <input class="input" id="${f.id}" type="number"
                     placeholder="${f.label}"
                     value="${f.val}" step="0.1" />
            </div>`).join('')}
        </div>
        <button class="btn-primary mt-md"
                onclick="Stats._sauvegarderMesure()">
          💾 Enregistrer
        </button>
      </div>

      <!-- Évolution poids -->
      <div class="card mb-md">
        <div style="display:flex;align-items:center;
                    justify-content:space-between;
                    margin-bottom:var(--space-md)">
          <div class="card-label" style="margin:0">
            ⚖️ Évolution du poids
          </div>
          <span style="font-size:.72rem;color:var(--text-muted)">
            ${evolPoids.length} mesures
          </span>
        </div>
        ${evolPoids.length < 2 ? `
          <div style="text-align:center;padding:var(--space-xl);
                      color:var(--text-muted);font-size:.85rem">
            📊 Ajoute au moins 2 mesures pour voir l'évolution
          </div>` : `
          <canvas id="chart-poids" height="160"></canvas>`}
      </div>

      <!-- Évolution mensurations -->
      <div class="card mb-md">
        <div class="card-label">📐 Évolution mensurations</div>
        ${evolMens.length < 2 ? `
          <div style="text-align:center;padding:var(--space-xl);
                      color:var(--text-muted);font-size:.85rem">
            📊 Ajoute au moins 2 mesures pour voir l'évolution
          </div>` : `
          <canvas id="chart-mensur" height="160"></canvas>`}
      </div>

      <!-- Comparaison première vs maintenant -->
      ${stats.premiere.date ? `
        <div class="card mb-md">
          <div class="card-label">
            📊 Progression depuis le début
            <span style="font-size:.68rem;color:var(--text-muted);
                         font-weight:400;margin-left:4px">
              (depuis ${Utils.formatDateCourt(stats.premiere.date)})
            </span>
          </div>
          <div style="margin-top:var(--space-md)">
            ${[
              {
                label: '⚖️ Poids',
                avant: stats.premiere.poids,
                apres: stats.poids,
                unite: 'kg',
                inverser: true
              },
              {
                label: '💪 Bras',
                avant: stats.premiere.bras,
                apres: derniere.bras,
                unite: 'cm'
              },
              {
                label: '🫀 Poitrine',
                avant: stats.premiere.poitrine,
                apres: derniere.poitrine,
                unite: 'cm'
              },
              {
                label: '📏 Tour taille',
                avant: stats.premiere.taille2,
                apres: derniere.taille2,
                unite: 'cm',
                inverser: true
              },
              {
                label: '🦵 Hanches',
                avant: stats.premiere.hanches,
                apres: derniere.hanches,
                unite: 'cm'
              }
            ]
            .filter(r => r.avant && r.apres)
            .map(r => {
              const delta  = Utils.arrondir(r.apres - r.avant);
              const positif = r.inverser ? delta <= 0 : delta >= 0;
              const couleur = positif
                ? 'var(--fd-mint)'
                : 'var(--fd-coral)';
              return `
                <div class="score-row">
                  <span class="score-row-label">${r.label}</span>
                  <div style="display:flex;align-items:center;gap:8px">
                    <span style="font-size:.78rem;color:var(--text-muted)">
                      ${r.avant}${r.unite}
                    </span>
                    <span style="color:var(--text-muted)">→</span>
                    <span style="font-weight:700">
                      ${r.apres}${r.unite}
                    </span>
                    <span style="font-size:.72rem;font-weight:700;
                                 color:${couleur}">
                      ${delta > 0 ? '+' : ''}${delta}${r.unite}
                    </span>
                  </div>
                </div>`;
            }).join('') || `
              <p style="color:var(--text-muted);text-align:center;
                         font-size:.85rem;padding:var(--space-md)">
                Pas encore assez de données
              </p>`}
          </div>
        </div>` : ''}

      <!-- Historique mesures -->
      <div class="card">
        <div class="card-label">📋 Historique mesures</div>
        ${Tracker.getMesures().length === 0 ? `
          <p style="color:var(--text-muted);text-align:center;
                    padding:var(--space-lg);font-size:.85rem">
            Aucune mesure enregistrée
          </p>` :
          [...Tracker.getMesures()]
            .reverse()
            .slice(0, 10)
            .map(m => `
              <div style="padding:var(--space-sm) 0;
                          border-bottom:1px solid var(--border-color);
                          font-size:.82rem">
                <div style="font-weight:600;color:var(--fd-indigo);
                             margin-bottom:2px">
                  ${Utils.formatDateCourt(m.date)}
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;
                             color:var(--text-secondary)">
                  ${m.poids    ? `<span>⚖️ ${m.poids}kg</span>`      : ''}
                  ${m.taille   ? `<span>📏 ${m.taille}cm</span>`      : ''}
                  ${m.bras     ? `<span>💪 Bras: ${m.bras}cm</span>`  : ''}
                  ${m.poitrine ? `<span>🫀 ${m.poitrine}cm</span>`    : ''}
                  ${m.taille2  ? `<span>📐 Tour: ${m.taille2}cm</span>`: ''}
                  ${m.hanches  ? `<span>🦵 ${m.hanches}cm</span>`     : ''}
                </div>
              </div>`).join('')}
      </div>
    `;

    // ── Graphiques
    requestAnimationFrame(() => {

      // Poids
      if (evolPoids.length >= 2) {
        const c = document.getElementById('chart-poids');
        if (c) {
          Utils.graphiques.ligne(
            c,
            evolPoids.map(p => p.label),
            [{ valeurs: evolPoids.map(p => p.poids), color: '#ff8d96' }]
          );
        }
      }

      // Mensurations
      if (evolMens.length >= 2) {
        const c = document.getElementById('chart-mensur');
        if (c) {
          const datasets = [];
          const zones = [
            { key:'bras',     color:'#4b4bf9', label:'Bras'      },
            { key:'poitrine', color:'#8bf0bb', label:'Poitrine'  },
            { key:'taille2',  color:'#f9ef77', label:'Tour taille'},
            { key:'hanches',  color:'#bfa1ff', label:'Hanches'   }
          ];
          zones.forEach(z => {
            const vals = evolMens.map(m => m[z.key] || null).filter(Boolean);
            if (vals.length >= 2) {
              datasets.push({ valeurs: evolMens.map(m => m[z.key]||0), color: z.color });
            }
          });
          if (datasets.length > 0) {
            Utils.graphiques.ligne(
              c,
              evolMens.map(m => m.label),
              datasets
            );
          }
        }
      }
    });
  },

  // ─── SAUVEGARDER MESURE ───────────────────────────────────
  _sauvegarderMesure() {
    const poids    = parseFloat(document.getElementById('c-poids')?.value)    || undefined;
    const taille   = parseFloat(document.getElementById('c-taille')?.value)   || undefined;
    const bras     = parseFloat(document.getElementById('c-bras')?.value)     || undefined;
    const poitrine = parseFloat(document.getElementById('c-poitrine')?.value) || undefined;
    const taille2  = parseFloat(document.getElementById('c-tour')?.value)     || undefined;
    const hanches  = parseFloat(document.getElementById('c-hanches')?.value)  || undefined;

    if (!poids && !taille && !bras && !poitrine && !taille2 && !hanches) {
      Utils.toast('Remplis au moins une mesure !', 'error');
      return;
    }

    Tracker.ajouterMesure({ poids, taille, bras, poitrine, taille2, hanches });

    // Sync poids dans l'historique dédié
    if (poids) Tracker.ajouterPoids(poids);

    // Sync profil
    if (poids)  Tracker.sauvegarderProfil({ poids });
    if (taille) Tracker.sauvegarderProfil({ taille });

    Gamification.ajouterXP(20, 'mesure corporelle');
    Utils.toast('✅ Mesure enregistrée !', 'success');
    Utils.vibrerBeep();

    // Refresh
    this._renderCorps(document.getElementById('stats-content'));
  },

  // ─── CHARGES ──────────────────────────────────────────────
  _renderCharges(el) {
    const table  = this.get1RMTable();
    const exRefs = Object.keys(EXERCICES).slice(0, 15);

    el.innerHTML = `
      <div class="card mb-md">
        <div class="card-label">🔍 Sélectionner un exercice</div>
        <select id="select-exercice" class="input mt-md">
          <option value="">-- Choisir --</option>
          ${exRefs.map(ref => `
            <option value="${ref}">
              ${EXERCICES[ref]?.emoji||''} ${EXERCICES[ref]?.nom||ref}
            </option>`).join('')}
        </select>
      </div>

      <div id="detail-exercice"></div>

      <div class="card">
        <div class="card-label">📊 Tableau 1RM — Tous les exercices</div>
        ${table.length === 0 ? `
          <p style="color:var(--text-muted);text-align:center;
                    padding:var(--space-lg)">
            Pas encore de données. Lance-toi !
          </p>` :
          table.map(ex => `
            <div class="flex items-center justify-between"
                 style="padding:var(--space-sm) 0;
                        border-bottom:1px solid var(--border-color)">
              <div>
                <div style="font-size:.88rem;font-weight:600">
                  ${ex.emoji} ${ex.nom}
                </div>
              </div>
              <div style="text-align:right">
                <div style="font-size:.9rem;font-weight:700;
                            color:var(--fd-indigo)">
                  1RM: ${ex.rm1}kg
                </div>
                <div style="font-size:.7rem;color:var(--text-muted)">
                  ${ex.poids}kg × ${ex.reps} reps
                </div>
              </div>
            </div>`).join('')}
      </div>
    `;

    document.getElementById('select-exercice').onchange = (e) => {
      if (e.target.value) this._renderDetailExercice(e.target.value);
    };
  },

  _renderDetailExercice(ref) {
    const el   = document.getElementById('detail-exercice');
    const ex   = EXERCICES[ref];
    const pr   = Tracker.getPR(ref);
    const prog = this.getProgressionExercice(ref, 60);

    el.innerHTML = `
      <div class="card mb-md">
        <div class="card-label">${ex?.emoji} ${ex?.nom}</div>
        <div class="flex items-center justify-between mt-md">
          <div class="text-center">
            <div style="font-size:1.4rem;font-weight:800;
                        color:var(--fd-lemon)">
              ${pr?.rm1 || 0}kg
            </div>
            <div style="font-size:.7rem;color:var(--text-muted)">1RM Estimé</div>
          </div>
          <div class="text-center">
            <div style="font-size:1.4rem;font-weight:800;
                        color:var(--fd-indigo)">
              ${pr?.poids || 0}kg
            </div>
            <div style="font-size:.7rem;color:var(--text-muted)">Meilleur poids</div>
          </div>
          <div class="text-center">
            <div style="font-size:1.4rem;font-weight:800;
                        color:var(--fd-mint)">
              ${pr?.reps || 0}
            </div>
            <div style="font-size:.7rem;color:var(--text-muted)">Meilleur reps</div>
          </div>
        </div>
        ${prog.length > 1 ? `
          <div style="margin-top:var(--space-md)">
            <div class="chart-title" style="font-size:.72rem">
              📈 Progression (1RM kg)
            </div>
            <canvas id="chart-exo" height="140"></canvas>
          </div>` : `
          <p style="color:var(--text-muted);text-align:center;
                    padding:var(--space-md);font-size:.85rem">
            Pas encore assez de données.
          </p>`}
      </div>
    `;

    if (prog.length > 1) {
      requestAnimationFrame(() => {
        const canvas = document.getElementById('chart-exo');
        if (canvas) {
          Utils.graphiques.ligne(
            canvas,
            prog.map(p => p.label),
            [{ valeurs: prog.map(p => p.rm1), color: '#bfa1ff' }]
          );
        }
      });
    }
  },

  // ─── GRAPHIQUES ───────────────────────────────────────────
  _renderGraphiques(el) {
    const refs    = Object.keys(EXERCICES).filter(r => Tracker.getPR(r));
    const periodes = ['30','60','90','180'];

    el.innerHTML = `
      <div class="card mb-md">
        <div class="flex gap-sm"
             style="flex-wrap:wrap;margin-bottom:var(--space-md)">
          <select id="sel-graph-exo" class="input" style="flex:1">
            <option value="">-- Exercice --</option>
            ${refs.map(r => `
              <option value="${r}">
                ${EXERCICES[r]?.nom || r}
              </option>`).join('')}
          </select>
          <select id="sel-graph-metric" class="input" style="flex:1">
            <option value="rm1">1RM (kg)</option>
            <option value="poids">Poids (kg)</option>
            <option value="reps">Reps</option>
          </select>
        </div>
        <div class="flex gap-sm"
             style="margin-bottom:var(--space-md)">
          ${periodes.map(p => `
            <button class="preset-btn ${p==='30'?'active':''}"
                    data-periode="${p}"
                    onclick="Stats._changerPeriode(this)">
              ${p}j
            </button>`).join('')}
        </div>
        <canvas id="chart-main" height="180"></canvas>
      </div>

      <div class="chart-container">
        <div class="chart-title">📊 Volume total — 8 semaines</div>
        <canvas id="chart-vol-8" height="160"></canvas>
      </div>
    `;

    requestAnimationFrame(() => {
      const vol    = this.getVolumeParSemaine(8);
      const canvas = document.getElementById('chart-vol-8');
      if (canvas) {
        Utils.graphiques.barres(
          canvas,
          vol.map(v => v.label),
          vol.map(v => v.volume)
        );
      }
    });

    const update = () => {
      const ref     = document.getElementById('sel-graph-exo')?.value;
      const metric  = document.getElementById('sel-graph-metric')?.value || 'rm1';
      const periode = document.querySelector('.preset-btn.active')?.dataset.periode || '30';
      if (!ref) return;
      const prog   = this.getProgressionExercice(ref, parseInt(periode));
      const canvas = document.getElementById('chart-main');
      if (canvas && prog.length > 0) {
        Utils.graphiques.ligne(
          canvas,
          prog.map(p => p.label),
          [{ valeurs: prog.map(p => p[metric]||0), color: '#4b4bf9' }]
        );
      }
    };

    document.getElementById('sel-graph-exo')
      ?.addEventListener('change', update);
    document.getElementById('sel-graph-metric')
      ?.addEventListener('change', update);
  },

  _changerPeriode(btn) {
    document.querySelectorAll('.preset-btn[data-periode]')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const exo    = document.getElementById('sel-graph-exo')?.value;
    const metric = document.getElementById('sel-graph-metric')?.value || 'rm1';
    const periode = btn.dataset.periode;
    if (!exo) return;

    const prog   = this.getProgressionExercice(exo, parseInt(periode));
    const canvas = document.getElementById('chart-main');
    if (canvas && prog.length > 0) {
      Utils.graphiques.ligne(
        canvas,
        prog.map(p => p.label),
        [{ valeurs: prog.map(p => p[metric]||0), color: '#4b4bf9' }]
      );
    }
  },

  // ─── CALENDRIER ───────────────────────────────────────────
  _renderCalendrier(el) {
    const heatmap = this.getHeatmap(12);
    const today   = Utils.aujourd_hui();
    const jours   = ['L','M','M','J','V','S','D'];

    const debutGrille = Utils.debutSemaine(
      Utils.ajouterJours(today, -77)
    );

    let cellules = '';
    for (let s = 0; s < 12; s++) {
      for (let j = 0; j < 7; j++) {
        const date  = Utils.ajouterJours(debutGrille, s*7 + j);
        const etat  = heatmap[date] || 'none';
        const title = `${date} — ${
          etat==='done'   ? '✅ Séance'  :
          etat==='rest'   ? '😴 Repos'  :
          etat==='missed' ? '❌ Manquée': '⬜ Vide'
        }`;
        cellules += `
          <div class="heatmap-cell level-${
            etat==='done' ? '3' : '0'
          } ${etat==='rest'?'rest':''} ${etat==='missed'?'missed':''}"
               title="${title}"
               style="${date===today
                 ? 'outline:2px solid var(--fd-indigo)'
                 : ''}">
          </div>`;
      }
    }

    el.innerHTML = `
      <div class="flex gap-md items-center mb-md"
           style="flex-wrap:wrap">
        <div class="flex items-center gap-sm">
          <div class="heatmap-cell level-3"
               style="width:16px;height:16px;display:inline-block"></div>
          <span style="font-size:.75rem;color:var(--text-muted)">Séance</span>
        </div>
        <div class="flex items-center gap-sm">
          <div class="heatmap-cell rest"
               style="width:16px;height:16px;display:inline-block"></div>
          <span style="font-size:.75rem;color:var(--text-muted)">Repos</span>
        </div>
        <div class="flex items-center gap-sm">
          <div class="heatmap-cell missed"
               style="width:16px;height:16px;display:inline-block"></div>
          <span style="font-size:.75rem;color:var(--text-muted)">Manquée</span>
        </div>
      </div>

      <div class="card mb-md">
        <div class="card-label">📅 12 dernières semaines</div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);
                    gap:3px;margin-bottom:4px;margin-top:var(--space-sm)">
          ${jours.map(j => `
            <div style="text-align:center;font-size:.65rem;
                        color:var(--text-muted)">${j}</div>
          `).join('')}
        </div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px">
          ${cellules}
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value" style="color:var(--fd-mint)">
            ${Object.values(heatmap).filter(v=>v==='done').length}
          </span>
          <span class="stat-label">Séances</span>
        </div>
        <div class="stat-card">
          <span class="stat-value" style="color:var(--fd-coral)">
            ${Object.values(heatmap).filter(v=>v==='missed').length}
          </span>
          <span class="stat-label">Manquées</span>
        </div>
        <div class="stat-card">
          <span class="stat-value" style="color:var(--fd-lemon)">
            ${Tracker.getStreak().max}🔥
          </span>
          <span class="stat-label">Streak Max</span>
        </div>
        <div class="stat-card">
          <span class="stat-value" style="color:var(--fd-lavender)">
            ${Math.round(
              (Object.values(heatmap).filter(v=>v==='done').length /
               Math.max(1,
                Object.values(heatmap).filter(v=>v!=='none').length
               )) * 100
            )}%
          </span>
          <span class="stat-label">Assiduité</span>
        </div>
      </div>
    `;
  },

  // ─── TROPHÉES ─────────────────────────────────────────────
  _renderTrophees(el) {
    const xpData     = Gamification.getXP();
    const trophees   = Gamification.getTrophees();
    const debloquees = trophees.filter(t =>  t.debloquee);
    const verrou     = trophees.filter(t => !t.debloquee);

    el.innerHTML = `
      <div class="xp-bar-container mb-md">
        <div class="xp-info">
          <span class="xp-level">
            ${xpData.niveau.emoji} Niveau ${xpData.niveau.numero}
            — ${xpData.niveau.nom}
          </span>
          <span class="xp-count">
            ${xpData.total} / ${xpData.niveau.xpSuivant} XP
          </span>
        </div>
        <div class="xp-bar">
          <div class="xp-fill" style="width:${xpData.pourcentage}%"></div>
        </div>
      </div>

      <div class="section-title">
        🏆 Débloqués (${debloquees.length}/${trophees.length})
      </div>

      <div class="trophy-grid mb-md">
        ${debloquees.map(t => `
          <div class="trophy-card unlocked">
            <div class="trophy-icon">${t.emoji}</div>
            <div class="trophy-name">${t.nom}</div>
            <div style="font-size:.6rem;color:var(--fd-lemon);margin-top:2px">
              +${t.xp} XP
            </div>
          </div>`).join('')
          || `<p style="color:var(--text-muted);grid-column:1/-1;
                         text-align:center;padding:var(--space-md)">
               Lance ta première séance !
              </p>`}
      </div>

      <div class="section-title">🔒 À débloquer</div>

      <div class="trophy-grid">
        ${verrou.map(t => `
          <div class="trophy-card locked" title="${t.description}">
            <div class="trophy-icon">${t.emoji}</div>
            <div class="trophy-name">${t.nom}</div>
            <div style="font-size:.6rem;color:var(--text-muted);margin-top:2px">
              +${t.xp} XP
            </div>
          </div>`).join('')}
      </div>
    `;
  }
};

window.Stats = Stats;
console.log('✅ Stats chargé');
