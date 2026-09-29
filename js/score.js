// =================================================================
// 📊 score.js : 本家フォントスプライト完全対応・ステータスバーシステム
// =================================================================

// 1. 各種ゲーム変数の定義（既存のコードと重複しないよう window に無ければ初期化）
if (window.score === undefined) window.score = 0;
if (window.coins === undefined) window.coins = 0;
if (window.stageName === undefined) window.stageName = "1-1";
if (window.gameTime === undefined) window.gameTime = 400;
if (window.lives === undefined) window.lives = 3; // 💥【ここを追加お！！！】初期値を3機にロック！


// タイムカウントダウン用の内部タイマー（60フレーム = 1秒ごとに減少）
let timeFrameCounter = 0;

window.isHurryUpTriggered = false;

// 2. 🔤 アルファベット・数字・記号のスプライト管理オブジェクト
const scoreSprites = {};

// 数字 (0-9)
for (let i = 0; i <= 9; i++) {
    scoreSprites[i] = new Image();
    scoreSprites[i].src = `sprite/others/${i}.png`;
}
// アルファベット (a-z)
const alphabet = 'abcdefghijklmnopqrstuvwxyz';
for (let char of alphabet) {
    scoreSprites[char] = new Image();
    scoreSprites[char].src = `sprite/others/${char}.png`;
}
// 特殊記号・専用アイコン
scoreSprites['-'] = new Image();    scoreSprites['-'].src = 'sprite/others/-.png';
scoreSprites['.'] = new Image();    scoreSprites['.'].src = 'sprite/others/dot.png';
scoreSprites['!'] = new Image();    scoreSprites['!'].src = 'sprite/others/!.png';
scoreSprites['cross'] = new Image();    scoreSprites['cross'].src = 'sprite/others/cross.png';       // かける(x)

// 👑【超核心大復活パッチ！】カラーアニメーションに必要な coin1, coin2, coin3 をすべて個別スロットにガッチリとロードしておくおぶ！！！ｗｗｗｗｗ
scoreSprites['coin1'] = new Image(); scoreSprites['coin1'].src = 'sprite/others/coin1.png';
scoreSprites['coin2'] = new Image(); scoreSprites['coin2'].src = 'sprite/others/coin2.png';
scoreSprites['coin3'] = new Image(); scoreSprites['coin3'].src = 'sprite/others/coin3.png';

// 🪙 最初のデフォルト表示用
scoreSprites['coin'] = scoreSprites['coin1'];

/**
 * 🎨 指定された文字列を指定の座標に8x8pxサイズで横並び描画するヘルパー関数
 * @param {string} text - 描画したい文字
 * @param {number} startX - 開始のX座標
 * @param {number} startY - 開始のY座標
 */
function drawScoreText(text, startX, startY) {
    const targetStr = String(text).toLowerCase();
    for (let i = 0; i < targetStr.length; i++) {
        const char = targetStr[i];
        let sprite = null;

        if (char === ' ') continue; // 空白はスキップ
        
        // 💎 文字ごとの差し替えロジック
        if (char === '\$') {
            sprite = scoreSprites['coin'];   // \$ が来たらコイン画像お！
        } else if (char === 'x') {
            sprite = scoreSprites['cross'];  // x が来たら専用のクロス(cross.png)をお！
        } else {
            sprite = scoreSprites[char];     // それ以外は通常のアルファベットや数字
        }

        if (sprite && sprite.complete) {
            ctx.drawImage(sprite, startX + (i * 8), startY, 8, 8);
        }
    }
}

// ⏱️ 高速精算用の内部フレームカウンター
let scoreCountFrameTimer = 0;

/**
 * 🔄 残りタイムの管理 ＆ ゴール後の爆速スコア加算システムお！
 */
function updateScoreTimer(dtModifier = 1.0) {
    if (typeof player === 'undefined') return;

    // 🚯 マリオがすでに死亡状態（0x03）なら、多重暴発を防ぐためにこれ以上タイマー処理を完全スルー！
    if (player.playerState === 0x03) {
        return;
    }

    // ─── 🔵 ①【新設：お城侵入後の爆速カウントダウンタスク：ステート 0x0C】 ───
    if (player.playerState === 0x0C) {
        if (window.gameTime > 0) {
            scoreCountFrameTimer += dtModifier;
            
            // 💡 仕様書通り、4フレーム（dtModifier換算）が経過するたびにカウント処理を実行！
            while (scoreCountFrameTimer >= 1) {
                scoreCountFrameTimer -= 1; 

                window.gameTime--; // タイムを 1 減らす
                if (typeof addScore === 'function') { addScore(50); } // スコアを 50点 加算！

                // 🔊 1減少ごとに「ピッ」という電子音を最高テンポで再生お！！！ｗｗｗ
                if (typeof playSE === 'function') {
                    playSE('beep');
                }

                if (window.gameTime <= 0) {
                    window.gameTime = 0;
                    console.log("👑 【タイム精算完了】お城の裏で綺麗にカウントが0になったおぶ！！！");

                    // ─── 👑【2人プレイ：ゴール・精算完了時の交代セーブ＆ロードエンジン】 ───
                    if (window.isTwoPlayerMode) {
                        // 👑【大核心】ゴール完了したプレイヤーのクリアフラグをガツンとロックON！！！
                        if (window.currentPlayerNumber === 1) {
                            window.isPlayer1Cleared = true;
                            console.log("🏁 1Pマリオがステージをクリアしたフラグをベイクしたおぶ！！！");
                        } else {
                            window.isPlayer2Cleared = true;
                            console.log("🏁 2Pルイージがステージをクリアしたフラグをベイクしたおぶ！！！");
                        }

                        // ① いまゴールしたキャラクターの最終ステージクリアデータをセーブお！
                        const currentData = (window.currentPlayerNumber === 1) ? window.player1Data : window.player2Data;
                        currentData.lives = window.lives; // 残機はそのまま維持
                        currentData.score = window.score;
                        currentData.coins = window.coins;
                        currentData.isSuper = player.isSuper;
                        currentData.isFire = player.isFire;
                        currentData.height = player.height;
                        currentData.stage = "1-1"; // 💡本来は次のステージ名（1-2等）を入れるお！

                        // ② 交代相手の番号を決定
                        let nextPlayerNumber = (window.currentPlayerNumber === 1) ? 2 : 1;
                        let nextData = (nextPlayerNumber === 1) ? window.player1Data : window.player2Data;

                        // もし交代相手がすでに全滅（残機0）していたら、クリアした自分がそのまま次の面も居残り続行お！
                        if (nextData.lives <= 0) {
                            nextPlayerNumber = window.currentPlayerNumber;
                            nextData = (nextPlayerNumber === 1) ? window.player1Data : window.player2Data;
                        }

                        // ③ プレイヤー番号をパチッと公式切り替え！
                        window.currentPlayerNumber = nextPlayerNumber;
                        player.characterType = (window.currentPlayerNumber === 1) ? 'mario' : 'luigi';
                        
                        // 交代相手のパラメータをグローバル変数へ完全ロード大開通！！！
                        window.lives = nextData.lives;
                        window.score = nextData.score;
                        window.coins = nextData.coins;
                        player.isSuper = nextData.isSuper;
                        player.isFire = nextData.isFire;
                        player.height = nextData.height;
                        window.stageName = nextData.stage;

                        console.log(`🔄 【クリア交代大成功お！】次は [${window.currentPlayerNumber}P: ${player.characterType}] のターンだお！！！`);
                    }

                    // 🎬 【共通の次ステージ初期化ルーチン】交代した（または1人用の）プレイヤーの姿をグラフィックに即反映！
                    if (typeof refreshPlayerSpriteFolders === 'function') {
                        refreshPlayerSpriteFolders();
                    }

                    // 💀 ステージ開始前の中間暗転残機画面（120F）をここで強制召喚展開おぶ！！！
                    if (typeof startMiddleScreen === 'function') {
                        startMiddleScreen();
                    }

                    // 物理、タイム、カメラを一斉に最初のスタート地点の状態へ新品リセット！
                    window.gameTime = 400;
                    timeFrameCounter = 0;
                    window.isHurryUpTriggered = false;

                    player.playerState = 0x08; 
                    player.vanished = false;
                    player.goalReached = false;
                    player.isPitDeath = false;
                    player.vx = 0;
                    player.vy = 0;
                    player.direction = 1;

                    player.x = window.INITIAL_PLAYER_X;
                    player.y = window.INITIAL_PLAYER_Y;
                    cameraX = 0;

                    // マップと周辺エネミー・アイテムを一斉に再生成クローン！
                    if (typeof resetOverworldMapToDefault === 'function') resetOverworldMapToDefault();
                    if (typeof resetBonusMapToDefault === 'function') resetBonusMapToDefault();
                    window.isUnderground = false;
                    if (typeof loadStageSprites === 'function') loadStageSprites(false);
                    window.originalOverworldMapRef = null;

                    if (typeof scrollRegister !== 'undefined') scrollRegister = 0;
                    if (typeof currentTable !== 'undefined') currentTable = 0;
                    
                    // ネームテーブル（VRAM）も0マス目から綺麗にクリアベイク！
                    if (typeof lastWrittenCol !== 'undefined' && typeof nesVRAM !== 'undefined') {
                        for (let r = 0; r < 15; r++) {
                            for (let c = 0; c < 32; c++) {
                                nesVRAM[r][c] = tileMap[r][c] || 0;
                            }
                        }
                        lastWrittenCol = 31;
                    }

                    if (window.activeEnemies) window.activeEnemies.length = 0;
                    if (typeof initEnemiesFromMap === 'function') {
                        initEnemiesFromMap();
                    }

                    // 👑【旗のフライングバグ完全粉砕パッチ！】
                    // 1Pマリオがゴールして、2Pルイージのターンへ交代したまさにその瞬間に、
                    // ゴール旗の動的ステートを鉄壁の新品未初期化状態へ強制初期化リセットおぶ！！！ｗｗｗ
                    if (typeof goalPoleFlag !== 'undefined') {
                        goalPoleFlag.isInitialized = false;
                        goalPoleFlag.isFinished = false;
                        goalPoleFlag.y = 0;
                        goalPoleFlag.startY = 0;
                        goalPoleFlag.targetY = 0;
                    }

                    // 古い残りかすオブジェクトをメモリ大粉砕全消去！
                    if (typeof activeMushrooms !== 'undefined') activeMushrooms.length = 0;
                    if (typeof activeStars !== 'undefined') activeStars.length = 0;
                    if (typeof activeFlowers !== 'undefined') activeFlowers.length = 0;
                    if (typeof animatingBlocks !== 'undefined') animatingBlocks.length = 0;
                    if (typeof animatingBricks !== 'undefined') animatingBricks.length = 0;
                    if (typeof activeFireballs !== 'undefined') activeFireballs.length = 0;
                    if (typeof activeScoreEffects !== 'undefined') activeScoreEffects.length = 0;

                    if (typeof stopAllBGM === 'function') stopAllBGM();

                    break; 
                }
            }
        }
        return; // 精算中は通常の1秒カウントダウンをスキップおぶ！
    }

    // ─── 🔵 ②【通常のゲームプレイ中の実機準拠カウントダウン】 ───
    if (player.playerState === 0x0B || player.vanished) {
        // お城へ自動前進中（0x0B）の時は、本家仕様通りタイム減少を一旦ストップ！
        return;
    }

    if (window.gameTime > 0) {
        timeFrameCounter += dtModifier;
        
        // 💡 25フレーム経過するごとに残りタイム（秒数）を1減らすお！
        while (timeFrameCounter >= 25) {
            timeFrameCounter -= 25; 
            window.gameTime--;      

            // 💥 💥 💥【ここを大核心修正お！！！】💥 💥 💥
            // 実機準拠：残りタイムが「100以下」になり、まだ今回のプレイで警告を鳴らしていない時！
            if (window.gameTime <= 100 && !window.isHurryUpTriggered) {
                window.isHurryUpTriggered = true; // 即座に多重暴発防止ロック！
                
                console.log(`⏰ ⏰ 【タイム${window.gameTime}警告！】最初から100以下なので世界が即座に急ぎ始めたおぶ！！！`);
                
                // ① いま裏で鳴っている通常用の全BGMを即座に完全ミュート＆リセット停止！
                if (typeof stopAllBGM === 'function') stopAllBGM();
                
                // ② 「hurryup.wav」の警告効果音を爆音で先頭から一発再生！！！ｗｗｗ
                if (typeof playSE === 'function') {
                    playSE('hurryup');
                }

                // ③ 【自動追尾連携ロジック】警告音が鳴り終わったら爆速BGMへバトンタッチ！
                if (sounds['hurryup']) {
                    sounds['hurryup'].onended = function() {
                        if (player && player.playerState !== 0x03 && !window.isTitleScreen) {
                            console.log("🎸 警告SEが正常終了したお！爆速BGM『hurryoverworld.mp3』へ突入おぶ！！！");
                            if (typeof startBGM === 'function') {
                                startBGM('hurry_overworld'); // 爆速BGMへ突入！！！
                            }
                        }
                    };
                }
            }

            // 💥 💥 💥【タイムアップ時の大核心パッチ】💥 💥 💥
            if (window.gameTime <= 0) {
                window.gameTime = 0;
                
                console.log("⏰ ⏰ ⏰ 【TIME UP!!】時間切れによる実機ステート0x03死亡アニメーションを完全キック！！！ｗｗｗｗ");
                
                // ① プレイヤーの状態を「0x03（死亡放物線モード）」に完全ロックオン！
                player.playerState = 0x03; 
                player.vx = 0; 
                player.vy = 0; // 慣性を完全消滅！
                
                // 💥【ここを大核心追加お！！！】
                // スーパーマリオ時でも関係なし！死亡グラフィックが引き伸ばされないように身長を16pxに強制リセット！
                player.height = 16; 

                // ② 画像オブジェクトから本物の死亡スプライト（mario_death.png）をガチッと強制ハメ込み！
                if (typeof marioSprites !== 'undefined' && marioSprites.death) {
                    player.currentSprite = marioSprites.death; 
                }
                
                // ③ player.js側の死亡放物線計算に必要な内部カウンタを精密にゼロリセット！
                player.invincibleTimer = 0;
                player.deathTimer = 0;
                player.deathFrameBuffer = 0;
                player.deathJumpTriggered = false; // まだジャンプしていないフラグ
                player.isDamaged = false;
                player.isTransforming = false;
                
                // ④ 鳴っている全BGM（通常・爆速）を即座に完全停止させ、死亡SE「チャラララーンラン…」を裏で爆音再生お！！！
                if (typeof stopAllBGM === 'function') stopAllBGM();
                if (typeof playSE === 'function') playSE('death');
                
                break; // タイム減少ループを安全に脱出！
            }
        }
    }
}

// =================================================================
// 📊 score.js 追加パッチ：本家コンボテーブル＆スコア加算システムお！
// =================================================================

// 💥 【完全大復活お！！！】本家の連続撃破スコア段階を完全再現した配列を流し込んだお！
// 1体目:100点, 2体目:200点, 3体目:400点, 4体目:800点, 5体目:1000点, 6体目:2000点, 7体目:4000点, 8体目:8000点
const COMBO_SCORE_TABLE =[ 100, 200, 400, 800, 1000, 2000, 4000, 8000 ];

/**
 * 🎯 ゲーム内のあらゆる行動からスコアを加算する中央管理関数
 * @param {number} amount - 加算するスコア点数
 */
function addScore(amount) {
    window.score += amount;
    // 999999点を超えたらカンストさせる本家ガードお！
    if (window.score > 999999) {
        window.score = 999999;
    }
    console.log(`📈 スコア獲得: +${amount}点 | 現在のスコア: ${window.score}`);
}

/**
 * 🐢 空中連続踏みつけ、または甲羅スライド巻き込み時のコンボスコアを計算・加算する関数
 * @param {number} comboCount - 現在の連続撃破数 (0スタート)
 * @return {number} 今回獲得したスコア（表示用など。1UPの場合は-1を返す）
 */
function addComboScore(comboCount) {
    if (comboCount < COMBO_SCORE_TABLE.length) {
        const scoreGain = COMBO_SCORE_TABLE[comboCount];
        addScore(scoreGain);
        return scoreGain;
    } else {
        // 8000点の次（コンボ数9回目（インデックス8）以降）は、仕様書通り無限に「1UP」だお！！！ｗｗｗ [8]
        console.log("🌟 👑 【無限1UP達成お！！！】 残機が1増えたおぶ！！！ 👑 🌟"); [8]
        
        // 🔊【極上連動パッチ】準備していただいた「1up.wav」の神音声をここで大爆音再生だお！！！ｗｗｗｗｗ
        if (typeof playSE === 'function') { 
            playSE('1up'); 
        }
        
        // 👑 残機システムへ確実に+1加算！ [8]
        if (typeof window.lives !== 'undefined') {
            window.lives++; 
        }
        
        return -1; // 1UPフラグ（main.js側のエフェクトシステムがこれを検知して空中に「1up」を出します！） [8]
    }
}


/**
 * 📺 仕様書通りの絶対位置ピクセル座標でスコアボードを画面最前面に描画！(極限ピクセル＆coin1固定版)
 */
function drawScoreBoard() {
    if (typeof canvas === 'undefined') return;

    // ─────────────────────────────────────────────────────────────
    // 💡 1行目：上から24pxの位置（文字の高さ8pxを引いた Y=16 をベースに配置お！）
    // ─────────────────────────────────────────────────────────────
    
    // 👑【ターゲット仕様！】いまどっちのターンかによって、名前を白文字でリアルタイムトグル差し替えおぶ！！！ｗｗｗ
    const currentNameLabel = (window.currentPlayerNumber === 1) ? "MARIO" : "LUIGI";
    drawScoreText(currentNameLabel, 24, 16);

    // 『WORLD』（5文字）：絶対座標 144px
    drawScoreText("WORLD", 144, 16);

    // 『TIME』（4文字）：絶対座標 200px
    drawScoreText("TIME", 200, 16);

    // ─────────────────────────────────────────────────────────────
    // 💡 2行目：1行目の文字の下端（Y=24）にピッタリ密着させた段お！
    // ─────────────────────────────────────────────────────────────

    // 『000000』（スコア6桁）：左から24px（MARIOの頭と縦ラインを完全同期！）
    const scoreStr = String(window.score).padStart(6, '0');
    drawScoreText(scoreStr, 24, 24);

    // ─── 🪙 【新設：コインアイコンの完全同期カラーアニメーションパッチ】 ───
    // 💡 ブロックや単体コインのハテナアニメーションと100%同じ周期（8フレームごとに6ステップ）を完全再現お！！！
    const coinAnimStep = Math.floor(globalFrameCounter / 8) % 6;
    
    // 👑【本家実機シンクロテーブル】
    // パターン0,1,2で徐々に細くなり、3で極細(coin3)、4でまた戻り始める最高の回転ループだお！
    const coinPattern = new Array('coin1', 'coin1', 'coin1', 'coin2', 'coin3', 'coin2');
    const currentCoinSpriteKey = coinPattern[coinAnimStep];
    
    // 一時的に scoreSprites['coin'] を、今のアニメーションスプライト（coin1〜3）に強制差し替え！
    if (scoreSprites[currentCoinSpriteKey]) {
        scoreSprites['coin'] = scoreSprites[currentCoinSpriteKey];
    }

    // 『🪙×00』（コイン2桁）：左から88px
    const coinStr = "\$x" + String(window.coins).padStart(2, '0');
    drawScoreText(coinStr, 88, 24);

    // 『1-1』（ステージ名）：絶対座標 152px（WORLDの下に綺麗に収まるお！）
    drawScoreText(window.stageName, 152, 24);

    // 『400』（残りタイム3桁）：絶対座標 208px
    // 👑【本家実機仕様再現！】タイトル画面（ゲームを始める前）は残り秒数を書かず、空白にするおぶ！！！ｗｗｗ
    if (window.isTitleScreen) {
        drawScoreText("   ", 208, 24); // 空白3文字で数字を非表示お！
    } else {
        const timeStr = String(window.gameTime).padStart(3, '0');
        drawScoreText(timeStr, 208, 24);
    }
}
