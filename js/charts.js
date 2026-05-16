/* ============================================================
   FitTracker Pro — Charts v1
   Graphiques interactifs avec Chart.js
   ============================================================ */

const Charts = {

  // ─── Config globale Chart.js ──────────────────────────────
  DEFAULTS: {
    color:      '#ffffff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    grid:       'rgba(75,75,249,0.15)',
    indigo:     '#4b4bf9',
    mint:       '#8bf0bb',
    lemon:      '#f9ef77',
    coral:      '#ff8d96',
    lavender:   '#bfa1ff',
    midnight:   '#09092d'
  },

  // ─── Instances actives ────────────────────────────────────
  _instances: {},

  // ─── Détruire un chart existant ──────────────────────────
  _destroy(id) {
    if (this._instances[id]) {
      this._instances[id].destroy();
      delete this._instances[id];
    }
  },

  // ─── Config de base commune ───────────────────────────────
  _baseConfig() {
    return {
      plugins: {
        legend: {
          labels: {
            color:    this.DEFAULTS.color,
            font:     { family: this.DEFAULTS.fontFamily, size: 11 },
            boxWidth: 12,
            padding:  16
          }
        },
        tooltip: {
          backgroundColor: 'rgba(9,9,45,0.95)',
          borderColor:     this.DEFAULTS.indigo,
          borderWidth:     1,
          titleColor:      this.DEFAULTS.color,
          bodyColor:       'rgba(255,255,255,0.7)',
          padding:         12,
          cornerRadius:    8
        }
      },
      scales: {
        x: {
          grid:  { color: this.DEFAULTS.grid },
          ticks: {
            color:  'rgba(255,255,255,0.5)',
            font:   { family: this.DEFAULTS.fontFamily, size: 10 }
          }
        },
        y: {
          grid:  { color: this.DEFAULTS.grid },
          ticks: {
            color:  'rgba(255,255,255,0.5)',
            font:   { family: this.DEFAULTS.fontFamily, size: 10 }
          }
        }
      },
      responsive:          true,
      maintainAspectRatio: false,
      animation: {
        duration: 800,
        easing:   'easeInOutQuart'
      }
    };
  },

  // ══════════════════════════════════════════════════════════
  // 1. VOLUME PAR SEMAINE
  // ══════════════════════════════════════════════════════════

  renderVolumeParSemaine(canvasId) {
    this._destroy(canvasId);
    const ctx  = document.getElementById(canvasId);
    if (!ctx) return;

    const data    = Tracker.getVolumeParSemaine(12); // 12 dernières semaines
    const labels  = data.map(d => d.label);
    const volumes = data.map(d => d.volume);
    const moyenne = volumes.reduce((a,b) => a+b, 0) / (volumes.length || 1);

    const config = this._baseConfig();

    this._instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label:           'Volume (kg)',
            data:            volumes,
            backgroundColor: volumes.map(v =>
              v >= moyenne
                ? 'rgba(75,75,249,0.8)'
                : 'rgba(75,75,249,0.35)'
            ),
            borderColor:     this.DEFAULTS.indigo,
            borderWidth:     1,
            borderRadius:    6,
            borderSkipped:   false
          },
          {
            label:           'Moyenne',
            data:            volumes.map(() => Math.round(moyenne)),
            type:            'line',
            borderColor:     this.DEFAULTS.lemon,
            borderWidth:     2,
            borderDash:      [6, 3],
            pointRadius:     0,
            fill:            false,
            tension:         0
          }
        ]
      },
      options: {
        ...config,
        plugins: {
          ...config.plugins,
          tooltip: {
            ...config.plugins.tooltip,
            callbacks: {
              label: ctx =>
                ` ${Utils.formatVolume(ctx.parsed.y)}`
            }
          }
        }
      }
    });
  },

  // ══════════════════════════════════════════════════════════
  // 2. PROGRESSION PAR EXERCICE (courbe 1RM)
  // ══════════════════════════════════════════════════════════

  renderProgressionExercice(canvasId, exerciceRef) {
    this._destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const historique = Tracker.getProgressionExercice(exerciceRef, 12);
    if (!historique?.length) {
      ctx.parentElement.innerHTML = `
        <div style="text-align:center;padding:var(--space-xl);
                    color:var(--text-muted);font-size:.85rem">
          📊 Pas encore de données pour cet exercice
        </div>`;
      return;
    }

    const labels     = historique.map(h => h.label);
    const charges    = historique.map(h => h.poids);
    const rm1s       = historique.map(h => h.rm1);

    const config = this._baseConfig();

    this._instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label:           'Charge max (kg)',
            data:            charges,
            borderColor:     this.DEFAULTS.indigo,
            backgroundColor: 'rgba(75,75,249,0.15)',
            borderWidth:     3,
            pointBackgroundColor: this.DEFAULTS.indigo,
            pointBorderColor:     '#fff',
            pointBorderWidth:     2,
            pointRadius:          5,
            pointHoverRadius:     8,
            fill:            true,
            tension:         0.4
          },
          {
            label:           '1RM estimé (kg)',
            data:            rm1s,
            borderColor:     this.DEFAULTS.mint,
            backgroundColor: 'transparent',
            borderWidth:     2,
            borderDash:      [5, 3],
            pointBackgroundColor: this.DEFAULTS.mint,
            pointRadius:          4,
            pointHoverRadius:     6,
            fill:            false,
            tension:         0.4
          }
        ]
      },
      options: {
        ...config,
        plugins: {
          ...config.plugins,
          tooltip: {
            ...config.plugins.tooltip,
            callbacks: {
              label: ctx =>
                ` ${ctx.dataset.label}: ${ctx.parsed.y} kg`
            }
          }
        }
      }
    });
  },

  // ══════════════════════════════════════════════════════════
  // 3. RÉPARTITION MUSCLES (Donut)
  // ══════════════════════════════════════════════════════════

  renderRepartitionMuscles(canvasId) {
    this._destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const data = Tracker.getRepartitionMuscles();
    if (!data?.length) return;

    const couleurs = [
      this.DEFAULTS.indigo,
      this.DEFAULTS.mint,
      this.DEFAULTS.lemon,
      this.DEFAULTS.coral,
      this.DEFAULTS.lavender,
      'rgba(75,75,249,0.5)',
      'rgba(139,240,187,0.5)'
    ];

    this._instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels:   data.map(d => d.muscle),
        datasets: [{
          data:            data.map(d => d.volume),
          backgroundColor: couleurs.slice(0, data.length),
          borderColor:     this.DEFAULTS.midnight,
          borderWidth:     3,
          hoverOffset:     8
        }]
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        animation: { duration: 800, easing: 'easeInOutQuart' },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color:    this.DEFAULTS.color,
              font:     { family: this.DEFAULTS.fontFamily, size: 10 },
              boxWidth: 10,
              padding:  12
            }
          },
          tooltip: {
            backgroundColor: 'rgba(9,9,45,0.95)',
            borderColor:     this.DEFAULTS.indigo,
            borderWidth:     1,
            titleColor:      this.DEFAULTS.color,
            bodyColor:       'rgba(255,255,255,0.7)',
            padding:         12,
            callbacks: {
              label: ctx => ` ${ctx.label}: ${Utils.formatVolume(ctx.parsed)}`
            }
          }
        },
        cutout: '65%'
      }
    });
  },

  // ══════════════════════════════════════════════════════════
  // 4. ÉVOLUTION POIDS CORPOREL
  // ══════════════════════════════════════════════════════════

  renderPoidsCorps(canvasId) {
    this._destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const historique = Tracker.getHistoriquePoids(30);
    if (!historique?.length) {
      ctx.parentElement.innerHTML = `
        <div style="text-align:center;padding:var(--space-xl);
                    color:var(--text-muted);font-size:.85rem">
          ⚖️ Aucune donnée de poids enregistrée
        </div>`;
      return;
    }

    const config = this._baseConfig();

    this._instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: historique.map(h => h.date),
        datasets: [{
          label:           'Poids (kg)',
          data:            historique.map(h => h.poids),
          borderColor:     this.DEFAULTS.coral,
          backgroundColor: 'rgba(255,141,150,0.15)',
          borderWidth:     3,
          pointBackgroundColor: this.DEFAULTS.coral,
          pointBorderColor:     '#fff',
          pointBorderWidth:     2,
          pointRadius:          5,
          pointHoverRadius:     8,
          fill:            true,
          tension:         0.4
        }]
      },
      options: {
        ...config,
        plugins: {
          ...config.plugins,
          tooltip: {
            ...config.plugins.tooltip,
            callbacks: {
              label: ctx => ` ${ctx.parsed.y} kg`
            }
          }
        },
        scales: {
          ...config.scales,
          y: {
            ...config.scales.y,
            ticks: {
              ...config.scales.y.ticks,
              callback: val => `${val} kg`
            }
          }
        }
      }
    });
  },

  // ══════════════════════════════════════════════════════════
  // 5. SÉANCES PAR JOUR DE LA SEMAINE (Radar)
  // ══════════════════════════════════════════════════════════

  renderSeancesParJour(canvasId) {
    this._destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const data   = Tracker.getSeancesParJourSemaine();
    const jours  = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

    this._instances[canvasId] = new Chart(ctx, {
      type: 'radar',
      data: {
        labels:   jours,
        datasets: [{
          label:           'Séances',
          data:            data,
          borderColor:     this.DEFAULTS.lavender,
          backgroundColor: 'rgba(191,161,255,0.2)',
          borderWidth:     2,
          pointBackgroundColor: this.DEFAULTS.lavender,
          pointBorderColor:     '#fff',
          pointBorderWidth:     2,
          pointRadius:          5
        }]
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        animation: { duration: 800 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(9,9,45,0.95)',
            borderColor:     this.DEFAULTS.lavender,
            borderWidth:     1,
            titleColor:      this.DEFAULTS.color,
            bodyColor:       'rgba(255,255,255,0.7)',
            padding:         12
          }
        },
        scales: {
          r: {
            grid:      { color: this.DEFAULTS.grid },
            ticks: {
              color:      'rgba(255,255,255,0.4)',
              backdropColor: 'transparent',
              font: { size: 9 }
            },
            pointLabels: {
              color: 'rgba(255,255,255,0.7)',
              font:  { family: this.DEFAULTS.fontFamily, size: 11 }
            }
          }
        }
      }
    });
  },

  // ══════════════════════════════════════════════════════════
  // 6. RPE PAR SEMAINE (ligne)
  // ══════════════════════════════════════════════════════════

  renderRPEEvolution(canvasId) {
    this._destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const data   = Tracker.getRPEParSemaine(10);
    const config = this._baseConfig();

    this._instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.semaine),
        datasets: [
          {
            label:           'RPE moyen',
            data:            data.map(d => d.rpe),
            borderColor:     this.DEFAULTS.coral,
            backgroundColor: 'rgba(255,141,150,0.1)',
            borderWidth:     3,
            pointBackgroundColor: data.map(d =>
              d.rpe >= 8.5
                ? this.DEFAULTS.coral
                : d.rpe >= 7
                  ? this.DEFAULTS.lemon
                  : this.DEFAULTS.mint
            ),
            pointBorderColor:  '#fff',
            pointBorderWidth:  2,
            pointRadius:       5,
            pointHoverRadius:  8,
            fill:    true,
            tension: 0.4
          },
          {
            label:      'Zone déload (8.5)',
            data:       data.map(() => 8.5),
            borderColor:'rgba(255,141,150,0.5)',
            borderWidth: 1,
            borderDash:  [5,3],
            pointRadius: 0,
            fill:        false
          }
        ]
      },
      options: {
        ...config,
        scales: {
          ...config.scales,
          y: {
            ...config.scales.y,
            min: 0,
            max: 10,
            ticks: {
              ...config.scales.y.ticks,
              callback: val => `${val}/10`
            }
          }
        }
      }
    });
  },

  // ══════════════════════════════════════════════════════════
  // RENDER ONGLET STATS COMPLET
  // ══════════════════════════════════════════════════════════

  renderStatsTab(container) {
    const analyse  = Coach.getAnalyseSemaine();
    const xp       = Gamification.getXP();
    const trophees = Gamification.getTrophees().filter(t => t.debloquee);

    // Liste des exercices pour le sélecteur
    const exercicesList = Object.entries(EXERCICES || {})
      .map(([ref, ex]) => ({ ref, ...ex }));

    container.innerHTML = `

      <!-- KPIs rapides -->
      <div class="stats-grid mb-md">
        <div class="stat-card">
          <span class="stat-value">${Tracker.getTotalSeances()}</span>
          <span class="stat-label">Séances</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">
            ${Utils.formatVolume(Tracker.getVolumeSemaine())}
          </span>
          <span class="stat-label">Vol. semaine</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${Tracker.getStreak().count}🔥</span>
          <span class="stat-label">Streak</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${trophees.length}🏆</span>
          <span class="stat-label">Trophées</span>
        </div>
      </div>

      <!-- XP Bar -->
      <div class="card mb-md"
           style="background:linear-gradient(135deg,
                  rgba(75,75,249,0.3) 0%,
                  rgba(123,47,247,0.2) 100%)">
        <div style="display:flex;align-items:center;
                    justify-content:space-between;
                    margin-bottom:var(--space-sm)">
          <div>
            <span style="font-size:1.4rem">${xp.niveau.emoji}</span>
            <span style="font-weight:700;margin-left:8px">
              Niv.${xp.niveau.numero} — ${xp.niveau.nom}
            </span>
          </div>
          <span style="color:var(--fd-lemon);font-weight:700">
            ${xp.total} XP
          </span>
        </div>
        <div style="height:6px;background:rgba(255,255,255,0.15);
                    border-radius:99px;overflow:hidden">
          <div style="height:100%;width:${xp.pourcentage}%;
                      background:var(--fd-lemon);
                      border-radius:99px;
                      transition:width 1s ease">
          </div>
        </div>
        <div style="font-size:.68rem;color:var(--text-muted);
                    margin-top:4px;text-align:right">
          ${xp.niveau.xpSuivant - xp.total} XP jusqu'au niveau suivant
        </div>
      </div>

      <!-- Volume par semaine -->
      <div class="card mb-md">
        <div class="card-label">📊 Volume par semaine (12 sem.)</div>
        <div style="height:200px;margin-top:var(--space-md)">
          <canvas id="chart-volume"></canvas>
        </div>
      </div>

      <!-- Progression exercice -->
      <div class="card mb-md">
        <div style="display:flex;align-items:center;
                    justify-content:space-between;
                    margin-bottom:var(--space-md)">
          <div class="card-label" style="margin:0">
            📈 Progression exercice
          </div>
          <select id="select-exercice-chart"
                  onchange="Charts.onExerciceChange(this.value)"
                  style="background:var(--bg-input);
                         border:1px solid var(--border-color);
                         color:var(--text-primary);
                         font-size:.78rem;
                         padding:4px 8px;
                         border-radius:var(--radius-sm);
                         cursor:pointer">
            ${exercicesList.map(e => `
              <option value="${e.ref}">
                ${e.emoji || '💪'} ${e.nom || e.ref}
              </option>`).join('')}
          </select>
        </div>
        <div style="height:200px" id="chart-progression-container">
          <canvas id="chart-progression"></canvas>
        </div>
      </div>

      <!-- Répartition muscles + Séances/jour -->
      <div style="display:grid;grid-template-columns:1fr 1fr;
                  gap:var(--space-md);margin-bottom:var(--space-md)">

        <div class="card">
          <div class="card-label">💪 Muscles</div>
          <div style="height:180px;margin-top:var(--space-md)">
            <canvas id="chart-muscles"></canvas>
          </div>
        </div>

        <div class="card">
          <div class="card-label">📅 / Jour</div>
          <div style="height:180px;margin-top:var(--space-md)">
            <canvas id="chart-jours"></canvas>
          </div>
        </div>
      </div>

      <!-- RPE Evolution -->
      <div class="card mb-md">
        <div class="card-label">⚡ Évolution RPE (10 sem.)</div>
        <div style="height:180px;margin-top:var(--space-md)">
          <canvas id="chart-rpe"></canvas>
        </div>
      </div>

      <!-- Poids corporel -->
      <div class="card mb-md">
        <div style="display:flex;align-items:center;
                    justify-content:space-between;
                    margin-bottom:var(--space-md)">
          <div class="card-label" style="margin:0">
            ⚖️ Évolution poids corporel
          </div>
          <button onclick="Charts.ajouterPoids()"
                  class="btn-sm btn-indigo">
            + Ajouter
          </button>
        </div>
        <div style="height:180px" id="chart-poids-container">
          <canvas id="chart-poids"></canvas>
        </div>
      </div>

      <!-- PRs actuels -->
      <div class="card">
        <div class="card-label">🏆 Records personnels actuels</div>
        <div id="prs-list" style="margin-top:var(--space-sm)">
          ${this._renderPRsList()}
        </div>
      </div>
    `;

    // ── Render tous les charts après injection DOM
    requestAnimationFrame(() => {
      this.renderVolumeParSemaine('chart-volume');
      this.renderProgressionExercice(
        'chart-progression',
        exercicesList[0]?.ref || 'bench_press'
      );
      this.renderRepartitionMuscles('chart-muscles');
      this.renderSeancesParJour('chart-jours');
      this.renderRPEEvolution('chart-rpe');
      this.renderPoidsCorps('chart-poids');
    });
  },

  // ─── Changement exercice dans le select ───────────────────
  onExerciceChange(ref) {
    const container = document.getElementById('chart-progression-container');
    if (!container) return;
    container.innerHTML = '<canvas id="chart-progression"></canvas>';
    this.renderProgressionExercice('chart-progression', ref);
  },

  // ─── Ajouter poids corporel ───────────────────────────────
  ajouterPoids() {
    const poids = prompt('Ton poids aujourd\'hui (kg) :');
    if (!poids || isNaN(parseFloat(poids))) return;
    Tracker.ajouterPoids(parseFloat(poids));
    const container = document.getElementById('chart-poids-container');
    if (container) {
      container.innerHTML = '<canvas id="chart-poids"></canvas>';
      this.renderPoidsCorps('chart-poids');
    }
    Utils.toast(`⚖️ Poids enregistré : ${poids} kg`, 'success');
  },

  // ─── Liste des PRs ────────────────────────────────────────
  _renderPRsList() {
    const prs = Tracker.getAllPRs();
    const entries = Object.entries(prs);

    if (!entries.length) return `
      <div style="text-align:center;padding:var(--space-lg);
                  color:var(--text-muted);font-size:.85rem">
        Aucun record enregistré pour l'instant
      </div>`;

    return entries
      .sort((a,b) => (b[1].poids||0) - (a[1].poids||0))
      .map(([ref, pr]) => {
        const ex = EXERCICES?.[ref] || {};
        return `
          <div class="score-row">
            <span class="score-row-label">
              ${ex.emoji || '💪'} ${ex.nom || ref}
            </span>
            <div style="display:flex;align-items:center;gap:8px">
              <span class="score-row-value">
                ${pr.poids}kg × ${pr.reps}
              </span>
              ${pr.rm1 ? `
                <span style="font-size:.68rem;
                             color:var(--fd-mint);
                             font-weight:600">
                  ~${pr.rm1}kg 1RM
                </span>` : ''}
            </div>
          </div>`;
      }).join('');
  },

  // ─── Détruire tous les charts ─────────────────────────────
  destroyAll() {
    Object.keys(this._instances).forEach(id => this._destroy(id));
  }
};

window.Charts = Charts;
console.log('✅ Charts v1 chargé');
