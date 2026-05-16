/* ============================================================
   FitTracker Pro — Nutrition v1.0
   Planning repas + Recettes + Liste courses E.Leclerc
   ============================================================ */

const Nutrition = {

  // ─── OBJECTIFS CALORIQUES ─────────────────────────────────
  getObjectifCaloriques() {
    const profil   = Tracker.getProfil();
    const poids    = profil.poids  || 80;
    const taille   = profil.taille || 175;
    const seances  = Tracker.getSeancesParSemaine();
    const objectif = Utils.storage.get('ft_objectif_nutrition','maintien');

    // Métabolisme de base (Mifflin-St Jeor)
    const MB = Math.round(10 * poids + 6.25 * taille - 5 * 25 + 5);

    // Facteur activité selon séances/semaine
    const facteur =
      seances >= 5 ? 1.725 :
      seances >= 3 ? 1.55  :
      seances >= 1 ? 1.375 : 1.2;

    const TDEE = Math.round(MB * facteur);

    const calories =
      objectif === 'prise'   ? TDEE + 300 :
      objectif === 'seche'   ? TDEE - 400 :
      TDEE; // maintien

    const proteines = Math.round(poids * 2.0);
    const lipides   = Math.round(poids * 0.9);
    const glucides  = Math.round(
      (calories - proteines * 4 - lipides * 9) / 4
    );

    return {
      calories, proteines, lipides, glucides,
      MB, TDEE, objectif, poids, seances
    };
  },

  // ─── RECETTES BASE ────────────────────────────────────────
  RECETTES: {

    // ── PETITS-DÉJEUNERS ──────────────────────────────────
    pd_oatmeal_proteine: {
      nom:      'Oatmeal Protéiné',
      emoji:    '🥣',
      categorie:'petit-dejeuner',
      temps:    5,
      portions: 1,
      calories: 480,
      macros:   { proteines: 35, glucides: 55, lipides: 12 },
      ingredients: [
        { nom:'Flocons d\'avoine',  qte:'80g',   rayon:'Épicerie' },
        { nom:'Lait demi-écrémé',   qte:'200ml', rayon:'Frais'    },
        { nom:'Whey vanille',       qte:'30g',   rayon:'Épicerie' },
        { nom:'Banane',             qte:'1',     rayon:'Fruits'   },
        { nom:'Beurre de cacahuète',qte:'15g',   rayon:'Épicerie' }
      ],
      etapes: [
        'Faire chauffer le lait 2min au micro-ondes.',
        'Ajouter les flocons et mélanger.',
        'Laisser gonfler 3min.',
        'Incorporer la whey hors du feu.',
        'Servir avec la banane en rondelles et le beurre de cacahuète.'
      ],
      leclerc: 'https://www.courses.leclerc.com'
    },

    pd_oeufs_avocat: {
      nom:      'Œufs Brouillés Avocat',
      emoji:    '🥑',
      categorie:'petit-dejeuner',
      temps:    10,
      portions: 1,
      calories: 420,
      macros:   { proteines: 28, glucides: 20, lipides: 26 },
      ingredients: [
        { nom:'Œufs entiers',  qte:'3',   rayon:'Frais'   },
        { nom:'Avocat',        qte:'1/2', rayon:'Fruits'  },
        { nom:'Pain complet',  qte:'2 tr',rayon:'Boulangerie'},
        { nom:'Sel, poivre',   qte:'QS',  rayon:'Épicerie'},
        { nom:'Ciboulette',    qte:'QS',  rayon:'Légumes' }
      ],
      etapes: [
        'Battre les œufs avec sel et poivre.',
        'Cuire à feu doux en remuant sans cesse (3-4 min).',
        'Toaster le pain.',
        'Écraser l\'avocat avec une pincée de sel.',
        'Servir les œufs sur le pain avec l\'avocat.'
      ],
      leclerc: 'https://www.courses.leclerc.com'
    },

    pd_yaourt_granola: {
      nom:      'Yaourt Grec & Granola',
      emoji:    '🫙',
      categorie:'petit-dejeuner',
      temps:    3,
      portions: 1,
      calories: 390,
      macros:   { proteines: 25, glucides: 48, lipides: 8 },
      ingredients: [
        { nom:'Yaourt grec 0%',     qte:'200g', rayon:'Frais'   },
        { nom:'Granola nature',     qte:'60g',  rayon:'Épicerie'},
        { nom:'Myrtilles',          qte:'80g',  rayon:'Fruits'  },
        { nom:'Miel',               qte:'15g',  rayon:'Épicerie'},
        { nom:'Graines de chia',    qte:'10g',  rayon:'Épicerie'}
      ],
      etapes: [
        'Verser le yaourt dans un bol.',
        'Ajouter le granola par-dessus.',
        'Déposer les myrtilles.',
        'Arroser de miel.',
        'Parsemer de graines de chia.'
      ],
      leclerc: 'https://www.courses.leclerc.com'
    },

    // ── DÉJEUNERS ─────────────────────────────────────────
    dej_poulet_riz: {
      nom:      'Poulet Grillé & Riz Complet',
      emoji:    '🍗',
      categorie:'dejeuner',
      temps:    25,
      portions: 1,
      calories: 620,
      macros:   { proteines: 52, glucides: 68, lipides: 10 },
      ingredients: [
        { nom:'Blanc de poulet',   qte:'200g', rayon:'Boucherie'},
        { nom:'Riz complet',       qte:'100g', rayon:'Épicerie' },
        { nom:'Brocolis',          qte:'200g', rayon:'Légumes'  },
        { nom:'Huile d\'olive',    qte:'10ml', rayon:'Épicerie' },
        { nom:'Ail en poudre',     qte:'QS',   rayon:'Épicerie' },
        { nom:'Jus de citron',     qte:'1/2',  rayon:'Fruits'   }
      ],
      etapes: [
        'Cuire le riz (18 min dans l\'eau bouillante salée).',
        'Assaisonner le poulet : huile, ail, citron, sel.',
        'Cuire le poulet à la poêle 6-7 min de chaque côté.',
        'Cuire les brocolis vapeur 8 min.',
        'Dresser : riz + poulet tranché + brocolis.'
      ],
      leclerc: 'https://www.courses.leclerc.com'
    },

    dej_saumon_patate: {
      nom:      'Saumon & Patate Douce',
      emoji:    '🐟',
      categorie:'dejeuner',
      temps:    30,
      portions: 1,
      calories: 580,
      macros:   { proteines: 42, glucides: 45, lipides: 18 },
      ingredients: [
        { nom:'Pavé de saumon',    qte:'180g', rayon:'Poissonnerie'},
        { nom:'Patate douce',      qte:'200g', rayon:'Légumes'     },
        { nom:'Épinards frais',    qte:'100g', rayon:'Légumes'     },
        { nom:'Huile d\'olive',    qte:'15ml', rayon:'Épicerie'    },
        { nom:'Citron',            qte:'1',    rayon:'Fruits'      },
        { nom:'Aneth',             qte:'QS',   rayon:'Épicerie'    }
      ],
      etapes: [
        'Préchauffer le four à 200°C.',
        'Éplucher et couper la patate douce en cubes, enfourner 25 min.',
        'Cuire le saumon à la poêle 4 min de chaque côté.',
        'Faire revenir les épinards 2 min à l\'huile d\'olive.',
        'Servir avec citron et aneth.'
      ],
      leclerc: 'https://www.courses.leclerc.com'
    },

    dej_pates_thon: {
      nom:      'Pâtes au Thon & Tomates',
      emoji:    '🍝',
      categorie:'dejeuner',
      temps:    15,
      portions: 1,
      calories: 550,
      macros:   { proteines: 38, glucides: 72, lipides: 8 },
      ingredients: [
        { nom:'Pâtes complètes',   qte:'100g', rayon:'Épicerie'},
        { nom:'Thon en boîte',     qte:'160g', rayon:'Épicerie'},
        { nom:'Tomates cerises',   qte:'150g', rayon:'Légumes' },
        { nom:'Oignon rouge',      qte:'1/2',  rayon:'Légumes' },
        { nom:'Basilic',           qte:'QS',   rayon:'Épicerie'},
        { nom:'Huile d\'olive',    qte:'10ml', rayon:'Épicerie'}
      ],
      etapes: [
        'Cuire les pâtes al dente (selon paquet).',
        'Émincer l\'oignon, couper les tomates en deux.',
        'Faire revenir oignon 3 min, ajouter tomates 2 min.',
        'Égoutter le thon, l\'ajouter à la poêle.',
        'Mélanger avec les pâtes. Basilic et huile d\'olive.'
      ],
      leclerc: 'https://www.courses.leclerc.com'
    },

    dej_bowl_quinoa: {
      nom:      'Buddha Bowl Quinoa',
      emoji:    '🥗',
      categorie:'dejeuner',
      temps:    20,
      portions: 1,
      calories: 520,
      macros:   { proteines: 32, glucides: 58, lipides: 14 },
      ingredients: [
        { nom:'Quinoa',            qte:'80g',  rayon:'Épicerie'},
        { nom:'Pois chiches cuits',qte:'150g', rayon:'Épicerie'},
        { nom:'Concombre',         qte:'1/2',  rayon:'Légumes' },
        { nom:'Tomates cerises',   qte:'100g', rayon:'Légumes' },
        { nom:'Feta',              qte:'40g',  rayon:'Frais'   },
        { nom:'Houmous',           qte:'50g',  rayon:'Frais'   },
        { nom:'Citron',            qte:'1/2',  rayon:'Fruits'  }
      ],
      etapes: [
        'Rincer et cuire le quinoa 12 min (eau salée x2 volume).',
        'Couper concombre et tomates.',
        'Faire revenir les pois chiches à la poêle avec paprika.',
        'Assembler : quinoa + légumes + pois chiches + feta.',
        'Servir avec houmous et jus de citron.'
      ],
      leclerc: 'https://www.courses.leclerc.com'
    },

    // ── DÎNERS ────────────────────────────────────────────
    din_steak_legumes: {
      nom:      'Steak & Légumes Rôtis',
      emoji:    '🥩',
      categorie:'diner',
      temps:    25,
      portions: 1,
      calories: 540,
      macros:   { proteines: 48, glucides: 28, lipides: 22 },
      ingredients: [
        { nom:'Steak haché 5%',    qte:'180g', rayon:'Boucherie'},
        { nom:'Courgette',         qte:'1',    rayon:'Légumes'  },
        { nom:'Poivron rouge',     qte:'1',    rayon:'Légumes'  },
        { nom:'Champignons',       qte:'100g', rayon:'Légumes'  },
        { nom:'Pomme de terre',    qte:'150g', rayon:'Légumes'  },
        { nom:'Huile d\'olive',    qte:'15ml', rayon:'Épicerie' },
        { nom:'Herbes de Provence',qte:'QS',   rayon:'Épicerie' }
      ],
      etapes: [
        'Préchauffer le four à 200°C.',
        'Couper les légumes en morceaux, assaisonner.',
        'Enfourner les légumes 20 min.',
        'Cuire le steak à la poêle (2-3 min / côté).',
        'Dresser avec les herbes.'
      ],
      leclerc: 'https://www.courses.leclerc.com'
    },

    din_poulet_curry: {
      nom:      'Poulet Curry & Riz Basmati',
      emoji:    '🍛',
      categorie:'diner',
      temps:    30,
      portions: 1,
      calories: 560,
      macros:   { proteines: 44, glucides: 62, lipides: 11 },
      ingredients: [
        { nom:'Blanc de poulet',   qte:'180g', rayon:'Boucherie'},
        { nom:'Riz basmati',       qte:'80g',  rayon:'Épicerie' },
        { nom:'Lait de coco léger',qte:'200ml',rayon:'Épicerie' },
        { nom:'Pâte de curry',     qte:'1 c.',  rayon:'Épicerie'},
        { nom:'Oignon',            qte:'1',    rayon:'Légumes'  },
        { nom:'Tomates pelées',    qte:'400g', rayon:'Épicerie' },
        { nom:'Coriandre fraîche', qte:'QS',   rayon:'Légumes'  }
      ],
      etapes: [
        'Cuire le riz basmati (12 min).',
        'Faire revenir l\'oignon émincé 3 min.',
        'Ajouter la pâte de curry, remuer 1 min.',
        'Ajouter le poulet en dés, dorer 5 min.',
        'Verser lait de coco + tomates, mijoter 15 min.',
        'Servir avec coriandre fraîche.'
      ],
      leclerc: 'https://www.courses.leclerc.com'
    },

    din_omelette_fromage: {
      nom:      'Omelette Fromage & Salade',
      emoji:    '🍳',
      categorie:'diner',
      temps:    10,
      portions: 1,
      calories: 420,
      macros:   { proteines: 32, glucides: 8, lipides: 28 },
      ingredients: [
        { nom:'Œufs entiers',      qte:'4',    rayon:'Frais'   },
        { nom:'Emmental râpé',     qte:'40g',  rayon:'Frais'   },
        { nom:'Jambon blanc',      qte:'60g',  rayon:'Frais'   },
        { nom:'Salade verte',      qte:'1 bol',rayon:'Légumes' },
        { nom:'Vinaigrette',       qte:'15ml', rayon:'Épicerie'},
        { nom:'Sel, poivre',       qte:'QS',   rayon:'Épicerie'}
      ],
      etapes: [
        'Battre les œufs avec sel et poivre.',
        'Chauffer une poêle huilée.',
        'Verser les œufs, cuire à feu moyen.',
        'Ajouter jambon et fromage quand l\'œuf est mi-pris.',
        'Plier l\'omelette. Servir avec la salade.'
      ],
      leclerc: 'https://www.courses.leclerc.com'
    },

    din_cabillaud_lentilles: {
      nom:      'Cabillaud & Lentilles Corail',
      emoji:    '🐠',
      categorie:'diner',
      temps:    25,
      portions: 1,
      calories: 480,
      macros:   { proteines: 46, glucides: 42, lipides: 8 },
      ingredients: [
        { nom:'Dos de cabillaud',  qte:'200g', rayon:'Poissonnerie'},
        { nom:'Lentilles corail',  qte:'80g',  rayon:'Épicerie'   },
        { nom:'Bouillon légumes',  qte:'400ml',rayon:'Épicerie'   },
        { nom:'Cumin',             qte:'1 c.', rayon:'Épicerie'   },
        { nom:'Citron',            qte:'1',    rayon:'Fruits'     },
        { nom:'Persil',            qte:'QS',   rayon:'Légumes'    }
      ],
      etapes: [
        'Rincer les lentilles, cuire dans le bouillon 15 min.',
        'Assaisonner le cabillaud avec cumin, sel, citron.',
        'Cuire le poisson à la poêle 4 min de chaque côté.',
        'Égoutter les lentilles, assaisonner.',
        'Dresser avec persil et quartier de citron.'
      ],
      leclerc: 'https://www.courses.leclerc.com'
    },

    // ── SNACKS ────────────────────────────────────────────
    snack_shake_fraise: {
      nom:      'Shake Protéiné Fraise',
      emoji:    '🍓',
      categorie:'snack',
      temps:    3,
      portions: 1,
      calories: 280,
      macros:   { proteines: 30, glucides: 25, lipides: 4 },
      ingredients: [
        { nom:'Whey fraise',       qte:'30g',  rayon:'Épicerie'},
        { nom:'Lait demi-écrémé',  qte:'300ml',rayon:'Frais'  },
        { nom:'Fraises',           qte:'100g', rayon:'Fruits' },
        { nom:'Glaçons',           qte:'4',    rayon:'Épicerie'}
      ],
      etapes: [
        'Mettre tous les ingrédients dans le blender.',
        'Mixer 30 secondes.',
        'Servir immédiatement.'
      ],
      leclerc: 'https://www.courses.leclerc.com'
    },

    snack_riz_gateaux: {
      nom:      'Galettes de Riz & Beurre de Cacahuète',
      emoji:    '🥜',
      categorie:'snack',
      temps:    2,
      portions: 1,
      calories: 220,
      macros:   { proteines: 7, glucides: 28, lipides: 9 },
      ingredients: [
        { nom:'Galettes de riz',   qte:'3',    rayon:'Épicerie'},
        { nom:'Beurre de cacahuète',qte:'25g', rayon:'Épicerie'},
        { nom:'Banane',            qte:'1/2',  rayon:'Fruits'  }
      ],
      etapes: [
        'Tartiner les galettes de beurre de cacahuète.',
        'Ajouter quelques rondelles de banane.',
        'C\'est prêt !'
      ],
      leclerc: 'https://www.courses.leclerc.com'
    },

    snack_fromage_blanc: {
      nom:      'Fromage Blanc & Fruits Rouges',
      emoji:    '🫐',
      categorie:'snack',
      temps:    2,
      portions: 1,
      calories: 180,
      macros:   { proteines: 18, glucides: 20, lipides: 2 },
      ingredients: [
        { nom:'Fromage blanc 0%',  qte:'150g', rayon:'Frais'  },
        { nom:'Fruits rouges mix', qte:'80g',  rayon:'Fruits' },
        { nom:'Miel',              qte:'10g',  rayon:'Épicerie'}
      ],
      etapes: [
        'Verser le fromage blanc dans un bol.',
        'Ajouter les fruits rouges.',
        'Arroser de miel.'
      ],
      leclerc: 'https://www.courses.leclerc.com'
    }
  },

  // ─── PLANNING SEMAINE ─────────────────────────────────────
  getPlanningRepas(objectif = null) {
    const obj = objectif ||
      Utils.storage.get('ft_objectif_nutrition', 'maintien');

    // Planning 7 jours selon objectif
    const plans = {
      maintien: [
        // Lundi
        {
          petit_dejeuner: 'pd_oatmeal_proteine',
          dejeuner:       'dej_poulet_riz',
          snack:          'snack_fromage_blanc',
          diner:          'din_steak_legumes'
        },
        // Mardi
        {
          petit_dejeuner: 'pd_oeufs_avocat',
          dejeuner:       'dej_saumon_patate',
          snack:          'snack_shake_fraise',
          diner:          'din_omelette_fromage'
        },
        // Mercredi
        {
          petit_dejeuner: 'pd_yaourt_granola',
          dejeuner:       'dej_pates_thon',
          snack:          'snack_riz_gateaux',
          diner:          'din_poulet_curry'
        },
        // Jeudi
        {
          petit_dejeuner: 'pd_oatmeal_proteine',
          dejeuner:       'dej_bowl_quinoa',
          snack:          'snack_fromage_blanc',
          diner:          'din_cabillaud_lentilles'
        },
        // Vendredi
        {
          petit_dejeuner: 'pd_oeufs_avocat',
          dejeuner:       'dej_poulet_riz',
          snack:          'snack_shake_fraise',
          diner:          'din_steak_legumes'
        },
        // Samedi
        {
          petit_dejeuner: 'pd_yaourt_granola',
          dejeuner:       'dej_saumon_patate',
          snack:          'snack_riz_gateaux',
          diner:          'din_poulet_curry'
        },
        // Dimanche (repas libre)
        {
          petit_dejeuner: 'pd_oatmeal_proteine',
          dejeuner:       'dej_bowl_quinoa',
          snack:          'snack_fromage_blanc',
          diner:          'din_omelette_fromage'
        }
      ],
      prise: [
        {
          petit_dejeuner: 'pd_oatmeal_proteine',
          dejeuner:       'dej_poulet_riz',
          snack:          'snack_shake_fraise',
          diner:          'din_steak_legumes'
        },
        {
          petit_dejeuner: 'pd_oeufs_avocat',
          dejeuner:       'dej_pates_thon',
          snack:          'snack_riz_gateaux',
          diner:          'din_poulet_curry'
        },
        {
          petit_dejeuner: 'pd_yaourt_granola',
          dejeuner:       'dej_poulet_riz',
          snack:          'snack_fromage_blanc',
          diner:          'din_steak_legumes'
        },
        {
          petit_dejeuner: 'pd_oatmeal_proteine',
          dejeuner:       'dej_bowl_quinoa',
          snack:          'snack_shake_fraise',
          diner:          'din_cabillaud_lentilles'
        },
        {
          petit_dejeuner: 'pd_oatmeal_proteine',
          dejeuner:       'dej_poulet_riz',
          snack:          'snack_riz_gateaux',
          diner:          'din_poulet_curry'
        },
        {
          petit_dejeuner: 'pd_oeufs_avocat',
          dejeuner:       'dej_saumon_patate',
          snack:          'snack_fromage_blanc',
          diner:          'din_steak_legumes'
        },
        {
          petit_dejeuner: 'pd_yaourt_granola',
          dejeuner:       'dej_pates_thon',
          snack:          'snack_shake_fraise',
          diner:          'din_omelette_fromage'
        }
      ],
      seche: [
        {
          petit_dejeuner: 'pd_oeufs_avocat',
          dejeuner:       'dej_saumon_patate',
          snack:          'snack_fromage_blanc',
          diner:          'din_cabillaud_lentilles'
        },
        {
          petit_dejeuner: 'pd_yaourt_granola',
          dejeuner:       'dej_bowl_quinoa',
          snack:          'snack_fromage_blanc',
          diner:          'din_omelette_fromage'
        },
        {
          petit_dejeuner: 'pd_oeufs_avocat',
          dejeuner:       'dej_saumon_patate',
          snack:          'snack_shake_fraise',
          diner:          'din_steak_legumes'
        },
        {
          petit_dejeuner: 'pd_yaourt_granola',
          dejeuner:       'dej_bowl_quinoa',
          snack:          'snack_fromage_blanc',
          diner:          'din_cabillaud_lentilles'
        },
        {
          petit_dejeuner: 'pd_oeufs_avocat',
          dejeuner:       'dej_pates_thon',
          snack:          'snack_riz_gateaux',
          diner:          'din_omelette_fromage'
        },
        {
          petit_dejeuner: 'pd_yaourt_granola',
          dejeuner:       'dej_saumon_patate',
          snack:          'snack_fromage_blanc',
          diner:          'din_steak_legumes'
        },
        {
          petit_dejeuner: 'pd_oeufs_avocat',
          dejeuner:       'dej_bowl_quinoa',
          snack:          'snack_shake_fraise',
          diner:          'din_poulet_curry'
        }
      ]
    };

    return plans[obj] || plans.maintien;
  },

  // ─── LISTE DE COURSES ─────────────────────────────────────
  getListeCourses(objectif = null) {
    const planning = this.getPlanningRepas(objectif);
    const courses  = {};

    // Collecter tous les ingrédients de la semaine
    planning.forEach(jour => {
      Object.values(jour).forEach(recetteId => {
        const recette = this.RECETTES[recetteId];
        if (!recette) return;

        recette.ingredients.forEach(ing => {
          const cle = ing.nom.toLowerCase();
          if (!courses[cle]) {
            courses[cle] = {
              nom:   ing.nom,
              rayon: ing.rayon,
              qtes:  []
            };
          }
          courses[cle].qtes.push(ing.qte);
        });
      });
    });

    // Regrouper par rayon
    const parRayon = {};
    Object.values(courses).forEach(item => {
      if (!parRayon[item.rayon]) parRayon[item.rayon] = [];
      parRayon[item.rayon].push({
        nom:  item.nom,
        qte:  [...new Set(item.qtes)].join(' + ')
      });
    });

    return parRayon;
  },

  // ─── MACROS DU JOUR ───────────────────────────────────────
  getMacrosJour(indexJour) {
    const objectif = Utils.storage.get('ft_objectif_nutrition','maintien');
    const planning = this.getPlanningRepas(objectif);
    const jour     = planning[indexJour] || planning[0];

    let totalCal  = 0;
    let totalProt = 0;
    let totalGluc = 0;
    let totalLip  = 0;

    Object.values(jour).forEach(recetteId => {
      const r = this.RECETTES[recetteId];
      if (!r) return;
      totalCal  += r.calories;
      totalProt += r.macros.proteines;
      totalGluc += r.macros.glucides;
      totalLip  += r.macros.lipides;
    });

    return {
      calories:  totalCal,
      proteines: totalProt,
      glucides:  totalGluc,
      lipides:   totalLip
    };
  },

  // ─── RENDER PRINCIPAL ─────────────────────────────────────
  render(tab = 'planning') {
    const container = document.getElementById('page-content');
    if (!container) return;

    const objectif = Utils.storage.get('ft_objectif_nutrition','maintien');
    const macros   = this.getObjectifCaloriques();

    container.innerHTML = `

      <!-- Header objectif -->
      <div class="card mb-md"
           style="background:linear-gradient(135deg,
                  rgba(139,240,187,0.15) 0%,
                  rgba(75,75,249,0.15) 100%);
                  border-color:var(--fd-mint)">
        <div class="flex justify-between items-center">
          <div>
            <div class="card-label" style="color:var(--fd-mint)">
              🥗 Nutrition
            </div>
            <div style="font-size:.88rem;margin-top:4px;
                        color:var(--text-primary)">
              <strong>${macros.calories}</strong> kcal/jour
              · <strong>${macros.proteines}g</strong> protéines
            </div>
          </div>
          <select class="input"
                  style="width:auto;font-size:.8rem;padding:6px 8px"
                  onchange="
                    Utils.storage.set('ft_objectif_nutrition',this.value);
                    Nutrition.render('planning')">
            <option value="maintien"
              ${objectif==='maintien'?'selected':''}>
              ⚖️ Maintien
            </option>
            <option value="prise"
              ${objectif==='prise'?'selected':''}>
              💪 Prise de masse
            </option>
            <option value="seche"
              ${objectif==='seche'?'selected':''}>
              🔥 Sèche
            </option>
          </select>
        </div>

        <!-- Macros bar -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);
                    gap:var(--space-sm);margin-top:var(--space-md)">
          ${[
            { label:'Protéines', val:macros.proteines,
              color:'var(--fd-mint)',    unit:'g' },
            { label:'Glucides',  val:macros.glucides,
              color:'var(--fd-lemon)',   unit:'g' },
            { label:'Lipides',   val:macros.lipides,
              color:'var(--fd-lavender)',unit:'g' }
          ].map(m => `
            <div style="text-align:center;
                        background:rgba(0,0,0,0.2);
                        border-radius:var(--radius-sm);
                        padding:var(--space-sm)">
              <div style="font-size:1.1rem;font-weight:800;
                          color:${m.color}">
                ${m.val}${m.unit}
              </div>
              <div style="font-size:.65rem;
                          color:var(--text-muted)">
                ${m.label}
              </div>
            </div>`).join('')}
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-container">
        ${[
          { id:'planning', label:'📅 Planning'  },
          { id:'recettes', label:'👨‍🍳 Recettes'  },
          { id:'courses',  label:'🛒 Courses'   },
          { id:'macros',   label:'📊 Macros'    }
        ].map(t => `
          <button class="tab-btn ${tab===t.id?'active':''}"
                  onclick="Nutrition.render('${t.id}')">
            ${t.label}
          </button>`).join('')}
      </div>

      <div id="nutrition-content"></div>
    `;

    const content = document.getElementById('nutrition-content');
    switch(tab) {
      case 'planning': this._renderPlanning(content); break;
      case 'recettes': this._renderRecettes(content); break;
      case 'courses':  this._renderCourses(content);  break;
      case 'macros':   this._renderMacros(content);   break;
    }
  },

  // ─── PLANNING ─────────────────────────────────────────────
  _renderPlanning(el) {
    const objectif = Utils.storage.get('ft_objectif_nutrition','maintien');
    const planning = this.getPlanningRepas(objectif);
    const joursNoms = ['Lundi','Mardi','Mercredi','Jeudi',
                       'Vendredi','Samedi','Dimanche'];
    const repasIcons = {
      petit_dejeuner: '🌅',
      dejeuner:       '☀️',
      snack:          '🍎',
      diner:          '🌙'
    };
    const repasLabels = {
      petit_dejeuner: 'Petit-déjeuner',
      dejeuner:       'Déjeuner',
      snack:          'Collation',
      diner:          'Dîner'
    };

    const jourIdx = new Date().getDay();
    const jourActuel = jourIdx === 0 ? 6 : jourIdx - 1;

    el.innerHTML = planning.map((jour, i) => {
      const estAujourdHui = i === jourActuel;
      const macros = this.getMacrosJour(i);

      return `
        <div class="card mb-md"
             style="${estAujourdHui
               ? 'border-color:var(--fd-mint);'
                 + 'background:rgba(139,240,187,0.05)'
               : ''}">
          <div class="flex justify-between items-center mb-md">
            <div style="font-weight:700;font-size:.95rem;
                        color:${estAujourdHui
                          ? 'var(--fd-mint)'
                          : 'var(--text-primary)'}">
              ${estAujourdHui ? '📍 ' : ''}${joursNoms[i]}
              ${estAujourdHui
                ? '<span class="chip chip-mint"'
                  + ' style="font-size:.6rem">Aujourd\'hui</span>'
                : ''}
            </div>
            <div style="font-size:.72rem;color:var(--text-muted)">
              ~${macros.calories} kcal
            </div>
          </div>

          ${Object.entries(jour).map(([repas, recetteId]) => {
            const r = this.RECETTES[recetteId];
            if (!r) return '';
            return `
              <div onclick="Nutrition._afficherRecette('${recetteId}')"
                   style="display:flex;align-items:center;
                          gap:var(--space-sm);
                          padding:var(--space-sm) 0;
                          border-bottom:1px solid var(--border-color);
                          cursor:pointer">
                <div style="font-size:1.2rem;width:32px;
                            text-align:center">
                  ${repasIcons[repas]}
                </div>
                <div style="flex:1">
                  <div style="font-size:.7rem;font-weight:600;
                              color:var(--text-muted);
                              text-transform:uppercase;
                              letter-spacing:.05em">
                    ${repasLabels[repas]}
                  </div>
                  <div style="font-size:.88rem;font-weight:600;
                              color:var(--text-primary)">
                    ${r.emoji} ${r.nom}
                  </div>
                  <div style="font-size:.7rem;
                              color:var(--text-muted)">
                    ${r.calories} kcal
                    · ${r.macros.proteines}g protéines
                    · ⏱️ ${r.temps}min
                  </div>
                </div>
                <div style="color:var(--fd-indigo);
                            font-size:.9rem">›</div>
              </div>`;
          }).join('')}
        </div>`;
    }).join('');
  },

  // ─── RECETTES ─────────────────────────────────────────────
  _renderRecettes(el) {
    const categories = {
      'petit-dejeuner': { label:'🌅 Petits-déjeuners', color:'var(--fd-lemon)'   },
      'dejeuner':       { label:'☀️ Déjeuners',         color:'var(--fd-mint)'    },
      'diner':          { label:'🌙 Dîners',            color:'var(--fd-lavender)'},
      'snack':          { label:'🍎 Collations',        color:'var(--fd-coral)'   }
    };

    el.innerHTML = Object.entries(categories).map(([cat, info]) => {
      const recettes = Object.entries(this.RECETTES)
        .filter(([,r]) => r.categorie === cat);

      return `
        <div class="section-title" style="color:${info.color}">
          ${info.label}
        </div>
        ${recettes.map(([id, r]) => `
          <div class="card mb-md"
               onclick="Nutrition._afficherRecette('${id}')"
               style="cursor:pointer">
            <div class="flex items-center gap-md">
              <div style="font-size:2rem;width:48px;
                          text-align:center">
                ${r.emoji}
              </div>
              <div style="flex:1">
                <div style="font-weight:700;font-size:.92rem">
                  ${r.nom}
                </div>
                <div style="font-size:.72rem;
                            color:var(--text-muted);
                            margin-top:2px">
                  ⏱️ ${r.temps}min
                  · ${r.calories} kcal
                  · 🥩 ${r.macros.proteines}g prot.
                </div>
                <div style="display:flex;gap:4px;
                            margin-top:4px;flex-wrap:wrap">
                  ${r.ingredients.slice(0,3).map(ing => `
                    <span class="chip chip-indigo"
                          style="font-size:.6rem">
                      ${ing.nom}
                    </span>`).join('')}
                  ${r.ingredients.length > 3 ? `
                    <span class="chip chip-indigo"
                          style="font-size:.6rem">
                      +${r.ingredients.length - 3}
                    </span>` : ''}
                </div>
              </div>
              <div style="color:var(--fd-indigo)">›</div>
            </div>
          </div>`).join('')}`;
    }).join('');
  },

  // ─── AFFICHER RECETTE DÉTAIL ───────────────────────────────
  _afficherRecette(id) {
    const r = this.RECETTES[id];
    if (!r) return;

    const modal   = document.getElementById('modal-info');
    const content = document.getElementById('modal-info-content');

    content.innerHTML = `
      <div style="text-align:center;margin-bottom:var(--space-lg)">
        <div style="font-size:3rem;margin-bottom:var(--space-sm)">
          ${r.emoji}
        </div>
        <h3 style="font-size:1.2rem;font-weight:700">
          ${r.nom}
        </h3>
        <div style="font-size:.78rem;color:var(--text-muted);
                    margin-top:4px">
          ⏱️ ${r.temps} min · 🍽️ ${r.portions} portion
        </div>
      </div>

      <!-- Macros -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);
                  gap:var(--space-xs);margin-bottom:var(--space-lg)">
        ${[
          { label:'Calories',  val:r.calories,          unit:'kcal',
            color:'var(--fd-lemon)'    },
          { label:'Protéines', val:r.macros.proteines,  unit:'g',
            color:'var(--fd-mint)'     },
          { label:'Glucides',  val:r.macros.glucides,   unit:'g',
            color:'var(--fd-indigo)'   },
          { label:'Lipides',   val:r.macros.lipides,    unit:'g',
            color:'var(--fd-lavender)' }
        ].map(m => `
          <div style="text-align:center;padding:var(--space-sm);
                      background:var(--bg-input);
                      border-radius:var(--radius-sm)">
            <div style="font-size:1rem;font-weight:800;
                        color:${m.color}">
              ${m.val}
            </div>
            <div style="font-size:.6rem;color:var(--text-muted)">
              ${m.unit}<br>${m.label}
            </div>
          </div>`).join('')}
      </div>

      <!-- Ingrédients -->
      <div class="card-label">🛒 Ingrédients</div>
      <div style="margin-bottom:var(--space-lg)">
        ${r.ingredients.map(ing => `
          <div style="display:flex;justify-content:space-between;
                      padding:var(--space-xs) 0;font-size:.85rem;
                      border-bottom:1px solid var(--border-color)">
            <span>${ing.nom}</span>
            <span style="font-weight:600;color:var(--fd-indigo)">
              ${ing.qte}
            </span>
          </div>`).join('')}
      </div>

      <!-- Préparation -->
      <div class="card-label">👨‍🍳 Préparation</div>
      <div style="margin-bottom:var(--space-lg)">
        ${r.etapes.map((e, i) => `
          <div style="display:flex;gap:var(--space-md);
                      padding:var(--space-sm) 0;
                      border-bottom:1px solid var(--border-color)">
            <div style="width:24px;height:24px;border-radius:50%;
                        background:var(--fd-indigo);color:white;
                        display:flex;align-items:center;
                        justify-content:center;font-size:.75rem;
                        font-weight:700;flex-shrink:0">
              ${i+1}
            </div>
            <div style="font-size:.85rem;line-height:1.5;
                        padding-top:2px">
              ${e}
            </div>
          </div>`).join('')}
      </div>

      <!-- Lien E.Leclerc -->
      <a href="https://www.courses.leclerc.com/search/?q=${
          encodeURIComponent(r.ingredients[0].nom)}"
         target="_blank"
         style="display:flex;align-items:center;justify-content:center;
                gap:var(--space-sm);width:100%;
                padding:var(--space-md);
                background:var(--fd-indigo);color:white;
                border-radius:var(--radius-md);font-weight:600;
                font-size:.9rem;text-decoration:none;
                margin-top:var(--space-sm)">
        🛒 Commander sur E.Leclerc
      </a>
    `;

    modal.classList.remove('hidden');
    document.getElementById('modal-info-close').onclick =
      () => modal.classList.add('hidden');
    modal.querySelector('.modal-overlay').onclick =
      () => modal.classList.add('hidden');
  },

  // ─── COURSES ──────────────────────────────────────────────
  _renderCourses(el) {
    const objectif = Utils.storage.get('ft_objectif_nutrition','maintien');
    const courses  = this.getListeCourses(objectif);

    const rayonEmojis = {
      'Boucherie':    '🥩',
      'Poissonnerie': '🐟',
      'Frais':        '🥛',
      'Légumes':      '🥦',
      'Fruits':       '🍌',
      'Épicerie':     '🏪',
      'Boulangerie':  '🍞'
    };

    el.innerHTML = `
      <!-- Header -->
      <div class="card mb-md"
           style="background:rgba(75,75,249,0.08);
                  border-color:var(--fd-indigo);
                  text-align:center">
        <div style="font-size:1.5rem;margin-bottom:4px">🛒</div>
        <div style="font-weight:700;margin-bottom:4px">
          Liste de courses — semaine complète
        </div>
        <div style="font-size:.78rem;color:var(--text-muted)">
          Basée sur ton planning
          ${objectif === 'prise' ? 'Prise de masse' :
            objectif === 'seche' ? 'Sèche' : 'Maintien'}
        </div>
        <a href="https://www.courses.leclerc.com"
           target="_blank"
           style="display:inline-flex;align-items:center;gap:6px;
                  margin-top:var(--space-md);
                  padding:var(--space-sm) var(--space-md);
                  background:var(--fd-indigo);color:white;
                  border-radius:var(--radius-full);
                  font-size:.82rem;font-weight:600;
                  text-decoration:none">
          🛒 Ouvrir E.Leclerc en ligne
        </a>
      </div>

      <!-- Par rayon -->
      ${Object.entries(courses).map(([rayon, items]) => `
        <div class="card mb-md">
          <div class="card-label"
               style="color:var(--fd-lavender);
                      margin-bottom:var(--space-md)">
            ${rayonEmojis[rayon] || '📦'} ${rayon}
            <span style="font-size:.65rem;color:var(--text-muted);
                         font-weight:400;margin-left:4px">
              (${items.length} articles)
            </span>
          </div>
          ${items.map(item => `
            <div style="display:flex;align-items:center;
                        gap:var(--space-md);
                        padding:var(--space-sm) 0;
                        border-bottom:1px solid var(--border-color)">
              <div style="width:18px;height:18px;
                          border-radius:4px;
                          border:2px solid var(--border-color);
                          flex-shrink:0;cursor:pointer"
                   onclick="this.style.background=
                     this.style.background
                       ? '' : 'var(--fd-indigo)';
                     this.style.borderColor=
                       this.style.background
                         ? 'var(--fd-indigo)' : ''">
              </div>
              <div style="flex:1;font-size:.88rem">
                ${item.nom}
              </div>
              <a href="https://www.courses.leclerc.com/search/?q=${
                  encodeURIComponent(item.nom)}"
                 target="_blank"
                 style="font-size:.65rem;color:var(--fd-indigo);
                        text-decoration:none;
                        white-space:nowrap">
                Leclerc →
              </a>
            </div>`).join('')}
        </div>`).join('')}
    `;
  },

  // ─── MACROS ───────────────────────────────────────────────
  _renderMacros(el) {
    const macros  = this.getObjectifCaloriques();
    const jourIdx = new Date().getDay();
    const idx     = jourIdx === 0 ? 6 : jourIdx - 1;
    const jourMacros = this.getMacrosJour(idx);

    el.innerHTML = `

      <!-- Objectif vs Réel -->
      <div class="card mb-md">
        <div class="card-label">
          🎯 Objectif vs Planning du jour
        </div>
        <div style="margin-top:var(--space-md)">
          ${[
            { label:'🔥 Calories',
              obj: macros.calories,
              reel: jourMacros.calories,
              unit: 'kcal',
              color:'var(--fd-lemon)' },
            { label:'🥩 Protéines',
              obj: macros.proteines,
              reel: jourMacros.proteines,
              unit: 'g',
              color:'var(--fd-mint)' },
            { label:'🍞 Glucides',
              obj: macros.glucides,
              reel: jourMacros.glucides,
              unit: 'g',
              color:'var(--fd-indigo)' },
            { label:'🫒 Lipides',
              obj: macros.lipides,
              reel: jourMacros.lipides,
              unit: 'g',
              color:'var(--fd-lavender)' }
          ].map(m => {
            const pct = Math.min(100,
              Math.round((m.reel / Math.max(m.obj,1)) * 100)
            );
            return `
              <div style="margin-bottom:var(--space-md)">
                <div class="flex justify-between"
                     style="margin-bottom:4px">
                  <span style="font-size:.85rem;font-weight:600">
                    ${m.label}
                  </span>
                  <span style="font-size:.82rem;
                               color:${m.color};font-weight:700">
                    ${m.reel} / ${m.obj}${m.unit}
                  </span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill"
                       style="width:${pct}%;
                              background:${m.color}">
                  </div>
                </div>
                <div style="font-size:.68rem;
                            color:var(--text-muted);
                            margin-top:2px;text-align:right">
                  ${pct}%
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>

      <!-- Infos métabolisme -->
      <div class="card mb-md">
        <div class="card-label">⚡ Ton métabolisme</div>
        <div style="margin-top:var(--space-md)">
          ${[
            { label:'Métabolisme de base (MB)',
              val:`${macros.MB} kcal` },
            { label:'Dépense totale (TDEE)',
              val:`${macros.TDEE} kcal` },
            { label:'Objectif (ajusté)',
              val:`${macros.calories} kcal` },
            { label:'Séances cette semaine',
              val:`${macros.seances}` },
            { label:'Poids utilisé',
              val:`${macros.poids} kg` }
          ].map(r => `
            <div class="score-row">
              <span class="score-row-label">${r.label}</span>
              <span class="score-row-value">${r.val}</span>
            </div>`).join('')}
        </div>
      </div>

      <!-- Conseils -->
      <div class="card">
        <div class="card-label">💡 Conseils nutrition</div>
        ${[
          { emoji:'⏰', titre:'Timing protéines',
            desc:'Consomme des protéines dans les 30min post-séance.' },
          { emoji:'💧', titre:'Hydratation',
            desc:`${Math.round(macros.poids*0.035)}L d'eau minimum par jour.` },
          { emoji:'🌙', titre:'Dîner léger',
            desc:'Privilégie les protéines et légumes le soir.' },
          { emoji:'🍌', titre:'Avant séance',
            desc:'Glucides complexes 2h avant l\'effort.' },
          { emoji:'😴', titre:'Sommeil & nutrition',
            desc:'Un bon sommeil optimise l\'assimilation des protéines.' }
        ].map(c => `
          <div style="display:flex;gap:var(--space-md);
                      padding:var(--space-sm) 0;
                      border-bottom:1px solid var(--border-color)">
            <span style="font-size:1.3rem">${c.emoji}</span>
            <div>
              <div style="font-weight:600;font-size:.88rem">
                ${c.titre}
              </div>
              <div style="font-size:.78rem;color:var(--text-muted);
                          margin-top:2px">
                ${c.desc}
              </div>
            </div>
          </div>`).join('')}
      </div>
    `;
  }
};

window.Nutrition = Nutrition;
console.log('✅ Nutrition v1.0 chargé');
