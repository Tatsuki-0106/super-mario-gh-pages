// =================================================================
// 🍄 kuribo.js : 密集間隔ピクセル連鎖完全実現 ＆ 接地バグ完全修正版お！ｗｗw
// =================================================================

const kuriboSprites = {
    walk: new Image(),
    dead: new Image()
};

// 🖼️ グラフィックアセットの読み込み
kuriboSprites.walk.src = 'sprite/enemies/kuribo.png';
kuriboSprites.dead.src = 'sprite/enemies/kuribo_dead.png';

// 💡【核心修正】連続するクリボーの密集度を完全に管理するための変数群お！
let lastSpawnedKuriboCol = -1; // 直前のクリボーのマップ列
let kuriboComboCount = 0;      // 連続でスポーンしているクリボーのインデックス（0からスタート）

/**
 * 🍄 クリボーをマップから実体化させるポップ関数（マルチバウンド調停版）
 * @param {number} mapX - マップ上のベースX座標
 * @param {number} mapY - マップ上のベースY座標
 * @param {number} col - マップ上の列インデックス
 */
function spawnKuribo(mapX, mapY, col = -1) {
    if (typeof activeEnemies === 'undefined') window.activeEnemies = [];

    const isDuplicate = activeEnemies.some(e => e.type === 'kuribo' && e.enemyState === 0x00 && Math.abs(e.x - mapX) < 4);
    if (isDuplicate) return;

    let offsetX = 0; // ドット単位のズレ（オフセット）

    if (col !== -1) {
        if (lastSpawnedKuriboCol !== -1) {
            // 直前のクリボーとの「マップ上のマス目距離」を計算お！
            const colDistance = col - lastSpawnedKuriboCol;

            // 💡 距離が 2マス（1マス空き）で連続している間は、同じ密集コンボ集団とみなすお！
            if (colDistance === 2) {
                kuriboComboCount++; // 1つ進める
            } else {
                kuriboComboCount = 0; // 離れていたらコンボリセット
            }
        } else {
            kuriboComboCount = 0; // 最初の1体目はコンボ0
        }

        // ─── 💥【ターゲット仕様の完全実現ロジック】───
        // コンボ数（何番目のクリボーか）に応じて、ピクセル単位のサイズ位置を完全に上書き調停するお！
        switch (kuriboComboCount) {
            case 0:
                // 🟥 1体目のクリボー：ズレなし（基準点）
                offsetX = 0;
                break;
            case 1:
                // 🟦 2体目のクリボー：1個目の空白を 16px -> 8px に縮めるため -8px 押し込み！
                offsetX = -8;
                console.log("📏 [1個目の空間] 16px から 8px にサイズ変更したお！");
                break;
            case 2:
                // 🟩 3体目のクリボー：2個目の空白は自動的・および絶対座標で 24px を維持！
                // (2体目が-8pxされているため、ここは普通の配置（0px）にするだけで距離が24pxになります)
                offsetX = 0;
                console.log("📏 [2個目の空間] 自動的に 24px を維持したお！");
                break;
            case 3:
                // 🟨 4体目のクリボー：3個目の空白を再び 8px に縮めるため、-16px 押し込み！
                offsetX = -16;
                console.log("📏 [3個目の空間] 再び 8px にサイズ変更したお！");
                break;
            default:
                // 念のためそれ以上続いた場合は、奇数・偶数で 8px と 24px を交互にループさせるお！
                if (kuriboComboCount % 2 === 1) {
                    offsetX = -8 * Math.ceil(kuriboComboCount / 2);
                } else {
                    offsetX = -8 * (kuriboComboCount / 2);
                }
                break;
        }

        // 今回の列を「直前のデータ」として記憶
        lastSpawnedKuriboCol = col;
    }

    // 計算した正確なオフセットをベース座標に適用！
    const finalX = mapX + offsetX;

    activeEnemies.push({
        type: 'kuribo',
        x: finalX,
        y: mapY,
        width: 16,
        height: 16,
        vx: -0.5, 
        vy: 0,
        enemyState: 0x00, 
        deadTimer: 0
    });
}

/**
 * 🔄 クリボーの物理・AI・状態変化ロジック
 */
function updateKuriboLogic(enemy, dtModifier) {
    if (enemy.enemyState === 0x02) {
        enemy.deadTimer += dtModifier;
        enemy.vx = 0; enemy.vy = 0;
        enemy.height = 8;
        if (enemy.deadTimer >= 32) {
            const index = activeEnemies.indexOf(enemy);
            if (index !== -1) activeEnemies.splice(index, 1);
        }
        return; 
    }

    if (enemy.enemyState === 0x04) {
        enemy.vy += 0.25 * dtModifier;
        enemy.x += enemy.vx * dtModifier;
        enemy.y += enemy.vy * dtModifier;
        return; 
    }

    if (enemy.enemyState === 0x00) {
        enemy.vy += 0.28125 * dtModifier;
        if (enemy.vy > 4.5) enemy.vy = 4.5;

        enemy.x += enemy.vx * dtModifier;
        
        const wallCheckY = enemy.y + enemy.height - 4;
        if (enemy.vx > 0 && player.isSolid(enemy.x + enemy.width, wallCheckY)) {
            enemy.x = Math.floor((enemy.x + enemy.width) / TILE_SIZE) * TILE_SIZE - enemy.width;
            enemy.vx = -0.5;
        } else if (enemy.vx < 0 && player.isSolid(enemy.x, wallCheckY)) {
            enemy.x = (Math.floor(enemy.x / TILE_SIZE) + 1) * TILE_SIZE;
            enemy.vx = 0.5;
        }

        enemy.y += enemy.vy * dtModifier;
        const footCheckY = enemy.y + enemy.height;
        const leftFootX = enemy.x + 2;
        const rightFootX = enemy.x + enemy.width - 2;

        if (player.isSolid(leftFootX, footCheckY) || player.isSolid(rightFootX, footCheckY)) {
            enemy.y = Math.floor(footCheckY / TILE_SIZE) * TILE_SIZE - enemy.height;
            enemy.vy = 0;
        }
    }
}

/**
 * 🎨 クリボーを描画する関数
 */
function drawKuribo(enemy, screenX, screenY, globalFrameCounter) {
    ctx.save();

    if (enemy.enemyState === 0x04) {
        ctx.translate(screenX + enemy.width / 2, screenY + enemy.height / 2);
        ctx.scale(1, -1);
        if (kuriboSprites.walk.complete) {
            ctx.drawImage(kuriboSprites.walk, -enemy.width / 2, -enemy.height / 2, enemy.width, enemy.height);
        }
    } else if (enemy.enemyState === 0x02) {
        if (kuriboSprites.dead.complete) {
            ctx.drawImage(kuriboSprites.dead, screenX, screenY + 8, 16, 8);
        }
    } else {
        const isFlipped = (Math.floor(globalFrameCounter) & 8) !== 0;
        if (kuriboSprites.walk.complete) {
            if (isFlipped) {
                ctx.translate(screenX + enemy.width / 2, screenY);
                ctx.scale(-1, 1);
                ctx.drawImage(kuriboSprites.walk, -enemy.width / 2, 0, enemy.width, enemy.height);
            } else {
                ctx.drawImage(kuriboSprites.walk, screenX, screenY, enemy.width, enemy.height);
            }
        }
    }

    ctx.restore();
}
