const gridSize = 6;
let grid = [];
let selectedUnit = null;

class Unit {
  constructor(name, x, y, isEnemy = false) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.hp = 10;
    this.attack = 3;
    this.defense = 1;
    this.isEnemy = isEnemy;

    // tracking
    this.damageDealt = 0;
    this.damageTaken = 0;
    this.moves = 0;
    this.trait = null;
  }
}

let playerUnits = [
  new Unit("Knight", 0, 0),
  new Unit("Swordsman", 1, 0)
];

let enemies = [
  new Unit("Goblin", 4, 4, true),
  new Unit("Goblin", 5, 5, true)
];

// 🧱 Generate Grid
function generateGrid() {
  grid = [];

  for (let y = 0; y < gridSize; y++) {
    let row = [];
    for (let x = 0; x < gridSize; x++) {
      let rand = Math.random();
      let type = "plain";

      if (rand < 0.2) type = "high";
      else if (rand < 0.3) type = "hazard";

      row.push({ x, y, type });
    }
    grid.push(row);
  }
}

// 🎮 Render
function render() {
  const gridDiv = document.getElementById("grid");
  gridDiv.innerHTML = "";

  grid.flat().forEach(tile => {
    const div = document.createElement("div");
    div.classList.add("tile", tile.type);

    let unit = getUnitAt(tile.x, tile.y);
    if (unit) {
      div.textContent = unit.name[0];
      div.classList.add(unit.isEnemy ? "enemy" : "player");
    }

    div.onclick = () => handleClick(tile.x, tile.y);
    gridDiv.appendChild(div);
  });
}

// 🔍 Get unit
function getUnitAt(x, y) {
  return [...playerUnits, ...enemies].find(u => u.x === x && u.y === y);
}

// 🖱️ Click Logic
function handleClick(x, y) {
  let unit = getUnitAt(x, y);

  if (unit && !unit.isEnemy) {
    selectedUnit = unit;
    updateStatus("Selected " + unit.name);
    return;
  }

  if (selectedUnit) {
    let target = getUnitAt(x, y);

    if (target && target.isEnemy) {
      attack(selectedUnit, target);
      enemyTurn();
    } else {
      selectedUnit.x = x;
      selectedUnit.y = y;
      selectedUnit.moves++;
      enemyTurn();
    }

    selectedUnit = null;
    render();
  }
}

// ⚔️ Combat
function attack(attacker, defender) {
  let damage = Math.max(1, attacker.attack - defender.defense);

  defender.hp -= damage;
  attacker.damageDealt += damage;
  defender.damageTaken += damage;

  if (defender.hp <= 0) {
    if (defender.isEnemy) {
      enemies = enemies.filter(e => e !== defender);
    } else {
      playerUnits = playerUnits.filter(p => p !== defender);
    }
  }

  evolve(attacker);
}

// 🧬 Evolution
function evolve(unit) {
  if (unit.trait) return;

  if (unit.damageDealt > 10) {
    unit.trait = "Aggressive";
    unit.attack += 1;
  } else if (unit.damageTaken > 10) {
    unit.trait = "Defensive";
    unit.defense += 1;
  } else if (unit.moves > 10) {
    unit.trait = "Tactical";
  }
}

// 🤖 Enemy AI
function enemyTurn() {
  enemies.forEach(enemy => {
    let target = playerUnits[0];
    if (!target) return;

    let dx = Math.sign(target.x - enemy.x);
    let dy = Math.sign(target.y - enemy.y);

    enemy.x += dx;
    enemy.y += dy;

    if (enemy.x === target.x && enemy.y === target.y) {
      attack(enemy, target);
    }
  });

  checkGameState();
}

// 🏁 Game State
function checkGameState() {
  if (playerUnits.length === 0) {
    updateStatus("You lost your territory.");
  }

  if (enemies.length === 0) {
    updateStatus("Victory!");
  }
}

function updateStatus(msg) {
  document.getElementById("status").textContent = msg;
}

// 🚀 Start
generateGrid();
render();
