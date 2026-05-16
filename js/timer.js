/* ============================================================
   FitTracker Pro — Timer
   Compte à rebours, sons, vibration, fullscreen
   ============================================================ */

class TimerRepos {

  constructor() {
    this.interval     = null;
    this.restant      = 0;
    this.total        = 0;
    this.actif        = false;
    this.enPause      = false;

    this.sons = {
      beep:   this._creerSon(880, 0.1, 0.05),
      finish: null,
      pr:     null
    };

    this.callbacks = {
      onTick:  null,
      onEnd:   null,
      onPause: null
    };

    this._initSons();
  }

  // ─── SONS WEB AUDIO API (pas de fichiers nécessaires) ─────
  _creerContexte() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this._ctx;
  }

  _creerSon(freq, volume, duree) {
    return () => {
      try {
        const ctx  = this._creerContexte();
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duree);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duree);
      } catch(e) {
        // Son non supporté — silencieux
      }
    };
  }

  _initSons() {
    this.sons.beep   = this._creerSon(880, 0.15, 0.08);
    this.sons.finish = () => {
      [523, 659, 784, 1047].forEach((freq, i) => {
        setTimeout(() => this._creerSon(freq, 0.2, 0.15)(), i * 120);
      });
    };
    this.sons.pr = () => {
      [523, 659, 784, 880, 1047].forEach((freq, i) => {
        setTimeout(() => this._creerSon(freq, 0.25, 0.2)(), i * 100);
      });
    };
    this.sons.beepCourt = this._creerSon(660, 0.1, 0.05);
    this.sons.levelup   = () => {
      [392, 523, 659, 784, 1047].forEach((freq, i) => {
        setTimeout(() => this._creerSon(freq, 0.2, 0.25)(), i * 80);
      });
    };
  }

  jouerSon(nom) {
    const sonActif = Utils.storage.get('ft_son', true);
    if (!sonActif) return;
    if (this.sons[nom]) this.sons[nom]();
  }

  // ─── DÉMARRER ─────────────────────────────────────────────
  demarrer(secondes, onTick, onEnd) {
    this.arreter();
    this.restant  = secondes;
    this.total    = secondes;
    this.actif    = true;
    this.enPause  = false;
    this.callbacks.onTick = onTick;
    this.callbacks.onEnd  = onEnd;

    this._tick();
    this.interval = setInterval(() => this._tick(), 1000);
  }

  _tick() {
    if (this.callbacks.onTick) {
      this.callbacks.onTick(this.restant, this.total);
    }

    // Sons de décompte (3 dernières secondes)
    if (this.restant <= 3 && this.restant > 0) {
      this.jouerSon('beep');
      Utils.vibrer([50]);
    }

    if (this.restant === 0) {
      this.jouerSon('finish');
      Utils.vibrerFin();
      clearInterval(this.interval);
      this.actif = false;
      if (this.callbacks.onEnd) {
        setTimeout(() => this.callbacks.onEnd(), 200);
      }
      return;
    }

    this.restant--;
  }

  // ─── PAUSE / REPRENDRE ────────────────────────────────────
  pauseReprendre() {
    if (!this.actif && !this.enPause) return;

    if (!this.enPause) {
      // Mettre en pause
      clearInterval(this.interval);
      this.enPause = true;
      if (this.callbacks.onPause) this.callbacks.onPause(true, this.restant);
    } else {
      // Reprendre
      this.enPause  = false;
      this.interval = setInterval(() => this._tick(), 1000);
      if (this.callbacks.onPause) this.callbacks.onPause(false, this.restant);
    }
  }

  // ─── AJUSTER ──────────────────────────────────────────────
  ajuster(delta) {
    this.restant = Math.max(0, Math.min(600, this.restant + delta));
    this.total   = Math.max(this.total, this.restant);
    if (this.callbacks.onTick) {
      this.callbacks.onTick(this.restant, this.total);
    }
    this.jouerSon('beepCourt');
  }

  // ─── ARRÊTER ──────────────────────────────────────────────
  arreter() {
    clearInterval(this.interval);
    this.actif   = false;
    this.enPause = false;
    this.restant = 0;
  }

  reset(secondes = null) {
    this.arreter();
    if (secondes !== null) {
      this.restant = secondes;
      this.total   = secondes;
    }
  }

  // ─── GETTERS ──────────────────────────────────────────────
  getPourcentage() {
    if (this.total === 0) return 0;
    return Math.max(0, Math.min(1, this.restant / this.total));
  }

  isActif() { return this.actif || this.enPause; }
}

// ─── TIMER SÉANCE (chrono global) ────────────────────────────
class ChronoSeance {

  constructor() {
    this.debut    = null;
    this.interval = null;
    this.callback = null;
  }

  demarrer(onTick) {
    this.debut    = Date.now();
    this.callback = onTick;
    this.interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.debut) / 1000);
      if (this.callback) this.callback(elapsed);
    }, 1000);
  }

  arreter() {
    clearInterval(this.interval);
    return this.debut ? Math.floor((Date.now() - this.debut) / 1000) : 0;
  }

  getElapsed() {
    return this.debut ? Math.floor((Date.now() - this.debut) / 1000) : 0;
  }
}

// ─── INSTANCES GLOBALES ───────────────────────────────────────
const timerRepos   = new TimerRepos();
const chronoSeance = new ChronoSeance();

window.TimerRepos    = TimerRepos;
window.ChronoSeance  = ChronoSeance;
window.timerRepos    = timerRepos;
window.chronoSeance  = chronoSeance;

console.log('✅ Timer chargé');
