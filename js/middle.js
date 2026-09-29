window.isMiddleScreen = false;

let middleFrameCounter = 0;

function startMiddleScreen() {
    window.isMiddleScreen = true;
    middleFrameCounter = 0;
    window.isTitleScreen = false;

    if (typeof stopAllBGM === 'function') stopAllBGM();

}

function updateMiddleScreen(dtModifier) {
    if (!window.isMiddleScreen) return;

    middleFrameCounter += dtModifier;

    if (middleFrameCounter >= 120) {
        window.isMiddleScreen = false;

        if (window.gameTime <= 100) {
            window.isHurryUpTriggered = true;
            if (typeof playSE === 'function') playSE('hurryup');

            if (sounds && sounds['hurryup']) {
                sounds['hurryup'].onended = function() {
                    if (player && player.playerState !== 0x03 && !window.isTitleScreen && !window.isMiddleScreen) {

                        if (typeof startBGM === 'function') startBGM('hurry_overworld');
                    }
                };
            }
        } else {

            if (typeof startBGM === 'function') {
                if (window.isUnderground) {
                    startBGM('underground');
                } else {
                    startBGM('overworld');
                }
            }
        }
    }
}

function drawMiddleScreen() {
    if (!window.isMiddleScreen) return;

    if (typeof player !== 'undefined' && marioSprites) {
        const sprite = marioSprites.idle;
        if (sprite && sprite.complete) {
            ctx.drawImage(sprite, 96, 105, 16, 16);
        }
    }

    if (typeof drawScoreText === 'function') {
        drawScoreText("x", 120, 112);
    }

    if (typeof drawScoreText === 'function') {
        const livesNum = window.lives !== undefined ? window.lives : 3;
        drawScoreText(String(livesNum), 144, 112);
    }
}

window.isGameOverScreen = false;

let gameOverFrameCounter = 0;

function startGameOverScreen() {
    window.isGameOverScreen = true;
    window.isMiddleScreen = false;
    window.isTitleScreen = false;
    gameOverFrameCounter = 0;

    if (typeof stopAllBGM === 'function') stopAllBGM();
    if (typeof playSE === 'function') playSE('gameover');

}

function updateGameOverScreen(dtModifier) {
    if (!window.isGameOverScreen) return;

    gameOverFrameCounter += dtModifier;

    if (gameOverFrameCounter >= 300) {
        window.isGameOverScreen = false;
        window.isTitleScreen = true;

        window.cameraX = 0;
        window.ram_0x071A = 0;
        window.lastCheckedSpawnCol = -1;
        if (typeof scrollRegister !== 'undefined') scrollRegister = 0;
        if (typeof currentTable !== 'undefined') currentTable = 0;

        if (window.activeEnemies) window.activeEnemies.length = 0;
        if (typeof activeMushrooms !== 'undefined') activeMushrooms.length = 0;
        if (typeof animatingBlocks !== 'undefined') animatingBlocks.length = 0;
        if (typeof animatingBricks !== 'undefined') animatingBricks.length = 0;
        if (typeof activeDebris !== 'undefined') activeDebris.length = 0;
        if (typeof activeCoins !== 'undefined') activeCoins.length = 0;

        if (typeof lastSpawnedKuriboCol !== 'undefined') lastSpawnedKuriboCol = -1;
        if (typeof kuriboComboCount !== 'undefined') kuriboComboCount = 0;

        if (typeof resetOverworldMapToDefault === 'function') resetOverworldMapToDefault();
        if (typeof resetBonusMapToDefault === 'function') resetBonusMapToDefault();

        if (typeof nesVRAM !== 'undefined' && typeof tileMap !== 'undefined') {
            for (let r = 0; r < 15; r++) {
                for (let c = 0; c < 32; c++) {
                    nesVRAM[r][c] = tileMap[r][c] || 0;
                }
            }
            if (typeof lastWrittenCol !== 'undefined') lastWrittenCol = 31;
        }

        if (typeof player !== 'undefined') {
            player.x = window.INITIAL_PLAYER_X;
            player.y = window.INITIAL_PLAYER_Y;
        }

        if (typeof startBGM === 'function') startBGM('title');
    }
}

function drawGameOverScreen() {

    return;
}
