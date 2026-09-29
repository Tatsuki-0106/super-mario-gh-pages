// =================================================================
// 🔊 sound.js : 効果音＆BGM 一括管理・再生システム（フォルダ全アセット完全大同期版お！）
// =================================================================

// ─── 🎵 1. 効果音（SE）のインスタンス事前生成 ───
// 画像で確認できた「sounds」直下のすべてのWAVアセットを1つ残さず完全バインドだおぶ！！！ｗｗｗ
const sounds = {
    brick:          new Audio('sounds/brick.wav'),         // レンガ粉砕音お！
    powerup:        new Audio('sounds/powerup.wav'),       // キノコ出現／変身音
    stompswim:      new Audio('sounds/stompswim.wav'),     // 敵を踏んづけた音お！
    coin:          new Audio('sounds/coin.wav'),         // ⏸️ ポーズをかけた瞬間のピロリロ音！
    item:           new Audio('sounds/item.wav'),          // アイテムせり上がり音
    bump:           new Audio('sounds/bump.wav'),          // チビマリオが壁やレンガにゴンッ！
    beep:           new Audio('sounds/beep.wav'),          // タイム精算のピピピピッ！
    flagpole:       new Audio('sounds/flagpole.wav'),      // ポールをしがみつき下降する音
    pipepowerdown:  new Audio('sounds/pipepowerdown.wav'), // 土管に入る／ダメージ被弾音
    kickkill:       new Audio('sounds/kickkill.wav'),      // 甲羅を蹴る／敵をなぎ倒す音
    jump:           new Audio('sounds/jump.wav'),          // スーパーマリオ（デカ）のジャンプ音
    jumpsmall:      new Audio('sounds/jumpsmall.wav'),     // チビマリオのジャンプ音
    pause:          new Audio('sounds/pause.wav'),         // ⏸️ ポーズをかけた瞬間のピロリロ音！
    '1up':          new Audio('sounds/1up.wav'),           // 🌟 1UPキノコ獲得／無限コンボ達成音！
    gameover:       new Audio('sounds/gameover.wav'),      // 💀 残機ゼロ、全滅時のゲームオーバー画面音
    hurryup:        new Audio('sounds/hurryup.wav'),       // ⏰ 残りタイム100以下突入の警告ファンファーレ
    death:          new Audio('sounds/death.wav'),          // 💀 敵激突／奈落落ちマリオ死亡時の音
    fireball:          new Audio('sounds/fireball.wav')          // 🔥ファイアボールを投げたときの音
};


// ─── 🎸 2. BGM（背景音楽 ＆ ファンファーレ）のインスタンス生成 ───
const bgm = {
    overworld:       new Audio('sounds/bgm/overworld.mp3'),       // 通常地上ステージBGM
    underground:     new Audio('sounds/bgm/underground.mp3'),     // 通常地下ステージBGM
    hurry_overworld: new Audio('sounds/bgm/hurryoverworld.mp3'),   // タイムアップ寸前の爆速地上BGM
    star:            new Audio('sounds/bgm/star.mp3'),              // スター状態の最強BGM
    clear:           new Audio('sounds/clear.mp3')                // 🏁 ポールから着地した瞬間のステージクリア！
};

// BGMはループ再生・音量1に鉄壁固定おぶ！ｗｗｗ
bgm.overworld.loop = true;
bgm.overworld.volume = 1;

bgm.underground.loop = true;
bgm.underground.volume = 1;

bgm.hurry_overworld.loop = true;
bgm.hurry_overworld.volume = 1;

bgm.star.loop = true;
bgm.star.volume = 1;

// ※ステージクリアファンファーレ（clear.mp3）は1回鳴りきれば良いのでループはOFFお！
bgm.clear.loop = false;
bgm.clear.volume = 1;

function playSE(seName) {
    if (sounds[seName]) {
        try {
            sounds[seName].currentTime = 0; // 再生位置を最先頭に強制リセット（連打対応の超核心！）
            sounds[seName].play().catch(e => console.log("SE再生がブラウザにブロックされたお（クリックしてね）:", e));
        } catch (error) {
            console.error(`SE [${seName}] の再生中にエラーおぶ！:`, error);
        }
    } else {
        console.warn(`⚠️ 指定された効果音 [${seName}] は登録されていませんお！`);
    }
}


/**
 * 🎸 BGMを新しく指定して再生を開始する関数
 * @param {string} bgmName - 再生したい bgm 内のキー名
 */
function startBGM(bgmName) {
    if (bgm[bgmName]) {
        bgm[bgmName].play().catch(e => {
            // ブラウザの「ユーザー操作がないと自動再生禁止」仕様を鉄壁ガードおぶ！
            console.log("BGM自動再生がブロックされたので、次の画面クリックで自動起動させるお！");
            window.addEventListener('click', () => {
                bgm[bgmName].play().catch(err => console.log(err));
            }, { once: true });
        });
    } else {
        console.warn(`⚠️ 指定されたBGM [${bgmName}] は登録されていませんお！`);
    }
}


/**
 * 🛑 流れているすべてのBGM・ファンファーレを即座に完全ミュート停止する関数
 * マリオが死亡した瞬間や、変身シーン、ゲームオーバー突入時に一斉消音するお！
 */
function stopAllBGM() {
    Object.values(bgm).forEach(track => {
        try {
            track.pause();
            track.currentTime = 0; // 曲の位置も最初のゼロ秒に戻す
        } catch (e) {
            console.log("BGM停止ガードお！:", e);
        }
    });
}
