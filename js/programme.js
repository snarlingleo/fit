/* ============================================================
   FitTracker Pro — Programme v3.0
   Exercices + Séances + Cycles + Planning custom
   + Supersets + Décharge auto + Progression intelligente
   ============================================================ */

// ════════════════════════════════════════════════════════════
// BIBLIOTHÈQUE EXERCICES (50+)
// ════════════════════════════════════════════════════════════
const EXERCICES = {

  // ══ PECTORAUX ══════════════════════════════════════════
  bench_press: {
    nom: 'Développé couché',
    muscle: 'Pectoraux',
    muscles_sec: ['Triceps', 'Épaules'],
    equipement: 'Barre olympique + Banc plat',
    emoji: '💪',
    difficulte: 2,
    description: 'Allongé sur le banc, prise légèrement plus large que les épaules. Descente contrôlée jusqu\'à effleurer les pectoraux, poussée explosive.',
    conseils: [
      'Omoplates serrées et déprimées',
      'Pieds bien à plat au sol',
      'Ne pas rebondir sur la poitrine',
      'Coudes à 75° du corps'
    ]
  },

  incline_halteres: {
    nom: 'Développé incliné haltères',
    muscle: 'Pectoraux Hauts',
    muscles_sec: ['Épaules', 'Triceps'],
    equipement: 'Haltères + Banc incliné 30-45°',
    emoji: '💪',
    difficulte: 2,
    description: 'Banc incliné à 30-45°, haltères en pronation. Descente lente, coudes à 75° du corps.',
    conseils: [
      'Angle 30-45° maximum',
      'Amplitude complète',
      'Contrôle total en descente',
      'Ne pas trop monter l\'inclinaison'
    ]
  },

  chest_press_machine: {
    nom: 'Chest Press Machine',
    muscle: 'Pectoraux',
    muscles_sec: ['Triceps'],
    equipement: 'Machine Chest Press',
    emoji: '🤖',
    difficulte: 1,
    description: 'Machine guidée, régler le siège pour que les poignées soient à hauteur de poitrine.',
    conseils: [
      'Régler le siège correctement',
      'Ne pas verrouiller les coudes',
      'Pression constante tout le mouvement'
    ]
  },

  ecarte_poulie: {
    nom: 'Écarté poulie haute',
    muscle: 'Pectoraux',
    muscles_sec: [],
    equipement: 'Câble crossover',
    emoji: '🔄',
    difficulte: 2,
    description: 'Câbles en position haute, légère flexion vers l\'avant. Ramener les mains en arc de cercle devant la poitrine.',
    conseils: [
      'Légère flexion du coude tout le mouvement',
      'Squeeze fort en fin de mouvement',
      'Contrôle en ouverture'
    ]
  },

  dips: {
    nom: 'Dips',
    muscle: 'Pectoraux / Triceps',
    muscles_sec: ['Épaules'],
    equipement: 'Barres parallèles',
    emoji: '⬇️',
    difficulte: 3,
    description: 'Se pencher légèrement en avant pour cibler les pectoraux. Descendre jusqu\'à 90° de flexion des coudes.',
    conseils: [
      'Pencher = pectoraux, droit = triceps',
      'Contrôle total en descente',
      'Pas d\'à-coup dans le bas'
    ]
  },

  pompes: {
    nom: 'Pompes',
    muscle: 'Pectoraux',
    muscles_sec: ['Triceps', 'Épaules', 'Core'],
    equipement: 'Poids du corps',
    emoji: '⬆️',
    difficulte: 1,
    description: 'Mains légèrement plus larges que les épaules. Corps gainé de la tête aux pieds. Descente jusqu\'au sol.',
    conseils: [
      'Corps rigide comme une planche',
      'Coudes à 45° du corps',
      'Amplitude complète'
    ]
  },

  // ══ DOS ════════════════════════════════════════════════
  tractions: {
    nom: 'Tractions',
    muscle: 'Grand Dorsal',
    muscles_sec: ['Biceps', 'Rhomboïdes'],
    equipement: 'Barre de traction',
    emoji: '🔗',
    difficulte: 3,
    description: 'Prise pronation légèrement plus large que les épaules. Monter jusqu\'au menton au-dessus de la barre.',
    conseils: [
      'Scapulas déprimées avant de tirer',
      'Pas d\'à-coup pour démarrer',
      'Descente complète et contrôlée'
    ]
  },

  rowing_barre: {
    nom: 'Rowing barre',
    muscle: 'Dos Moyen',
    muscles_sec: ['Biceps', 'Trapèzes'],
    equipement: 'Barre olympique',
    emoji: '🔗',
    difficulte: 3,
    description: 'Dos parallèle au sol, prise pronation. Tirer la barre vers le nombril en serrant les omoplates.',
    conseils: [
      'Dos plat OBLIGATOIRE',
      'Tirage vers le nombril',
      'Coudes proches du corps'
    ]
  },

  lat_pulldown: {
    nom: 'Tirage poulie haute',
    muscle: 'Grand Dorsal',
    muscles_sec: ['Biceps'],
    equipement: 'Lat Pulldown',
    emoji: '⬇️',
    difficulte: 1,
    description: 'Prise large, tirer la barre vers le haut de la poitrine en initiateur avec les coudes.',
    conseils: [
      'Ne pas se pencher excessivement',
      'Initier le mouvement par les coudes',
      'Amplitude complète'
    ]
  },

  rowing_machine: {
    nom: 'Rowing machine assise',
    muscle: 'Dos Moyen',
    muscles_sec: ['Biceps', 'Rhomboïdes'],
    equipement: 'Machine Rowing',
    emoji: '🤖',
    difficulte: 1,
    description: 'Dos droit, tirer les poignées vers le ventre. Serrer les omoplates en fin de mouvement.',
    conseils: [
      'Dos droit pendant tout le mouvement',
      'Pas de balancement du tronc',
      'Serrer les omoplates en fin'
    ]
  },

  'soulevé_terre': {
    nom: 'Soulevé de terre',
    muscle: 'Chaîne postérieure',
    muscles_sec: ['Fessiers', 'Ischio-jambiers', 'Dos', 'Trapèzes'],
    equipement: 'Barre olympique',
    emoji: '🏋️',
    difficulte: 4,
    description: 'Pieds largeur des hanches, barre contre les tibias. Monter en poussant le sol, garder la barre près du corps.',
    conseils: [
      'Dos NEUTRE — jamais arrondi',
      'Barre proche du corps tout le mouvement',
      'Pousser le sol, ne pas tirer avec le dos',
      'Inspirez avant la montée'
    ]
  },

  pullover: {
    nom: 'Pull-over haltère',
    muscle: 'Grand Dorsal',
    muscles_sec: ['Pectoraux'],
    equipement: 'Haltère + Banc plat',
    emoji: '🔄',
    difficulte: 2,
    description: 'Allongé, haltère tenu à deux mains. Descente en arc derrière la tête, amplitude progressive.',
    conseils: [
      'Légère flexion du coude',
      'Ne pas descendre trop bas au début',
      'Amplitude progressive selon souplesse'
    ]
  },

  // ══ ÉPAULES ════════════════════════════════════════════
  dev_militaire: {
    nom: 'Développé militaire',
    muscle: 'Épaules',
    muscles_sec: ['Triceps', 'Trapèzes'],
    equipement: 'Haltères ou Barre',
    emoji: '💪',
    difficulte: 3,
    description: 'Debout ou assis, pousser au-dessus de la tête. Core gainé pour protéger le dos.',
    conseils: [
      'Core bien gainé',
      'Ne pas cambrer le bas du dos',
      'Lockout complet en haut'
    ]
  },

  elev_laterales: {
    nom: 'Élévations latérales',
    muscle: 'Deltoïdes Latéraux',
    muscles_sec: [],
    equipement: 'Haltères',
    emoji: '🦅',
    difficulte: 1,
    description: 'Bras légèrement fléchis, lever les haltères à hauteur d\'épaule de chaque côté.',
    conseils: [
      'Ne pas hausser les épaules',
      'Coudes légèrement fléchis',
      'Contrôle en descente'
    ]
  },

  shoulder_press_machine: {
    nom: 'Shoulder Press Machine',
    muscle: 'Épaules',
    muscles_sec: ['Triceps'],
    equipement: 'Machine Épaules',
    emoji: '🤖',
    difficulte: 1,
    description: 'Machine guidée. Régler le siège pour que les poignées soient à hauteur des épaules.',
    conseils: [
      'Régler la hauteur du siège',
      'Pas de verrouillage brutal',
      'Expirer en poussant'
    ]
  },

  face_pull: {
    nom: 'Face Pull',
    muscle: 'Deltoïdes Postérieurs',
    muscles_sec: ['Trapèzes', 'Rhomboïdes'],
    equipement: 'Câble poulie haute + corde',
    emoji: '🔄',
    difficulte: 2,
    description: 'Câble à hauteur du visage, tirer la corde en écartant les mains vers les tempes.',
    conseils: [
      'Coudes à hauteur des épaules',
      'Rotation externe en fin de mouvement',
      'Léger poids, focus technique'
    ]
  },

  oiseau: {
    nom: 'Oiseau',
    muscle: 'Deltoïdes Postérieurs',
    muscles_sec: ['Rhomboïdes'],
    equipement: 'Haltères',
    emoji: '🦢',
    difficulte: 2,
    description: 'Penché en avant dos plat, lever les haltères vers les côtés en rotation externe.',
    conseils: [
      'Dos plat et horizontal',
      'Mouvement lent et contrôlé',
      'Coudes légèrement fléchis'
    ]
  },

  // ══ BICEPS ═════════════════════════════════════════════
  curl_halteres: {
    nom: 'Curl haltères',
    muscle: 'Biceps',
    muscles_sec: ['Avant-bras'],
    equipement: 'Haltères',
    emoji: '💪',
    difficulte: 1,
    description: 'Coudes fixés contre le corps. Lever en supination progressive.',
    conseils: [
      'Coudes fixes contre le corps',
      'Supination complète en montant',
      'Descente lente et contrôlée'
    ]
  },

  curl_barre: {
    nom: 'Curl barre EZ',
    muscle: 'Biceps',
    muscles_sec: ['Avant-bras'],
    equipement: 'Barre EZ',
    emoji: '💪',
    difficulte: 1,
    description: 'Barre EZ pour protéger les poignets. Mouvement strict, sans balancement.',
    conseils: [
      'Pas de balancement du corps',
      'Coudes fixes',
      'Prise EZ plus confortable que la barre droite'
    ]
  },

  curl_marteau: {
    nom: 'Curl marteau',
    muscle: 'Brachial',
    muscles_sec: ['Biceps', 'Avant-bras'],
    equipement: 'Haltères',
    emoji: '🔨',
    difficulte: 1,
    description: 'Prise neutre (pouces vers le haut). Cible principalement le brachial.',
    conseils: [
      'Prise neutre tout le mouvement',
      'Coudes fixes',
      'Mouvement lent pour focus brachial'
    ]
  },

  curl_machine: {
    nom: 'Curl machine',
    muscle: 'Biceps',
    muscles_sec: [],
    equipement: 'Machine Curl',
    emoji: '🤖',
    difficulte: 1,
    description: 'Machine guidée, bras posés sur le pupitre. Isolation parfaite des biceps.',
    conseils: [
      'Bras bien collés au pupitre',
      'Amplitude complète',
      'Squeeze fort en haut'
    ]
  },

  // ══ TRICEPS ════════════════════════════════════════════
  ext_triceps_poulie: {
    nom: 'Extension triceps poulie',
    muscle: 'Triceps',
    muscles_sec: [],
    equipement: 'Câble poulie haute + corde',
    emoji: '⬇️',
    difficulte: 1,
    description: 'Coudes fixes contre le corps. Pousser vers le bas jusqu\'à extension complète.',
    conseils: [
      'Coudes fixes tout le mouvement',
      'Extension complète en bas',
      'Écarter légèrement la corde en bas'
    ]
  },

  barre_front: {
    nom: 'Barre au front',
    muscle: 'Triceps',
    muscles_sec: [],
    equipement: 'Barre EZ + Banc plat',
    emoji: '💥',
    difficulte: 2,
    description: 'Allongé, barre descend vers le front ou derrière la tête. Coudes pointent vers le plafond.',
    conseils: [
      'Coudes fixes — ne pas les écarter',
      'Contrôle total en descente',
      'Ne jamais toucher le front !'
    ]
  },

  dips_triceps: {
    nom: 'Dips triceps (banc)',
    muscle: 'Triceps',
    muscles_sec: ['Épaules'],
    equipement: 'Banc',
    emoji: '⬇️',
    difficulte: 1,
    description: 'Mains sur le banc, corps proche. Descente par flexion des coudes.',
    conseils: [
      'Corps proche du banc',
      'Coudes vers l\'arrière',
      'Amplitude complète'
    ]
  },

  // ══ JAMBES ═════════════════════════════════════════════
  squat: {
    nom: 'Squat',
    muscle: 'Quadriceps',
    muscles_sec: ['Fessiers', 'Ischio-jambiers', 'Core'],
    equipement: 'Rack à squat + Barre',
    emoji: '🦵',
    difficulte: 3,
    description: 'Pieds largeur épaules ou légèrement plus larges. Descendre jusqu\'à cuisses parallèles au sol minimum.',
    conseils: [
      'Genoux dans l\'axe des pieds',
      'Talons au sol tout le mouvement',
      'Dos droit, poitrine haute',
      'Profondeur = au moins parallèle'
    ]
  },

  presse_cuisses: {
    nom: 'Presse à cuisses',
    muscle: 'Quadriceps',
    muscles_sec: ['Fessiers', 'Ischio-jambiers'],
    equipement: 'Machine Presse inclinée',
    emoji: '🤖',
    difficulte: 1,
    description: 'Pieds à plat à largeur des épaules. Descente jusqu\'à 90° de flexion des genoux.',
    conseils: [
      'Ne pas décoller les fesses du siège',
      'Pieds à plat sur la plateforme',
      'Ne pas verrouiller les genoux en haut'
    ]
  },

  fentes: {
    nom: 'Fentes marchées',
    muscle: 'Quadriceps',
    muscles_sec: ['Fessiers', 'Ischio-jambiers'],
    equipement: 'Haltères',
    emoji: '🚶',
    difficulte: 2,
    description: 'Grand pas en avant, descendre le genou arrière près du sol. Alterner les jambes.',
    conseils: [
      'Genou avant dans l\'axe du pied',
      'Torse droit, regard devant',
      'Contrôle de l\'équilibre'
    ]
  },

  leg_curl: {
    nom: 'Leg Curl couché',
    muscle: 'Ischio-jambiers',
    muscles_sec: [],
    equipement: 'Machine Leg Curl',
    emoji: '🦵',
    difficulte: 1,
    description: 'Allongé sur la machine, fléchir les genoux pour amener les talons vers les fessiers.',
    conseils: [
      'Hanches collées à la machine',
      'Amplitude complète',
      'Pas d\'à-coup dans le haut'
    ]
  },

  leg_extension: {
    nom: 'Leg Extension',
    muscle: 'Quadriceps',
    muscles_sec: [],
    equipement: 'Machine Leg Extension',
    emoji: '🦵',
    difficulte: 1,
    description: 'Assis, étendre les jambes vers l\'avant. Isolation parfaite des quadriceps.',
    conseils: [
      'Pas de verrouillage brutal en haut',
      'Contrôle en descente',
      'Squeeze en position haute'
    ]
  },

  mollets: {
    nom: 'Mollets debout',
    muscle: 'Mollets',
    muscles_sec: [],
    equipement: 'Machine Mollets / Smith Machine',
    emoji: '⬆️',
    difficulte: 1,
    description: 'Monter sur la pointe des pieds, tenir 1 seconde en haut, descendre lentement avec étirement complet.',
    conseils: [
      'Amplitude complète obligatoire',
      'Tenir 1s en position haute',
      'Descente lente pour étirement'
    ]
  },

  hip_thrust: {
    nom: 'Hip Thrust',
    muscle: 'Fessiers',
    muscles_sec: ['Ischio-jambiers'],
    equipement: 'Barre + Banc',
    emoji: '🍑',
    difficulte: 2,
    description: 'Dos contre le banc, barre sur les hanches. Pousser les hanches vers le haut jusqu\'à corps horizontal.',
    conseils: [
      'Squeeze fort des fessiers en haut',
      'Menton rentré, regard vers le haut',
      'Pieds à plat à largeur des épaules'
    ]
  },

  // ══ GAINAGE / ABDOS ════════════════════════════════════
  planche: {
    nom: 'Planche',
    muscle: 'Core',
    muscles_sec: ['Épaules', 'Fessiers'],
    equipement: 'Tapis / Sol',
    emoji: '━',
    difficulte: 1,
    description: 'Corps en ligne droite, appui sur les avant-bras et les orteils.',
    conseils: [
      'Dos parfaitement plat',
      'Ne pas lever les fesses',
      'Respirer normalement',
      'Gainage actif de tout le corps'
    ]
  },

  crunch_machine: {
    nom: 'Crunch machine',
    muscle: 'Abdominaux',
    muscles_sec: [],
    equipement: 'Machine Abdos',
    emoji: '🤖',
    difficulte: 1,
    description: 'Flexion du tronc en expirant, retour contrôlé. Isolation des abdominaux.',
    conseils: [
      'Expirer en fléchissant',
      'Pas d\'élan',
      'Amplitude contrôlée'
    ]
  },

  releve_jambes: {
    nom: 'Relevé de jambes suspendu',
    muscle: 'Abdominaux Bas',
    muscles_sec: ['Hip Flexors'],
    equipement: 'Barre de traction',
    emoji: '⬆️',
    difficulte: 3,
    description: 'Suspendu à la barre, lever les jambes tendues ou fléchies en rétroversion du bassin.',
    conseils: [
      'Pas de balancement',
      'Contrôle total en descente',
      'Rétroversion du bassin pour les abdos'
    ]
  },

  russian_twist: {
    nom: 'Russian Twist',
    muscle: 'Obliques',
    muscles_sec: ['Abdominaux'],
    equipement: 'Haltère / Médecine ball',
    emoji: '🔄',
    difficulte: 2,
    description: 'Assis, jambes légèrement fléchies, tourner le tronc alternativement de chaque côté.',
    conseils: [
      'Talons au sol ou légèrement levés',
      'Rotation depuis le tronc, pas du cou',
      'Contrôle du mouvement'
    ]
  },

  // ══ CARDIO ══════════════════════════════════════════════
  rameur: {
    nom: 'Rameur',
    muscle: 'Full Body Cardio',
    muscles_sec: ['Dos', 'Jambes', 'Bras'],
    equipement: 'Rameur',
    emoji: '🚣',
    difficulte: 2,
    description: '60% jambes / 30% dos / 10% bras. Cadence : 24-28 coups/min.',
    conseils: [
      'Jambes d\'abord',
      'Incliner le dos ensuite',
      'Bras en dernier'
    ]
  },

  velo: {
    nom: 'Vélo stationnaire',
    muscle: 'Cardio / Jambes',
    muscles_sec: ['Quadriceps', 'Mollets'],
    equipement: 'Vélo',
    emoji: '🚴',
    difficulte: 1,
    description: 'Cardio low-impact idéal pour warm-up ou récupération active.',
    conseils: [
      'Selle à hauteur de hanche',
      'Résistance progressive',
      'Cadence régulière 80-90 rpm'
    ]
  }
};

// ════════════════════════════════════════════════════════════
// SÉANCES DE BASE
// ════════════════════════════════════════════════════════════
const SEANCES_BASE = {
  pec_tri: {
    id: 'pec_tri',
    nom: 'Pectoraux + Triceps',
    emoji: '💪',
    muscles: ['Pectoraux', 'Triceps'],
    duree_estimee: 65,
    exercices: [
      { ref:'bench_press',         series:4, reps:'8-10',  repos:90 },
      { ref:'incline_halteres',    series:4, reps:'10',    repos:90 },
      { ref:'chest_press_machine', series:3, reps:'12',    repos:75 },
      { ref:'ecarte_poulie',       series:3, reps:'12-15', repos:60 },
      { ref:'ext_triceps_poulie',  series:3, reps:'12',    repos:60 },
      { ref:'dips_triceps',        series:3, reps:'échec', repos:60 }
    ]
  },

  dos_bi: {
    id: 'dos_bi',
    nom: 'Dos + Biceps',
    emoji: '🔗',
    muscles: ['Dos', 'Biceps'],
    duree_estimee: 65,
    exercices: [
      { ref:'tractions',      series:4, reps:'max',   repos:90 },
      { ref:'rowing_barre',   series:4, reps:'8-10',  repos:90 },
      { ref:'lat_pulldown',   series:3, reps:'10-12', repos:75 },
      { ref:'rowing_machine', series:3, reps:'12',    repos:75 },
      { ref:'curl_halteres',  series:3, reps:'12',    repos:60 },
      { ref:'curl_marteau',   series:3, reps:'12',    repos:60 }
    ]
  },

  epaules_bras: {
    id: 'epaules_bras',
    nom: 'Épaules + Bras',
    emoji: '💪',
    muscles: ['Épaules', 'Biceps', 'Triceps'],
    duree_estimee: 65,
    exercices: [
      { ref:'dev_militaire',          series:4, reps:'8-10',  repos:90 },
      { ref:'elev_laterales',         series:4, reps:'12-15', repos:60 },
      { ref:'shoulder_press_machine', series:3, reps:'12',    repos:75 },
      { ref:'face_pull',              series:3, reps:'15',    repos:60 },
      { ref:'curl_barre',             series:3, reps:'10',    repos:60 },
      { ref:'barre_front',            series:3, reps:'10',    repos:60 }
    ]
  },

  jambes: {
    id: 'jambes',
    nom: 'Jambes + Fessiers',
    emoji: '🦵',
    muscles: ['Quadriceps', 'Ischio-jambiers', 'Fessiers', 'Mollets'],
    duree_estimee: 70,
    exercices: [
      { ref:'squat',          series:4, reps:'8-10',  repos:120 },
      { ref:'presse_cuisses', series:4, reps:'10-12', repos:90  },
      { ref:'fentes',         series:3, reps:'12/j',  repos:75  },
      { ref:'leg_curl',       series:3, reps:'12',    repos:75  },
      { ref:'leg_extension',  series:3, reps:'15',    repos:60  },
      { ref:'mollets',        series:4, reps:'15-20', repos:45  }
    ]
  },

  full_body: {
    id: 'full_body',
    nom: 'Full Body + Gainage',
    emoji: '🔄',
    muscles: ['Full Body', 'Core'],
    duree_estimee: 60,
    exercices: [
      { ref:'soulevé_terre',  series:4, reps:'6-8',    repos:120 },
      { ref:'rowing_machine', series:3, reps:'12',     repos:75  },
      { ref:'planche',        series:3, reps:'45-60s', repos:60  },
      { ref:'releve_jambes',  series:3, reps:'12-15',  repos:60  },
      { ref:'russian_twist',  series:3, reps:'20',     repos:45  },
      { ref:'crunch_machine', series:3, reps:'15',     repos:45  }
    ]
  }
};

// ════════════════════════════════════════════════════════════
// PLANNING HEBDOMADAIRE
// ════════════════════════════════════════════════════════════
const PLANNING_SEMAINE_DEFAUT = [
  { jour:0, label:'LUN', seanceId:'pec_tri'       },
  { jour:1, label:'MAR', seanceId:'dos_bi'        },
  { jour:2, label:'MER', seanceId:'epaules_bras'  },
  { jour:3, label:'JEU', seanceId:null            },
  { jour:4, label:'VEN', seanceId:'jambes'        },
  { jour:5, label:'SAM', seanceId:'full_body'     },
  { jour:6, label:'DIM', seanceId:null            }
];

let PLANNING_SEMAINE = (() => {
  try {
    const custom = Utils.storage.get('ft_planning_custom', null);
    return custom || [...PLANNING_SEMAINE_DEFAUT];
  } catch(e) {
    return [...PLANNING_SEMAINE_DEFAUT];
  }
})();

// ════════════════════════════════════════════════════════════
// WARM-UP
// ════════════════════════════════════════════════════════════
const WARMUP = {
  general: [
    { nom:'Vélo stationnaire',     duree:300, description:'5 min cadence modérée' },
    { nom:'Rotations épaules',     duree:30,  description:'10 reps chaque sens'   },
    { nom:'Rotations hanches',     duree:30,  description:'10 reps chaque sens'   },
    { nom:'Squats poids du corps', duree:60,  description:'15 reps lentes'        },
    { nom:'Pompes légères',        duree:60,  description:'10 reps sans effort'   }
  ],
  pec_tri: [
    { nom:'Vélo / Elliptique',     duree:300, description:'5 min'              },
    { nom:'Rotations bras',        duree:30,  description:'10 reps chaque sens' },
    { nom:'Pompes légères',        duree:60,  description:'15 reps faciles'     },
    { nom:'Bench barre vide',      duree:60,  description:'20 reps, technique'  }
  ],
  dos_bi: [
    { nom:'Rameur',                duree:300, description:'5 min léger'          },
    { nom:'Rotations épaules',     duree:30,  description:'10 reps'              },
    { nom:'Tractions assistées',   duree:60,  description:'5 reps faciles'       },
    { nom:'Rowing barre vide',     duree:60,  description:'15 reps, technique'   }
  ],
  epaules_bras: [
    { nom:'Vélo',                  duree:300, description:'5 min léger'          },
    { nom:'Circles bras',          duree:30,  description:'10 reps chaque sens'  },
    { nom:'Face pull léger',       duree:60,  description:'15 reps, focus posture' }
  ],
  jambes: [
    { nom:'Vélo stationnaire',     duree:300, description:'5 min'                },
    { nom:'Leg swing',             duree:30,  description:'10 reps chaque jambe' },
    { nom:'Squats goblet légers',  duree:60,  description:'10 reps'              },
    { nom:'Fentes sur place',      duree:60,  description:'8 reps chaque jambe'  }
  ],
  full_body: [
    { nom:'Rameur',                duree:300, description:'5 min cadence modérée' },
    { nom:'Hip hinge barre vide',  duree:60,  description:'10 reps, technique'    },
    { nom:'Squats poids du corps', duree:60,  description:'10 reps'               }
  ]
};

// ════════════════════════════════════════════════════════════
// ÉTIREMENTS POST-SÉANCE
// ════════════════════════════════════════════════════════════
const ETIREMENTS = {
  pec_tri: [
    { nom:'Étirement pectoraux au mur', duree:30, gif:'🧘' },
    { nom:'Étirement triceps',          duree:30, gif:'🧘' },
    { nom:'Étirement épaule croisée',   duree:30, gif:'🧘' }
  ],
  dos_bi: [
    { nom:'Child pose',                 duree:45, gif:'🧘' },
    { nom:'Étirement biceps au mur',    duree:30, gif:'🧘' },
    { nom:'Torsion assis',              duree:30, gif:'🧘' }
  ],
  epaules_bras: [
    { nom:'Étirement épaule croisée',   duree:30, gif:'🧘' },
    { nom:'Rotation externe étirée',    duree:30, gif:'🧘' },
    { nom:'Triceps au mur',             duree:30, gif:'🧘' }
  ],
  jambes: [
    { nom:'Étirement quadriceps debout',duree:30, gif:'🧘' },
    { nom:'Étirement ischio au sol',    duree:45, gif:'🧘' },
    { nom:'Pigeon pose fessiers',       duree:45, gif:'🧘' },
    { nom:'Étirement mollets au mur',   duree:30, gif:'🧘' }
  ],
  full_body: [
    { nom:'Étirement dos complet',      duree:45, gif:'🧘' },
    { nom:'Cat-Cow stretch',            duree:30, gif:'🧘' },
    { nom:'Étirement hip flexors',      duree:45, gif:'🧘' }
  ]
};

// ════════════════════════════════════════════════════════════
// SUPERSETS RECOMMANDÉS
// ════════════════════════════════════════════════════════════
const SUPERSETS_RECOMMANDES = {
  pec_tri: [
    {
      id: 'ss_bench_dips',
      nom: 'Superset Pec+Tri',
      exercices: [
        { ref:'bench_press',    series:3, reps:'8',  repos:0  },
        { ref:'dips_triceps',   series:3, reps:'12', repos:90 }
      ]
    }
  ],
  dos_bi: [
    {
      id: 'ss_pulldown_curl',
      nom: 'Superset Dos+Bi',
      exercices: [
        { ref:'lat_pulldown',  series:3, reps:'10', repos:0  },
        { ref:'curl_halteres', series:3, reps:'12', repos:90 }
      ]
    }
  ],
  epaules_bras: [
    {
      id: 'ss_lateral_facepull',
      nom: 'Superset Épaules',
      exercices: [
        { ref:'elev_laterales', series:3, reps:'12', repos:0  },
        { ref:'face_pull',      series:3, reps:'15', repos:75 }
      ]
    }
  ]
};

// ════════════════════════════════════════════════════════════
// PROGRAMME — SYSTÈME CYCLES INFINIS
// ════════════════════════════════════════════════════════════
const Programme = {

  // ─── DATE DÉBUT ───────────────────────────────────────────
  getDateDebut() {
    return Utils.storage.get('ft_date_debut')
      || Utils.aujourd_hui();
  },

  setDateDebut(date) {
    Utils.storage.set('ft_date_debut', date);
  },

  // ─── SEMAINE / CYCLE / PHASE ──────────────────────────────
  getSemaineActuelle() {
    try {
      const debut = this.getDateDebut();
      return Math.max(1, Utils.semainesDepuis(debut));
    } catch(e) { return 1; }
  },

  getCycleActuel() {
    return Math.floor(
      (this.getSemaineActuelle() - 1) / 16
    ) + 1;
  },

  getSemaineDansCycle() {
    return ((this.getSemaineActuelle() - 1) % 16) + 1;
  },

  getPhaseActuelle() {
    const s     = this.getSemaineDansCycle();
    const cycle = this.getCycleActuel();
    // Progressivité entre cycles (+5% par cycle max 97%)
    const mult  = 1 + (cycle - 1) * 0.05;

    if (s <= 4) return {
      nom:         'Reprise',
      numero:      1,
      description: 'Technique & Adaptation',
      intensite:   Math.min(0.65 * mult, 0.75),
      couleur:     '#8bf0bb',
      emoji:       '🌱'
    };
    if (s <= 8) return {
      nom:         'Construction',
      numero:      2,
      description: 'Volume & Hypertrophie',
      intensite:   Math.min(0.75 * mult, 0.85),
      couleur:     '#4b4bf9',
      emoji:       '🏗️'
    };
    if (s <= 12) return {
      nom:         'Intensité',
      numero:      3,
      description: 'Force & Records',
      intensite:   Math.min(0.85 * mult, 0.95),
      couleur:     '#bfa1ff',
      emoji:       '💥'
    };
    // Semaines 13-15 = Peak, Semaine 16 = Décharge
    if (s < 16) return {
      nom:         'Peak',
      numero:      4,
      description: 'Records & Performance max',
      intensite:   Math.min(0.95 * mult, 1.0),
      couleur:     '#f9ef77',
      emoji:       '🏆'
    };
    // Semaine de décharge automatique
    return {
      nom:         'Décharge',
      numero:      4,
      description: 'Récupération active',
      intensite:   0.55,
      couleur:     '#ff8d96',
      emoji:       '😴',
      decharge:    true
    };
  },

  // Vérifier si décharge recommandée
  isDecharge() {
    return this.getSemaineDansCycle() === 16
      || this.getPhaseActuelle().decharge === true;
  },

  // ─── SÉANCES ──────────────────────────────────────────────
  getSeanceduJour(dateStr = null) {
    try {
      const date      = dateStr || Utils.aujourd_hui();
      const indexJour = Utils.indexJourSemaine(date);
      const planning  = PLANNING_SEMAINE[indexJour];
      if (!planning?.seanceId) return null;

      const seance = this._getSeanceById(planning.seanceId);
      if (!seance) return null;

      return {
        ...Utils.clone(seance),
        dateStr,
        phase:   this.getPhaseActuelle(),
        semaine: this.getSemaineActuelle(),
        cycle:   this.getCycleActuel()
      };
    } catch(e) { return null; }
  },

  getProchaineSeance() {
    for (let i = 0; i < 7; i++) {
      const date   = Utils.ajouterJours(
        Utils.aujourd_hui(), i
      );
      const seance = this.getSeanceduJour(date);
      if (seance) {
        return { ...seance, dateStr:date, dansJours:i };
      }
    }
    return null;
  },

  getSeancesSemaine(offset = 0) {
    try {
      const debut = Utils.ajouterJours(
        Utils.debutSemaine(Utils.aujourd_hui()),
        offset * 7
      );
      return PLANNING_SEMAINE.map(p => {
        const date = Utils.ajouterJours(debut, p.jour);
        return {
          ...p,
          date,
          seance:        p.seanceId
            ? this._getSeanceById(p.seanceId)
            : null,
          estRepos:      !p.seanceId,
          estAujourdhui: date === Utils.aujourd_hui(),
          estPasse:      date < Utils.aujourd_hui()
        };
      });
    } catch(e) { return []; }
  },

  getSeanceComplete(seanceId) {
    try {
      const seance = this._getSeanceById(seanceId);
      if (!seance) return null;

      const clone = Utils.clone(seance);
      return {
        ...clone,
        exercicesDetails: (seance.exercices||[]).map(ex => ({
          ...ex,
          details: EXERCICES[ex.ref] || {}
        })),
        warmup:     WARMUP[seanceId]     || WARMUP.general,
        etirements: ETIREMENTS[seanceId] || [],
        supersets:  SUPERSETS_RECOMMANDES[seanceId] || []
      };
    } catch(e) { return null; }
  },

  getAllSeances() {
    try {
      const customs = this._getSeancesCustom();
      const base    = Object.values(SEANCES_BASE);
      const customList = Object.values(customs);
      const ids     = new Set(base.map(s => s.id));
      return [
        ...base,
        ...customList.filter(s => !ids.has(s.id))
      ];
    } catch(e) {
      return Object.values(SEANCES_BASE);
    }
  },

  getInfosProgramme() {
    try {
      const semaine     = this.getSemaineActuelle();
      const cycle       = this.getCycleActuel();
      const semaineC    = this.getSemaineDansCycle();
      const phase       = this.getPhaseActuelle();
      const progression = Math.round((semaineC / 16) * 100);
      return {
        semaine, cycle,
        semaineInCycle: semaineC,
        phase, progression,
        label:   `Semaine ${semaine} · ${phase.nom}`,
        decharge: this.isDecharge()
      };
    } catch(e) {
      return {
        semaine:1, cycle:1, semaineInCycle:1,
        phase:{ nom:'Reprise', emoji:'🌱', numero:1 },
        progression:0,
        label:'Semaine 1 · Reprise',
        decharge: false
      };
    }
  },

  // Recommandation charge basée sur phase
  getChargesRecommandees(exerciceRef) {
    try {
      const phase   = this.getPhaseActuelle();
      const pr      = window.Tracker?.getPR(exerciceRef);
      if (!pr?.rm1) return null;

      const charge = Math.round(
        pr.rm1 * phase.intensite / 2.5
      ) * 2.5;

      return {
        charge,
        pourcentage: Math.round(phase.intensite * 100),
        phase:       phase.nom,
        rm1Base:     pr.rm1
      };
    } catch(e) { return null; }
  },

  // Supersets recommandés pour une séance
  getSupersets(seanceId) {
    return SUPERSETS_RECOMMANDES[seanceId] || [];
  },

  // ─── PLANNING ─────────────────────────────────────────────
  getPlanningActuel() {
    return PLANNING_SEMAINE;
  },

  sauvegarderPlanning(planning) {
    Utils.storage.set('ft_planning_custom', planning);
    PLANNING_SEMAINE.splice(0, 7, ...planning);
    window.PLANNING_SEMAINE = PLANNING_SEMAINE;
  },

  resetPlanning() {
    Utils.storage.remove('ft_planning_custom');
    PLANNING_SEMAINE.splice(
      0, 7, ...PLANNING_SEMAINE_DEFAUT
    );
    window.PLANNING_SEMAINE = PLANNING_SEMAINE;
  },

  estPlanningCustom() {
    return Utils.storage.get(
      'ft_planning_custom', null
    ) !== null;
  },

  // ─── SÉANCES CUSTOM ───────────────────────────────────────
  getSeancesCustom() {
    return this._getSeancesCustom();
  },

  creerSeanceCustom(data) {
    const customs = this._getSeancesCustom();
    const id      = 'custom_seance_' +
      (data.nom || 'seance')
        .toLowerCase()
        .replace(/\s+/g,'_')
        .replace(/[^a-z0-9_]/g,'')
      + '_' + Date.now();

    customs[id] = {
      id,
      nom:           data.nom           || 'Ma séance',
      emoji:         data.emoji         || '💪',
      muscles:       data.muscles       || [],
      duree_estimee: data.duree_estimee || 60,
      exercices:     data.exercices     || [],
      custom:        true,
      dateCreation:  Utils.aujourd_hui()
    };

    this._saveSeancesCustom(customs);
    return id;
  },

  modifierSeanceCustom(id, data) {
    const customs = this._getSeancesCustom();
    if (!customs[id]) return false;

    customs[id] = {
      ...customs[id],
      nom:           data.nom           ?? customs[id].nom,
      emoji:         data.emoji         ?? customs[id].emoji,
      muscles:       data.muscles       ?? customs[id].muscles,
      duree_estimee: data.duree_estimee
                     ?? customs[id].duree_estimee,
      exercices:     data.exercices     ?? customs[id].exercices
    };

    this._saveSeancesCustom(customs);
    return true;
  },

  supprimerSeanceCustom(id) {
    const customs = this._getSeancesCustom();
    delete customs[id];
    this._saveSeancesCustom(customs);

    // Retirer du planning si présente
    const planning = this.getPlanningActuel().map(p =>
      p.seanceId === id ? { ...p, seanceId:null } : p
    );
    this.sauvegarderPlanning(planning);
  },

  dupliquerSeanceBase(seanceBaseId) {
    const base = SEANCES_BASE[seanceBaseId];
    if (!base) return null;
    return this.creerSeanceCustom({
      nom:           base.nom + ' (copie)',
      emoji:         base.emoji,
      muscles:       [...(base.muscles||[])],
      duree_estimee: base.duree_estimee,
      exercices:     (base.exercices||[]).map(e => ({...e}))
    });
  },

  // ─── HELPERS ──────────────────────────────────────────────
  _getSeanceById(id) {
    const customs = this._getSeancesCustom();
    return customs[id] || SEANCES_BASE[id] || null;
  },

  _getSeancesCustom() {
    return Utils.storage.get('ft_seances_custom', {});
  },

  _saveSeancesCustom(seances) {
    Utils.storage.set('ft_seances_custom', seances);
  },

  // ─── STATS PROGRAMME ──────────────────────────────────────
  getStatsProgramme() {
    try {
      const seances    = Object.values(SEANCES_BASE).length;
      const exercises  = Object.values(EXERCICES).length;
      const cycle      = this.getCycleActuel();
      const semaine    = this.getSemaineActuelle();
      const progression= Math.round(
        (this.getSemaineDansCycle() / 16) * 100
      );

      return {
        totalSeancesBase: seances,
        totalExercices:   exercises,
        cycleActuel:      cycle,
        semaineActuelle:  semaine,
        progression
      };
    } catch(e) {
      return {
        totalSeancesBase: 5,
        totalExercices:   Object.keys(EXERCICES).length,
        cycleActuel:      1,
        semaineActuelle:  1,
        progression:      0
      };
    }
  }
};

// ════════════════════════════════════════════════════════════
// EXPOSITION GLOBALE
// ════════════════════════════════════════════════════════════
window.EXERCICES               = EXERCICES;
window.SEANCES_BASE            = SEANCES_BASE;
window.PLANNING_SEMAINE        = PLANNING_SEMAINE;
window.PLANNING_SEMAINE_DEFAUT = PLANNING_SEMAINE_DEFAUT;
window.WARMUP                  = WARMUP;
window.ETIREMENTS              = ETIREMENTS;
window.SUPERSETS_RECOMMANDES   = SUPERSETS_RECOMMANDES;
window.Programme               = Programme;

console.log(
  `✅ Programme v3.0 chargé — ` +
  `${Object.keys(EXERCICES).length} exercices, ` +
  `${Object.keys(SEANCES_BASE).length} séances de base`
);
