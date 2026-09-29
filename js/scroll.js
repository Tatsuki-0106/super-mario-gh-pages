// =================================================================
// 🎮 scroll.js : ファミコン準拠リアルタイム画面外書き換え＆スクロールシステム
// =================================================================

// 1. 本家の限界数値の定義
const VRAM_WIDTH = 32;  // 1画面16マス × 2画面分 = 横32マス（512ピクセル）
const VRAM_HEIGHT = 15; // 縦15マス（240ピクセル）

// 2. ファミコン内部の背景メモリ（ネームテーブル2面分＝横512pxループ空間）
// 最初は1画面分＋αだけ初期化しておき、右に進むにつれて先回り書き換えされます
let nesVRAM = Array.from({ length: VRAM_HEIGHT }, () => new Array(VRAM_WIDTH).fill(0));

// 3. 【核心】無限に続くステージの「元データ」（ステージ全体の設計図）
// ※ここをいくら長くしても、ファミコン内部（nesVRAM）は512pxしか使いません！
const STAGE_DATA = [
    // 0~15列（最初の1画面）,
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];
// 縦15マスのステージデータを自動生成（凸凹や穴、空中ブロックを配置）
const fullStageMap = [];
for (let row = 0; row < VRAM_HEIGHT; row++) {
    fullStageMap[row] = [];
    for (let col = 0; col < 100; col++) { // 横幅100マスの長いステージ
        let tile = 0;
        if (row >= 13) {
            // 穴をあける（30〜32列、60〜62列は奈落の底）
            if ((col >= 30 && col <= 32) || (col >= 60 && col <= 62)) tile = 0;
            else tile = 1; // 基本は地面
        }
        // 途中に空中ブロックや障害物を配置
        if (row === 9 && (col === 8 || col === 9 || col === 10 || col === 22 || col === 23 || col === 45)) tile = 1;
        if (row === 5 && col === 12) tile = 1;
        // ゴール前の階段っぽいやつ
        if (col >= 75 && col <= 80 && row >= (13 - (col - 74))) tile = 1;
        
        fullStageMap[row][col] = tile;
    }
}

// 4. スクロールレジスタとカメラ位置の数値
cameraX = 0;       // 本来のステージ絶対座標（0 〜 無限）
let scrollRegister = 0;// PPUレジスタ $2005 の再現（0 〜 255）
let currentTable = 0;  // 表示中のネームテーブル番号（0 or 1）

// 次に書き換えるべき「元データ」の列インデックス
let lastWrittenCol = -1;

// 💡 最初の2画面分は、テスト用ではなく本物の「tileMap」から転写するように大調停お！
for (let r = 0; r < VRAM_HEIGHT; r++) {
    for (let c = 0; c < VRAM_WIDTH; c++) {
        nesVRAM[r][c] = (typeof tileMap !== 'undefined' && tileMap[r]) ? (tileMap[r][c] || 0) : 0;
    }
}
lastWrittenCol = VRAM_WIDTH - 1;

/**
 * 🧱 【仕様書③の再現】1マス（16px）進むごとに、見えない画面外（カメラの先）を書き換える
 */
function updateVRAMBaking() {
    // 💡 可変配列 tileMap が存在しない場合は処理を全ガードセーフティ！
    if (typeof tileMap === 'undefined' || !tileMap) return;

    const forwardX = cameraX + 256;
    const targetMapCol = Math.floor(forwardX / TILE_SIZE);

    if (targetMapCol > lastWrittenCol) {
        // 💡 ステージ全体の横幅（MAP_WIDTH = 211）を超えて先回りベイクしないように鉄壁ガード！
        if (targetMapCol >= MAP_WIDTH) return;

        const vramColIndex = targetMapCol % VRAM_WIDTH;

        // 💡 画面外の地形元データを「fullStageMap」から「tileMap」に100%大統合させたお！！！ｗｗｗ
        for (let row = 0; row < VRAM_HEIGHT; row++) {
            const nextTile = tileMap[row][targetMapCol] !== undefined ? tileMap[row][targetMapCol] : 0;
            nesVRAM[row][vramColIndex] = nextTile;
        }
        lastWrittenCol = targetMapCol;
    }
}

/**
 * 🎛️ カメラ位置とレジスタの更新
 */
function updateCamera(playerX) {
    // マリオが画面中央（128px）を超えたら右スクロール開始
    const targetCamX = playerX - 128;
    
    if (targetCamX > cameraX) {
        cameraX = targetCamX; // 【仕様書④】右には進めるが、絶対に戻らない（cameraXは減少しない）
    }

    // スクロールレジスタ（$2005）とネームテーブルの切り替え数値を計算
    scrollRegister = Math.floor(cameraX) % 256;             // 0〜255をぐるぐる
    currentTable = Math.floor(Math.floor(cameraX) / 256) % 2;// 256pxごとに 0と1がパチパチ切り替わる
    
    // 画面外書き換え処理を呼び出し
    updateVRAMBaking();
}
