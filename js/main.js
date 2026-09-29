const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

window.activeEnemies = [];

window.ram_0x071A = 0;
window.STAGE_MIDWAY_BORDER = 0x06;
window.MIDWAY_START_PAGE = 0x06;

window.INITIAL_PLAYER_X = 41;
window.INITIAL_PLAYER_Y = 192;
if (typeof player !== 'undefined') player.stompCombo = 0;

const tileSprites = {
    1: new Image(),
    2: new Image(),
    21: new Image(),
    22: new Image(),
    23: new Image(),
    222: new Image(),
    3: new Image(),
    32: new Image(),
    33: new Image(),
    4: new Image(),
    5: new Image(),
    6: new Image(),
    7: new Image(),
    8: new Image(),
    9: new Image(),
    10: new Image(),
    55: new Image(),
    56: new Image(),
    30: new Image(),
    301: new Image(),
    302: new Image(),
    155: new Image(),
    156: new Image(),
    101: new Image(),
    102: new Image(),
    103: new Image(),
    104: new Image(),
    105: new Image(),
    106: new Image(),

    81: new Image(),
    82: new Image(),
    83: new Image(),
    84: new Image(),
    85: new Image(),
    86: new Image()
};

const bgSprites = {
    11: new Image(),
    12: new Image(),
    13: new Image(),
    21: new Image(),
    22: new Image(),
    23: new Image(),
    24: new Image(),
    25: new Image(),
    26: new Image(),
    31: new Image(),
    32: new Image(),
    33: new Image(),

    311: new Image(),
    321: new Image(),
    331: new Image()
};

const coinSprites = [
    new Image(),
    new Image(),
    new Image(),
    new Image()
];

let totalImages = Object.keys(tileSprites).length + Object.keys(bgSprites).length + coinSprites.length;
let loadedImages = 0;
let isGameStarted = false;

function loadStageSprites(isUnderground) {
    const tilePath = isUnderground ? 'sprite/tileset/underground/' : 'sprite/tileset/';
    const itemPath = isUnderground ? 'sprite/items/underground/'   : 'sprite/items/';

    tileSprites[1].src  = tilePath + 'ground.png';
    tileSprites[2].src  = tilePath + 'brick.png';
    tileSprites[21].src  = tilePath + 'brick.png';
    tileSprites[22].src = tilePath + 'brick2.png';
    tileSprites[23].src = tilePath + 'brick.png';
    tileSprites[222].src = tilePath + 'brick2.png';
    tileSprites[3].src  = tilePath + 'question1.png';
    tileSprites[32].src = tilePath + 'question2.png';
    tileSprites[33].src = tilePath + 'question3.png';
    tileSprites[4].src  = tilePath + 'hard.png';
    tileSprites[5].src  = tilePath + 'claypipe_upperleft.png';
    tileSprites[6].src  = tilePath + 'claypipe_upperright.png';
    tileSprites[7].src  = tilePath + 'claypipe_lowerleft.png';
    tileSprites[8].src  = tilePath + 'claypipe_lowerright.png';
    tileSprites[9].src  = tilePath + 'empty.png';
    tileSprites[10].src = tilePath + 'question1.png';
    tileSprites[55].src = tilePath + 'claypipe_upperleft.png';
    tileSprites[56].src = tilePath + 'claypipe_upperright.png';
    tileSprites[30].src = itemPath + 'coin1.png';
    tileSprites[301].src = itemPath + 'coin2.png';
    tileSprites[302].src = itemPath + 'coin3.png';
    tileSprites[155].src = tilePath + 'claypipe_upperleft.png';
    tileSprites[156].src = tilePath + 'claypipe_upperright.png';
    tileSprites[101].src = tilePath + 'rootpipe_bottom.png';
    tileSprites[102].src = tilePath + 'rootpipe_top.png';
    tileSprites[103].src = tilePath + 'besidepipe_lowerright.png';
    tileSprites[104].src = tilePath + 'besidepipe_lowerleft.png';
    tileSprites[105].src = tilePath + 'besidepipe_upperright.png';
    tileSprites[106].src = tilePath + 'besidepipe_upperleft.png';

    tileSprites[81].src = 'sprite/tileset/castle_brick1.png';
    tileSprites[82].src = 'sprite/tileset/castle_brick2.png';
    tileSprites[83].src = 'sprite/tileset/castle_brick3.png';
    tileSprites[84].src = 'sprite/tileset/castle_brick4.png';
    tileSprites[85].src = 'sprite/tileset/castle_brick5.png';
    tileSprites[86].src = 'sprite/tileset/black.png';

    bgSprites[11].src  = 'sprite/tileset/bottomcloud_left.png';
    bgSprites[12].src  = 'sprite/tileset/bottomcloud_center.png';
    bgSprites[13].src  = 'sprite/tileset/bottomcloud_right.png';
    bgSprites[21].src  = 'sprite/tileset/mountain_left.png';
    bgSprites[22].src  = 'sprite/tileset/mountain_center.png';
    bgSprites[23].src  = 'sprite/tileset/mountain_right.png';
    bgSprites[24].src  = 'sprite/tileset/mountain_pattern_left.png';
    bgSprites[25].src  = 'sprite/tileset/mountain_pattern_right.png';
    bgSprites[26].src  = 'sprite/tileset/mountain_top.png';
    bgSprites[31].src  = 'sprite/tileset/grass_left.png';
    bgSprites[32].src  = 'sprite/tileset/grass_center.png';
    bgSprites[33].src  = 'sprite/tileset/grass_right.png';
    bgSprites[311].src = 'sprite/tileset/grass_left_green.png';
    bgSprites[321].src = 'sprite/tileset/grass_center_green.png';
    bgSprites[331].src = 'sprite/tileset/grass_right_green.png';

    if (isUnderground) {
        coinSprites[0].src = itemPath + 'coin1.png';
        coinSprites[1].src = itemPath + 'coin2.png';
        coinSprites[2].src = itemPath + 'coin3.png';
        coinSprites[3].src = itemPath + 'coin2.png';
    } else {
        coinSprites[0].src = itemPath + 'coin_animation1.png';
        coinSprites[1].src = itemPath + 'coin_animation2.png';
        coinSprites[2].src = itemPath + 'coin_animation3.png';
        coinSprites[3].src = itemPath + 'coin_animation4.png';
    }

    `);
}

loadStageSprites(false);

function onImageLoad() {
    loadedImages++;
    if (loadedImages === totalImages && !isGameStarted) {
        isGameStarted = true;
        initEnemiesFromMap();
        gameLoop();
    }
}

Object.values(tileSprites).forEach(img => img.onload = onImageLoad);
Object.values(bgSprites).forEach(img => img.onload = onImageLoad);
coinSprites.forEach(img => img.onload = onImageLoad);

let lastCheckedSpawnCol = -1;

function initEnemiesFromMap() {
    activeEnemies.length = 0;

    if (typeof lastSpawnedKuriboCol !== 'undefined') lastSpawnedKuriboCol = -1;

    const initialCols = Math.ceil(canvas.width / TILE_SIZE);

    for (let row = 0; row < MAP_HEIGHT; row++) {
        for (let col = 0; col < initialCols; col++) {
            if (tileMap[row][col] === 50) {
                if (typeof spawnKuribo === 'function') { spawnKuribo(col * TILE_SIZE, row * TILE_SIZE, col); }
                tileMap[row][col] = 0;
            }
            if (tileMap[row][col] === 60) {
                if (typeof spawnNokonoko === 'function') { spawnNokonoko(col * TILE_SIZE, row * TILE_SIZE, 'green'); }
                tileMap[row][col] = 0;
            }
            if (tileMap[row][col] === 61) {
                if (typeof spawnNokonoko === 'function') { spawnNokonoko(col * TILE_SIZE, row * TILE_SIZE, 'red'); }
                tileMap[row][col] = 0;
            }
        }
    }
    lastCheckedSpawnCol = initialCols - 1;
}

function checkScrollEnemySpawning() {
    if (typeof cameraX === 'undefined') return;

    const bufferX = cameraX + canvas.width + 32;
    const currentRightCol = Math.floor(bufferX / TILE_SIZE);

    if (currentRightCol > lastCheckedSpawnCol) {
        for (let col = lastCheckedSpawnCol + 1; col <= currentRightCol; col++) {
            if (col >= MAP_WIDTH) break;

            for (let row = 0; row < MAP_HEIGHT; row++) {
                if (!tileMap[row] || tileMap[row][col] === undefined) continue;

                if (tileMap[row][col] === 50) {
                    if (typeof spawnKuribo === 'function') { spawnKuribo(col * TILE_SIZE, row * TILE_SIZE, col); }
                    tileMap[row][col] = 0;
                }
                if (tileMap[row][col] === 60) {
                    if (typeof spawnNokonoko === 'function') { spawnNokonoko(col * TILE_SIZE, row * TILE_SIZE, 'green'); }
                    tileMap[row][col] = 0;
                }
                if (tileMap[row][col] === 61) {
                    if (typeof spawnNokonoko === 'function') { spawnNokonoko(col * TILE_SIZE, row * TILE_SIZE, 'red'); }
                    tileMap[row][col] = 0;
                }
            }
        }
        lastCheckedSpawnCol = currentRightCol;
    }
}

function checkPlayerEnemyCollisions() {
    if (typeof player === 'undefined' || !activeEnemies) return;

    if (!player.isInvincible && player.invincibleTimer !== undefined && player.invincibleTimer > 0) return;

    for (let i = 0; i < activeEnemies.length; i++) {
        const enemy = activeEnemies[i];

        if (enemy.enemyState === 0x04) continue;

        if (enemy.type === 'kuribo' && enemy.enemyState === 0x02) continue;

        const currentHeight = (enemy.type === 'nokonoko' && (enemy.enemyState === 0x02 || enemy.enemyState === 0x03)) ? 16 : enemy.height;
        const currentY = (enemy.type === 'nokonoko' && (enemy.enemyState === 0x02 || enemy.enemyState === 0x03)) ? (enemy.y + 8) : enemy.y;

        const isOverlapping =
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < currentY + currentHeight &&
            player.y + player.height > currentY;

        if (isOverlapping) {

            if (player.isInvincible) {

                enemy.enemyState = 0x04;
                enemy.height = 16;
                enemy.vy = -3.5;

                const playerCenterX = player.x + player.width / 2;
                const enemyCenterX = enemy.x + enemy.width / 2;
                enemy.vx = (playerCenterX < enemyCenterX) ? 1.0 : -1.0;

                if (typeof playSE === 'function') {
                    playSE('kickkill');
                }

                if (typeof addComboScore === 'function') {

                    const scoreGain = addComboScore(player.stompCombo);
                    if (scoreGain !== undefined) {
                        const displayScore = (scoreGain === -1) ? '1up' : scoreGain;
                        if (typeof spawnScoreEffect === 'function') {
                            spawnScoreEffect(enemy.x, enemy.y, displayScore);
                        }
                    }
                    player.stompCombo++;
                }

                continue;
            }

            const isStepping = (player.vy > 0) && (player.y + player.height - player.vy <= currentY + 6);
            const jumpPressed = keys.KeyX || keys.Space;

            if (enemy.type === 'nokonoko') {
                if (enemy.enemyState === 0x03) {

                    enemy.enemyState = 0x04;
                    enemy.vy = -3.5;
                    enemy.vx = (player.direction === 1) ? 1.5 : -1.5;

                    if (isStepping) {
                        player.vy = jumpPressed ? -5.0 : -4.0;
                        player.isGrounded = false;
                    }

                    if (typeof playSE === 'function') { playSE('kickkill'); }

                    continue;
                }

                if (enemy.enemyState === 0x02) {

                    enemy.enemyState = 0x03;
                    enemy.height = 16;
                    enemy.shellCombo = 0;

                    const playerCenterX = player.x + player.width / 2;
                    const enemyCenterX = enemy.x + enemy.width / 2;

                    if (isStepping) {
                        enemy.direction = (playerCenterX < enemyCenterX) ? 1 : -1;
                        player.vy = jumpPressed ? -5.0 : -4.0;
                        player.isGrounded = false;

                    } else {
                        enemy.direction = (player.direction === 1) ? 1 : -1;

                    }

                    enemy.vx = enemy.direction * 3.0;
                    if (typeof playSE === 'function') { playSE('kickkill'); }
                    continue;
                }

                if (enemy.enemyState === 0x00) {

                    if (isStepping) {
                        enemy.enemyState = 0x02;
                        enemy.height = 16;
                        enemy.y += 8;
                        enemy.reviveTimer = 255;

                        player.vy = jumpPressed ? -5.0 : -4.0;
                        player.isGrounded = false;

                        if (typeof playSE === 'function') { playSE('stompswim'); }

                        if (typeof addComboScore === 'function') {
                            const scoreGain = addComboScore(player.stompCombo);
                            if (scoreGain !== undefined) {
                                const displayScore = (scoreGain === -1) ? '1up' : scoreGain;
                                if (typeof spawnScoreEffect === 'function') spawnScoreEffect(enemy.x, enemy.y, displayScore);
                            }
                        }
                        player.stompCombo++;

                    } else {
                        if (typeof player.triggerDamage === 'function') {
                            player.triggerDamage();
                        }

                    }
                    continue;
                }
            }

            if (enemy.type === 'kuribo') {
                if (isStepping) {

                    if (typeof playSE === 'function') { playSE('stompswim'); }
                    player.vy = jumpPressed ? -5.0 : -4.0;
                    player.isGrounded = false;
                    enemy.enemyState = 0x02;
                    enemy.deadTimer = 0;

                    if (typeof addComboScore === 'function') {
                        const scoreGain = addComboScore(player.stompCombo);
                        if (scoreGain !== undefined) {
                            const displayScore = (scoreGain === -1) ? '1up' : scoreGain;
                            if (typeof spawnScoreEffect === 'function') spawnScoreEffect(enemy.x, enemy.y, displayScore);
                        }
                    }
                    player.stompCombo++;

                } else {

                    if (typeof player.triggerDamage === 'function') {
                        player.triggerDamage();
                    }

                }
            }
        }
    }
}

function updateEnemies(dtModifier) {
    if (!activeEnemies) return;

    for (let i = activeEnemies.length - 1; i >= 0; i--) {
        const enemy = activeEnemies[i];
        if (enemy.y > 270 || enemy.x < cameraX - 64 || enemy.x > cameraX + 320) {
            activeEnemies.splice(i, 1);
        }
    }

    activeEnemies.forEach(enemy => {
        if (enemy.type === 'kuribo') {
            updateKuriboLogic(enemy, dtModifier);
        } else if (enemy.type === 'nokonoko') {
            updateNokonokoLogic(enemy, dtModifier);
        }
    });

    for (let i = 0; i < activeEnemies.length; i++) {
        const enemy = activeEnemies[i];
        if (enemy.enemyState === 0x04) continue;

        for (let j = i + 1; j < activeEnemies.length; j++) {
            const other = activeEnemies[j];
            if (other.enemyState === 0x04) continue;

            const e1Height = (enemy.type === 'nokonoko' && (enemy.enemyState === 0x02 || enemy.enemyState === 0x03)) ? 16 : enemy.height;
            const e1Y      = (enemy.type === 'nokonoko' && (enemy.enemyState === 0x02 || enemy.enemyState === 0x03)) ? (enemy.y + 8) : enemy.y;

            const e2Height = (other.type === 'nokonoko' && (other.enemyState === 0x02 || other.enemyState === 0x03)) ? 16 : other.height;
            const e2Y      = (other.type === 'nokonoko' && (other.enemyState === 0x02 || other.enemyState === 0x03)) ? (other.y + 8) : other.y;

            const isColliding =
                enemy.x < other.x + other.width &&
                enemy.x + enemy.width > other.x &&
                e1Y < e2Y + e2Height &&
                e1Y + e1Height > e2Y;

            if (isColliding) {
                if (enemy.type === 'nokonoko' && enemy.enemyState === 0x03) {
                    if (other.enemyState === 0x00 || other.enemyState === 0x02) {
                        other.enemyState = 0x04;
                        other.vy = -3.5;
                        other.vx = (enemy.vx > 0) ? 1.0 : -1.0;

                        if (typeof playSE === 'function') { playSE('kickkill'); }
                        if (typeof addComboScore === 'function') {

                            const comboGain = addComboScore(enemy.shellCombo);
                            if (comboGain !== undefined) {
                                const displayScore = (comboGain === -1) ? '1up' : comboGain;
                                spawnScoreEffect(other.x, other.y, displayScore);
                            }
                        }
                        enemy.shellCombo++;

                    }
                    continue;
                }

                if (other.type === 'nokonoko' && other.enemyState === 0x03) {
                    if (enemy.enemyState === 0x00 || enemy.enemyState === 0x02) {
                        enemy.enemyState = 0x04;
                        enemy.vy = -3.5;
                        enemy.vx = (other.vx > 0) ? 1.0 : -1.0;

                        if (typeof playSE === 'function') { playSE('kickkill'); }

                    }
                    continue;
                }

                if (enemy.enemyState === 0x00 && other.enemyState === 0x00) {
                    if (enemy.x < other.x) {
                        enemy.x -= 1.0; other.x += 1.0;
                        enemy.vx = -Math.abs(enemy.vx);
                        other.vx = Math.abs(other.vx);
                    } else {
                        enemy.x += 1.0; other.x -= 1.0;
                        enemy.vx = Math.abs(enemy.vx);
                        other.vx = -Math.abs(other.vx);
                    }
                }
            }
        }
    }
}

function drawEnemies() {
    if (!activeEnemies) return;

    activeEnemies.forEach(enemy => {
        const screenX = Math.floor(enemy.x) - Math.floor(cameraX);
        const screenY = Math.floor(enemy.y);

        if (screenX < -TILE_SIZE || screenX > canvas.width) return;

        if (enemy.type === 'kuribo') {
            drawKuribo(enemy, screenX, screenY, globalFrameCounter);
        } else if (enemy.type === 'nokonoko') {
            drawNokonoko(enemy, screenX, screenY);
        }
    });
}

function respawnPlayer() {

    if (window.isTwoPlayerMode) {

        const currentData = (window.currentPlayerNumber === 1) ? window.player1Data : window.player2Data;

        currentData.lives = window.lives - 1;
        currentData.score = window.score;
        currentData.coins = window.coins;
        currentData.isSuper = player.isSuper;
        currentData.isFire = player.isFire;
        currentData.height = player.height;
        currentData.stage = window.stageName;

        let nextPlayerNumber = (window.currentPlayerNumber === 1) ? 2 : 1;
        let nextData = (nextPlayerNumber === 1) ? window.player1Data : window.player2Data;

        const isNextPlayerAlreadyCleared = (nextPlayerNumber === 1) ? window.isPlayer1Cleared : window.isPlayer2Cleared;

        if (isNextPlayerAlreadyCleared) {

            nextPlayerNumber = window.currentPlayerNumber;
            nextData = (nextPlayerNumber === 1) ? window.player1Data : window.player2Data;
        }

        if (nextData.lives <= 0) {
            nextPlayerNumber = window.currentPlayerNumber;
            nextData = (nextPlayerNumber === 1) ? window.player1Data : window.player2Data;
        }

        if (window.player1Data.lives <= 0 && window.player2Data.lives <= 0) {
            window.lives = 0;
        } else {

            window.currentPlayerNumber = nextPlayerNumber;
            player.characterType = (window.currentPlayerNumber === 1) ? 'mario' : 'luigi';

            window.lives = nextData.lives;
            window.score = nextData.score;
            window.coins = nextData.coins;
            player.isSuper = nextData.isSuper;
            player.isFire = nextData.isFire;
            player.height = nextData.height;
            window.stageName = nextData.stage;

        }
    } else {
        if (window.lives !== undefined) {
            window.lives--;
        }
    }

    if (window.lives !== undefined && window.lives <= 0) {
        window.lives = 0;

        if (typeof player !== 'undefined') {
            player.playerState = 0x08;
            player.vx = 0; player.vy = 0;
            player.x = window.INITIAL_PLAYER_X;
            player.y = window.INITIAL_PLAYER_Y;
            player.invincibleTimer = 0;
            player.deathTimer = 0;
            player.deathFrameBuffer = 0;
            player.deathJumpTriggered = false;

            if (typeof marioSprites !== 'undefined' && marioSprites.idle) {
                player.currentSprite = marioSprites.idle;
            }
        }

        window.score = 0;
        window.coins = 0;
        window.gameTime = 400;
        window.isUnderground = false;
        window.isTwoPlayerMode = false;

        if (typeof loadStageSprites === 'function') loadStageSprites(false);
        if (typeof stopAllBGM === 'function') stopAllBGM();

        if (typeof startGameOverScreen === 'function') {
            startGameOverScreen();
        }
        return;
    }

    if (typeof startMiddleScreen === 'function') {
        startMiddleScreen();
    }

    window.gameTime = 400;
    timeFrameCounter = 0;

    window.isHurryUpTriggered = false;
    if (sounds['hurryup']) sounds['hurryup'].onended = null;

    player.playerState = 0x08;
    player.vanished = false;
    player.goalReached = false;

    player.isPitDeath = false;
    player.vx = 0;
    player.vy = 0;
    player.direction = 1;

    if (typeof refreshPlayerSpriteFolders === 'function') {
        refreshPlayerSpriteFolders();
    }

    resetOverworldMapToDefault();

    window.isUnderground = false;
    if (typeof loadStageSprites === 'function') loadStageSprites(false);
    window.originalOverworldMapRef = null;

    let spawnY = window.INITIAL_PLAYER_Y;

    if (player.isSuper || player.isFire) {
        player.height = 32;
        spawnY = 176;
    } else {
        player.height = 16;
    }

    if (window.ram_0x071A >= window.STAGE_MIDWAY_BORDER) {
        const restartPage = window.MIDWAY_START_PAGE;
        player.x = restartPage * 256 + 16;
        player.y = spawnY;
        cameraX = restartPage * 256;
    } else {
        player.x = window.INITIAL_PLAYER_X;
        player.y = spawnY;
        cameraX = 0;
    }

    if (typeof scrollRegister !== 'undefined') scrollRegister = cameraX % 256;
    if (typeof currentTable !== 'undefined') currentTable = Math.floor(cameraX / 256) % 2;

    if (typeof lastWrittenCol !== 'undefined') {
        const startVramCol = Math.floor(cameraX / TILE_SIZE);
        for (let r = 0; r < VRAM_HEIGHT; r++) {
            for (let c = 0; c < VRAM_WIDTH; c++) {
                const targetMapCol = startVramCol + c;
                if (typeof nesVRAM !== 'undefined') {
                    nesVRAM[r][c] = tileMap[r][targetMapCol] || 0;
                }
            }
        }
        lastWrittenCol = startVramCol + VRAM_WIDTH - 1;
    }

    if (typeof lastSpawnedKuriboCol !== 'undefined') lastSpawnedKuriboCol = -1;
    if (typeof kuriboComboCount !== 'undefined') kuriboComboCount = 0;

    const initialCols = Math.ceil(canvas.width / TILE_SIZE);
    lastCheckedSpawnCol = Math.floor(cameraX / TILE_SIZE) + initialCols - 1;

    if (window.activeEnemies) window.activeEnemies.length = 0;

    if (typeof activeMushrooms !== 'undefined') activeMushrooms.length = 0;
    if (typeof activeStars !== 'undefined') activeStars.length = 0;
    if (typeof activeFlowers !== 'undefined') activeFlowers.length = 0;
    if (typeof animatingBlocks !== 'undefined') animatingBlocks.length = 0;
    if (typeof animatingBricks !== 'undefined') animatingBricks.length = 0;
    if (typeof activeFireballs !== 'undefined') activeFireballs.length = 0;

    if (typeof goalPoleFlag !== 'undefined') {
        goalPoleFlag.isInitialized = false;
        goalPoleFlag.isFinished = false;
        goalPoleFlag.y = 0;
        goalPoleFlag.startY = 0;
        goalPoleFlag.targetY = 0;
    }

    if (typeof stopAllBGM === 'function') stopAllBGM();
}

let globalFrameCounter = 0;
let lastTime = performance.now();

function checkPlayerHardBlockLogTest() {
    if (typeof player === 'undefined' ||
        player.playerState === 0x03 ||
        player.playerState === 0x09 ||
        player.playerState === 0x0A ||
        player.goalReached === true ||
        (player.postFlipTimer !== undefined && player.postFlipTimer > 0)) {
        return;
    }

    const startCol = Math.floor((player.x - 1) / TILE_SIZE);
    const endCol   = Math.floor((player.x + player.width + 1) / TILE_SIZE);
    const startRow = Math.floor((player.y - 1) / TILE_SIZE);
    const endRow   = Math.floor((player.y + player.height + 1) / TILE_SIZE);

    for (let r = startRow; r <= endRow; r++) {
        if (!tileMap[r]) continue;
        for (let c = startCol; c <= endCol; c++) {
            const tileType = tileMap[r][c];

            if (tileType === 90 || tileType === 91 || tileType === 92) {
                const tileLeft   = c * TILE_SIZE;
                const tileRight  = tileLeft + TILE_SIZE;
                const tileTop    = r * TILE_SIZE;
                const tileBottom = tileTop + TILE_SIZE;

                const isTouching =
                    player.x - 1 < tileRight &&
                    player.x + player.width + 1 > tileLeft &&
                    player.y - 1 < tileBottom &&
                    player.y + player.height + 1 > tileTop;

                if (isTouching) {

                    if (typeof player.triggerFreezeRoutine === 'function') {
                        player.triggerFreezeRoutine();
                    }
                    return;
                }
            }
        }
    }
}

function gameLoop() {
    const now = performance.now();
    let dt = now - lastTime;
    lastTime = now;
    if (dt > 100) dt = 16.67;
    const dtModifier = dt / (1000 / 60);

    globalFrameCounter = (globalFrameCounter + dtModifier) % 48;

    if (typeof updatePauseInput === 'function') {
        updatePauseInput(keys, dtModifier);
    }

    if (window.isPaused) {
        draw();
        requestAnimationFrame(gameLoop);
        return;
    }

    if (window.isTitleScreen) {
        if (typeof updateTitleInput === 'function') { updateTitleInput(); }
        if (typeof keys !== 'undefined') {
            Object.keys(keys).forEach(k => {
                if (k !== 'Enter') keys[k] = false;
            });
        }
        draw();
        requestAnimationFrame(gameLoop);
        return;
    }

    if (window.isMiddleScreen) {
        if (typeof updateMiddleScreen === 'function') { updateMiddleScreen(dtModifier); }
        draw();
        requestAnimationFrame(gameLoop);
        return;
    }

    if (window.isGameOverScreen) {
        if (typeof updateGameOverScreen === 'function') { updateGameOverScreen(dtModifier); }
        draw();
        requestAnimationFrame(gameLoop);
        return;
    }

    if (typeof checkPlayerPipeEntry === 'function') { checkPlayerPipeEntry(); }

    checkPlayerHardBlockLogTest();

    if (typeof player !== 'undefined') { player.update(dtModifier); }

    if (typeof player !== 'undefined' && player.y > 255) {

        if (player.playerState !== 0x03) {

            player.playerState = 0x03;
            player.vx = 0;
            player.vy = 0;

            player.isPitDeath = true;

            player.height = 16;

            if (typeof marioSprites !== 'undefined' && marioSprites.death) {
                player.currentSprite = marioSprites.death;
            }

            player.invincibleTimer = 0;
            player.deathTimer = 0;
            player.deathFrameBuffer = 0;
            player.deathJumpTriggered = false;
            player.isDamaged = false;
            player.isTransforming = false;

            if (typeof stopAllBGM === 'function') stopAllBGM();

            if (typeof playSE === 'function') {
                playSE('death');
            }
        }
    }

    if (typeof player !== 'undefined' && player.playerState === 0x03) {
        draw();
        requestAnimationFrame(gameLoop);
        return;
    }

    if (typeof updatePipeAnimation === 'function') { updatePipeAnimation(dtModifier); }
    if (typeof goalPoleFlag !== 'undefined') { goalPoleFlag.update(dtModifier); }
    if (typeof updateRisingBlocks === 'function') { updateRisingBlocks(dtModifier); }
    if (typeof updateRisingBricks === 'function') { updateRisingBricks(dtModifier); }

    updateEnemies(dtModifier);

    if (typeof updateScoreTimer === 'function') { updateScoreTimer(dtModifier); }
    if (typeof updateMushrooms === 'function') { updateMushrooms(dtModifier); }
    if (typeof updateStars === 'function') { updateStars(dtModifier); }
    if (typeof updateFlowers === 'function') { updateFlowers(dtModifier); }
    if (typeof updateFireballs === 'function') { updateFireballs(dtModifier); }
    if (typeof updateScoreEffects === 'function') updateScoreEffects(dtModifier);

    if (player && player.playerState !== 0x03 && player.playerState !== 0x05) {
        if (player.playerState === 0x0B) {
            checkScrollEnemySpawning();
        } else {
            checkScrollEnemySpawning();
            checkPlayerEnemyCollisions();
            if (typeof checkPlayerCoinCollisions === 'function') {
                checkPlayerCoinCollisions();
            }
        }
    }

    draw();
    requestAnimationFrame(gameLoop);
}

function draw() {

    if (window.isMiddleScreen || window.isGameOverScreen) {
        ctx.fillStyle = '#000000';
    } else if (window.isUnderground) {
        ctx.fillStyle = typeof BONUS_BACKGROUND_COLOR !== 'undefined' ? BONUS_BACKGROUND_COLOR : '#000000';
    } else {
        ctx.fillStyle = '#9494ff';
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (window.isMiddleScreen || window.isGameOverScreen) {

        if (typeof drawScoreBoard === 'function') {
            drawScoreBoard();
        }

        if (window.isMiddleScreen) {
            if (typeof drawScoreText === 'function') {
                drawScoreText("WORLD", 88, 80);
                drawScoreText("1-1", 136, 80);
            }
            if (typeof drawMiddleScreen === 'function') { drawMiddleScreen(); }
        }

        if (window.isGameOverScreen) {
            if (typeof drawScoreText === 'function') {
                drawScoreText("GAME OVER", 88, 128);
            }
        }
        return;
    }

    if (typeof backgroundMap !== 'undefined' && !window.isUnderground) {
        const startCol = Math.floor(cameraX / BG_TILE_SIZE);
        const endCol = startCol + Math.ceil(canvas.width / BG_TILE_SIZE) + 1;

        for (let row = 0; row < BG_MAP_HEIGHT; row++) {
            if (!backgroundMap[row]) continue;
            for (let col = startCol; col < endCol; col++) {
                const loopCol = col % BG_MAP_WIDTH;
                let bgType = backgroundMap[row][loopCol];

                if (row === 11 && (bgType === 31 || bgType === 32 || bgType === 33)) {
                    bgType = bgType + 280;
                }

                if (bgType !== 0 && bgSprites[bgType]) {
                    const screenX = (col * BG_TILE_SIZE) - cameraX;
                    ctx.drawImage(bgSprites[bgType], screenX, row * BG_TILE_SIZE, BG_TILE_SIZE, BG_TILE_SIZE);
                }
            }
        }
    }

    if (typeof drawMushrooms === 'function') { drawMushrooms(); }
    if (typeof drawStars === 'function') { drawStars(); }
    if (typeof drawFlowers === 'function') { drawFlowers(); }
    if (typeof drawRisingBlocks === 'function') { drawRisingBlocks(); }
    if (typeof drawRisingBricks === 'function') { drawRisingBricks(); }
    if (typeof drawScoreEffects === 'function') drawScoreEffects();

    const pendingFlagsToDraw = [];

    for (let row = 0; row < MAP_HEIGHT; row++) {
        for (let col = 0; col < MAP_WIDTH; col++) {
            if (!tileMap[row] || tileMap[row][col] === undefined) continue;
            const tileType = tileMap[row][col];

            if (tileType === 90 || tileType === 91) {
                const screenX = (col * TILE_SIZE) - cameraX;
                if (screenX >= -TILE_SIZE && screenX <= canvas.width) {
                    if (typeof drawGoalPoleTile === 'function') {
                        drawGoalPoleTile(tileType, screenX, row * TILE_SIZE);
                    }
                }
            }
            else if (tileType === 92) {
                const screenX = (col * TILE_SIZE) - cameraX;
                if (screenX >= -TILE_SIZE && screenX <= canvas.width) {
                    pendingFlagsToDraw.push({ tileType, screenX, screenY: row * TILE_SIZE });
                }
            }
            else if (tileType === 222 || (tileType >= 81 && tileType <= 86)) {
                let targetSprite = tileSprites[tileType];
                if (targetSprite) {
                    const screenX = (col * TILE_SIZE) - cameraX;
                    if (screenX >= -TILE_SIZE && screenX <= canvas.width) {
                        ctx.drawImage(targetSprite, screenX, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    }
                }
            }
        }
    }

    if (typeof goalPoleFlag !== 'undefined' && goalPoleFlag.isInitialized) {
        goalPoleFlag.draw();
    } else if (pendingFlagsToDraw.length > 0) {
        pendingFlagsToDraw.forEach(flag => {
            if (typeof drawGoalPoleTile === 'function') {
                drawGoalPoleTile(92, flag.screenX, flag.screenY);
            }
        });
    }

    if (typeof player !== 'undefined' && player.playerState !== 0x03) {
        if (typeof player.draw === 'function') { player.draw(); }
    }

    for (let row = 0; row < MAP_HEIGHT; row++) {
        for (let col = 0; col < MAP_WIDTH; col++) {
            if (!tileMap[row] || tileMap[row][col] === undefined) continue;
            const tileType = tileMap[row][col];

            if (tileType !== 0 && tileType !== 90 && tileType !== 91 && tileType !== 92 &&
                tileType !== 222 && !(tileType >= 81 && tileType <= 86)) {

                let targetSprite = tileSprites[tileType];

                if (tileType === 3 || tileType === 10) {
                    const step = Math.floor(globalFrameCounter / 8) % 6;
                    const animationPattern = new Array(tileType, tileType, tileType, 32, 33, 32);
                    targetSprite = tileSprites[animationPattern[step]];
                }

                if (tileType === 30 && window.isUnderground) {
                    const step = Math.floor(globalFrameCounter / 8) % 6;
                    const coinAnimationPattern = new Array(30, 30, 30, 301, 302, 301);
                    targetSprite = tileSprites[coinAnimationPattern[step]];
                }

                if (targetSprite) {
                    const screenX = (col * TILE_SIZE) - cameraX;
                    if (screenX >= -TILE_SIZE && screenX <= canvas.width) {
                        ctx.drawImage(targetSprite, screenX, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    }
                }
            }
        }
    }

    drawEnemies();

    if (typeof drawFireballs === 'function') {
        drawFireballs();
    }

    if (typeof player !== 'undefined' && player.playerState === 0x03) {
        if (typeof player.draw === 'function') {
            player.draw();
        }
    }

    if (window.isTitleScreen) {
        if (typeof drawTitleScreen === 'function') {
            drawTitleScreen();
        }
    }

    if (typeof drawScoreEffects === 'function') {
        drawScoreEffects();
    }

    if (typeof drawScoreBoard === 'function') {
        drawScoreBoard();
    }
}

const oldDebugger = document.getElementById('pixel-debugger');
if (oldDebugger) {
    oldDebugger.remove();
}

function triggerBlockHitShockwave(blockCol, blockRow) {

    if (activeEnemies && activeEnemies.length > 0) {
        activeEnemies.forEach(enemy => {
            if (enemy.enemyState === 0x02 || enemy.enemyState === 0x04) return;

            const enemyCol = Math.floor((enemy.x + enemy.width / 2) / TILE_SIZE);
            const enemyRow = Math.floor((enemy.y + enemy.height - 1) / TILE_SIZE);

            if (enemyRow === blockRow - 1 && Math.abs(enemyCol - blockCol) <= 1) {
                enemy.enemyState = 0x04;
                enemy.vy = -3.5;
                enemy.vx = (enemy.x + enemy.width / 2 > blockCol * TILE_SIZE + 8) ? 0.8 : -0.8;

                if (typeof playSE === 'function') {
                    playSE('kickkill');
                }

                if (typeof addScore === 'function') { addScore(100); }
                if (typeof spawnScoreEffect === 'function') {
                    spawnScoreEffect(enemy.x, enemy.y, 100);
                }
            }
        });
    }

    if (activeMushrooms && activeMushrooms.length > 0) {
        activeMushrooms.forEach(shroom => {
            const shroomCol = Math.floor((shroom.x + shroom.width / 2) / TILE_SIZE);
            const shroomRow = Math.floor((shroom.y + shroom.height - 1) / TILE_SIZE);

            if (shroomRow === blockRow - 1 && Math.abs(shroomCol - blockCol) <= 1) {
                if (shroom.state === 'moving') {
                    shroom.vy = -4.0;
                    shroom.isGrounded = false;

                } else if (shroom.state === 'rising') {
                    shroom.pendingBounce = true;
                }
            }
        });
    }
}
