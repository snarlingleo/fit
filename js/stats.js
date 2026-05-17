/* ============================================================
   FitTracker Pro — Stats v3.0
   Dashboard + Corps + Charges + Graphiques + Calendrier
   + Photos progression + Historique détaillé + Supersets
   ============================================================ */

const Stats = {

  // ════════════════════════════════════════════════════════
  // DASHBOARD
  // ════════════════════════════════════════════════════════
  getDashboard() {
    const streak     = Tracker.getStreak();
    const profil     = Tracker.getProfil();
    const prs        = Tracker.getAllPRs();
    const volume     = Tracker.getVolumeSemaine();
    const seances    = Tracker.getTotalSeances();
    const scoreForme = Tracker.calculerScoreForme();
    const infos      = Programme.getInfosProgramme();
    const comp       = Tracker.getComparaisonSemaines();

    return {
      totalSeances:  seances,
      streak:        streak.count,
      streakMax:     streak.max,
      volumeSemaine: volume,
      totalPRs:      Object.keys(prs).length,
      scoreForme,
      infos,
      profil,
      comp
    };
  },

  // ════════════════════════════════════════════════════════
  // TOP EXERCICES
  // ════════════════════════════════════════════════════════
  getTopExercices(limite = 5) {
    const prs = Tracker.getAllPRs();
    return Object.entries(prs)
      .filter(([,v]) => v.rm1 > 0)
      .sort(([,a],[,b]) => (b.rm1||0) - (a.rm1||0))
      .slice(0, limite)
      .map(([ref, pr]) => ({
        ref,
        nom:   EXERCICES[ref]?.nom   || ref,
        emoji: EXERCICES[ref]?.emoji || '💪',
        muscle: EXERCICES[ref]?.muscle || '',
        ...pr
      }));
  },

  getVolumeParSemaine(n = 8) {
    return Tracker.getVolumeParSemaine(n);
  },

  getProgressionExercice(ref, periode = 30) {
    const hist   = Tracker.getHistoriqueExercice(ref, 200);
    const debut  = Utils.ajouterJours(Utils.aujourd_hui(), -periode);
    const filtre = hist.filter(h => h.date >= debut);
    const parSemaine = {};

    filtre.forEach(h => {
      const sem = Utils.debutSemaine(h.date);
      if (!parSemaine[sem]
          || (h.rm1||0) > (parSemaine[sem].rm1||0)) {
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

  getComparaisonSemaines() {
    return Tracker.getComparaisonSemaines();
  },

  getHeatmap(semaines = 12) {
    return Tracker.getHeatmapData(semaines * 7);
  },

  get1RMTable() {
    const prs   = Tracker.getAllPRs();
    const table = [];

    Object.entries(prs).forEach(([ref, pr]) => {
      if (!pr.rm1) return;
      const ex = EXERCICES[ref];
      if (!ex) return;
      table.push({
        ref,
        nom:    ex.nom,
        emoji:  ex.emoji,
        muscle: ex.muscle,
        rm1:    pr.rm1,
        poids:  pr.poids,
        reps:   pr.reps,
        date:   pr.date,
        ancienPR: pr.ancienPR
      });
    });

    return table.sort((a,b) => b.rm1 - a.rm1);
  },

  // ════════════════════════════════════════════════════════
  // STATS CORPORELLES
  // ════════════════════════════════════════════════════════
  getEvolutionPoids() {
    const mesures = Tracker.getMesures();
    const poids   = Tracker.getHistoriquePoids(30);

    const tous = [
      ...mesures.filter(m => m.poids).map(m => ({
        date:  m.date,
        poids: m.poids
      })),
      ...poids
    ];

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
      .filter(m => m.bras || m.poitrine
               || m.taille2 || m.hanches)
      .sort((a,b) => a.date.localeCompare(b.date))
      .map(m => ({
        ...m,
        label: Utils.formatDateCourt(m.date)
      }));
  },

  getStatsCorps() {
    const profil  = Tracker.getProfil();
    const mesures = Tracker.getDerniereMesure() || {};
    const poids   = mesures.poids  || profil.poids  || 0;
    const taille  = mesures.taille || profil.taille || 0;
    const imc     = poids && taille
      ? Utils.calculerIMC(poids, taille) : null;
    const catIMC  = imc ? Utils.categorieIMC(imc) : null;

    const toutes     = Tracker.getMesures();
    const premiere   = toutes[0] || {};
    const deltaPoids = premiere.poids
      ? Utils.arrondir(poids - premiere.poids)
      : null;

    const seances    = Tracker.getHistoriqueSeances(10);
    const calSemaine = seances
      .filter(s =>
        s.date >= Utils.debutSemaine(Utils.aujourd_hui())
      )
      .reduce((acc, s) => {
        const dureeMin = Math.round((s.duree||0) / 60);
        return acc + Utils.caloriesBrulees(
          dureeMin, poids, 'intense'
        );
      }, 0);

    return {
      poids, taille, imc, catIMC,
      deltaPoids, calSemaine,
      premiere, mesureActuelle: mesures
    };
  },

  // ════════════════════════════════════════════════════════
  // RENDER PRINCIPAL
  // ════════════════════════════════════════════════════════
  render(containerExterne = null, tab = 'dashboard') {
    const container = containerExterne
      || document.getElementById('page-content');
    if (!container) return;

    const tabs = [
      'dashboard','historique','corps',
      'photos','charges','graphiques',
      'calendrier','trophees'
    ];

    container.innerHTML = `
      <div class="tabs-container">
        ${tabs.map(t => `
          <button class="tab-btn ${tab===t?'active':''}"
                  onclick="Stats.render(
                    document.getElementById('stats-wrapper')
                      || document.getElementById('profil-content')
                      || document.getElementById('page-content'),
                    '${t}')">
            ${{
              dashboard:  '📊 Dashboard',
              historique: '📋 Historique',
              corps:      '⚖️ Corps',
              photos:     '📸 Photos',
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
      case 'historique': this._renderHistorique(content); break;
      case 'corps':      this._renderCorps(content);      break;
      case 'photos':     this._renderPhotos(content);     break;
      case 'charges':    this._renderCharges(content);    break;
      case 'graphiques': this._renderGraphiques(content); break;
      case 'calendrier': this._renderCalendrier(content); break;
      case 'trophees':   this._renderTrophees(content);   break;
    }
  },

  // ════════════════════════════════════════════════════════
  // DASHBOARD TAB
  // ════════════════════════════════════════════════════════
  _renderDashboard(el) {
    const dash = this.getDashboard();
    const top  = this.getTopExercices(5);
    const comp = this.getComparaisonSemaines();
    const vol  = this.getVolumeParSemaine(8);
    const rpe  = Tracker.getRPEParSemaine(8);

    el.innerHTML = `

      <!-- KPIs -->
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

      <!-- Comparaison semaines -->
      <div class="card mb-md">
        <div class="card-label">
          📊 Cette semaine vs précédente
        </div>
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
            <div style="font-size:1.6rem;font-weight:800;
                        color:${comp.delta >= 0
                          ? 'var(--fd-mint)'
                          : 'var(--fd-coral)'}">
              ${comp.delta >= 0 ? '+' : ''}${comp.delta}%
            </div>
            <div style="font-size:.65rem;color:var(--text-muted)">
              évolution
            </div>
          </div>
          <div class="text-center">
            <div style="font-size:1.2rem;font-weight:700;
                        color:var(--text-secondary)">
              ${Utils.formatVolume(comp.prec)}
            </div>
            <div style="font-size:.72rem;color:var(--text-muted)">
              Semaine préc.
            </div>
          </div>
        </div>
      </div>

      <!-- Score forme -->
      <div class="card mb-md">
        <div class="card-label">💪 Score de forme</div>
        <div class="flex gap-md mt-md">
          ${[
            { label:'Récupération', val:dash.scoreForme.recup,
              color:'var(--fd-mint)'     },
            { label:'Assiduité',    val:dash.scoreForme.assiduite,
              color:'var(--fd-indigo)'   },
            { label:'Progression',  val:dash.scoreForme.progression,
              color:'var(--fd-lavender)' }
          ].map(s => `
            <div style="flex:1;text-align:center">
              <div style="font-size:1.1rem;font-weight:800;
                          color:${s.color}">
                ${s.val}%
              </div>
              <div style="font-size:.65rem;color:var(--text-muted);
                          margin-top:2px">
                ${s.label}
              </div>
              <div style="height:4px;background:var(--bg-input);
                          border-radius:99px;margin-top:4px;
                          overflow:hidden">
                <div style="height:100%;width:${s.val}%;
                            background:${s.color};
                            border-radius:99px;
                            transition:width 1s"></div>
              </div>
            </div>`).join('')}
        </div>
      </div>

      <!-- Top 5 Exercices -->
      <div class="card mb-md">
        <div class="card-label">🏆 Top Records Personnels</div>
        ${top.length === 0 ? `
          <p style="color:var(--text-muted);text-align:center;
                    padding:var(--space-lg)">
            Commence tes séances pour voir tes records !
          </p>` :
          top.map((ex, i) => `
            <div class="flex items-center justify-between"
                 style="padding:var(--space-sm) 0;
                        border-bottom:1px solid var(--border-color)">
              <div class="flex items-center gap-md">
                <span style="font-size:1.1rem">
                  ${['🥇','🥈','🥉','4️⃣','5️⃣'][i]}
                </span>
                <div>
                  <div style="font-size:.88rem;font-weight:600">
                    ${ex.emoji} ${ex.nom}
                  </div>
                  <div style="font-size:.68rem;
                              color:var(--fd-mint)">
                    ${ex.muscle}
                  </div>
                </div>
              </div>
              <div style="text-align:right">
                <div style="font-size:.9rem;font-weight:700;
                            color:var(--fd-indigo)">
                  ${ex.poids}kg × ${ex.reps}
                </div>
                <div style="font-size:.68rem;
                            color:var(--fd-lavender)">
                  1RM: ${ex.rm1}kg
                </div>
              </div>
            </div>`).join('')}
      </div>

      <!-- Volume chart -->
      <div class="chart-container mb-md">
        <div class="chart-title">📈 Volume par semaine (kg)</div>
        <canvas id="chart-volume" height="160"></canvas>
      </div>

      <!-- RPE chart -->
      ${rpe.length > 1 ? `
        <div class="chart-container mb-md">
          <div class="chart-title">
            😤 RPE moyen par semaine
          </div>
          <canvas id="chart-rpe" height="140"></canvas>
        </div>` : ''}

      <!-- Répartition muscles -->
      <div class="card mb-md">
        <div class="card-label">💪 Répartition muscles</div>
        ${this._renderRepartitionMuscles()}
      </div>
    `;

    requestAnimationFrame(() => {
      // Volume
      const cvol = document.getElementById('chart-volume');
      if (cvol && vol.length > 0) {
        Utils.graphiques.barres(
          cvol,
          vol.map(v => v.label),
          vol.map(v => v.volume),
          { color: '#4b4bf9' }
        );
      }

      // RPE
      const crpe = document.getElementById('chart-rpe');
      if (crpe && rpe.length > 1) {
        Utils.graphiques.ligne(
          crpe,
          rpe.map(r => r.semaine),
          [{ valeurs: rpe.map(r => r.rpe), color: '#ff8d96' }]
        );
      }
    });
  },

  _renderRepartitionMuscles() {
    const muscles = Tracker.getRepartitionMuscles();
    if (!muscles.length) {
      return `<p style="color:var(--text-muted);
                        text-align:center;
                        padding:var(--space-md);
                        font-size:.85rem">
                Pas encore de données
              </p>`;
    }

    const total = muscles.reduce((a,m) => a + m.volume, 0);
    const colors = [
      '#4b4bf9','#8bf0bb','#f9ef77',
      '#bfa1ff','#ff8d96','#09092d'
    ];

    return `
      <div style="margin-top:var(--space-md)">
        ${muscles.slice(0,6).map((m, i) => {
          const pct = Math.round((m.volume / total) * 100);
          return `
            <div style="margin-bottom:var(--space-sm)">
              <div class="flex justify-between"
                   style="font-size:.78rem;margin-bottom:3px">
                <span style="font-weight:600">${m.muscle}</span>
                <span style="color:var(--text-muted)">
                  ${pct}% · ${Utils.formatVolume(m.volume)}
                </span>
              </div>
              <div style="height:6px;background:var(--bg-input);
                          border-radius:99px;overflow:hidden">
                <div style="height:100%;width:${pct}%;
                            background:${colors[i]};
                            border-radius:99px;
                            transition:width 1s .${i}s"></div>
              </div>
            </div>`;
        }).join('')}
      </div>`;
  },

  // ════════════════════════════════════════════════════════
  // HISTORIQUE TAB
  // ════════════════════════════════════════════════════════
  _renderHistorique(el) {
    const seances = Tracker.getHistoriqueSeancesAvecDetails(30);

    el.innerHTML = `
      <div class="flex justify-between items-center mb-md">
        <div class="card-label" style="margin:0">
          📋 ${seances.length} séances
        </div>
        <button class="btn-secondary btn-sm"
                onclick="Stats._exportHistorique()">
          📤 Exporter
        </button>
      </div>

      ${seances.length === 0 ? `
        <div class="card" style="text-align:center;
                                  padding:var(--space-xl)">
          <div style="font-size:3rem;margin-bottom:var(--space-md)">
            📋
          </div>
          <p style="color:var(--text-muted)">
            Aucune séance enregistrée.<br>
            Lance ta première séance !
          </p>
          <button class="btn-primary mt-md"
                  onclick="naviguer('live')">
            ⚡ Démarrer
          </button>
        </div>` :

        seances.map(s => {
          const nom = SEANCES_BASE[s.id]?.nom
            || s.id?.replace('express_','⚡ Express ')
            || s.id;
          const emoji = SEANCES_BASE[s.id]?.emoji || '💪';

          return `
            <div class="card mb-md"
                 onclick="Stats._afficherDetailSeance(
                   '${s.date}', '${s.id}'
                 )"
                 style="cursor:pointer;
                        transition:transform .15s">
              <div class="flex items-center
                          justify-between mb-sm">
                <div>
                  <div style="font-weight:700;font-size:.95rem">
                    ${emoji} ${nom}
                  </div>
                  <div style="font-size:.72rem;
                              color:var(--text-muted)">
                    ${Utils.formatDateLong
                      ? Utils.formatDateLong(s.date)
                      : s.date}
                  </div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:.82rem;font-weight:700;
                              color:var(--fd-indigo)">
                    ${Utils.formatDuree(s.duree||0)}
                  </div>
                  <div style="font-size:.68rem;
                              color:var(--text-muted)">
                    ${Utils.formatVolume(s.volumeTotal||0)}
                  </div>
                </div>
              </div>

              <!-- Exercices résumé -->
              <div style="display:flex;flex-wrap:wrap;gap:4px">
                ${(s.exercicesResume||[]).map(e => `
                  <span class="chip"
                        style="font-size:.65rem;padding:2px 6px">
                    ${e.emoji} ${e.nom}
                    <span style="color:var(--fd-indigo)">
                      ${e.maxPoids}kg
                    </span>
                  </span>`).join('')}
              </div>

              <!-- Stats rapides -->
              <div class="flex gap-md mt-sm"
                   style="font-size:.72rem;
                          color:var(--text-muted)">
                <span>
                  📊 ${s.series?.length||0} séries
                </span>
                ${s.rpesMoyen ? `
                  <span>😤 RPE ${s.rpesMoyen}</span>` : ''}
                ${s.prs?.length > 0 ? `
                  <span style="color:var(--fd-lemon)">
                    🏆 ${s.prs.length} PR
                  </span>` : ''}
              </div>
            </div>`;
        }).join('')}
    `;
  },

  _afficherDetailSeance(date, seanceId) {
    // Récupérer la séance
    let seanceData = null;
    for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i);
      if (cle === `ft_seance_${date}_${seanceId}`) {
        try {
          seanceData = JSON.parse(localStorage.getItem(cle));
        } catch(e) {}
        break;
      }
    }
    if (!seanceData) return;

    const modal   = document.getElementById('modal-info');
    const content = document.getElementById('modal-info-content');
    const nom     = SEANCES_BASE[seanceId]?.nom || seanceId;
    const emoji   = SEANCES_BASE[seanceId]?.emoji || '💪';

    content.innerHTML = `
      <h3 style="margin-bottom:var(--space-md)">
        ${emoji} ${nom}
      </h3>
      <div style="font-size:.78rem;color:var(--text-muted);
                  margin-bottom:var(--space-md)">
        📅 ${date}
      </div>

      <!-- KPIs -->
      <div class="stats-grid mb-md">
        <div class="stat-card">
          <span class="stat-value" style="font-size:1rem">
            ${Utils.formatDuree(seanceData.duree||0)}
          </span>
          <span class="stat-label">Durée</span>
        </div>
        <div class="stat-card">
          <span class="stat-value" style="font-size:1rem">
            ${Utils.formatVolume(seanceData.volumeTotal||0)}
          </span>
          <span class="stat-label">Volume</span>
        </div>
        <div class="stat-card">
          <span class="stat-value" style="font-size:1rem">
            ${seanceData.series?.length||0}
          </span>
          <span class="stat-label">Séries</span>
        </div>
        <div class="stat-card">
          <span class="stat-value" style="font-size:1rem">
            ${seanceData.rpesMoyen||'—'}
          </span>
          <span class="stat-label">RPE</span>
        </div>
      </div>

      <!-- Exercices détaillés -->
      <div class="card-label mb-sm">Exercices</div>
      ${[...new Set(
        (seanceData.series||[]).map(s => s.exerciceRef)
      )].map(ref => {
        const ex     = EXERCICES[ref] || {};
        const series = (seanceData.series||[])
          .filter(s => s.exerciceRef === ref);
        const isPR   = Tracker.getPR(ref)?.date === date;

        return `
          <div class="card mb-sm">
            <div class="flex items-center
                        justify-between mb-sm">
              <span style="font-weight:700;font-size:.88rem">
                ${ex.emoji||'💪'} ${ex.nom||ref}
                ${isPR ? '<span style="color:var(--fd-lemon)">🏆 PR</span>' : ''}
              </span>
              <span class="chip chip-indigo"
                    style="font-size:.65rem">
                ${ex.muscle||''}
              </span>
            </div>
            ${series.map((sr, i) => `
              <div class="flex justify-between"
                   style="font-size:.78rem;padding:3px 0;
                          border-bottom:1px solid
                          var(--border-color)">
                <span style="color:var(--text-muted)">
                  Série ${i+1}
                </span>
                <span style="font-weight:600">
                  ${sr.poids}kg × ${sr.reps}
                  ${sr.rpe
                    ? `<span style="color:var(--fd-coral);
                               font-size:.7rem">
                        RPE ${sr.rpe}
                       </span>`
                    : ''}
                </span>
              </div>`).join('')}
          </div>`;
      }).join('')}

      ${seanceData.note ? `
        <div class="card mt-md"
             style="background:rgba(75,75,249,0.08)">
          <div class="card-label">📔 Note</div>
          <p style="font-size:.85rem;margin-top:var(--space-xs);
                    color:var(--text-secondary)">
            ${seanceData.note}
          </p>
        </div>` : ''}
    `;

    modal.classList.remove('hidden');
    document.getElementById('modal-info-close').onclick =
      () => modal.classList.add('hidden');
    modal.querySelector('.modal-overlay')?.addEventListener(
      'click', () => modal.classList.add('hidden')
    );
  },

  _exportHistorique() {
    const seances = Tracker.getHistoriqueSeancesAvecDetails(999);
    const csv = [
      'Date,Séance,Durée(s),Volume(kg),Séries,RPE'
    ].concat(
      seances.map(s => [
        s.date,
        SEANCES_BASE[s.id]?.nom || s.id,
        s.duree || 0,
        Math.round(s.volumeTotal || 0),
        s.series?.length || 0,
        s.rpesMoyen || ''
      ].join(','))
    ).join('\n');

    const blob = new Blob([csv], { type:'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `powerapp-historique-${Utils.aujourd_hui()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    Utils.toast('✅ Export CSV téléchargé !', 'success');
  },

  // ════════════════════════════════════════════════════════
  // PHOTOS TAB
  // ════════════════════════════════════════════════════════
  _renderPhotos(el) {
    const photos = Tracker.getPhotos();
    const types  = [
      { val:'front', label:'Face',  emoji:'⬆️' },
      { val:'side',  label:'Côté',  emoji:'➡️' },
      { val:'back',  label:'Dos',   emoji:'⬇️' },
      { val:'custom',label:'Autre', emoji:'📷' }
    ];

    el.innerHTML = `

      <!-- Upload -->
      <div class="card mb-md">
        <div class="card-label">📸 Ajouter une photo</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;
                    gap:var(--space-sm);margin-top:var(--space-md)">
          <div>
            <div class="input-label">Type</div>
            <select class="input" id="photo-type">
              ${types.map(t => `
                <option value="${t.val}">
                  ${t.emoji} ${t.label}
                </option>`).join('')}
            </select>
          </div>
          <div>
            <div class="input-label">Note (optionnel)</div>
            <input class="input" id="photo-note"
                   placeholder="ex: Début programme" />
          </div>
        </div>
        <input type="file" id="photo-file"
               accept="image/*" capture="user"
               style="display:none"
               onchange="Stats._traiterPhoto(this)" />
        <button class="btn-primary mt-md"
                onclick="document.getElementById(
                  'photo-file').click()">
          📷 Choisir une photo
        </button>
      </div>

      <!-- Avant / Après -->
      ${photos.length >= 2 ? `
        <div class="card mb-md">
          <div class="card-label">🔄 Avant / Après</div>
          <div style="display:grid;
                      grid-template-columns:1fr 1fr;
                      gap:var(--space-md);
                      margin-top:var(--space-md)">
            <div style="text-align:center">
              <div style="font-size:.72rem;font-weight:700;
                          color:var(--text-muted);
                          margin-bottom:var(--space-sm)">
                AVANT
              </div>
              <img src="${photos[photos.length-1].image}"
                   style="width:100%;border-radius:var(--radius-md);
                          aspect-ratio:3/4;object-fit:cover" />
              <div style="font-size:.68rem;color:var(--text-muted);
                          margin-top:4px">
                ${photos[photos.length-1].date}
                ${photos[photos.length-1].poids
                  ? `· ${photos[photos.length-1].poids}kg` : ''}
              </div>
            </div>
            <div style="text-align:center">
              <div style="font-size:.72rem;font-weight:700;
                          color:var(--fd-indigo);
                          margin-bottom:var(--space-sm)">
                MAINTENANT
              </div>
              <img src="${photos[0].image}"
                   style="width:100%;border-radius:var(--radius-md);
                          aspect-ratio:3/4;object-fit:cover" />
              <div style="font-size:.68rem;color:var(--text-muted);
                          margin-top:4px">
                ${photos[0].date}
                ${photos[0].poids
                  ? `· ${photos[0].poids}kg` : ''}
              </div>
            </div>
          </div>
        </div>` : ''}

      <!-- Galerie -->
      <div class="card-label mb-sm">
        📂 Galerie (${photos.length} photos)
      </div>

      ${photos.length === 0 ? `
        <div class="card"
             style="text-align:center;padding:var(--space-xl)">
          <div style="font-size:3rem;margin-bottom:var(--space-md)">
            📸
          </div>
          <p style="color:var(--text-muted)">
            Aucune photo de progression.<br>
            Ajoute ta première photo !
          </p>
        </div>` : `

        <div style="display:grid;
                    grid-template-columns:repeat(3,1fr);
                    gap:var(--space-sm)">
          ${photos.map(p => `
            <div style="position:relative;
                        border-radius:var(--radius-md);
                        overflow:hidden;
                        aspect-ratio:3/4;
                        cursor:pointer"
                 onclick="Stats._voirPhoto('${p.id}')">
              <img src="${p.image}"
                   style="width:100%;height:100%;
                          object-fit:cover" />
              <div style="position:absolute;
                          bottom:0;left:0;right:0;
                          background:linear-gradient(
                            transparent,rgba(0,0,0,0.7));
                          padding:var(--space-xs);
                          font-size:.6rem;color:white">
                ${p.date}
                ${p.poids ? `· ${p.poids}kg` : ''}
              </div>
              <div style="position:absolute;top:4px;right:4px">
                <span style="background:rgba(0,0,0,0.5);
                             border-radius:99px;
                             padding:2px 6px;
                             font-size:.6rem;color:white">
                  ${types.find(t=>t.val===p.type)?.emoji||'📷'}
                </span>
              </div>
            </div>`).join('')}
        </div>`}
    `;
  },

  async _traiterPhoto(input) {
    if (!input.files?.[0]) return;
    const type = document.getElementById('photo-type')?.value
      || 'front';
    const note = document.getElementById('photo-note')?.value
      || '';

    Utils.toast('⏳ Compression en cours...', 'info', 1500);

    try {
      const base64 = await Tracker.compresserImage(
        input.files[0], 800, 0.75
      );
      Tracker.ajouterPhoto(base64, type, note);
      Utils.toast('✅ Photo ajoutée !', 'success');
      this._renderPhotos(
        document.getElementById('stats-content')
      );
    } catch(e) {
      Utils.toast('❌ Erreur lecture photo', 'error');
    }
  },

  _voirPhoto(id) {
    const photo  = Tracker.getPhotos().find(p => p.id === id);
    if (!photo) return;

    const modal   = document.getElementById('modal-info');
    const content = document.getElementById('modal-info-content');

    content.innerHTML = `
      <img src="${photo.image}"
           style="width:100%;border-radius:var(--radius-md);
                  max-height:70vh;object-fit:contain;
                  margin-bottom:var(--space-md)" />
      <div style="font-size:.82rem;color:var(--text-muted);
                  margin-bottom:var(--space-md)">
        📅 ${photo.date}
        ${photo.poids ? `· ⚖️ ${photo.poids}kg` : ''}
        ${photo.note ? `<br>📝 ${photo.note}` : ''}
      </div>
      <div class="flex gap-md">
        <button class="btn-secondary"
                style="flex:1"
                onclick="Stats._telechargerPhoto('${id}')">
          💾 Télécharger
        </button>
        <button class="btn-secondary"
                style="flex:1;color:var(--fd-coral)"
                onclick="Stats._supprimerPhoto('${id}')">
          🗑️ Supprimer
        </button>
      </div>
    `;

    modal.classList.remove('hidden');
    document.getElementById('modal-info-close').onclick =
      () => modal.classList.add('hidden');
  },

  _telechargerPhoto(id) {
    const photo = Tracker.getPhotos().find(p => p.id === id);
    if (!photo) return;
    const a      = document.createElement('a');
    a.href       = photo.image;
    a.download   = `powerapp-photo-${photo.date}.jpg`;
    a.click();
  },

  async _supprimerPhoto(id) {
    const ok = await Utils.confirmer(
      'Supprimer cette photo ?',
      'Action irréversible.'
    );
    if (!ok) return;
    Tracker.supprimerPhoto(id);
    document.getElementById('modal-info')
      ?.classList.add('hidden');
    Utils.toast('Photo supprimée.', 'info');
    this._renderPhotos(
      document.getElementById('stats-content')
    );
  },

  // ════════════════════════════════════════════════════════
  // CORPS TAB
  // ════════════════════════════════════════════════════════
  _renderCorps(el) {
    const stats      = this.getStatsCorps();
    const evolPoids  = this.getEvolutionPoids();
    const evolMens   = this.getEvolutionMensurations();
    const derniere   = Tracker.getDerniereMesure() || {};

    el.innerHTML = `

      <!-- Bilan corporel -->
      <div class="card mb-md"
           style="background:linear-gradient(135deg,
                  rgba(75,75,249,0.2),
                  rgba(139,240,187,0.1))">
        <div class="card-label">🧮 Bilan corporel</div>
        <div class="stats-grid mt-md">
          <div class="stat-card">
            <span class="stat-value">
              ${stats.poids || '—'}
            </span>
            <span class="stat-label">Poids (kg)</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">
              ${stats.taille || '—'}
            </span>
            <span class="stat-label">Taille (cm)</span>
          </div>
          <div class="stat-card">
            <span class="stat-value"
                  style="color:${
                    stats.catIMC?.color||'var(--fd-mint)'}">
              ${stats.imc || '—'}
            </span>
            <span class="stat-label">IMC</span>
          </div>
          <div class="stat-card">
            <span class="stat-value"
                  style="color:var(--fd-lemon)">
              ${stats.calSemaine || 0}
            </span>
            <span class="stat-label">Cal/sem</span>
          </div>
        </div>
        ${stats.catIMC ? `
          <div style="margin-top:var(--space-md);
                      padding:var(--space-sm);
                      background:${stats.catIMC.color}22;
                      border:1px solid ${stats.catIMC.color}44;
                      border-radius:var(--radius-sm);
                      text-align:center;font-size:.82rem;
                      color:${stats.catIMC.color};
                      font-weight:600">
            ${stats.catIMC.label}
          </div>` : ''}
        ${stats.deltaPoids !== null ? `
          <div style="margin-top:var(--space-sm);
                      text-align:center;font-size:.8rem;
                      color:var(--text-muted)">
            Depuis le début :
            <span style="font-weight:700;color:${
              stats.deltaPoids <= 0
                ? 'var(--fd-mint)'
                : 'var(--fd-coral)'
            }">
              ${stats.deltaPoids > 0 ? '+' : ''}
              ${stats.deltaPoids} kg
            </span>
          </div>` : ''}
      </div>

      <!-- Nouvelle mesure -->
      <div class="card mb-md">
        <div class="card-label">📏 Ajouter une mesure</div>
        <div style="display:grid;
                    grid-template-columns:1fr 1fr;
                    gap:var(--space-sm);
                    margin-top:var(--space-md)">
          ${[
            { id:'c-poids',    label:'Poids (kg)',
              val: stats.poids    || '' },
            { id:'c-taille',   label:'Taille (cm)',
              val: stats.taille   || '' },
            { id:'c-bras',     label:'Bras (cm)',
              val: derniere.bras     || '' },
            { id:'c-poitrine', label:'Poitrine (cm)',
              val: derniere.poitrine || '' },
            { id:'c-tour',     label:'Tour taille (cm)',
              val: derniere.taille2  || '' },
            { id:'c-hanches',  label:'Hanches (cm)',
              val: derniere.hanches  || '' }
          ].map(f => `
            <div>
              <div class="input-label">${f.label}</div>
              <input class="input" id="${f.id}"
                     type="number"
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
        <div class="card-label">⚖️ Évolution du poids</div>
        ${evolPoids.length < 2 ? `
          <p style="text-align:center;padding:var(--space-xl);
                    color:var(--text-muted);font-size:.85rem">
            Ajoute au moins 2 mesures
          </p>` : `
          <canvas id="chart-poids" height="160"></canvas>`}
      </div>

      <!-- Mensurations -->
      <div class="card mb-md">
        <div class="card-label">
          📐 Évolution mensurations
        </div>
        ${evolMens.length < 2 ? `
          <p style="text-align:center;padding:var(--space-xl);
                    color:var(--text-muted);font-size:.85rem">
            Ajoute au moins 2 mesures
          </p>` : `
          <canvas id="chart-mensur" height="160"></canvas>`}
      </div>

      <!-- Historique mesures -->
      <div class="card">
        <div class="card-label">📋 Historique</div>
        ${Tracker.getMesures().length === 0 ? `
          <p style="color:var(--text-muted);
                    text-align:center;
                    padding:var(--space-lg);
                    font-size:.85rem">
            Aucune mesure
          </p>` :
          [...Tracker.getMesures()].reverse()
            .slice(0, 10)
            .map(m => `
              <div style="padding:var(--space-sm) 0;
                          border-bottom:1px solid
                          var(--border-color);
                          font-size:.82rem">
                <div style="font-weight:600;
                            color:var(--fd-indigo);
                            margin-bottom:2px">
                  ${Utils.formatDateCourt(m.date)}
                </div>
                <div style="display:flex;flex-wrap:wrap;
                            gap:8px;
                            color:var(--text-secondary)">
                  ${m.poids    ? `<span>⚖️ ${m.poids}kg</span>`        : ''}
                  ${m.taille   ? `<span>📏 ${m.taille}cm</span>`        : ''}
                  ${m.bras     ? `<span>💪 ${m.bras}cm</span>`          : ''}
                  ${m.poitrine ? `<span>🫀 ${m.poitrine}cm</span>`      : ''}
                  ${m.taille2  ? `<span>📐 ${m.taille2}cm</span>`       : ''}
                  ${m.hanches  ? `<span>🦵 ${m.hanches}cm</span>`       : ''}
                </div>
              </div>`).join('')}
      </div>
    `;

    requestAnimationFrame(() => {
      if (evolPoids.length >= 2) {
        const c = document.getElementById('chart-poids');
        if (c) Utils.graphiques.ligne(
          c,
          evolPoids.map(p => p.label),
          [{ valeurs: evolPoids.map(p => p.poids),
             color: '#ff8d96' }]
        );
      }
      if (evolMens.length >= 2) {
        const c = document.getElementById('chart-mensur');
        if (c) {
          const datasets = [];
          [
            { key:'bras',     color:'#4b4bf9' },
            { key:'poitrine', color:'#8bf0bb' },
            { key:'taille2',  color:'#f9ef77' },
            { key:'hanches',  color:'#bfa1ff' }
          ].forEach(z => {
            const vals = evolMens.map(m => m[z.key]||0);
            if (vals.some(v => v > 0)) {
              datasets.push({
                valeurs: vals,
                color:   z.color
              });
            }
          });
          if (datasets.length) {
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

  _sauvegarderMesure() {
    const poids    = parseFloat(
      document.getElementById('c-poids')?.value)    || undefined;
    const taille   = parseFloat(
      document.getElementById('c-taille')?.value)   || undefined;
    const bras     = parseFloat(
      document.getElementById('c-bras')?.value)     || undefined;
    const poitrine = parseFloat(
      document.getElementById('c-poitrine')?.value) || undefined;
    const taille2  = parseFloat(
      document.getElementById('c-tour')?.value)     || undefined;
    const hanches  = parseFloat(
      document.getElementById('c-hanches')?.value)  || undefined;

    if (!poids && !taille && !bras
        && !poitrine && !taille2 && !hanches) {
      Utils.toast('Remplis au moins une mesure !', 'error');
      return;
    }

    Tracker.ajouterMesure({
      poids, taille, bras, poitrine, taille2, hanches
    });
    if (poids)  Tracker.ajouterPoids(poids);
    if (poids)  Tracker.sauvegarderProfil({ poids });
    if (taille) Tracker.sauvegarderProfil({ taille });

    try { Gamification.ajouterXP(20, 'mesure'); } catch(e) {}
    Utils.toast('✅ Mesure enregistrée !', 'success');
    Utils.vibrerBeep();
    this._renderCorps(document.getElementById('stats-content'));
  },

  // ════════════════════════════════════════════════════════
  // CHARGES TAB
  // ════════════════════════════════════════════════════════
  _renderCharges(el) {
    const table  = this.get1RMTable();
    const exRefs = Object.keys(EXERCICES);

    el.innerHTML = `
      <div class="card mb-md">
        <div class="card-label">🔍 Détail d'un exercice</div>
        <select id="select-exercice" class="input mt-md">
          <option value="">-- Choisir --</option>
          ${exRefs.map(ref => `
            <option value="${ref}">
              ${EXERCICES[ref]?.emoji||''}
              ${EXERCICES[ref]?.nom||ref}
            </option>`).join('')}
        </select>
      </div>

      <div id="detail-exercice"></div>

      <div class="card">
        <div class="card-label">
          📊 Tableau 1RM complet
        </div>
        ${table.length === 0 ? `
          <p style="color:var(--text-muted);
                    text-align:center;
                    padding:var(--space-lg)">
            Lance tes séances pour voir tes 1RM !
          </p>` :
          table.map((ex, i) => `
            <div class="flex items-center justify-between"
                 style="padding:var(--space-sm) 0;
                        border-bottom:1px solid
                        var(--border-color)">
              <div class="flex items-center gap-sm">
                <span style="font-size:.72rem;
                             color:var(--text-muted);
                             width:20px">
                  ${i+1}
                </span>
                <div>
                  <div style="font-size:.88rem;font-weight:600">
                    ${ex.emoji} ${ex.nom}
                  </div>
                  <div style="font-size:.68rem;
                              color:var(--fd-mint)">
                    ${ex.muscle}
                  </div>
                </div>
              </div>
              <div style="text-align:right">
                <div style="font-size:.9rem;font-weight:700;
                            color:var(--fd-indigo)">
                  1RM: ${ex.rm1}kg
                </div>
                <div style="font-size:.68rem;
                            color:var(--text-muted)">
                  ${ex.poids}kg × ${ex.reps}
                  ${ex.ancienPR?.rm1 ? `
                    <span style="color:var(--fd-mint)">
                      ↑${ex.rm1 - ex.ancienPR.rm1}kg
                    </span>` : ''}
                </div>
              </div>
            </div>`).join('')}
      </div>
    `;

    document.getElementById('select-exercice').onchange = e => {
      if (e.target.value) {
        this._renderDetailExercice(e.target.value);
      }
    };
  },

  _renderDetailExercice(ref) {
    const el      = document.getElementById('detail-exercice');
    const ex      = EXERCICES[ref];
    const pr      = Tracker.getPR(ref);
    const prog    = this.getProgressionExercice(ref, 60);
    const histPR  = Tracker.getHistoriquePR(ref, 10);
    const notes   = Tracker.getNotesExercice(ref);

    el.innerHTML = `
      <div class="card mb-md">
        <div class="flex items-center justify-between mb-md">
          <div class="card-label" style="margin:0">
            ${ex?.emoji} ${ex?.nom}
          </div>
          <button class="btn-secondary btn-sm"
                  onclick="Stats._ajouterNoteExo('${ref}')">
            📝 Note
          </button>
        </div>

        <div class="stats-grid mb-md">
          <div class="stat-card">
            <span class="stat-value"
                  style="color:var(--fd-lemon)">
              ${pr?.rm1||0}kg
            </span>
            <span class="stat-label">1RM Estimé</span>
          </div>
          <div class="stat-card">
            <span class="stat-value"
                  style="color:var(--fd-indigo)">
              ${pr?.poids||0}kg
            </span>
            <span class="stat-label">Meilleur</span>
          </div>
          <div class="stat-card">
            <span class="stat-value"
                  style="color:var(--fd-mint)">
              ${pr?.reps||0}
            </span>
            <span class="stat-label">Meilleur reps</span>
          </div>
          <div class="stat-card">
            <span class="stat-value"
                  style="font-size:.9rem">
              ${pr?.date||'—'}
            </span>
            <span class="stat-label">Date PR</span>
          </div>
        </div>

        <!-- Calcul % du 1RM -->
        ${pr?.rm1 ? `
          <div class="card-label mb-sm">
            📊 Zones d'entraînement
          </div>
          <div style="display:grid;
                      grid-template-columns:repeat(5,1fr);
                      gap:4px;margin-bottom:var(--space-md)">
            ${[
              { pct:50, label:'Endurance', color:'#8bf0bb' },
              { pct:65, label:'Volume',    color:'#4b4bf9' },
              { pct:75, label:'Hypertro.', color:'#bfa1ff' },
              { pct:85, label:'Force',     color:'#f9ef77' },
              { pct:95, label:'Max',       color:'#ff8d96' }
            ].map(z => `
              <div style="text-align:center;
                          padding:var(--space-xs);
                          background:${z.color}22;
                          border:1px solid ${z.color}44;
                          border-radius:var(--radius-sm)">
                <div style="font-size:.75rem;font-weight:700;
                            color:${z.color}">
                  ${Math.round(pr.rm1 * z.pct/100)}kg
                </div>
                <div style="font-size:.58rem;
                            color:var(--text-muted)">
                  ${z.pct}%
                </div>
                <div style="font-size:.58rem;
                            color:var(--text-muted)">
                  ${z.label}
                </div>
              </div>`).join('')}
          </div>` : ''}

        <!-- Graphique progression -->
        ${prog.length > 1 ? `
          <div class="chart-title"
               style="font-size:.72rem">
            📈 Progression 1RM (60 jours)
          </div>
          <canvas id="chart-exo" height="140"></canvas>` : `
          <p style="color:var(--text-muted);
                    text-align:center;font-size:.85rem;
                    padding:var(--space-md)">
            Pas encore assez de données
          </p>`}

        <!-- Notes exercice -->
        ${notes.length > 0 ? `
          <div class="card-label mt-md mb-sm">
            📝 Mes notes
          </div>
          ${notes.slice(0,3).map(n => `
            <div style="font-size:.78rem;
                        padding:var(--space-xs) 0;
                        border-bottom:1px solid
                        var(--border-color);
                        color:var(--text-secondary)">
              <span style="color:var(--fd-indigo);
                           font-size:.65rem">
                ${n.date}
              </span><br>${n.note}
            </div>`).join('')}` : ''}
      </div>
    `;

    if (prog.length > 1) {
      requestAnimationFrame(() => {
        const canvas = document.getElementById('chart-exo');
        if (canvas) Utils.graphiques.ligne(
          canvas,
          prog.map(p => p.label),
          [{ valeurs: prog.map(p => p.rm1),
             color: '#bfa1ff' }]
        );
      });
    }
  },

  _ajouterNoteExo(ref) {
    const ex      = EXERCICES[ref];
    const modal   = document.getElementById('modal-info');
    const content = document.getElementById('modal-info-content');

    content.innerHTML = `
      <h3 style="margin-bottom:var(--space-md)">
        📝 Note — ${ex?.emoji} ${ex?.nom}
      </h3>
      <textarea class="input" id="note-exo-texte"
                rows="4"
                placeholder="Technique, sensations, points à améliorer..."
                style="resize:none;min-height:120px"></textarea>
      <button class="btn-primary mt-md"
              onclick="Stats._sauvegarderNoteExo('${ref}')">
        💾 Sauvegarder
      </button>
    `;

    modal.classList.remove('hidden');
    document.getElementById('modal-info-close').onclick =
      () => modal.classList.add('hidden');
  },

  _sauvegarderNoteExo(ref) {
    const texte = document.getElementById('note-exo-texte')
      ?.value?.trim();
    if (!texte) return;
    Tracker.ajouterNoteExercice(ref, texte);
    Utils.toast('Note sauvegardée !', 'success');
    document.getElementById('modal-info')
      ?.classList.add('hidden');
    this._renderDetailExercice(ref);
  },

  // ════════════════════════════════════════════════════════
  // GRAPHIQUES TAB
  // ════════════════════════════════════════════════════════
  _renderGraphiques(el) {
    const refs    = Object.keys(EXERCICES)
      .filter(r => Tracker.getPR(r));
    const periodes = ['30','60','90','180'];

    el.innerHTML = `
      <div class="card mb-md">
        <div class="card-label mb-md">
          📈 Progression exercice
        </div>
        <div class="flex gap-sm"
             style="flex-wrap:wrap;
                    margin-bottom:var(--space-md)">
          <select id="sel-graph-exo"
                  class="input" style="flex:1">
            <option value="">-- Exercice --</option>
            ${refs.map(r => `
              <option value="${r}">
                ${EXERCICES[r]?.nom||r}
              </option>`).join('')}
          </select>
          <select id="sel-graph-metric"
                  class="input" style="flex:1">
            <option value="rm1">1RM (kg)</option>
            <option value="poids">Poids (kg)</option>
            <option value="reps">Reps</option>
          </select>
        </div>
        <div class="flex gap-sm mb-md">
          ${periodes.map(p => `
            <button class="preset-btn ${p==='30'?'active':''}"
                    data-periode="${p}"
                    onclick="Stats._changerPeriode(this)">
              ${p}j
            </button>`).join('')}
        </div>
        <canvas id="chart-main" height="180"></canvas>
      </div>

      <!-- Volume 8 semaines -->
      <div class="chart-container mb-md">
        <div class="chart-title">
          📊 Volume total — 8 semaines
        </div>
        <canvas id="chart-vol-8" height="160"></canvas>
      </div>

      <!-- Séances par jour de semaine -->
      <div class="chart-container mb-md">
        <div class="chart-title">
          📅 Séances par jour de la semaine
        </div>
        <canvas id="chart-jours" height="140"></canvas>
      </div>
    `;

    requestAnimationFrame(() => {
      // Volume
      const vol    = this.getVolumeParSemaine(8);
      const cvol   = document.getElementById('chart-vol-8');
      if (cvol) Utils.graphiques.barres(
        cvol,
        vol.map(v => v.label),
        vol.map(v => v.volume)
      );

      // Jours de semaine
      const jours  = Tracker.getSeancesParJourSemaine();
      const cjours = document.getElementById('chart-jours');
      if (cjours) Utils.graphiques.barres(
        cjours,
        ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'],
        jours,
        { color: '#8bf0bb' }
      );
    });

    const update = () => {
      const ref     = document
        .getElementById('sel-graph-exo')?.value;
      const metric  = document
        .getElementById('sel-graph-metric')?.value || 'rm1';
      const periode = document
        .querySelector('.preset-btn.active')
        ?.dataset.periode || '30';
      if (!ref) return;
      const prog   = this.getProgressionExercice(
        ref, parseInt(periode)
      );
      const canvas = document.getElementById('chart-main');
      if (canvas && prog.length > 0) {
        Utils.graphiques.ligne(
          canvas,
          prog.map(p => p.label),
          [{ valeurs: prog.map(p => p[metric]||0),
             color: '#4b4bf9' }]
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

    const exo     = document
      .getElementById('sel-graph-exo')?.value;
    const metric  = document
      .getElementById('sel-graph-metric')?.value || 'rm1';
    const periode = btn.dataset.periode;
    if (!exo) return;

    const prog   = this.getProgressionExercice(
      exo, parseInt(periode)
    );
    const canvas = document.getElementById('chart-main');
    if (canvas && prog.length > 0) {
      Utils.graphiques.ligne(
        canvas,
        prog.map(p => p.label),
        [{ valeurs: prog.map(p => p[metric]||0),
           color: '#4b4bf9' }]
      );
    }
  },

  // ════════════════════════════════════════════════════════
  // CALENDRIER TAB
  // ════════════════════════════════════════════════════════
  _renderCalendrier(el, annee = null, mois = null) {
    const today    = new Date();
    const an       = annee || today.getFullYear();
    const mo       = mois !== null ? mois : today.getMonth();
    const heatmap  = this.getHeatmap(24);
    const nomsMois = [
      'Janvier','Février','Mars','Avril','Mai','Juin',
      'Juillet','Août','Septembre','Octobre',
      'Novembre','Décembre'
    ];
    const nomsJours = [
      'Lun','Mar','Mer','Jeu','Ven','Sam','Dim'
    ];

    const premierJour = new Date(an, mo, 1);
    const offsetDebut = (premierJour.getDay() + 6) % 7;
    const nbJours     = new Date(an, mo+1, 0).getDate();

    const statsMois = {
      seances: 0, manquees: 0
    };
    for (let j = 1; j <= nbJours; j++) {
      const d = `${an}-${String(mo+1).padStart(2,'0')}-${String(j).padStart(2,'0')}`;
      if (heatmap[d] === 'done')   statsMois.seances++;
      if (heatmap[d] === 'missed') statsMois.manquees++;
    }

    let cellules = '';
    for (let i = 0; i < offsetDebut; i++) {
      cellules += `<div class="cal-cell cal-empty"></div>`;
    }
    for (let j = 1; j <= nbJours; j++) {
      const d       = `${an}-${String(mo+1).padStart(2,'0')}-${String(j).padStart(2,'0')}`;
      const etat    = heatmap[d] || 'none';
      const estAuj  = d === Utils.aujourd_hui();
      const estFut  = d > Utils.aujourd_hui();

      const bg = etat==='done'   ? 'var(--fd-indigo)'       :
                 etat==='missed' ? 'rgba(255,141,150,0.3)'  :
                 etat==='rest'   ? 'rgba(139,240,187,0.15)' :
                 estFut          ? 'transparent'             :
                                  'var(--bg-input)';

      cellules += `
        <div onclick="Stats._afficherJour('${d}')"
             style="background:${bg};
                    border:${estAuj
                      ? '2px solid var(--fd-lemon)'
                      : '1px solid var(--border-color)'};
                    border-radius:var(--radius-sm);
                    min-height:48px;padding:4px;
                    cursor:${estFut?'default':'pointer'};
                    transition:transform .15s">
          <div style="font-size:.72rem;font-weight:${
            estAuj?'800':'500'};
            color:${estAuj
              ? 'var(--fd-lemon)'
              : etat==='done'
                ? 'white'
                : 'var(--text-muted)'}">
            ${j}
          </div>
          <div style="font-size:.8rem;text-align:center;
                      margin-top:2px">
            ${etat==='done'   ? '✅' :
              etat==='missed' ? '❌' :
              etat==='rest'   ? '😴' : ''}
          </div>
        </div>`;
    }

    el.innerHTML = `
      <div class="flex items-center justify-between mb-md">
        <button class="btn-icon"
                onclick="Stats._renderCalendrier(
                  document.getElementById('stats-content'),
                  ${mo===0 ? an-1 : an},
                  ${mo===0 ? 11 : mo-1})">◄</button>
        <div style="text-align:center">
          <div style="font-weight:700;font-size:1.1rem">
            ${nomsMois[mo]} ${an}
          </div>
          <div style="font-size:.72rem;color:var(--text-muted)">
            ${statsMois.seances} séance${statsMois.seances>1?'s':''}
            · ${statsMois.manquees} manquée${statsMois.manquees>1?'s':''}
          </div>
        </div>
        <button class="btn-icon"
                ${an===today.getFullYear()
                  && mo===today.getMonth()
                  ? 'disabled style="opacity:.3"' : ''}
                onclick="Stats._renderCalendrier(
                  document.getElementById('stats-content'),
                  ${mo===11 ? an+1 : an},
                  ${mo===11 ? 0 : mo+1})">►</button>
      </div>

      <div class="stats-grid mb-md">
        <div class="stat-card">
          <span class="stat-value"
                style="color:var(--fd-indigo)">
            ${statsMois.seances}
          </span>
          <span class="stat-label">Séances</span>
        </div>
        <div class="stat-card">
          <span class="stat-value"
                style="color:var(--fd-coral)">
            ${statsMois.manquees}
          </span>
          <span class="stat-label">Manquées</span>
        </div>
        <div class="stat-card">
          <span class="stat-value"
                style="color:var(--fd-mint)">
            ${Math.round((statsMois.seances /
              Math.max(1, statsMois.seances
                + statsMois.manquees)) * 100)}%
          </span>
          <span class="stat-label">Assiduité</span>
        </div>
        <div class="stat-card">
          <span class="stat-value"
                style="color:var(--fd-lemon)">
            ${Tracker.getStreak().count}🔥
          </span>
          <span class="stat-label">Streak</span>
        </div>
      </div>

      <div class="card mb-md"
           style="padding:var(--space-sm)">
        <div style="display:grid;
                    grid-template-columns:repeat(7,1fr);
                    gap:3px;margin-bottom:4px">
          ${nomsJours.map(j => `
            <div style="text-align:center;font-size:.65rem;
                        font-weight:600;
                        color:var(--text-muted);
                        padding:4px 0">${j}</div>
          `).join('')}
        </div>
        <div style="display:grid;
                    grid-template-columns:repeat(7,1fr);
                    gap:3px">
          ${cellules}
        </div>
      </div>

      <div id="detail-jour"></div>
    `;
  },

  _afficherJour(dateStr) {
    const el = document.getElementById('detail-jour');
    if (!el) return;

    const heatmap = this.getHeatmap(24);
    const etat    = heatmap[dateStr] || 'none';
    let   seanceData = null;

    for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i);
      if (cle?.startsWith(`ft_seance_${dateStr}`)) {
        try {
          seanceData = JSON.parse(localStorage.getItem(cle));
        } catch(e) {}
        break;
      }
    }

    el.innerHTML = `
      <div class="card mt-md"
           style="border-color:${
             etat==='done'   ? 'var(--fd-indigo)'  :
             etat==='missed' ? 'var(--fd-coral)'   :
             etat==='rest'   ? 'var(--fd-mint)'    :
             'var(--border-color)'}">

        <div class="flex items-center
                    justify-between mb-md">
          <div>
            <div style="font-weight:700">
              ${dateStr}
              ${dateStr===Utils.aujourd_hui()
                ? '<span class="chip chip-lemon" style="font-size:.6rem;margin-left:4px">Aujourd\'hui</span>'
                : ''}
            </div>
            <div style="font-size:.75rem;
                        color:var(--text-muted)">
              ${etat==='done'   ? '✅ Séance complétée' :
                etat==='missed' ? '❌ Séance manquée'   :
                etat==='rest'   ? '😴 Repos'            :
                                  '⬜ Pas de données'}
            </div>
          </div>
          <button onclick="
            document.getElementById('detail-jour')
              .innerHTML=''"
                  style="background:none;border:none;
                         color:var(--text-muted);
                         font-size:1.2rem;cursor:pointer">
            ✕
          </button>
        </div>

        ${seanceData?.complete ? `
          <div class="stats-grid mb-md">
            <div class="stat-card">
              <span class="stat-value" style="font-size:1rem">
                ${Utils.formatDuree(seanceData.duree||0)}
              </span>
              <span class="stat-label">Durée</span>
            </div>
            <div class="stat-card">
              <span class="stat-value" style="font-size:1rem">
                ${Utils.formatVolume(seanceData.volumeTotal||0)}
              </span>
              <span class="stat-label">Volume</span>
            </div>
            <div class="stat-card">
              <span class="stat-value" style="font-size:1rem">
                ${seanceData.series?.length||0}
              </span>
              <span class="stat-label">Séries</span>
            </div>
            <div class="stat-card">
              <span class="stat-value" style="font-size:1rem">
                ${seanceData.rpesMoyen||'—'}
              </span>
              <span class="stat-label">RPE</span>
            </div>
          </div>
          ${[...new Set(
            (seanceData.series||[]).map(s => s.exerciceRef)
          )].map(ref => {
            const ex     = EXERCICES[ref]||{};
            const series = (seanceData.series||[])
              .filter(s => s.exerciceRef === ref);
            const max    = Math.max(
              ...series.map(s => s.poids||0)
            );
            return `
              <div class="flex justify-between"
                   style="font-size:.82rem;
                          padding:var(--space-xs) 0;
                          border-bottom:1px solid
                          var(--border-color)">
                <span>${ex.emoji||'💪'} ${ex.nom||ref}</span>
                <span style="font-weight:600;
                             color:var(--fd-indigo)">
                  ${max}kg × ${series.length} séries
                </span>
              </div>`;
          }).join('')}` : `
          <div style="text-align:center;
                      padding:var(--space-md);
                      color:var(--text-muted)">
            <div style="font-size:2rem">
              ${etat==='rest' ? '😴' : '⬜'}
            </div>
            <div style="font-size:.85rem;margin-top:4px">
              ${etat==='rest'
                ? 'Jour de repos'
                : 'Aucune donnée'}
            </div>
          </div>`}
      </div>
    `;

    el.scrollIntoView({ behavior:'smooth', block:'nearest' });
  },

  // ════════════════════════════════════════════════════════
  // TROPHÉES TAB
  // ════════════════════════════════════════════════════════
  _renderTrophees(el) {
    const xpData     = Gamification.getXP();
    const trophees   = Gamification.getTrophees();
    const debloquees = trophees.filter(t =>  t.debloquee);
    const verrou     = trophees.filter(t => !t.debloquee);

    el.innerHTML = `
      <div class="xp-bar-container mb-md">
        <div class="xp-info">
          <span class="xp-level">
            ${xpData.niveau.emoji} Niveau
            ${xpData.niveau.numero} —
            ${xpData.niveau.nom}
          </span>
          <span class="xp-count">
            ${xpData.total} / ${xpData.niveau.xpSuivant} XP
          </span>
        </div>
        <div class="xp-bar">
          <div class="xp-fill"
               style="width:${xpData.pourcentage}%">
          </div>
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
            <div style="font-size:.6rem;
                        color:var(--fd-lemon);
                        margin-top:2px">+${t.xp} XP</div>
          </div>`).join('')
          || `<p style="color:var(--text-muted);
                        grid-column:1/-1;
                        text-align:center;
                        padding:var(--space-md)">
               Lance ta première séance !
             </p>`}
      </div>

      <div class="section-title">🔒 À débloquer</div>

      <div class="trophy-grid">
        ${verrou.map(t => `
          <div class="trophy-card locked"
               title="${t.description}">
            <div class="trophy-icon">${t.emoji}</div>
            <div class="trophy-name">${t.nom}</div>
            <div style="font-size:.6rem;
                        color:var(--text-muted);
                        margin-top:2px">
              +${t.xp} XP
            </div>
          </div>`).join('')}
      </div>
    `;
  }
};

window.Stats = Stats;
console.log('✅ Stats v3.0 chargé');
