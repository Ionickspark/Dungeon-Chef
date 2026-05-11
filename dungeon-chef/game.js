const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 512,
  parent: "game-container",
  backgroundColor: "#111827",
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

let currentScene;

let player;
let cursors;
let wasd;

let walls;
let ingredients;
let enemies;
let bosses;
let cookingStations;
let doors;
let enemyProjectiles;

let roomDecorations = [];
let blockedTiles = new Set();
let occupiedTiles = new Set();

let attackRangeGraphics;

let ingredientInventory = [];
let mealInventory = [];

let ingredientsText;
let mealsText;
let hintText;
let statsText;
let effectsText;
let skillsText;
let cookbookText;

let mainMenu;
let startRunButton;
let metaText;
let menuCookbookText;

let openSkilltreeButton;
let skilltreeMenu;
let closeSkilltreeMenuButton;
let skilltreeInfo;
let skilltreeGrid;

let runEndMenu;
let runEndTitle;
let runEndSummary;
let runResultText;
let backToMenuButton;

let cookingMenu;
let recipesList;
let closeCookingMenuButton;

let inventoryMenu;
let closeInventoryMenuButton;

let interactKey;
let escKey;
let attackKey;
let inventoryKey;

let contextualHintShown = false;
let cookingMenuOpen = false;
let inventoryMenuOpen = false;
let gameOver = false;
let runActive = false;
let startRunAfterRestart = false;
let transitioningRoom = false;

let roomX = 0;
let roomY = 0;
let roomDepth = 1;

let lastPlayerAttackTime = 0;

const tileSize = 32;
const mapWidth = 25;
const mapHeight = 16;

const basePlayerAttackRange = 64;
const basePlayerAttackCooldown = 520;

const basePlayerStats = {
  maxHp: 100,
  hp: 100,
  attack: 10,
  defense: 4,
  speed: 180,
  critChance: 5
};

let discoveredRecipes = loadCookbook();
let metaProgress = loadMetaProgress();
let activeEffects = [];
let playerStats;

const skills = {
  combat: {
    label: "Kampf",
    level: 1,
    xp: 0
  },
  gathering: {
    label: "Sammeln",
    level: 1,
    xp: 0
  },
  cooking: {
    label: "Kochen",
    level: 1,
    xp: 0
  }
};

let runStats = {
  roomsExplored: 0,
  ingredientsCollected: 0,
  enemiesDefeated: 0,
  bossesDefeated: 0,
  mealsCooked: 0,
  newRecipesDiscovered: 0,
  tokensEarned: 0
};

const ingredientDefinitions = {
  Pilz: { name: "Pilz", rarity: "common", texture: "ingredient-pilz", gatherXp: 8 },
  Kraut: { name: "Kraut", rarity: "uncommon", texture: "ingredient-kraut", gatherXp: 12 },
  Zwiebel: { name: "Zwiebel", rarity: "common", texture: "ingredient-zwiebel", gatherXp: 9 },
  Kartoffel: { name: "Kartoffel", rarity: "common", texture: "ingredient-kartoffel", gatherXp: 9 },
  Honig: { name: "Honig", rarity: "uncommon", texture: "ingredient-honig", gatherXp: 14 },
  Fisch: { name: "Fisch", rarity: "uncommon", texture: "ingredient-fisch", gatherXp: 14 },
  Milch: { name: "Milch", rarity: "uncommon", texture: "ingredient-milch", gatherXp: 14 },
  Feuerbeere: { name: "Feuerbeere", rarity: "rare", texture: "ingredient-feuerbeere", gatherXp: 18 },
  Fleisch: { name: "Fleisch", rarity: "rare", texture: "ingredient-fleisch", gatherXp: 20 },
  Kristallsalz: { name: "Kristallsalz", rarity: "rare", texture: "ingredient-kristallsalz", gatherXp: 22 },
  Goldapfel: { name: "Goldapfel", rarity: "epic", texture: "ingredient-goldapfel", gatherXp: 32 },
  Geisterpfeffer: { name: "Geisterpfeffer", rarity: "epic", texture: "ingredient-geisterpfeffer", gatherXp: 36 },
  Drachenchili: { name: "Drachenchili", rarity: "epic", texture: "ingredient-drachenchili", gatherXp: 45 },
  Schattenknoblauch: { name: "Schattenknoblauch", rarity: "epic", texture: "ingredient-schattenknoblauch", gatherXp: 42 },
  Bossfleisch: { name: "Bossfleisch", rarity: "legendary", texture: "ingredient-bossfleisch", gatherXp: 55 }
};

const enemyDefinitions = {
  Schleim: {
    name: "Schleim",
    texture: "enemy-schleim",
    maxHp: 24,
    attack: 7,
    defense: 1,
    speed: 55,
    aggroRange: 180,
    xpReward: 18,
    dropTable: ["Pilz", "Kraut", "Zwiebel"]
  },
  Ratte: {
    name: "Ratte",
    texture: "enemy-ratte",
    maxHp: 20,
    attack: 9,
    defense: 0,
    speed: 95,
    aggroRange: 200,
    xpReward: 17,
    dropTable: ["Pilz", "Zwiebel", "Kartoffel"]
  },
  Feuerkaefer: {
    name: "Feuerkäfer",
    texture: "enemy-feuerkaefer",
    maxHp: 34,
    attack: 12,
    defense: 2,
    speed: 70,
    aggroRange: 170,
    xpReward: 30,
    dropTable: ["Feuerbeere", "Kraut"]
  },
  Knochenkoch: {
    name: "Knochenkoch",
    texture: "enemy-knochenkoch",
    maxHp: 46,
    attack: 14,
    defense: 3,
    speed: 62,
    aggroRange: 190,
    xpReward: 40,
    dropTable: ["Fleisch", "Zwiebel", "Kartoffel"]
  },
  Gewuerzgeist: {
    name: "Gewürzgeist",
    texture: "enemy-gewuerzgeist",
    maxHp: 34,
    attack: 15,
    defense: 1,
    speed: 105,
    aggroRange: 230,
    xpReward: 36,
    dropTable: ["Feuerbeere", "Kristallsalz", "Geisterpfeffer"]
  },
  Bogenschuetze: {
    name: "Skelettschütze",
    texture: "enemy-bogenschuetze",
    maxHp: 32,
    attack: 12,
    defense: 1,
    speed: 76,
    aggroRange: 300,
    xpReward: 38,
    isRanged: true,
    projectileTexture: "projectile-arrow",
    projectileSpeed: 245,
    rangedCooldown: 1600,
    preferredRange: 210,
    dropTable: ["Fisch", "Kraut", "Kristallsalz"]
  },
  FeuerMagier: {
    name: "Feuermagier",
    texture: "enemy-feuermagier",
    maxHp: 38,
    attack: 16,
    defense: 1,
    speed: 64,
    aggroRange: 330,
    xpReward: 52,
    isRanged: true,
    projectileTexture: "projectile-fireball",
    projectileSpeed: 210,
    rangedCooldown: 1900,
    preferredRange: 240,
    dropTable: ["Feuerbeere", "Geisterpfeffer", "Honig"]
  },
  Giftkoch: {
    name: "Giftkoch",
    texture: "enemy-giftkoch",
    maxHp: 58,
    attack: 18,
    defense: 4,
    speed: 66,
    aggroRange: 210,
    xpReward: 60,
    dropTable: ["Schattenknoblauch", "Pilz", "Milch"]
  }
};

const bossDefinitions = {
  ChiliDrache: {
    name: "Chili-Drache",
    texture: "boss-chilidrache",
    maxHp: 210,
    attack: 23,
    defense: 6,
    speed: 78,
    aggroRange: 280,
    xpReward: 145,
    specialDrop: "Drachenchili",
    dropTable: ["Drachenchili", "Feuerbeere", "Bossfleisch"]
  },
  SchattenMetzger: {
    name: "Schatten-Metzger",
    texture: "boss-schattenmetzger",
    maxHp: 250,
    attack: 26,
    defense: 8,
    speed: 62,
    aggroRange: 270,
    xpReward: 170,
    specialDrop: "Schattenknoblauch",
    dropTable: ["Schattenknoblauch", "Bossfleisch", "Fleisch"]
  },
  GoldenerEber: {
    name: "Goldener Eber",
    texture: "boss-goldener-eber",
    maxHp: 300,
    attack: 29,
    defense: 9,
    speed: 72,
    aggroRange: 270,
    xpReward: 195,
    specialDrop: "Bossfleisch",
    dropTable: ["Bossfleisch", "Goldapfel", "Fleisch"]
  },
  PfefferHexe: {
    name: "Pfeffer-Hexe",
    texture: "boss-pfefferhexe",
    maxHp: 230,
    attack: 24,
    defense: 5,
    speed: 82,
    aggroRange: 340,
    xpReward: 190,
    isRanged: true,
    projectileTexture: "projectile-fireball",
    projectileSpeed: 250,
    rangedCooldown: 1200,
    preferredRange: 250,
    specialDrop: "Geisterpfeffer",
    dropTable: ["Geisterpfeffer", "Schattenknoblauch", "Goldapfel"]
  }
};

const recipes = [
  {
    name: "Zwiebelsuppe",
    rarity: "common",
    requiredIngredients: { Zwiebel: 3, Kraut: 1 },
    hiddenDescription: "Eine einfache Suppe. Der genaue Effekt ist unbekannt.",
    description: "Günstige Heilung für frühe Räume.",
    effectDescription: "+28 Leben",
    cookingXp: 20,
    mealEffect: { heal: 28, buffs: [] }
  },
  {
    name: "Pilzpfanne",
    rarity: "common",
    requiredIngredients: { Pilz: 5, Zwiebel: 2 },
    hiddenDescription: "Viele Pilze in einer Pfanne. Der genaue Effekt ist unbekannt.",
    description: "Solide Heilung und etwas Verteidigung.",
    effectDescription: "+35 Leben, +2 Verteidigung für 35 Sekunden",
    cookingXp: 28,
    mealEffect: {
      heal: 35,
      buffs: [{ name: "Pilzpanzer", stat: "defense", amount: 2, duration: 35000 }]
    }
  },
  {
    name: "Kartoffelbrei",
    rarity: "common",
    requiredIngredients: { Kartoffel: 6, Milch: 1 },
    hiddenDescription: "Ein sättigendes Gericht. Der genaue Effekt ist unbekannt.",
    description: "Heilt gut und gibt kurz Verteidigung.",
    effectDescription: "+45 Leben, +3 Verteidigung für 40 Sekunden",
    cookingXp: 34,
    mealEffect: {
      heal: 45,
      buffs: [{ name: "Sättigung", stat: "defense", amount: 3, duration: 40000 }]
    }
  },
  {
    name: "Kräutersuppe",
    rarity: "uncommon",
    requiredIngredients: { Kraut: 4, Pilz: 2 },
    hiddenDescription: "Eine grüne Suppe. Der genaue Effekt ist unbekannt.",
    description: "Starke Heilung aus gewöhnlichen Zutaten.",
    effectDescription: "+55 Leben",
    cookingXp: 42,
    mealEffect: { heal: 55, buffs: [] }
  },
  {
    name: "Honigmilch",
    rarity: "uncommon",
    requiredIngredients: { Honig: 2, Milch: 2 },
    hiddenDescription: "Süß und beruhigend. Der genaue Effekt ist unbekannt.",
    description: "Heilt und erhöht Tempo.",
    effectDescription: "+40 Leben, +35 Tempo für 45 Sekunden",
    cookingXp: 46,
    mealEffect: {
      heal: 40,
      buffs: [{ name: "Honigschub", stat: "speed", amount: 35, duration: 45000 }]
    }
  },
  {
    name: "Fischragout",
    rarity: "uncommon",
    requiredIngredients: { Fisch: 3, Kraut: 2, Zwiebel: 2 },
    hiddenDescription: "Ein nahrhafter Topf. Der genaue Effekt ist unbekannt.",
    description: "Heilt und erhöht Verteidigung.",
    effectDescription: "+70 Leben, +4 Verteidigung für 55 Sekunden",
    cookingXp: 58,
    mealEffect: {
      heal: 70,
      buffs: [{ name: "Fischhaut", stat: "defense", amount: 4, duration: 55000 }]
    }
  },
  {
    name: "Feuerkompott",
    rarity: "rare",
    requiredIngredients: { Feuerbeere: 3, Honig: 2, Kraut: 2 },
    hiddenDescription: "Ein scharf-süßes Gericht. Der genaue Effekt ist unbekannt.",
    description: "Erhöht Angriff deutlich.",
    effectDescription: "+8 Angriff für 65 Sekunden",
    cookingXp: 72,
    mealEffect: {
      heal: 10,
      buffs: [{ name: "Feuriger Angriff", stat: "attack", amount: 8, duration: 65000 }]
    }
  },
  {
    name: "Jägersteak",
    rarity: "rare",
    requiredIngredients: { Fleisch: 4, Pilz: 3, Zwiebel: 3 },
    hiddenDescription: "Ein deftiges Steak. Der genaue Effekt ist unbekannt.",
    description: "Erhöht Angriff und Crit-Chance.",
    effectDescription: "+7 Angriff und +10% Crit-Chance für 70 Sekunden",
    cookingXp: 86,
    mealEffect: {
      heal: 30,
      buffs: [
        { name: "Jägerkraft", stat: "attack", amount: 7, duration: 70000 },
        { name: "Scharfer Fokus", stat: "critChance", amount: 10, duration: 70000 }
      ]
    }
  },
  {
    name: "Kristallfisch",
    rarity: "rare",
    requiredIngredients: { Fisch: 4, Kristallsalz: 3, Milch: 1 },
    hiddenDescription: "Ein glänzendes Fischgericht. Der genaue Effekt ist unbekannt.",
    description: "Starke Verteidigung und Heilung.",
    effectDescription: "+80 Leben, +7 Verteidigung für 70 Sekunden",
    cookingXp: 95,
    mealEffect: {
      heal: 80,
      buffs: [{ name: "Kristallhaut", stat: "defense", amount: 7, duration: 70000 }]
    }
  },
  {
    name: "Geistercurry",
    rarity: "epic",
    requiredIngredients: { Geisterpfeffer: 2, Feuerbeere: 4, Kartoffel: 5 },
    hiddenDescription: "Ein gefährlich scharfes Curry. Der genaue Effekt ist unbekannt.",
    description: "Sehr starker Tempo- und Crit-Buff.",
    effectDescription: "+60 Tempo und +18% Crit-Chance für 75 Sekunden",
    cookingXp: 125,
    mealEffect: {
      heal: 35,
      buffs: [
        { name: "Geisterlauf", stat: "speed", amount: 60, duration: 75000 },
        { name: "Geisterblick", stat: "critChance", amount: 18, duration: 75000 }
      ]
    }
  },
  {
    name: "Drachen-Chili",
    rarity: "epic",
    requiredIngredients: { Drachenchili: 2, Feuerbeere: 5, Fleisch: 3 },
    hiddenDescription: "Ein Gericht aus Boss-Zutaten. Der genaue Effekt ist unbekannt.",
    description: "Extremer Angriff für Bosskämpfe.",
    effectDescription: "+16 Angriff für 80 Sekunden",
    cookingXp: 145,
    mealEffect: {
      heal: 25,
      buffs: [{ name: "Drachenzorn", stat: "attack", amount: 16, duration: 80000 }]
    }
  },
  {
    name: "Schatten-Eintopf",
    rarity: "epic",
    requiredIngredients: { Schattenknoblauch: 2, Pilz: 6, Fisch: 3 },
    hiddenDescription: "Ein dunkler Boss-Eintopf. Der genaue Effekt ist unbekannt.",
    description: "Tempo, Crit und Heilung.",
    effectDescription: "+90 Leben, +55 Tempo, +16% Crit-Chance für 85 Sekunden",
    cookingXp: 150,
    mealEffect: {
      heal: 90,
      buffs: [
        { name: "Schattenlauf", stat: "speed", amount: 55, duration: 85000 },
        { name: "Schattenblick", stat: "critChance", amount: 16, duration: 85000 }
      ]
    }
  },
  {
    name: "Boss-Burger",
    rarity: "legendary",
    requiredIngredients: { Bossfleisch: 3, Zwiebel: 6, Goldapfel: 1 },
    hiddenDescription: "Ein legendärer Burger. Der genaue Effekt ist unbekannt.",
    description: "Sehr starke Heilung und Kampfwerte.",
    effectDescription: "+140 Leben, +13 Angriff, +10 Verteidigung für 100 Sekunden",
    cookingXp: 210,
    mealEffect: {
      heal: 140,
      buffs: [
        { name: "Bosskraft", stat: "attack", amount: 13, duration: 100000 },
        { name: "Bossrüstung", stat: "defense", amount: 10, duration: 100000 }
      ]
    }
  },
  {
    name: "Höllenbankett",
    rarity: "legendary",
    requiredIngredients: { Bossfleisch: 4, Drachenchili: 3, Schattenknoblauch: 3, Goldapfel: 2 },
    hiddenDescription: "Ein fast unmögliches Bankett. Der genaue Effekt ist unbekannt.",
    description: "Für sehr späte Räume.",
    effectDescription: "+200 Leben, +22 Angriff, +15 Verteidigung, +25% Crit-Chance für 140 Sekunden",
    cookingXp: 320,
    mealEffect: {
      heal: 200,
      buffs: [
        { name: "Höllenstärke", stat: "attack", amount: 22, duration: 140000 },
        { name: "Höllenhaut", stat: "defense", amount: 15, duration: 140000 },
        { name: "Höllenfokus", stat: "critChance", amount: 25, duration: 140000 }
      ]
    }
  }
];

const skilltreeNodes = buildSkilltreeNodes();

function buildSkilltreeNodes() {
  const nodes = [];

  const coreNodes = [
    {
      key: "start_survival",
      name: "Kochschürze I",
      type: "Start",
      cost: 80,
      description: "+30 maximales Startleben.",
      requires: [],
      effect: { maxHp: 30 }
    },
    {
      key: "start_attack",
      name: "Küchenmesser I",
      type: "Start",
      cost: 90,
      description: "+5 Start-Angriff.",
      requires: [],
      effect: { attack: 5 }
    },
    {
      key: "start_cooking",
      name: "Grundkochkunst",
      type: "Start",
      cost: 100,
      description: "+15% Wirkung von Gerichten.",
      requires: [],
      effect: { cookingMultiplier: 0.15 }
    },
    {
      key: "start_gathering",
      name: "Vorratsblick",
      type: "Start",
      cost: 90,
      description: "+10% Chance auf doppelte Zutaten.",
      requires: [],
      effect: { gatheringChance: 10 }
    }
  ];

  nodes.push(...coreNodes);

  addPath(nodes, {
    prefix: "hp",
    pathName: "Überleben",
    startRequires: ["start_survival"],
    names: [
      "Dickere Schürze",
      "Gusseiserner Magen",
      "Suppenreserven",
      "Notfallration",
      "Zäher Koch",
      "Küchenpanzer",
      "Meister der Ausdauer",
      "Unbeugsamer Gourmet",
      "Herz des Küchenchefs",
      "Unsterblicher Appetit"
    ],
    baseCost: 160,
    costStep: 95,
    effectName: "maxHp",
    effectBase: 25,
    effectStep: 12,
    description: function(value) {
      return "+" + value + " maximales Startleben.";
    }
  });

  addPath(nodes, {
    prefix: "attack",
    pathName: "Angriff",
    startRequires: ["start_attack"],
    names: [
      "Schärferes Messer",
      "Doppelschnitt",
      "Klingenroutine",
      "Hacktechnik",
      "Filetiermeister",
      "Kritischer Schnitt",
      "Blitzklinge",
      "Zorn des Kochs",
      "Klingenwirbel",
      "Henkerbeil"
    ],
    baseCost: 180,
    costStep: 110,
    effectName: "attack",
    effectBase: 4,
    effectStep: 3,
    description: function(value) {
      return "+" + value + " Start-Angriff.";
    }
  });

  addPath(nodes, {
    prefix: "defense",
    pathName: "Verteidigung",
    startRequires: ["start_survival"],
    names: [
      "Topfdeckel-Parade",
      "Robuste Schuhe",
      "Dicker Kochmantel",
      "Stahlpfanne",
      "Küchenschild",
      "Suppenkessel-Rüstung",
      "Bratpfannenblock",
      "Panzerkoch",
      "Eiserner Vorrat",
      "Festungskoch"
    ],
    baseCost: 170,
    costStep: 105,
    effectName: "defense",
    effectBase: 2,
    effectStep: 2,
    description: function(value) {
      return "+" + value + " Start-Verteidigung.";
    }
  });

  addPath(nodes, {
    prefix: "speed",
    pathName: "Bewegung",
    startRequires: ["start_survival"],
    names: [
      "Leichte Schuhe",
      "Küchensprint",
      "Rutschfester Lauf",
      "Schneller Gang",
      "Pfannenflucht",
      "Saucenlauf",
      "Blitzschritt",
      "Fliegender Koch",
      "Unfassbarer Sprint",
      "Windläufer"
    ],
    baseCost: 150,
    costStep: 100,
    effectName: "speed",
    effectBase: 12,
    effectStep: 7,
    description: function(value) {
      return "+" + value + " Start-Tempo.";
    }
  });

  addPath(nodes, {
    prefix: "crit",
    pathName: "Kritische Treffer",
    startRequires: ["start_attack"],
    names: [
      "Genauer Schnitt",
      "Schwachstelle erkennen",
      "Präzise Klinge",
      "Kritische Würzung",
      "Fokus des Kochs",
      "Messerspitzengefühl",
      "Tödliche Technik",
      "Herzstich",
      "Perfekte Klinge",
      "Meisterkrit"
    ],
    baseCost: 190,
    costStep: 125,
    effectName: "critChance",
    effectBase: 3,
    effectStep: 2,
    description: function(value) {
      return "+" + value + "% Crit-Chance.";
    }
  });

  addPath(nodes, {
    prefix: "range",
    pathName: "Reichweite",
    startRequires: ["start_attack"],
    names: [
      "Längeres Messer",
      "Weiter Hieb",
      "Ausholender Schnitt",
      "Pfannenreichweite",
      "Klingenbogen",
      "Sicherer Abstand",
      "Schneidende Aura",
      "Weiter Klingenradius",
      "Raumgreifender Schlag",
      "Küchenhalbmond"
    ],
    baseCost: 170,
    costStep: 110,
    effectName: "attackRange",
    effectBase: 5,
    effectStep: 3,
    description: function(value) {
      return "+" + value + " Angriffsreichweite.";
    }
  });

  addPath(nodes, {
    prefix: "cooldown",
    pathName: "Angriffstempo",
    startRequires: ["start_attack"],
    names: [
      "Schnelle Hände",
      "Flotter Schnitt",
      "Küchenrhythmus",
      "Doppelte Vorbereitung",
      "Reaktionskoch",
      "Blitzpfanne",
      "Schneidrausch",
      "Turbohieb",
      "Sekundenklinge",
      "Unaufhaltsame Hand"
    ],
    baseCost: 210,
    costStep: 135,
    effectName: "cooldownReduction",
    effectBase: 35,
    effectStep: 18,
    description: function(value) {
      return "-" + value + " ms Angriffscooldown.";
    }
  });

  addPath(nodes, {
    prefix: "cook",
    pathName: "Kochkunst",
    startRequires: ["start_cooking"],
    names: [
      "Bessere Würzung",
      "Saucenverständnis",
      "Schonendes Garen",
      "Kräutermeister",
      "Hitzegefühl",
      "Rezeptintuition",
      "Feinschmecker",
      "Aromakontrolle",
      "Perfektes Timing",
      "Legendärer Geschmack"
    ],
    baseCost: 180,
    costStep: 120,
    effectName: "cookingMultiplier",
    effectBase: 0.08,
    effectStep: 0.04,
    description: function(value) {
      return "+" + Math.round(value * 100) + "% Wirkung von Gerichten.";
    }
  });

  addPath(nodes, {
    prefix: "gather",
    pathName: "Sammeln",
    startRequires: ["start_gathering"],
    names: [
      "Scharfer Blick",
      "Vorratsinstinkt",
      "Zutatenspürnase",
      "Doppelte Ernte",
      "Kräutersucher",
      "Pilzkenner",
      "Flinke Finger",
      "Reiche Beute",
      "Schatzsammler",
      "König der Vorräte"
    ],
    baseCost: 160,
    costStep: 115,
    effectName: "gatheringChance",
    effectBase: 6,
    effectStep: 4,
    description: function(value) {
      return "+" + value + "% Chance auf doppelte Zutaten.";
    }
  });

  addPath(nodes, {
    prefix: "kitchen",
    pathName: "Kochstellen",
    startRequires: ["start_cooking"],
    names: [
      "Bessere Feldküche",
      "Mehr Kochstellen",
      "Mobile Pfanne",
      "Reisekessel",
      "Dungeon-Ofen",
      "Kochstationen-Netz",
      "Vorratslager",
      "Schnellküche",
      "Meisterküche",
      "Küchenimperium"
    ],
    baseCost: 220,
    costStep: 145,
    effectName: "extraCookingStations",
    effectBase: 1,
    effectStep: 0,
    description: function(value) {
      return "+" + value + " mögliche zusätzliche Kochstelle pro Raum.";
    }
  });

  addPath(nodes, {
    prefix: "boss",
    pathName: "Bossjagd",
    startRequires: ["start_attack", "start_cooking"],
    names: [
      "Boss-Zerleger I",
      "Boss-Zerleger II",
      "Seltene Schnitte",
      "Bossbeute",
      "Präzises Zerlegen",
      "Legendäre Ausbeute",
      "Drachenschneider",
      "Metzgermeister",
      "Bossküche",
      "Trophäenkoch"
    ],
    baseCost: 260,
    costStep: 165,
    effectName: "bossExtraDrops",
    effectBase: 1,
    effectStep: 1,
    description: function(value) {
      return "+" + value + " zusätzliche mögliche Boss-Zutat.";
    }
  });

  addPath(nodes, {
    prefix: "tokens",
    pathName: "Küchenmarken",
    startRequires: ["start_gathering"],
    names: [
      "Bessere Abrechnung",
      "Küchenbuchhaltung",
      "Markenjäger",
      "Run-Bonus",
      "Effiziente Auswertung",
      "Trophäenwert",
      "Gourmet-Ruf",
      "Dungeon-Vertrag",
      "Küchenmonopol",
      "Markenmaschine"
    ],
    baseCost: 250,
    costStep: 170,
    effectName: "tokenMultiplier",
    effectBase: 0.05,
    effectStep: 0.04,
    description: function(value) {
      return "+" + Math.round(value * 100) + "% Küchenmarken nach einem Run.";
    }
  });

  addPath(nodes, {
    prefix: "special",
    pathName: "Spezialtalente",
    startRequires: ["start_survival", "start_attack"],
    names: [
      "Letzter Gang",
      "Zweite Portion",
      "Notfallbrühe",
      "Adrenalin-Koch",
      "Wut bei Niedrigleben",
      "Kritische Rettung",
      "Überlebensinstinkt",
      "Boss-Trotz",
      "Kochwille",
      "Unbeugsamer Meister"
    ],
    baseCost: 300,
    costStep: 190,
    effectName: "specialPower",
    effectBase: 1,
    effectStep: 1,
    description: function(value) {
      return "Schaltet einen starken Überlebensbonus der Stufe " + value + " frei.";
    }
  });

  nodes.push(
    {
      key: "legend_masterchef_1",
      name: "Meisterkoch I",
      type: "Legendär",
      cost: 1800,
      description: "+100 Leben, +15 Angriff, +15% Kochwirkung.",
      requires: ["hp_10", "attack_10", "cook_10"],
      effect: { maxHp: 100, attack: 15, cookingMultiplier: 0.15 }
    },
    {
      key: "legend_masterchef_2",
      name: "Meisterkoch II",
      type: "Legendär",
      cost: 2600,
      description: "+150 Leben, +20 Angriff, +10 Verteidigung.",
      requires: ["legend_masterchef_1", "defense_10", "boss_8"],
      effect: { maxHp: 150, attack: 20, defense: 10 }
    },
    {
      key: "legend_masterchef_3",
      name: "Meisterkoch III",
      type: "Legendär",
      cost: 3600,
      description: "+250 Leben, +35 Angriff, +25% Kochwirkung, +10% Crit-Chance.",
      requires: ["legend_masterchef_2", "crit_10", "tokens_10"],
      effect: { maxHp: 250, attack: 35, cookingMultiplier: 0.25, critChance: 10 }
    }
  );

  return nodes;
}

function addPath(nodes, config) {
  for (let i = 1; i <= 10; i++) {
    const previousKey = i === 1 ? null : config.prefix + "_" + (i - 1);
    const key = config.prefix + "_" + i;
    const rawValue = config.effectBase + config.effectStep * (i - 1);
    const value = Number.isInteger(rawValue) ? rawValue : Number(rawValue.toFixed(3));

    nodes.push({
      key: key,
      name: config.names[i - 1],
      type: config.pathName,
      cost: config.baseCost + config.costStep * (i - 1) + Math.floor(i * i * 25),
      description: config.description(value),
      requires: i === 1 ? config.startRequires : [previousKey],
      effect: {
        [config.effectName]: value
      }
    });
  }
}

function getTotalSkillEffect(effectName) {
  let total = 0;

  skilltreeNodes.forEach(function(node) {
    if (!hasSkill(node.key)) {
      return;
    }

    if (!node.effect) {
      return;
    }

    if (node.effect[effectName] === undefined) {
      return;
    }

    total += node.effect[effectName];
  });

  return total;
}

function preload() {}

function create() {
  currentScene = this;

  createTextures(this);
  createControls(this);
  createUI();
  createRoomGroups(this);
  createPlayer(this);
  createAttackRangeIndicator(this);
  setupPhysics(this);

  resetRunState();
  generateNewRoom("start");

  updateStatsUI();
  updateSkillsUI();
  updateEffectsUI();
  updateCookbookUI();
  updateMainMenuUI();

  if (startRunAfterRestart) {
    startRunAfterRestart = false;
    startRun();
  } else {
    showMainMenu();
  }
}

function update() {
  if (!runActive || gameOver) {
    if (player && player.body) {
      player.body.setVelocity(0);
    }

    updateAttackRangeIndicator();
    return;
  }

  contextualHintShown = false;

  updateActiveEffects();
  updateAttackRangeIndicator();
  cleanupProjectiles();
  updateStatsUI();

  if (Phaser.Input.Keyboard.JustDown(inventoryKey) && !cookingMenuOpen) {
    toggleInventoryMenu();
  }

  if (cookingMenuOpen || inventoryMenuOpen) {
    player.body.setVelocity(0);

    if (Phaser.Input.Keyboard.JustDown(escKey)) {
      if (cookingMenuOpen) {
        closeCookingMenu();
      }

      if (inventoryMenuOpen) {
        closeInventoryMenu();
      }
    }

    return;
  }

  movePlayer();
  updateEnemyGroup(enemies);
  updateEnemyGroup(bosses);
  handlePlayerAttack();

  if (!contextualHintShown) {
    hintText.textContent = "Räume: " + roomDepth + " | I = Inventar | Leertaste = Angriff | Türen führen weiter.";
  }
}

function createRoomGroups(scene) {
  walls = scene.physics.add.staticGroup();
  ingredients = scene.physics.add.group();
  enemies = scene.physics.add.group();
  bosses = scene.physics.add.group();
  cookingStations = scene.physics.add.staticGroup();
  doors = scene.physics.add.staticGroup();
  enemyProjectiles = scene.physics.add.group();
}

function setupPhysics(scene) {
  scene.physics.add.collider(player, walls);
  scene.physics.add.collider(enemies, walls);
  scene.physics.add.collider(bosses, walls);
  scene.physics.add.collider(enemyProjectiles, walls, destroyProjectile, null, scene);

  scene.physics.add.overlap(player, ingredients, autoPickupIngredient, null, scene);
  scene.physics.add.overlap(player, cookingStations, handleCookingStationOverlap, null, scene);
  scene.physics.add.overlap(player, enemies, handleEnemyContact, null, scene);
  scene.physics.add.overlap(player, bosses, handleEnemyContact, null, scene);
  scene.physics.add.overlap(player, enemyProjectiles, handleProjectileHit, null, scene);
  scene.physics.add.overlap(player, doors, handleDoorOverlap, null, scene);
}

function resetRunState() {
  ingredientInventory = [];
  mealInventory = [];
  activeEffects = [];

  skills.combat.level = 1;
  skills.combat.xp = 0;
  skills.gathering.level = 1;
  skills.gathering.xp = 0;
  skills.cooking.level = 1;
  skills.cooking.xp = 0;

  playerStats = createStartingPlayerStats();
  playerStats.lastStandUsed = false;

  roomX = 0;
  roomY = 0;
  roomDepth = 1;
  lastPlayerAttackTime = 0;

  runStats = {
    roomsExplored: 1,
    ingredientsCollected: 0,
    enemiesDefeated: 0,
    bossesDefeated: 0,
    mealsCooked: 0,
    newRecipesDiscovered: 0,
    tokensEarned: 0
  };

  contextualHintShown = false;
  cookingMenuOpen = false;
  inventoryMenuOpen = false;
  gameOver = false;
  runActive = false;
  transitioningRoom = false;

  if (player) {
    player.clearTint();
    player.setAlpha(1);
    player.setScale(1);
    player.setTexture("player-chef");
  }
}

function createStartingPlayerStats() {
  const oldMaxHpBonus = metaProgress.upgrades.maxHp * 10;
  const oldAttackBonus = metaProgress.upgrades.attack * 2;

  const skillHpBonus = getTotalSkillEffect("maxHp");
  const skillAttackBonus = getTotalSkillEffect("attack");
  const skillDefenseBonus = getTotalSkillEffect("defense");
  const skillSpeedBonus = getTotalSkillEffect("speed");
  const skillCritBonus = getTotalSkillEffect("critChance");

  return {
    maxHp: basePlayerStats.maxHp + oldMaxHpBonus + skillHpBonus,
    hp: basePlayerStats.maxHp + oldMaxHpBonus + skillHpBonus,
    attack: basePlayerStats.attack + oldAttackBonus + skillAttackBonus,
    defense: basePlayerStats.defense + skillDefenseBonus,
    speed: basePlayerStats.speed + skillSpeedBonus,
    critChance: basePlayerStats.critChance + skillCritBonus
  };
}

function startRun() {
  resetRunState();
  generateNewRoom("start");

  runActive = true;
  gameOver = false;

  mainMenu.classList.add("hidden");
  runEndMenu.classList.add("hidden");
  skilltreeMenu.classList.add("hidden");
  cookingMenu.classList.add("hidden");
  inventoryMenu.classList.add("hidden");

  hintText.textContent = "Run gestartet. Die ersten Räume sind leichter, danach skalieren die Gegner stark.";
  updateInventoryUI();
  updateStatsUI();
  updateSkillsUI();
  updateEffectsUI();
}

function restartSceneForNewRun() {
  startRunAfterRestart = true;
  currentScene.scene.restart();
}

function showMainMenu() {
  runActive = false;
  gameOver = true;

  mainMenu.classList.remove("hidden");
  runEndMenu.classList.add("hidden");
  skilltreeMenu.classList.add("hidden");
  cookingMenu.classList.add("hidden");
  inventoryMenu.classList.add("hidden");

  updateMainMenuUI();
}

function finishRun() {
  if (!runActive) {
    return;
  }

  runActive = false;
  gameOver = true;

  player.body.setVelocity(0);

  const tokens = calculateRunTokens();
  runStats.tokensEarned = tokens;
  metaProgress.tokens += tokens;
  saveMetaProgress();

  runEndTitle.textContent = "Run beendet";
  runEndSummary.textContent = "Du bist gestorben. Küchenmarken und Kochbuch bleiben dauerhaft erhalten.";

  runResultText.innerHTML = `
    <div class="meta-row">
      <span class="meta-name">Erkundete Räume</span>
      <span class="meta-value">${runStats.roomsExplored}</span>
    </div>
    <div class="meta-row">
      <span class="meta-name">Gesammelte Zutaten</span>
      <span class="meta-value">${runStats.ingredientsCollected}</span>
    </div>
    <div class="meta-row">
      <span class="meta-name">Besiegte Gegner</span>
      <span class="meta-value">${runStats.enemiesDefeated}</span>
    </div>
    <div class="meta-row">
      <span class="meta-name">Besiegte Bosse</span>
      <span class="meta-value">${runStats.bossesDefeated}</span>
    </div>
    <div class="meta-row">
      <span class="meta-name">Gekochte Gerichte</span>
      <span class="meta-value">${runStats.mealsCooked}</span>
    </div>
    <div class="meta-row">
      <span class="meta-name">Neue Kochbuch-Einträge</span>
      <span class="meta-value">${runStats.newRecipesDiscovered}</span>
    </div>
    <div class="meta-row">
      <span class="meta-name">Verdiente Küchenmarken</span>
      <span class="meta-value">${tokens}</span>
    </div>
  `;

  runEndMenu.classList.remove("hidden");
  updateMainMenuUI();
}

function calculateRunTokens() {
  let tokens = 0;

  tokens += Math.floor(runStats.roomsExplored / 2);
  tokens += Math.floor(runStats.ingredientsCollected / 8);
  tokens += Math.floor(runStats.enemiesDefeated / 2);
  tokens += runStats.bossesDefeated * 6;
  tokens += runStats.mealsCooked;
  tokens += runStats.newRecipesDiscovered * 2;

  const multiplier = 1 + getTotalSkillEffect("tokenMultiplier");
  tokens = Math.round(tokens * multiplier);

  return Math.max(1, tokens);
}

function generateNewRoom(entryDirection) {
  clearRoom();

  createRoomFloorAndWalls();
  createDoors();
  createLooseIngredients();
  createCookingStations();
  createRoomEnemies();
  createRoomBosses();

  placePlayerAtEntry(entryDirection);

  updateInventoryUI();
  updateStatsUI();
  updateSkillsUI();
}

function clearRoom() {
  roomDecorations.forEach(function(object) {
    if (object && object.destroy) {
      object.destroy();
    }
  });

  roomDecorations = [];
  blockedTiles = new Set();
  occupiedTiles = new Set();

  walls.clear(true, true);
  ingredients.clear(true, true);

  enemies.children.each(destroyEnemyVisuals);
  bosses.children.each(destroyEnemyVisuals);

  enemies.clear(true, true);
  bosses.clear(true, true);
  cookingStations.clear(true, true);
  doors.clear(true, true);
  enemyProjectiles.clear(true, true);
}

function destroyEnemyVisuals(enemy) {
  if (enemy.hpBar) {
    enemy.hpBar.destroy();
  }

  if (enemy.hpBarBackground) {
    enemy.hpBarBackground.destroy();
  }
}

function createRoomFloorAndWalls() {
  const floorColor = getRoomFloorColor();

  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      const isBorder = x === 0 || x === mapWidth - 1 || y === 0 || y === mapHeight - 1;
      const isDoorGap = isDoorGapTile(x, y);

      if (isBorder && !isDoorGap) {
        createWallBlock(x, y, 0x4a3428);
      } else {
        const floor = currentScene.add.rectangle(
          x * tileSize + tileSize / 2,
          y * tileSize + tileSize / 2,
          tileSize,
          tileSize,
          floorColor
        );

        floor.setStrokeStyle(1, 0x2a2a2a);
        floor.setDepth(0);
        roomDecorations.push(floor);
      }
    }
  }

  const obstacleCount = Phaser.Math.Between(12, 22);

  for (let i = 0; i < obstacleCount; i++) {
    const x = Phaser.Math.Between(3, mapWidth - 4);
    const y = Phaser.Math.Between(3, mapHeight - 4);

    if (isNearCenter(x, y) || isNearDoor(x, y)) {
      continue;
    }

    createWallBlock(x, y, 0x5c4033);
  }
}

function getRoomFloorColor() {
  return Phaser.Utils.Array.GetRandom([0x3f6b3f, 0x355c4a, 0x4b5f36, 0x3d5a6b]);
}

function createWallBlock(x, y, color) {
  const wall = currentScene.add.rectangle(
    x * tileSize + tileSize / 2,
    y * tileSize + tileSize / 2,
    tileSize,
    tileSize,
    color
  );

  wall.setStrokeStyle(1, 0x2a2a2a);
  wall.setDepth(5);

  currentScene.physics.add.existing(wall, true);
  walls.add(wall);
  blockedTiles.add(tileKey(x, y));
}

function isDoorGapTile(x, y) {
  const midX = Math.floor(mapWidth / 2);
  const midY = Math.floor(mapHeight / 2);

  if (y === 0 && Math.abs(x - midX) <= 1) {
    return true;
  }

  if (y === mapHeight - 1 && Math.abs(x - midX) <= 1) {
    return true;
  }

  if (x === 0 && Math.abs(y - midY) <= 1) {
    return true;
  }

  if (x === mapWidth - 1 && Math.abs(y - midY) <= 1) {
    return true;
  }

  return false;
}

function createDoors() {
  createDoor("north", Math.floor(mapWidth / 2) * tileSize + tileSize / 2, 8, 96, 16);
  createDoor("south", Math.floor(mapWidth / 2) * tileSize + tileSize / 2, mapHeight * tileSize - 8, 96, 16);
  createDoor("west", 8, Math.floor(mapHeight / 2) * tileSize + tileSize / 2, 16, 96);
  createDoor("east", mapWidth * tileSize - 8, Math.floor(mapHeight / 2) * tileSize + tileSize / 2, 16, 96);
}

function createDoor(direction, x, y, width, height) {
  const door = currentScene.add.zone(x, y, width, height);
  currentScene.physics.add.existing(door, true);
  door.direction = direction;
  doors.add(door);

  const marker = currentScene.add.rectangle(x, y, width, height, 0xfacc15, 0.18);
  marker.setStrokeStyle(2, 0xfacc15);
  marker.setDepth(10);
  roomDecorations.push(marker);
}

function isNearCenter(x, y) {
  return Phaser.Math.Distance.Between(x, y, Math.floor(mapWidth / 2), Math.floor(mapHeight / 2)) < 4;
}

function isNearDoor(x, y) {
  const midX = Math.floor(mapWidth / 2);
  const midY = Math.floor(mapHeight / 2);

  if (Math.abs(x - midX) <= 3 && (y <= 2 || y >= mapHeight - 3)) {
    return true;
  }

  if (Math.abs(y - midY) <= 3 && (x <= 2 || x >= mapWidth - 3)) {
    return true;
  }

  return false;
}

function createLooseIngredients() {
  const ingredientCount = Phaser.Math.Between(2, 4);

  const pool = [
    ingredientDefinitions.Pilz,
    ingredientDefinitions.Kraut,
    ingredientDefinitions.Zwiebel,
    ingredientDefinitions.Kartoffel,
    ingredientDefinitions.Honig,
    ingredientDefinitions.Fisch,
    ingredientDefinitions.Milch,
    ingredientDefinitions.Feuerbeere,
    ingredientDefinitions.Fleisch,
    ingredientDefinitions.Kristallsalz
  ];

  for (let i = 0; i < ingredientCount; i++) {
    const tile = findFreeTile(4);

    if (!tile) {
      continue;
    }

    createIngredient(tile.x, tile.y, Phaser.Utils.Array.GetRandom(pool));
  }
}

function createIngredient(x, y, ingredientData) {
  const ingredient = currentScene.physics.add.sprite(
    x * tileSize + tileSize / 2,
    y * tileSize + tileSize / 2,
    ingredientData.texture
  );

  ingredient.body.setImmovable(true);
  ingredient.setDepth(20);
  ingredient.itemName = ingredientData.name;
  ingredient.rarity = ingredientData.rarity;
  ingredient.itemType = "ingredient";
  ingredient.gatherXp = ingredientData.gatherXp;

  if (hasSkill("ingredientMagnet")) {
    ingredient.body.setSize(48, 48, true);
  } else {
    ingredient.body.setSize(30, 30, true);
  }

  ingredients.add(ingredient);
  occupiedTiles.add(tileKey(x, y));
}

function createCookingStations() {
  const extraStations = getTotalSkillEffect("extraCookingStations");

  const stationCount = Phaser.Math.Between(1, 3 + extraStations);

  for (let i = 0; i < stationCount; i++) {
    const tile = findFreeTile(4);

    if (!tile) {
      continue;
    }

    const station = currentScene.physics.add.staticSprite(
      tile.x * tileSize + tileSize / 2,
      tile.y * tileSize + tileSize / 2,
      "cooking-station"
    );

    station.setDepth(15);
    cookingStations.add(station);
    occupiedTiles.add(tileKey(tile.x, tile.y));
  }
}

function createRoomEnemies() {
  const enemyCount = Phaser.Math.Clamp(3 + Math.floor(roomDepth * 0.45), 3, 13);

  for (let i = 0; i < enemyCount; i++) {
    spawnNormalEnemy(5);
  }
}

function createRoomBosses() {
  if (roomDepth < 4) {
    return;
  }

  const bossChance = Math.min(70, 14 + roomDepth * 3);

  if (Math.random() * 100 > bossChance) {
    return;
  }

  const bossCount = roomDepth >= 18 ? Phaser.Math.Between(1, 2) : 1;

  for (let i = 0; i < bossCount; i++) {
    spawnBoss(8);
  }
}

function spawnNormalEnemy(minDistanceFromPlayer) {
  const pool = [
    enemyDefinitions.Schleim,
    enemyDefinitions.Ratte,
    enemyDefinitions.Feuerkaefer,
    enemyDefinitions.Knochenkoch,
    enemyDefinitions.Gewuerzgeist,
    enemyDefinitions.Bogenschuetze,
    enemyDefinitions.FeuerMagier,
    enemyDefinitions.Giftkoch
  ];

  const tile = findFreeTile(minDistanceFromPlayer);

  if (!tile) {
    return;
  }

  createEnemy(tile.x, tile.y, Phaser.Utils.Array.GetRandom(pool), false);
}

function spawnBoss(minDistanceFromPlayer) {
  const pool = [
    bossDefinitions.ChiliDrache,
    bossDefinitions.SchattenMetzger,
    bossDefinitions.GoldenerEber,
    bossDefinitions.PfefferHexe
  ];

  const tile = findFreeTile(minDistanceFromPlayer);

  if (!tile) {
    return;
  }

  createEnemy(tile.x, tile.y, Phaser.Utils.Array.GetRandom(pool), true);
}

function createEnemy(x, y, enemyData, isBoss) {
  const enemy = currentScene.physics.add.sprite(
    x * tileSize + tileSize / 2,
    y * tileSize + tileSize / 2,
    enemyData.texture
  );

  const scale = getDifficultyScale();

  enemy.enemyName = enemyData.name;
  enemy.maxHp = Math.max(1, Math.round(enemyData.maxHp * scale.hp));
  enemy.hp = enemy.maxHp;
  enemy.attack = Math.max(1, Math.round(enemyData.attack * scale.attack));
  enemy.defense = Math.max(0, Math.round(enemyData.defense * scale.defense));
  enemy.speed = Math.max(1, Math.round(enemyData.speed * scale.speed));
  enemy.aggroRange = enemyData.aggroRange;
  enemy.xpReward = Math.max(1, Math.round(enemyData.xpReward * scale.xp));
  enemy.dropTable = enemyData.dropTable;
  enemy.specialDrop = enemyData.specialDrop || null;
  enemy.isBoss = isBoss;
  enemy.isRanged = enemyData.isRanged || false;
  enemy.projectileTexture = enemyData.projectileTexture || "projectile-arrow";
  enemy.projectileSpeed = Math.round((enemyData.projectileSpeed || 210) * scale.speed);
  enemy.rangedCooldown = Math.max(650, (enemyData.rangedCooldown || 1800) - roomDepth * 25);
  enemy.preferredRange = enemyData.preferredRange || 220;
  enemy.lastAttackTime = 0;
  enemy.lastRangedAttackTime = 0;

  enemy.setDepth(30);

  if (isBoss) {
    enemy.setScale(1.45);
  }

  enemy.hpBarBackground = currentScene.add.rectangle(enemy.x, enemy.y - (isBoss ? 30 : 22), isBoss ? 42 : 28, 5, 0x111827);
  enemy.hpBar = currentScene.add.rectangle(enemy.x, enemy.y - (isBoss ? 30 : 22), isBoss ? 42 : 28, 5, isBoss ? 0xf97316 : 0xef4444);
  enemy.hpBarBackground.setDepth(40);
  enemy.hpBar.setDepth(41);

  if (isBoss) {
    bosses.add(enemy);
  } else {
    enemies.add(enemy);
  }

  occupiedTiles.add(tileKey(x, y));
}

function getDifficultyScale() {
  const earlyEase = Math.max(0, roomDepth - 1);

  return {
    hp: 0.72 + earlyEase * 0.14,
    attack: 0.68 + earlyEase * 0.085,
    defense: 0.75 + earlyEase * 0.045,
    speed: Math.min(2.1, 0.82 + earlyEase * 0.032),
    xp: 1 + earlyEase * 0.08
  };
}

function placePlayerAtEntry(entryDirection) {
  let x = Math.floor(mapWidth / 2);
  let y = Math.floor(mapHeight / 2);

  if (entryDirection === "north") {
    y = mapHeight - 3;
  }

  if (entryDirection === "south") {
    y = 2;
  }

  if (entryDirection === "west") {
    x = mapWidth - 3;
  }

  if (entryDirection === "east") {
    x = 2;
  }

  player.setPosition(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2);
  player.body.setVelocity(0);
}

function handleDoorOverlap(playerObject, door) {
  if (transitioningRoom || !runActive || cookingMenuOpen || inventoryMenuOpen) {
    return;
  }

  transitioningRoom = true;

  if (door.direction === "north") {
    roomY -= 1;
  }

  if (door.direction === "south") {
    roomY += 1;
  }

  if (door.direction === "west") {
    roomX -= 1;
  }

  if (door.direction === "east") {
    roomX += 1;
  }

  roomDepth += 1;
  runStats.roomsExplored += 1;

  generateNewRoom(door.direction);

  hintText.textContent = "Neuer Raum betreten. Gegner werden stärker. Raumtiefe: " + roomDepth + ".";

  currentScene.time.delayedCall(400, function() {
    transitioningRoom = false;
  });
}

function findFreeTile(minDistanceFromCenter) {
  for (let attempt = 0; attempt < 250; attempt++) {
    const x = Phaser.Math.Between(2, mapWidth - 3);
    const y = Phaser.Math.Between(2, mapHeight - 3);

    if (blockedTiles.has(tileKey(x, y))) {
      continue;
    }

    if (occupiedTiles.has(tileKey(x, y))) {
      continue;
    }

    if (isNearDoor(x, y)) {
      continue;
    }

    if (isNearCenter(x, y) && minDistanceFromCenter > 0) {
      continue;
    }

    return { x: x, y: y };
  }

  return null;
}

function createPlayer(scene) {
  player = scene.physics.add.sprite(400, 256, "player-chef");
  player.setDepth(100);
  player.setScale(1);
  player.setAlpha(1);
  player.body.setCollideWorldBounds(true);
}

function createAttackRangeIndicator(scene) {
  attackRangeGraphics = scene.add.graphics();
  attackRangeGraphics.setDepth(90);
}

function updateAttackRangeIndicator() {
  if (!attackRangeGraphics || !player) {
    return;
  }

  attackRangeGraphics.clear();

  if (!runActive || gameOver || cookingMenuOpen || inventoryMenuOpen) {
    return;
  }

  const range = getPlayerAttackRange();

  attackRangeGraphics.fillStyle(0xfacc15, 0.05);
  attackRangeGraphics.fillCircle(player.x, player.y, range);
  attackRangeGraphics.lineStyle(2, 0xfacc15, 0.75);
  attackRangeGraphics.strokeCircle(player.x, player.y, range);
}

function createControls(scene) {
  cursors = scene.input.keyboard.createCursorKeys();

  wasd = scene.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });

  interactKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  escKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  attackKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  inventoryKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
}

function movePlayer() {
  const stats = getCurrentStats();
  const speed = stats.speed;

  player.body.setVelocity(0);

  if (cursors.left.isDown || wasd.left.isDown) {
    player.body.setVelocityX(-speed);
  } else if (cursors.right.isDown || wasd.right.isDown) {
    player.body.setVelocityX(speed);
  }

  if (cursors.up.isDown || wasd.up.isDown) {
    player.body.setVelocityY(-speed);
  } else if (cursors.down.isDown || wasd.down.isDown) {
    player.body.setVelocityY(speed);
  }

  player.body.velocity.normalize().scale(speed);
}

function updateEnemyGroup(group) {
  group.children.each(function(enemy) {
    if (!enemy.active) {
      return;
    }

    const distance = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);

    if (enemy.isRanged) {
      updateRangedEnemy(enemy, distance);
    } else {
      updateMeleeEnemy(enemy, distance);
    }

    const yOffset = enemy.isBoss ? 30 : 22;

    enemy.hpBarBackground.x = enemy.x;
    enemy.hpBarBackground.y = enemy.y - yOffset;
    enemy.hpBar.x = enemy.x;
    enemy.hpBar.y = enemy.y - yOffset;
  });
}

function updateMeleeEnemy(enemy, distance) {
  if (distance <= enemy.aggroRange) {
    currentScene.physics.moveToObject(enemy, player, enemy.speed);
  } else {
    enemy.body.setVelocity(0);
  }
}

function updateRangedEnemy(enemy, distance) {
  const now = currentScene.time.now;

  if (distance <= enemy.aggroRange) {
    if (distance < enemy.preferredRange * 0.7) {
      const angleAway = Phaser.Math.Angle.Between(player.x, player.y, enemy.x, enemy.y);
      enemy.body.setVelocity(Math.cos(angleAway) * enemy.speed, Math.sin(angleAway) * enemy.speed);
    } else if (distance > enemy.preferredRange) {
      currentScene.physics.moveToObject(enemy, player, enemy.speed);
    } else {
      enemy.body.setVelocity(0);
    }

    if (now - enemy.lastRangedAttackTime >= enemy.rangedCooldown) {
      enemy.lastRangedAttackTime = now;
      shootProjectile(enemy);
    }
  } else {
    enemy.body.setVelocity(0);
  }
}

function shootProjectile(enemy) {
  const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
  const projectile = currentScene.physics.add.sprite(enemy.x, enemy.y, enemy.projectileTexture);

  projectile.damage = Math.max(1, enemy.attack);
  projectile.owner = enemy;
  projectile.lifetime = currentScene.time.now + 3500;
  projectile.setDepth(80);
  projectile.setRotation(angle);

  projectile.body.setAllowGravity(false);
  projectile.body.setVelocity(Math.cos(angle) * enemy.projectileSpeed, Math.sin(angle) * enemy.projectileSpeed);

  enemyProjectiles.add(projectile);

  currentScene.tweens.add({
    targets: projectile,
    alpha: 0.65,
    duration: 160,
    yoyo: true,
    repeat: -1
  });
}

function cleanupProjectiles() {
  const now = currentScene.time.now;

  enemyProjectiles.children.each(function(projectile) {
    if (projectile.active && projectile.lifetime && projectile.lifetime < now) {
      projectile.destroy();
    }
  });
}

function destroyProjectile(projectile) {
  projectile.destroy();
}

function handleProjectileHit(playerObject, projectile) {
  if (!projectile.active) {
    return;
  }

  const stats = getCurrentStats();
  const damage = Math.max(1, projectile.damage - Math.floor(stats.defense * 0.6));

  playerStats.hp = Math.max(0, playerStats.hp - damage);
  projectile.destroy();

  hintText.textContent = "Du wurdest aus der Entfernung für " + damage + " Schaden getroffen.";

  currentScene.tweens.add({
    targets: player,
    alpha: 0.35,
    duration: 90,
    yoyo: true
  });

  updateStatsUI();

  if (playerStats.hp <= 0) {
    if (tryLastStand()) {
      return;
    }

    playerDied();
  }
}

function handlePlayerAttack() {
  if (!Phaser.Input.Keyboard.JustDown(attackKey)) {
    return;
  }

  const now = currentScene.time.now;
  const cooldown = getPlayerAttackCooldown();

  if (now - lastPlayerAttackTime < cooldown) {
    const remaining = Math.ceil((cooldown - (now - lastPlayerAttackTime)) / 100) / 10;
    hintText.textContent = "Angriff lädt noch auf: " + remaining + "s.";
    return;
  }

  lastPlayerAttackTime = now;

  const target = findNearestEnemyInRange(getPlayerAttackRange());

  if (!target) {
    hintText.textContent = "Kein Gegner in Reichweite.";
    return;
  }

  attackEnemy(target);
}

function findNearestEnemyInRange(range) {
  let nearestEnemy = null;
  let nearestDistance = Infinity;

  enemies.children.each(function(enemy) {
    if (!enemy.active) {
      return;
    }

    const distance = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);

    if (distance <= range && distance < nearestDistance) {
      nearestEnemy = enemy;
      nearestDistance = distance;
    }
  });

  bosses.children.each(function(enemy) {
    if (!enemy.active) {
      return;
    }

    const distance = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);

    if (distance <= range && distance < nearestDistance) {
      nearestEnemy = enemy;
      nearestDistance = distance;
    }
  });

  return nearestEnemy;
}

function attackEnemy(enemy) {
  const stats = getCurrentStats();

  let damage = Math.max(1, stats.attack - enemy.defense);
  const isCrit = Math.random() * 100 < stats.critChance;

  if (isCrit) {
    damage = Math.round(damage * 1.85);
  }

  enemy.hp -= damage;

  hintText.textContent = enemy.enemyName + " erleidet " + damage + " Schaden" + (isCrit ? " (Kritisch!)" : "") + ".";

  currentScene.tweens.add({
    targets: enemy,
    alpha: 0.35,
    duration: 80,
    yoyo: true
  });

  updateEnemyHpBar(enemy);

  if (enemy.hp <= 0) {
    defeatEnemy(enemy);
  }
}

function updateEnemyHpBar(enemy) {
  const hpPercent = Math.max(0, enemy.hp / enemy.maxHp);
  enemy.hpBar.width = (enemy.isBoss ? 42 : 28) * hpPercent;
}

function defeatEnemy(enemy) {
  if (enemy.isBoss) {
    runStats.bossesDefeated += 1;
    hintText.textContent = enemy.enemyName + " wurde besiegt. Boss-Zutaten fallen gelassen!";
    dropBossIngredients(enemy);
  } else {
    runStats.enemiesDefeated += 1;
    hintText.textContent = enemy.enemyName + " wurde besiegt. +" + enemy.xpReward + " Kampf-XP.";
    dropIngredientFromEnemy(enemy);
  }

  addSkillXp("combat", enemy.xpReward);

  if (enemy.hpBar) {
    enemy.hpBar.destroy();
  }

  if (enemy.hpBarBackground) {
    enemy.hpBarBackground.destroy();
  }

  enemy.destroy();
}

function dropIngredientFromEnemy(enemy) {
  if (!enemy.dropTable || enemy.dropTable.length === 0) {
    return;
  }

  const dropChance = 58;

  if (Math.random() * 100 > dropChance) {
    return;
  }

  const dropName = Phaser.Utils.Array.GetRandom(enemy.dropTable);
  dropIngredientAt(enemy.x, enemy.y, dropName);
}

function dropBossIngredients(enemy) {
  if (enemy.specialDrop) {
    dropIngredientAt(enemy.x, enemy.y, enemy.specialDrop);
  }

  if (enemy.dropTable && enemy.dropTable.length > 0) {
    const bossDropBonus = getTotalSkillEffect("bossExtraDrops");
    const extraDropCount = Phaser.Math.Between(2 + bossDropBonus, 4 + bossDropBonus);

    for (let i = 0; i < extraDropCount; i++) {
      const dropName = Phaser.Utils.Array.GetRandom(enemy.dropTable);
      dropIngredientAt(enemy.x + Phaser.Math.Between(-24, 24), enemy.y + Phaser.Math.Between(-24, 24), dropName);
    }
  }
}

function dropIngredientAt(x, y, ingredientName) {
  const ingredientData = ingredientDefinitions[ingredientName];

  if (!ingredientData) {
    return;
  }

  const ingredient = currentScene.physics.add.sprite(x, y, ingredientData.texture);
  ingredient.body.setImmovable(true);
  ingredient.setDepth(20);
  ingredient.itemName = ingredientData.name;
  ingredient.rarity = ingredientData.rarity;
  ingredient.itemType = "ingredient";
  ingredient.gatherXp = ingredientData.gatherXp;

  if (hasSkill("ingredientMagnet")) {
    ingredient.body.setSize(48, 48, true);
  } else {
    ingredient.body.setSize(30, 30, true);
  }

  ingredients.add(ingredient);
}

function handleEnemyContact(playerObject, enemy) {
  if (!enemy.active) {
    return;
  }

  const now = currentScene.time.now;

  if (now - enemy.lastAttackTime < 900) {
    return;
  }

  enemy.lastAttackTime = now;

  const stats = getCurrentStats();
  const damage = Math.max(1, enemy.attack - stats.defense);

  playerStats.hp = Math.max(0, playerStats.hp - damage);

  hintText.textContent = enemy.enemyName + " trifft dich für " + damage + " Schaden.";

  currentScene.tweens.add({
    targets: player,
    alpha: 0.35,
    duration: 90,
    yoyo: true
  });

  updateStatsUI();

  if (playerStats.hp <= 0) {
    if (tryLastStand()) {
      return;
    }

    playerDied();
  }
}

function tryLastStand() {
  if (!hasSkill("lastStand")) {
    return false;
  }

  if (playerStats.lastStandUsed) {
    return false;
  }

  playerStats.lastStandUsed = true;
  playerStats.hp = 1;
  hintText.textContent = "Letzter Gang aktiviert! Du überlebst mit 1 Leben.";

  currentScene.tweens.add({
    targets: player,
    alpha: 0.25,
    duration: 120,
    yoyo: true,
    repeat: 5
  });

  updateStatsUI();
  return true;
}

function playerDied() {
  player.body.setVelocity(0);
  player.setTint(0x555555);
  hintText.textContent = "Du bist besiegt worden.";
  finishRun();
}

function autoPickupIngredient(playerObject, ingredient) {
  pickupIngredient(ingredient);
}

function pickupIngredient(ingredient) {
  if (!ingredient.active) {
    return;
  }

  const gatheringBonusChance = getGatheringDoubleChance();

  ingredientInventory.push({
    name: ingredient.itemName,
    rarity: ingredient.rarity,
    type: "ingredient"
  });

  runStats.ingredientsCollected += 1;

  let bonusText = "";

  if (Math.random() * 100 < gatheringBonusChance) {
    ingredientInventory.push({
      name: ingredient.itemName,
      rarity: ingredient.rarity,
      type: "ingredient"
    });

    runStats.ingredientsCollected += 1;
    bonusText = " Sammelbonus: +1 extra!";
  }

  const xpGain = ingredient.gatherXp || 8;
  addSkillXp("gathering", xpGain);

  hintText.textContent = ingredient.itemName + " automatisch eingesammelt. +" + xpGain + " Sammel-XP." + bonusText;

  ingredient.destroy();
  updateInventoryUI();
}

function handleCookingStationOverlap() {
  contextualHintShown = true;
  hintText.textContent = "Drücke E an der Kochstelle, um das Kochmenü zu öffnen.";

  if (Phaser.Input.Keyboard.JustDown(interactKey)) {
    openCookingMenu();
  }
}

function openCookingMenu() {
  cookingMenuOpen = true;
  cookingMenu.classList.remove("hidden");
  renderRecipeMenu();
}

function closeCookingMenu() {
  cookingMenuOpen = false;
  cookingMenu.classList.add("hidden");
  hintText.textContent = "Kochmenü geschlossen.";
}

function toggleInventoryMenu() {
  if (inventoryMenuOpen) {
    closeInventoryMenu();
  } else {
    openInventoryMenu();
  }
}

function openInventoryMenu() {
  inventoryMenuOpen = true;
  inventoryMenu.classList.remove("hidden");
  updateInventoryUI();
  updateCookbookUI();
  hintText.textContent = "Inventar geöffnet.";
}

function closeInventoryMenu() {
  inventoryMenuOpen = false;
  inventoryMenu.classList.add("hidden");
  hintText.textContent = "Inventar geschlossen.";
}

function renderRecipeMenu() {
  recipesList.innerHTML = recipes
    .map(function(recipe, index) {
      const canCook = hasRequiredIngredients(recipe.requiredIngredients);
      const rarityClass = "rarity-" + recipe.rarity;
      const borderClass = "recipe-border-" + recipe.rarity;
      const discovered = isRecipeDiscovered(recipe.name);
      const shownDescription = discovered ? recipe.description : recipe.hiddenDescription;
      const shownEffect = discovered ? recipe.effectDescription : "??? Effekt unbekannt. Erst essen, dann wird er im Kochbuch gespeichert.";

      return `
        <div class="recipe-card ${borderClass}">
          <div class="recipe-top">
            <div>
              <h3 class="recipe-title ${rarityClass}">${recipe.name}</h3>
              <p class="recipe-description">${shownDescription}</p>
              <p class="recipe-info ${discovered ? "" : "status-unknown"}">Effekt: ${shownEffect}</p>
              <p class="recipe-info">Kochen-XP: ${recipe.cookingXp}</p>
              <p class="recipe-info">Seltenheit: <span class="${rarityClass}">${getRarityLabel(recipe.rarity)}</span></p>
              <p class="recipe-requirements">Benötigt: ${formatRequirements(recipe.requiredIngredients)}</p>
              <p class="recipe-status ${canCook ? "status-ready" : "status-missing"}">${canCook ? "Bereit zum Kochen" : "Zutaten fehlen"}</p>
            </div>

            <button class="cook-button" data-recipe-index="${index}" ${canCook ? "" : "disabled"}>Kochen</button>
          </div>
        </div>
      `;
    })
    .join("");

  const cookButtons = recipesList.querySelectorAll(".cook-button");

  cookButtons.forEach(function(button) {
    button.addEventListener("click", function() {
      const recipeIndex = Number(button.dataset.recipeIndex);
      cookRecipe(recipeIndex);
    });
  });
}

function cookRecipe(recipeIndex) {
  const recipe = recipes[recipeIndex];

  if (!recipe) {
    return;
  }

  if (!hasRequiredIngredients(recipe.requiredIngredients)) {
    hintText.textContent = "Für " + recipe.name + " fehlen noch Zutaten.";
    renderRecipeMenu();
    return;
  }

  removeIngredients(recipe.requiredIngredients);

  mealInventory.push({
    name: recipe.name,
    rarity: recipe.rarity,
    description: recipe.description,
    hiddenDescription: recipe.hiddenDescription,
    effectDescription: recipe.effectDescription,
    mealEffect: recipe.mealEffect,
    type: "meal"
  });

  runStats.mealsCooked += 1;

  addSkillXp("cooking", recipe.cookingXp);

  hintText.textContent = "Gekocht: " + recipe.name + "! +" + recipe.cookingXp + " Koch-XP.";
  updateInventoryUI();
  renderRecipeMenu();
}

function useMeal(mealName) {
  const mealIndex = mealInventory.findIndex(function(meal) {
    return meal.name === mealName;
  });

  if (mealIndex === -1) {
    return;
  }

  const meal = mealInventory[mealIndex];

  applyMealEffect(meal);

  const wasDiscoveredBefore = isRecipeDiscovered(meal.name);
  discoverRecipe(meal.name);

  if (!wasDiscoveredBefore) {
    runStats.newRecipesDiscovered += 1;
  }

  mealInventory.splice(mealIndex, 1);
  hintText.textContent = meal.name + " wurde gegessen. Der Effekt ist nun im Kochbuch bekannt.";
  updateInventoryUI();
  updateCookbookUI();
  updateMainMenuUI();
  updateStatsUI();
  updateEffectsUI();
}

function applyMealEffect(meal) {
  const effect = meal.mealEffect;

  if (!effect) {
    return;
  }

  const cookingMultiplier = getCookingEffectMultiplier();

  if (effect.heal && effect.heal > 0) {
    const improvedHeal = Math.round(effect.heal * cookingMultiplier);
    playerStats.hp = Math.min(playerStats.maxHp, playerStats.hp + improvedHeal);
  }

  if (effect.buffs && effect.buffs.length > 0) {
    effect.buffs.forEach(function(buff) {
      addBuff({
        name: buff.name,
        stat: buff.stat,
        amount: buff.amount,
        duration: Math.round(buff.duration * cookingMultiplier)
      });
    });
  }
}

function addBuff(buff) {
  const now = currentScene.time.now;

  const existingBuffIndex = activeEffects.findIndex(function(effect) {
    return effect.name === buff.name && effect.stat === buff.stat;
  });

  const newBuff = {
    name: buff.name,
    stat: buff.stat,
    amount: buff.amount,
    endTime: now + buff.duration
  };

  if (existingBuffIndex !== -1) {
    activeEffects[existingBuffIndex] = newBuff;
  } else {
    activeEffects.push(newBuff);
  }
}

function updateActiveEffects() {
  if (!currentScene) {
    return;
  }

  const now = currentScene.time.now;
  const beforeLength = activeEffects.length;

  activeEffects = activeEffects.filter(function(effect) {
    return effect.endTime > now;
  });

  if (activeEffects.length !== beforeLength) {
    updateStatsUI();
    updateEffectsUI();
  }

  updateEffectsUI();
}

function getCurrentStats() {
  const combatBonusAttack = getCombatAttackBonus();

  const stats = {
    maxHp: playerStats.maxHp,
    hp: playerStats.hp,
    attack: playerStats.attack + combatBonusAttack,
    defense: playerStats.defense,
    speed: playerStats.speed,
    critChance: playerStats.critChance
  };

  activeEffects.forEach(function(effect) {
    if (stats[effect.stat] !== undefined) {
      stats[effect.stat] += effect.amount;
    }
  });

  return stats;
}

function addSkillXp(skillName, amount) {
  const skill = skills[skillName];

  if (!skill) {
    return;
  }

  skill.xp += amount;

  let leveledUp = false;

  while (skill.xp >= getXpToNextLevel(skill.level)) {
    skill.xp -= getXpToNextLevel(skill.level);
    skill.level += 1;
    leveledUp = true;
  }

  if (leveledUp) {
    hintText.textContent = skill.label + " ist auf Level " + skill.level + " gestiegen!";
    currentScene.tweens.add({
      targets: player,
      scaleX: 1.25,
      scaleY: 1.25,
      duration: 120,
      yoyo: true
    });
  }

  updateSkillsUI();
  updateStatsUI();
}

function getXpToNextLevel(level) {
  return 50 + (level - 1) * 35;
}

function getCombatAttackBonus() {
  return (skills.combat.level - 1) * 2;
}

function getGatheringDoubleChance() {
  let chance = (skills.gathering.level - 1) * 5 + metaProgress.upgrades.gathering * 5;

  chance += getTotalSkillEffect("gatheringChance");

  return Math.min(85, chance);
}

function getCookingEffectMultiplier() {
  let multiplier = 1 + (skills.cooking.level - 1) * 0.08;

  multiplier += getTotalSkillEffect("cookingMultiplier");

  return multiplier;
}

function getPlayerAttackRange() {
  return basePlayerAttackRange + getTotalSkillEffect("attackRange");
}

function getPlayerAttackCooldown() {
  return Math.max(230, basePlayerAttackCooldown - getTotalSkillEffect("cooldownReduction"));
}

function hasRequiredIngredients(requiredIngredients) {
  const counts = getIngredientCounts();

  return Object.keys(requiredIngredients).every(function(name) {
    return (counts[name] || 0) >= requiredIngredients[name];
  });
}

function removeIngredients(requiredIngredients) {
  Object.keys(requiredIngredients).forEach(function(name) {
    let amountToRemove = requiredIngredients[name];

    for (let i = ingredientInventory.length - 1; i >= 0; i--) {
      if (amountToRemove <= 0) {
        break;
      }

      if (ingredientInventory[i].name === name) {
        ingredientInventory.splice(i, 1);
        amountToRemove -= 1;
      }
    }
  });
}

function getIngredientCounts() {
  const counts = {};

  ingredientInventory.forEach(function(item) {
    counts[item.name] = (counts[item.name] || 0) + 1;
  });

  return counts;
}

function formatRequirements(requiredIngredients) {
  return Object.keys(requiredIngredients)
    .map(function(name) {
      return requiredIngredients[name] + "x " + name;
    })
    .join(", ");
}

function updateInventoryUI() {
  if (ingredientInventory.length === 0) {
    ingredientsText.innerHTML = "Noch keine Zutaten gesammelt.";
  } else {
    const groupedIngredients = groupInventory(ingredientInventory);

    ingredientsText.innerHTML = groupedIngredients
      .map(function(item) {
        return `
          <div class="inventory-entry">
            <span class="rarity-${item.rarity}">
              ${item.name}
            </span>
            <span class="item-count">x${item.count}</span>
          </div>
        `;
      })
      .join("");
  }

  if (mealInventory.length === 0) {
    mealsText.innerHTML = "Noch keine Gerichte gekocht.";
  } else {
    const groupedMeals = groupInventory(mealInventory);

    mealsText.innerHTML = groupedMeals
      .map(function(item) {
        const discovered = isRecipeDiscovered(item.name);
        const recipe = recipes.find(function(currentRecipe) {
          return currentRecipe.name === item.name;
        });

        const effectText = discovered && recipe ? recipe.effectDescription : "Effekt unbekannt";

        return `
          <div class="inventory-entry">
            <div class="item-line">
              <span>
                <span class="rarity-${item.rarity}">
                  ${item.name}
                </span>
                <span class="item-count">x${item.count}</span>
                <span class="item-effect">${effectText}</span>
              </span>

              <button class="use-meal-button" data-meal-name="${item.name}">
                Essen
              </button>
            </div>
          </div>
        `;
      })
      .join("");

    const mealButtons = mealsText.querySelectorAll(".use-meal-button");

    mealButtons.forEach(function(button) {
      button.addEventListener("click", function() {
        useMeal(button.dataset.mealName);
      });
    });
  }
}

function updateStatsUI() {
  const stats = getCurrentStats();

  let hpClass = "hp-good";

  if (playerStats.hp <= playerStats.maxHp * 0.3) {
    hpClass = "hp-low";
  } else if (playerStats.hp <= playerStats.maxHp * 0.6) {
    hpClass = "hp-medium";
  }

  const cooldown = getPlayerAttackCooldown();
  const attackReady = currentScene ? Math.max(0, cooldown - (currentScene.time.now - lastPlayerAttackTime)) : 0;
  const cooldownText = attackReady <= 0 ? "bereit" : (Math.ceil(attackReady / 100) / 10) + "s";

  statsText.innerHTML = `
    <div class="stat-row">
      <span class="stat-name">Leben</span>
      <span class="stat-value ${hpClass}">${playerStats.hp} / ${playerStats.maxHp}</span>
    </div>
    <div class="stat-row">
      <span class="stat-name">Angriff</span>
      <span class="stat-value">${stats.attack}</span>
    </div>
    <div class="stat-row">
      <span class="stat-name">Verteidigung</span>
      <span class="stat-value">${stats.defense}</span>
    </div>
    <div class="stat-row">
      <span class="stat-name">Tempo</span>
      <span class="stat-value">${stats.speed}</span>
    </div>
    <div class="stat-row">
      <span class="stat-name">Crit-Chance</span>
      <span class="stat-value">${stats.critChance}%</span>
    </div>
    <div class="stat-row">
      <span class="stat-name">Raumtiefe</span>
      <span class="stat-value">${roomDepth}</span>
    </div>
    <div class="stat-row">
      <span class="stat-name">Angriff</span>
      <span class="stat-value">${cooldownText}</span>
    </div>
  `;
}

function updateSkillsUI() {
  skillsText.innerHTML = Object.keys(skills)
    .map(function(skillKey) {
      const skill = skills[skillKey];
      const nextXp = getXpToNextLevel(skill.level);
      const bonusText = getSkillBonusText(skillKey);

      return `
        <div class="skill-row">
          <span class="skill-name">${skill.label}</span>
          <span class="skill-value">Lvl ${skill.level}</span>
        </div>
        <div class="skill-xp">${skill.xp} / ${nextXp} XP</div>
        <div class="skill-bonus">${bonusText}</div>
      `;
    })
    .join("");
}

function updateEffectsUI() {
  if (!effectsText) {
    return;
  }

  if (activeEffects.length === 0) {
    effectsText.innerHTML = "Keine aktiven Effekte.";
    return;
  }

  const now = currentScene.time.now;

  effectsText.innerHTML = activeEffects
    .map(function(effect) {
      const remainingSeconds = Math.ceil((effect.endTime - now) / 1000);
      const sign = effect.amount >= 0 ? "+" : "";

      return `
        <div class="effect-entry">
          ${effect.name}: ${sign}${effect.amount} ${getStatLabel(effect.stat)}
          (${remainingSeconds}s)
        </div>
      `;
    })
    .join("");
}

function updateCookbookUI() {
  if (!cookbookText) {
    return;
  }

  const discoveredRecipeObjects = recipes.filter(function(recipe) {
    return isRecipeDiscovered(recipe.name);
  });

  if (discoveredRecipeObjects.length === 0) {
    cookbookText.innerHTML = "Noch keine Gerichte probiert. Iss ein Gericht, um seinen Effekt dauerhaft zu speichern.";
  } else {
    cookbookText.innerHTML = discoveredRecipeObjects
      .map(function(recipe) {
        return `
          <div class="cookbook-entry">
            <span class="rarity-${recipe.rarity}">${recipe.name}</span>
            <span class="item-effect">${recipe.effectDescription}</span>
          </div>
        `;
      })
      .join("");
  }

  updateMainMenuCookbookUI();
}

function updateMainMenuUI() {
  if (!metaText) {
    return;
  }

  metaText.innerHTML = `
    <div class="meta-row">
      <span class="meta-name">Küchenmarken</span>
      <span class="meta-value">${metaProgress.tokens}</span>
    </div>
    <div class="meta-row">
      <span class="meta-name">Entdeckte Rezepte</span>
      <span class="meta-value">${discoveredRecipes.length} / ${recipes.length}</span>
    </div>
    <div class="meta-row">
      <span class="meta-name">Skilltree</span>
      <span class="meta-value">${getUnlockedSkillCount()} / ${skilltreeNodes.length}</span>
    </div>
  `;

  updateMainMenuCookbookUI();
}

function updateMainMenuCookbookUI() {
  if (!menuCookbookText) {
    return;
  }

  const discoveredRecipeObjects = recipes.filter(function(recipe) {
    return isRecipeDiscovered(recipe.name);
  });

  if (discoveredRecipeObjects.length === 0) {
    menuCookbookText.innerHTML = "Noch keine Rezepte entdeckt.";
    return;
  }

  menuCookbookText.innerHTML = discoveredRecipeObjects
    .map(function(recipe) {
      return `
        <div class="cookbook-entry">
          <span class="rarity-${recipe.rarity}">${recipe.name}</span>
          <span class="item-effect">${recipe.effectDescription}</span>
        </div>
      `;
    })
    .join("");
}

function createUI() {
  ingredientsText = document.getElementById("ingredients-text");
  mealsText = document.getElementById("meals-text");
  hintText = document.getElementById("hint-text");
  statsText = document.getElementById("stats-text");
  effectsText = document.getElementById("effects-text");
  skillsText = document.getElementById("skills-text");
  cookbookText = document.getElementById("cookbook-text");

  mainMenu = document.getElementById("main-menu");
  startRunButton = document.getElementById("start-run-button");
  metaText = document.getElementById("meta-text");
  menuCookbookText = document.getElementById("menu-cookbook-text");

  openSkilltreeButton = document.getElementById("open-skilltree-button");
  skilltreeMenu = document.getElementById("skilltree-menu");
  closeSkilltreeMenuButton = document.getElementById("close-skilltree-menu");
  skilltreeInfo = document.getElementById("skilltree-info");
  skilltreeGrid = document.getElementById("skilltree-grid");

  runEndMenu = document.getElementById("run-end-menu");
  runEndTitle = document.getElementById("run-end-title");
  runEndSummary = document.getElementById("run-end-summary");
  runResultText = document.getElementById("run-result-text");
  backToMenuButton = document.getElementById("back-to-menu-button");

  cookingMenu = document.getElementById("cooking-menu");
  recipesList = document.getElementById("recipes-list");
  closeCookingMenuButton = document.getElementById("close-cooking-menu");

  inventoryMenu = document.getElementById("inventory-menu");
  closeInventoryMenuButton = document.getElementById("close-inventory-menu");

  startRunButton.onclick = restartSceneForNewRun;
  backToMenuButton.onclick = showMainMenu;
  closeCookingMenuButton.onclick = closeCookingMenu;
  closeInventoryMenuButton.onclick = closeInventoryMenu;
  openSkilltreeButton.onclick = openSkilltreeMenu;
  closeSkilltreeMenuButton.onclick = closeSkilltreeMenu;
}

function hasSkill(skillKey) {
  return !!metaProgress.skilltree?.[skillKey];
}

function getUnlockedSkillCount() {
  return skilltreeNodes.filter(function(node) {
    return hasSkill(node.key);
  }).length;
}

function areSkillRequirementsMet(node) {
  return node.requires.every(function(requiredKey) {
    return hasSkill(requiredKey);
  });
}

function getMissingSkillRequirements(node) {
  return node.requires
    .filter(function(requiredKey) {
      return !hasSkill(requiredKey);
    })
    .map(function(requiredKey) {
      const requiredNode = skilltreeNodes.find(function(currentNode) {
        return currentNode.key === requiredKey;
      });

      return requiredNode ? requiredNode.name : requiredKey;
    });
}

function openSkilltreeMenu() {
  skilltreeMenu.classList.remove("hidden");
  renderSkilltree();
}

function closeSkilltreeMenu() {
  skilltreeMenu.classList.add("hidden");
}

function renderSkilltree() {
  skilltreeInfo.innerHTML = `
    <div class="meta-row">
      <span class="meta-name">Verfügbare Küchenmarken</span>
      <span class="meta-value">${metaProgress.tokens}</span>
    </div>
  `;

  skilltreeGrid.innerHTML = skilltreeNodes
    .map(function(node) {
      const unlocked = hasSkill(node.key);
      const requirementsMet = areSkillRequirementsMet(node);
      const canBuy = !unlocked && requirementsMet && metaProgress.tokens >= node.cost;
      const missingRequirements = getMissingSkillRequirements(node);

      let stateClass = "locked";

      if (unlocked) {
        stateClass = "unlocked";
      } else if (requirementsMet) {
        stateClass = "available";
      }

      return `
        <div class="skill-node ${stateClass}">
          <h3 class="skill-node-title">${node.name}</h3>
          <span class="skill-node-type">${node.type}</span>
          <div class="skill-node-description">${node.description}</div>
          ${missingRequirements.length > 0 ? `<div class="skill-node-requirement">Benötigt: ${missingRequirements.join(", ")}</div>` : ""}
          <div class="skill-node-footer">
            <span class="skill-node-cost">${unlocked ? "freigeschaltet" : node.cost + " Marken"}</span>
            <button class="skill-node-button" data-skill-key="${node.key}" ${canBuy ? "" : "disabled"}>
              ${unlocked ? "Aktiv" : "Kaufen"}
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  const buttons = skilltreeGrid.querySelectorAll(".skill-node-button");

  buttons.forEach(function(button) {
    button.onclick = function() {
      buySkilltreeNode(button.dataset.skillKey);
    };
  });
}

function buySkilltreeNode(skillKey) {
  const node = skilltreeNodes.find(function(currentNode) {
    return currentNode.key === skillKey;
  });

  if (!node) {
    return;
  }

  if (hasSkill(skillKey)) {
    return;
  }

  if (!areSkillRequirementsMet(node)) {
    return;
  }

  if (metaProgress.tokens < node.cost) {
    return;
  }

  metaProgress.tokens -= node.cost;
  metaProgress.skilltree[skillKey] = true;
  saveMetaProgress();

  renderSkilltree();
  updateMainMenuUI();
  updateStatsUI();
}

function loadCookbook() {
  const savedCookbook = localStorage.getItem("dungeonChefCookbook");

  if (!savedCookbook) {
    return [];
  }

  try {
    return JSON.parse(savedCookbook);
  } catch (error) {
    return [];
  }
}

function saveCookbook() {
  localStorage.setItem("dungeonChefCookbook", JSON.stringify(discoveredRecipes));
}

function discoverRecipe(recipeName) {
  if (discoveredRecipes.includes(recipeName)) {
    return;
  }

  discoveredRecipes.push(recipeName);
  saveCookbook();
}

function isRecipeDiscovered(recipeName) {
  return discoveredRecipes.includes(recipeName);
}

function loadMetaProgress() {
  const savedMeta = localStorage.getItem("dungeonChefMetaProgress");

  if (!savedMeta) {
    return {
      tokens: 0,
      upgrades: {
        maxHp: 0,
        attack: 0,
        gathering: 0
      },
      skilltree: {}
    };
  }

  try {
    const parsed = JSON.parse(savedMeta);

    return {
      tokens: parsed.tokens || 0,
      upgrades: {
        maxHp: parsed.upgrades?.maxHp || 0,
        attack: parsed.upgrades?.attack || 0,
        gathering: parsed.upgrades?.gathering || 0
      },
      skilltree: parsed.skilltree || {}
    };
  } catch (error) {
    return {
      tokens: 0,
      upgrades: {
        maxHp: 0,
        attack: 0,
        gathering: 0
      },
      skilltree: {}
    };
  }
}

function saveMetaProgress() {
  localStorage.setItem("dungeonChefMetaProgress", JSON.stringify(metaProgress));
}

function getSkillBonusText(skillKey) {
  if (skillKey === "combat") {
    return "+" + getCombatAttackBonus() + " Angriff";
  }

  if (skillKey === "gathering") {
    return getGatheringDoubleChance() + "% Chance auf doppelte Zutaten";
  }

  if (skillKey === "cooking") {
    const bonusPercent = Math.round((getCookingEffectMultiplier() - 1) * 100);
    return "+" + bonusPercent + "% Koch-Effekt";
  }

  return "";
}

function groupInventory(items) {
  const groupedMap = {};

  items.forEach(function(item) {
    const key = item.name + "|" + item.rarity;

    if (!groupedMap[key]) {
      groupedMap[key] = {
        name: item.name,
        rarity: item.rarity,
        count: 0
      };
    }

    groupedMap[key].count += 1;
  });

  return Object.values(groupedMap);
}

function tileKey(x, y) {
  return x + "," + y;
}

function getStatLabel(stat) {
  if (stat === "attack") {
    return "Angriff";
  }

  if (stat === "defense") {
    return "Verteidigung";
  }

  if (stat === "speed") {
    return "Tempo";
  }

  if (stat === "critChance") {
    return "Crit-Chance";
  }

  return stat;
}

function getRarityLabel(rarity) {
  if (rarity === "common") {
    return "gewöhnlich";
  }

  if (rarity === "uncommon") {
    return "ungewöhnlich";
  }

  if (rarity === "rare") {
    return "selten";
  }

  if (rarity === "epic") {
    return "episch";
  }

  if (rarity === "legendary") {
    return "legendär";
  }

  return rarity;
}

function createTextures(scene) {
  if (scene.textures.exists("player-chef")) {
    return;
  }

  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

  createPlayerTexture(graphics);
  createIngredientTextures(graphics);
  createEnemyTextures(graphics);
  createBossTextures(graphics);
  createProjectileTextures(graphics);
  createCookingStationTexture(graphics);

  graphics.destroy();
}

function createPlayerTexture(graphics) {
  graphics.clear();
  graphics.fillStyle(0xf8e16c, 1);
  graphics.fillRect(11, 15, 10, 10);
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(9, 9, 14, 6);
  graphics.fillRect(11, 5, 10, 5);
  graphics.fillStyle(0x333333, 1);
  graphics.fillRect(13, 18, 2, 2);
  graphics.fillRect(17, 18, 2, 2);
  graphics.fillStyle(0x8b5e3c, 1);
  graphics.fillRect(10, 25, 5, 4);
  graphics.fillRect(17, 25, 5, 4);
  graphics.generateTexture("player-chef", 32, 32);
}

function createIngredientTextures(graphics) {
  graphics.clear();
  graphics.fillStyle(0xf5deb3, 1);
  graphics.fillRect(13, 15, 6, 10);
  graphics.fillStyle(0xc2410c, 1);
  graphics.fillEllipse(16, 13, 20, 12);
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(11, 12, 1.5);
  graphics.fillCircle(16, 10, 1.5);
  graphics.fillCircle(20, 13, 1.5);
  graphics.generateTexture("ingredient-pilz", 32, 32);

  graphics.clear();
  graphics.fillStyle(0x14532d, 1);
  graphics.fillRect(15, 15, 2, 10);
  graphics.fillStyle(0x22c55e, 1);
  graphics.fillEllipse(12, 15, 8, 14);
  graphics.fillEllipse(20, 15, 8, 14);
  graphics.fillEllipse(16, 10, 8, 14);
  graphics.generateTexture("ingredient-kraut", 32, 32);

  graphics.clear();
  graphics.fillStyle(0xf5deb3, 1);
  graphics.fillEllipse(16, 18, 15, 18);
  graphics.fillStyle(0xd97706, 1);
  graphics.fillEllipse(16, 12, 12, 7);
  graphics.fillStyle(0x78350f, 1);
  graphics.fillRect(15, 6, 2, 5);
  graphics.generateTexture("ingredient-zwiebel", 32, 32);

  graphics.clear();
  graphics.fillStyle(0xb45309, 1);
  graphics.fillEllipse(16, 17, 20, 14);
  graphics.fillStyle(0x78350f, 1);
  graphics.fillCircle(11, 15, 1.5);
  graphics.fillCircle(18, 19, 1.5);
  graphics.fillCircle(22, 15, 1.5);
  graphics.generateTexture("ingredient-kartoffel", 32, 32);

  graphics.clear();
  graphics.fillStyle(0xfacc15, 1);
  graphics.fillRect(10, 12, 12, 14);
  graphics.fillStyle(0xf97316, 1);
  graphics.fillRect(9, 10, 14, 4);
  graphics.fillStyle(0xfffbeb, 1);
  graphics.fillRect(13, 16, 6, 5);
  graphics.generateTexture("ingredient-honig", 32, 32);

  graphics.clear();
  graphics.fillStyle(0x60a5fa, 1);
  graphics.fillEllipse(15, 17, 20, 10);
  graphics.fillStyle(0x1d4ed8, 1);
  graphics.fillTriangle(24, 17, 30, 12, 30, 22);
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(9, 16, 1.5);
  graphics.generateTexture("ingredient-fisch", 32, 32);

  graphics.clear();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(11, 10, 10, 17);
  graphics.fillStyle(0x93c5fd, 1);
  graphics.fillRect(13, 6, 6, 5);
  graphics.fillRect(13, 17, 6, 5);
  graphics.generateTexture("ingredient-milch", 32, 32);

  graphics.clear();
  graphics.fillStyle(0x14532d, 1);
  graphics.fillRect(15, 7, 2, 6);
  graphics.fillStyle(0x22c55e, 1);
  graphics.fillEllipse(19, 8, 6, 4);
  graphics.fillStyle(0xf97316, 1);
  graphics.fillCircle(12, 18, 4);
  graphics.fillCircle(20, 18, 4);
  graphics.fillCircle(16, 13, 4);
  graphics.fillStyle(0xffedd5, 1);
  graphics.fillCircle(11, 17, 1);
  graphics.fillCircle(19, 17, 1);
  graphics.fillCircle(15, 12, 1);
  graphics.generateTexture("ingredient-feuerbeere", 32, 32);

  graphics.clear();
  graphics.fillStyle(0x991b1b, 1);
  graphics.fillRect(9, 11, 15, 14);
  graphics.fillStyle(0xfca5a5, 1);
  graphics.fillRect(13, 14, 7, 7);
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(22, 9, 4, 4);
  graphics.generateTexture("ingredient-fleisch", 32, 32);

  graphics.clear();
  graphics.fillStyle(0x93c5fd, 1);
  graphics.fillTriangle(16, 5, 7, 25, 25, 25);
  graphics.fillStyle(0xffffff, 1);
  graphics.fillTriangle(16, 8, 12, 20, 20, 20);
  graphics.generateTexture("ingredient-kristallsalz", 32, 32);

  graphics.clear();
  graphics.fillStyle(0xfacc15, 1);
  graphics.fillCircle(16, 17, 9);
  graphics.fillStyle(0xf97316, 1);
  graphics.fillCircle(19, 20, 3);
  graphics.fillStyle(0x14532d, 1);
  graphics.fillEllipse(19, 8, 8, 4);
  graphics.generateTexture("ingredient-goldapfel", 32, 32);

  graphics.clear();
  graphics.fillStyle(0xa855f7, 1);
  graphics.fillEllipse(16, 17, 10, 20);
  graphics.fillStyle(0xfacc15, 1);
  graphics.fillCircle(16, 8, 2);
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(14, 16, 1.5);
  graphics.fillCircle(18, 16, 1.5);
  graphics.generateTexture("ingredient-geisterpfeffer", 32, 32);

  graphics.clear();
  graphics.fillStyle(0xef4444, 1);
  graphics.fillTriangle(16, 5, 7, 25, 25, 25);
  graphics.fillStyle(0xf97316, 1);
  graphics.fillTriangle(16, 10, 11, 23, 21, 23);
  graphics.fillStyle(0xfef3c7, 1);
  graphics.fillCircle(16, 22, 2);
  graphics.generateTexture("ingredient-drachenchili", 32, 32);

  graphics.clear();
  graphics.fillStyle(0x111827, 1);
  graphics.fillCircle(16, 17, 10);
  graphics.fillStyle(0xa855f7, 1);
  graphics.fillEllipse(18, 9, 10, 5);
  graphics.fillStyle(0xe5e7eb, 1);
  graphics.fillRect(13, 15, 6, 10);
  graphics.generateTexture("ingredient-schattenknoblauch", 32, 32);

  graphics.clear();
  graphics.fillStyle(0x7f1d1d, 1);
  graphics.fillRect(8, 10, 18, 16);
  graphics.fillStyle(0xf97316, 1);
  graphics.fillRect(12, 14, 10, 8);
  graphics.fillStyle(0xfacc15, 1);
  graphics.fillCircle(24, 9, 3);
  graphics.generateTexture("ingredient-bossfleisch", 32, 32);
}

function createEnemyTextures(graphics) {
  graphics.clear();
  graphics.fillStyle(0x84cc16, 1);
  graphics.fillEllipse(16, 18, 24, 16);
  graphics.fillStyle(0x4d7c0f, 1);
  graphics.fillEllipse(16, 21, 18, 8);
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(11, 15, 2);
  graphics.fillCircle(21, 15, 2);
  graphics.fillStyle(0x111827, 1);
  graphics.fillCircle(11, 15, 1);
  graphics.fillCircle(21, 15, 1);
  graphics.generateTexture("enemy-schleim", 32, 32);

  graphics.clear();
  graphics.fillStyle(0x8b5e3c, 1);
  graphics.fillEllipse(16, 18, 22, 14);
  graphics.fillStyle(0x5c4033, 1);
  graphics.fillTriangle(8, 12, 10, 5, 13, 13);
  graphics.fillTriangle(24, 12, 22, 5, 19, 13);
  graphics.fillStyle(0xffedd5, 1);
  graphics.fillCircle(11, 17, 2);
  graphics.fillCircle(21, 17, 2);
  graphics.fillStyle(0x111827, 1);
  graphics.fillCircle(11, 17, 1);
  graphics.fillCircle(21, 17, 1);
  graphics.generateTexture("enemy-ratte", 32, 32);

  graphics.clear();
  graphics.fillStyle(0x7f1d1d, 1);
  graphics.fillEllipse(16, 18, 22, 16);
  graphics.fillStyle(0xf97316, 1);
  graphics.fillEllipse(16, 14, 16, 10);
  graphics.fillStyle(0xffedd5, 1);
  graphics.fillCircle(11, 17, 2);
  graphics.fillCircle(21, 17, 2);
  graphics.fillStyle(0x111827, 1);
  graphics.fillCircle(11, 17, 1);
  graphics.fillCircle(21, 17, 1);
  graphics.generateTexture("enemy-feuerkaefer", 32, 32);

  graphics.clear();
  graphics.fillStyle(0xe5e7eb, 1);
  graphics.fillRect(10, 9, 12, 18);
  graphics.fillStyle(0x374151, 1);
  graphics.fillRect(8, 7, 16, 6);
  graphics.fillStyle(0x111827, 1);
  graphics.fillCircle(13, 17, 1.5);
  graphics.fillCircle(19, 17, 1.5);
  graphics.fillStyle(0xef4444, 1);
  graphics.fillRect(14, 23, 4, 2);
  graphics.generateTexture("enemy-knochenkoch", 32, 32);

  graphics.clear();
  graphics.fillStyle(0xa855f7, 1);
  graphics.fillEllipse(16, 17, 20, 22);
  graphics.fillStyle(0x581c87, 1);
  graphics.fillEllipse(16, 22, 14, 9);
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(12, 14, 2);
  graphics.fillCircle(20, 14, 2);
  graphics.fillStyle(0xfacc15, 1);
  graphics.fillCircle(16, 9, 3);
  graphics.generateTexture("enemy-gewuerzgeist", 32, 32);

  graphics.clear();
  graphics.fillStyle(0x94a3b8, 1);
  graphics.fillRect(11, 9, 10, 18);
  graphics.fillStyle(0x7c2d12, 1);
  graphics.fillRect(20, 11, 3, 16);
  graphics.lineStyle(2, 0xf5deb3, 1);
  graphics.strokeCircle(23, 18, 8);
  graphics.fillStyle(0x111827, 1);
  graphics.fillCircle(14, 16, 1.5);
  graphics.fillCircle(18, 16, 1.5);
  graphics.generateTexture("enemy-bogenschuetze", 32, 32);

  graphics.clear();
  graphics.fillStyle(0x7f1d1d, 1);
  graphics.fillRect(10, 9, 12, 18);
  graphics.fillStyle(0xef4444, 1);
  graphics.fillTriangle(16, 4, 7, 14, 25, 14);
  graphics.fillStyle(0xfacc15, 1);
  graphics.fillCircle(16, 18, 4);
  graphics.generateTexture("enemy-feuermagier", 32, 32);

  graphics.clear();
  graphics.fillStyle(0x16a34a, 1);
  graphics.fillRect(9, 10, 14, 17);
  graphics.fillStyle(0x581c87, 1);
  graphics.fillCircle(16, 13, 6);
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(13, 17, 1.5);
  graphics.fillCircle(19, 17, 1.5);
  graphics.generateTexture("enemy-giftkoch", 32, 32);
}

function createBossTextures(graphics) {
  graphics.clear();
  graphics.fillStyle(0xdc2626, 1);
  graphics.fillEllipse(16, 17, 28, 24);
  graphics.fillStyle(0xf97316, 1);
  graphics.fillTriangle(6, 8, 2, 2, 12, 10);
  graphics.fillTriangle(26, 8, 30, 2, 20, 10);
  graphics.fillStyle(0xfef3c7, 1);
  graphics.fillCircle(11, 16, 2);
  graphics.fillCircle(21, 16, 2);
  graphics.generateTexture("boss-chilidrache", 32, 32);

  graphics.clear();
  graphics.fillStyle(0x111827, 1);
  graphics.fillRect(7, 7, 18, 21);
  graphics.fillStyle(0x7f1d1d, 1);
  graphics.fillRect(11, 12, 10, 13);
  graphics.fillStyle(0xe5e7eb, 1);
  graphics.fillCircle(12, 15, 2);
  graphics.fillCircle(20, 15, 2);
  graphics.generateTexture("boss-schattenmetzger", 32, 32);

  graphics.clear();
  graphics.fillStyle(0xfacc15, 1);
  graphics.fillEllipse(16, 18, 28, 18);
  graphics.fillStyle(0x92400e, 1);
  graphics.fillTriangle(6, 12, 2, 6, 10, 13);
  graphics.fillTriangle(26, 12, 30, 6, 22, 13);
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(10, 17, 2);
  graphics.fillCircle(22, 17, 2);
  graphics.generateTexture("boss-goldener-eber", 32, 32);

  graphics.clear();
  graphics.fillStyle(0xa855f7, 1);
  graphics.fillEllipse(16, 18, 26, 24);
  graphics.fillStyle(0xef4444, 1);
  graphics.fillTriangle(16, 3, 7, 13, 25, 13);
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(11, 16, 2);
  graphics.fillCircle(21, 16, 2);
  graphics.generateTexture("boss-pfefferhexe", 32, 32);
}

function createProjectileTextures(graphics) {
  graphics.clear();
  graphics.fillStyle(0xf5deb3, 1);
  graphics.fillRect(4, 14, 20, 4);
  graphics.fillStyle(0x7c2d12, 1);
  graphics.fillTriangle(24, 9, 31, 16, 24, 23);
  graphics.fillStyle(0xffffff, 1);
  graphics.fillTriangle(4, 14, 0, 10, 0, 18);
  graphics.generateTexture("projectile-arrow", 32, 32);

  graphics.clear();
  graphics.fillStyle(0xf97316, 1);
  graphics.fillCircle(18, 16, 8);
  graphics.fillStyle(0xfacc15, 1);
  graphics.fillCircle(20, 15, 4);
  graphics.fillStyle(0xef4444, 1);
  graphics.fillTriangle(5, 16, 16, 7, 16, 25);
  graphics.generateTexture("projectile-fireball", 32, 32);
}

function createCookingStationTexture(graphics) {
  graphics.clear();
  graphics.fillStyle(0x6b7280, 1);
  graphics.fillRect(4, 8, 24, 18);
  graphics.fillStyle(0x1f2937, 1);
  graphics.fillRect(8, 12, 16, 10);
  graphics.fillStyle(0xf97316, 1);
  graphics.fillTriangle(12, 26, 16, 18, 20, 26);
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(10, 10, 2);
  graphics.fillCircle(22, 10, 2);
  graphics.generateTexture("cooking-station", 32, 32);
}