const activeFireballs = [];

const fireballSprite = new Image();
fireballSprite.src = 'sprite/items/fireball.png';

const explosionSprites = [
    new Image(),
    new Image(),
    new Image()
];

explosionSprites[0].src = 'sprite/items/explosion1.png';
explosionSprites[1].src = 'sprite/items/explosion2.png';
explosionSprites[2].src = 'sprite/items/explosion3.png';

function shootFireball() {
    if (typeof player === 'undefined' || !player.isFire || player.isFlowerTransforming) return;

    if (activeFireballs.length >= 2) return;

    const marioCenterX = player.x + player.width / 2;
    const spawnX = marioCenterX + (player.direction * 12) - 4;

    let spawnY = player.y + 12;

    if (player.height === 24) {
        spawnY = (player.y + 24) - 12;
    }

    activeFireballs.push({
        x: spawnX,
        y: spawnY,
        width: 8,
        height: 8,

        vx: player.direction * 5.0,

        vy: 1.0,
        state: 'moving',
        expTimer: 0,
        frameBuffer: 0
    });

    player.throwMotionTimer = 12;

    if (typeof playSE === 'function') {
        playSE('fireball');
    }
}

function updateFireballs(dtModifier = 1.0) {
    for (let i = activeFireballs.length - 1; i >= 0; i--) {
        const ball = activeFireballs[i];

        if (ball.state === 'exploding') {
            ball.frameBuffer += dtModifier;
            while (ball.frameBuffer >= 1) {
                ball.frameBuffer -= 1;
                ball.expTimer++;

                if (ball.expTimer >= 18) {
                    activeFireballs.splice(i, 1);
                    break;
                }
            }
            continue;
        }

        ball.frameBuffer += dtModifier;
        while (ball.frameBuffer >= 1) {
            ball.frameBuffer -= 1;

            ball.x += ball.vx;

            const wallCheckX = ball.vx > 0 ? (ball.x + ball.width) : ball.x;
            const wallCheckY = ball.y + ball.height / 2;

            if (typeof player !== 'undefined' && player.isSolid(wallCheckX, wallCheckY)) {

                ball.state = 'exploding';
                ball.expTimer = 0;
                if (typeof playSE === 'function') playSE('bump');
                break;
            }

            ball.y += ball.vy;

            ball.vy += 0.25;
            if (ball.vy > 4.5) ball.vy = 4.5;

            const footCheckY = ball.y + ball.height;
            const centerX = ball.x + ball.width / 2;

            if (typeof player !== 'undefined' && player.isSolid(centerX, footCheckY)) {

                ball.vy = -4.0;

                ball.y = Math.floor(footCheckY / 16) * 16 - ball.height;
            }
        }

        if (ball.state === 'exploding') continue;

        if (typeof activeEnemies !== 'undefined') {
            for (let j = 0; j < activeEnemies.length; j++) {
                const enemy = activeEnemies[j];

                if (enemy.enemyState === 0x04 || (enemy.type === 'kuribo' && enemy.enemyState === 0x02)) continue;

                const enemyHeight = (enemy.type === 'nokonoko' && (enemy.enemyState === 0x02 || enemy.enemyState === 0x03)) ? 16 : enemy.height;
                const enemyY = (enemy.type === 'nokonoko' && (enemy.enemyState === 0x02 || enemy.enemyState === 0x03)) ? (enemy.y + 8) : enemy.y;

                const isHit =
                    ball.x < enemy.x + enemy.width &&
                    ball.x + ball.width > enemy.x &&
                    ball.y < enemyY + enemyHeight &&
                    ball.y + ball.height > enemyY;

                if (isHit) {

                    enemy.enemyState = 0x04;
                    enemy.height = 16;
                    enemy.vy = -3.5;

                    enemy.vx = ball.vx > 0 ? 1.0 : -1.0;

                    if (typeof playSE === 'function') {
                        playSE('kickkill');
                    }

                    if (typeof addScore === 'function') { addScore(200); }
                    if (typeof spawnScoreEffect === 'function') {
                        spawnScoreEffect(enemy.x, enemy.y, 200);
                    }

                    ball.state = 'exploding';
                    ball.expTimer = 0;
                    break;
                }
            }
        }

        if (ball.x < cameraX - 16 || ball.x > cameraX + 272 || ball.y > 245) {
            activeFireballs.splice(i, 1);
        }
    }
}

function drawFireballs() {
    for (let i = 0; i < activeFireballs.length; i++) {
        const ball = activeFireballs[i];
        const screenX = Math.floor(ball.x) - Math.floor(cameraX);
        const screenY = Math.floor(ball.y);

        if (screenX < -16 || screenX > canvas.width) continue;

        if (ball.state === 'exploding') {

            const step = Math.floor(ball.expTimer / 6);
            const sprite = explosionSprites[step];
            if (sprite && sprite.complete) {

                ctx.drawImage(sprite, screenX - 4, screenY - 4, 16, 16);
            }
        } else {

            ctx.save();
            ctx.translate(screenX + 4, screenY + 4);

            const rotStep = Math.floor(globalFrameCounter / 4) % 4;
            if (rotStep === 1) ctx.scale(-1, 1);
            if (rotStep === 2) ctx.scale(1, -1);
            if (rotStep === 3) ctx.scale(-1, -1);

            if (fireballSprite.complete) {
                ctx.drawImage(fireballSprite, -4, -4, 8, 8);
            }
            ctx.restore();
        }
    }
}
