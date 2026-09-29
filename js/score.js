if (window.score === undefined) window.score = 0;
if (window.coins === undefined) window.coins = 0;
if (window.stageName === undefined) window.stageName = "1-1";
if (window.gameTime === undefined) window.gameTime = 400;
if (window.lives === undefined) window.lives = 3;

let timeFrameCounter = 0;

window.isHurryUpTriggered = false;

const scoreSprites = {};

for (let i = 0; i <= 9; i++) {
    scoreSprites[i] = new Image();
    scoreSprites[i].src = `sprite/others/${i}.png`;
}

const alphabet = 'abcdefghijklmnopqrstuvwxyz';
for (let char of alphabet) {
    scoreSprites[char] = new Image();
    scoreSprites[char].src = `sprite/others/${char}.png`;
}

scoreSprites['-'] = new Image();    scoreSprites['-'].src = 'sprite/others/-.png';
scoreSprites['.'] = new Image();    scoreSprites['.'].src = 'sprite/others/dot.png';
scoreSprites['!'] = new Image();    scoreSprites['!'].src = 'sprite/others/!.png';
scoreSprites['cross'] = new Image();    scoreSprites['cross'].src = 'sprite/others/cross.png';

scoreSprites['coin1'] = new Image(); scoreSprites['coin1'].src = 'sprite/others/coin1.png';
scoreSprites['coin2'] = new Image(); scoreSprites['coin2'].src = 'sprite/others/coin2.png';
scoreSprites['coin3'] = new Image(); scoreSprites['coin3'].src = 'sprite/others/coin3.png';

scoreSprites['coin'] = scoreSprites['coin1'];

function drawScoreText(text, startX, startY) {
    const targetStr = String(text).toLowerCase();
    for (let i = 0; i < targetStr.length; i++) {
        const char = targetStr[i];
        let sprite = null;

        if (char === ' ') continue;

        if (char === '\$') {
            sprite = scoreSprites['coin'];
        } else if (char === 'x') {
            sprite = scoreSprites['cross'];
        } else {
            sprite = scoreSprites[char];
        }

        if (sprite && sprite.complete) {
            ctx.drawImage(sprite, startX + (i * 8), startY, 8, 8);
        }
    }
}

let scoreCountFrameTimer = 0;

function updateScoreTimer(dtModifier = 1.0) {
    if (typeof player === 'undefined') return;

    if (player.playerState === 0x03) {
        return;
    }

    if (player.playerState === 0x0C) {
        if (window.gameTime > 0) {
            scoreCountFrameTimer += dtModifier;

            while (scoreCountFrameTimer >= 1) {
                scoreCountFrameTimer -= 1;

                window.gameTime--;
                if (typeof addScore === 'function') { addScore(50); }

                if (typeof playSE === 'function') {
                    playSE('beep');
                }

                if (window.gameTime <= 0) {
                    window.gameTime = 0;

                    if (window.isTwoPlayerMode) {

                        if (window.currentPlayerNumber === 1) {
                            window.isPlayer1Cleared = true;

                        } else {
                            window.isPlayer2Cleared = true;

                        }

                        const currentData = (window.currentPlayerNumber === 1) ? window.player1Data : window.player2Data;
                        currentData.lives = window.lives;
                        currentData.score = window.score;
                        currentData.coins = window.coins;
                        currentData.isSuper = player.isSuper;
                        currentData.isFire = player.isFire;
                        currentData.height = player.height;
                        currentData.stage = "1-1";

                        let nextPlayerNumber = (window.currentPlayerNumber === 1) ? 2 : 1;
                        let nextData = (nextPlayerNumber === 1) ? window.player1Data : window.player2Data;

                        if (nextData.lives <= 0) {
                            nextPlayerNumber = window.currentPlayerNumber;
                            nextData = (nextPlayerNumber === 1) ? window.player1Data : window.player2Data;
                        }

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

                    if (typeof refreshPlayerSpriteFolders === 'function') {
                        refreshPlayerSpriteFolders();
                    }

                    if (typeof startMiddleScreen === 'function') {
                        startMiddleScreen();
                    }

                    window.gameTime = 400;
                    timeFrameCounter = 0;
                    window.isHurryUpTriggered = false;

                    player.playerState = 0x08;
                    player.vanished = false;
                    player.goalReached = false;
                    player.isPitDeath = false;
                    player.vx = 0;
                    player.vy = 0;
                    player.direction = 1;

                    player.x = window.INITIAL_PLAYER_X;
                    player.y = window.INITIAL_PLAYER_Y;
                    cameraX = 0;

                    if (typeof resetOverworldMapToDefault === 'function') resetOverworldMapToDefault();
                    if (typeof resetBonusMapToDefault === 'function') resetBonusMapToDefault();
                    window.isUnderground = false;
                    if (typeof loadStageSprites === 'function') loadStageSprites(false);
                    window.originalOverworldMapRef = null;

                    if (typeof scrollRegister !== 'undefined') scrollRegister = 0;
                    if (typeof currentTable !== 'undefined') currentTable = 0;

                    if (typeof lastWrittenCol !== 'undefined' && typeof nesVRAM !== 'undefined') {
                        for (let r = 0; r < 15; r++) {
                            for (let c = 0; c < 32; c++) {
                                nesVRAM[r][c] = tileMap[r][c] || 0;
                            }
                        }
                        lastWrittenCol = 31;
                    }

                    if (window.activeEnemies) window.activeEnemies.length = 0;
                    if (typeof initEnemiesFromMap === 'function') {
                        initEnemiesFromMap();
                    }

                    if (typeof goalPoleFlag !== 'undefined') {
                        goalPoleFlag.isInitialized = false;
                        goalPoleFlag.isFinished = false;
                        goalPoleFlag.y = 0;
                        goalPoleFlag.startY = 0;
                        goalPoleFlag.targetY = 0;
                    }

                    if (typeof activeMushrooms !== 'undefined') activeMushrooms.length = 0;
                    if (typeof activeStars !== 'undefined') activeStars.length = 0;
                    if (typeof activeFlowers !== 'undefined') activeFlowers.length = 0;
                    if (typeof animatingBlocks !== 'undefined') animatingBlocks.length = 0;
                    if (typeof animatingBricks !== 'undefined') animatingBricks.length = 0;
                    if (typeof activeFireballs !== 'undefined') activeFireballs.length = 0;
                    if (typeof activeScoreEffects !== 'undefined') activeScoreEffects.length = 0;

                    if (typeof stopAllBGM === 'function') stopAllBGM();

                    break;
                }
            }
        }
        return;
    }

    if (player.playerState === 0x0B || player.vanished) {

        return;
    }

    if (window.gameTime > 0) {
        timeFrameCounter += dtModifier;

        while (timeFrameCounter >= 25) {
            timeFrameCounter -= 25;
            window.gameTime--;

            if (window.gameTime <= 100 && !window.isHurryUpTriggered) {
                window.isHurryUpTriggered = true;

                if (typeof stopAllBGM === 'function') stopAllBGM();

                if (typeof playSE === 'function') {
                    playSE('hurryup');
                }

                if (sounds['hurryup']) {
                    sounds['hurryup'].onended = function() {
                        if (player && player.playerState !== 0x03 && !window.isTitleScreen) {

                            if (typeof startBGM === 'function') {
                                startBGM('hurry_overworld');
                            }
                        }
                    };
                }
            }

            if (window.gameTime <= 0) {
                window.gameTime = 0;

                player.playerState = 0x03;
                player.vx = 0;
                player.vy = 0;

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
                if (typeof playSE === 'function') playSE('death');

                break;
            }
        }
    }
}

const COMBO_SCORE_TABLE =[ 100, 200, 400, 800, 1000, 2000, 4000, 8000 ];

function addScore(amount) {
    window.score += amount;

    if (window.score > 999999) {
        window.score = 999999;
    }

}

function addComboScore(comboCount) {
    if (comboCount < COMBO_SCORE_TABLE.length) {
        const scoreGain = COMBO_SCORE_TABLE[comboCount];
        addScore(scoreGain);
        return scoreGain;
    } else {

         [8]

        if (typeof playSE === 'function') {
            playSE('1up');
        }

        if (typeof window.lives !== 'undefined') {
            window.lives++;
        }

        return -1;
    }
}

function drawScoreBoard() {
    if (typeof canvas === 'undefined') return;

    const currentNameLabel = (window.currentPlayerNumber === 1) ? "MARIO" : "LUIGI";
    drawScoreText(currentNameLabel, 24, 16);

    drawScoreText("WORLD", 144, 16);

    drawScoreText("TIME", 200, 16);

    const scoreStr = String(window.score).padStart(6, '0');
    drawScoreText(scoreStr, 24, 24);

    const coinAnimStep = Math.floor(globalFrameCounter / 8) % 6;

    const coinPattern = new Array('coin1', 'coin1', 'coin1', 'coin2', 'coin3', 'coin2');
    const currentCoinSpriteKey = coinPattern[coinAnimStep];

    if (scoreSprites[currentCoinSpriteKey]) {
        scoreSprites['coin'] = scoreSprites[currentCoinSpriteKey];
    }

    const coinStr = "\$x" + String(window.coins).padStart(2, '0');
    drawScoreText(coinStr, 88, 24);

    drawScoreText(window.stageName, 152, 24);

    if (window.isTitleScreen) {
        drawScoreText("   ", 208, 24);
    } else {
        const timeStr = String(window.gameTime).padStart(3, '0');
        drawScoreText(timeStr, 208, 24);
    }
}
