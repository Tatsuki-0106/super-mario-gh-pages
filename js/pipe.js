let pipeWarpDelayTimer = 0;

function checkPlayerPipeEntry() {
    if (typeof player === 'undefined' || player.isTransforming) return;

    if (player.playerState === 0x03 || player.playerState === 0x05 || player.playerState === 0x06) return;

    if (player.playerState !== 0x08) return;

    if (keys.ArrowRight) {
        const playerRightX = player.x + player.width;
        const footY = player.y + player.height;

        const nextCol = Math.floor((playerRightX + 2) / TILE_SIZE);
        const centerRow = Math.floor((player.y + player.height / 2) / TILE_SIZE);
        const footRow = Math.floor((footY - 1) / TILE_SIZE);

        let foundHorizontalPipe = false;
        let pipeTopRow = -1;

        if (tileMap[centerRow] && (tileMap[centerRow][nextCol] === 104 || tileMap[centerRow][nextCol] === 106)) {
            foundHorizontalPipe = true;
            pipeTopRow = (tileMap[centerRow][nextCol] === 106) ? centerRow : centerRow - 1;
        } else if (tileMap[footRow] && (tileMap[footRow][nextCol] === 104 || tileMap[footRow][nextCol] === 106)) {
            foundHorizontalPipe = true;
            pipeTopRow = (tileMap[footRow][nextCol] === 106) ? footRow : footRow - 1;
        }

        if (foundHorizontalPipe && pipeTopRow !== -1) {
            const pipeEntryX = nextCol * TILE_SIZE;
            const pipeFloorY = (pipeTopRow + 2) * TILE_SIZE;

            if (footY >= pipeFloorY - 32 && footY <= pipeFloorY) {
                if (playerRightX >= pipeEntryX - 4) {

                    player.playerState = 0x05;
                    player.vx = 0;
                    player.vy = 0;

                    player.x = pipeEntryX - player.width;
                    player.y = pipeFloorY - player.height;
                    player.pipeTargetX = player.x + 16;
                    player.x += 0.5;

                    pipeWarpDelayTimer = 0;

                    setTimeout(() => {
                        if (typeof playSE === 'function') { playSE('pipepowerdown'); }
                    }, 0);
                    return;
                }
            }
        }
    }

    if (!keys.ArrowDown || !player.isGrounded) return;

    const footY = player.y + player.height;
    const row = Math.floor(footY / TILE_SIZE);
    const playerCenterX = player.x + player.width / 2;
    const leftCol  = Math.floor(player.x / TILE_SIZE);
    const rightCol = Math.floor((player.x + player.width - 1) / TILE_SIZE);

    let foundPipe = false;
    let pipeLeftCol = -1;

    if (tileMap[row] && (tileMap[row][leftCol] === 55 || tileMap[row][leftCol] === 56)) {
        foundPipe = true;
        pipeLeftCol = (tileMap[row][leftCol] === 55) ? leftCol : leftCol - 1;
    } else if (tileMap[row] && (tileMap[row][rightCol] === 55 || tileMap[row][rightCol] === 56)) {
        foundPipe = true;
        pipeLeftCol = (tileMap[row][rightCol] === 55) ? rightCol : rightCol - 1;
    }

    if (foundPipe && pipeLeftCol !== -1) {
        const pipeX1 = pipeLeftCol * TILE_SIZE;
        const pipeX2 = pipeX1 + 32;

        if (playerCenterX >= pipeX1 && playerCenterX <= pipeX2) {
            const pipeTopY = row * TILE_SIZE;
            if (Math.abs(footY - pipeTopY) <= 1) {

                player.playerState = 0x33;
                player.vx = 0;
                player.vy = 0;
                player.x = pipeX1 + 16 - player.width / 2;

                window.originalOverworldMapRef = tileMap;

                setTimeout(() => {
                    if (typeof playSE === 'function') { playSE('pipepowerdown'); }
                }, 0);
            }
        }
    }
}

function updatePipeAnimation(dtModifier) {
    if (typeof player === 'undefined') return;

    if (player.playerState === 0x33) {
        player.y += 0.5 * dtModifier;
        const pipeTopY = 9 * TILE_SIZE;

        if (player.y >= pipeTopY + 32) {
            if (typeof stopAllBGM === 'function') stopAllBGM();
            if (typeof startBGM === 'function') startBGM('underground');

            if (typeof bonusTileMap !== 'undefined') {
                tileMap = bonusTileMap;
                MAP_WIDTH = BONUS_MAP_WIDTH;
                MAP_HEIGHT = BONUS_MAP_HEIGHT;
                window.isUnderground = true;
                if (typeof loadStageSprites === 'function') { loadStageSprites(true); }
            }

            cameraX = 0;
            player.x = 32;
            player.y = 32;
            player.playerState = 0x08;
            player.vx = 0;
            player.vy = 0;
            player.isGrounded = false;
        }
    }

    if (player.playerState === 0x05) {
        player.vx = 0;
        player.vy = 0;

        if (player.x < player.pipeTargetX) {
            player.x += 0.5 * dtModifier;
            if (player.x >= player.pipeTargetX) {
                player.x = player.pipeTargetX;

                player.vanished = true;

            }
        } else {

            pipeWarpDelayTimer += dtModifier;

            if (pipeWarpDelayTimer >= 120) {
                pipeWarpDelayTimer = 0;
                player.vanished = false;

                if (typeof stopAllBGM === 'function') stopAllBGM();
                if (typeof startBGM === 'function') startBGM('overworld');

                if (window.originalOverworldMapRef) {
                    tileMap = window.originalOverworldMapRef;
                }

                MAP_WIDTH = 211;
                MAP_HEIGHT = 15;
                window.isUnderground = false;
                if (typeof loadStageSprites === 'function') { loadStageSprites(false); }

                let targetCol = 163;
                let targetRow = 11;
                let foundMatch = false;

                for (let r = 0; r < MAP_HEIGHT; r++) {
                    for (let c = 0; c < MAP_WIDTH; c++) {
                        if (tileMap[r] && tileMap[r][c] === 155) {
                            targetRow = r;
                            targetCol = c;
                            foundMatch = true;
                            break;
                        }
                    }
                    if (foundMatch) break;
                }

                cameraX = (targetCol * TILE_SIZE) - 112;

                if (typeof lastCheckedSpawnCol !== 'undefined') {
                    lastCheckedSpawnCol = Math.floor((cameraX + 256) / TILE_SIZE);
                }

                player.x = (targetCol * TILE_SIZE) + 16 - (player.width / 2);

                player.y = (targetRow * TILE_SIZE) + player.height;

                player.playerState = 0x06;
                player.pipeTargetY = (targetRow * TILE_SIZE) - player.height;
                player.vx = 0;
                player.vy = 0;

            }
        }
    }

    if (player.playerState === 0x06) {
        player.vx = 0;
        player.vy = 0;

        if (player.y > player.pipeTargetY) {
            player.y -= 1.0 * dtModifier;
            player.animCounter += 1.0 * 0.15 * dtModifier;

            if (player.y <= player.pipeTargetY) {
                player.y = player.pipeTargetY - 1;

                player.playerState = 0x08;
                player.isGrounded = true;
                player.vx = 0;
                player.vy = 0;

            }
        }
    }
}
