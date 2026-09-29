// =================================================================
// 🍄 mushroom.js : スーパーキノコ ＆ 🌟隠し1UPキノコ完全統合システム
// =================================================================

const activeMushrooms = [];
const mushroomSprite = new Image();
mushroomSprite.src = 'sprite/items/mushroom.png'; // 通常キノコ

// 👑【新設！】エクスプローラで確認した本物の1UPアセットを最速ロードお！！！
const upMushroomSprite = new Image();
upMushroomSprite.src = 'sprite/items/1upmushroom.png'; 

/**
 * 🍄 キノコをブロックから出現させるトリガー関数
 * @param {number} blockX - ブロックのX
 * @param {number} blockY - ブロックのY
 * @param {boolean} is1Up - trueなら1UPキノコ化！
 */
function spawnMushroom(blockX, blockY, is1Up = false) {
    activeMushrooms.push({
        x: blockX,
        y: blockY,
        width: 16,
        height: 16,
        vx: 0,
        vy: 0,
        isGrounded: true,
        state: 'rising',
        riseTimer: 0, 
        frameBuffer: 0,
        pendingBounce: false,
        is1Up: is1Up // 👑 通常キノコか1UPキノコかを記憶！
    });
}

/**
 * 🧱 キノコ用の地形衝突判定ヘルパー
 */
function isTileSolidForMushroom(px, py) {
    if (px < 0 || px >= MAP_WIDTH * TILE_SIZE) return true;
    if (py < 0 || py >= MAP_HEIGHT * TILE_SIZE) return false;

    const col = Math.floor(px / TILE_SIZE);
    const row = Math.floor(py / TILE_SIZE);

    if (!tileMap[row] || tileMap[row][col] === undefined) return false;
    return tileMap[row][col] > 0;
}

/**
 * 🔄 キノコの物理＆状態ロジックを毎フレーム更新
 */
function updateMushrooms(deltaTimeOrModifier) {
    let framesToAdvance = 1;
    if (deltaTimeOrModifier < 0.5) {
        framesToAdvance = deltaTimeOrModifier * 60;
    } else {
        framesToAdvance = deltaTimeOrModifier;
    }

    for (let i = activeMushrooms.length - 1; i >= 0; i--) {
        const shroom = activeMushrooms[i];

        // 📈 1. 「下から上にじわじわとせり上がってくる」フェーズ（16フレーム）
        if (shroom.state === 'rising') {
            shroom.frameBuffer += framesToAdvance;
            while (shroom.frameBuffer >= 1) {
                shroom.frameBuffer -= 1;
                shroom.riseTimer++;
                shroom.y -= 1; // 1フレームあたり1ピクセルせり上がる

                if (shroom.riseTimer >= 16) {
                    shroom.state = 'moving';
                    shroom.vx = 1.0; // 常に右向き（1px/F）に発進
                    
                    if (shroom.pendingBounce) {
                        shroom.vy = -4.0; 
                        shroom.isGrounded = false;
                        shroom.pendingBounce = false; 
                        console.log("⚠️ タイムラグバグ発動！出現しきったキノコが突然大ジャンプしたお！！！ｗｗｗ");
                    }
                    break;
                }
            }
            continue; 
        }

        // RUN 2. 地上移動＆物理フェーズ
        shroom.frameBuffer += framesToAdvance;
        while (shroom.frameBuffer >= 1) {
            shroom.frameBuffer -= 1;

            // --- 🛠️ 横方向移動 & 壁衝突判定 ---
            shroom.x += shroom.vx; 
            const checkY = shroom.y + shroom.height / 2;

            if (shroom.vx > 0) {
                if (isTileSolidForMushroom(shroom.x + shroom.width, checkY)) {
                    shroom.vx = -1.0; 
                    shroom.x = Math.floor((shroom.x + shroom.width) / TILE_SIZE) * TILE_SIZE - shroom.width;
                }
            } else if (shroom.vx < 0) {
                if (isTileSolidForMushroom(shroom.x, checkY)) {
                    shroom.vx = 1.0;  
                    shroom.x = (Math.floor(shroom.x / TILE_SIZE) + 1) * TILE_SIZE;
                }
            }

            // --- 🛠️ 縦方向移動 & 重力・床判定 ---
            shroom.y += shroom.vy;
            const footMargin = 1;
            const leftFootX = shroom.x + footMargin;
            const rightFootX = shroom.x + shroom.width - footMargin;
            
            if (shroom.vy >= 0) {
                const footY = shroom.y + shroom.height;
                if (isTileSolidForMushroom(leftFootX, footY) || isTileSolidForMushroom(rightFootX, footY)) {
                    const tileTopEdge = Math.floor(footY / TILE_SIZE) * TILE_SIZE;
                    shroom.y = tileTopEdge - shroom.height;
                    shroom.vy = 0;
                    shroom.isGrounded = true;
                } else {
                    shroom.isGrounded = false;
                }
            } else {
                shroom.isGrounded = false;
            }

            if (!shroom.isGrounded) {
                shroom.vy += 0.25; 
                if (shroom.vy > 4.0) shroom.vy = 4.0; 
            }
        }

        // --- 💥 マリオとの接触判定（通常キノコ変身 vs 1UP獲得のトグル分岐！） ---
        if (typeof player !== 'undefined') {
            const isOverlapping = 
                player.x < shroom.x + shroom.width &&
                player.x + player.width > shroom.x &&
                player.y < shroom.y + shroom.height &&
                player.y + player.height > shroom.y;

            if (isOverlapping) {
                if (shroom.is1Up) {
                    // 👑 ─── 【隠し1UPキノコをごっくんした時の最終タイムライン！！！】 ───
                    console.log("🌟 👑 【夢の1UPキノコ獲得お！！！】 残機が1増えたおぶ！！！ 👑 🌟");
                    
                    // ① 🔊 音響連動：準備していただいた「1up.wav」を大爆音再生！！！
                    if (typeof playSE === 'function') { 
                        playSE('1up'); 
                    }
                    
                    // ② 📊 残機カウンターへ確実に+1加算！
                    if (typeof window.lives !== 'undefined') {
                        window.lives++; 
                    }

                    // ③ ✨ エフェクト連動：空中に緑文字の「1up」をポップアップポップ！
                    if (typeof spawnScoreEffect === 'function') {
                        spawnScoreEffect(shroom.x, shroom.y, '1up');
                    }
                } else {
                    // 通常の赤いスーパーキノコを食べた時は今まで通りデカマリオへ変身！
                    console.log("🍄 キノコをゲットしたお！！！変身タイマー始動！！！ｗｗｗｗ");
                    if (typeof player.triggerPowerUp === 'function') {
                        player.triggerPowerUp();
                    }
                    if (typeof addScore === 'function') { addScore(1000); }
                    if (typeof spawnScoreEffect === 'function') {
                        spawnScoreEffect(shroom.x, shroom.y, 1000);
                    }
                }

                activeMushrooms.splice(i, 1); // 触れたのでキノコは消滅！
                continue;
            }
        }

        if (shroom.y > canvas.height + 32) {
            activeMushrooms.splice(i, 1);
        }
    }
}

/**
 * 🎬 キノコを描画する関数（緑と赤の画像撃ち分けお！）
 */
function drawMushrooms() {
    for (let i = 0; i < activeMushrooms.length; i++) {
        const shroom = activeMushrooms[i];
        const screenX = Math.floor(shroom.x) - Math.floor(cameraX);
        const screenY = Math.floor(shroom.y);

        if (screenX < -shroom.width || screenX > canvas.width) continue;

        // 👑 1UPなら緑スプライト、通常なら赤スプライトを選択！
        const sprite = shroom.is1Up ? upMushroomSprite : mushroomSprite;

        if (sprite.complete) {
            ctx.drawImage(sprite, screenX, screenY, shroom.width, shroom.height);
        }
    }
}
