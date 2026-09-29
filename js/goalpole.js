// =================================================================
// 🏁 goalpole.js : ゴールポール（旗・球・棒）微調整対応・動的描画システム（ズレ完全修正版）
// =================================================================

const goalSprites = {
    90: new Image(), // ポール最上部の球体 (ball.png)
    91: new Image(), // ポールの棒パーツ (stick.png)
    92: new Image()  // ポールに下がる旗 (flags.png)
};

// 🖼️ アセットフォルダからスプライトを読み込みお！
goalSprites[90].src = 'sprite/tileset/ball.png';
goalSprites[91].src = 'sprite/tileset/stick.png';
goalSprites[92].src = 'sprite/tileset/flags.png';

/**
 * 🎨 タイルマップ上のゴールポール（90, 91, 92）を画面に描画するヘルパー
 * @param {number} tileType - タイルの番号 (90〜92)
 * @param {number} screenX - カメラ座標を引いた画面上のX
 * @param {number} screenY - 画面上のY
 */
function drawGoalPoleTile(tileType, screenX, screenY) {
    const sprite = goalSprites[tileType];
    
    if (sprite && sprite.complete) {
        let finalX = screenX;
        let finalY = screenY;

        // ─── 💥【核心修正】旗（92番）の時だけ描画位置をピクセル単位でズラすお！ ───
        if (tileType === 92) {
            finalX += 8; // 右に 8px ズラす
            finalY += 1; // 下に 1px ズラす
        }

        // ズレを適用した座標で正確にレンダリングお！
        ctx.drawImage(sprite, finalX, finalY, TILE_SIZE, TILE_SIZE);
    }
}

const goalPoleFlag = {
    x: 0,
    y: 0,
    isInitialized: false,
    isFinished: false, // 💥【新設！】旗が下がりきったら true になるフラグお！
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
        this.isFinished = false; // 初期化時はもちろん false だお！
        console.log("🚩 goalpole.js: 旗の動的同期システムが起動したおぶ！！！");
    },

    update: function(dtModifier = 1.0) {
        if (!this.isInitialized) return;

        if (player.playerState === 0x0A) {
            if (this.y < this.targetY) {
                this.y += 2.0 * dtModifier; 
                if (this.y >= this.targetY) {
                    this.y = this.targetY; 
                    this.isFinished = true; // 💥【ここだお！】ポールの根本で止まったらフラグON！
                    console.log("🚩 旗がポールの最下部まで下がりきったおぶ！！！");
                }
            } else {
                this.isFinished = true; // すでに下がりきっている場合も安全にON
            }
        }
    },
    // draw関数は変更なし
    draw: function() {
        if (!this.isInitialized) return;
        const screenX = Math.floor(this.x) - Math.floor(cameraX);
        const screenY = Math.floor(this.y);
        if (screenX >= -TILE_SIZE && screenX <= canvas.width) {
            drawGoalPoleTile(92, screenX, screenY);
        }
    }
};
