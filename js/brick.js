const animatingBricks = [];

const activeDebris = [];

const debrisSprite = new Image();
debrisSprite.src = 'sprite/items/debris.png';

function checkBrickBlockHit(px, py) {
    const col = Math.floor(px / TILE_SIZE);
    const row = Math.floor(py / TILE_SIZE);

    if (!tileMap[row] || tileMap[row][col] === undefined) return;

    if (tileMap[row][col] === 2) {

        const isAlreadyAnimating = animatingBricks.some(b => b.col === col && b.row === row);
        if (isAlreadyAnimating) return;

        const blockBaseX = col * TILE_SIZE;
        const blockBaseY = row * TILE_SIZE;

if (typeof player !== 'undefined' && player.isSuper) {

    playSE('brick');

    if (typeof addScore === 'function') { addScore(50); }

            tileMap[row][col] = 0;

            activeDebris.length = 0;

            activeDebris.push({ x: blockBaseX,     y: blockBaseY,     vx: -1.0, vy: -4.0 });

            activeDebris.push({ x: blockBaseX + 8, y: blockBaseY,     vx: 1.0,  vy: -4.0 });

            activeDebris.push({ x: blockBaseX,     y: blockBaseY + 8, vx: -1.0, vy: -2.0 });

            activeDebris.push({ x: blockBaseX + 8, y: blockBaseY + 8, vx: 1.0,  vy: -2.0 });

        } else {
            playSE('bump');

            tileMap[row][col] = 0;

            animatingBricks.push({
                col: col,
                row: row,
                baseX: blockBaseX,
                baseY: blockBaseY,
                timer: 0
            });

        }

        if (typeof triggerBlockHitShockwave === 'function') {
            triggerBlockHitShockwave(col, row);
        }
    }
}

function updateRisingBricks(deltaTimeOrModifier) {
    let framesToAdvance = 1;
    if (deltaTimeOrModifier < 0.5) {
        framesToAdvance = deltaTimeOrModifier * 60;
    } else {
        framesToAdvance = deltaTimeOrModifier;
    }

    for (let i = animatingBricks.length - 1; i >= 0; i--) {
        const brick = animatingBricks[i];
        brick.timer += framesToAdvance;

        if (brick.timer >= 12) {
            tileMap[brick.row][brick.col] = 2;
            animatingBricks.splice(i, 1);
        }
    }

    for (let i = activeDebris.length - 1; i >= 0; i--) {
        const deb = activeDebris[i];

        deb.x += deb.vx * framesToAdvance;
        deb.y += deb.vy * framesToAdvance;

        deb.vy += 0.25 * framesToAdvance;

        if (deb.y > 240) {
            activeDebris.splice(i, 1);
        }
    }
}

function drawRisingBricks() {

    for (let i = 0; i < animatingBricks.length; i++) {
        const brick = animatingBricks[i];

        let offsetY = 0;
        const currentFrame = Math.floor(brick.timer);

        if (currentFrame <= 6) {
            offsetY = -Math.floor((currentFrame / 6) * 4);
        } else if (currentFrame <= 12) {
            offsetY = -4 + Math.floor(((currentFrame - 6) / 6) * 4);
        }

        const screenX = brick.baseX - cameraX;
        const screenY = brick.baseY + offsetY;

        if (screenX >= -TILE_SIZE && screenX <= canvas.width && screenY >= -TILE_SIZE) {
            if (tileSprites && tileSprites[2]) {
                ctx.drawImage(tileSprites[2], screenX, screenY, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    for (let i = 0; i < activeDebris.length; i++) {
        const deb = activeDebris[i];

        const screenX = Math.floor(deb.x) - Math.floor(cameraX);
        const screenY = Math.floor(deb.y);

        if (screenX >= -8 && screenX <= canvas.width && screenY >= -8 && screenY <= canvas.height) {
            if (debrisSprite.complete) {
                ctx.drawImage(debrisSprite, screenX, screenY, 8, 8);
            }
        }
    }
}
