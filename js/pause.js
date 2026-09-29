window.isPaused = false;

let pauseKeyCooldown = 0;

function updatePauseInput(keys, dtModifier = 1.0) {
    if (pauseKeyCooldown > 0) {
        pauseKeyCooldown -= dtModifier;
    }

    if (window.isTitleScreen || (typeof player !== 'undefined' && (player.playerState === 0x03 || player.playerState === 0x0C))) {
        window.isPaused = false;
        return;
    }

    if ((keys['p'] || keys['P']) && pauseKeyCooldown <= 0) {
        window.isPaused = !window.isPaused;
        pauseKeyCooldown = 15;

        if (window.isPaused) {
            if (typeof playSE === 'function') {
                playSE('pause');
            }

            Object.values(bgm).forEach(track => { [3]
                if (!track.paused) { [3]
                    track._wasPlayingBeforePause = true;
                    track.pause(); [3]
                }
            });
        } else {
             [3]

            if (typeof playSE === 'function') {
                playSE('pause');
            }

            Object.values(bgm).forEach(track => {
                if (track._wasPlayingBeforePause) {
                    track.play().catch(e => {});
                    track._wasPlayingBeforePause = false;
                }
            });
        }
    }
}

function drawPauseOverlay() {

    return;
}
