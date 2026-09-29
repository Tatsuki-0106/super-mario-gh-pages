// =================================================================
// 🧱 brick.js : レンガブロック頭突き・衝撃波なぎ倒しリンク対応版お！
// =================================================================

// アニメーション中（跳ねている最中）のレンガブロックを管理する配列
const animatingBricks = [];

// 💥 画面内に同時に存在できる破片オブジェクトの配列
const activeDebris = [];

// 🖼️ 破片（8x8px）の画像オブジェクト読み込み
const debrisSprite = new Image();
debrisSprite.src = 'sprite/items/debris.png'; 

/**
 * 🧱 マリオが下からレンガブロック（ID: 2）を叩いた時のトリガー関数だお！
 */
function checkBrickBlockHit(px, py) {
    const col = Math.floor(px / TILE_SIZE);
    const row = Math.floor(py / TILE_SIZE);

    if (!tileMap[row] || tileMap[row][col] === undefined) return;

    // もし叩いたブロックが「レンガブロック（2）」だったら
    if (tileMap[row][col] === 2) {
        // すでに跳ねている最中なら多重発動防止で無視お
        const isAlreadyAnimating = animatingBricks.some(b => b.col === col && b.row === row);
        if (isAlreadyAnimating) return;

        const blockBaseX = col * TILE_SIZE;
        const blockBaseY = row * TILE_SIZE;

// 🍄 【条件分岐】スーパーマリオ（デカマリオ）なら粉砕！チビなら通常振動お！
if (typeof player !== 'undefined' && player.isSuper) {

    playSE('brick'); 

    // 💥【ここを追加お！！！ｗｗｗ】レンガ破壊時に50点を加算！
    if (typeof addScore === 'function') { addScore(50); }

    console.log("🧱 スーパーマリオの頭突き！レンガを完全粉砕するお！！！ｗｗｗｗ");
            
            // 2重描画・衝突を防ぐため、即座にマップ上から完全に消去して空気に（0）にするお！
            tileMap[row][col] = 0; 

            // ⚠️ 【実機制限の再現】古い破片が残っていたら強制クリアしてスプライトオーバーを防ぐお！
            activeDebris.length = 0;

            // 💥 4つの破片（左上・右上・左下・右下）を生成
            // ① 左上 : 左へ移動(-1px), 上へ大ジャンプ(-4px)
            activeDebris.push({ x: blockBaseX,     y: blockBaseY,     vx: -1.0, vy: -4.0 });
            // ② 右上 : 右へ移動(+1px), 上へ大ジャンプ(-4px)
            activeDebris.push({ x: blockBaseX + 8, y: blockBaseY,     vx: 1.0,  vy: -4.0 });
            // ③ 左下 : 左へ移動(-1px), 上へ小ジャンプ(-2px)
            activeDebris.push({ x: blockBaseX,     y: blockBaseY + 8, vx: -1.0, vy: -2.0 });
            // ④ 右下 : 右へ移動(+1px), 上へ小ジャンプ(-2px)
            activeDebris.push({ x: blockBaseX + 8, y: blockBaseY + 8, vx: 1.0,  vy: -2.0 });

        } else {
            playSE('bump'); // ゴンッ！って頭打ち音お！
            // 👶 チビマリオの時は、今まで通りの「ぽよん」と跳ねるだけの処理お！
            tileMap[row][col] = 0; // 描画が重ならないように、叩かれた瞬間マップ上は一旦空気にする

            animatingBricks.push({
                col: col,
                row: row,
                baseX: blockBaseX,
                baseY: blockBaseY,
                timer: 0 // 0から12フレームまで進むカウンター
            });
            console.log("👶 チビマリオだからレンガは壊れないお！ぽよん！");
        }

        // 💥【新設！レンガ衝撃波トリガーをキックお！！！ｗｗｗ】
        // 頭突きが成立した瞬間、そのマスの真上に立っている敵を検知して一網打尽になぎ倒すお！
        if (typeof triggerBlockHitShockwave === 'function') {
            triggerBlockHitShockwave(col, row);
        }
    }
}

/**
 * 🔄 レンガブロック＆破片エフェクトの状態を毎フレーム進める関数お！
 */
function updateRisingBricks(deltaTimeOrModifier) {
    let framesToAdvance = 1;
    if (deltaTimeOrModifier < 0.5) {
        framesToAdvance = deltaTimeOrModifier * 60;
    } else {
        framesToAdvance = deltaTimeOrModifier;
    }

    // 1. 🧱 通常レンガの12フレーム振動タイマー処理
    for (let i = animatingBricks.length - 1; i >= 0; i--) {
        const brick = animatingBricks[i];
        brick.timer += framesToAdvance;

        if (brick.timer >= 12) {
            tileMap[brick.row][brick.col] = 2; // 2に戻すお！
            animatingBricks.splice(i, 1);
        }
    }

    // 2. 💥 破片（Debris）の放物線物理演算ライフサイクル
    for (let i = activeDebris.length - 1; i >= 0; i--) {
        const deb = activeDebris[i];

        deb.x += deb.vx * framesToAdvance;
        deb.y += deb.vy * framesToAdvance;

        deb.vy += 0.25 * framesToAdvance;

        if (deb.y > 240) {
            activeDebris.splice(i, 1);
        }
    }
}

/**
 * 🎬 跳ねているレンガブロック ＆ 飛び散る破片を手前に描画する関数お！
 */
function drawRisingBricks() {
    // 1. 🧱 チビマリオ時の「ぽよん」振動描画
    for (let i = 0; i < animatingBricks.length; i++) {
        const brick = animatingBricks[i];
        
        let offsetY = 0;
        const currentFrame = Math.floor(brick.timer);

        if (currentFrame <= 6) {
            offsetY = -Math.floor((currentFrame / 6) * 4); 
        } else if (currentFrame <= 12) {
            offsetY = -4 + Math.floor(((currentFrame - 6) / 6) * 4); 
        }

        const screenX = brick.baseX - cameraX;
        const screenY = brick.baseY + offsetY;

        if (screenX >= -TILE_SIZE && screenX <= canvas.width && screenY >= -TILE_SIZE) {
            if (tileSprites && tileSprites[2]) {
                ctx.drawImage(tileSprites[2], screenX, screenY, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    // 2. 💥 破片（debris.png）の描画処理お！
    for (let i = 0; i < activeDebris.length; i++) {
        const deb = activeDebris[i];
        
        const screenX = Math.floor(deb.x) - Math.floor(cameraX);
        const screenY = Math.floor(deb.y);

        if (screenX >= -8 && screenX <= canvas.width && screenY >= -8 && screenY <= canvas.height) {
            if (debrisSprite.complete) {
                ctx.drawImage(debrisSprite, screenX, screenY, 8, 8); 
            }
        }
    }
}
