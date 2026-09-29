const activeMushrooms = [];
const mushroomSprite = new Image();
mushroomSprite.src = 'sprite/items/mushroom.png';

const upMushroomSprite = new Image();
upMushroomSprite.src = 'sprite/items/1upmushroom.png';

function spawnMushroom(blockX, blockY, is1Up = false) {
    activeMushrooms.push({
        x: blockX,
        y: blockY,
        width: 16,
        height: 16,
        vx: 0,
        vy: 0,
        isGrounded: true,
        state: 'rising',
        riseTimer: 0,
        frameBuffer: 0,
        pendingBounce: false,
        is1Up: is1Up
    });
}

function isTileSolidForMushroom(px, py) {
    if (px < 0 || px >= MAP_WIDTH * TILE_SIZE) return true;
    if (py < 0 || py >= MAP_HEIGHT * TILE_SIZE) return false;

    const col = Math.floor(px / TILE_SIZE);
    const row = Math.floor(py / TILE_SIZE);

    if (!tileMap[row] || tileMap[row][col] === undefined) return false;
    return tileMap[row][col] > 0;
}

function updateMushrooms(deltaTimeOrModifier) {
    let framesToAdvance = 1;
    if (deltaTimeOrModifier < 0.5) {
        framesToAdvance = deltaTimeOrModifier * 60;
    } else {
        framesToAdvance = deltaTimeOrModifier;
    }

    for (let i = activeMushrooms.length - 1; i >= 0; i--) {
        const shroom = activeMushrooms[i];

        if (shroom.state === 'rising') {
            shroom.frameBuffer += framesToAdvance;
            while (shroom.frameBuffer >= 1) {
                shroom.frameBuffer -= 1;
                shroom.riseTimer++;
                shroom.y -= 1;

                if (shroom.riseTimer >= 16) {
                    shroom.state = 'moving';
                    shroom.vx = 1.0;

                    if (shroom.pendingBounce) {
                        shroom.vy = -4.0;
                        shroom.isGrounded = false;
                        shroom.pendingBounce = false;

                    }
                    break;
                }
            }
            continue;
        }

        shroom.frameBuffer += framesToAdvance;
        while (shroom.frameBuffer >= 1) {
            shroom.frameBuffer -= 1;

            shroom.x += shroom.vx;
            const checkY = shroom.y + shroom.height / 2;

            if (shroom.vx > 0) {
                if (isTileSolidForMushroom(shroom.x + shroom.width, checkY)) {
                    shroom.vx = -1.0;
                    shroom.x = Math.floor((shroom.x + shroom.width) / TILE_SIZE) * TILE_SIZE - shroom.width;
                }
            } else if (shroom.vx < 0) {
                if (isTileSolidForMushroom(shroom.x, checkY)) {
                    shroom.vx = 1.0;
                    shroom.x = (Math.floor(shroom.x / TILE_SIZE) + 1) * TILE_SIZE;
                }
            }

            shroom.y += shroom.vy;
            const footMargin = 1;
            const leftFootX = shroom.x + footMargin;
            const rightFootX = shroom.x + shroom.width - footMargin;

            if (shroom.vy >= 0) {
                const footY = shroom.y + shroom.height;
                if (isTileSolidForMushroom(leftFootX, footY) || isTileSolidForMushroom(rightFootX, footY)) {
                    const tileTopEdge = Math.floor(footY / TILE_SIZE) * TILE_SIZE;
                    shroom.y = tileTopEdge - shroom.height;
                    shroom.vy = 0;
                    shroom.isGrounded = true;
                } else {
                    shroom.isGrounded = false;
                }
            } else {
                shroom.isGrounded = false;
            }

            if (!shroom.isGrounded) {
                shroom.vy += 0.25;
                if (shroom.vy > 4.0) shroom.vy = 4.0;
            }
        }

        if (typeof player !== 'undefined') {
            const isOverlapping =
                player.x < shroom.x + shroom.width &&
                player.x + player.width > shroom.x &&
                player.y < shroom.y + shroom.height &&
                player.y + player.height > shroom.y;

            if (isOverlapping) {
                if (shroom.is1Up) {

                    if (typeof playSE === 'function') {
                        playSE('1up');
                    }

                    if (typeof window.lives !== 'undefined') {
                        window.lives++;
                    }

                    if (typeof spawnScoreEffect === 'function') {
                        spawnScoreEffect(shroom.x, shroom.y, '1up');
                    }
                } else {

                    if (typeof player.triggerPowerUp === 'function') {
                        player.triggerPowerUp();
                    }
                    if (typeof addScore === 'function') { addScore(1000); }
                    if (typeof spawnScoreEffect === 'function') {
                        spawnScoreEffect(shroom.x, shroom.y, 1000);
                    }
                }

                activeMushrooms.splice(i, 1);
                continue;
            }
        }

        if (shroom.y > canvas.height + 32) {
            activeMushrooms.splice(i, 1);
        }
    }
}

function drawMushrooms() {
    for (let i = 0; i < activeMushrooms.length; i++) {
        const shroom = activeMushrooms[i];
        const screenX = Math.floor(shroom.x) - Math.floor(cameraX);
        const screenY = Math.floor(shroom.y);

        if (screenX < -shroom.width || screenX > canvas.width) continue;

        const sprite = shroom.is1Up ? upMushroomSprite : mushroomSprite;

        if (sprite.complete) {
            ctx.drawImage(sprite, screenX, screenY, shroom.width, shroom.height);
        }
    }
}
