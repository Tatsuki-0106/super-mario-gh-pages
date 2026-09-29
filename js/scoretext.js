const activeScoreEffects = [];

const scoreEffectSprites = {};
const scoreKeys = ['100', '200', '400', '800', '1000', '2000', '4000', '8000', '1up'];
scoreKeys.forEach(key => {
    scoreEffectSprites[key] = new Image();
    scoreEffectSprites[key].src = `sprite/others/${key}.png`;
});

function spawnScoreEffect(mapX, mapY, amount) {
    const scoreStr = String(amount);

    if (scoreEffectSprites[scoreStr]) {

        const screenY = mapY;

        activeScoreEffects.push({
            x: mapX,
            y: screenY,
            scoreKey: scoreStr,
            timer: 32,
            frameBuffer: 0,
            isGoalScore: false
        });

        }, ${Math.floor(screenY)})`);
    }
}

function updateScoreEffects(dtModifier = 1.0) {
    for (let i = activeScoreEffects.length - 1; i >= 0; i--) {
        const effect = activeScoreEffects[i];

        effect.frameBuffer += dtModifier;
        while (effect.frameBuffer >= 1) {
            effect.frameBuffer -= 1;

            if (effect.isGoalScore) {
                if (typeof goalPoleFlag !== 'undefined' && goalPoleFlag.isInitialized && !goalPoleFlag.isFinished) {
                    effect.y -= 2.0;
                }
            } else {

                effect.y -= 1.0;
            }

            if (!effect.isGoalScore) {
                effect.timer--;
            }

            if (effect.timer <= 0) {
                activeScoreEffects.splice(i, 1);
                break;
            }
        }
    }
}

function drawScoreEffects() {
    const currentCamX = (typeof cameraX !== 'undefined') ? cameraX : 0;

    for (let i = 0; i < activeScoreEffects.length; i++) {
        const effect = activeScoreEffects[i];

        let screenX = 0;

        if (effect.isGoalScore) {

            screenX = Math.floor(effect.x) - Math.floor(currentCamX);
        } else {

            screenX = Math.floor(effect.x) - Math.floor(currentCamX);

        }

        if (!effect.isGoalScore) {
            if (effect.fixedScreenX === undefined) {

                effect.fixedScreenX = Math.floor(effect.x) - Math.floor(currentCamX);
            }

            screenX = effect.fixedScreenX;
        }

        const screenY = Math.floor(effect.y);

        if (screenX < -32 || screenX > canvas.width) continue;

        const sprite = scoreEffectSprites[effect.scoreKey];
        if (sprite && sprite.complete) {
            ctx.drawImage(sprite, screenX, screenY);
        }
    }
}
