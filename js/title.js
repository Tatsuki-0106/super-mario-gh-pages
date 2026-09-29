window.isTitleScreen = true;

const titleLogoSprite = new Image();
titleLogoSprite.src = 'sprite/others/titlelogo.png';

const cursorSprite = new Image();
cursorSprite.src = 'sprite/others/mushroom.png';

let selectedMenuIndex = 0;

let spaceKeyWasPressed = false;

const titleSprites = {};

for (let i = 0; i <= 9; i++) {
    titleSprites[i] = new Image();
    titleSprites[i].src = `sprite/others/pale_orange/${i}.png`;
}

const titleAlphabet = 'abcdefghijklmnopqrstuvwxyz';
for (let char of titleAlphabet) {
    titleSprites[char] = new Image();
    titleSprites[char].src = `sprite/others/pale_orange/${char}.png`;
}

titleSprites['-'] = new Image();    titleSprites['-'].src = 'sprite/others/pale_orange/-.png';
titleSprites['.'] = new Image();    titleSprites['.'].src = 'sprite/others/pale_orange/dot.png';
titleSprites['!'] = new Image();    titleSprites['!'].src = 'sprite/others/pale_orange/!.png';
titleSprites['cross'] = new Image(); titleSprites['cross'].src = 'sprite/others/pale_orange/cross.png';

titleSprites['c_logo'] = new Image();
titleSprites['c_logo'].src = 'sprite/others/pale_orange/copyright.png';

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

function drawTitleScreen() {
    if (!window.isTitleScreen) return;

    if (titleLogoSprite.complete) {
        ctx.drawImage(titleLogoSprite, 40, 32);
    }

    if (typeof drawScoreText === 'function') {

        drawScoreText("1 PLAYER GAME", 88, 144);

        drawScoreText("2 PLAYER GAME", 88, 160);

        drawScoreText("TOP-000000", 96, 184);
    }

    if (cursorSprite.complete) {
        const cursorX = 72;
        const cursorY = 144 + (selectedMenuIndex * 16);
        ctx.drawImage(cursorSprite, cursorX, cursorY);
    }

    drawTitleText("c1985 nintendo", 104, 120);
}

function updateTitleInput() {
    if (!window.isTitleScreen) return;

    if (keys.Space) {
        if (!spaceKeyWasPressed) {
            selectedMenuIndex = (selectedMenuIndex === 0) ? 1 : 0;

            spaceKeyWasPressed = true;
        }
    } else {
        spaceKeyWasPressed = false;
    }

    if (keys.Enter) {

        window.isTwoPlayerMode = (selectedMenuIndex === 1);

        window.player1Data = { lives: 3, score: 0, coins: 0, isSuper: false, isFire: false, height: 16, stage: "1-1" };
        window.player2Data = { lives: 3, score: 0, coins: 0, isSuper: false, isFire: false, height: 16, stage: "1-1" };

        window.currentPlayerNumber = 1;

        if (typeof player !== 'undefined') {
            player.characterType = 'mario';
        }

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

        if (typeof refreshPlayerSpriteFolders === 'function') {
            refreshPlayerSpriteFolders();
        }

        if (window.activeEnemies) window.activeEnemies.length = 0;
        if (typeof activeMushrooms !== 'undefined') activeMushrooms.length = 0;

        if (typeof activeScoreEffects !== 'undefined') activeScoreEffects.length = 0;
        if (typeof animatingBlocks !== 'undefined') animatingBlocks.length = 0;
        if (typeof animatingBricks !== 'undefined') animatingBricks.length = 0;
        if (typeof activeDebris !== 'undefined') activeDebris.length = 0;
        if (typeof activeCoins !== 'undefined') activeCoins.length = 0;

        if (typeof lastSpawnedKuriboCol !== 'undefined') lastSpawnedKuriboCol = -1;
        if (typeof kuriboComboCount !== 'undefined') kuriboComboCount = 0;

        if (typeof resetOverworldMapToDefault === 'function') resetOverworldMapToDefault();
        if (typeof resetBonusMapToDefault === 'function') resetBonusMapToDefault();

        window.lastCheckedSpawnCol = Math.ceil(canvas.width / 16) - 1;
        if (typeof initEnemiesFromMap === 'function') {
            initEnemiesFromMap();
        }

        if (typeof startMiddleScreen === 'function') {
            startMiddleScreen();
        }

        keys.Enter = false;
    }
}
