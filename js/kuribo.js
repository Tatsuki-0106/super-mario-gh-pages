const kuriboSprites = {
    walk: new Image(),
    dead: new Image()
};

kuriboSprites.walk.src = 'sprite/enemies/kuribo.png';
kuriboSprites.dead.src = 'sprite/enemies/kuribo_dead.png';

let lastSpawnedKuriboCol = -1;
let kuriboComboCount = 0;

function spawnKuribo(mapX, mapY, col = -1) {
    if (typeof activeEnemies === 'undefined') window.activeEnemies = [];

    const isDuplicate = activeEnemies.some(e => e.type === 'kuribo' && e.enemyState === 0x00 && Math.abs(e.x - mapX) < 4);
    if (isDuplicate) return;

    let offsetX = 0;

    if (col !== -1) {
        if (lastSpawnedKuriboCol !== -1) {

            const colDistance = col - lastSpawnedKuriboCol;

            if (colDistance === 2) {
                kuriboComboCount++;
            } else {
                kuriboComboCount = 0;
            }
        } else {
            kuriboComboCount = 0;
        }

        switch (kuriboComboCount) {
            case 0:

                offsetX = 0;
                break;
            case 1:

                offsetX = -8;

                break;
            case 2:

                offsetX = 0;

                break;
            case 3:

                offsetX = -16;

                break;
            default:

                if (kuriboComboCount % 2 === 1) {
                    offsetX = -8 * Math.ceil(kuriboComboCount / 2);
                } else {
                    offsetX = -8 * (kuriboComboCount / 2);
                }
                break;
        }

        lastSpawnedKuriboCol = col;
    }

    const finalX = mapX + offsetX;

    activeEnemies.push({
        type: 'kuribo',
        x: finalX,
        y: mapY,
        width: 16,
        height: 16,
        vx: -0.5,
        vy: 0,
        enemyState: 0x00,
        deadTimer: 0
    });
}

function updateKuriboLogic(enemy, dtModifier) {
    if (enemy.enemyState === 0x02) {
        enemy.deadTimer += dtModifier;
        enemy.vx = 0; enemy.vy = 0;
        enemy.height = 8;
        if (enemy.deadTimer >= 32) {
            const index = activeEnemies.indexOf(enemy);
            if (index !== -1) activeEnemies.splice(index, 1);
        }
        return;
    }

    if (enemy.enemyState === 0x04) {
        enemy.vy += 0.25 * dtModifier;
        enemy.x += enemy.vx * dtModifier;
        enemy.y += enemy.vy * dtModifier;
        return;
    }

    if (enemy.enemyState === 0x00) {
        enemy.vy += 0.28125 * dtModifier;
        if (enemy.vy > 4.5) enemy.vy = 4.5;

        enemy.x += enemy.vx * dtModifier;

        const wallCheckY = enemy.y + enemy.height - 4;
        if (enemy.vx > 0 && player.isSolid(enemy.x + enemy.width, wallCheckY)) {
            enemy.x = Math.floor((enemy.x + enemy.width) / TILE_SIZE) * TILE_SIZE - enemy.width;
            enemy.vx = -0.5;
        } else if (enemy.vx < 0 && player.isSolid(enemy.x, wallCheckY)) {
            enemy.x = (Math.floor(enemy.x / TILE_SIZE) + 1) * TILE_SIZE;
            enemy.vx = 0.5;
        }

        enemy.y += enemy.vy * dtModifier;
        const footCheckY = enemy.y + enemy.height;
        const leftFootX = enemy.x + 2;
        const rightFootX = enemy.x + enemy.width - 2;

        if (player.isSolid(leftFootX, footCheckY) || player.isSolid(rightFootX, footCheckY)) {
            enemy.y = Math.floor(footCheckY / TILE_SIZE) * TILE_SIZE - enemy.height;
            enemy.vy = 0;
        }
    }
}

function drawKuribo(enemy, screenX, screenY, globalFrameCounter) {
    ctx.save();

    if (enemy.enemyState === 0x04) {
        ctx.translate(screenX + enemy.width / 2, screenY + enemy.height / 2);
        ctx.scale(1, -1);
        if (kuriboSprites.walk.complete) {
            ctx.drawImage(kuriboSprites.walk, -enemy.width / 2, -enemy.height / 2, enemy.width, enemy.height);
        }
    } else if (enemy.enemyState === 0x02) {
        if (kuriboSprites.dead.complete) {
            ctx.drawImage(kuriboSprites.dead, screenX, screenY + 8, 16, 8);
        }
    } else {
        const isFlipped = (Math.floor(globalFrameCounter) & 8) !== 0;
        if (kuriboSprites.walk.complete) {
            if (isFlipped) {
                ctx.translate(screenX + enemy.width / 2, screenY);
                ctx.scale(-1, 1);
                ctx.drawImage(kuriboSprites.walk, -enemy.width / 2, 0, enemy.width, enemy.height);
            } else {
                ctx.drawImage(kuriboSprites.walk, screenX, screenY, enemy.width, enemy.height);
            }
        }
    }

    ctx.restore();
}
