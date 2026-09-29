// =================================================================
// 🐢 nokonoko.js : クリボー等速化（1フレーム0.5px）＆ 16*16 px 決定版だお！
// =================================================================

const nokonokoSprites = {
    walk1: new Image(),
    walk2: new Image(),
    shell: new Image(),
    shellFeet: new Image()
};

// 🖼️ グラフィックアセットの読み込み
nokonokoSprites.walk1.src     = 'sprite/enemies/nokonoko1.png';
nokonokoSprites.walk2.src     = 'sprite/enemies/nokonoko2.png';
nokonokoSprites.shell.src     = 'sprite/enemies/shell.png';
nokonokoSprites.shellFeet.src = 'sprite/enemies/shell_feet.png';

/**
 * 🐢 ノコノコをマップから実体化させるポップ関数
 */
function spawnNokonoko(mapX, mapY, color = 'green') {
    if (typeof activeEnemies === 'undefined') window.activeEnemies = [];

    activeEnemies.push({
        type: 'nokonoko',
        subType: color,
        x: mapX,
        y: mapY - 8,    // 縦幅24pxの初期めり込み防止
        width: 16,
        height: 24,     
        
        // 💡【クリボー等速化！】1フレームあたり 0.5 ピクセル（左移動が基本）にスピードアップお！！！ｗｗｗ
        vx: -0.5, 
        vy: 0,
        direction: -1,  
        
        enemyState: 0x00, 
        reviveTimer: 0,
        animTimer: 0
    });
}

/**
 * 🔄 ノコノコの物理・AI・状態変化ロジック
 */
function updateNokonokoLogic(enemy, dtModifier) {
    // 🔽 0x04: ブロック衝撃波 or デバッグ体当たりによる放物線死亡
    if (enemy.enemyState === 0x04) {
        enemy.height = 16; 
        
        enemy.vy += 0.25 * dtModifier;
        enemy.x += enemy.vx * dtModifier;
        enemy.y += enemy.vy * dtModifier;
        return;
    }

    // 🔽 0x00: 通常歩行状態
    if (enemy.enemyState === 0x00) {
        enemy.height = 24; 
        enemy.x += enemy.vx * dtModifier;
        enemy.animTimer += dtModifier;

        const wallCheckY = enemy.y + enemy.height - 4;
        if (enemy.vx > 0 && player.isSolid(enemy.x + enemy.width, wallCheckY)) {
            enemy.vx = -0.5; // 💡 クリボーと同じ速度（0.5px）で左反転お！
            enemy.direction = -1;
            enemy.x = Math.floor((enemy.x + enemy.width) / TILE_SIZE) * TILE_SIZE - enemy.width;
        } else if (enemy.vx < 0 && player.isSolid(enemy.x, wallCheckY)) {
            enemy.vx = 0.5;  // 💡 クリボーと同じ速度（0.5px）で右反転お！
            enemy.direction = 1;
            enemy.x = (Math.floor(enemy.x / TILE_SIZE) + 1) * TILE_SIZE;
        }

        // 赤ノコノコの崖っぷちAI（床判定が0になる瞬間に符号を反転！）
        if (enemy.subType === 'red') {
            const nextCheckX = enemy.vx > 0 ? (enemy.x + enemy.width) : enemy.x;
            const dropCheckY = enemy.y + enemy.height + 1;
            if (!player.isSolid(nextCheckX, dropCheckY)) {
                enemy.vx = -enemy.vx; 
                enemy.direction = enemy.vx > 0 ? 1 : -1;
                enemy.x += enemy.direction * 1.0; 
            }
        }

    // 🔽 0x02: 止まっている甲羅状態
    } else if (enemy.enemyState === 0x02) {
        enemy.height = 16;
        enemy.vx = 0;
        enemy.reviveTimer -= dtModifier;

        // タイマー0で完全復活！
        if (enemy.reviveTimer <= 0) {
            enemy.enemyState = 0x00; 
            enemy.height = 24;        
            enemy.y -= 8; // 地面からのめり込み防止引き上げ
            
            if (typeof player !== 'undefined') {
                enemy.direction = (enemy.x + enemy.width / 2 > player.x + player.width / 2) ? 1 : -1;
                // 💡 復活した時もクリボーと同じ快速速度（0.5px）で発進お！
                enemy.vx = enemy.direction * 0.5; 
            }
        }

    // 🔽 0x03: 蹴っ飛ばされた高速滑走甲羅状態
    } else if (enemy.enemyState === 0x03) {
        enemy.height = 16;
        enemy.x += enemy.vx * dtModifier;

        const wallCheckY = enemy.y + enemy.height - 4;
        if (enemy.vx > 0 && player.isSolid(enemy.x + enemy.width, wallCheckY)) {
            enemy.vx = -3.0;
            enemy.direction = -1;
            enemy.x = Math.floor((enemy.x + enemy.width) / TILE_SIZE) * TILE_SIZE - enemy.width;
            if (typeof playSE === 'function') playSE('bump'); 
        } else if (enemy.vx < 0 && player.isSolid(enemy.x, wallCheckY)) {
            enemy.vx = 3.0;
            enemy.direction = 1;
            enemy.x = (Math.floor(enemy.x / TILE_SIZE) + 1) * TILE_SIZE;
            if (typeof playSE === 'function') playSE('bump'); 
        }
    }

    // 📈 重力・接地処理
    enemy.y += enemy.vy * dtModifier;
    const footCheckY = enemy.y + enemy.height;
    const leftFootX = enemy.x + 2;
    const rightFootX = enemy.x + enemy.width - 2;

    if (player.isSolid(leftFootX, footCheckY) || player.isSolid(rightFootX, footCheckY)) {
        enemy.y = Math.floor(footCheckY / TILE_SIZE) * TILE_SIZE - enemy.height;
        enemy.vy = 0;
    } else {
        enemy.vy += 0.28125 * dtModifier;
        if (enemy.vy > 4.5) enemy.vy = 4.5;
    }
}

/**
 * 🎬 ノコノコを描画する関数
 */
function drawNokonoko(enemy, screenX, screenY) {
    ctx.save();

    // 💀 ひっくり返り死亡状態（0x04）の上下逆さま描画お！
    if (enemy.enemyState === 0x04) {
        ctx.translate(screenX + enemy.width / 2, screenY + enemy.height / 2);
        ctx.scale(1, -1); 
        if (nokonokoSprites.shell.complete) {
            ctx.drawImage(nokonokoSprites.shell, -enemy.width / 2, -enemy.height / 2, 16, 16);
        }
        ctx.restore();
        return; 
    }

    if (enemy.direction === 1) {
        ctx.translate(screenX + enemy.width / 2, screenY);
        ctx.scale(-1, 1);
        screenX = -enemy.width / 2;
        screenY = 0;
    }

    // ① 通常歩行状態（12Fパタパタアニメ）
    if (enemy.enemyState === 0x00) {
        const isFrame2 = Math.floor(enemy.animTimer / 12) % 2 === 0;
        const img = isFrame2 ? nokonokoSprites.walk2 : nokonokoSprites.walk1;
        if (img.complete) ctx.drawImage(img, screenX, screenY, enemy.width, enemy.height);

    // ② 甲羅静止状態（埋まりバグなし！）
    } else if (enemy.enemyState === 0x02) {
        const isWiggling = enemy.reviveTimer <= 64; 
        const img = isWiggling ? nokonokoSprites.shellFeet : nokonokoSprites.shell;
        if (img.complete) ctx.drawImage(img, screenX, screenY, 16, 16);

    // ③ 爆速滑走状態
    } else if (enemy.enemyState === 0x03) {
        if (nokonokoSprites.shell.complete) {
            ctx.drawImage(nokonokoSprites.shell, screenX, screenY, 16, 16);
        }
    }

    ctx.restore();
}
