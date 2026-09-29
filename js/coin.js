// =================================================================
// 🪙 coin.js : マップ配置コインのリアルタイム判定＆獲得システムだお！
// =================================================================

/**
 * 🏃‍♂️ マリオとマップ上のコイン（ID: 30）の接触を先回りチェックする関数
 * マリオの四角形（AABB）がコインのあるタイルに重なったら、コインを消去してSEを鳴らすお！
 */
function checkPlayerCoinCollisions() {
    if (typeof player === 'undefined' || player.playerState === 0x03) return;

    // マリオの現在の四隅の座標から、乗っているタイルの範囲（Row/Col）を割り出すお！
    const startCol = Math.floor(player.x / TILE_SIZE);
    const endCol   = Math.floor((player.x + player.width - 1) / TILE_SIZE);
    const startRow = Math.floor(player.y / TILE_SIZE);
    const endRow   = Math.floor((player.y + player.height - 1) / TILE_SIZE);

    // マリオの体が触れているタイルの中に「30（コイン単体）」がないかループで探すお！
    // （関数の上部はそのまま維持）
    for (let row = startRow; row <= endRow; row++) {
        if (!tileMap[row]) continue;
        for (let col = startCol; col <= endCol; col++) {
            if (tileMap[row][col] === 30) {
            
                // 1. 2重獲得防止のためにマップから消す
                tileMap[row][col] = 0;

                // 2. コイン音を鳴らす
                if (typeof playSE === 'function') {
                    playSE('coin');
                }
                // 💥【ここを追加お！！！ｗｗｗ】コイン枚数を+1！
                window.coins++;

            // 👑【本家100枚リセット仕様】100枚溜まったら0に戻るお！
                if (window.coins >= 100) {
                    window.coins = 0;
                    
                    // ① 📊 残機カウンターへ確実に+1加算！
                    if (window.lives !== undefined) {
                        window.lives++;
                    }

                    // ② 🔊 音響連動：用意していただいた「1up.wav」を大爆音再生！！！
                    if (typeof playSE === 'function') {
                        playSE('1up');
                    }

                    // ③ ✨ エフェクト連動：マリオの頭上付近に緑文字の「1up」をポップアップ！
                    if (typeof spawnScoreEffect === 'function') {
                        spawnScoreEffect(player.x, player.y - 16, '1up');
                    }
                    console.log("🪙 👑 【夢の100枚突破！】コイン100枚ボーナスで残機が1UPしたおぶ！！！ｗｗｗ");
                } else {
                    // 100枚未満の通常獲得時は、今まで通り通常のコインSEを鳴らすお！
                    if (typeof playSE === 'function') {
                        playSE('coin');
                    }
                }
                console.log(`🪙 マップのコインを獲得！ 現在の枚数: ${window.coins}枚`);
            }
        }
    }
}
