const sounds = {
    brick:          new Audio('sounds/brick.wav'),
    powerup:        new Audio('sounds/powerup.wav'),
    stompswim:      new Audio('sounds/stompswim.wav'),
    coin:          new Audio('sounds/coin.wav'),
    item:           new Audio('sounds/item.wav'),
    bump:           new Audio('sounds/bump.wav'),
    beep:           new Audio('sounds/beep.wav'),
    flagpole:       new Audio('sounds/flagpole.wav'),
    pipepowerdown:  new Audio('sounds/pipepowerdown.wav'),
    kickkill:       new Audio('sounds/kickkill.wav'),
    jump:           new Audio('sounds/jump.wav'),
    jumpsmall:      new Audio('sounds/jumpsmall.wav'),
    pause:          new Audio('sounds/pause.wav'),
    '1up':          new Audio('sounds/1up.wav'),
    gameover:       new Audio('sounds/gameover.wav'),
    hurryup:        new Audio('sounds/hurryup.wav'),
    death:          new Audio('sounds/death.wav'),
    fireball:          new Audio('sounds/fireball.wav')
};

const bgm = {
    overworld:       new Audio('sounds/bgm/overworld.mp3'),
    underground:     new Audio('sounds/bgm/underground.mp3'),
    hurry_overworld: new Audio('sounds/bgm/hurryoverworld.mp3'),
    star:            new Audio('sounds/bgm/star.mp3'),
    clear:           new Audio('sounds/clear.mp3')
};

bgm.overworld.loop = true;
bgm.overworld.volume = 1;

bgm.underground.loop = true;
bgm.underground.volume = 1;

bgm.hurry_overworld.loop = true;
bgm.hurry_overworld.volume = 1;

bgm.star.loop = true;
bgm.star.volume = 1;

bgm.clear.loop = false;
bgm.clear.volume = 1;

function playSE(seName) {
    if (sounds[seName]) {
        try {
            sounds[seName].currentTime = 0;
            sounds[seName].play().catch(e => {});
        } catch (error) {}
    }
}

function startBGM(bgmName) {
    if (bgm[bgmName]) {
        bgm[bgmName].play().catch(e => {
            window.addEventListener('click', () => {
                bgm[bgmName].play().catch(err => {});
            }, { once: true });
        });
    }
}

function stopAllBGM() {
    Object.values(bgm).forEach(track => {
        try {
            track.pause();
            track.currentTime = 0;
        } catch (e) {

        }
    });
}
