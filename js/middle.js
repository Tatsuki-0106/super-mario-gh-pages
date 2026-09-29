// =================================================================
// 📺 middle.js : ステージ開始時の残機数・黒画面表示システムお！
// =================================================================

// 👑【残機画面フラグ】trueなら残機画面を表示中、ロックフリー
window.isMiddleScreen = false;

// 残機画面の表示タイムラインカウンター（目標：120フレーム）
let middleFrameCounter = 0;

function startMiddleScreen() {
    window.isMiddleScreen = true;
    middleFrameCounter = 0;
    window.isTitleScreen = false;

    // ❌ 【バグ粉砕】ここでの残機引き算（window.lives--;）を完全撤去！！

    if (typeof stopAllBGM === 'function') stopAllBGM();
    console.log(`📺 【残機画面起動】WORLD ${window.stageName} | 残機: ${window.lives} おぶ！！！`);
}


/**
 * 🔄 残機画面のタイマーを毎フレームカウントダウン更新する関数
 */
function updateMiddleScreen(dtModifier) {
    if (!window.isMiddleScreen) return;

    middleFrameCounter += dtModifier;

    // 💡 ぴったり120フレーム（約2秒）が経過したら、黒画面を解除して本編へ発進！
    if (middleFrameCounter >= 120) {
        window.isMiddleScreen = false;
        console.log("🎮 120F経過！残機画面を閉じて、運命の本編タイムラインへ突入おぶ！！！ｗｗｗｗ");

        // 🎸 💥【神音響シンクロパッチ！】黒画面が明けたまさにこの瞬間に、残りタイムに応じたBGM判定を行うお！！！
        if (window.gameTime <= 100) {
            window.isHurryUpTriggered = true; // 警告フラグをロック
            if (typeof playSE === 'function') playSE('hurryup');
            
            // 🔊 タイム100以下で復活した場合は、警告音（hurryup.wav）が終わってから爆速BGMへ突入おぶ！
            if (sounds && sounds['hurryup']) {
                sounds['hurryup'].onended = function() {
                    if (player && player.playerState !== 0x03 && !window.isTitleScreen && !window.isMiddleScreen) {
                        console.log("🎸 復活後の警告SE終了！爆速BGMへ突入おぶ！");
                        if (typeof startBGM === 'function') startBGM('hurry_overworld');
                    }
                };
            }
        } else {
            // タイムが101以上なら、通常通り地上/地下のBGMを即座に鳴らすお！
            if (typeof startBGM === 'function') {
                if (window.isUnderground) {
                    startBGM('underground');
                } else {
                    startBGM('overworld');
                }
            }
        }
    }
}

function drawMiddleScreen() {
    if (!window.isMiddleScreen) return;

    // ① 画面丸ごとの黒塗りつぶしを完全撤去！
    //（main.js 側で Y=32 以降の黒塗りと、WORLD 1-1 の文字描画を行ってくれるので、ここはマリオと残機数値だけでOKお！）

    // ③ 🏃‍♂️【マリオの立ちスプライト】左から96px、上から105px（サイズ16x16px固定）
    if (typeof player !== 'undefined' && marioSprites) {
        const sprite = marioSprites.idle;
        if (sprite && sprite.complete) {
            ctx.drawImage(sprite, 96, 105, 16, 16);
        }
    }

    // ④ 🔤【「×」の文字】左から112px、上から120px
    if (typeof drawScoreText === 'function') {
        drawScoreText("x", 120, 112);
    }

    // ⑤ 🔢【残機数の数値（例：「3」）】左から144px、上から112px
    if (typeof drawScoreText === 'function') {
        const livesNum = window.lives !== undefined ? window.lives : 3;
        drawScoreText(String(livesNum), 144, 112);
    }
}

// =================================================================
// 💀 GAME OVER 画面の統合制御システムだお！！！ｗｗｗ
// =================================================================

// 👑【ゲームオーバー画面フラグ】trueならゲームオーバー画面を表示中、鉄壁ロック！
window.isGameOverScreen = false;

// ゲームオーバー画面の表示タイムラインカウンター（目標：300フレーム）
let gameOverFrameCounter = 0;

/**
 * 💀 残機が尽きた瞬間に、ゲームオーバー画面を大起動させるトリガー関数お！
 */
function startGameOverScreen() {
    window.isGameOverScreen = true;
    window.isMiddleScreen = false; 
    window.isTitleScreen = false; // 🌟【超重要】メインループのフリーズを完全解除！
    gameOverFrameCounter = 0;

    if (typeof stopAllBGM === 'function') stopAllBGM();
    if (typeof playSE === 'function') playSE('gameover');

    console.log("💀 【GAME OVER】ゲームオーバー画面を300F展開するお！！！");
}


/**
 * 🔄 ゲームオーバー画面のタイマーを毎フレームカウントダウン更新する関数
 */
function updateGameOverScreen(dtModifier) {
    if (!window.isGameOverScreen) return;

    gameOverFrameCounter += dtModifier;

    // 💡 ぴったり300フレーム（約5秒）が経過したら、自動でタイトル画面へ強制送還！
    if (gameOverFrameCounter >= 300) {
        window.isGameOverScreen = false;
        window.isTitleScreen = true; // タイトル画面へ帰還！
        
        console.log("📺 300F経過！夢の終わりおぶ！カメラ・マップ・全エネミーを完全初期化してタイトル画面へ強制送還するお！！！ｗｗｗｗ");

        // 👑【バグ大粉砕！タイトル画面巻き戻しパッチおぶ！！！】
        window.cameraX = 0;              // カメラ位置を一番左（0）に強制リセット！
        window.ram_0x071A = 0;           // 実機用CurrentPageLocも0ページ目にリセットお！
        window.lastCheckedSpawnCol = -1; 
        if (typeof scrollRegister !== 'undefined') scrollRegister = 0;
        if (typeof currentTable !== 'undefined') currentTable = 0;

        // 💥【大核心パッチ！】前のプレイのクリボーやキノコの残骸メモリを鉄壁の完全大粉砕！！！
        if (window.activeEnemies) window.activeEnemies.length = 0;
        if (typeof activeMushrooms !== 'undefined') activeMushrooms.length = 0;
        if (typeof animatingBlocks !== 'undefined') animatingBlocks.length = 0;
        if (typeof animatingBricks !== 'undefined') animatingBricks.length = 0;
        if (typeof activeDebris !== 'undefined') activeDebris.length = 0;
        if (typeof activeCoins !== 'undefined') activeCoins.length = 0;

        // 直前のクリボー密集コンボのインデックスデータも綺麗に初期化するお！
        if (typeof lastSpawnedKuriboCol !== 'undefined') lastSpawnedKuriboCol = -1;
        if (typeof kuriboComboCount !== 'undefined') kuriboComboCount = 0;

        // 地形タイルマップとVRAM（ネームテーブル）を0マス目から再ベイクさせるお！
        if (typeof resetOverworldMapToDefault === 'function') resetOverworldMapToDefault();
        if (typeof resetBonusMapToDefault === 'function') resetBonusMapToDefault();


        if (typeof nesVRAM !== 'undefined' && typeof tileMap !== 'undefined') {
            for (let r = 0; r < 15; r++) { // VRAM_HEIGHT
                for (let c = 0; c < 32; c++) { // VRAM_WIDTH
                    nesVRAM[r][c] = tileMap[r][c] || 0;
                }
            }
            if (typeof lastWrittenCol !== 'undefined') lastWrittenCol = 31; // 先回り位置もリセットお！
        }

        // プレイヤーの内部座標も念のため初期位置に完全埋め込み！
        if (typeof player !== 'undefined') {
            player.x = window.INITIAL_PLAYER_X;
            player.y = window.INITIAL_PLAYER_Y;
        }

        // タイトル画面に戻ったら、おなじみのタイトルBGMを再始動！
        if (typeof startBGM === 'function') startBGM('title');
    }
}

/**
 * 🎨 GAME OVER 文字は main.js 側で完全直描画されるため、安全な空関数として残すおぶ！
 */
function drawGameOverScreen() {
    // エラー落ち防止用の鉄壁ガードお！
    return;
}

