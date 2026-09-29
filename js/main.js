// =================================================================
// 🎮 main.js 【パート1】: システム初期化 ＆ スプライト動的ロード
// =================================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// グローバルなアクティブエネミー配列
window.activeEnemies = [];

// 👑【本家NES実機アドレス完全再現】
window.ram_0x071A = 0;               // CurrentPageLoc: カメラが現在表示している画面のページ番号（0〜）
window.STAGE_MIDWAY_BORDER = 0x06;   // 1-1の中間境界値：6ページ目（土管から地下ボーナスに降りる手前辺り）
window.MIDWAY_START_PAGE = 0x06;     // 境界を超えていた場合の復活リスタートページ番号（固定値0x06）

window.INITIAL_PLAYER_X = 41;        // ステージ開始時の初期マリオX座標
window.INITIAL_PLAYER_Y = 192;       // ステージ開始時の初期マリオY座標
if (typeof player !== 'undefined') player.stompCombo = 0;

// ─── 🧱 1. メインの地形マップチップ画像の管理オブジェクト（お城追加版お！） ───
const tileSprites = {
    1: new Image(),   // 地面
    2: new Image(),   // レンガ
    21: new Image(),   // 10コイン
    22: new Image(),  // レンガ2
    23: new Image(),  //スター
    222: new Image(), // レンガ3
    3: new Image(),   // はてな（第1段階：明るい）
    32: new Image(),  // はてな（第2・4段階：中間）
    33: new Image(),  // はてな（第3段階：暗い）
    4: new Image(),   // 硬いブロック
    5: new Image(),   // 土管left-upper
    6: new Image(),   // 土管right-upper
    7: new Image(),   // 土管left-lower
    8: new Image(),   // 土管right-lower
    9: new Image(),   // 空ブロック
    10: new Image(),  // キノコ入りはてな（第1段階）
    55: new Image(),  // 入れる土管の左上パーツ
    56: new Image(),  // 入れる土管の右上パーツ
    30: new Image(),  // コイン単体
    301: new Image(), // コイン単体2
    302: new Image(), // コイン単体3
    155: new Image(), // 出口土管の左上
    156: new Image(), // 出口土管の右上
    101: new Image(), // rootpipe_bottom.png
    102: new Image(), // rootpipe_top.png
    103: new Image(), // besidepipe_lowerright.png
    104: new Image(), // besidepipe_lowerleft.png
    105: new Image(), // besidepipe_upperright.png
    106: new Image(), // besidepipe_upperleft.png

    // 👑【新設！】お城を構築するための専用タイルレンガアセットだお！！！ｗｗｗ
    81: new Image(),  // castle_brick1.png
    82: new Image(),  // castle_brick2.png
    83: new Image(),  // castle_brick3.png
    84: new Image(),  // castle_brick4.png
    85: new Image(),   // castle_brick5.png
    86: new Image()   // black.png
};

// ─── ⛰️ 2. 背景装飾（山・草・雲）の画像管理オブジェクト ───
const bgSprites = {
    11: new Image(), // 雲 左
    12: new Image(), // 雲 中
    13: new Image(), // 雲 右
    21: new Image(), // 山 頂点
    22: new Image(), // 山 左斜面
    23: new Image(), // 山 右斜面
    24: new Image(), // 山 模様あり左 (pattern_left)
    25: new Image(), // 山 模様あり右 (pattern_right)
    26: new Image(), // 山 模様なし中心 (center)
    31: new Image(), // 草 左 (通常の草)
    32: new Image(), // 草 中 (通常の草)
    33: new Image(), // 草 右 (通常の草)
    
    // 11行目専用のグリーン版の草
    311: new Image(), // 草 左（緑）
    321: new Image(), // 草 中（緑）
    331: new Image()  // 草 右（緑）
};

// ─── 🪙 3. 回転コインのアニメーションスプライト配列 ───
const coinSprites = [
    new Image(), // 0: 正面
    new Image(), // 1: ななめ
    new Image(), // 2: 真横
    new Image()  // 3: ななめ裏
];

// ⏱️ 画像の重複ロード防止と初期カウント用変数
let totalImages = Object.keys(tileSprites).length + Object.keys(bgSprites).length + coinSprites.length;
let loadedImages = 0;
let isGameStarted = false; // ゲームループ重複起動防止フラグ

/**
 * 🎨 地上/地下のステージ状態に応じて、すべての画像アセットのパスを一括で切り替える関数だお！
 * @param {boolean} isUnderground - 地下ステージならtrue
 */
function loadStageSprites(isUnderground) {
    const tilePath = isUnderground ? 'sprite/tileset/underground/' : 'sprite/tileset/';
    const itemPath = isUnderground ? 'sprite/items/underground/'   : 'sprite/items/';

    // ─── 🧱 地形マップチップ（tileSprites）のパス設定 ───
    tileSprites[1].src  = tilePath + 'ground.png';
    tileSprites[2].src  = tilePath + 'brick.png';
    tileSprites[21].src  = tilePath + 'brick.png';
    tileSprites[22].src = tilePath + 'brick2.png';
    tileSprites[23].src = tilePath + 'brick.png'; 
    tileSprites[222].src = tilePath + 'brick2.png';
    tileSprites[3].src  = tilePath + 'question1.png';  
    tileSprites[32].src = tilePath + 'question2.png'; 
    tileSprites[33].src = tilePath + 'question3.png'; 
    tileSprites[4].src  = tilePath + 'hard.png';
    tileSprites[5].src  = tilePath + 'claypipe_upperleft.png';
    tileSprites[6].src  = tilePath + 'claypipe_upperright.png';
    tileSprites[7].src  = tilePath + 'claypipe_lowerleft.png';
    tileSprites[8].src  = tilePath + 'claypipe_lowerright.png';
    tileSprites[9].src  = tilePath + 'empty.png'; 
    tileSprites[10].src = tilePath + 'question1.png'; 
    tileSprites[55].src = tilePath + 'claypipe_upperleft.png';  
    tileSprites[56].src = tilePath + 'claypipe_upperright.png'; 
    tileSprites[30].src = itemPath + 'coin1.png';
    tileSprites[301].src = itemPath + 'coin2.png';
    tileSprites[302].src = itemPath + 'coin3.png';    
    tileSprites[155].src = tilePath + 'claypipe_upperleft.png';  
    tileSprites[156].src = tilePath + 'claypipe_upperright.png'; 
    tileSprites[101].src = tilePath + 'rootpipe_bottom.png';
    tileSprites[102].src = tilePath + 'rootpipe_top.png';
    tileSprites[103].src = tilePath + 'besidepipe_lowerright.png';
    tileSprites[104].src = tilePath + 'besidepipe_lowerleft.png';
    tileSprites[105].src = tilePath + 'besidepipe_upperright.png';
    tileSprites[106].src = tilePath + 'besidepipe_upperleft.png';

    // 👑【新設！】お城のテクスチャパスを完全同期だお！！！
    tileSprites[81].src = 'sprite/tileset/castle_brick1.png';
    tileSprites[82].src = 'sprite/tileset/castle_brick2.png';
    tileSprites[83].src = 'sprite/tileset/castle_brick3.png';
    tileSprites[84].src = 'sprite/tileset/castle_brick4.png';
    tileSprites[85].src = 'sprite/tileset/castle_brick5.png';
    tileSprites[86].src = 'sprite/tileset/black.png';
    
    // 背景グラフィックパス設定
    bgSprites[11].src  = 'sprite/tileset/bottomcloud_left.png';
    bgSprites[12].src  = 'sprite/tileset/bottomcloud_center.png';
    bgSprites[13].src  = 'sprite/tileset/bottomcloud_right.png';
    bgSprites[21].src  = 'sprite/tileset/mountain_left.png';
    bgSprites[22].src  = 'sprite/tileset/mountain_center.png';
    bgSprites[23].src  = 'sprite/tileset/mountain_right.png';
    bgSprites[24].src  = 'sprite/tileset/mountain_pattern_left.png';
    bgSprites[25].src  = 'sprite/tileset/mountain_pattern_right.png';
    bgSprites[26].src  = 'sprite/tileset/mountain_top.png';
    bgSprites[31].src  = 'sprite/tileset/grass_left.png';
    bgSprites[32].src  = 'sprite/tileset/grass_center.png';
    bgSprites[33].src  = 'sprite/tileset/grass_right.png';
    bgSprites[311].src = 'sprite/tileset/grass_left_green.png';
    bgSprites[321].src = 'sprite/tileset/grass_center_green.png';
    bgSprites[331].src = 'sprite/tileset/grass_right_green.png';

    if (isUnderground) {
        coinSprites[0].src = itemPath + 'coin1.png'; 
        coinSprites[1].src = itemPath + 'coin2.png'; 
        coinSprites[2].src = itemPath + 'coin3.png'; 
        coinSprites[3].src = itemPath + 'coin2.png'; 
    } else {
        coinSprites[0].src = itemPath + 'coin_animation1.png';
        coinSprites[1].src = itemPath + 'coin_animation2.png';
        coinSprites[2].src = itemPath + 'coin_animation3.png';
        coinSprites[3].src = itemPath + 'coin_animation4.png';
    }

    console.log(`🎨 スプライトの画像パスを切り替えたお！(地下モード: ${isUnderground})`);
}

// 初期ロードは地上ステージからスタートお！
loadStageSprites(false);
// =================================================================
// 🎮 main.js 【パート2】: 画像ロード監視 ＆ エネミースポーン
// =================================================================

function onImageLoad() {
    loadedImages++;
    if (loadedImages === totalImages && !isGameStarted) {
        isGameStarted = true;
        initEnemiesFromMap(); 
        gameLoop();
    }
}

Object.values(tileSprites).forEach(img => img.onload = onImageLoad);
Object.values(bgSprites).forEach(img => img.onload = onImageLoad);
coinSprites.forEach(img => img.onload = onImageLoad);

// =================================================================
// 🍄 画面外先回り一括エネミースポーンシステム
// =================================================================
let lastCheckedSpawnCol = -1;

function initEnemiesFromMap() {
    activeEnemies.length = 0; 
    
    if (typeof lastSpawnedKuriboCol !== 'undefined') lastSpawnedKuriboCol = -1;

    const initialCols = Math.ceil(canvas.width / TILE_SIZE);

    for (let row = 0; row < MAP_HEIGHT; row++) {
        for (let col = 0; col < initialCols; col++) {
            if (tileMap[row][col] === 50) {
                if (typeof spawnKuribo === 'function') { spawnKuribo(col * TILE_SIZE, row * TILE_SIZE, col); }
                tileMap[row][col] = 0; 
            }
            if (tileMap[row][col] === 60) {
                if (typeof spawnNokonoko === 'function') { spawnNokonoko(col * TILE_SIZE, row * TILE_SIZE, 'green'); }
                tileMap[row][col] = 0; 
            }
            if (tileMap[row][col] === 61) {
                if (typeof spawnNokonoko === 'function') { spawnNokonoko(col * TILE_SIZE, row * TILE_SIZE, 'red'); }
                tileMap[row][col] = 0; 
            }
        }
    }
    lastCheckedSpawnCol = initialCols - 1;
}

function checkScrollEnemySpawning() {
    if (typeof cameraX === 'undefined') return;

    const bufferX = cameraX + canvas.width + 32;
    const currentRightCol = Math.floor(bufferX / TILE_SIZE);

    if (currentRightCol > lastCheckedSpawnCol) {
        for (let col = lastCheckedSpawnCol + 1; col <= currentRightCol; col++) {
            if (col >= MAP_WIDTH) break;

            for (let row = 0; row < MAP_HEIGHT; row++) {
                if (!tileMap[row] || tileMap[row][col] === undefined) continue;

                if (tileMap[row][col] === 50) {
                    if (typeof spawnKuribo === 'function') { spawnKuribo(col * TILE_SIZE, row * TILE_SIZE, col); }
                    tileMap[row][col] = 0; 
                }
                if (tileMap[row][col] === 60) {
                    if (typeof spawnNokonoko === 'function') { spawnNokonoko(col * TILE_SIZE, row * TILE_SIZE, 'green'); }
                    tileMap[row][col] = 0; 
                }
                if (tileMap[row][col] === 61) {
                    if (typeof spawnNokonoko === 'function') { spawnNokonoko(col * TILE_SIZE, row * TILE_SIZE, 'red'); }
                    tileMap[row][col] = 0; 
                }
            }
        }
        lastCheckedSpawnCol = currentRightCol;
    }
}
// =================================================================
// 🎮 main.js 【パート3】: プレイヤー ＆ エネミー衝突物理判定システム（スター無敵完全対応版お！）
// =================================================================

function checkPlayerEnemyCollisions() {
    if (typeof player === 'undefined' || !activeEnemies) return;

    // 💥【通常被弾の鉄壁ガード】
    // ダメージ後の通常の点滅無敵タイマー（150）が残っている間は、お互いにすり抜ける実機仕様お！
    // 💡 ただし！「スター無敵（isInvincible）」の時はすり抜けず、敵を粉砕したいのでここはスルーさせるおぶ！！！
    if (!player.isInvincible && player.invincibleTimer !== undefined && player.invincibleTimer > 0) return;

    for (let i = 0; i < activeEnemies.length; i++) {
        const enemy = activeEnemies[i];

        // すでに衝撃波や甲羅で吹っ飛ばされ中の敵（0x04）は全スルー
        if (enemy.enemyState === 0x04) continue;
        // クリボーがすでに踏まれてペッシャンコ（0x02）の時も全スルー
        if (enemy.type === 'kuribo' && enemy.enemyState === 0x02) continue;

        // ノコノコ甲羅状態の高さ補正
        const currentHeight = (enemy.type === 'nokonoko' && (enemy.enemyState === 0x02 || enemy.enemyState === 0x03)) ? 16 : enemy.height;
        const currentY = (enemy.type === 'nokonoko' && (enemy.enemyState === 0x02 || enemy.enemyState === 0x03)) ? (enemy.y + 8) : enemy.y;

        // 📐 プレイヤーと敵の AABB（矩形）当たり判定チェック
        const isOverlapping = 
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < currentY + currentHeight &&
            player.y + player.height > currentY;

        if (isOverlapping) {
            
            // 👑 ─── 【新設！！ スースター無敵モードの最終ジャッジタスク！！！】 ───
            if (player.isInvincible) {
                console.log(`🌟 🌟 スター無敵アタック！ [${enemy.type}] を一撃粉砕なぎ倒しおぶ！！！ｗｗｗ`);
                
                // ① 敵の状態を「0x04（上下逆さま放物線死亡ステート）」へ強制書き換え！
                enemy.enemyState = 0x04;
                enemy.height = 16; // 描画サイズを甲羅／等身に固定
                enemy.vy = -3.5;   // 上方向への実機初速跳ね上がり数値！
                
                // 💡 マリオの進行方向、または中心座標の位置関係から、吹っ飛ぶ左右のX速度をジャスト決定！
                const playerCenterX = player.x + player.width / 2;
                const enemyCenterX = enemy.x + enemy.width / 2;
                enemy.vx = (playerCenterX < enemyCenterX) ? 1.0 : -1.0; 

                // ② 🔊 SE再生：甲羅で敵を蹴散らした時と同じ「kickkill」を爆音再生お！！！
                if (typeof playSE === 'function') { 
                    playSE('kickkill'); 
                }

                // ③ 📊 コンボスコア加算 ＆ フワフワ数字エフェクトの完全連動リンクお！！！
                if (typeof addComboScore === 'function') {
                    // 無敵ダッシュ中に敵を連続でなぎ倒すと、本家通りスコアが 100➔200➔400... と倍々でコンボアップ！
                    // 9体目以降は夢の『無限1UP（1up.wav）』まで完全に自動突入する神パッチおぶ！！！ｗｗｗｗｗ
                    const scoreGain = addComboScore(player.stompCombo);
                    if (scoreGain !== undefined) {
                        const displayScore = (scoreGain === -1) ? '1up' : scoreGain;
                        if (typeof spawnScoreEffect === 'function') {
                            spawnScoreEffect(enemy.x, enemy.y, displayScore);
                        }
                    }
                    player.stompCombo++; // コンボインクリメント！
                }
                
                continue; // スター無敵で敵を倒したため、以下の通常踏み・被弾処理は100%全カットして即スキップお！
            }


            // 🏃‍♂️ ─── 【以下は通常の非無敵時の当たり判定ロジックお！】 ───
            const isStepping = (player.vy > 0) && (player.y + player.height - player.vy <= currentY + 6);
            const jumpPressed = keys.KeyX || keys.Space;

            if (enemy.type === 'nokonoko') {
                if (enemy.enemyState === 0x03) {
                    // 爆走中の甲羅に横から激突
                    enemy.enemyState = 0x04; 
                    enemy.vy = -3.5;         
                    enemy.vx = (player.direction === 1) ? 1.5 : -1.5; 
                    
                    if (isStepping) {
                        player.vy = jumpPressed ? -5.0 : -4.0;
                        player.isGrounded = false;
                    }

                    if (typeof playSE === 'function') { playSE('kickkill'); }
                    console.log("💀 コンボ3！爆走中の甲羅に触れて吹っ飛ばしたお！");
                    continue;
                }

                if (enemy.enemyState === 0x02) {
                    // 静止中の甲羅を蹴る
                    enemy.enemyState = 0x03; 
                    enemy.height = 16;       
                    enemy.shellCombo = 0; 

                    const playerCenterX = player.x + player.width / 2;
                    const enemyCenterX = enemy.x + enemy.width / 2;

                    if (isStepping) {
                        enemy.direction = (playerCenterX < enemyCenterX) ? 1 : -1;
                        player.vy = jumpPressed ? -5.0 : -4.0; 
                        player.isGrounded = false;
                        console.log("🚀 コンボ2：【踏まれる】甲羅を滑らせたお！");
                    } else {
                        enemy.direction = (player.direction === 1) ? 1 : -1;
                        console.log("🚀 コンボ2：【蹴る】体当たりで甲羅を滑らせたお！");
                    }

                    enemy.vx = enemy.direction * 3.0; 
                    if (typeof playSE === 'function') { playSE('kickkill'); }
                    continue;
                }

                if (enemy.enemyState === 0x00) {
                    // 通常ノコノコを踏む／激突
                    if (isStepping) {
                        enemy.enemyState = 0x02; 
                        enemy.height = 16;
                        enemy.y += 8;            
                        enemy.reviveTimer = 255; 

                        player.vy = jumpPressed ? -5.0 : -4.0;
                        player.isGrounded = false;

                        if (typeof playSE === 'function') { playSE('stompswim'); }

                        if (typeof addComboScore === 'function') {
                            const scoreGain = addComboScore(player.stompCombo);
                            if (scoreGain !== undefined) {
                                const displayScore = (scoreGain === -1) ? '1up' : scoreGain;
                                if (typeof spawnScoreEffect === 'function') spawnScoreEffect(enemy.x, enemy.y, displayScore);
                            }
                        }
                        player.stompCombo++; 
                        console.log("🐢 コンボ1：通常ノコノコを踏んで静止甲羅にしたお！");
                    } else {
                        if (typeof player.triggerDamage === 'function') {
                            player.triggerDamage();
                        }
                        console.log("⚠️ 通常ノコノコに正面衝突おぶ！");
                    }
                    continue;
                }
            }

            if (enemy.type === 'kuribo') {
                if (isStepping) {
                    // 通常クリボーを踏んづける
                    if (typeof playSE === 'function') { playSE('stompswim'); }
                    player.vy = jumpPressed ? -5.0 : -4.0; 
                    player.isGrounded = false; 
                    enemy.enemyState = 0x02; 
                    enemy.deadTimer = 0;     

                    if (typeof addComboScore === 'function') {
                        const scoreGain = addComboScore(player.stompCombo);
                        if (scoreGain !== undefined) {
                            const displayScore = (scoreGain === -1) ? '1up' : scoreGain;
                            if (typeof spawnScoreEffect === 'function') spawnScoreEffect(enemy.x, enemy.y, displayScore); 
                        }
                    }
                    player.stompCombo++; 
                    console.log("🍄/🐢 敵を踏んづけてスコアをポップアップさせたお！！！ｗｗｗ");
                } else {
                    // クリボーに正面衝突（被弾）
                    if (typeof player.triggerDamage === 'function') {
                        player.triggerDamage();
                    }
                    console.log("⚠️ クリボーに正面衝突おぶ！！！");
                }
            }
        }
    }
}
// =================================================================
// 🎮 main.js 【パート4】: エネミーループ更新 ＆ 復活リスタート処理
// =================================================================

function updateEnemies(dtModifier) {
    if (!activeEnemies) return;

    for (let i = activeEnemies.length - 1; i >= 0; i--) {
        const enemy = activeEnemies[i];
        if (enemy.y > 270 || enemy.x < cameraX - 64 || enemy.x > cameraX + 320) {
            activeEnemies.splice(i, 1);
        }
    }

    activeEnemies.forEach(enemy => {
        if (enemy.type === 'kuribo') {
            updateKuriboLogic(enemy, dtModifier);
        } else if (enemy.type === 'nokonoko') {
            updateNokonokoLogic(enemy, dtModifier);
        }
    });

    for (let i = 0; i < activeEnemies.length; i++) {
        const enemy = activeEnemies[i];
        if (enemy.enemyState === 0x04) continue;

        for (let j = i + 1; j < activeEnemies.length; j++) {
            const other = activeEnemies[j];
            if (other.enemyState === 0x04) continue;

            const e1Height = (enemy.type === 'nokonoko' && (enemy.enemyState === 0x02 || enemy.enemyState === 0x03)) ? 16 : enemy.height;
            const e1Y      = (enemy.type === 'nokonoko' && (enemy.enemyState === 0x02 || enemy.enemyState === 0x03)) ? (enemy.y + 8) : enemy.y;

            const e2Height = (other.type === 'nokonoko' && (other.enemyState === 0x02 || other.enemyState === 0x03)) ? 16 : other.height;
            const e2Y      = (other.type === 'nokonoko' && (other.enemyState === 0x02 || other.enemyState === 0x03)) ? (other.y + 8) : other.y;

            const isColliding = 
                enemy.x < other.x + other.width &&
                enemy.x + enemy.width > other.x &&
                e1Y < e2Y + e2Height &&
                e1Y + e1Height > e2Y;

            if (isColliding) {
                if (enemy.type === 'nokonoko' && enemy.enemyState === 0x03) {
                    if (other.enemyState === 0x00 || other.enemyState === 0x02) {
                        other.enemyState = 0x04; 
                        other.vy = -3.5;         
                        other.vx = (enemy.vx > 0) ? 1.0 : -1.0; 

                        if (typeof playSE === 'function') { playSE('kickkill'); }
                        if (typeof addComboScore === 'function') {
                            // 💥 コンボスコアをキャッチしてフワフワエフェクトをキック！
                            const comboGain = addComboScore(enemy.shellCombo);
                            if (comboGain !== undefined) {
                                const displayScore = (comboGain === -1) ? '1up' : comboGain;
                                spawnScoreEffect(other.x, other.y, displayScore);
                            }
                        }
                        enemy.shellCombo++; 
                        console.log("💥 爆走甲羅が敵をなぎ倒したお！！！");
                    }
                    continue;
                }

                if (other.type === 'nokonoko' && other.enemyState === 0x03) {
                    if (enemy.enemyState === 0x00 || enemy.enemyState === 0x02) {
                        enemy.enemyState = 0x04; 
                        enemy.vy = -3.5;
                        enemy.vx = (other.vx > 0) ? 1.0 : -1.0; 
                        
                        if (typeof playSE === 'function') { playSE('kickkill'); }
                        console.log("💥 敵が正面から爆走甲羅に吹っ飛ばされたお！！！");
                    }
                    continue;
                }

                if (enemy.enemyState === 0x00 && other.enemyState === 0x00) {
                    if (enemy.x < other.x) {
                        enemy.x -= 1.0; other.x += 1.0;
                        enemy.vx = -Math.abs(enemy.vx);
                        other.vx = Math.abs(other.vx);
                    } else {
                        enemy.x += 1.0; other.x -= 1.0;
                        enemy.vx = Math.abs(enemy.vx);
                        other.vx = -Math.abs(other.vx);
                    }
                }
            }
        }
    }
}

function drawEnemies() {
    if (!activeEnemies) return;

    activeEnemies.forEach(enemy => {
        const screenX = Math.floor(enemy.x) - Math.floor(cameraX);
        const screenY = Math.floor(enemy.y);

        if (screenX < -TILE_SIZE || screenX > canvas.width) return;

        if (enemy.type === 'kuribo') {
            drawKuribo(enemy, screenX, screenY, globalFrameCounter);
        } else if (enemy.type === 'nokonoko') {
            drawNokonoko(enemy, screenX, screenY);
        }
    });
}

function respawnPlayer() {
    console.log(`💀 プレイヤー死亡検知：処理を開始するおぶ！`);

    // ─── 👑【2人プレイ：死んだときの交代セーブ＆ロードエンジン】 ───
    if (window.isTwoPlayerMode) {
        // ① 現在プレイしていたキャラクターの最新状態をバックアップ退避！
        const currentData = (window.currentPlayerNumber === 1) ? window.player1Data : window.player2Data;
        
        currentData.lives = window.lives - 1; // ミスしたので残機をマイナス1してセーブ
        currentData.score = window.score;
        currentData.coins = window.coins;
        currentData.isSuper = player.isSuper;
        currentData.isFire = player.isFire;
        currentData.height = player.height;
        currentData.stage = window.stageName;

        // ② 次に交代する相手の番号を決定（基本は交代お！）
        let nextPlayerNumber = (window.currentPlayerNumber === 1) ? 2 : 1;
        let nextData = (nextPlayerNumber === 1) ? window.player1Data : window.player2Data;

        // 👑【超核心ターゲット仕様！】
        // もし「これから交代しようとしている相手」がすでにこのステージをゴール（クリア）していたら、
        // 順番を戻さずに、今のプレイヤーのターンをそのまま強制ホールド（居残り）させるおぶ！！！ｗｗｗ
        const isNextPlayerAlreadyCleared = (nextPlayerNumber === 1) ? window.isPlayer1Cleared : window.isPlayer2Cleared;
        
        if (isNextPlayerAlreadyCleared) {
            console.log(`🔒 交代相手（${nextPlayerNumber}P）は既にお城で待機中だお！交代を全ロックして居残りリスタートおぶ！！！`);
            nextPlayerNumber = window.currentPlayerNumber; // 順番を自分に戻す
            nextData = (nextPlayerNumber === 1) ? window.player1Data : window.player2Data;
        }

        // もし交代相手の残機がすでになければ、自分（今のプレイヤー）が居残り続行おぶ！
        if (nextData.lives <= 0) {
            nextPlayerNumber = window.currentPlayerNumber;
            nextData = (nextPlayerNumber === 1) ? window.player1Data : window.player2Data;
        }

        // ③ 最終ジャッジ：2人とも全滅（両方の残機が0）なら、完全なるゲームオーバーへ！
        if (window.player1Data.lives <= 0 && window.player2Data.lives <= 0) {
            window.lives = 0;
        } else {
            // まだ誰かが生き残っていれば、プレイヤー番号をパチッと公式スイッチ！
            window.currentPlayerNumber = nextPlayerNumber;
            player.characterType = (window.currentPlayerNumber === 1) ? 'mario' : 'luigi';
            
            // 交代相手のセーブデータを世界のグローバル変数へロード大開通！！！
            window.lives = nextData.lives;
            window.score = nextData.score;
            window.coins = nextData.coins;
            player.isSuper = nextData.isSuper;
            player.isFire = nextData.isFire;
            player.height = nextData.height;
            window.stageName = nextData.stage;
            
            console.log(`🔄 【プレイヤー交代おぶ！】次は [${window.currentPlayerNumber}P: ${player.characterType}] のターンだお！！！ 残機: ${window.lives}`);
        }
    } else {
        if (window.lives !== undefined) {
            window.lives--;
        }
    }

    // 💀【運命のルート大分岐】残機が0機（全滅）になったら即ゲームオーバーへ突入おぶ！！！
    if (window.lives !== undefined && window.lives <= 0) {
        window.lives = 0; 

        if (typeof player !== 'undefined') {
            player.playerState = 0x08; 
            player.vx = 0; player.vy = 0;
            player.x = window.INITIAL_PLAYER_X;
            player.y = window.INITIAL_PLAYER_Y;
            player.invincibleTimer = 0;
            player.deathTimer = 0;
            player.deathFrameBuffer = 0;
            player.deathJumpTriggered = false;
            
            // 👑【修正パッチ】ここではcharacterTypeを上書きしない！
            // ゲームオーバー確定後の初期化処理（すぐ下）でマリオに戻します。
            
            if (typeof marioSprites !== 'undefined' && marioSprites.idle) {
                player.currentSprite = marioSprites.idle; 
            }
        }

        window.score = 0;
        window.coins = 0;
        window.gameTime = 400;
        window.isUnderground = false; 
        window.isTwoPlayerMode = false; // 2Pモードも解除
        
        if (typeof loadStageSprites === 'function') loadStageSprites(false); 
        if (typeof stopAllBGM === 'function') stopAllBGM();

        if (typeof startGameOverScreen === 'function') {
            startGameOverScreen(); 
        }
        return; 
    }


    if (typeof startMiddleScreen === 'function') {
        startMiddleScreen();
    }

    window.gameTime = 400;
    timeFrameCounter = 0; 
    
    window.isHurryUpTriggered = false;
    if (sounds['hurryup']) sounds['hurryup'].onended = null;

    player.playerState = 0x08; 
    player.vanished = false;
    player.goalReached = false;
    
    player.isPitDeath = false; 
    player.vx = 0;
    player.vy = 0;
    player.direction = 1;

    if (typeof refreshPlayerSpriteFolders === 'function') {
        refreshPlayerSpriteFolders();
    }

    resetOverworldMapToDefault(); 

    window.isUnderground = false; 
    if (typeof loadStageSprites === 'function') loadStageSprites(false);
    window.originalOverworldMapRef = null;

    // 👑【埋まりバグ完全粉砕パッチ！】
    // 出現する瞬間の「状態」をチェックして、マリオ自身の身長パラメータ（height）を32pxにガチッと強制同期させるおぶ！！！
    let spawnY = window.INITIAL_PLAYER_Y; // デフォルトはチビ用（192px / 身長16px）
    
    if (player.isSuper || player.isFire) {
        player.height = 32; // 🚯 置き去りになっていた身長をデカの32pxに完全修正！
        spawnY = 176;       // 接地位置をデカ用に16px引き上げるお！
    } else {
        player.height = 16; // チビならしっかり16pxに固定お！
    }

    if (window.ram_0x071A >= window.STAGE_MIDWAY_BORDER) {
        const restartPage = window.MIDWAY_START_PAGE; 
        player.x = restartPage * 256 + 16; 
        player.y = spawnY; // 割り出した高さをインジェクション！
        cameraX = restartPage * 256;
    } else {
        player.x = window.INITIAL_PLAYER_X;
        player.y = spawnY; // 割り出した高さをインジェクション！
        cameraX = 0;
    }

    if (typeof scrollRegister !== 'undefined') scrollRegister = cameraX % 256;
    if (typeof currentTable !== 'undefined') currentTable = Math.floor(cameraX / 256) % 2;
    
    if (typeof lastWrittenCol !== 'undefined') {
        const startVramCol = Math.floor(cameraX / TILE_SIZE);
        for (let r = 0; r < VRAM_HEIGHT; r++) {
            for (let c = 0; c < VRAM_WIDTH; c++) {
                const targetMapCol = startVramCol + c;
                if (typeof nesVRAM !== 'undefined') {
                    nesVRAM[r][c] = tileMap[r][targetMapCol] || 0; 
                }
            }
        }
        lastWrittenCol = startVramCol + VRAM_WIDTH - 1;
    }

    if (typeof lastSpawnedKuriboCol !== 'undefined') lastSpawnedKuriboCol = -1;
    if (typeof kuriboComboCount !== 'undefined') kuriboComboCount = 0;

    // 💥【大正解パッチ！】先回り列の基準を、復活時の「初期画面で見えている右端の列」にジャスト同期おぶ！！！
    // これにより、画面外（22列目など）にある本物の地形データ（50）を事前に勝手に消去・破壊してしまう競合バグを根絶！
    // 画面外の敵は、カメラが右に進んでスクロールした際に、安全に本来の自動スキャンから湧き出るようになるおぶ！！！ｗｗｗｗ
    const initialCols = Math.ceil(canvas.width / TILE_SIZE);
    lastCheckedSpawnCol = Math.floor(cameraX / TILE_SIZE) + initialCols - 1; 

    if (window.activeEnemies) window.activeEnemies.length = 0;

    if (typeof activeMushrooms !== 'undefined') activeMushrooms.length = 0;
    if (typeof activeStars !== 'undefined') activeStars.length = 0; // 👑 新型配列リセットお！
    if (typeof activeFlowers !== 'undefined') activeFlowers.length = 0; // 👑残骸大抹殺パッチお！
    if (typeof animatingBlocks !== 'undefined') animatingBlocks.length = 0;
    if (typeof animatingBricks !== 'undefined') animatingBricks.length = 0;
    if (typeof activeFireballs !== 'undefined') activeFireballs.length = 0;

    // ─── 👑 二重生成とフライング消滅の原因になっていた手動配置の競合ブロックは跡形もなく完全消滅・粉砕撤去したおぶ！！！ ───

    // 👑【バグ大粉砕パッチ！】2回目以降のプレイで旗が最初から下がりっぱなしになるのを鉄壁ガード！
    // 復活時に、動的ゴール旗のオブジェクトパラメータを公式に新品未初期化状態へ巻き戻すおぶ！！！ｗｗｗ
    if (typeof goalPoleFlag !== 'undefined') {
        goalPoleFlag.isInitialized = false;
        goalPoleFlag.isFinished = false;
        goalPoleFlag.y = 0;
        goalPoleFlag.startY = 0;
        goalPoleFlag.targetY = 0;
    }

    console.log(`🚀 新品の世界に合わせて周辺の敵と地形を100%復元させたおぶ！！！`);
    if (typeof stopAllBGM === 'function') stopAllBGM();
}
// =================================================================
// 🎮 main.js 【パート5】: メインループ ＆ レイヤー総合レンダリングエンジン
// =================================================================

let globalFrameCounter = 0;
let lastTime = performance.now();

function checkPlayerHardBlockLogTest() {
    if (typeof player === 'undefined' || 
        player.playerState === 0x03 || 
        player.playerState === 0x09 || 
        player.playerState === 0x0A || 
        player.goalReached === true || 
        (player.postFlipTimer !== undefined && player.postFlipTimer > 0)) {
        return;
    }

    const startCol = Math.floor((player.x - 1) / TILE_SIZE);
    const endCol   = Math.floor((player.x + player.width + 1) / TILE_SIZE);
    const startRow = Math.floor((player.y - 1) / TILE_SIZE);
    const endRow   = Math.floor((player.y + player.height + 1) / TILE_SIZE);

    for (let r = startRow; r <= endRow; r++) {
        if (!tileMap[r]) continue;
        for (let c = startCol; c <= endCol; c++) {
            const tileType = tileMap[r][c];
            
            if (tileType === 90 || tileType === 91 || tileType === 92) {
                const tileLeft   = c * TILE_SIZE;
                const tileRight  = tileLeft + TILE_SIZE;
                const tileTop    = r * TILE_SIZE;
                const tileBottom = tileTop + TILE_SIZE;

                const isTouching = 
                    player.x - 1 < tileRight &&
                    player.x + player.width + 1 > tileLeft &&
                    player.y - 1 < tileBottom &&
                    player.y + player.height + 1 > tileTop;

                if (isTouching) {
                    console.log(`🏁 【ゴールパーツ接触検知！】マリオ下降ルーチン開始おぶ！`);
                    if (typeof player.triggerFreezeRoutine === 'function') {
                        player.triggerFreezeRoutine();
                    }
                    return; 
                }
            }
        }
    }
}

function gameLoop() {
    const now = performance.now();
    let dt = now - lastTime;
    lastTime = now;
    if (dt > 100) dt = 16.67; 
    const dtModifier = dt / (1000 / 60); 

    globalFrameCounter = (globalFrameCounter + dtModifier) % 48;

    // ✨【新設パッチ】毎フレームPキーのポーズ入力を最優先で監視するお！！！
    if (typeof updatePauseInput === 'function') {
        updatePauseInput(keys, dtModifier);
    }

    // ⏸️【大コア制限】ポーズフラグがONなら、下の移動・物理をスキップして世界をフリーズ！
    // 💡 ただし画面の再描画（draw）だけは通して「PAUSE」を出し続けるのが実機仕様おぶ！
    if (window.isPaused) {
        draw();
        requestAnimationFrame(gameLoop);
        return; 
    }

    if (window.isTitleScreen) {
        if (typeof updateTitleInput === 'function') { updateTitleInput(); }
        if (typeof keys !== 'undefined') {
            Object.keys(keys).forEach(k => {
                if (k !== 'Enter') keys[k] = false; 
            });
        }
        draw();
        requestAnimationFrame(gameLoop);
        return;
    }

    if (window.isMiddleScreen) {
        if (typeof updateMiddleScreen === 'function') { updateMiddleScreen(dtModifier); }
        draw(); 
        requestAnimationFrame(gameLoop);
        return;
    }

    if (window.isGameOverScreen) {
        if (typeof updateGameOverScreen === 'function') { updateGameOverScreen(dtModifier); }
        draw();
        requestAnimationFrame(gameLoop);
        return;
    }

    if (typeof checkPlayerPipeEntry === 'function') { checkPlayerPipeEntry(); }

    checkPlayerHardBlockLogTest();

    if (typeof player !== 'undefined') { player.update(dtModifier); }
    
    // ─── 💀【神開通！ 奈落の底（穴落ち）実機ステート0x03完全バインドパッチおぶ！！！】 ───
    if (typeof player !== 'undefined' && player.y > 255) {
        // すでに死亡ステート（0x03）に突入している場合は、多重発動を防ぐために鉄壁ガードお！
        if (player.playerState !== 0x03) {
            console.log("⏰ ⏰ ⏰ 【奈落の穴へ落下！】マリオが画面外に消滅！実機死亡放物線タスク（6秒）を大起動おぶ！！！ｗｗｗ");

            // ① プレイヤーの状態を本物の「0x03（死亡アニメモード）」へ強制ロックオン！！！
            player.playerState = 0x03;
            player.vx = 0;
            player.vy = 0; // 慣性を完全抹殺してX軸をガチガチに固定！
            
            // 👑【新設！】これは穴落ちでの死亡だから、お空へ跳ね上がらせないための専用スイッチをONお！！！
            player.isPitDeath = true; 

            // 💡 スーパーマリオ（デカ）状態であっても、死亡ポーズが引き伸ばされて崩れないよう身長をチビの16pxに強制リセットお！
            player.height = 16;
            
            // 💡 画像を奈落専用の死亡ポーズ（mario_death.png）に強制固定！
            if (typeof marioSprites !== 'undefined' && marioSprites.death) {
                player.currentSprite = marioSprites.death;
            }

            // ② player.js側の360フレーム（6秒）タイムライン計算に必要な内部カウンタを精密にリセット！
            player.invincibleTimer = 0;
            player.deathTimer = 0;
            player.deathFrameBuffer = 0;
            player.deathJumpTriggered = false; // まだお空へ跳ね上がっていないフラグ
            player.isDamaged = false;
            player.isTransforming = false;

            // ③ 🎵 いま裏で大爆音で鳴っているステージBGMをピタッと消音・リセット停止！
            if (typeof stopAllBGM === 'function') stopAllBGM();
            
            // ④ 🔊 死亡SE「death.wav」を頭出しから最高テンポで爆音再生お！！！ｗｗｗｗｗ
            if (typeof playSE === 'function') {
                playSE('death');
            }
        }
    }

    if (typeof player !== 'undefined' && player.playerState === 0x03) {
        draw();
        requestAnimationFrame(gameLoop);
        return; 
    }

    if (typeof updatePipeAnimation === 'function') { updatePipeAnimation(dtModifier); }
    if (typeof goalPoleFlag !== 'undefined') { goalPoleFlag.update(dtModifier); }
    if (typeof updateRisingBlocks === 'function') { updateRisingBlocks(dtModifier); }
    if (typeof updateRisingBricks === 'function') { updateRisingBricks(dtModifier); }
    
    updateEnemies(dtModifier);

    if (typeof updateScoreTimer === 'function') { updateScoreTimer(dtModifier); }
    if (typeof updateMushrooms === 'function') { updateMushrooms(dtModifier); }
    if (typeof updateStars === 'function') { updateStars(dtModifier); }
    if (typeof updateFlowers === 'function') { updateFlowers(dtModifier); }
    if (typeof updateFireballs === 'function') { updateFireballs(dtModifier); }
    if (typeof updateScoreEffects === 'function') updateScoreEffects(dtModifier);

    if (player && player.playerState !== 0x03 && player.playerState !== 0x05) {
        if (player.playerState === 0x0B) {
            checkScrollEnemySpawning(); 
        } else {
            checkScrollEnemySpawning(); 
            checkPlayerEnemyCollisions(); 
            if (typeof checkPlayerCoinCollisions === 'function') {
                checkPlayerCoinCollisions();
            }
        }
    }

    draw();
    requestAnimationFrame(gameLoop);
}

function draw() {
    // ─── ① 背景色の塗りつぶし ───
    if (window.isMiddleScreen || window.isGameOverScreen) {
        ctx.fillStyle = '#000000';
    } else if (window.isUnderground) {
        ctx.fillStyle = typeof BONUS_BACKGROUND_COLOR !== 'undefined' ? BONUS_BACKGROUND_COLOR : '#000000';
    } else {
        ctx.fillStyle = '#9494ff'; 
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 💥【超絶核心デバッグ割り込み！】黒画面の時は余計なコイン等を描画させずにここで即リターン！
    if (window.isMiddleScreen || window.isGameOverScreen) {
        
        // 👑【バグ完全大粉砕パッチ！】黒画面だろうが何だろうが、まずはスコアボードを最優先で絶対に描画するお！！！
        if (typeof drawScoreBoard === 'function') { 
            drawScoreBoard(); 
        }

        // ① 残機表示画面（WORLD 1-1 など）の固有レイアウト
        if (window.isMiddleScreen) {
            if (typeof drawScoreText === 'function') {
                drawScoreText("WORLD", 88, 80);
                drawScoreText("1-1", 136, 80);
            }
            if (typeof drawMiddleScreen === 'function') { drawMiddleScreen(); }
        }
        
        // ② ゲームオーバー画面（GAME OVER）の固有レイアウト
        if (window.isGameOverScreen) {
            if (typeof drawScoreText === 'function') {
                drawScoreText("GAME OVER", 88, 128); // 仕様書通りの絶対座標(88, 128)だお！
            }
        }
        return; 
    }




    // ─── ② 背景装飾（雲・山・草）のループ描画 ───
    if (typeof backgroundMap !== 'undefined' && !window.isUnderground) {
        const startCol = Math.floor(cameraX / BG_TILE_SIZE);
        const endCol = startCol + Math.ceil(canvas.width / BG_TILE_SIZE) + 1;

        for (let row = 0; row < BG_MAP_HEIGHT; row++) {
            if (!backgroundMap[row]) continue;
            for (let col = startCol; col < endCol; col++) {
                const loopCol = col % BG_MAP_WIDTH;
                let bgType = backgroundMap[row][loopCol]; 
                
                if (row === 11 && (bgType === 31 || bgType === 32 || bgType === 33)) { 
                    bgType = bgType + 280; 
                }
                
                if (bgType !== 0 && bgSprites[bgType]) {
                    const screenX = (col * BG_TILE_SIZE) - cameraX;
                    ctx.drawImage(bgSprites[bgType], screenX, row * BG_TILE_SIZE, BG_TILE_SIZE, BG_TILE_SIZE);
                }
            }
        }
    }

    if (typeof drawMushrooms === 'function') { drawMushrooms(); }
    if (typeof drawStars === 'function') { drawStars(); } 
    if (typeof drawFlowers === 'function') { drawFlowers(); } // 👑これお！！！
    if (typeof drawRisingBlocks === 'function') { drawRisingBlocks(); }
    if (typeof drawRisingBricks === 'function') { drawRisingBricks(); }
    if (typeof drawScoreEffects === 'function') drawScoreEffects();

    
    const pendingFlagsToDraw = [];

    // 地形タイルマップ描画ループ
    for (let row = 0; row < MAP_HEIGHT; row++) {
        for (let col = 0; col < MAP_WIDTH; col++) {
            if (!tileMap[row] || tileMap[row][col] === undefined) continue;
            const tileType = tileMap[row][col];
            
            if (tileType === 90 || tileType === 91) {
                const screenX = (col * TILE_SIZE) - cameraX;
                if (screenX >= -TILE_SIZE && screenX <= canvas.width) {
                    if (typeof drawGoalPoleTile === 'function') {
                        drawGoalPoleTile(tileType, screenX, row * TILE_SIZE);
                    }
                }
            } 
            else if (tileType === 92) {
                const screenX = (col * TILE_SIZE) - cameraX;
                if (screenX >= -TILE_SIZE && screenX <= canvas.width) {
                    pendingFlagsToDraw.push({ tileType, screenX, screenY: row * TILE_SIZE });
                }
            }
            else if (tileType === 222 || (tileType >= 81 && tileType <= 86)) {
                let targetSprite = tileSprites[tileType];
                if (targetSprite) {
                    const screenX = (col * TILE_SIZE) - cameraX;
                    if (screenX >= -TILE_SIZE && screenX <= canvas.width) {
                        ctx.drawImage(targetSprite, screenX, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    }
                }
            }
        }
    }

    if (typeof goalPoleFlag !== 'undefined' && goalPoleFlag.isInitialized) {
        goalPoleFlag.draw(); 
    } else if (pendingFlagsToDraw.length > 0) {
        pendingFlagsToDraw.forEach(flag => {
            if (typeof drawGoalPoleTile === 'function') {
                drawGoalPoleTile(92, flag.screenX, flag.screenY); 
            }
        });
    }

    // ✂️（ここに置かれていた古い drawFireballs(); の3行は綺麗に全カットして消去お！）

    if (typeof player !== 'undefined' && player.playerState !== 0x03) {
        if (typeof player.draw === 'function') { player.draw(); }
    }

    // 🧱 はてなブロック、通常コインなどの地形チップを背景より手前に全描写！
    for (let row = 0; row < MAP_HEIGHT; row++) {
        for (let col = 0; col < MAP_WIDTH; col++) {
            if (!tileMap[row] || tileMap[row][col] === undefined) continue;
            const tileType = tileMap[row][col];
            
            if (tileType !== 0 && tileType !== 90 && tileType !== 91 && tileType !== 92 && 
                tileType !== 222 && !(tileType >= 81 && tileType <= 86)) {
                
                let targetSprite = tileSprites[tileType];

                if (tileType === 3 || tileType === 10) {
                    const step = Math.floor(globalFrameCounter / 8) % 6;
                    const animationPattern = new Array(tileType, tileType, tileType, 32, 33, 32);
                    targetSprite = tileSprites[animationPattern[step]];
                }

                if (tileType === 30 && window.isUnderground) {
                    const step = Math.floor(globalFrameCounter / 8) % 6;
                    const coinAnimationPattern = new Array(30, 30, 30, 301, 302, 301);
                    targetSprite = tileSprites[coinAnimationPattern[step]];
                }

                if (targetSprite) {
                    const screenX = (col * TILE_SIZE) - cameraX;
                    if (screenX >= -TILE_SIZE && screenX <= canvas.width) {
                        ctx.drawImage(targetSprite, screenX, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    }
                }
            }
        }
    }

    // =================================================================
    // 👑 👑【最前面スーパーリアルタイムレイヤー段お！！！】ｗｗｗｗｗ
    // =================================================================
    
    // ① 敵キャラクター（クリボー・ノコノコ）の描画！
    drawEnemies();

    // ② 🔥【大核心開通！】ファイアボールを、はてなブロックやコインの完全『真上（手前）』に描画！！！
    // これにより、叩き前・叩き後のすべてのブロック、および壁との重なりで100%隠れずに手前で火の粉が炸裂するおぶ！！！
    if (typeof drawFireballs === 'function') { 
        drawFireballs(); 
    }

    // ③ 💀 死亡時のマリオ本人の描画
    if (typeof player !== 'undefined' && player.playerState === 0x03) {
        if (typeof player.draw === 'function') { 
            player.draw(); 
        }
    }

    // ④ タイトル画面のテキスト描画
    if (window.isTitleScreen) {
        if (typeof drawTitleScreen === 'function') { 
            drawTitleScreen(); 
        }
    }

    // ⑤ 空中フワフワ数字スコアの描画
    if (typeof drawScoreEffects === 'function') { 
        drawScoreEffects(); 
    }

    // ⑥ 最前面 HUD スコアボードの描画
    if (typeof drawScoreBoard === 'function') { 
        drawScoreBoard(); 
    }
}

const oldDebugger = document.getElementById('pixel-debugger');
if (oldDebugger) { 
    oldDebugger.remove(); 
}

// =================================================================
// 💥 ブロック頭突き衝撃波連携システム
// =================================================================
function triggerBlockHitShockwave(blockCol, blockRow) {
    // ─── ① エネミーへの衝撃波伝播 ───
    if (activeEnemies && activeEnemies.length > 0) {
        activeEnemies.forEach(enemy => {
            if (enemy.enemyState === 0x02 || enemy.enemyState === 0x04) return;

            const enemyCol = Math.floor((enemy.x + enemy.width / 2) / TILE_SIZE);
            const enemyRow = Math.floor((enemy.y + enemy.height - 1) / TILE_SIZE);

            if (enemyRow === blockRow - 1 && Math.abs(enemyCol - blockCol) <= 1) {
                enemy.enemyState = 0x04;
                enemy.vy = -3.5;
                enemy.vx = (enemy.x + enemy.width / 2 > blockCol * TILE_SIZE + 8) ? 0.8 : -0.8;
                
                if (typeof playSE === 'function') { 
                    playSE('kickkill'); 
                }
                
                // ✨【新設大連携】下から床ドンでエネミーをなぎ倒した時、その敵の位置に「100」をポップアップお！！！
                if (typeof addScore === 'function') { addScore(100); }
                if (typeof spawnScoreEffect === 'function') {
                    spawnScoreEffect(enemy.x, enemy.y, 100);
                }
            }
        });
    }

    // ─── ② 🍄 キノコへの衝撃波伝播 ───
    if (activeMushrooms && activeMushrooms.length > 0) {
        activeMushrooms.forEach(shroom => {
            const shroomCol = Math.floor((shroom.x + shroom.width / 2) / TILE_SIZE);
            const shroomRow = Math.floor((shroom.y + shroom.height - 1) / TILE_SIZE);

            if (shroomRow === blockRow - 1 && Math.abs(shroomCol - blockCol) <= 1) {
                if (shroom.state === 'moving') {
                    shroom.vy = -4.0;
                    shroom.isGrounded = false;
                    console.log("🦘 移動中のキノコが跳ね上がったお！");
                } else if (shroom.state === 'rising') {
                    shroom.pendingBounce = true;
                }
            }
        });
    }
}

