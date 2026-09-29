// =================================================================
// 🎮 title.js : タイトル画面＆ゲームスタートシーケンスシステムお！
// =================================================================

// 👑【管理状態フラグ】trueならタイトル待機中、falseならゲーム中
window.isTitleScreen = true;

// 🖼️ タイトルロゴ画像の読み込み
const titleLogoSprite = new Image();
titleLogoSprite.src = 'sprite/others/titlelogo.png';

// キノコカーソル画像の読み込み
const cursorSprite = new Image();
cursorSprite.src = 'sprite/others/mushroom.png';

// カーソルの現在の選択状態（0: 1 PLAYER / 1: 2 PLAYER）
let selectedMenuIndex = 0;
// キーの押しっぱなしによる連続暴発を防ぐためのフラグ
let spaceKeyWasPressed = false;

// ─── 🟠 タイトル専用の橙色フォント（pale_orange）管理オブジェクト ───
const titleSprites = {};

// 数字 (0-9)
for (let i = 0; i <= 9; i++) {
    titleSprites[i] = new Image();
    titleSprites[i].src = `sprite/others/pale_orange/${i}.png`;
}
// アルファベット (a-z)
const titleAlphabet = 'abcdefghijklmnopqrstuvwxyz';
for (let char of titleAlphabet) {
    titleSprites[char] = new Image();
    titleSprites[char].src = `sprite/others/pale_orange/${char}.png`;
}
// 記号アセット
titleSprites['-'] = new Image();    titleSprites['-'].src = 'sprite/others/pale_orange/-.png';
titleSprites['.'] = new Image();    titleSprites['.'].src = 'sprite/others/pale_orange/dot.png';
titleSprites['!'] = new Image();    titleSprites['!'].src = 'sprite/others/pale_orange/!.png';
titleSprites['cross'] = new Image(); titleSprites['cross'].src = 'sprite/others/pale_orange/cross.png';

// 小文字の 'c' が来たらコピーライト（copyright.png）をガッチリ固定
titleSprites['c_logo'] = new Image();
titleSprites['c_logo'].src = 'sprite/others/pale_orange/copyright.png';

/**
 * 🎨 橙色フォント（8x8px）を使って、タイトル画面に文字を描画する専用ヘルパー
 */
function drawTitleText(text, startX, startY) {
    const targetStr = String(text);
    for (let i = 0; i < targetStr.length; i++) {
        const char = targetStr[i];
        let sprite = null;

        if (char === ' ') continue; 
        
        if (char === 'c') {
            sprite = titleSprites['c_logo'];   
        } else {
            sprite = titleSprites[char.toLowerCase()];
        }

        if (sprite && sprite.complete) {
            ctx.drawImage(sprite, startX + (i * 8), startY, 8, 8);
        }
    }
}

/**
 * 🎨 タイル画面のロゴ、メニュー、キノコカーソルを最前面に描画する関数お！
 */
function drawTitleScreen() {
    if (!window.isTitleScreen) return;

    // ① ロゴの描画（左から40px、上から32px）
    if (titleLogoSprite.complete) {
        ctx.drawImage(titleLogoSprite, 40, 32);
    }
    
    // ② 白文字ゲームモード ＆ 👑【新設：TOPスコア】表示
    if (typeof drawScoreText === 'function') {
        // 『1 PLAYER GAME』：上から144px、左から88px
        drawScoreText("1 PLAYER GAME", 88, 144);
        // 『2 PLAYER GAME』：上から160px、左から88px
        drawScoreText("2 PLAYER GAME", 88, 160);
        
        // 👑【ターゲット仕様の完全実現！】『TOP-000000』を絶対座標「左から96px、上から184px」に白文字で配置おぶ！！！ｗｗｗ
        drawScoreText("TOP-000000", 96, 184);
    }
    
    // ③ キノコカーソルの描画ロジック
    if (cursorSprite.complete) {
        const cursorX = 72;
        const cursorY = 144 + (selectedMenuIndex * 16);
        ctx.drawImage(cursorSprite, cursorX, cursorY);
    }
    
    // ④ 「©1985 nintendo」の文字を絶対座標（104, 120）に橙色で描画
    drawTitleText("c1985 nintendo", 104, 120);
}

/**
 * ⌨️ タイトル画面でのキー入力を毎フレーム先回り監視する関数お！
 */
function updateTitleInput() {
    if (!window.isTitleScreen) return;

    // スペースキーによるキノコの上下トグル移動システム
    if (keys.Space) {
        if (!spaceKeyWasPressed) {
            selectedMenuIndex = (selectedMenuIndex === 0) ? 1 : 0;
            console.log(`🍄 キノコカーソル移動！現在のターゲット: ${selectedMenuIndex === 0 ? "1 PLAYER" : "2 PLAYER"}`);
            spaceKeyWasPressed = true; 
        }
    } else {
        spaceKeyWasPressed = false; 
    }

    // エンターキー（Enter）が叩かれたら、残機表示を経てゲーム本編へ突入！
    if (keys.Enter) {
        // 👑【新設！】選択されていたメニューインデックスから、2人プレイモードかをジャッジ！
        window.isTwoPlayerMode = (selectedMenuIndex === 1);

        // 1P・2Pの独立パラメータデータを完全に新品リセット！
        window.player1Data = { lives: 3, score: 0, coins: 0, isSuper: false, isFire: false, height: 16, stage: "1-1" };
        window.player2Data = { lives: 3, score: 0, coins: 0, isSuper: false, isFire: false, height: 16, stage: "1-1" };
        
        // 最初のプレイは必ず「1P（マリオ）」からスタートお！
        window.currentPlayerNumber = 1;
        
        // 👑【修正パッチ】playerが存在することを確認して安全に代入
        if (typeof player !== 'undefined') {
            player.characterType = 'mario';
        }

        // グローバル変数を現在のプレイヤー1のものと完全同期
        window.lives = window.player1Data.lives;
        window.score = window.player1Data.score;
        window.coins = window.player1Data.coins;
        
        if (typeof player !== 'undefined') {
            player.isSuper = window.player1Data.isSuper;
            player.isFire = window.player1Data.isFire;
            player.height = window.player1Data.height;
        }
        window.stageName = window.player1Data.stage;

        window.gameTime = 400;
        window.isUnderground = false;
        if (typeof loadStageSprites === 'function') loadStageSprites(false);
        
        // 👑【修正パッチ】全アセットをマリオフォルダ（ finalPathFolder = '' ）にリフレッシュ！
        if (typeof refreshPlayerSpriteFolders === 'function') {
            refreshPlayerSpriteFolders();
        }

        // 💥【新設大粉砕パッチ！】ゲーム開始時にも、古いエネミーやアイテムのメモリ残骸を完全大粉残！！！
        if (window.activeEnemies) window.activeEnemies.length = 0;
        if (typeof activeMushrooms !== 'undefined') activeMushrooms.length = 0;
        // ✨【新設パッチ】前回の空中浮遊スコアデータのメモリ残骸も完全抹殺お！！！
        if (typeof activeScoreEffects !== 'undefined') activeScoreEffects.length = 0;
        if (typeof animatingBlocks !== 'undefined') animatingBlocks.length = 0;
        if (typeof animatingBricks !== 'undefined') animatingBricks.length = 0;
        if (typeof activeDebris !== 'undefined') activeDebris.length = 0;
        if (typeof activeCoins !== 'undefined') activeCoins.length = 0;

        // クリボー密集コンボ用データもスタート時に安全初期位置へ！
        if (typeof lastSpawnedKuriboCol !== 'undefined') lastSpawnedKuriboCol = -1;
        if (typeof kuriboComboCount !== 'undefined') kuriboComboCount = 0;

        // 🧱 マップデータを初期状態へクローン生成
        if (typeof resetOverworldMapToDefault === 'function') resetOverworldMapToDefault();
        if (typeof resetBonusMapToDefault === 'function') resetBonusMapToDefault();
        
        // 💥【大核心追加パッチ！】
        // ゲームオーバーからの新品再スタート時も、先回りインデックスを完全に最初の初期位置に戻し、
        // 1マスマップが動いた瞬間から自動スキャンが22列目を100%検知できるようにガチガチにリセットするおぶ！！！ｗｗｗ
        window.lastCheckedSpawnCol = Math.ceil(canvas.width / 16) - 1; // 最初の画面の右端（15列目）にセット
        if (typeof initEnemiesFromMap === 'function') {
            initEnemiesFromMap(); // 最初の画面内の敵を一括実体化！
        }

        // 🎬 【大キック！】スキップさせず、100%確実に120フレームの中間残機表示を展開するおぶ！！！
        if (typeof startMiddleScreen === 'function') {
            startMiddleScreen();
        }
        
        // 💥【スキップ暴発完全ガード！】Enter入力を強制的にOFFにして、中間画面の即死スキップを完全抹殺お！！！
        keys.Enter = false; 
    }
}
