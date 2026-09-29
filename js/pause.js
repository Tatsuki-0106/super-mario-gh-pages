// =================================================================
// ⏸️ pause.js : 実機座標完全同期・PAUSEシステム（停止＆解除SE完全シンクロ版お！）
// =================================================================

// 💥 ゲームが一時停止しているかどうかのフラグ管理
window.isPaused = false;

// ⏳ 連続でボタンを押したときのチャタリング（暴発）を防ぐクールダウンタイマー
let pauseKeyCooldown = 0;

/**
 * 🔄 ポーズ状態の切り替えと、キー入力の監視を行う関数だお！
 * @param {object} keys - main.js等から渡されるキー入力状態オブジェクト
 * @param {number} dtModifier - デルタタイム補正値
 */
function updatePauseInput(keys, dtModifier = 1.0) {
    if (pauseKeyCooldown > 0) {
        pauseKeyCooldown -= dtModifier;
    }

    // 💡 タイトル画面やマリオ死亡時（0x03）、クリア中などはポーズできないように本家ガード！ [3]
    if (window.isTitleScreen || (typeof player !== 'undefined' && (player.playerState === 0x03 || player.playerState === 0x0C))) { [3]
        window.isPaused = false; [3]
        return; [3]
    }

    // ⌨️ 「Pキー」または「Enterキー」でポーズ発動おぶ！！！ｗｗｗ [3]
    if ((keys['p'] || keys['P']) && pauseKeyCooldown <= 0) { [3]
        window.isPaused = !window.isPaused; // 状態をトグル反転！ [3]
        pauseKeyCooldown = 15; // 15フレームの入力制限をかけて多重暴発を完全鉄壁防御！ [3]

        if (window.isPaused) {
            console.log("⏸️ GAME PAUSE!! 世界を一時停止したおぶ！！！"); [3]
            
            // 🔊 👑【核心追加その1】ポーズを「かけた」瞬間に pause.wav を爆音再生お！！！
            if (typeof playSE === 'function') {
                playSE('pause');
            }
            
            // 💡 現在流れているBGMを一瞬ストップ（一時停止）させるお！ [3]
            Object.values(bgm).forEach(track => { [3]
                if (!track.paused) { [3]
                    track._wasPlayingBeforePause = true; // 状態を記憶 [3]
                    track.pause(); [3]
                }
            });
        } else {
            console.log("▶️ GAME RESUME!! 世界を再開したおぶ！！！"); [3]
            
            // 🔊 👑【大ターゲット仕様！】ポーズを「解除した」瞬間にも、pause.wav をもう一発最高速で鳴らすおぶ！！！ｗｗｗｗ
            if (typeof playSE === 'function') {
                playSE('pause');
            }
            
            // 💡 ポーズ解除時に、鳴っていたBGMを元の位置から再開させるお！ [3]
            Object.values(bgm).forEach(track => { [3]
                if (track._wasPlayingBeforePause) { [3]
                    track.play().catch(e => console.log(e)); [3]
                    track._wasPlayingBeforePause = false; [3]
                }
            });
        }
    }
}

/**
 * 📺【修正！】PAUSE文字を完全大粉砕撤去したおぶ！！！
 */
function drawPauseOverlay() {
    // 💡 文字描画は完全になくしたいので、中身を空っぽにして安全に即抜け return お！
    return;
}
