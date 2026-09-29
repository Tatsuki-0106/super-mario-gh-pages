const activeStars = [];

const starSprites = [
    new Image(),
    new Image(),
    new Image(),
    new Image()
];

starSprites[0].src = 'sprite/items/star1.png';
starSprites[1].src = 'sprite/items/star2.png';
starSprites[2].src = 'sprite/items/star3.png';
starSprites[3].src = 'sprite/items/star4.png';

function spawnStar(blockX, blockY) {
    activeStars.push({
        x: blockX,
        y: blockY,
        width: 16,
        height: 16,
        vx: 0,
        vy: 0,
        isGrounded: true,
        riseTimer: 0,
        frameBuffer: 0,
        state: 'rising'
    });

}

function isTileSolidForStar(px, py) {
    if (px < 0 || px >= MAP_WIDTH * TILE_SIZE) return true;
    if (py < 0 || py >= MAP_HEIGHT * TILE_SIZE) return false;

    const col = Math.floor(px / TILE_SIZE);
    const row = Math.floor(py / TILE_SIZE);

    if (!tileMap[row] || tileMap[row][col] === undefined) return false;
    return tileMap[row][col] > 0;
}

function updateStars(deltaTimeOrModifier) {
    let framesToAdvance = 1;
    if (deltaTimeOrModifier < 0.5) {
        framesToAdvance = deltaTimeOrModifier * 60;
    } else {
        framesToAdvance = deltaTimeOrModifier;
    }

    for (let i = activeStars.length - 1; i >= 0; i--) {
        const star = activeStars[i];

        if (star.state === 'rising') {
            star.frameBuffer += framesToAdvance;
            while (star.frameBuffer >= 1) {
                star.frameBuffer -= 1;
                star.riseTimer++;
                star.y -= 1;

                if (star.riseTimer >= 16) {
                    star.state = 'moving';
                    star.vx = 1.0;
                    star.vy = 0;
                    star.isGrounded = false;
                    break;
                }
            }
            continue;
        }

        star.frameBuffer += framesToAdvance;
        while (star.frameBuffer >= 1) {
            star.frameBuffer -= 1;

            star.x += star.vx;

            const wallCheckTop = star.y + 2;
            const wallCheckBottom = star.y + star.height - 2;

            if (star.vx > 0) {
                if (isTileSolidForStar(star.x + star.width, wallCheckTop) || isTileSolidForStar(star.x + star.width, wallCheckBottom)) {
                    star.vx = -1.0;

                    star.x = Math.floor((star.x + star.width) / TILE_SIZE) * TILE_SIZE - star.width;
                }
            } else if (star.vx < 0) {
                if (isTileSolidForStar(star.x, wallCheckTop) || isTileSolidForStar(star.x, wallCheckBottom)) {
                    star.vx = 1.0;

                    star.x = (Math.floor(star.x / TILE_SIZE) + 1) * TILE_SIZE;
                }
            }

            star.y += star.vy;
            const headFootMargin = 2;
            const checkLeftX = star.x + headFootMargin;
            const checkRightX = star.x + star.width - headFootMargin;

            if (star.vy > 0) {

                const footY = star.y + star.height;
                if (isTileSolidForStar(checkLeftX, footY) || isTileSolidForStar(checkRightX, footY)) {

                    star.vy = -6;

                    const tileTopEdge = Math.floor(footY / TILE_SIZE) * TILE_SIZE;
                    star.y = tileTopEdge - star.height;
                    star.isGrounded = false;
                }
            } else if (star.vy < 0) {

                const headY = star.y;
                if (isTileSolidForStar(checkLeftX, headY) || isTileSolidForStar(checkRightX, headY)) {
                    star.vy = 0.5;

                    const tileBottomEdge = (Math.floor(headY / TILE_SIZE) + 1) * TILE_SIZE;
                    star.y = tileBottomEdge;
                }
            }

            star.vy += 0.45;
            if (star.vy > 6.0) star.vy = 6.0;
        }

        if (typeof player !== 'undefined') {

            const starHitbox = {
                left:   star.x + 2,
                right:  star.x + 14,
                top:    star.y + 2,
                bottom: star.y + 14
            };

            const playerHitbox = {
                left:   player.x,
                right:  player.x + player.width,
                top:    player.y,
                bottom: player.y + player.height
            };

            const isIntersecting =
                playerHitbox.left   < starHitbox.right  &&
                playerHitbox.right  > starHitbox.left   &&
                playerHitbox.top    < starHitbox.bottom &&
                playerHitbox.bottom > starHitbox.top;

            if (isIntersecting) {

                if (typeof player !== 'undefined') {
                    player.isInvincible = true;
                    if (typeof refreshPlayerSpriteFolders === 'function') {
                        refreshPlayerSpriteFolders();
                    }

                    if (typeof stopAllBGM === 'function') {
                        stopAllBGM();
                    }
                    if (typeof startBGM === 'function') {
                        startBGM('star');
                    }
                }

                if (typeof playSE === 'function') {
                    playSE('powerup');
                }

                if (typeof addScore === 'function') {
                    addScore(1000);
                }
                if (typeof spawnScoreEffect === 'function') {
                    spawnScoreEffect(star.x, star.y, 1000);
                }

                activeStars.splice(i, 1);
                continue;
            }
        }

        if (star.y > canvas.height + 32) {
            activeStars.splice(i, 1);
        }
    }
}

function drawStars() {
    for (let i = 0; i < activeStars.length; i++) {
        const star = activeStars[i];
        const screenX = Math.floor(star.x) - Math.floor(cameraX);
        const screenY = Math.floor(star.y);

        if (screenX < -star.width || screenX > canvas.width) continue;

        const currentStep = Math.floor(globalFrameCounter / 4);
        const animIndex = currentStep % 4;

        const sprite = starSprites[animIndex];
        if (sprite && sprite.complete) {
            ctx.drawImage(sprite, screenX, screenY, star.width, star.height);
        }
    }
}
