// =================================================================
// 🪠 pipe.js : 移動物理干渉バグ完全修正・土管内せり上がり復帰システム
// =================================================================

// 👑【新設！】横土管に入った後の暗転120フレームウェイト用カウンター
let pipeWarpDelayTimer = 0;

/**
 * 🪠 マリオが「入れる土管」に正しく触れているかを毎フレーム監視・判定する関数お！
 */
function checkPlayerPipeEntry() {
    if (typeof player === 'undefined' || player.isTransforming) return;
    
    // 💥 すでに土管のアニメーション中（0x03, 0x05, 0x06）なら判定を完全ロックして多重発動をガード！
    if (player.playerState === 0x03 || player.playerState === 0x05 || player.playerState === 0x06) return;
    
    // 💡 通常状態（0x08）のときのみ進入チェックを行うお！
    if (player.playerState !== 0x08) return;

    // ─── 🪠 ① 横向き土管（右進）の進入判定チェック ───
    if (keys.ArrowRight) {
        const playerRightX = player.x + player.width;
        const footY = player.y + player.height;
        
        const nextCol = Math.floor((playerRightX + 2) / TILE_SIZE);
        const centerRow = Math.floor((player.y + player.height / 2) / TILE_SIZE); 
        const footRow = Math.floor((footY - 1) / TILE_SIZE); 

        let foundHorizontalPipe = false;
        let pipeTopRow = -1;

        if (tileMap[centerRow] && (tileMap[centerRow][nextCol] === 104 || tileMap[centerRow][nextCol] === 106)) {
            foundHorizontalPipe = true;
            pipeTopRow = (tileMap[centerRow][nextCol] === 106) ? centerRow : centerRow - 1;
        } else if (tileMap[footRow] && (tileMap[footRow][nextCol] === 104 || tileMap[footRow][nextCol] === 106)) {
            foundHorizontalPipe = true;
            pipeTopRow = (tileMap[footRow][nextCol] === 106) ? footRow : footRow - 1;
        }

        if (foundHorizontalPipe && pipeTopRow !== -1) {
            const pipeEntryX = nextCol * TILE_SIZE;
            const pipeFloorY = (pipeTopRow + 2) * TILE_SIZE; 
            
            if (footY >= pipeFloorY - 32 && footY <= pipeFloorY) {
                if (playerRightX >= pipeEntryX - 4) {
                    console.log("🪠 横土管への進入成立お！足をパタパタさせて吸い込まれるお！");
                    
                    player.playerState = 0x05; 
                    player.vx = 0;
                    player.vy = 0; 
                    
                    player.x = pipeEntryX - player.width;
                    player.y = pipeFloorY - player.height; 
                    player.pipeTargetX = player.x + 16;
                    player.x += 0.5;

                    // 💥【新設！】ワープ用遅延タイマーを新品リセット
                    pipeWarpDelayTimer = 0;

                    setTimeout(() => {
                        if (typeof playSE === 'function') { playSE('pipepowerdown'); }
                    }, 0);
                    return; 
                }
            }
        }
    }

    // ─── 🪠 ② 縦向き土管（下進）の進入判定チェック ───
    if (!keys.ArrowDown || !player.isGrounded) return;

    const footY = player.y + player.height;
    const row = Math.floor(footY / TILE_SIZE);
    const playerCenterX = player.x + player.width / 2;
    const leftCol  = Math.floor(player.x / TILE_SIZE);
    const rightCol = Math.floor((player.x + player.width - 1) / TILE_SIZE);

    let foundPipe = false;
    let pipeLeftCol = -1;

    if (tileMap[row] && (tileMap[row][leftCol] === 55 || tileMap[row][leftCol] === 56)) {
        foundPipe = true;
        pipeLeftCol = (tileMap[row][leftCol] === 55) ? leftCol : leftCol - 1;
    } else if (tileMap[row] && (tileMap[row][rightCol] === 55 || tileMap[row][rightCol] === 56)) {
        foundPipe = true;
        pipeLeftCol = (tileMap[row][rightCol] === 55) ? rightCol : rightCol - 1;
    }

    if (foundPipe && pipeLeftCol !== -1) {
        const pipeX1 = pipeLeftCol * TILE_SIZE;
        const pipeX2 = pipeX1 + 32;

        if (playerCenterX >= pipeX1 && playerCenterX <= pipeX2) {
            const pipeTopY = row * TILE_SIZE;
            if (Math.abs(footY - pipeTopY) <= 1) {
                console.log("🪠 縦土管から地下ボーナスステージへ降下開始お！");
                player.playerState = 0x33; 
                player.vx = 0; 
                player.vy = 0; 
                player.x = pipeX1 + 16 - player.width / 2;
                
                // 地下突入時に、大元の地上マップ配列（参照）をグローバルに一時退避させておくお！
                window.originalOverworldMapRef = tileMap;

                setTimeout(() => {
                    if (typeof playSE === 'function') { playSE('pipepowerdown'); }
                }, 0);
            }
        }
    }
}

/**
 * 🔄 土管進入中 ＆ 地上復帰中のマリオの自動アニメーション駆動ロジック
 */
function updatePipeAnimation(dtModifier) {
    if (typeof player === 'undefined') return;

    // 🔽 1. 縦土管の沈み込み＆地下暗転ワープ
    if (player.playerState === 0x33) { 
        player.y += 0.5 * dtModifier;
        const pipeTopY = 9 * TILE_SIZE; 
        
        if (player.y >= pipeTopY + 32) {
            if (typeof stopAllBGM === 'function') stopAllBGM();
            if (typeof startBGM === 'function') startBGM('underground'); 

            if (typeof bonusTileMap !== 'undefined') {
                tileMap = bonusTileMap;         
                MAP_WIDTH = BONUS_MAP_WIDTH;   
                MAP_HEIGHT = BONUS_MAP_HEIGHT; 
                window.isUnderground = true;   
                if (typeof loadStageSprites === 'function') { loadStageSprites(true); }
            }

            cameraX = 0;             
            player.x = 32;           
            player.y = 32;           
            player.playerState = 0x08; 
            player.vx = 0;           
            player.vy = 0;           
            player.isGrounded = false; 
        }
    }

    // ▶️ 2. 横向き土管の自動右めり込みアニメーション（0x05）
    if (player.playerState === 0x05) {
        player.vx = 0;
        player.vy = 0;

        // まだめり込みが完了していない場合
        if (player.x < player.pipeTargetX) {
            player.x += 0.5 * dtModifier; 
            if (player.x >= player.pipeTargetX) {
                player.x = player.pipeTargetX;
                // 🥷 マリオを完全に画面外（消滅状態）へ隠すため、一時的にvanishedをONにして黒画面と同化させるお！
                player.vanished = true;
                console.log("🛑 16pxめり込み完了！地上ワープ前の120F暗転ホールドタイマーを開始するお！！！");
            }
        } else {
            // 👑 ─── 【今回の神アップデート核心タスク！】 ───
            // 16pxめり込みきった状態（マリオ消滅中）で、きっちり120フレームが経過するまでカウントアップ！
            pipeWarpDelayTimer += dtModifier;

            if (pipeWarpDelayTimer >= 120) {
                pipeWarpDelayTimer = 0; // タイマーを安全にゼロクリア
                player.vanished = false; // マリオの姿を復活させてニョキニョキ準備お！
                
                console.log("⏰ 120F経過！満を持して地上へ暗転ワープするおぶ！！！ｗｗｗ");
                
                if (typeof stopAllBGM === 'function') stopAllBGM();
                if (typeof startBGM === 'function') startBGM('overworld'); // 地上BGM復活！

                // 🧱 退避させておいたリアルタイムな地上マップへの参照を安全に戻すお！
                if (window.originalOverworldMapRef) {
                    tileMap = window.originalOverworldMapRef;
                }
                
                // 👑【大調砕修正！】本物の 1-1 マップの仕様値「211」に完璧にジャスト同期おぶ！！！ｗｗｗ
                MAP_WIDTH = 211; 
                MAP_HEIGHT = 15;
                window.isUnderground = false; // 地上モードへ
                if (typeof loadStageSprites === 'function') { loadStageSprites(false); }

                // 💥 タイルマップ内から、あなたが配置してくれた本物の「155」の位置を自動検出お！
                let targetCol = 163; 
                let targetRow = 11;  
                let foundMatch = false;

                for (let r = 0; r < MAP_HEIGHT; r++) {
                    for (let c = 0; c < MAP_WIDTH; c++) {
                        if (tileMap[r] && tileMap[r][c] === 155) {
                            targetRow = r;
                            targetCol = c;
                            foundMatch = true;
                            break;
                        }
                    }
                    if (foundMatch) break;
                }

                console.log(`🎯 本物の155をロックオンお！ Row: ${targetRow}, Col: ${targetCol}`);

                // ② カメラ位置を配置！
                cameraX = (targetCol * TILE_SIZE) - 112;

                // 💡 画面外先回りエネミースポーンバッファもワープ先に連動同期お！
                if (typeof lastCheckedSpawnCol !== 'undefined') {
                    lastCheckedSpawnCol = Math.floor((cameraX + 256) / TILE_SIZE);
                }

                // 💥【最初から土管の中に潜った状態にするお！】
                // X座標は土管の真ん中
                player.x = (targetCol * TILE_SIZE) + 16 - (player.width / 2);
                // Y座標は土管の天面から、マリオの身長分「丸ごと下」に埋め込んで隠すお！！！ｗｗｗ
                player.y = (targetRow * TILE_SIZE) + player.height; 

                // 🚀 状態を「0x06：地上復帰せり上がり」にして、最終的な着地目標の高さ（土管の上）を設定！
                player.playerState = 0x06;     
                player.pipeTargetY = (targetRow * TILE_SIZE) - player.height; 
                player.vx = 0;                 
                player.vy = 0;

                console.log("🪠 土管の内部への埋め込み完了！自動せり上がりを開始するお！");
            }
        }
    }

    // 🔼 3. 【等速スピード同期版】地上復帰のニョキニョキ上方向せり上がり演出（0x06）
    if (player.playerState === 0x06) {
        player.vx = 0;
        player.vy = 0;

        // 💡 修正：せり上がる速度を「0.5」から、下りと同じ「1.0 * dtModifier」にスピードアップお！！！ｗｗｗ
        if (player.y > player.pipeTargetY) {
            player.y -= 1.0 * dtModifier;
            player.animCounter += 1.0 * 0.15 * dtModifier; // スピードに合わせて足パタパタも同期お！

            if (player.y <= player.pipeTargetY) {
                player.y = player.pipeTargetY - 1; 
                
                player.playerState = 0x08;     // 通常操作可能状態（0x08）へ完全大復活！
                player.isGrounded = true;      
                player.vx = 0;                 
                player.vy = 0;
                console.log("🎉 下りと同じ爆速スピードで、引っかかりゼロのせり上がり復帰大成功お！！！");
            }
        }
    }
}
