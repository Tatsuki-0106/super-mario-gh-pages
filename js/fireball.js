// =================================================================
// 🔥 fireball.js : 100%NES実機数値準拠・ファイアボール弾幕システム
// =================================================================

// 👑 画面内に同時に存在できるファイアボール（最大2発）の管理配列お！ [22]
const activeFireballs = [];

// 🖼️ グラフィックアセットの一括ロード
const fireballSprite = new Image();
fireballSprite.src = 'sprite/items/fireball.png';

const explosionSprites = [
    new Image(),
    new Image(),
    new Image()
];
// 👑【大核心修正！】配列の0、1、2番スロットに、今エクスプローラで見せてくれた本物のアセットパスをジャスト代入おぶ！！！
explosionSprites[0].src = 'sprite/items/explosion1.png';
explosionSprites[1].src = 'sprite/items/explosion2.png';
explosionSprites[2].src = 'sprite/items/explosion3.png';

/**
 * 🔥 ファイアボールをマリオの手元から実体化・発射する関数だお！！！
 */
function shootFireball() {
    if (typeof player === 'undefined' || !player.isFire || player.isFlowerTransforming) return;
    
    // 🚯 鉄壁の実機制限：画面内に同時に出せるのは「最大2発まで」おぶ！！！ [22]
    if (activeFireballs.length >= 2) return;

    // 📐 【仕様1】生成座標の精密逆算タスク [22]
    // X座標: マリオの中心から、向いている方向（direction）へ 12ピクセル 進んだ位置 [22]
    const marioCenterX = player.x + player.width / 2;
    const spawnX = marioCenterX + (player.direction * 12) - 4; // 8pxサイズの中央補正

    // Y座標: マリオの頭頂部（上端）から下に 12ピクセル 下がった手元の高さ [22]
    let spawnY = player.y + 12;
    // もししゃがみ状態（身長24px）なら、地面から上に 12ピクセルの位置 [22]
    if (player.height === 24) {
        spawnY = (player.y + 24) - 12;
    }

    // 🚀 ファイアボールの初期パラメータをインジェクション！
    activeFireballs.push({
        x: spawnX,
        y: spawnY,
        width: 8,
        height: 8,
        // 水平（横）速度: 常に一定で1フレームあたり5ピクセル（向きを乗算） [22]
        vx: player.direction * 5.0, 
        // 垂直（縦）速度: 最初は斜め下へ向けて 1ピクセル/フレーム [22]
        vy: 1.0, 
        state: 'moving', // 'moving'(バウンド中) -> 'exploding'(爆発中)
        expTimer: 0,     // 爆速爆発アニメタイマー [22]
        frameBuffer: 0
    });

    // 🎬 マリオ側に「投球モーション（12フレーム）」のロックタイマーをチャージ！
    player.throwMotionTimer = 12;

    // 🔊 ファイアボール投擲SE（本家コイン音と同じ coin.wav、またはお好みのSE）を一発キックお！
    if (typeof playSE === 'function') {
        playSE('fireball'); 
    }
    console.log(`🔥 ファイアボール発射！ (現在画面内: ${activeFireballs.length}発)`);
}

/**
 * 🔄 全てのファイアボールのバウンド物理 ＆ 地形・敵衝突 ＆ 爆発を更新！
 */
function updateFireballs(dtModifier = 1.0) {
    for (let i = activeFireballs.length - 1; i >= 0; i--) {
        const ball = activeFireballs[i];

        // 🔽 1. 爆発アニメーションフェーズ（15〜20フレームで3段階変化） [22]
        if (ball.state === 'exploding') {
            ball.frameBuffer += dtModifier;
            while (ball.frameBuffer >= 1) {
                ball.frameBuffer -= 1;
                ball.expTimer++;
                
                // 💡 約18フレーム（1段階あたり6F）経ったら、火の粉が消滅してメモリから完全大粉砕！ [22]
                if (ball.expTimer >= 18) {
                    activeFireballs.splice(i, 1);
                    break;
                }
            }
            continue; // 爆過中は物理演算を全スキップお！ [22]
        }

        // 🏃‍♂️ 2. 弾丸バウンド自由放物線フェーズ
        ball.frameBuffer += dtModifier;
        while (ball.frameBuffer >= 1) {
            ball.frameBuffer -= 1;

            // 🛠️ 【横方向移動 ＆ 壁衝突ドットチェック】 [22]
            ball.x += ball.vx; // 1Fあたり5px等速 [22]

            // 進行方向の先端1ドットが固体ブロックに接触したかをチェック [22]
            const wallCheckX = ball.vx > 0 ? (ball.x + ball.width) : ball.x;
            const wallCheckY = ball.y + ball.height / 2;

            if (typeof player !== 'undefined' && player.isSolid(wallCheckX, wallCheckY)) {
                // 💥 壁に激突したらバウンドせず、その場で即座に爆発状態へトグル！！！ [22]
                ball.state = 'exploding';
                ball.expTimer = 0;
                if (typeof playSE === 'function') playSE('bump'); // ゴンッと消滅音お！
                break;
            }

            // 🛠️ 【縦方向移動 ＆ 地面バウンドドットチェック】 [22]
            ball.y += ball.vy;

            // 1フレームごとに下方向へ 0.25ピクセル（重力加速度）加速 [22]
            ball.vy += 0.25;
            if (ball.vy > 4.5) ball.vy = 4.5; // 最大落下速度制限お！

            // ファイアボールの下端1ドットが固体ブロックにめり込んだかをチェック [22]
            const footCheckY = ball.y + ball.height;
            const centerX = ball.x + ball.width / 2;

            if (typeof player !== 'undefined' && player.isSolid(centerX, footCheckY)) {
                // 👑【バウンド物理反転ロジック！】上方向へ初速 -4ピクセルで弾き返すおぶ！！！ [22]
                ball.vy = -4.0;
                
                // ブロックの上辺（境界線）に座標をピタッと強制吸着させて埋まりを抹殺！ [22]
                ball.y = Math.floor(footCheckY / 16) * 16 - ball.height;
            }
        }

        if (ball.state === 'exploding') continue; // 途中で壁爆発した場合は以下の敵判定をスキップお

        // ─── 🎯 3. 敵キャラクターに対する攻撃判定（8×8pxのスクエアボックス仕様！） ─── [22]
        if (typeof activeEnemies !== 'undefined') {
            for (let j = 0; j < activeEnemies.length; j++) {
                const enemy = activeEnemies[j];

                // すでに死んでいる敵は全ガード全スルー
                if (enemy.enemyState === 0x04 || (enemy.type === 'kuribo' && enemy.enemyState === 0x02)) continue;

                // 敵とファイアボールの重なりチェック [22]
                const enemyHeight = (enemy.type === 'nokonoko' && (enemy.enemyState === 0x02 || enemy.enemyState === 0x03)) ? 16 : enemy.height;
                const enemyY = (enemy.type === 'nokonoko' && (enemy.enemyState === 0x02 || enemy.enemyState === 0x03)) ? (enemy.y + 8) : enemy.y;

                const isHit = 
                    ball.x < enemy.x + enemy.width &&
                    ball.x + ball.width > enemy.x &&
                    ball.y < enemyY + enemyHeight &&
                    ball.y + ball.height > enemyY;

                if (isHit) {
                    console.log(`🔥 ➔ 💀 ファイアヒット！ [${enemy.type}] を地獄の業火でなぎ倒したおぶ！！！ｗｗｗ`);

                    // ① 敵を「0x04：上下逆さま放物線死亡ステート」へ強制書き換え！
                    enemy.enemyState = 0x04;
                    enemy.height = 16; 
                    enemy.vy = -3.5; // 上空へゴンッと跳ね上がる初速
                    // ファイアボールが飛んできた横方向の慣性をそのまま乗せて吹っ飛ばす！
                    enemy.vx = ball.vx > 0 ? 1.0 : -1.0; 

                    // ② 🔊 SE再生：なぎ倒し音「kickkill.wav」を爆音再生お！！！
                    if (typeof playSE === 'function') {
                        playSE('kickkill');
                    }

                    // ③ 📊 スコア加算（ファイア撃破は本家仕様通り、一律で「200点」固定お！） ＆ 数字ポップアップ！
                    if (typeof addScore === 'function') { addScore(200); }
                    if (typeof spawnScoreEffect === 'function') {
                        spawnScoreEffect(enemy.x, enemy.y, 200);
                    }

                    // ④ 💥 ファイアボール自体は消滅し、即座にその位置で爆発エフェクトへ移行！ [22]
                    ball.state = 'exploding';
                    ball.expTimer = 0;
                    break; 
                }
            }
        }

        // 画面外（カメラの左右、または奈落の底）に落ちたら消去
        if (ball.x < cameraX - 16 || ball.x > cameraX + 272 || ball.y > 245) {
            activeFireballs.splice(i, 1);
        }
    }
}

/**
 * 🎬 ファイアボールの自転スプライト ＆ 3段階爆発アニメのレンダリング関数
 */
function drawFireballs() {
    for (let i = 0; i < activeFireballs.length; i++) {
        const ball = activeFireballs[i];
        const screenX = Math.floor(ball.x) - Math.floor(cameraX);
        const screenY = Math.floor(ball.y);

        if (screenX < -16 || screenX > canvas.width) continue;

        if (ball.state === 'exploding') {
            // 💥 爆発中：6フレームごとに段階的に explosion1 ➔ 2 ➔ 3 に切り替え！ [22]
            const step = Math.floor(ball.expTimer / 6);
            const sprite = explosionSprites[step];
            if (sprite && sprite.complete) {
                // 爆発は少し大きいので中央にズラして16x16pxサイズで描画お！
                ctx.drawImage(sprite, screenX - 4, screenY - 4, 16, 16);
            }
        } else {
            // 🌀 飛行中：4フレームごとに高速で上下左右に反転させて自転を完全再現お！！！
            ctx.save();
            ctx.translate(screenX + 4, screenY + 4);
            
            const rotStep = Math.floor(globalFrameCounter / 4) % 4;
            if (rotStep === 1) ctx.scale(-1, 1);
            if (rotStep === 2) ctx.scale(1, -1);
            if (rotStep === 3) ctx.scale(-1, -1);

            if (fireballSprite.complete) {
                ctx.drawImage(fireballSprite, -4, -4, 8, 8);
            }
            ctx.restore();
        }
    }
}
