const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const tileSize = 50;
let scrollX = 0;

// マップ：0=空, 1=地面, 2=ブロック
const map = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,2,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,3,3,3,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,2,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,0,0,0,1,0,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,1,0,0,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const originalMap = JSON.parse(JSON.stringify(map));

const TILE = {
  EMPTY: 0,
  GROUND: 1,
  BLOCK: 2,
  QUESTION: 3,
  USED: 4
};

const blockData = {
  "5,4": { item: "mushroom" },
  "6,4": { item: "mushroom" },
  "7,4": { item: "mushroom" }
};

const mushrooms = [];

function spawnMushroom(x, y) {
  mushrooms.push({
    x: x * tileSize,
    y: canvas.height - (map.length - y) * tileSize - 40,
    vx: 2,
    vy: 0
  });
}


function updateMushrooms() {

  for (let m of mushrooms) {

    // 横移動
    m.x += m.vx;

    // 重力
    m.vy += 0.5;
    m.y += m.vy;

    const tileX = Math.floor((m.x + 15) / tileSize);
    const tileY = Math.floor((canvas.height - (m.y + 30)) / tileSize);

    if (map[tileY] && map[tileY][tileX] !== TILE.EMPTY) {

      const ty = canvas.height - (map.length - tileY) * tileSize;

      if (m.y + 30 > ty) {
        m.y = ty - 30;
        m.vy = 0;
      }

    }

  }

}

function drawMushrooms() {
  ctx.fillStyle = "pink";
  for (let m of mushrooms) {
    ctx.fillRect(m.x - scrollX, m.y, 30, 30);
  }
}

// プレイヤー
const player = {
  x: 100,
  y: 0,
  width: 25,
  height: 40,
  vx: 0,
  vy: 0,
  speed: 5,
  onBlock: false
};



// キー入力
const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// 矩形衝突判定
function checkCollision(px, py, pw, ph, tx, ty, tw, th) {
  return px < tx + tw &&
         px + pw > tx &&
         py < ty + th &&
         py + ph > ty;
}

// マップ描画（スクロール対応）
function drawMap() {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {

      const tile = map[y][x];
      if (tile === TILE.EMPTY) continue;

      let color = "green";

      if (tile === TILE.GROUND) color = "green";
      if (tile === TILE.BLOCK) color = "brown";
      if (tile === TILE.QUESTION) color = "orange";
      if (tile === TILE.USED) color = "gray";

      ctx.fillStyle = color;

      ctx.fillRect(
        Math.floor(x * tileSize - scrollX),
        canvas.height - (map.length - y) * tileSize,
        tileSize,
        tileSize
      );
    }
  }
}

// プレイヤー描画
function drawPlayer() {
  ctx.fillStyle = "red";
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function handleHorizontalCollisions() {

  const tileX = Math.floor((player.x + scrollX) / tileSize);
  const tileY = Math.floor((canvas.height - player.y) / tileSize);

  for (let y = tileY - 1; y <= tileY + 1; y++) {
    for (let x = tileX - 1; x <= tileX + 1; x++) {

      if (!map[y]) continue;
      if (map[y][x] === TILE.EMPTY) continue;

      const tx = x * tileSize - scrollX;
      const ty = canvas.height - (map.length - y) * tileSize;

      if (checkCollision(player.x, player.y, player.width, player.height, tx, ty, tileSize, tileSize)) {

        if (player.vx > 0) {
          player.x = tx - player.width;
        }

        if (player.vx < 0) {
          player.x = tx + tileSize;
        }

      }

    }
  }

}
// 横方向の衝突処理
function handleVerticalCollisions() {
  player.onBlock = false;

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {

      const tile = map[y][x];
      if (tile === TILE.EMPTY) continue;

      const tx = x * tileSize - scrollX;
      const ty = canvas.height - (map.length - y) * tileSize;

      if (checkCollision(player.x, player.y, player.width, player.height, tx, ty, tileSize, tileSize)) {

        if (player.vy > 0) { // 下から着地
          player.y = ty - player.height;
          player.vy = 0;
          player.onBlock = true;
        }

        else if (player.vy < 0) { // 上にジャンプしてぶつかった
          player.y = ty + tileSize;
          player.vy = 0;

          if (tile === TILE.QUESTION) {

            const key = x + "," + y;
            const data = blockData[key];

            if (data && data.item === "mushroom") {
              spawnMushroom(x, y);
            }

            map[y][x] = TILE.USED;
          }

        }

      }
    }
  }
}

var life = 5

function drawLife() {
  ctx.fillStyle = "black";
  ctx.font = "30px Arial";
  ctx.fillText("Life: " + life, 20, 40);
}


// プレイヤー更新
function updatePlayer() {

  // 横移動入力
  player.vx = 0;
  if (keys["ArrowRight"]) player.vx = player.speed;
  if (keys["ArrowLeft"])  player.vx = -player.speed;

  // 横移動
  player.x += player.vx;
  handleHorizontalCollisions();

  // 重力
  player.vy += 0.5;
  player.y += player.vy;

  // 縦衝突
  handleVerticalCollisions();

  // ジャンプ
  if ((keys[" "] || keys["ArrowUp"]) && player.onBlock) {
    player.vy = -15;
  }

  const rightEdge = canvas.width * 0.4;
  const leftEdge = canvas.width * 0.32;

  // 右スクロール
  if (player.x > rightEdge) {
    scrollX += player.x - rightEdge;
    player.x = rightEdge;
  }

  // 左スクロール
  if (player.x < leftEdge && scrollX > 0) {
    scrollX -= leftEdge - player.x;
    player.x = leftEdge;
    if (scrollX < 0) scrollX = 0;
  }
  for (let i = mushrooms.length - 1; i >= 0; i--) {

  const m = mushrooms[i];

  if (checkCollision(
    player.x, player.y, player.width, player.height,
    m.x - scrollX, m.y, 30, 30
  )) {

    mushrooms.splice(i,1);
    console.log("mushrooms.took");
    console.log("player.getMushrooms")

    }
  }
}

function resetAll() {

  player.x = 100;
  player.y = 0;
  player.vx = 0;
  player.vy = 0;
  mushrooms.length = 0
  scrollX = 0;

  // マップを元に戻す
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      map[y][x] = originalMap[y][x];
    }
    
  }
  
console.log("all.reset")

}



function gameLoop() {
  if (life < 1) {

    ctx.fillStyle = "black";
    ctx.font = "80px Arial";
    ctx.fillText("GAME OVER", canvas.width/2 - 200, canvas.height/2);

    return; // ゲーム停止

  }
  ctx.clearRect(0,0,canvas.width,canvas.height);

  updatePlayer();
  drawMap();
  drawPlayer();

  updateMushrooms()
  drawMushrooms()
  requestAnimationFrame(gameLoop);
  drawLife();

  const deathLine = canvas.height + 100;

  if (player.y > deathLine) {
    life--;
    console.log("player.died")
    resetAll();
  }
  for (let i = mushrooms.length - 1; i >= 0; i--) {
  if (mushrooms[i].y > deathLine) {
    mushrooms.splice(i, 1);
  }
}
}

gameLoop();
