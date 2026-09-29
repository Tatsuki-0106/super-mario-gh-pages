const activeFlowers = [];

const flowerSprites = [
    new Image(),
    new Image(),
    new Image(),
    new Image()
];

flowerSprites[0].src = 'sprite/items/flower1.png';
flowerSprites[1].src = 'sprite/items/flower2.png';
flowerSprites[2].src = 'sprite/items/flower3.png';
flowerSprites[3].src = 'sprite/items/flower4.png';

function spawnFlower(blockX, blockY) {
    activeFlowers.push({
        x: blockX,
        y: blockY,
        width: 16,
        height: 16,
        riseTimer: 0,
        frameBuffer: 0,
        state: 'rising'
    });

}

function updateFlowers(deltaTimeOrModifier) {
    let framesToAdvance = 1;
    if (deltaTimeOrModifier < 0.5) {
        framesToAdvance = deltaTimeOrModifier * 60;
    } else {
        framesToAdvance = deltaTimeOrModifier;
    }

    for (let i = activeFlowers.length - 1; i >= 0; i--) {
        const flower = activeFlowers[i];

        if (flower.state === 'rising') {
            flower.frameBuffer += framesToAdvance;
            while (flower.frameBuffer >= 1) {
                flower.frameBuffer -= 1;
                flower.riseTimer++;
                flower.y -= 1;

                if (flower.riseTimer >= 16) {
                    flower.state = 'idle';

                    break;
                }
            }
            continue;
        }

        if (typeof player !== 'undefined') {
            const flowerHitbox = {
                left:   flower.x + 2,
                right:  flower.x + 14,
                top:    flower.y + 2,
                bottom: flower.y + 14
            };

            const playerHitbox = {
                left:   player.x,
                right:  player.x + player.width,
                top:    player.y,
                bottom: player.y + player.height
            };

            const isIntersecting =
                playerHitbox.left   < flowerHitbox.right  &&
                playerHitbox.right  > flowerHitbox.left   &&
                playerHitbox.top    < flowerHitbox.bottom &&
                playerHitbox.bottom > flowerHitbox.top;

            if (isIntersecting) {

                if (typeof player.triggerFlowerPowerUp === 'function') {
                    player.triggerFlowerPowerUp();
                }

                if (typeof playSE === 'function') {
                    playSE('powerup');
                }

                if (typeof addScore === 'function') { addScore(1000); }
                if (typeof spawnScoreEffect === 'function') {
                    spawnScoreEffect(flower.x, flower.y, 1000);
                }

                activeFlowers.splice(i, 1);
                continue;
            }
        }
    }
}

function drawFlowers() {
    for (let i = 0; i < activeFlowers.length; i++) {
        const flower = activeFlowers[i];
        const screenX = Math.floor(flower.x) - Math.floor(cameraX);
        const screenY = Math.floor(flower.y);

        if (screenX < -flower.width || screenX > canvas.width) continue;

        const currentStep = Math.floor(globalFrameCounter / 4);
        const animIndex = currentStep % 4;

        const sprite = flowerSprites[animIndex];
        if (sprite && sprite.complete) {
            ctx.drawImage(sprite, screenX, screenY, flower.width, flower.height);
        }
    }
}
