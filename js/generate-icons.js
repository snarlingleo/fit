<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>🏋️ Générateur d'icônes FitTracker</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: #09092d;
      color: white;
      font-family: system-ui, sans-serif;
      padding: 2rem;
      min-height: 100vh;
    }

    h1 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      color: #4b4bf9;
    }

    p { color: rgba(255,255,255,0.6); margin-bottom: 2rem; font-size: .9rem; }

    .grid {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .icon-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    canvas {
      border-radius: 22%;
      border: 2px solid rgba(75,75,249,0.4);
      box-shadow: 0 4px 20px rgba(75,75,249,0.3);
    }

    .size-label {
      font-size: .75rem;
      color: rgba(255,255,255,0.5);
    }

    .btn-download {
      background: #4b4bf9;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: .78rem;
      font-weight: 600;
      transition: opacity .2s;
    }

    .btn-download:hover { opacity: 0.85; }

    #btn-download-all {
      background: #4b4bf9;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 700;
      width: 100%;
      max-width: 400px;
      display: block;
      margin: 0 auto 1rem;
      box-shadow: 0 0 20px rgba(75,75,249,0.4);
    }

    #status {
      text-align: center;
      color: #8bf0bb;
      font-size: .88rem;
      margin-top: 1rem;
    }

    .upload-zone {
      border: 2px dashed rgba(75,75,249,0.5);
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
      margin-bottom: 2rem;
      cursor: pointer;
      transition: all .2s;
    }

    .upload-zone:hover {
      border-color: #4b4bf9;
      background: rgba(75,75,249,0.1);
    }

    .upload-zone input { display: none; }

    #preview-source {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      object-fit: cover;
      margin: 0.5rem auto;
      display: none;
    }
  </style>
</head>
<body>

  <h1>🏋️ Générateur d'icônes FitTracker Pro</h1>
  <p>Génère automatiquement toutes les tailles d'icônes PWA depuis ton image.</p>

  <!-- Zone upload -->
  <div class="upload-zone" onclick="document.getElementById('file-input').click()">
    <div style="font-size:2rem;margin-bottom:.5rem">📁</div>
    <div style="font-weight:600">Clique pour charger ton image</div>
    <div style="font-size:.78rem;color:rgba(255,255,255,.4);margin-top:.3rem">
      PNG, JPG, SVG — Idéalement carré
    </div>
    <img id="preview-source" alt="preview" />
    <input type="file" id="file-input" accept="image/*"
           onchange="chargerImage(this)" />
  </div>

  <!-- Grille des icônes -->
  <div class="grid" id="icons-grid"></div>

  <!-- Bouton tout télécharger -->
  <button id="btn-download-all" onclick="toutTelecharger()" style="display:none">
    ⬇️ Télécharger toutes les icônes (ZIP)
  </button>

  <div id="status"></div>

  <script>
    // ─── Config icônes ─────────────────────────────────────────
    const ICONES = [
      { taille: 72,   nom: 'icon-72.png',   radius: 16  },
      { taille: 96,   nom: 'icon-96.png',   radius: 18  },
      { taille: 128,  nom: 'icon-128.png',  radius: 24  },
      { taille: 152,  nom: 'icon-152.png',  radius: 28  },
      { taille: 180,  nom: 'icon-180.png',  radius: 32  },
      { taille: 192,  nom: 'icon-192.png',  radius: 36  },
      { taille: 512,  nom: 'icon-512.png',  radius: 96  },
      // Badge (petit, pas d'arrondi)
      { taille: 32,   nom: 'badge-32.png',  radius: 6   },
      { taille: 16,   nom: 'favicon-16.png',radius: 3   },
    ];

    // ─── Palette FitTracker ────────────────────────────────────
    const COULEURS = {
      bg_principal: '#09092d',   // Midnight
      bg_gradient1: '#0f0f3d',
      bg_gradient2: '#09092d',
      accent:       '#4b4bf9',   // Indigo
      accent_glow:  'rgba(75,75,249,0.6)',
      lemon:        '#f9ef77',   // Contour néon
      white:        '#ffffff'
    };

    let imgSource = null;
    let canvasMap = {};

    // ─── Charger image ─────────────────────────────────────────
    function chargerImage(input) {
      const file = input.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          imgSource = img;

          // Preview source
          const preview = document.getElementById('preview-source');
          preview.src   = e.target.result;
          preview.style.display = 'block';

          genererTout();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    // ─── Générer toutes les icônes ─────────────────────────────
    function genererTout() {
      const grid = document.getElementById('icons-grid');
      grid.innerHTML = '';
      canvasMap = {};

      ICONES.forEach(config => {
        const box    = document.createElement('div');
        box.className = 'icon-box';

        const canvas = document.createElement('canvas');
        canvas.width  = config.taille;
        canvas.height = config.taille;
        canvas.style.width  = Math.min(config.taille, 96) + 'px';
        canvas.style.height = Math.min(config.taille, 96) + 'px';

        dessinerIcone(canvas, config);
        canvasMap[config.nom] = canvas;

        const label = document.createElement('div');
        label.className   = 'size-label';
        label.textContent = `${config.taille}×${config.taille}`;

        const btn = document.createElement('button');
        btn.className   = 'btn-download';
        btn.textContent = '⬇ Télécharger';
        btn.onclick     = () => telecharger(canvas, config.nom);

        box.append(canvas, label, btn);
        grid.appendChild(box);
      });

      document.getElementById('btn-download-all').style.display = 'block';
      document.getElementById('status').textContent =
        `✅ ${ICONES.length} icônes générées !`;
    }

    // ─── Dessiner une icône ────────────────────────────────────
    function dessinerIcone(canvas, config) {
      const ctx  = canvas.getContext('2d');
      const s    = config.taille;
      const r    = config.radius;

      ctx.clearRect(0, 0, s, s);

      // 1. Fond arrondi avec gradient
      ctx.save();
      roundedRect(ctx, 0, 0, s, s, r);
      ctx.clip();

      // Gradient fond dark
      const grad = ctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s*0.8);
      grad.addColorStop(0, COULEURS.bg_gradient1);
      grad.addColorStop(1, COULEURS.bg_gradient2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, s, s);

      // 2. Cercle glow en arrière-plan
      const glowGrad = ctx.createRadialGradient(s/2, s*0.48, 0, s/2, s*0.48, s*0.42);
      glowGrad.addColorStop(0, 'rgba(75,75,249,0.35)');
      glowGrad.addColorStop(0.5, 'rgba(75,75,249,0.12)');
      glowGrad.addColorStop(1,   'rgba(75,75,249,0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, s, s);

      // 3. Image source (centrée + padding)
      if (imgSource) {
        const pad    = s * 0.12;
        const imgS   = s - pad * 2;
        const imgX   = pad;
        const imgY   = pad;

        // Glow sous l'image
        ctx.shadowColor   = COULEURS.accent_glow;
        ctx.shadowBlur    = s * 0.15;
        ctx.shadowOffsetY = s * 0.03;

        ctx.drawImage(imgSource, imgX, imgY, imgS, imgS);

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur  = 0;
      }

      // 4. Bordure néon indigo
      if (s >= 96) {
        ctx.strokeStyle = COULEURS.accent;
        ctx.lineWidth   = Math.max(2, s * 0.012);
        roundedRect(ctx, 1, 1, s-2, s-2, r-1);
        ctx.stroke();
      }

      ctx.restore();
    }

    // ─── Utilitaire: rectangle arrondi ────────────────────────
    function roundedRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    // ─── Télécharger une icône ─────────────────────────────────
    function telecharger(canvas, nom) {
      const a  = document.createElement('a');
      a.href   = canvas.toDataURL('image/png');
      a.download = nom;
      a.click();
    }

    // ─── Télécharger toutes ────────────────────────────────────
    async function toutTelecharger() {
      const status = document.getElementById('status');
      status.textContent = '⏳ Téléchargement en cours...';

      for (const config of ICONES) {
        const canvas = canvasMap[config.nom];
        if (canvas) {
          await new Promise(r => setTimeout(r, 200));
          telecharger(canvas, config.nom);
        }
      }

      status.textContent = `✅ ${ICONES.length} icônes téléchargées ! 
        Place-les dans assets/icons/`;
    }

    // ─── Auto-load si image déjà présente ─────────────────────
    // Charger automatiquement l'image fournie (ton logo)
    window.addEventListener('load', () => {
      // Tu peux pré-charger une image directement ici :
      // const img = new Image();
      // img.onload = () => { imgSource = img; genererTout(); };
      // img.src = './assets/icons/source.png';
    });
  </script>

</body>
</html>