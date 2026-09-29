// =================================================================
// 🌸 flower.js : ファイアフラワー（ID: 12）実機仕様せり上がり＆点滅システム
// =================================================================

// 👑 アクティブなフラワーオブジェクトの管理配列だお！
const activeFlowers = [];

// 🖼️ フラワーのカラーアニメーションスプライト（4段階パレットトグル）
const flowerSprites = [
    new Image(),
    new Image(),
    new Image(),
    new Image()
];

// 💡 本物のアセットフォルダから4枚の回転パレットを爆速ロード！
flowerSprites[0].src = 'sprite/items/flower1.png';
flowerSprites[1].src = 'sprite/items/flower2.png';
flowerSprites[2].src = 'sprite/items/flower3.png';
flowerSprites[3].src = 'sprite/items/flower4.png';

/**
 * 🌸 ブロック（ID: 12）からファイアフラワーをせり上がらせる初期化ポップ関数
 */
function spawnFlower(blockX, blockY) {
    activeFlowers.push({
        x: blockX,
        y: blockY,
        width: 16,
        height: 16,
        riseTimer: 0,      // ⏳ 16フレームの上昇カウンタお！
        frameBuffer: 0,    // デルタタイム小数点補正バッファ
        state: 'rising'    // 'rising'(せり上がり中) -> 'idle'(その場で静止パタパタ)
    });
    console.log("🌸 はてなブロックから本物のファイアフラワーがポップしたおぶ！！！ｗｗｗ");
}

/**
 * 🔄 フラワーのせり上がり ＆ 4Fホールド点滅ライフサイクルを毎フレーム更新！
 */
function updateFlowers(deltaTimeOrModifier) {
    let framesToAdvance = 1;
    if (deltaTimeOrModifier < 0.5) {
        framesToAdvance = deltaTimeOrModifier * 60;
    } else {
        framesToAdvance = deltaTimeOrModifier;
    }

    for (let i = activeFlowers.length - 1; i >= 0; i--) {
        const flower = activeFlowers[i];

        // 📈 ① じわじわせり上がるフェーズ（16フレーム）
        if (flower.state === 'rising') {
            flower.frameBuffer += framesToAdvance;
            while (flower.frameBuffer >= 1) {
                flower.frameBuffer -= 1;
                flower.riseTimer++;
                flower.y -= 1; // 1フレームあたり1pxづつジャスト上昇お！

                if (flower.riseTimer >= 16) {
                    flower.state = 'idle'; // 出現しきったらその場にガチッと静止！
                    console.log("🌸 フラワーが完全に咲いたお！マリオの「ごっくん」待機モード突入おぶ！！！");
                    break;
                }
            }
            continue; // 出現中は以下の処理をスキップお
        }

        // 🎯 ② マリオとファイアフラワーの接触判定（12×12pxの実機縮小ボックス仕様！）
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
                console.log("🔥 ファイアフラワーを獲得！！！ 虹色トグルカラー変身タスクをキックおぶ！！！ｗｗｗ");
                
                // 👑【大開通！】さっきマリオ側に作ったフラワー変身関数を呼び出し、40Fの虹色ロックを始動！
                if (typeof player.triggerFlowerPowerUp === 'function') {
                    player.triggerFlowerPowerUp();
                }
                
                // 🔊 SE再生：キノコと同じパワーアップ変身音をキックお！
                if (typeof playSE === 'function') {
                    playSE('powerup'); 
                }

                // 📊 獲得スコア1000点ドンと追加 ＆ フワフワ数字ポップアップを完全連動リンクお！
                if (typeof addScore === 'function') { addScore(1000); }
                if (typeof spawnScoreEffect === 'function') {
                    spawnScoreEffect(flower.x, flower.y, 1000);
                }

                activeFlowers.splice(i, 1); // 食べたのでメモリ消滅！
                continue;
            }
        }
    }
}

/**
 * 🎬 ファイアフラワーの4フレームホールド・カラーパレット瞬間切り替えレンダリング関数お！
 */
function drawFlowers() {
    for (let i = 0; i < activeFlowers.length; i++) {
        const flower = activeFlowers[i];
        const screenX = Math.floor(flower.x) - Math.floor(cameraX);
        const screenY = Math.floor(flower.y);

        if (screenX < -flower.width || screenX > canvas.width) continue;

        // 👑 本家実機周期：4フレームの間は同じ画像をホールドし、4F経った瞬間にカチッとカクカク切り替え！
        const currentStep = Math.floor(globalFrameCounter / 4);
        const animIndex = currentStep % 4;

        const sprite = flowerSprites[animIndex];
        if (sprite && sprite.complete) {
            ctx.drawImage(sprite, screenX, screenY, flower.width, flower.height);
        }
    }
}
