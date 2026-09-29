const animatingBlocks = [];
const activeCoins = [];

const multiCoinBlockStates = {};

function checkQuestionBlockHit(px, py) {
    const col = Math.floor(px / TILE_SIZE);
    const row = Math.floor(py / TILE_SIZE);

    if (!tileMap[row] || tileMap[row][col] === undefined) return;

    if (typeof player !== 'undefined') {
        if (player.lastHitHitboxFrame === globalFrameCounter) {
            return;
        }
    }

    if (typeof player !== 'undefined') {
        player.lastHitHitboxFrame = globalFrameCounter;
    }

    const blockType = tileMap[row][col];
    const blockBaseX = col * TILE_SIZE;
    const blockBaseY = row * TILE_SIZE;
    const blockKey = `${col}_${row}`;

    if (blockType === 21) {

        const isAlreadyAnimating = animatingBlocks.some(b => b.col === col && b.row === row);
        if (isAlreadyAnimating) return;

        if (!multiCoinBlockStates[blockKey]) {
            multiCoinBlockStates[blockKey] = {
                hasStarted: false,
                acceptTimer: 230,
                hitCooldown: 0,
                totalCoins: 0,
                isExpired: false
            };
        }

        const state = multiCoinBlockStates[blockKey];

        if (state.hitCooldown > 0) return;

        if (!state.hasStarted) {
            state.hasStarted = true;
        }

        state.totalCoins++;
        state.hitCooldown = 16;

        if (typeof playSE === 'function') playSE('coin');

        const coinWidth = 8;
        const exactCenterX = blockBaseX + (TILE_SIZE / 2) - (coinWidth / 2);
        const spawnX = Math.floor(exactCenterX);
        const spawnY = blockBaseY - 16;

        activeCoins.push({
            x: spawnX,
            y: spawnY,
            timer: 0,
            frameBuffer: 0
        });

        window.coins++;
        if (window.coins >= 100) {
            window.coins = 0;
            if (window.lives !== undefined) window.lives++;
            if (typeof playSE === 'function') playSE('1up');
            if (typeof spawnScoreEffect === 'function') spawnScoreEffect(player.x, player.y - 16, '1up');
        }

        const EMPTY_TILE_ID = 9;
        let nextBlockVisualId = 21;

        if (state.isExpired) {
            nextBlockVisualId = EMPTY_TILE_ID;
            tileMap[row][col] = 0;
            delete multiCoinBlockStates[blockKey];
        } else {

            tileMap[row][col] = 0;
        }

        animatingBlocks.push({
            col: col,
            row: row,
            baseX: blockBaseX,
            baseY: blockBaseY,
            timer: 0,
            endTileId: nextBlockVisualId
        });

        if (typeof triggerBlockHitShockwave === 'function') {
            triggerBlockHitShockwave(col, row);
        }
        return;
    }

    if (blockType === 3 || blockType === 10 || blockType === 11) {

        const isAlreadyAnimating = animatingBlocks.some(b => b.col === col && b.row === row);
        if (isAlreadyAnimating) return;

        const EMPTY_TILE_ID = 9;
        tileMap[row][col] = 0;

        animatingBlocks.push({
            col: col,
            row: row,
            baseX: blockBaseX,
            baseY: blockBaseY,
            timer: 0,
            endTileId: EMPTY_TILE_ID
        });

        if (blockType === 3) {
            if (typeof playSE === 'function') playSE('coin');
            const coinWidth = 8;
            const exactCenterX = blockBaseX + (TILE_SIZE / 2) - (coinWidth / 2);
            const spawnX = Math.floor(exactCenterX);
            const spawnY = blockBaseY - 16;

            activeCoins.push({
                x: spawnX,
                y: spawnY,
                timer: 0,
                frameBuffer: 0
            });

            window.coins++;

            if (window.coins >= 100) {
                window.coins = 0;
                if (window.lives !== undefined) window.lives++;
                if (typeof playSE === 'function') playSE('1up');
                if (typeof spawnScoreEffect === 'function') spawnScoreEffect(player.x, player.y - 16, '1up');
            }

        } else if (blockType === 10) {
            if (typeof player !== 'undefined' && player.isSuper) {
                if (typeof spawnFlower === 'function') {
                    spawnFlower(blockBaseX, blockBaseY);
                }

            } else {
                if (typeof spawnMushroom === 'function') {
                    spawnMushroom(blockBaseX, blockBaseY, false);
                }

            }

            if (typeof playSE === 'function') {
                playSE('item');
            }
        } else if (blockType === 11) {
            if (typeof spawnMushroom === 'function') {
                spawnMushroom(blockBaseX, blockBaseY, true);
            }
            if (typeof playSE === 'function') {
                playSE('item');
            }

        }

        if (typeof triggerBlockHitShockwave === 'function') {
            triggerBlockHitShockwave(col, row);
        }
    }

    if (blockType === 23) {
        const isAlreadyAnimating = animatingBlocks.some(b => b.col === col && b.row === row);
        if (isAlreadyAnimating) return;

        const EMPTY_TILE_ID = 9;
        tileMap[row][col] = 0;

        animatingBlocks.push({
            col: col,
            row: row,
            baseX: blockBaseX,
            baseY: blockBaseY,
            timer: 0,
            endTileId: EMPTY_TILE_ID
        });

        if (typeof player !== 'undefined' && player.isSuper) {
            if (typeof playSE === 'function') playSE('brick');
        } else {
            if (typeof playSE === 'function') playSE('bump');
        }

        if (typeof playSE === 'function') {
            playSE('item');
        }

        if (typeof spawnStar === 'function') {
            spawnStar(blockBaseX, blockBaseY);
        }

        if (typeof triggerBlockHitShockwave === 'function') {
            triggerBlockHitShockwave(col, row);
        }

    }
}

function updateRisingBlocks(deltaTimeOrModifier) {
    let framesToAdvance = 1;
    if (deltaTimeOrModifier < 0.5) {
        framesToAdvance = deltaTimeOrModifier * 60;
    } else {
        framesToAdvance = deltaTimeOrModifier;
    }

    Object.keys(multiCoinBlockStates).forEach(key => {
        const state = multiCoinBlockStates[key];

        if (state.hitCooldown > 0) {
            state.hitCooldown -= framesToAdvance;
            if (state.hitCooldown < 0) state.hitCooldown = 0;
        }

        if (state.hasStarted && !state.isExpired) {
            state.acceptTimer -= framesToAdvance;
            if (state.acceptTimer <= 0) {
                state.acceptTimer = 0;
                state.isExpired = true;

            }
        }
    });

    for (let i = animatingBlocks.length - 1; i >= 0; i--) {
        const block = animatingBlocks[i];
        block.timer += framesToAdvance;

        if (block.timer >= 12) {
            tileMap[block.row][block.col] = block.endTileId;
            animatingBlocks.splice(i, 1);
        }
    }

    for (let i = activeCoins.length - 1; i >= 0; i--) {
        const coin = activeCoins[i];

        coin.frameBuffer += framesToAdvance;

        while (coin.frameBuffer >= 1) {
            coin.frameBuffer -= 1;
            coin.timer++;

            if (coin.timer > 30) {
                if (typeof addScore === 'function') { addScore(200); }
                if (typeof spawnScoreEffect === 'function') {
                    spawnScoreEffect(coin.x, coin.y, 200);
                }

                activeCoins.splice(i, 1);
                break;
            }

            let moveY = 0;

            if (coin.timer <= 16) {
                if (coin.timer <= 4)       moveY = -4;
                else if (coin.timer <= 8)  moveY = -3;
                else if (coin.timer <= 12) moveY = -2;
                else                       moveY = -1;
            } else {
                const fallFrame = coin.timer - 16;
                if (fallFrame <= 3)        moveY = 1;
                else if (fallFrame <= 7)   moveY = 2;
                else if (fallFrame <= 11)  moveY = 3;
                else                       moveY = 4;
            }

            coin.y += moveY;
        }
    }
}

function drawRisingBlocks() {
    for (let i = 0; i < animatingBlocks.length; i++) {
        const block = animatingBlocks[i];

        let offsetY = 0;
        const currentFrame = Math.floor(block.timer);

        if (currentFrame <= 6) {
            offsetY = -Math.floor((currentFrame / 6) * 4);
        } else if (currentFrame <= 12) {
            offsetY = -4 + Math.floor(((currentFrame - 6) / 6) * 4);
        }

        const screenX = block.baseX - cameraX;
        const screenY = block.baseY + offsetY;

        if (screenX >= -TILE_SIZE && screenX <= canvas.width && screenY >= -TILE_SIZE) {
            if (tileSprites && tileSprites[block.endTileId]) {
                ctx.drawImage(tileSprites[block.endTileId], screenX, screenY, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    for (let i = 0; i < activeCoins.length; i++) {
        const coin = activeCoins[i];

        const totalSteps = Math.floor(coin.timer / 2);
        const animationIndex = totalSteps % 4;

        const coinWidth = 8;
        const coinHeight = 16;

        const screenX = coin.x - cameraX;
        const screenY = coin.y;

        if (screenX >= -coinWidth && screenX <= canvas.width && screenY >= -coinHeight) {
            if (coinSprites && coinSprites[animationIndex]) {
                ctx.drawImage(coinSprites[animationIndex], screenX, screenY, coinWidth, coinHeight);
            }
        }
    }
}
