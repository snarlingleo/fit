/* ============================================================
   FitTracker Pro — Stats
   Calculs avancés + rendu graphiques
   ============================================================ */

const Stats = {

  // ─── DASHBOARD PRINCIPAL ──────────────────────────────────
  getDashboard() {
    const streak   = Tracker.getStreak();
    const profil   = Tracker.getProfil();
    const prs      = Tracker.getAllPRs();
    const volume   = Tracker.getVolumeSemaine();
    const seances  = Tracker.getTotalSeances();
    const scoreForme = Tracker.calculerScoreForme();
    const infos    = Programme.getInfosProgramme();

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

  // ─── TOP EXERCICES ─────────────────────────────────────────
  getTopExercices(limite = 5) {
    const prs     = Tracker.getAllPRs();
    const entries = Object.entries(prs)
      .filter(([,v]) => v.rm1 > 0)
      .sort(([,a],[,b]) => (b.rm1 || 0) - (a.rm1 || 0))
      .slice(0, limite);

    return entries.map(([ref, pr]) => ({
      ref,
      nom:  EXERCICES[ref]?.nom || ref,
      emoji: EXERCICES[ref]?.emoji || '💪',
      ...pr
    }));
  },

  // ─── VOLUME PAR SEMAINE ────────────────────────────────────
  getVolumeParSemaine(n = 8) {
    return Tracker.getVolumeParSemaine(n);
  },

  // ─── PROGRESSION EXERCICE ─────────────────────────────────
  getProgressionExercice(ref, periode = 30) {
    const hist = Tracker.getHistoriqueExercice(ref, 200);
    const debut = Utils.ajouterJours(Utils.aujourd_hui(), -periode);

    const filtre = hist.filter(h => h.date >= debut);
    const parSemaine = {};

    filtre.forEach(h => {
      const sem = Utils.debutSemaine(h.date);
      if (!parSemaine[sem] || h.rm1 > (parSemaine[sem].rm1 || 0)) {
        parSemaine[sem] = h;
      }
    });

    return Object.entries(parSemaine)
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        label:  Utils.formatDateCourt(date),
        poids:  data.poids  || 0,
        reps:   data.reps   || 0,
        rm1:    data.rm1    || 0
      }));
  },

  // ─── COMPARAISON SEMAINES ─────────────────────────────────
  getComparaisonSemaines() {
    const cette = Tracker.getVolumeSemaine();
    const avant = Tracker.getVolumeSemaine(
      Utils.ajouterJours(Utils.aujourd_hui(), -7)
    );
    const delta  = avant > 0 ? Math.round(((cette - avant) / avant) * 100) : 0;
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

  // ─── RENDU PAGE STATS ─────────────────────────────────────
  render(tab = 'dashboard') {
    const container = document.getElementById('page-content');
    if (!container) return;

    container.innerHTML = `
      <div class="tabs-container">
        ${['dashboard','charges','graphiques','calendrier','trophees']
          .map(t => `
            <button class="tab-btn ${tab===t?'active':''}"
                    onclick="Stats.render('${t}')">
              ${{ dashboard:'📊 Dashboard', charges:'⚖️ Charges',
                  graphiques:'📈 Graphiques', calendrier:'🗓️ Calendrier',
                  trophees:'🏆 Trophées'}[t]}
            </button>`).join('')}
      </div>
      <div id="stats-content"></div>
    `;

    const content = document.getElementById('stats-content');

    switch(tab) {
      case 'dashboard':    this._renderDashboard(content);    break;
      case 'charges':      this._renderCharges(content);      break;
      case 'graphiques':   this._renderGraphiques(content);   break;
      case 'calendrier':   this._renderCalendrier(content);   break;
      case 'trophees':     this._renderTrophees(content);     break;
    }
  },

  _renderDashboard(el) {
    const dash = this.getDashboard();
    const top  = this.getTopExercices();
    const comp = this.getComparaisonSemaines();
    const vol  = this.getVolumeParSemaine(8);

    el.innerHTML = `
      <!-- Stats rapides -->
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
          <span class="stat-value">${Utils.formatVolume(dash.volumeSemaine)}</span>
          <span class="stat-label">Volume</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${dash.totalPRs}</span>
          <span class="stat-label">PRs</span>
        </div>
      </div>

      <!-- Comparaison semaines -->
      <div class="card mb-md">
        <div class="card-label">📊 Semaine en cours vs précédente</div>
        <div class="flex items-center justify-between mt-md">
          <div class="text-center">
            <div style="font-size:1.2rem;font-weight:700;color:var(--fd-indigo)">
              ${Utils.formatVolume(comp.cette)}
            </div>
            <div style="font-size:0.72rem;color:var(--text-muted)">Cette semaine</div>
          </div>
          <div class="text-center">
            <div style="font-size:1.4rem;font-weight:800;color:${
              comp.delta >= 0 ? 'var(--fd-mint)' : 'var(--fd-coral)'
            }">
              ${comp.delta >= 0 ? '+' : ''}${comp.delta}%
            </div>
          </div>
          <div class="text-center">
            <div style="font-size:1.2rem;font-weight:700;color:var(--text-secondary)">
              ${Utils.formatVolume(comp.avant)}
            </div>
            <div style="font-size:0.72rem;color:var(--text-muted)">Semaine préc.</div>
          </div>
        </div>
      </div>

      <!-- Top exercices -->
      <div class="card mb-md">
        <div class="card-label">🏆 Top Exercices — Records</div>
        ${top.length === 0
          ? `<p style="color:var(--text-muted);text-align:center;padding:var(--space-lg)">
               Aucun PR enregistré — commence tes séances !
             </p>`
          : top.map((ex, i) => `
            <div class="flex items-center justify-between"
                 style="padding:var(--space-sm) 0;border-bottom:1px solid var(--border-color)">
              <div class="flex items-center gap-md">
                <span style="font-size:1.1rem;opacity:.5">${['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
                <div>
                  <div style="font-size:.9rem;font-weight:600">${ex.emoji} ${ex.nom}</div>
                  <div style="font-size:.72rem;color:var(--text-muted)">
                    1RM estimé: <strong style="color:var(--fd-lavender)">${ex.rm1}kg</strong>
                  </div>
                </div>
              </div>
              <div style="text-align:right">
                <div style="font-size:.9rem;font-weight:700;color:var(--fd-indigo)">
                  ${ex.poids}kg × ${ex.reps}
                </div>
                <div style="font-size:.68rem;color:var(--text-muted)">${ex.date || ''}</div>
              </div>
            </div>`).join('')}
      </div>

      <!-- Volume par semaine -->
      <div class="chart-container mb-md">
        <div class="chart-title">📈 Volume par semaine (kg)</div>
        <canvas id="chart-volume" class="chart-canvas" height="160"></canvas>
      </div>
    `;

    // Rendu graphique volume
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

  _renderCharges(el) {
    const table = this.get1RMTable();
    const exRefs = Object.keys(EXERCICES).slice(0, 15);

    el.innerHTML = `
      <div class="card mb-md">
        <div class="card-label">🔍 Sélectionner un exercice</div>
        <select id="select-exercice" class="input mt-md">
          <option value="">-- Choisir --</option>
          ${exRefs.map(ref => `
            <option value="${ref}">${EXERCICES[ref]?.emoji || ''} ${EXERCICES[ref]?.nom || ref}</option>
          `).join('')}
        </select>
      </div>

      <div id="detail-exercice"></div>

      <div class="card">
        <div class="card-label">📊 Tableau 1RM — Tous les exercices</div>
        ${table.length === 0
          ? `<p style="color:var(--text-muted);text-align:center;padding:var(--space-lg)">
               Pas encore de données. Lance-toi !
             </p>`
          : table.map(ex => `
            <div class="flex items-center justify-between"
                 style="padding:var(--space-sm) 0;border-bottom:1px solid var(--border-color)">
              <div>
                <div style="font-size:.88rem;font-weight:600">
                  ${ex.emoji} ${ex.nom}
                </div>
              </div>
              <div style="text-align:right">
                <div style="font-size:.9rem;font-weight:700;color:var(--fd-indigo)">
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
    const el    = document.getElementById('detail-exercice');
    const ex    = EXERCICES[ref];
    const pr    = Tracker.getPR(ref);
    const prog  = this.getProgressionExercice(ref, 60);

    el.innerHTML = `
      <div class="card mb-md">
        <div class="card-label">${ex?.emoji} ${ex?.nom}</div>
        <div class="flex items-center justify-between mt-md">
          <div class="text-center">
            <div style="font-size:1.4rem;font-weight:800;color:var(--fd-lemon)">
              ${pr?.rm1 || 0}kg
            </div>
            <div style="font-size:.7rem;color:var(--text-muted)">1RM Estimé</div>
          </div>
          <div class="text-center">
            <div style="font-size:1.4rem;font-weight:800;color:var(--fd-indigo)">
              ${pr?.poids || 0}kg
            </div>
            <div style="font-size:.7rem;color:var(--text-muted)">Meilleur poids</div>
          </div>
          <div class="text-center">
            <div style="font-size:1.4rem;font-weight:800;color:var(--fd-mint)">
              ${pr?.reps || 0}
            </div>
            <div style="font-size:.7rem;color:var(--text-muted)">Meilleur reps</div>
          </div>
        </div>

        ${prog.length > 1 ? `
          <div style="margin-top:var(--space-md)">
            <div class="chart-title" style="font-size:.72rem">📈 Progression (1RM kg)</div>
            <canvas id="chart-exo" height="140"></canvas>
          </div>
        ` : `
          <p style="color:var(--text-muted);text-align:center;padding:var(--space-md);font-size:.85rem">
            Pas encore assez de données pour afficher la progression.
          </p>
        `}
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

  _renderGraphiques(el) {
    const refs    = Object.keys(EXERCICES).filter(r => Tracker.getPR(r));
    const periodes = ['30','60','90','180'];

    el.innerHTML = `
      <div class="card mb-md">
        <div class="flex gap-sm" style="flex-wrap:wrap;margin-bottom:var(--space-md)">
          <select id="sel-graph-exo" class="input" style="flex:1">
            <option value="">-- Exercice --</option>
            ${refs.map(r => `
              <option value="${r}">${EXERCICES[r]?.nom || r}</option>
            `).join('')}
          </select>
          <select id="sel-graph-metric" class="input" style="flex:1">
            <option value="rm1">1RM (kg)</option>
            <option value="poids">Poids (kg)</option>
            <option value="reps">Reps</option>
          </select>
        </div>

        <div class="flex gap-sm" style="margin-bottom:var(--space-md)">
          ${periodes.map(p => `
            <button class="preset-btn ${p==='30'?'active':''}"
                    data-periode="${p}"
                    onclick="Stats._changerPeriode(this)">
              ${p}j
            </button>`).join('')}
        </div>

        <canvas id="chart-main" height="180"></canvas>
      </div>

      <!-- Volume total -->
      <div class="chart-container">
        <div class="chart-title">📊 Volume total — 8 semaines</div>
        <canvas id="chart-vol-8" height="160"></canvas>
      </div>
    `;

    // Volume 8 semaines
    requestAnimationFrame(() => {
      const vol    = this.getVolumeParSemaine(8);
      const canvas = document.getElementById('chart-vol-8');
      if (canvas) {
        Utils.graphiques.barres(canvas, vol.map(v=>v.label), vol.map(v=>v.volume));
      }
    });

    // Listeners
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
          [{ valeurs: prog.map(p => p[metric] || 0), color: '#4b4bf9' }]
        );
      }
    };

    document.getElementById('sel-graph-exo')?.addEventListener('change', update);
    document.getElementById('sel-graph-metric')?.addEventListener('change', update);
  },

  _changerPeriode(btn) {
    document.querySelectorAll('.preset-btn[data-periode]')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // Retrigger graphique
    const exo    = document.getElementById('sel-graph-exo')?.value;
    const metric = document.getElementById('sel-graph-metric')?.value || 'rm1';
    const periode = btn.dataset.periode;
    if (!exo) return;

    const prog   = this.getProgressionExercice(exo, parseInt(periode));
    const canvas = document.getElementById('chart-main');
    if (canvas && prog.length > 0) {
      Utils.graphiques.ligne(canvas, prog.map(p=>p.label),
        [{ valeurs: prog.map(p => p[metric]||0), color:'#4b4bf9' }]);
    }
  },

  _renderCalendrier(el) {
    const heatmap = this.getHeatmap(12);
    const today   = Utils.aujourd_hui();
    const jours   = ['L','M','M','J','V','S','D'];

    // Construire grille 12 semaines
    const debutGrille = Utils.debutSemaine(
      Utils.ajouterJours(today, -77)
    );

    let cellules = '';
    for (let s = 0; s < 12; s++) {
      for (let j = 0; j < 7; j++) {
        const date   = Utils.ajouterJours(debutGrille, s*7 + j);
        const etat   = heatmap[date] || 'none';
        const title  = `${date} — ${
          etat==='done' ? '✅ Séance' : etat==='rest' ? '😴 Repos' :
          etat==='missed' ? '❌ Manquée' : '⬜ Vide'
        }`;
        cellules += `
          <div class="heatmap-cell level-${
            etat==='done' ? '3' : etat==='rest' ? '0' :
            etat==='missed' ? '0' : '0'
          } ${etat==='rest'?'rest':''} ${etat==='missed'?'missed':''}"
               title="${title}"
               style="${date===today ? 'outline:2px solid var(--fd-indigo)' : ''}">
          </div>`;
      }
    }

    el.innerHTML = `
      <!-- Légende -->
      <div class="flex gap-md items-center mb-md" style="flex-wrap:wrap">
        <div class="flex items-center gap-sm">
          <div class="heatmap-cell level-3" style="width:16px;height:16px;display:inline-block"></div>
          <span style="font-size:.75rem;color:var(--text-muted)">Séance</span>
        </div>
        <div class="flex items-center gap-sm">
          <div class="heatmap-cell rest" style="width:16px;height:16px;display:inline-block"></div>
          <span style="font-size:.75rem;color:var(--text-muted)">Repos</span>
        </div>
        <div class="flex items-center gap-sm">
          <div class="heatmap-cell missed" style="width:16px;height:16px;display:inline-block"></div>
          <span style="font-size:.75rem;color:var(--text-muted)">Manquée</span>
        </div>
      </div>

      <!-- Heatmap -->
      <div class="card mb-md">
        <div class="card-label">📅 12 dernières semaines</div>

        <!-- Jours header -->
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:4px;margin-top:var(--space-sm)">
          ${jours.map(j => `
            <div style="text-align:center;font-size:.65rem;color:var(--text-muted)">${j}</div>
          `).join('')}
        </div>

        <!-- Cellules -->
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px">
          ${cellules}
        </div>
      </div>

      <!-- Stats heatmap -->
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
               Math.max(1, Object.values(heatmap).filter(v=>v!=='none').length)) * 100
            )}%
          </span>
          <span class="stat-label">Assiduité</span>
        </div>
      </div>
    `;
  },

  _renderTrophees(el) {
    const xpData     = Gamification.getXP();
    const trophees   = Gamification.getTrophees();
    const debloquees = trophees.filter(t => t.debloquee);
    const verrou     = trophees.filter(t => !t.debloquee);

    el.innerHTML = `
      <!-- XP Bar -->
      <div class="xp-bar-container mb-md">
        <div class="xp-info">
          <span class="xp-level">
            ${xpData.niveau.emoji} Niveau ${xpData.niveau.numero} — ${xpData.niveau.nom}
          </span>
          <span class="xp-count">${xpData.total} / ${xpData.niveau.xpSuivant} XP</span>
        </div>
        <div class="xp-bar">
          <div class="xp-fill" style="width:${xpData.pourcentage}%"></div>
        </div>
      </div>

      <!-- Trophées débloqués -->
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
          </div>
        `).join('') || '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:var(--space-md)">Lance ta première séance !</p>'}
      </div>

      <!-- Trophées verrouillés -->
      <div class="section-title">🔒 À débloquer</div>

      <div class="trophy-grid">
        ${verrou.map(t => `
          <div class="trophy-card locked" title="${t.description}">
            <div class="trophy-icon">${t.emoji}</div>
            <div class="trophy-name">${t.nom}</div>
            <div style="font-size:.6rem;color:var(--text-muted);margin-top:2px">
              +${t.xp} XP
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
};

window.Stats = Stats;
console.log('✅ Stats chargé');
