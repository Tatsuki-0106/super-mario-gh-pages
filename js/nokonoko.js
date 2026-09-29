const nokonokoSprites = {
    walk1: new Image(),
    walk2: new Image(),
    shell: new Image(),
    shellFeet: new Image()
};

nokonokoSprites.walk1.src     = 'sprite/enemies/nokonoko1.png';
nokonokoSprites.walk2.src     = 'sprite/enemies/nokonoko2.png';
nokonokoSprites.shell.src     = 'sprite/enemies/shell.png';
nokonokoSprites.shellFeet.src = 'sprite/enemies/shell_feet.png';

function spawnNokonoko(mapX, mapY, color = 'green') {
    if (typeof activeEnemies === 'undefined') window.activeEnemies = [];

    activeEnemies.push({
        type: 'nokonoko',
        subType: color,
        x: mapX,
        y: mapY - 8,
        width: 16,
        height: 24,

        vx: -0.5,
        vy: 0,
        direction: -1,

        enemyState: 0x00,
        reviveTimer: 0,
        animTimer: 0
    });
}

function updateNokonokoLogic(enemy, dtModifier) {

    if (enemy.enemyState === 0x04) {
        enemy.height = 16;

        enemy.vy += 0.25 * dtModifier;
        enemy.x += enemy.vx * dtModifier;
        enemy.y += enemy.vy * dtModifier;
        return;
    }

    if (enemy.enemyState === 0x00) {
        enemy.height = 24;
        enemy.x += enemy.vx * dtModifier;
        enemy.animTimer += dtModifier;

        const wallCheckY = enemy.y + enemy.height - 4;
        if (enemy.vx > 0 && player.isSolid(enemy.x + enemy.width, wallCheckY)) {
            enemy.vx = -0.5;
            enemy.direction = -1;
            enemy.x = Math.floor((enemy.x + enemy.width) / TILE_SIZE) * TILE_SIZE - enemy.width;
        } else if (enemy.vx < 0 && player.isSolid(enemy.x, wallCheckY)) {
            enemy.vx = 0.5;
            enemy.direction = 1;
            enemy.x = (Math.floor(enemy.x / TILE_SIZE) + 1) * TILE_SIZE;
        }

        if (enemy.subType === 'red') {
            const nextCheckX = enemy.vx > 0 ? (enemy.x + enemy.width) : enemy.x;
            const dropCheckY = enemy.y + enemy.height + 1;
            if (!player.isSolid(nextCheckX, dropCheckY)) {
                enemy.vx = -enemy.vx;
                enemy.direction = enemy.vx > 0 ? 1 : -1;
                enemy.x += enemy.direction * 1.0;
            }
        }

    } else if (enemy.enemyState === 0x02) {
        enemy.height = 16;
        enemy.vx = 0;
        enemy.reviveTimer -= dtModifier;

        if (enemy.reviveTimer <= 0) {
            enemy.enemyState = 0x00;
            enemy.height = 24;
            enemy.y -= 8;

            if (typeof player !== 'undefined') {
                enemy.direction = (enemy.x + enemy.width / 2 > player.x + player.width / 2) ? 1 : -1;

                enemy.vx = enemy.direction * 0.5;
            }
        }

    } else if (enemy.enemyState === 0x03) {
        enemy.height = 16;
        enemy.x += enemy.vx * dtModifier;

        const wallCheckY = enemy.y + enemy.height - 4;
        if (enemy.vx > 0 && player.isSolid(enemy.x + enemy.width, wallCheckY)) {
            enemy.vx = -3.0;
            enemy.direction = -1;
            enemy.x = Math.floor((enemy.x + enemy.width) / TILE_SIZE) * TILE_SIZE - enemy.width;
            if (typeof playSE === 'function') playSE('bump');
        } else if (enemy.vx < 0 && player.isSolid(enemy.x, wallCheckY)) {
            enemy.vx = 3.0;
            enemy.direction = 1;
            enemy.x = (Math.floor(enemy.x / TILE_SIZE) + 1) * TILE_SIZE;
            if (typeof playSE === 'function') playSE('bump');
        }
    }

    enemy.y += enemy.vy * dtModifier;
    const footCheckY = enemy.y + enemy.height;
    const leftFootX = enemy.x + 2;
    const rightFootX = enemy.x + enemy.width - 2;

    if (player.isSolid(leftFootX, footCheckY) || player.isSolid(rightFootX, footCheckY)) {
        enemy.y = Math.floor(footCheckY / TILE_SIZE) * TILE_SIZE - enemy.height;
        enemy.vy = 0;
    } else {
        enemy.vy += 0.28125 * dtModifier;
        if (enemy.vy > 4.5) enemy.vy = 4.5;
    }
}

function drawNokonoko(enemy, screenX, screenY) {
    ctx.save();

    if (enemy.enemyState === 0x04) {
        ctx.translate(screenX + enemy.width / 2, screenY + enemy.height / 2);
        ctx.scale(1, -1);
        if (nokonokoSprites.shell.complete) {
            ctx.drawImage(nokonokoSprites.shell, -enemy.width / 2, -enemy.height / 2, 16, 16);
        }
        ctx.restore();
        return;
    }

    if (enemy.direction === 1) {
        ctx.translate(screenX + enemy.width / 2, screenY);
        ctx.scale(-1, 1);
        screenX = -enemy.width / 2;
        screenY = 0;
    }

    if (enemy.enemyState === 0x00) {
        const isFrame2 = Math.floor(enemy.animTimer / 12) % 2 === 0;
        const img = isFrame2 ? nokonokoSprites.walk2 : nokonokoSprites.walk1;
        if (img.complete) ctx.drawImage(img, screenX, screenY, enemy.width, enemy.height);

    } else if (enemy.enemyState === 0x02) {
        const isWiggling = enemy.reviveTimer <= 64;
        const img = isWiggling ? nokonokoSprites.shellFeet : nokonokoSprites.shell;
        if (img.complete) ctx.drawImage(img, screenX, screenY, 16, 16);

    } else if (enemy.enemyState === 0x03) {
        if (nokonokoSprites.shell.complete) {
            ctx.drawImage(nokonokoSprites.shell, screenX, screenY, 16, 16);
        }
    }

    ctx.restore();
}
