const goalSprites = {
    90: new Image(),
    91: new Image(),
    92: new Image()
};

goalSprites[90].src = 'sprite/tileset/ball.png';
goalSprites[91].src = 'sprite/tileset/stick.png';
goalSprites[92].src = 'sprite/tileset/flags.png';

function drawGoalPoleTile(tileType, screenX, screenY) {
    const sprite = goalSprites[tileType];

    if (sprite && sprite.complete) {
        let finalX = screenX;
        let finalY = screenY;

        if (tileType === 92) {
            finalX += 8;
            finalY += 1;
        }

        ctx.drawImage(sprite, finalX, finalY, TILE_SIZE, TILE_SIZE);
    }
}

const goalPoleFlag = {
    x: 0,
    y: 0,
    isInitialized: false,
    isFinished: false,
    startY: 0,
    targetY: 0,

    init: function(poleCol) {
        if (this.isInitialized) return;

        let flagRow = -1;
        let actualFlagCol = poleCol - 1;

        for (let c = poleCol - 1; c <= poleCol; c++) {
            for (let r = 0; r < MAP_HEIGHT; r++) {
                if (tileMap[r] && tileMap[r][c] === 92) {
                    flagRow = r;
                    actualFlagCol = c;
                    tileMap[r][c] = 0;
                    break;
                }
            }
            if (flagRow !== -1) break;
        }

        if (flagRow === -1) flagRow = 3;

        this.x = (poleCol - 1) * TILE_SIZE;
        this.y = flagRow * TILE_SIZE;

        this.startY = this.y;
        this.targetY = 11 * TILE_SIZE;

        this.isInitialized = true;
        this.isFinished = false;

    },

    update: function(dtModifier = 1.0) {
        if (!this.isInitialized) return;

        if (player.playerState === 0x0A) {
            if (this.y < this.targetY) {
                this.y += 2.0 * dtModifier;
                if (this.y >= this.targetY) {
                    this.y = this.targetY;
                    this.isFinished = true;

                }
            } else {
                this.isFinished = true;
            }
        }
    },

    draw: function() {
        if (!this.isInitialized) return;
        const screenX = Math.floor(this.x) - Math.floor(cameraX);
        const screenY = Math.floor(this.y);
        if (screenX >= -TILE_SIZE && screenX <= canvas.width) {
            drawGoalPoleTile(92, screenX, screenY);
        }
    }
};
