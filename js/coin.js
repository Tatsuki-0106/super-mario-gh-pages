function checkPlayerCoinCollisions() {
    if (typeof player === 'undefined' || player.playerState === 0x03) return;

    const startCol = Math.floor(player.x / TILE_SIZE);
    const endCol   = Math.floor((player.x + player.width - 1) / TILE_SIZE);
    const startRow = Math.floor(player.y / TILE_SIZE);
    const endRow   = Math.floor((player.y + player.height - 1) / TILE_SIZE);

    for (let row = startRow; row <= endRow; row++) {
        if (!tileMap[row]) continue;
        for (let col = startCol; col <= endCol; col++) {
            if (tileMap[row][col] === 30) {

                tileMap[row][col] = 0;

                if (typeof playSE === 'function') {
                    playSE('coin');
                }

                window.coins++;

                if (window.coins >= 100) {
                    window.coins = 0;

                    if (window.lives !== undefined) {
                        window.lives++;
                    }

                    if (typeof playSE === 'function') {
                        playSE('1up');
                    }

                    if (typeof spawnScoreEffect === 'function') {
                        spawnScoreEffect(player.x, player.y - 16, '1up');
                    }

                } else {

                    if (typeof playSE === 'function') {
                        playSE('coin');
                    }
                }

            }
        }
    }
}
