// =================================================================
// ❓ question.js 【パート1/2】: 10コインレンガ（ID: 21）実機連打ライフサイクル完全再現
// =================================================================

// アニメーション中のブロックとコインを管理する配列
const animatingBlocks = [];
const activeCoins = [];

// 👑【新設！】10コインレンガ（ID: 21）の各座標ごとの状態を独立管理するスタック辞書だお！
// 画面内に複数個あっても、それぞれが固有のタイマーと枚数を持って暴走しない神設計！
const multiCoinBlockStates = {};

/**
 * 🧱 マリオが下から頭をぶつけた時の判定トリガー（先着1個のみ起動・単一調停完成版お！）
 */
function checkQuestionBlockHit(px, py) {
    const col = Math.floor(px / TILE_SIZE);
    const row = Math.floor(py / TILE_SIZE);

    if (!tileMap[row] || tileMap[row][col] === undefined) return;

    // ─── 👑【超シンプル・先着1個ロックオンエンジン】 ───
    // ① すでに今フレーム（左チェックなどで）どこか1個でも固体ブロックを叩き終わっていたら、
    // 2個目に同時に当たった判定は鉄壁ガードで100%全カット遮断して即抜け return するおぶ！！！
    if (typeof player !== 'undefined') {
        if (player.lastHitHitboxFrame === globalFrameCounter) {
            return; 
        }
    }

    // ② まだ今フレームで何も叩いていなければ、今たった今検知したこのブロック（1個目）の処理を100%通すお！
    // 処理が通過したまさにその瞬間に、「今フレームは終了！」のタイムスタンプをマリオ側にガチッと記憶！
    if (typeof player !== 'undefined') {
        player.lastHitHitboxFrame = globalFrameCounter;
    }

    const blockType = tileMap[row][col];
    const blockBaseX = col * TILE_SIZE;
    const blockBaseY = row * TILE_SIZE;
    const blockKey = `${col}_${row}`; // 座標をユニークキーにして辞書管理お！

    // ─── 🪙 👑【新設！】10コインレンガ（ID: 21）の荒ぶり連打ジャッジタスク ───
    if (blockType === 21) {
        // すでに「ぽよん」と跳ねている12Fの振動最中は、連打されようが実機ガードで100%全カット遮断！
        const isAlreadyAnimating = animatingBlocks.some(b => b.col === col && b.row === row);
        if (isAlreadyAnimating) return;

        // 辞書にこのブロックのデータが無ければ、新品の状態で初期化エントリー！
        if (!multiCoinBlockStates[blockKey]) {
            multiCoinBlockStates[blockKey] = {
                hasStarted: false,   // 最初の1発目を叩いたかどうかのフラグ
                acceptTimer: 230,    // ⏳ 運命の230フレーム受付制限時間！
                hitCooldown: 0,      // ⏱️ 16フレームの最短連打ウェイトカウンター
                totalCoins: 0,       // 獲得枚数カウンター（最大16枚への挑戦）
                isExpired: false     // 230Fが終了して「次叩かれたら終わり」モードか
            };
        }

        const state = multiCoinBlockStates[blockKey];

        // 16Fの連打冷却ウェイトが残っている間は、いくら超高速で叩かれても無視！
        if (state.hitCooldown > 0) return;

        // ─── 💥 ここから叩き判定が完全成立おぶ！！！ ───
        
        // 最初の1発目なら、230Fのカウントダウンタイマーを大起動！
        if (!state.hasStarted) {
            state.hasStarted = true;
            console.log(`⏳ [10コインレンガ] 最初の頭突きを検知！230F(約3.8秒)の秘密タイマーが始動したおぶ！！！`);
        }

        // コイン枚数をインクリメントし、16Fの連打クールダウンをチャージ！
        state.totalCoins++;
        state.hitCooldown = 16; 

        // 🔊 SE再生：チャリーン！
        if (typeof playSE === 'function') playSE('coin');

        // 🪙 コインを上空へポップアップ実体化！
        const coinWidth = 8; 
        const exactCenterX = blockBaseX + (TILE_SIZE / 2) - (coinWidth / 2);
        const spawnX = Math.floor(exactCenterX);
        const spawnY = blockBaseY - 16; 

        activeCoins.push({
            x: spawnX,
            y: spawnY,
            timer: 0,       
            frameBuffer: 0  
        });

        // グローバルなコイン枚数加算＆100枚1UPリンク
        window.coins++;
        if (window.coins >= 100) {
            window.coins = 0;
            if (window.lives !== undefined) window.lives++;
            if (typeof playSE === 'function') playSE('1up');
            if (typeof spawnScoreEffect === 'function') spawnScoreEffect(player.x, player.y - 16, '1up');
        }

        console.log(`🪙 [10コイン連打] コイン獲得！ このブロックから累計: ${state.totalCoins}枚目おぶ！！！`);

        // 🧱 【重要】次で空（ID: 9）に変わるかどうかの最終ジャッジメント！
        const EMPTY_TILE_ID = 9;
        let nextBlockVisualId = 21; // 基本は叩かれても見た目はレンガ（21）のまま維持！

        // 条件：230Fの時間がすでに切れている（isExpired）状態での頭突きだったら
        if (state.isExpired) {
            nextBlockVisualId = EMPTY_TILE_ID; // 最後の1発なので、見た目を空ブロック（9）に変形！
            tileMap[row][col] = 0;             // main.jsの2重描画を消すために一旦空気に
            delete multiCoinBlockStates[blockKey]; // メモリからこのブロックの状態を安全消滅！
            console.log(`🧱 [10コインレンガ] タイムアップ後の【最後の1発】を検知！空ブロック(ID: 9)へ完全大粉砕トグル変身おぶ！！！`);
        } else {
            // まだ時間内なら、跳ねている間だけマップ上を一時的に空気にして多重描画をガード
            tileMap[row][col] = 0;
        }

        // 🧱 ブロックの「ぽよん」と跳ねる 12フレーム振動アニメーションを登録！
        animatingBlocks.push({
            col: col,
            row: row,
            baseX: blockBaseX,
            baseY: blockBaseY,
            timer: 0, 
            endTileId: nextBlockVisualId // 終わった後に戻るIDを渡すお！
        });

        // 💥 ブロック衝撃波をリンク（上にいる敵を床ドンなぎ倒し！）
        if (typeof triggerBlockHitShockwave === 'function') {
            triggerBlockHitShockwave(col, row);
        }
        return; // 👑 10コインレンガの処理をしたので、下の通常ブロック判定はスルーして即抜け！
    }

    // ─── 🧱 以下は通常のはてなブロック（3, 10, 11）やスターレンガ（23）の既存ロジックお！ ───
    if (blockType === 3 || blockType === 10 || blockType === 11) {

        const isAlreadyAnimating = animatingBlocks.some(b => b.col === col && b.row === row);
        if (isAlreadyAnimating) return;

        // 空ブロックのID「9」に変身させる準備
        const EMPTY_TILE_ID = 9; 
        tileMap[row][col] = 0; // 2重描画を防ぐため一旦空気にする

        // 1. 🧱 ブロックの「ぽよん」振動アニメーションの登録
        animatingBlocks.push({
            col: col,
            row: row,
            baseX: blockBaseX,
            baseY: blockBaseY,
            timer: 0, 
            endTileId: EMPTY_TILE_ID
        });

        // 2. 中身の撃ち分け処理！
        if (blockType === 3) {
            if (typeof playSE === 'function') playSE('coin');
            const coinWidth = 8; 
            const exactCenterX = blockBaseX + (TILE_SIZE / 2) - (coinWidth / 2);
            const spawnX = Math.floor(exactCenterX);
            const spawnY = blockBaseY - 16; 

            activeCoins.push({
                x: spawnX,
                y: spawnY,
                timer: 0,       
                frameBuffer: 0  
            });

            window.coins++;

            if (window.coins >= 100) {
                window.coins = 0;
                if (window.lives !== undefined) window.lives++;
                if (typeof playSE === 'function') playSE('1up');
                if (typeof spawnScoreEffect === 'function') spawnScoreEffect(player.x, player.y - 16, '1up');
            }
            console.log("🪙 ブロックからコインが出たお！");
        } else if (blockType === 10) {
            if (typeof player !== 'undefined' && player.isSuper) {
                if (typeof spawnFlower === 'function') {
                    spawnFlower(blockBaseX, blockBaseY);
                }
                console.log("🌸 [ID:10] マリオがデカ状態だから、中身がファイアフラワーに自動変化してせり上がったおぶ！！！ｗｗｗ");
            } else {
                if (typeof spawnMushroom === 'function') {
                    spawnMushroom(blockBaseX, blockBaseY, false);
                }
                console.log("🍄 [ID:10] マリオがチビ状態だから、通常通りスーパーキノコがせり上がったおぶ！！！");
            }

            if (typeof playSE === 'function') {
                playSE('item'); 
            }
        } else if (blockType === 11) {
            if (typeof spawnMushroom === 'function') {
                spawnMushroom(blockBaseX, blockBaseY, true); 
            }
            if (typeof playSE === 'function') {
                playSE('item'); 
            }
            console.log("🌟 隠しブロックから1UPキノコが出現したおぶ！！！ｗｗｗ");
        }

        if (typeof triggerBlockHitShockwave === 'function') {
            triggerBlockHitShockwave(col, row);
        }
    }

    if (blockType === 23) {
        const isAlreadyAnimating = animatingBlocks.some(b => b.col === col && b.row === row);
        if (isAlreadyAnimating) return;

        const EMPTY_TILE_ID = 9; 
        tileMap[row][col] = 0;   

        animatingBlocks.push({
            col: col,
            row: row,
            baseX: blockBaseX,
            baseY: blockBaseY,
            timer: 0, 
            endTileId: EMPTY_TILE_ID
        });

        if (typeof player !== 'undefined' && player.isSuper) {
            if (typeof playSE === 'function') playSE('brick');
        } else {
            if (typeof playSE === 'function') playSE('bump');
        }

        if (typeof playSE === 'function') {
            playSE('item'); 
        }

        if (typeof spawnStar === 'function') {
            spawnStar(blockBaseX, blockBaseY);
        }

        if (typeof triggerBlockHitShockwave === 'function') {
            triggerBlockHitShockwave(col, row);
        }
        console.log("🧱 ID: 23 の新型レンガを捕捉！テスト用黒四角形をせり上げ起動したおぶ！！！");
    }
}

// =================================================================
// ❓ question.js 【パート2/2】: タイマーデクリメント ＆ コイン物理・描画制御
// =================================================================

/**
 * 🔄 ブロックとコインの状態を毎フレーム進める関数（10コインタイマーデクリメント対応お！）
 * @param {number} deltaTimeOrModifier - 前のフレームからの経過時間、またはデルタタイム補正値
 */
function updateRisingBlocks(deltaTimeOrModifier) {
    let framesToAdvance = 1;
    if (deltaTimeOrModifier < 0.5) {
        framesToAdvance = deltaTimeOrModifier * 60;
    } else {
        framesToAdvance = deltaTimeOrModifier;
    }

    // ─── ⏰ 👑【新設！】10コインレンガ内部タイマーのリアルタイム毎フレーム更新 ───
    Object.keys(multiCoinBlockStates).forEach(key => {
        const state = multiCoinBlockStates[key];

        // 16Fの連打冷却ウェイトカウンターを消費
        if (state.hitCooldown > 0) {
            state.hitCooldown -= framesToAdvance;
            if (state.hitCooldown < 0) state.hitCooldown = 0;
        }

        // 230Fの受付寿命カウンターを消費（最初の1発目を叩いた後のみカウント開始お！）
        if (state.hasStarted && !state.isExpired) {
            state.acceptTimer -= framesToAdvance;
            if (state.acceptTimer <= 0) {
                state.acceptTimer = 0;
                state.isExpired = true; // 運命のタイムアップ！「次叩かれたら空っぽ化」フラグをロックON！
                console.log(`⏰ [10コインレンガ] 230Fが完全にタイムアップ！次回の頭突きで即座に空ブロック化するお！`);
            }
        }
    });

    // --- 🧱 ブロックの12フレーム振動タイマー処理 ---
    for (let i = animatingBlocks.length - 1; i >= 0; i--) {
        const block = animatingBlocks[i];
        block.timer += framesToAdvance;

        if (block.timer >= 12) {
            tileMap[block.row][block.col] = block.endTileId;
            animatingBlocks.splice(i, 1);
        }
    }

    // --- 🪙 コインの30フレーム・ステップ物理ライフサイクル ---
    for (let i = activeCoins.length - 1; i >= 0; i--) {
        const coin = activeCoins[i];
        
        coin.frameBuffer += framesToAdvance;

        while (coin.frameBuffer >= 1) {
            coin.frameBuffer -= 1; 
            coin.timer++;          

            if (coin.timer > 30) {
                if (typeof addScore === 'function') { addScore(200); }
                if (typeof spawnScoreEffect === 'function') {
                    spawnScoreEffect(coin.x, coin.y, 200);
                }

                activeCoins.splice(i, 1);
                break;
            }

            let moveY = 0;

            if (coin.timer <= 16) {
                if (coin.timer <= 4)       moveY = -4; 
                else if (coin.timer <= 8)  moveY = -3; 
                else if (coin.timer <= 12) moveY = -2; 
                else                       moveY = -1; 
            } else {
                const fallFrame = coin.timer - 16;
                if (fallFrame <= 3)        moveY = 1;  
                else if (fallFrame <= 7)   moveY = 2;  
                else if (fallFrame <= 11)  moveY = 3;  
                else                       moveY = 4;  
            }

            coin.y += moveY; 
        }
    }
}

/**
 * 🎬 ブロックとコインを画面に描画する関数
 */
function drawRisingBlocks() {
    for (let i = 0; i < animatingBlocks.length; i++) {
        const block = animatingBlocks[i];
        
        let offsetY = 0;
        const currentFrame = Math.floor(block.timer);

        if (currentFrame <= 6) {
            offsetY = -Math.floor((currentFrame / 6) * 4);
        } else if (currentFrame <= 12) {
            offsetY = -4 + Math.floor(((currentFrame - 6) / 6) * 4);
        }

        const screenX = block.baseX - cameraX;
        const screenY = block.baseY + offsetY;

        if (screenX >= -TILE_SIZE && screenX <= canvas.width && screenY >= -TILE_SIZE) {
            if (tileSprites && tileSprites[block.endTileId]) {
                ctx.drawImage(tileSprites[block.endTileId], screenX, screenY, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    for (let i = 0; i < activeCoins.length; i++) {
        const coin = activeCoins[i];

        const totalSteps = Math.floor(coin.timer / 2);
        const animationIndex = totalSteps % 4; 

        const coinWidth = 8;
        const coinHeight = 16;

        const screenX = coin.x - cameraX;
        const screenY = coin.y;

        if (screenX >= -coinWidth && screenX <= canvas.width && screenY >= -coinHeight) {
            if (coinSprites && coinSprites[animationIndex]) {
                ctx.drawImage(coinSprites[animationIndex], screenX, screenY, coinWidth, coinHeight);
            }
        }
    }
}
