// =================================================================
// 🌟 star.js : スーパースター（ID: 23）実機物理数値完全再現システム
// =================================================================

// 👑 アクティブなスターオブジェクトの管理配列
const activeStars = [];

// 🖼️ スターの回転アニメーションスプライト（4段階）
const starSprites = [
    new Image(),
    new Image(),
    new Image(),
    new Image()
];

starSprites[0].src = 'sprite/items/star1.png';
starSprites[1].src = 'sprite/items/star2.png';
starSprites[2].src = 'sprite/items/star3.png';
starSprites[3].src = 'sprite/items/star4.png';

/**
 * 🌟 新型レンガ（23番）からスーパースターをせり上がらせる初期化ポップ関数
 */
function spawnStar(blockX, blockY) {
    activeStars.push({
        x: blockX,
        y: blockY,
        width: 16,
        height: 16,
        vx: 0,
        vy: 0,
        isGrounded: true,
        riseTimer: 0,      // 16フレームの上昇カウンタ
        frameBuffer: 0,    // デルタタイム小数点補正バッファ
        state: 'rising'    // 'rising'(せり上がり中) -> 'moving'(大バウンド爆走中)
    });
    console.log("🌟 レンガブロックから本物のスーパースターがポップしたおぶ！！！");
}

/**
 * 🧱 スター用の地形衝突判定ヘルパー（キノコと同等のソリッド判定）
 */
function isTileSolidForStar(px, py) {
    if (px < 0 || px >= MAP_WIDTH * TILE_SIZE) return true;
    if (py < 0 || py >= MAP_HEIGHT * TILE_SIZE) return false;

    const col = Math.floor(px / TILE_SIZE);
    const row = Math.floor(py / TILE_SIZE);

    if (!tileMap[row] || tileMap[row][col] === undefined) return false;
    return tileMap[row][col] > 0;
}

/**
 * 🔄 スターのせり上がり ＆ 1Fあたり1px等速大バウンド物理ライフサイクル
 */
function updateStars(deltaTimeOrModifier) {
    let framesToAdvance = 1;
    if (deltaTimeOrModifier < 0.5) {
        framesToAdvance = deltaTimeOrModifier * 60;
    } else {
        framesToAdvance = deltaTimeOrModifier;
    }

    for (let i = activeStars.length - 1; i >= 0; i--) {
        const star = activeStars[i];

        // 📈 ① じわじわせり上がるフェーズ（16フレーム）
        if (star.state === 'rising') {
            star.frameBuffer += framesToAdvance;
            while (star.frameBuffer >= 1) {
                star.frameBuffer -= 1;
                star.riseTimer++;
                star.y -= 1; // 1フレームあたり1pxづつ上昇

                if (star.riseTimer >= 16) {
                    star.state = 'moving';
                    star.vx = 1.0; // 👑【実機仕様】1フレームあたり1.0px（右方向）で等速発進！
                    star.vy = 0;   // 最初は下へ落ちてからバウンド開始お！
                    star.isGrounded = false;
                    break;
                }
            }
            continue; // せり上がり中は物理演算を全スキップ
        }

        // 🏃‍♂️ ② 地上大バウンド爆走物理フェーズ
        star.frameBuffer += framesToAdvance;
        while (star.frameBuffer >= 1) {
            star.frameBuffer -= 1;

            // 🛠️ 【1】横方向の移動 ＆ 壁衝突・押し戻し判定お！
            star.x += star.vx; 
            
            // スターの上下2点で壁をチェックして、背の低い土管やブロックも取りこぼさない！
            const wallCheckTop = star.y + 2;
            const wallCheckBottom = star.y + star.height - 2;

            if (star.vx > 0) { // 右移動時
                if (isTileSolidForStar(star.x + star.width, wallCheckTop) || isTileSolidForStar(star.x + star.width, wallCheckBottom)) {
                    star.vx = -1.0; // シャキッと左反転
                    // ブロックの左端へピタッと押し戻し！
                    star.x = Math.floor((star.x + star.width) / TILE_SIZE) * TILE_SIZE - star.width;
                }
            } else if (star.vx < 0) { // 左移動時
                if (isTileSolidForStar(star.x, wallCheckTop) || isTileSolidForStar(star.x, wallCheckBottom)) {
                    star.vx = 1.0;  // シャキッと右反転
                    // ブロックの右端へピタッと押し戻し！
                    star.x = (Math.floor(star.x / TILE_SIZE) + 1) * TILE_SIZE;
                }
            }

            // 🛠️ 【2】縦方向の移動 ＆ 天井・床衝突バウンド判定お！
            star.y += star.vy;
            const headFootMargin = 2; // 左右のズレによる引っかかり防止マージン
            const checkLeftX = star.x + headFootMargin;
            const checkRightX = star.x + star.width - headFootMargin;

            if (star.vy > 0) {
                // 📉 下降中：床との激突チェック
                const footY = star.y + star.height;
                if (isTileSolidForStar(checkLeftX, footY) || isTileSolidForStar(checkRightX, footY)) {
                    // 👑【最高に気持ちいいバウンド数値！】上方向へ超大ジャンプバウンド起動！！
                    star.vy = -6; 
                    // 床の上端にピタッと座標を強制吸着させて埋まりを抹殺お！
                    const tileTopEdge = Math.floor(footY / TILE_SIZE) * TILE_SIZE;
                    star.y = tileTopEdge - star.height;
                    star.isGrounded = false;
                }
            } else if (star.vy < 0) {
                // 📈 上昇中：レンガなどの天井頭突きチェック
                const headY = star.y;
                if (isTileSolidForStar(checkLeftX, headY) || isTileSolidForStar(checkRightX, headY)) {
                    star.vy = 0.5; // 天井にゴンッとぶつかったら即座に下降へトグル！
                    // ブロックの下端へピタッと押し戻して貫通を完全ガード！
                    const tileBottomEdge = (Math.floor(headY / TILE_SIZE) + 1) * TILE_SIZE;
                    star.y = tileBottomEdge;
                }
            }

            // 📉 空中のカスタム加速重力
            star.vy += 0.45; 
            if (star.vy > 6.0) star.vy = 6.0; // 落下速度限界をバウンドに合わせて少し開放お！
        }

        // --- 🎯 マリオとスターの接触判定（12×12pxの実機縮小ヒットボックス仕様！） ---
        if (typeof player !== 'undefined') {
            // 💡 グラフィックは16×16pxですが、判定は中心に寄った一回り小さい12×12pxの矩形に補正お！
            const starHitbox = {
                left:   star.x + 2,
                right:  star.x + 14,
                top:    star.y + 2,
                bottom: star.y + 14
            };

            const playerHitbox = {
                left:   player.x,
                right:  player.x + player.width,
                top:    player.y,
                bottom: player.y + player.height
            };

            const isIntersecting = 
                playerHitbox.left   < starHitbox.right  &&
                playerHitbox.right  > starHitbox.left   &&
                playerHitbox.top    < starHitbox.bottom &&
                playerHitbox.bottom > starHitbox.top;

            if (isIntersecting) {
                console.log("🌟 スーパースターをごっくんと獲得！マリオ無敵カラーモード起動おぶ！！！ｗｗｗ");
                
                // 👑【新設！】マリオに無敵フラグをガツンと注入し、color1へのすり替えをキックお！
                if (typeof player !== 'undefined') {
                    player.isInvincible = true;
                    if (typeof refreshPlayerSpriteFolders === 'function') {
                        refreshPlayerSpriteFolders();
                    }
                    
                    // 👑【大開通！】sound.js の中央管理エンジンに現在の通常ステージBGMを即座に止めさせて、
                    // 👑 無敵専用トラック「star」をループ爆音再生させるトリガーを直接キックおぶ！！！ｗｗｗ
                    if (typeof stopAllBGM === 'function') {
                        stopAllBGM(); 
                    }
                    if (typeof startBGM === 'function') {
                        startBGM('star');
                    }
                }
                
                // 🔊 アイテム獲得時の「item」またはお好みのSEをキック！
                if (typeof playSE === 'function') {
                    playSE('powerup'); 
                }

                // 📊 獲得スコア1000点ドンと追加 ＆ フワフワ数字ポップアップを連動リンクお！！！
                if (typeof addScore === 'function') { 
                    addScore(1000); 
                }
                if (typeof spawnScoreEffect === 'function') {
                    spawnScoreEffect(star.x, star.y, 1000);
                }

                activeStars.splice(i, 1); // 触れたのでスターメモリ消滅！
                continue;
            }
        }

        // 画面の底（奈落）に落ちたら消去
        if (star.y > canvas.height + 32) {
            activeStars.splice(i, 1);
        }
    }
}

/**
 * 🎬 スーパースターの4フレームホールド・カクカク瞬間切り替えレンダリング関数
 */
function drawStars() {
    for (let i = 0; i < activeStars.length; i++) {
        const star = activeStars[i];
        const screenX = Math.floor(star.x) - Math.floor(cameraX);
        const screenY = Math.floor(star.y);

        if (screenX < -star.width || screenX > canvas.width) continue;

        // 👑 4フレームの間は同じ画像をホールドし、4F経った瞬間にカチッとカクカク瞬間切り替え！
        const currentStep = Math.floor(globalFrameCounter / 4);
        const animIndex = currentStep % 4;

        const sprite = starSprites[animIndex];
        if (sprite && sprite.complete) {
            ctx.drawImage(sprite, screenX, screenY, star.width, star.height);
        }
    }
}
