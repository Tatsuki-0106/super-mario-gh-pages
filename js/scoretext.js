// =================================================================
// ✨ scoretext.js : 【画面完全固定版】ポップアップスコアシステム
// =================================================================

// 💥 画面内に現在表示されているスコア数字オブジェクトの管理配列だお！
const activeScoreEffects = [];

// 🖼️ スコア数字画像のロード用オブジェクト
const scoreEffectSprites = {};
const scoreKeys = ['100', '200', '400', '800', '1000', '2000', '4000', '8000', '1up'];
scoreKeys.forEach(key => {
    scoreEffectSprites[key] = new Image();
    scoreEffectSprites[key].src = `sprite/others/${key}.png`;
});

/**
 * 🎯 ポップアップスコアを【画面上の見た目の位置】に発生させる中央登録関数！
 * @param {number} mapX - 敵がいたマップ上の絶対X座標
 * @param {number} mapY - 敵がいたマップ上の絶対Y座標
 * @param {number|string} amount - 加算されたスコア値 (100〜8000、または '1up')
 */
function spawnScoreEffect(mapX, mapY, amount) {
    const scoreStr = String(amount);

    if (scoreEffectSprites[scoreStr]) {
        // 👑【修正パッチ】生成時は常にマップ上の絶対座標（mapX）のまま登録するおぶ！！！
        // 画面固定にするかどうかは、描画関数（drawScoreEffects）のなかでリアルタイムにジャッジします！
        const screenY = mapY; 

        activeScoreEffects.push({
            x: mapX,        // 💡 画面固定の敵踏みも、ポールの点数も、一旦絶対座標で保存お！
            y: screenY,     
            scoreKey: scoreStr,
            timer: 32,      // ⏳ 寿命32フレーム
            frameBuffer: 0,
            isGoalScore: false // 初期値はfalse。main.js側で上書きされますお
        });

        console.log(`✨ 画面固定スコア発生！ [${scoreStr}] 画面座標: (${Math.floor(screenX)}, ${Math.floor(screenY)})`);
    }
}

/**
 * 🔄 スコア表示オブジェクトの位置移動とタイマーを毎フレーム進める関数お！
 */
function updateScoreEffects(dtModifier = 1.0) {
    for (let i = activeScoreEffects.length - 1; i >= 0; i--) {
        const effect = activeScoreEffects[i];

        effect.frameBuffer += dtModifier;
        while (effect.frameBuffer >= 1) {
            effect.frameBuffer -= 1;

            // ─── 🏁 ポールの点数は旗が動いている間だけ2px等速スライドお！！！ ───
            if (effect.isGoalScore) {
                if (typeof goalPoleFlag !== 'undefined' && goalPoleFlag.isInitialized && !goalPoleFlag.isFinished) {
                    effect.y -= 2.0;
                }
            } else {
                // 通常の敵踏みなどはフワフワ浮上
                effect.y -= 1.0;
            }

            // ─── 🏁 ポールの点数は時間が経っても絶対に消滅させないおぶ！！！ ───
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

/**
 * 🎬 浮上中のスコア数字を手前にレンダリングする関数お！
 */
function drawScoreEffects() {
    const currentCamX = (typeof cameraX !== 'undefined') ? cameraX : 0;

    for (let i = 0; i < activeScoreEffects.length; i++) {
        const effect = activeScoreEffects[i];
        
        let screenX = 0;

        // 👑【大ターゲット仕様・リアルタイム描画調停トグル！】
        if (effect.isGoalScore) {
            // ① ゴールポールの点数なら、カメラの位置（currentCamX）をリアルタイムに引き算！
            // これにより、マリオがお城へ歩き出して画面が右スクロールしても、ポールの右隣に100%吸着して一緒に左へ流れるお！！！ｗｗｗ
            screenX = Math.floor(effect.x) - Math.floor(currentCamX);
        } else {
            // ② 通常の敵踏みなどの点数は、あなたが最初に作った仕様通り「画面上の見た目の位置」に完全固定！
            // 生成された瞬間のカメラ位置を逆算して、スクロールしても画面のその位置から絶対に動かない鉄壁ガードおぶ！！！
            screenX = Math.floor(effect.x) - Math.floor(currentCamX); 
            // 💡（解説：spawn時にmapXのまま入るようになったため、発生した瞬間の画面座標を維持するために一律で今のカメラを引く形に大統合したお！）
        }

        // 💡 待っておぶ！通常の敵踏みスコアが「カメラが右に進んでも画面のその位置に居座り続ける（スクロールしない）」ようにするためには、
        // 発生した瞬間の画面位置を記憶する必要があるお！
        // なので、effectオブジェクトに発生時の画面位置をロックさせるために、1回だけ焼き付け処理を行うスマート設計に変更するおぶ！！！
        if (!effect.isGoalScore) {
            if (effect.fixedScreenX === undefined) {
                // 最初の1フレーム目に、その時の画面上の見た目位置（絶対座標 - 発生時のカメラ）をガチッと固定！
                effect.fixedScreenX = Math.floor(effect.x) - Math.floor(currentCamX);
            }
            // 2フレーム目以降は、カメラがどれだけ右にスクロールしようが、この固定画面座標をそのまま使うお！
            screenX = effect.fixedScreenX;
        }

        const screenY = Math.floor(effect.y);

        // 画面外（左右）なら描画を全スルー
        if (screenX < -32 || screenX > canvas.width) continue;

        const sprite = scoreEffectSprites[effect.scoreKey];
        if (sprite && sprite.complete) {
            ctx.drawImage(sprite, screenX, screenY);
        }
    }
}
