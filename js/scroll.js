const VRAM_WIDTH = 32;
const VRAM_HEIGHT = 15;

let nesVRAM = Array.from({ length: VRAM_HEIGHT }, () => new Array(VRAM_WIDTH).fill(0));

const STAGE_DATA = [

    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const fullStageMap = [];
for (let row = 0; row < VRAM_HEIGHT; row++) {
    fullStageMap[row] = [];
    for (let col = 0; col < 100; col++) {
        let tile = 0;
        if (row >= 13) {

            if ((col >= 30 && col <= 32) || (col >= 60 && col <= 62)) tile = 0;
            else tile = 1;
        }

        if (row === 9 && (col === 8 || col === 9 || col === 10 || col === 22 || col === 23 || col === 45)) tile = 1;
        if (row === 5 && col === 12) tile = 1;

        if (col >= 75 && col <= 80 && row >= (13 - (col - 74))) tile = 1;

        fullStageMap[row][col] = tile;
    }
}

cameraX = 0;
let scrollRegister = 0;
let currentTable = 0;

let lastWrittenCol = -1;

for (let r = 0; r < VRAM_HEIGHT; r++) {
    for (let c = 0; c < VRAM_WIDTH; c++) {
        nesVRAM[r][c] = (typeof tileMap !== 'undefined' && tileMap[r]) ? (tileMap[r][c] || 0) : 0;
    }
}
lastWrittenCol = VRAM_WIDTH - 1;

function updateVRAMBaking() {

    if (typeof tileMap === 'undefined' || !tileMap) return;

    const forwardX = cameraX + 256;
    const targetMapCol = Math.floor(forwardX / TILE_SIZE);

    if (targetMapCol > lastWrittenCol) {

        if (targetMapCol >= MAP_WIDTH) return;

        const vramColIndex = targetMapCol % VRAM_WIDTH;

        for (let row = 0; row < VRAM_HEIGHT; row++) {
            const nextTile = tileMap[row][targetMapCol] !== undefined ? tileMap[row][targetMapCol] : 0;
            nesVRAM[row][vramColIndex] = nextTile;
        }
        lastWrittenCol = targetMapCol;
    }
}

function updateCamera(playerX) {

    const targetCamX = playerX - 128;

    if (targetCamX > cameraX) {
        cameraX = targetCamX;
    }

    scrollRegister = Math.floor(cameraX) % 256;
    currentTable = Math.floor(Math.floor(cameraX) / 256) % 2;

    updateVRAMBaking();
}
