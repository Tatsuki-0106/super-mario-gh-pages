// =================================================================
// 🎮 player.js 【パート1】: 入力システム ＆ グラフィックロード
// =================================================================

// ==========================================
// 1. キーボード入力管理システム
// ==========================================
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowDown: false, // 💡下キー（しゃがみ入力用だお！ｗｗ）
    KeyZ: false,      // Bボタン（Bダッシュ）
    KeyX: false,      // Aボタン（ジャンプ）
    Space: false,
    // 👑【新設！】エンターキー入力をシステムに完全開通させるためのお皿を追加おぶ！！！ｗｗｗｗｗ
    Enter: false,
    // ⏸️【大解決パッチ】Pキーの入力を格納するお皿をここに完全増設だお！！！ｗｗｗ
    KeyP: false,
    p: false,
    P: false
};

let jumpKeyWasPressed = false;

// 👑【新設！】1P・2Pそれぞれの独立したゲームパラメータ管理データを新設！
window.player1Data = { lives: 3, score: 0, coins: 0, isSuper: false, isFire: false, height: 16, stage: "1-1" };
window.player2Data = { lives: 3, score: 0, coins: 0, isSuper: false, isFire: false, height: 16, stage: "1-1" };

// 👑【新設！】1P・2Pがそれぞれ現在のステージをクリアしたかどうかの実機フラグお！
window.isPlayer1Cleared = false;
window.isPlayer2Cleared = false;

// 👑【新設！】いまどっちがプレイ中かを管理（1: 1Pマリオ / 2: 2Pルイージ）
window.currentPlayerNumber = 1;


window.addEventListener('keydown', (e) => {
    if (keys[e.code] !== undefined) {
        // 👑【新設：Bボタン単発押しトリガー！】
        // KeyZが「前フレームで押されておらず、今たった今押された瞬間」であり、かつファイアマリオ状態なら、ファイアボール射出関数を即キックおぶ！！！
        if (e.code === 'KeyZ' && !keys['KeyZ']) {
            if (typeof shootFireball === 'function') {
                shootFireball();
            }
        }
        keys[e.code] = true;
    }
    
    // ✨【大核心追尾】KeyPが押されたら、pause.jsが読み込める形式（小文字・大文字キー）も一緒に完全同期お！！！
    if (e.code === 'KeyP') {
        keys['p'] = true;
        keys['P'] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (keys[e.code] !== undefined) keys[e.code] = false;
    
    // ✨【大核心追尾】KeyPが離されたら、ポーズ用フラグも即座に安全にゼロ解除お！！！
    if (e.code === 'KeyP') {
        keys['p'] = false;
        keys['P'] = false;
    }
});


// ==========================================
// 🖼️ スプライトテクスチャアセット管理
// ==========================================
const marioSprites = {
    // ─── チビマリオ ───
    idle: new Image(),
    run1: new Image(),
    run2: new Image(),
    run3: new Image(),
    brake: new Image(),
    jump: new Image(),
    climb1: new Image(),
    climb2: new Image(),

    // ─── 中間形態（変身中専用） ───
    half: new Image(),

    // ─── スーパーマリオ（デカ） ───
    super_idle: new Image(),
    super_run1: new Image(),
    super_run2: new Image(),
    super_run3: new Image(),
    super_brake: new Image(),
    super_jump: new Image(),
    super_squat: new Image(),
    super_climb1: new Image(),
    super_climb2: new Image(),
    super_throw: new Image()
};

// ソースの指定（これにより onload が発火します）
marioSprites.idle.src = 'sprite/player/mario_idle.png';
marioSprites.run1.src = 'sprite/player/mario_run_1.png';
marioSprites.run2.src = 'sprite/player/mario_run_2.png';
marioSprites.run3.src = 'sprite/player/mario_run_3.png';
marioSprites.brake.src = 'sprite/player/mario_brake.png';
marioSprites.jump.src = 'sprite/player/mario_jump.png';
marioSprites.climb1.src = 'sprite/player/player_climb1.png';
marioSprites.climb2.src = 'sprite/player/player_climb2.png';

// 🍄 中間＆スーパーマリオの画像読み込みお！
marioSprites.half.src = 'sprite/player/half_mario.png';
marioSprites.super_idle.src = 'sprite/player/super_idle.png';
marioSprites.super_run1.src = 'sprite/player/super_run_1.png';
marioSprites.super_run2.src = 'sprite/player/super_run_2.png';
marioSprites.super_run3.src = 'sprite/player/super_run_3.png';
marioSprites.super_brake.src = 'sprite/player/super_brake.png';
marioSprites.super_jump.src = 'sprite/player/super_jump.png';
marioSprites.super_squat.src = 'sprite/player/super_squat.png';
marioSprites.super_climb1.src = 'sprite/player/super_climb1.png';
marioSprites.super_climb2.src = 'sprite/player/super_climb2.png';


// ─── ⚡【追加パッチ】指定アセット（swim2）の動的ロードおぶ！！！ ───
marioSprites.swim2 = new Image();
marioSprites.swim2.src = 'sprite/player/mario_swim2.png';       // 3 = チビ泳ぎ2

marioSprites.super_swim2 = new Image();
marioSprites.super_swim2.src = 'sprite/player/super_swim2.png'; // 2 = デカ泳ぎ

// 🍄 スプライトアセット管理の末尾あたりに追加お！
marioSprites.death = new Image();
marioSprites.death.src = 'sprite/player/mario_death.png'; // 💀 死亡ポーズ


// =================================================================
// 🎮 player.js 【パート2】: オブジェクト初期パラメータ ＆ 変身システム
// =================================================================

const player = {
    x: 41,          
    y: 192,         
    width: 16,      
    height: 16,     // チビ時は16、デカ時は32/24に可変するお！
    
    // 👑【新設！】自分が「マリオ」か「ルイージ」かを見分けるアイデンティティを追加！
    characterType: 'mario', // 'mario' または 'luigi'
    
    // 👑【新設！】スターを獲得したときの無敵パレットスイッチフラグだお！！！
    isInvincible: false, 
    
    // ─── 物理パラメータ（本家NES準拠） ───
    vx: 0,                                   
    accWalk: 0.037,         
    accDash: 0.055,         
    decel: 0.037,           
    skidDecel: 0.156,       
    vy: 0,                  
    isGrounded: true,       
    
    // ─── アニメーション管理用パラメータ ───
    direction: 1,           // 1: 右向き / -1: 左向き
    animCounter: 0,         // アニメーションタイマー（速度に比例して進む）
    currentSprite: marioSprites.idle, // 現在表示する画像オブジェクト
    isSkidding: false,      // 現在急ブレーキ中かどうかのフラグ
    
    // ─── ⏳ パワーアップ状態・変身モーション管理 ───
    isSuper: false,         // 現在スーパーマリオ（デカ）かどうかのフラグ
    isTransforming: false,  // 変身アニメーション中のロックフラグ
    transformTimer: 0,      // 変身用フレームカウンター
    transformFrameBuffer: 0,// デルタタイム補正用バッファ

    // 👑【新設！】ファイアフラワー獲得時の虹色カラー点滅ロックフラグ一式おぶ！！！ｗｗｗ
    isFlowerTransforming: false,
    flowerTransformTimer: 0,
    flowerTransformFrameBuffer: 0,

    // 👑【新設！】現在ファイアマリオ形態（白赤パレット）かどうかの絶対固定管理フラグだお！！！
    isFire: false,

    // ─── ⏳ 【追加】ダメージ被弾時（デカ→チビ）のアニメーション管理用タイマー ───
    isDamaged: false,       // ダメージモーション中ロックフラグお！
    damageTimer: 0,         // 0〜80フレームまで進むメインカウンター
    damageFrameBuffer: 0,   // デルタタイム小数点補正用バッファ

    playerState: 0x08,      // 0x08:通常、0x03:土管降下、0x06:土管せり上がり、0x09:一時停止、0x0A:下降
    postFlipTimer: 0, // 💥【新設！】左右反転してから飛び降りるまでの16フレームカウンターだお！
    
    // ─── 🧱 マップの特定座標のブロック（属性）をチェックするヘルパー関数 ───
    isSolid: function(px, py) {
        if (px < 0 || px >= MAP_WIDTH * TILE_SIZE) return true;
        if (py < 0) return false; 
        if (py >= MAP_HEIGHT * TILE_SIZE) return false;

        const col = Math.floor(px / TILE_SIZE);
        const row = Math.floor(py / TILE_SIZE);

        if (!tileMap[row] || tileMap[row][col] === undefined) return false;
        
        const tileType = tileMap[row][col];

        // 👑【透明な壁バグ＆エネミー消滅バグを完全同時粉砕する最終調停パッチ！】
        // ① 空気(0)やコイン(30)、お城パーツ(81~86)は常に100%すり抜けさせるお！
        if (tileType === 0 || tileType === 30 || tileType === 222 || (tileType >= 81 && tileType <= 86)) {
            return false;
        }
        
        // ② エネミーの配置データ（50, 60, 61）に「マリオ自身」が直接ぶつかった時は、透明なブロック化を防ぐため絶対すり抜け（false）にするお！
        // ただし、画面外で敵が湧くための接地チェックの時は、そのマスの『下にある本物の床』を読ませたいので、ここはスルーさせるおぶ！！！
        if (tileType === 50 || tileType === 60 || tileType === 61) {
            // チェックしている座標がマリオの体の範囲内（ぶつかっている最中）なら、硬い壁じゃないので false！
            if (px >= this.x && px <= this.x + this.width && py >= this.y && py <= this.y + this.height) {
                return false;
            }
            // 敵の自動スポーンチェックの時は、床の有無を調べるために一歩進んで「そのマスの下の空気（0）」として扱わせないようにするお！
            return false; 
        }
        
        // 🧱 地面(1)やレンガ(2)、硬いブロック(4)などの本物の地形だけをソリッドとして返す最高の設計お！
        return tileType > 0; 
    },


    // ─── 🍄 キノコに触れた時のトリガー関数 ───
    triggerPowerUp: function() {
        if (this.isTransforming) return; 
        this.isTransforming = true;
        this.transformTimer = 0;
        this.transformFrameBuffer = 0;
        this.transformBaseY = this.y; 
        this.vx = 0; 
        playSE('powerup'); 
    },
    
    // ─── 毎フレームのパワーアップ変身アニメーションアップデート ───
    updateTransform: function(dtModifier) {
        this.transformFrameBuffer += dtModifier;
        
        while (this.transformFrameBuffer >= 1) {
            this.transformFrameBuffer -= 1;
            this.transformTimer++;

            const step = Math.floor(this.transformTimer / 3);

            if (this.transformTimer >= 39) {
                this.isTransforming = false;
                this.isSuper = true;
                this.height = 32; 
                this.y = this.transformBaseY - 16; 
                break;
            }

            switch(step) {
                case 0:  this.height = 16; this.y = this.transformBaseY; this.currentSprite = marioSprites.idle; break;
                case 1:  this.height = 24; this.y = this.transformBaseY - 8; this.currentSprite = marioSprites.half; break;
                case 2:  this.height = 16; this.y = this.transformBaseY; this.currentSprite = marioSprites.idle; break;
                case 3:  this.height = 24; this.y = this.transformBaseY - 8; this.currentSprite = marioSprites.half; break;
                case 4:  this.height = 16; this.y = this.transformBaseY; this.currentSprite = marioSprites.idle; break;
                case 5:  this.height = 24; this.y = this.transformBaseY - 8; this.currentSprite = marioSprites.half; break;
                case 6:  this.height = 32; this.y = this.transformBaseY - 16; this.currentSprite = marioSprites.super_idle; break;
                case 7:  this.height = 16; this.y = this.transformBaseY; this.currentSprite = marioSprites.idle; break;
                case 8:  this.height = 24; this.y = this.transformBaseY - 8; this.currentSprite = marioSprites.half; break;
                case 9:  this.height = 32; this.y = this.transformBaseY - 16; this.currentSprite = marioSprites.super_idle; break;
                case 10: this.height = 16; this.y = this.transformBaseY; this.currentSprite = marioSprites.idle; break;
                case 11: this.height = 24; this.y = this.transformBaseY - 8; this.currentSprite = marioSprites.half; break;
                case 12: this.height = 32; this.y = this.transformBaseY - 16; this.currentSprite = marioSprites.super_idle; break;
            }
        }
    },

    // ─── 🌸【新設！】ファイアフラワーに触れた時のロック起動トリガー ───
    triggerFlowerPowerUp: function() {
        if (this.isFlowerTransforming || this.isTransforming) return; 
        this.isFlowerTransforming = true;
        this.flowerTransformTimer = 0;
        this.flowerTransformFrameBuffer = 0;
        this.vx = 0; // 物理慣性を完全固定ロック！
        if (typeof playSE === 'function') playSE('powerup'); 
    },
    
    // ─── 🌸【新設！】毎フレームのフラワー虹色変身パレットアップデート（40F固定） ───
    updateFlowerTransform: function(dtModifier) {
        this.flowerTransformFrameBuffer += dtModifier;
        
        while (this.flowerTransformFrameBuffer >= 1) {
            this.flowerTransformFrameBuffer -= 1;
            this.flowerTransformTimer++;

            // 💡 ぴったり40フレーム経過したら虹色タイムラインを解除して通常操作へ復帰！
            if (this.flowerTransformTimer >= 40) {
                this.isFlowerTransforming = false;
                this.isSuper = true; // デカ状態を維持
                
                // 👑【大核心覚醒！】フラワー変身が終わったので、ファイアマリオ形態フラグをガツンとON！！！
                this.isFire = true; 
                
                this.playerState = 0x08; // 通常フリー状態へ完全復帰お！
                
                // フォルダパスをファイア（fire/）にすり替え更新するためにリフレッシュ関数を即キックおぶ！！！
                if (typeof refreshPlayerSpriteFolders === 'function') {
                    refreshPlayerSpriteFolders();
                }
                break;
            }

            // 👑【本家実機ウェイト再現パッチ！】4フレームが経過するまでは同じパレット色をガチッと維持！
            // 💡 経過フレーム（timer）を 4 で割って小数点以下を切り捨てる（Math.floor）ことで、4Fごとにカチッと次の色へシフトお！
            const currentStep = Math.floor(this.flowerTransformTimer / 4);
            const colorIndex = currentStep % 4;
            
            let folderFolder = '';
            if (colorIndex === 0) folderFolder = '';
            if (colorIndex === 1) folderFolder = 'color1/';
            if (colorIndex === 2) folderFolder = 'color2/';
            if (colorIndex === 3) folderFolder = 'color3/';

            const fullPath = 'sprite/player/' + folderFolder;

            // メモリ上の全アセット参照パスを爆速一斉すり替えおぶ！！！
            if (typeof marioSprites !== 'undefined') {
                if (marioSprites.super_idle)  marioSprites.super_idle.src  = fullPath + 'super_idle.png';
                if (marioSprites.super_run1)  marioSprites.super_run1.src  = fullPath + 'super_run_1.png';
                if (marioSprites.super_run2)  marioSprites.super_run2.src  = fullPath + 'super_run_2.png';
                if (marioSprites.super_run3)  marioSprites.super_run3.src  = fullPath + 'super_run_3.png';
                if (marioSprites.super_brake) marioSprites.super_brake.src = fullPath + 'super_brake.png';
                if (marioSprites.super_throw) marioSprites.super_throw.src = fullPath + 'super_throw.png';
                if (marioSprites.super_jump)  marioSprites.super_jump.src  = fullPath + 'super_jump.png';
            }
            
            // 現在の表示グラフィックをデカ立ちポーズにジャスト固定お！
            this.currentSprite = marioSprites.super_idle;
        }
    },

    // ─── ⚡ デカからチビになる時の被弾ダメージ ＆ チビ死亡シークエンス起動トリガー ───
    triggerDamage: function() {
        // すでに死亡中（0x03）や変身中は多重発動を鉄壁ガード！
        if (this.playerState === 0x03 || this.isTransforming) return; 

        // 👑【本家FC実機完全準拠・一撃チビ化パッチ！】
        // 💡 もし現在ファイアマリオ（isFire）だったとしても、容赦なくその場でファイアフラグを即座に大粉砕解除！
        if (this.isFire) {
            this.isFire = false;

            // 👑【新設大同期パッチ！】
            // 💡 フラグが折れたまさにその1フレームでリフレッシュ関数を即座に大キック！！！
            // 💡 これにより、縮みアニメーションが始まる瞬間に、画像パスが「fire/」から通常の「赤青」へ最速リロードされるおぶ！！！
            if (typeof refreshPlayerSpriteFolders === 'function') {
                refreshPlayerSpriteFolders();
            }
        }

        // 💡 あとはファイアだろうが通常のデカだろうが、等しくあの「1➔2➔3➔2➔3➔2」のチビ化縮小タイムラインへ完全幽閉おぶ！！！
        if (this.isSuper) {
            this.isDamaged = true;
            this.damageTimer = 0;
            this.damageFrameBuffer = 0;
            this.vx = 0; 
            this.invincibleTimer = 150; // 被弾後の150F（2.5秒）点滅無敵カウンターを起動！ [13]
            if (typeof playSE === 'function') playSE('pipepowerdown'); // シュルルル…と縮む音
        } else {
            // 💥【ここを大核心修正お！！！】チビマリオの時は、実機ステート「0x03（死亡アニメモード）」へ突入！！！
            this.playerState = 0x03; 
            this.vx = 0; 
            this.vy = 0; // 慣性を完全抹殺してX軸を固定！
            this.currentSprite = marioSprites.death; // 画像を死亡ポーズに固定お！
            
            // 💥【永久無敵バグ完全粉砕パッチ！】
            // 死亡が確定した瞬間に、それまで残っていた無敵タイマーを鉄壁の「0」に完全初期化おぶ！！！ｗｗｗ
            this.invincibleTimer = 0;
            
            // 💀 死亡アニメーション専用のカウンタを確実にリセットして多重暴発を防ぐお！
            this.deathTimer = 0;
            this.deathFrameBuffer = 0;
            this.deathJumpTriggered = false; // まだ跳ね上がっていないフラグ
            
            // 💥【超重要！】被弾モーション中（isDamaged）や他のフラグを完全にへし折ってロックするおぶ！
            this.isDamaged = false;
            this.isTransforming = false;
            
            // 🎵 BGMを即座に止めて、死亡SE「チャラララーンラン…」を爆音再生お！！！
            if (typeof stopAllBGM === 'function') stopAllBGM();
            if (typeof playSE === 'function') playSE('death');
            
            console.log("💀 💀 【マリオ死亡】チビマリオが敵に激突！30マスの静止タイムラインを起動したおぶ！！！");
        }
    },


    // ─── 🔄【無敵タイマー保護＆完全接地吸着版】1→2→3→2→3→2 Rogic 完全再現 ───
    updateDamage: function(dtModifier) {
        this.damageFrameBuffer += dtModifier;
        
        while (this.damageFrameBuffer >= 1) {
            this.damageFrameBuffer -= 1;
            this.damageTimer++;

            // 💥【ここを修正】ダメージモーション中も無敵タイマー（150）を安全にデクリメント
            if (this.invincibleTimer > 0) {
                this.invincibleTimer -= 1;
                if (this.invincibleTimer < 0) this.invincibleTimer = 0;
            }

            const t = this.damageTimer;

            if (t > 40) {
                this.isDamaged = false;
                this.isSuper = false;    // 完全にチビマリオへ移行確定お！
                this.height = 16;        // 身長をチビの16pxに固定
                this.playerState = 0x08; // 通常フリー操作状態へ復帰おぶ！
                // ❌【大バグ抹殺！】ここでタイマーを0にリセットしていたコードを完全撤去したおぶ！！！
                break;
            }

            // 💡【核心】現在のステップ処理が走る「直前」の足元Y座標（絶対接地ライン）をパチッと記憶！
            const currentFootY = this.y + this.height;

            // 👑 ユーザー指定タイムラインスケジュールをミリ秒の狂いなくベイク！
            if (t <= 8) {
                this.height = 32; this.currentSprite = marioSprites.super_jump;
            } else if (t <= 12) {
                this.height = 32; this.currentSprite = marioSprites.super_swim2;
            } else if (t <= 16) {
                this.height = 16; this.currentSprite = marioSprites.swim2;
            } else if (t <= 20) {
                this.height = 32; this.currentSprite = marioSprites.super_swim2;
            } else if (t <= 24) {
                this.height = 16; this.currentSprite = marioSprites.swim2;
            } else if (t <= 28) {
                this.height = 32; this.currentSprite = marioSprites.super_swim2;
            } else if (t <= 32) {
                this.height = 16; this.currentSprite = marioSprites.swim2;
            } else if (t <= 36) {
                this.height = 32; this.currentSprite = marioSprites.super_swim2;
            } else {
                this.height = 16; this.currentSprite = marioSprites.swim2;
            }

            // 💥サイズ可変後に、記憶しておいた接地ラインから「新しい身長」を逆算してY座標を補正！
            this.y = currentFootY - this.height;
        }
    },

    // =================================================================
    // 🎮 player.js 【パート3】: 核心移動ロジック ＆ ゴール等速下降制御
    // =================================================================
    
    // =================================================================
    // 🎮 player.js 【パート3】: 核心移動ロジック ＆ ゴール等速下降制御（空中ワープバグ完全抹殺版）
    // =================================================================
    
    // ─── 毎フレームの計算メインエンジン ───
    update: function(dtModifier = 1.0) {
        
        // ─── 👑【新設！】10秒（600F）スーパースター無敵効果時間 ＆ BGM引き戻しエンジン ───
        if (this.isInvincible) {
            // 最初の一歩でタイマーがお皿にない場合は、実機値 600（10秒）をガツンとチャージ！
            if (this.starInvincibleTimer === undefined) {
                this.starInvincibleTimer = 600;
            }

            // 毎フレーム、デルタタイム補正付きで安全にカウントダウン
            this.starInvincibleTimer -= dtModifier;

            if (this.starInvincibleTimer <= 0) {
                // ⏰ 10秒経過！無敵モード完全タイムアップ！
                this.isInvincible = false;
                this.starInvincibleTimer = undefined;

                // ① パレットフォルダを「通常（空文字）」へ強制引き戻しリロード！
                if (typeof refreshPlayerSpriteFolders === 'function') {
                    refreshPlayerSpriteFolders();
                }

                // ② 🎵 無敵BGM（star.mp3）をピタッと消音・リセットおぶ！！！
                if (typeof bgm !== 'undefined' && bgm.star) {
                    bgm.star.pause();
                    bgm.star.currentTime = 0;
                }

                // ③ 現在のステージ（地下マップの一時退避参照など）を判別し、通常のステージBGMへ安全に復帰再生！
                if (typeof startBGM === 'function') {
                    if (window.originalOverworldMapRef || (typeof currentStageType !== 'undefined' && currentStageType === 'underground')) {
                        startBGM('underground');
                    } else {
                        startBGM('overworld');
                    }
                }
                console.log("⏰ ⏰ 【無敵タイムアップ】10秒が経過！通常マリオ ＆ ステージBGMへ安全に復帰したおぶ！！！");
            }
        }

        // 👑 スター無敵状態の時は、毎フレームのパレット更新を呼び出し
        if (this.isInvincible && typeof refreshPlayerSpriteFolders === 'function') {
            refreshPlayerSpriteFolders();
        }
        
        // 💥【ここを一番上に引っ越しお！！！】
        if (!this.isDamaged && this.invincibleTimer !== undefined && this.invincibleTimer > 0) {
            this.invincibleTimer -= dtModifier;
            if (this.invincibleTimer < 0) this.invincibleTimer = 0;
        }
        
        // ─── 💀【本家完全再現：実機ステート0x03 死亡放物線タスク】───
        if (this.playerState === 0x03) {
            this.vx = 0; // 【実機仕様】ダッシュの慣性を完全抹殺！X座標をガチガチに固定！
            
            this.deathFrameBuffer += dtModifier;
            while (this.deathFrameBuffer >= 1) {
                this.deathFrameBuffer -= 1;
                this.deathTimer++;
                
                const dt = this.deathTimer;
                
                // 👑 ─── 【大核心条件分岐！ 穴落ち死の時はお空へ跳ね上がらせないお！！！】 ───
                if (this.isPitDeath) {
                    // 💡 30Fの静止も大ジャンプも一切なし！ 最初から下方向へ毎フレーム重力を足して真っ逆さまに落とすお！
                    this.vy += 0.2; 
                    if (this.vy > 5.0) this.vy = 5.0; // 最大落下速度ガード
                } else {
                    // 🔽 通常の敵激突死の時は、今まで通り30F静止 ➔ お空へ大跳ね上がり！
                    if (dt <= 30) {
                        this.vy = 0;
                    } else {
                        if (!this.deathJumpTriggered) {
                            this.vy = -5.0; // 初速
                            this.deathJumpTriggered = true;
                            console.log("🦘 【死亡ジャンプ】30Fの静止が解除！初速 -5px でお空へ飛び出したお！！！");
                        }
                        this.vy += 0.2; // 重力加速度
                        if (this.vy > 5.0) this.vy = 5.0; 
                    }
                }
                
                // ─── 💥【ターゲット仕様：360フレーム（6秒）へ完全書き換えお！！！】───
                // 💡 敵に激突した瞬間からの経過時間がぴったり「360フレーム（6秒）」になったら大復活をキック！
                if (dt >= 240) {
                    console.log("⏰ 敵に激突した瞬間からきっかり360フレーム（6秒）が経過！暗転・大復活おぶ！！！ｗｗｗ");
                    this.playerState = 0x08; // 通常状態に戻してから
                    if (typeof respawnPlayer === 'function') {
                        respawnPlayer(); // 大復活処理をキック！
                    }
                    return;
                }
            }
            
            // 毎フレームのY座標移動（死亡用は壁・地面判定を100%全スルーしてすりぬけるお！）
            this.y += this.vy * dtModifier;
            
            // 💥【大核心パッチ！】360フレーム待っている間にマリオのY座標が270を超えて画面外に落ちると、
            // main.js側の「奈落落ち判定」が勝手に反応してフライング復活しちゃうバグを鉄壁防御お！！！
            // 画面底（240px辺り）を通過したら、自動リスタートを阻止するためY座標の低下をピタッと止めるおぶ！！！ｗｗｗ
            if (this.y > 250) {
                this.y = 250;
            }
            
            return; // 💀 死亡中はこれより下の通常移動やキー入力を100%鉄壁遮断ガードおぶ！！！
        }


        // 💥【新設のステルス特効パッチ！】お城のドア（86）に入りきって消滅状態なら、すべての物理更新を完全停止ガード！
        if (this.vanished) {
            this.vx = 0; this.vy = 0;
            return;
        }

        // 👑【新設！】お城のドア（ID: 86：黒）との接触を常に先回りチェックおぶ！
        // マリオの現在の中心座標から、触れているタイルの行と列を割り出すお！
        const checkCol = Math.floor((this.x + this.width / 2) / TILE_SIZE);
        const checkRow = Math.floor((this.y + this.height - 4) / TILE_SIZE); // 足元付近の高さで判定

        if (tileMap[checkRow] && tileMap[checkRow][checkCol] === 86) {
            if (!this.vanished) {
                this.vanished = true; // 💥マリオ姿消去フラグをON！！！
                this.vx = 0; this.vy = 0; // 慣性を完全抹殺

                console.log("👑 タイムライン達成：マリオがお城のドア（ID: 86）に完全に吸い込まれて消滅したおぶ！！！ｗｗｗｗ");
                
                // 🔊 必要に応じて、ここでステージクリアファンファーレSEなどを一発キックだお！
                if (typeof stopAllBGM === 'function') stopAllBGM();
                // if (typeof playSE === 'function') playSE('stage_clear_se'); など！
            }
            return;
        }

        // 🔽 縦土管降下中（0x33に完全避難お！）のロック
        if (this.playerState === 0x33) { // 💥ここを 0x33 に書き換え！
            if (this.isSuper) {
                this.currentSprite = marioSprites.super_squat; 
                if (this.height === 32) { this.height = 24; this.y += 8; }
            } else {
                this.currentSprite = marioSprites.idle;        
            }
            return; 
        }

        
        // 💥 地上土管せり上がり中（0x06）の通常物理ガードロジックお！
        if (this.playerState === 0x06) {
            this.vx = 0; this.vy = 0;
            const runFrame = Math.floor(this.animCounter) % 3;
            if (this.isSuper) {
                if (runFrame === 0) this.currentSprite = marioSprites.super_run1;
                else if (runFrame === 1) this.currentSprite = marioSprites.super_run2;
                else this.currentSprite = marioSprites.super_run3;
            } else {
                if (runFrame === 0) this.currentSprite = marioSprites.run1;
                else if (runFrame === 1) this.currentSprite = marioSprites.run2;
                else this.currentSprite = marioSprites.run3;
            }
            return;
        }
        
        // ==========================================
        // ⏳ パワーアップ変身中なら別ロジックへ委託
        // ==========================================
        if (this.isTransforming) {
            this.updateTransform(dtModifier);
            return;
        }

        // 👑【新設！】フラワー虹色トグル中なら、物理や入力を完全遮断して専用処理へ割り込み委託！
        if (this.isFlowerTransforming) {
            this.updateFlowerTransform(dtModifier);
            return;
        }

        // ==========================================
        // ⚡【追加】ダメージモーション中はキー入力や重力を鉄壁遮断ガード！
        // ==========================================
        if (this.isDamaged) {
            this.updateDamage(dtModifier);
            return;
        }

        // ==========================================
        // 🦘 【縦方向：ジャンプ＆重力】
        // ==========================================
        const jumpPressed = keys.KeyX || keys.Space; 
        const absVx = Math.abs(this.vx);             
        
        if (this.isGrounded && jumpPressed && !jumpKeyWasPressed) {
            this.vy = (absVx >= 2.0) ? -5.0 : -4.0;
            this.isGrounded = false; 
            if (this.isSuper) playSE('jump'); else playSE('jumpsmall');  
        }
        jumpKeyWasPressed = jumpPressed;
        
        if (!this.isGrounded) {
            let gravity = 0;
            if (this.vy < 0 && jumpPressed) {
                gravity = (absVx >= 2.0) ? (0x28 / 256) : (0x20 / 256);
            } else {
                gravity = 0x70 / 256; 
            }
            this.vy += gravity * dtModifier;
            if (this.vy > 4.5) this.vy = 4.5;
        }

        // ==========================================
        // 🏃‍♂️ 【横方向：地上移動 ＆ 急ブレーキ ＆ しゃがみ可変】
        // ==========================================
        let maxSpeed = keys.KeyZ ? 2.5 : 1.5;
        const accModifier = this.isGrounded ? 1.0 : 0.5;
        const currentAcc = (keys.KeyZ ? this.accDash : this.accWalk) * accModifier;
        const currentSkid = this.skidDecel * accModifier;

        this.isSkidding = false; 

        if (this.isSuper) {
            if (this.isGrounded && keys.ArrowDown) {
                if (this.height === 32) { this.height = 24; this.y += 8; }
            } else if (this.height === 24) {
                const checkHeadY = this.y - 8; 
                const footMargin = 2;
                if (this.isSolid(this.x + footMargin, checkHeadY) || this.isSolid(this.x + this.width - footMargin, checkHeadY)) {
                    // 天井がある場合は維持
                } else {
                    this.height = 32; this.y -= 8;
                }
            }
        }

        if (this.isSuper && this.height === 24 && this.isGrounded) {
            if (this.vx > 0) { this.vx -= this.decel * dtModifier; if (this.vx < 0) this.vx = 0; }
            else if (this.vx < 0) { this.vx += this.decel * dtModifier; if (this.vx > 0) this.vx = 0; }
        } else {
            if (keys.ArrowRight) {
                if (this.vx < 0) { if (this.isGrounded) this.isSkidding = true; this.vx += currentSkid * dtModifier; }
                else if (this.vx < maxSpeed) { this.vx += currentAcc * dtModifier; if (this.vx > maxSpeed) this.vx = maxSpeed; }
                else if (!keys.KeyZ && this.vx > maxSpeed) { this.vx -= this.decel * dtModifier; if (this.vx < maxSpeed) this.vx = maxSpeed; }
            } else if (keys.ArrowLeft) {
                if (this.vx > 0) { if (this.isGrounded) this.isSkidding = true; this.vx -= currentSkid * dtModifier; }
                else if (this.vx -maxSpeed) { this.vx -= currentAcc * dtModifier; if (this.vx < -maxSpeed) this.vx = -maxSpeed; }
                else if (!keys.KeyZ && this.vx < -maxSpeed) { this.vx += this.decel * dtModifier; if (this.vx > -maxSpeed) this.vx = -maxSpeed; }
            } else {
                if (this.isGrounded) {
                    if (this.vx > 0) { this.vx -= this.decel * dtModifier; if (this.vx < 0) this.vx = 0; }
                    else if (this.vx < 0) { this.vx += this.decel * dtModifier; if (this.vx > 0) this.vx = 0; }
                }
            }        
        }

        // ─── 🏁【ガタつき完全消滅核心パッチ】ゴールタスク中は、通常の壁判定や地面物理をスキップ！ ───
        // 1️⃣ 【状態0x09】ゴールに触れた瞬間の一時停止フレーム
        if (this.playerState === 0x09) {
            this.vx = 0; this.vy = 0; // 慣性を完全リセット！
            this.playerState = 0x0A;   // 即座に次のフレームから下降フェーズへ移行！
            return; 
        }

        // 2️⃣ 【状態0x0A】一時停止が解除され、+8pxを維持したまま毎フレーム2pxで安全に等速下降おぶ！
        if (this.playerState === 0x0A) {
            this.vx = 0; this.vy = 0; 

            // 💥スーパーマリオ状態なら、チビの位置から16px引き上げた高さを目標にするおぶ！！！
            const targetY = 11 * TILE_SIZE - (this.isSuper ? 16 : 0);
            
            if (this.y < targetY) {
                this.y += 2.0 * dtModifier; 

                this.animCounter += dtModifier;
                const climbFrame = Math.floor(this.animCounter / 4) % 2;

                if (this.isSuper) {
                    this.currentSprite = (climbFrame === 0) ? marioSprites.super_climb1 : marioSprites.super_climb2;
                } else {
                    this.currentSprite = (climbFrame === 0) ? marioSprites.climb1 : marioSprites.climb2;
                }
            } else {
                this.y = targetY; 

                if (typeof goalPoleFlag !== 'undefined' && goalPoleFlag.isInitialized && goalPoleFlag.isFinished) {
                    
                    // 📊 デバッグ用：毎フレームこの条件を通過している時の状態を追跡！
                    if (this.postFlipTimer === undefined || this.postFlipTimer === 0) {
                        
                        // ─── 🔍 ここでコンソールに現在のマリオのX座標と状態を書き出すお！ ───
                        console.log(`[🔍デバッグ開始] 1回目の16px移動直前！現在のマリオの絶対X座標: ${this.x}`);

                        this.direction = -1; 
                        this.x += 16;        
                        this.postFlipTimer = 0.001; 

                        console.log(`[🔍デバッグ完了] 1回目の16px移動直後！現在のマリオの絶対X座標: ${this.x}`);
                    } else {
                        // 📊 2回目が暴発しそうになった時、なぜここを通ったかを暴くログお！
                        if (this.postFlipTimer < 0.1) {
                            console.log(`[⚠️警告ログ] 移動後にタイマーが動いてるのにここを通過中！現在のタイマー値: ${this.postFlipTimer}, マリオのX: ${this.x}`);
                        }
                    }

                    this.postFlipTimer += dtModifier;

                    if (this.postFlipTimer >= 16) {
                        console.log(`[🏁飛び降りログ] 16F経過したので右下8pxへ飛び降ります！`);

                        this.x += 8; 
                        this.y += 8; 
                        this.direction = 1; 

                        const groundY = 13 * TILE_SIZE - this.height;
                        this.y = groundY;
                        this.isGrounded = true;

                        this.postFlipTimer = 0; 
                        this.playerState = 0x0B; 
                        this.goalReached = true; 
                        this.autoWalkCounter = 0; 

                        // 👑【極上クリア演出パッチ！】
                        // ポールを降りて地面に着地したまさにその瞬間に、新設したクリアファンファーレを爆音再生するおぶ！！！
                        if (typeof startBGM === 'function') {
                            startBGM('clear');
                        }

                        console.log(`[🏁着地完了ログ] 地面に着地！自動移動モード始動 ＆ クリア音楽再生おぶ！！！ｗｗｗ`);
                    } else {
                        this.currentSprite = this.isSuper ? marioSprites.super_climb1 : marioSprites.climb1;
                    }
                } else {
                    this.currentSprite = this.isSuper ? marioSprites.super_climb1 : marioSprites.climb1;
                }
            }
            return; 
        }

        // ─── 👑【本家NES完全再現】タスク0x0B：着地後の等速自動前進モード ───
        if (this.playerState === 0x0B) {
            this.vx = 0; this.vy = 0; // キー入力を完全遮断

            // ① 毎フレーム 1ピクセル の等速で右方向へ強制歩行おぶ！
            this.x += 1.0 * dtModifier;

            // 🎥【新設！】マリオの自動前進に合わせてカメラをリアルタイム右スクロール追従させるお！！！
            if (typeof cameraX !== 'undefined') {
                const targetCamX = this.x - 128; // 画面中央にマリオが来るように追従
                if (targetCamX > cameraX) {
                    cameraX = targetCamX;
                }
                const maxCameraX = 3120; 
                if (cameraX > maxCameraX) cameraX = maxCameraX;

                // 🧱 ファミコン準拠の画面外地形先回りベイク処理も連動同期させるおぶ！
                if (typeof updateVRAMBaking === 'function') {
                    updateVRAMBaking();
                }
                // 💡 画面外エネミースポーンバッファのインデックスも同期
                if (typeof lastCheckedSpawnCol !== 'undefined') {
                    lastCheckedSpawnCol = Math.floor((cameraX + 256) / TILE_SIZE);
                }
            }

            // ② 歩行アニメーションの制御（3フレーム毎にインクリメント）
            this.autoWalkCounter += 1.0 * dtModifier;
            const walkFrame = Math.floor(this.autoWalkCounter / 3) % 3;

            if (this.isSuper) {
                if (walkFrame === 0) this.currentSprite = marioSprites.super_run1;
                else if (walkFrame === 1) this.currentSprite = marioSprites.super_run2;
                else this.currentSprite = marioSprites.super_run3;
            } else {
                if (walkFrame === 0) this.currentSprite = marioSprites.run1;
                else if (walkFrame === 1) this.currentSprite = marioSprites.run2;
                else this.currentSprite = marioSprites.run3;
            }

            // ③ お城のドア（ID: 86）への進入判定位置チェック
            const doorCol = Math.floor((this.x + this.width / 2) / TILE_SIZE);
            const doorRow = Math.floor((this.y + this.height - 4) / TILE_SIZE);

            if (tileMap[doorRow] && tileMap[doorRow][doorCol] === 86) {
                if (!this.vanished) {
                    this.vanished = true; 
                    this.playerState = 0x0C; // 得点カウントダウンタスクへ
                    console.log("🏁 城への進入完了：マリオがドア（86）の背後に隠れたお！");
                    
                    // 👑【ファンファーレ保護パッチ！】
                    // 全音楽を止める stopAllBGM() ではなく、道中のステージBGMだけをピンポイントで安全に一時停止させるお！
                    // これでクリアファンファーレ（clear）は城に入った後も裏で最後まで綺麗に鳴り響き続けます！！！ｗｗｗ
                    if (typeof bgm !== 'undefined') {
                        if (bgm.overworld)   { bgm.overworld.pause();   bgm.overworld.currentTime = 0; }
                        if (bgm.underground) { bgm.underground.pause(); bgm.underground.currentTime = 0; }
                    }
                }
            }
            return; // 自動移動中のため、これより下の通常物理判定はスキップ
        }

        // =================================================================
        // 🧱 【地形当たり判定システム】＆【カメラ計算】＆【向きスプライト決定】
        // =================================================================
        this.x += this.vx * dtModifier; 

        const wallY = this.y + this.height - 8; 
        const wallMargin = 2; 

        if (this.vx > 0) {
            const rightPointX = this.x + this.width - wallMargin;
            if (this.isSolid(rightPointX, wallY)) {
                this.x = Math.floor(rightPointX / TILE_SIZE) * TILE_SIZE - this.width + wallMargin - 0.01; 
                this.vx = 0;
            }
        } else if (this.vx < 0) {
            const leftPointX = this.x + wallMargin;
            if (this.isSolid(leftPointX, wallY)) {
                this.x = (Math.floor(leftPointX / TILE_SIZE) + 1) * TILE_SIZE - wallMargin + 0.01;
                this.vx = 0;
            }
        }

        this.y += this.vy * dtModifier; 

        const footMargin = 2; 
        const leftCheckX = this.x + footMargin;
        const rightCheckX = this.x + this.width - footMargin;

if (this.vy >= 0) {
    const footY = this.y + this.height;
    if (this.isSolid(leftCheckX, footY) || this.isSolid(rightCheckX, footY)) {
        this.y = Math.floor(footY / TILE_SIZE) * TILE_SIZE - this.height; 
        this.vy = 0; this.isGrounded = true;

        // 💥【ここを追加お！！！】地面に足がついたので空中連続踏みコンボを0にリセット！
        this.stompCombo = 0;
    } else {
        this.isGrounded = false; 
    }
        } else if (this.vy < 0) {
            const headY = this.y;
            if (this.isSolid(leftCheckX, headY) || this.isSolid(rightCheckX, headY)) {
                if (typeof checkQuestionBlockHit === 'function') { checkQuestionBlockHit(leftCheckX, headY); checkQuestionBlockHit(rightCheckX, headY); }
                if (typeof checkBrickBlockHit === 'function') { checkBrickBlockHit(leftCheckX, headY); checkBrickBlockHit(rightCheckX, headY); }
                this.y = (Math.floor(headY / TILE_SIZE) + 1) * TILE_SIZE; this.vy = 0;
            }
        }

        // 💡 【スクロール核心】カメラ位置の計算
        if (typeof cameraX === 'undefined') window.cameraX = 0; 
        if (this.x > cameraX + 128) cameraX = this.x - 128;
        const maxCameraX = (MAP_WIDTH * TILE_SIZE) - 256; 
        if (cameraX > maxCameraX) cameraX = maxCameraX;
        if (this.x < cameraX) { this.x = cameraX; this.vx = 0; }
        if (this.x > (MAP_WIDTH * TILE_SIZE) - this.width) { this.x = (MAP_WIDTH * TILE_SIZE) - this.width; this.vx = 0; }

        // 🔄 【本家NES完全再現】カメラが現在表示している画面の「ページ番号（256px = 1ページ）」をリアルタイム更新！
        // 実機変数 0x071A（CurrentPageLoc）の挙動そのものだお！
        if (typeof cameraX !== 'undefined') {
            window.ram_0x071A = Math.floor(cameraX / 256);
        }

        // 🔄 向きの最終調停
        if (this.isSkidding) {
            if (this.vx > 0) this.direction = -1; if (this.vx < 0) this.direction = 1;
        } else {
            if (keys.ArrowRight) this.direction = 1; if (keys.ArrowLeft) this.direction = -1;
        }

        // 👑【新設！】投球モーションタイマーが残っている場合は、デルタタイム補正付きで安全にデクリメント！
        if (this.throwMotionTimer === undefined) this.throwMotionTimer = 0;
        if (this.throwMotionTimer > 0) {
            this.throwMotionTimer -= dtModifier;
            if (this.throwMotionTimer < 0) this.throwMotionTimer = 0;
        }

        // 🎬 通常状態に応じたスプライトの自動決定
        if (this.isFire && this.throwMotionTimer > 0) {
            // 👑【大核心連動！】Bボタンを叩いてから12フレームの間は、空中だろうが地上だろうが関係なし！
            // 💡 今作った「super_throw.png」のあのカッコいい投球姿にガチッと最優先で強制上書きお！！！
            this.currentSprite = marioSprites.super_throw;
        } else if (!this.isGrounded && this.playerState !== 0x05) {
            this.currentSprite = this.isSuper ? marioSprites.super_jump : marioSprites.jump;
        } else if (this.playerState === 0x05) {
            // 💡 重複していた古いジャンプ上書き行を綺麗に全カット！
            this.animCounter += 0.5 * 0.15 * dtModifier;
            const runFrame = Math.floor(this.animCounter) % 3;
            if (this.isSuper) {
                if (runFrame === 0) this.currentSprite = marioSprites.super_run1; else if (runFrame === 1) this.currentSprite = marioSprites.super_run2; else this.currentSprite = marioSprites.super_run3;
            } else {
                if (runFrame === 0) this.currentSprite = marioSprites.run1; else if (runFrame === 1) this.currentSprite = marioSprites.run2; else this.currentSprite = marioSprites.run3;
            }
        } else if (this.isSuper && this.height === 24) {
            this.currentSprite = marioSprites.super_squat;
        } else if (this.isSkidding) {
            this.currentSprite = this.isSuper ? marioSprites.super_brake : marioSprites.brake; 
        } else if (absVx > 0.01) {
            this.animCounter += absVx * 0.15 * dtModifier; 
            const runFrame = Math.floor(this.animCounter) % 3;
            if (this.isSuper) {
                if (runFrame === 0) this.currentSprite = marioSprites.super_run1; else if (runFrame === 1) this.currentSprite = marioSprites.super_run2; else this.currentSprite = marioSprites.super_run3;
            } else {
                if (runFrame === 0) this.currentSprite = marioSprites.run1; else if (runFrame === 1) this.currentSprite = marioSprites.run2; else this.currentSprite = marioSprites.run3;
            }
        } else {
            this.animCounter = 0; this.currentSprite = this.isSuper ? marioSprites.super_idle : marioSprites.idle;
        }
    },
    
    // 🏁 ゴールパーツに触れた瞬間に外部から呼ばれる、一時停止＆キーロック初期化関数おぶ！
    triggerFreezeRoutine: function() {
        // 👑【変更！】自分がタイムアップや敵激突で死んでいる（0x03）なら、ゴール一時停止への上書きを絶対拒否おぶ！！！
        if (this.playerState === 0x03 || this.playerState === 0x09 || this.playerState === 0x0A) return;

        console.log("🏁 ポールを検知！キー入力を完全無効化してその場に【一瞬だけ一時停止】させるおぶ！！！");
        
        this.playerState = 0x09; this.vx = 0; this.vy = 0;

        // 💥【吸着バグ完全修正版パッチ】ポールの「棒（91番）」がある列を絶対基準として周辺スキャン！
        const baseCol = Math.floor((this.x + this.width / 2) / TILE_SIZE);
        let poleCol = baseCol; 
        if (typeof goalPoleFlag !== 'undefined') {
            let foundStick = false;
            for (let c = baseCol - 2; c <= baseCol + 2; c++) {
                for (let r = 0; r < MAP_HEIGHT; r++) {
                    if (tileMap[r] && tileMap[r][c] === 91) { poleCol = c; foundStick = true; break; }
                }
                if (foundStick) break;
            }
            if (!foundStick) {
                for (let c = baseCol - 2; c <= baseCol + 2; c++) {
                    for (let r = 0; r < MAP_HEIGHT; r++) {
                        if (tileMap[r] && (tileMap[r][c] === 90 || tileMap[r][c] === 92)) { poleCol = c; break; }
                    }
                }
            }
            // 正しい棒のマスで旗を実体化させるおぶ！
            goalPoleFlag.init(poleCol);
        }

        // 💥 【核心・絶対吸着ロジック】
        // 触れたのが球でも旗でも関係なし！見つけ出した「棒の列（poleCol）」の中心軸にマリオを完全ロックオン！
        const poleAbsoluteX = poleCol * TILE_SIZE;
        
        // 💡 棒の左側にマリオのドットがジャストフィットする位置（実機準拠：軸から少し左に寄せる）
        this.x = poleAbsoluteX - 4; 
        
        // 💡 向きも常に右（ポール側）を向いてガッチリしがみつくお！
        this.direction = 1; 

        console.log(`🏁 棒の位置（Col: ${poleCol}）を捕捉！マリオを絶対軸 X: ${this.x} に強制吸着させたお！！！ｗｗｗｗ`);

        if (typeof keys !== 'undefined') {
            keys.ArrowLeft = false; keys.ArrowRight = false; keys.ArrowDown = false;
            keys.KeyZ = false; keys.KeyX = false; keys.Space = false;
        }

        if (typeof stopAllBGM === 'function') stopAllBGM(); 
        if (typeof playSE === 'function') playSE('flagpole'); 

        // ─── 👑【極上ゴールポールスコア自動査定パッチおぶ！！！】───
        // ポール最上部の球体パーツ（ID: 90）の絶対Y座標を基準軸として検出！
        let topBallY = 2 * TILE_SIZE; // デフォルトは2行目（32px）
        let foundBall = false;
        for (let r = 0; r < MAP_HEIGHT; r++) {
            if (tileMap[r] && tileMap[r][poleCol] === 90) {
                topBallY = r * TILE_SIZE;
                foundBall = true;
                break;
            }
        }

        // つかまった瞬間のマリオの頭位置（this.y）と球体軸との「ピクセル距離」を正確に逆算！
        const poleTouchDistance = Math.abs(this.y - topBallY);
        let poleBonusScore = 100; // 最低保証100点

        // 💡 ユーザー指定のターゲット仕様タイムラインを1ドットの狂いなくバインド！
        if (poleTouchDistance <= 32) {
            poleBonusScore = 5000;
        } else if (poleTouchDistance <= 64) {
            poleBonusScore = 2000;
        } else if (poleTouchDistance <= 96) {
            poleBonusScore = 800;
        } else if (poleTouchDistance <= 128) {
            poleBonusScore = 400;
        } else {
            poleBonusScore = 100;
        }

        // 📊 割り出したボーナス得点をゲームデータ＆フワフワシステムへドンと一括注入！
        if (typeof addScore === 'function') { addScore(poleBonusScore); }
        
        // ─── 🏁【大修正！】一番下の『91（棒）』のタイルの右隣に配置おぶ！！！ ───
        let bottomStickY = 12 * TILE_SIZE; // デフォルトは12行目（地面のすぐ上）
        
        // マップの底（下）から上に向かってスキャンして、一番下にある「91」を特定するお！
        for (let r = MAP_HEIGHT - 1; r >= 0; r--) {
            if (tileMap[r] && tileMap[r][poleCol] === 91) {
                bottomStickY = r * TILE_SIZE;
                break; // 一番下の棒が見つかったら即ループ脱出お！
            }
        }

        if (typeof spawnScoreEffect === 'function') {
            // 💡 X座標：ポールの絶対位置に 16px を足して「すぐ右隣」へ完全吸着！
            // 💡 Y座標：下から探した一番下の棒の高さ（bottomStickY）にジャスト同期！
            spawnScoreEffect(poleAbsoluteX + 16, bottomStickY, poleBonusScore);
            
            // 👑【実機完全大同期！】新設した移動フラグをONにして、旗と同じ2pxの快速でスライド上昇させるおぶ！！！ｗｗｗ
            if (activeScoreEffects && activeScoreEffects.length > 0) {
                // 今たった今追加された一番最後の効果エフェクト（末尾の配列データ）をピンポイント狙い撃ち！
                activeScoreEffects[activeScoreEffects.length - 1].isGoalScore = true;
            }
        }

        
        console.log(`🏁 ポールタッチ査定完了！一番下の棒タイル（Y: ${bottomStickY}px）の右隣に ${poleBonusScore}点 をポップアップさせたお！！！ｗｗｗ`);
    },
    
    // ─── 描画処理（150フレーム完全対応・1フレーム超高速点滅パッチ版お！） ───

    draw: function() {
        if (this.vanished) return;

        // 💥【大核心パッチ！】無敵タイマー（150から減る）が残っている間は100%パチパチさせるお！
        if (this.invincibleTimer !== undefined && this.invincibleTimer > 0) {
            // 被弾中（isDamaged）は damageTimer、自由行動に戻った後は経過フレーム(150 - invincibleTimer)を使用！
            const rawTimerValue = this.isDamaged ? this.damageTimer : (150 - this.invincibleTimer);
            
            // 💥【1フレームの超高速限界点滅へ完全固定お！！！】
            // 5での割り算を完全撤去！Math.floorで削ったフレーム数をそのまま2で割った余り（% 2）ジャッジに変更！
            // これにより、1フレーム（1画面の書き換え）ごとに「出る」「消える」が交互に爆速ループするおぶ！！！ｗｗｗ
            if (Math.floor(rawTimerValue) % 2 === 0) {
                return; // 🥷 この1フレームは姿を完全に消して、残像エフェクトを完全再現するおぶ！！！
            }
        }

        ctx.save(); 
        ctx.globalAlpha = 1.0;

        const camX = (typeof cameraX !== 'undefined') ? cameraX : 0;
        const screenX = Math.floor(this.x) - Math.floor(camX);
        const screenY = Math.floor(this.y);

        // 👑【鉄壁のフリーズガードパッチ！】
        // 💡 現在の画像（this.currentSprite）が本物のImageオブジェクトであり、かつロードが完了（complete）している時だけ安全に描画お！！！
        // これにより、もし中身が一瞬 undefined や変なデータに化けたとしても、エラー落ちして世界がフリーズするのを100%全カット遮断おぶ！！！
        if (this.currentSprite && this.currentSprite.complete) {
            if (this.direction === -1) {
                ctx.translate(screenX + this.width / 2, screenY); ctx.scale(-1, 1);
                ctx.drawImage(this.currentSprite, -this.width / 2, 0, this.width, this.height);
            } else {
                ctx.drawImage(this.currentSprite, screenX, screenY, this.width, this.height);
            }
        } else {
            // デバッグ用に、万が一画像がバグった時はログを吐いて何事もなかったかのように立ち姿（idle）で身代わりカバーお！
            if (marioSprites && marioSprites.idle && marioSprites.idle.complete) {
                ctx.drawImage(marioSprites.idle, screenX, screenY, this.width, this.height);
            }
        }
        ctx.restore();
    }
};

/**
 * 🎨【無敵・通常・ルイージ・ファイア大統合】フォルダアセット瞬間リロード関数お！
 */
function refreshPlayerSpriteFolders() {
    let finalPathFolder = '';

    // 👑 ─── 【仕様スケジュールの最優先調停トグル！】 ───
    if (typeof player !== 'undefined' && player.isFire) {
        // ① ファイア状態の時は、マリオもルイージも関係なし！共通の「fire/」の中身を直撃ロード！
        finalPathFolder = 'fire/';
    } else if (typeof player !== 'undefined' && player.characterType === 'luigi') {
        // ② 通常（チビ・デカ）のルイージ状態なら、エクスプローラ通りの「luigi/」フォルダをジャスト選択！
        finalPathFolder = 'luigi/';
    } else {
        // ③ 通常（チビ・デカ）のマリオ状態なら、ベース直下の「player/」そのものを見せるため空文字！
        finalPathFolder = '';
    }

    // ③ 無敵スター状態のパレット切り替えスイッチ（ファイアや通常フォルダを上書きトグル！）
    if (typeof player !== 'undefined' && player.isInvincible) {
        let frameWeight = 4;
        if (player.starInvincibleTimer !== undefined && player.starInvincibleTimer <= 120) {
            frameWeight = 2; // 残り2秒で点滅速度が2倍にブースト！
        }

        const currentStep = Math.floor(globalFrameCounter / frameWeight);
        const colorIndex = currentStep % 4;

        // 無敵の時はマリオもルイージも共通の color1〜3 のパレットを全員でシェアおぶ！！！ｗｗｗ
        if (colorIndex === 0) finalPathFolder = '';
        if (colorIndex === 1) finalPathFolder = 'color1/';
        if (colorIndex === 2) finalPathFolder = 'color2/';
        if (colorIndex === 3) finalPathFolder = 'color3/';
    }

    // 👑【大核心修正！】スラッシュの位置を完璧に調停して、画像ファイル名と100%噛み合うように結合おぶ！！！ｗｗｗ
    const fullPath = 'sprite/player/' + finalPathFolder;

    // ─── 全21枚のアセット参照パスをメモリ上で爆速一斉すり替え！！！ ───
    if (typeof marioSprites !== 'undefined') {
        if (marioSprites.idle)   marioSprites.idle.src   = fullPath + 'mario_idle.png';
        if (marioSprites.run1)   marioSprites.run1.src   = fullPath + 'mario_run_1.png';
        if (marioSprites.run2)   marioSprites.run2.src   = fullPath + 'mario_run_2.png';
        if (marioSprites.run3)   marioSprites.run3.src   = fullPath + 'mario_run_3.png';
        if (marioSprites.brake)  marioSprites.brake.src  = fullPath + 'mario_brake.png';
        if (marioSprites.jump)   marioSprites.jump.src   = fullPath + 'mario_jump.png';
        if (marioSprites.climb1) marioSprites.climb1.src = fullPath + 'player_climb1.png';
        if (marioSprites.climb2) marioSprites.climb2.src = fullPath + 'player_climb2.png';

        if (marioSprites.half)        marioSprites.half.src        = fullPath + 'half_mario.png';
        if (marioSprites.super_idle)  marioSprites.super_idle.src  = fullPath + 'super_idle.png';
        if (marioSprites.super_run1)  marioSprites.super_run1.src  = fullPath + 'super_run_1.png';
        if (marioSprites.super_run2)  marioSprites.super_run2.src  = fullPath + 'super_run_2.png';
        if (marioSprites.super_run3)  marioSprites.super_run3.src  = fullPath + 'super_run_3.png';
        if (marioSprites.super_brake) marioSprites.super_brake.src = fullPath + 'super_brake.png';
        if (marioSprites.super_jump)  marioSprites.super_jump.src  = fullPath + 'super_jump.png';
        if (marioSprites.super_squat) marioSprites.super_squat.src = fullPath + 'super_squat.png';
        if (marioSprites.super_climb1) marioSprites.super_climb1.src = fullPath + 'super_climb1.png';
        if (marioSprites.super_climb2) marioSprites.super_climb2.src = fullPath + 'super_climb2.png';
        if (marioSprites.super_throw) marioSprites.super_throw.src = fullPath + 'super_throw.png';

        if (marioSprites.swim2)       marioSprites.swim2.src       = fullPath + 'mario_swim2.png';
        if (marioSprites.super_swim2) marioSprites.super_swim2.src = fullPath + 'super_swim2.png';
        if (marioSprites.death)       marioSprites.death.src       = fullPath + 'mario_death.png';
    }
}
