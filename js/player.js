const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowDown: false,
    KeyZ: false,
    KeyX: false,
    Space: false,

    Enter: false,

    KeyP: false,
    p: false,
    P: false
};

let jumpKeyWasPressed = false;

window.player1Data = { lives: 3, score: 0, coins: 0, isSuper: false, isFire: false, height: 16, stage: "1-1" };
window.player2Data = { lives: 3, score: 0, coins: 0, isSuper: false, isFire: false, height: 16, stage: "1-1" };

window.isPlayer1Cleared = false;
window.isPlayer2Cleared = false;

window.currentPlayerNumber = 1;

window.addEventListener('keydown', (e) => {
    if (keys[e.code] !== undefined) {

        if (e.code === 'KeyZ' && !keys['KeyZ']) {
            if (typeof shootFireball === 'function') {
                shootFireball();
            }
        }
        keys[e.code] = true;
    }

    if (e.code === 'KeyP') {
        keys['p'] = true;
        keys['P'] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (keys[e.code] !== undefined) keys[e.code] = false;

    if (e.code === 'KeyP') {
        keys['p'] = false;
        keys['P'] = false;
    }
});

const marioSprites = {

    idle: new Image(),
    run1: new Image(),
    run2: new Image(),
    run3: new Image(),
    brake: new Image(),
    jump: new Image(),
    climb1: new Image(),
    climb2: new Image(),

    half: new Image(),

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

marioSprites.idle.src = 'sprite/player/mario_idle.png';
marioSprites.run1.src = 'sprite/player/mario_run_1.png';
marioSprites.run2.src = 'sprite/player/mario_run_2.png';
marioSprites.run3.src = 'sprite/player/mario_run_3.png';
marioSprites.brake.src = 'sprite/player/mario_brake.png';
marioSprites.jump.src = 'sprite/player/mario_jump.png';
marioSprites.climb1.src = 'sprite/player/player_climb1.png';
marioSprites.climb2.src = 'sprite/player/player_climb2.png';

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

marioSprites.swim2 = new Image();
marioSprites.swim2.src = 'sprite/player/mario_swim2.png';

marioSprites.super_swim2 = new Image();
marioSprites.super_swim2.src = 'sprite/player/super_swim2.png';

marioSprites.death = new Image();
marioSprites.death.src = 'sprite/player/mario_death.png';

const player = {
    x: 41,
    y: 192,
    width: 16,
    height: 16,

    characterType: 'mario',

    isInvincible: false,

    vx: 0,
    accWalk: 0.037,
    accDash: 0.055,
    decel: 0.037,
    skidDecel: 0.156,
    vy: 0,
    isGrounded: true,

    direction: 1,
    animCounter: 0,
    currentSprite: marioSprites.idle,
    isSkidding: false,

    isSuper: false,
    isTransforming: false,
    transformTimer: 0,
    transformFrameBuffer: 0,

    isFlowerTransforming: false,
    flowerTransformTimer: 0,
    flowerTransformFrameBuffer: 0,

    isFire: false,

    isDamaged: false,
    damageTimer: 0,
    damageFrameBuffer: 0,

    playerState: 0x08,
    postFlipTimer: 0,

    isSolid: function(px, py) {
        if (px < 0 || px >= MAP_WIDTH * TILE_SIZE) return true;
        if (py < 0) return false;
        if (py >= MAP_HEIGHT * TILE_SIZE) return false;

        const col = Math.floor(px / TILE_SIZE);
        const row = Math.floor(py / TILE_SIZE);

        if (!tileMap[row] || tileMap[row][col] === undefined) return false;

        const tileType = tileMap[row][col];

        if (tileType === 0 || tileType === 30 || tileType === 222 || (tileType >= 81 && tileType <= 86)) {
            return false;
        }

        if (tileType === 50 || tileType === 60 || tileType === 61) {

            if (px >= this.x && px <= this.x + this.width && py >= this.y && py <= this.y + this.height) {
                return false;
            }

            return false;
        }

        return tileType > 0;
    },

    triggerPowerUp: function() {
        if (this.isTransforming) return;
        this.isTransforming = true;
        this.transformTimer = 0;
        this.transformFrameBuffer = 0;
        this.transformBaseY = this.y;
        this.vx = 0;
        playSE('powerup');
    },

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

    triggerFlowerPowerUp: function() {
        if (this.isFlowerTransforming || this.isTransforming) return;
        this.isFlowerTransforming = true;
        this.flowerTransformTimer = 0;
        this.flowerTransformFrameBuffer = 0;
        this.vx = 0;
        if (typeof playSE === 'function') playSE('powerup');
    },

    updateFlowerTransform: function(dtModifier) {
        this.flowerTransformFrameBuffer += dtModifier;

        while (this.flowerTransformFrameBuffer >= 1) {
            this.flowerTransformFrameBuffer -= 1;
            this.flowerTransformTimer++;

            if (this.flowerTransformTimer >= 40) {
                this.isFlowerTransforming = false;
                this.isSuper = true;

                this.isFire = true;

                this.playerState = 0x08;

                if (typeof refreshPlayerSpriteFolders === 'function') {
                    refreshPlayerSpriteFolders();
                }
                break;
            }

            const currentStep = Math.floor(this.flowerTransformTimer / 4);
            const colorIndex = currentStep % 4;

            let folderFolder = '';
            if (colorIndex === 0) folderFolder = '';
            if (colorIndex === 1) folderFolder = 'color1/';
            if (colorIndex === 2) folderFolder = 'color2/';
            if (colorIndex === 3) folderFolder = 'color3/';

            const fullPath = 'sprite/player/' + folderFolder;

            if (typeof marioSprites !== 'undefined') {
                if (marioSprites.super_idle)  marioSprites.super_idle.src  = fullPath + 'super_idle.png';
                if (marioSprites.super_run1)  marioSprites.super_run1.src  = fullPath + 'super_run_1.png';
                if (marioSprites.super_run2)  marioSprites.super_run2.src  = fullPath + 'super_run_2.png';
                if (marioSprites.super_run3)  marioSprites.super_run3.src  = fullPath + 'super_run_3.png';
                if (marioSprites.super_brake) marioSprites.super_brake.src = fullPath + 'super_brake.png';
                if (marioSprites.super_throw) marioSprites.super_throw.src = fullPath + 'super_throw.png';
                if (marioSprites.super_jump)  marioSprites.super_jump.src  = fullPath + 'super_jump.png';
            }

            this.currentSprite = marioSprites.super_idle;
        }
    },

    triggerDamage: function() {

        if (this.playerState === 0x03 || this.isTransforming) return;

        if (this.isFire) {
            this.isFire = false;

            if (typeof refreshPlayerSpriteFolders === 'function') {
                refreshPlayerSpriteFolders();
            }
        }

        if (this.isSuper) {
            this.isDamaged = true;
            this.damageTimer = 0;
            this.damageFrameBuffer = 0;
            this.vx = 0;
            this.invincibleTimer = 150;
            if (typeof playSE === 'function') playSE('pipepowerdown');
        } else {

            this.playerState = 0x03;
            this.vx = 0;
            this.vy = 0;
            this.currentSprite = marioSprites.death;

            this.invincibleTimer = 0;

            this.deathTimer = 0;
            this.deathFrameBuffer = 0;
            this.deathJumpTriggered = false;

            this.isDamaged = false;
            this.isTransforming = false;

            if (typeof stopAllBGM === 'function') stopAllBGM();
            if (typeof playSE === 'function') playSE('death');

        }
    },

    updateDamage: function(dtModifier) {
        this.damageFrameBuffer += dtModifier;

        while (this.damageFrameBuffer >= 1) {
            this.damageFrameBuffer -= 1;
            this.damageTimer++;

            if (this.invincibleTimer > 0) {
                this.invincibleTimer -= 1;
                if (this.invincibleTimer < 0) this.invincibleTimer = 0;
            }

            const t = this.damageTimer;

            if (t > 40) {
                this.isDamaged = false;
                this.isSuper = false;
                this.height = 16;
                this.playerState = 0x08;

                break;
            }

            const currentFootY = this.y + this.height;

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

            this.y = currentFootY - this.height;
        }
    },

    update: function(dtModifier = 1.0) {

        if (this.isInvincible) {

            if (this.starInvincibleTimer === undefined) {
                this.starInvincibleTimer = 600;
            }

            this.starInvincibleTimer -= dtModifier;

            if (this.starInvincibleTimer <= 0) {

                this.isInvincible = false;
                this.starInvincibleTimer = undefined;

                if (typeof refreshPlayerSpriteFolders === 'function') {
                    refreshPlayerSpriteFolders();
                }

                if (typeof bgm !== 'undefined' && bgm.star) {
                    bgm.star.pause();
                    bgm.star.currentTime = 0;
                }

                if (typeof startBGM === 'function') {
                    if (window.originalOverworldMapRef || (typeof currentStageType !== 'undefined' && currentStageType === 'underground')) {
                        startBGM('underground');
                    } else {
                        startBGM('overworld');
                    }
                }

            }
        }

        if (this.isInvincible && typeof refreshPlayerSpriteFolders === 'function') {
            refreshPlayerSpriteFolders();
        }

        if (!this.isDamaged && this.invincibleTimer !== undefined && this.invincibleTimer > 0) {
            this.invincibleTimer -= dtModifier;
            if (this.invincibleTimer < 0) this.invincibleTimer = 0;
        }

        if (this.playerState === 0x03) {
            this.vx = 0;

            this.deathFrameBuffer += dtModifier;
            while (this.deathFrameBuffer >= 1) {
                this.deathFrameBuffer -= 1;
                this.deathTimer++;

                const dt = this.deathTimer;

                if (this.isPitDeath) {

                    this.vy += 0.2;
                    if (this.vy > 5.0) this.vy = 5.0;
                } else {

                    if (dt <= 30) {
                        this.vy = 0;
                    } else {
                        if (!this.deathJumpTriggered) {
                            this.vy = -5.0;
                            this.deathJumpTriggered = true;

                        }
                        this.vy += 0.2;
                        if (this.vy > 5.0) this.vy = 5.0;
                    }
                }

                if (dt >= 240) {

                    this.playerState = 0x08;
                    if (typeof respawnPlayer === 'function') {
                        respawnPlayer();
                    }
                    return;
                }
            }

            this.y += this.vy * dtModifier;

            if (this.y > 250) {
                this.y = 250;
            }

            return;
        }

        if (this.vanished) {
            this.vx = 0; this.vy = 0;
            return;
        }

        const checkCol = Math.floor((this.x + this.width / 2) / TILE_SIZE);
        const checkRow = Math.floor((this.y + this.height - 4) / TILE_SIZE);

        if (tileMap[checkRow] && tileMap[checkRow][checkCol] === 86) {
            if (!this.vanished) {
                this.vanished = true;
                this.vx = 0; this.vy = 0;

                if (typeof stopAllBGM === 'function') stopAllBGM();

            }
            return;
        }

        if (this.playerState === 0x33) {
            if (this.isSuper) {
                this.currentSprite = marioSprites.super_squat;
                if (this.height === 32) { this.height = 24; this.y += 8; }
            } else {
                this.currentSprite = marioSprites.idle;
            }
            return;
        }

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

        if (this.isTransforming) {
            this.updateTransform(dtModifier);
            return;
        }

        if (this.isFlowerTransforming) {
            this.updateFlowerTransform(dtModifier);
            return;
        }

        if (this.isDamaged) {
            this.updateDamage(dtModifier);
            return;
        }

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

        if (this.playerState === 0x09) {
            this.vx = 0; this.vy = 0;
            this.playerState = 0x0A;
            return;
        }

        if (this.playerState === 0x0A) {
            this.vx = 0; this.vy = 0;

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

                    if (this.postFlipTimer === undefined || this.postFlipTimer === 0) {

                        this.direction = -1;
                        this.x += 16;
                        this.postFlipTimer = 0.001;

                    } else {

                        if (this.postFlipTimer < 0.1) {

                        }
                    }

                    this.postFlipTimer += dtModifier;

                    if (this.postFlipTimer >= 16) {

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

                        if (typeof startBGM === 'function') {
                            startBGM('clear');
                        }

                    } else {
                        this.currentSprite = this.isSuper ? marioSprites.super_climb1 : marioSprites.climb1;
                    }
                } else {
                    this.currentSprite = this.isSuper ? marioSprites.super_climb1 : marioSprites.climb1;
                }
            }
            return;
        }

        if (this.playerState === 0x0B) {
            this.vx = 0; this.vy = 0;

            this.x += 1.0 * dtModifier;

            if (typeof cameraX !== 'undefined') {
                const targetCamX = this.x - 128;
                if (targetCamX > cameraX) {
                    cameraX = targetCamX;
                }
                const maxCameraX = 3120;
                if (cameraX > maxCameraX) cameraX = maxCameraX;

                if (typeof updateVRAMBaking === 'function') {
                    updateVRAMBaking();
                }

                if (typeof lastCheckedSpawnCol !== 'undefined') {
                    lastCheckedSpawnCol = Math.floor((cameraX + 256) / TILE_SIZE);
                }
            }

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

            const doorCol = Math.floor((this.x + this.width / 2) / TILE_SIZE);
            const doorRow = Math.floor((this.y + this.height - 4) / TILE_SIZE);

            if (tileMap[doorRow] && tileMap[doorRow][doorCol] === 86) {
                if (!this.vanished) {
                    this.vanished = true;
                    this.playerState = 0x0C;

                    if (typeof bgm !== 'undefined') {
                        if (bgm.overworld)   { bgm.overworld.pause();   bgm.overworld.currentTime = 0; }
                        if (bgm.underground) { bgm.underground.pause(); bgm.underground.currentTime = 0; }
                    }
                }
            }
            return;
        }

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

        if (typeof cameraX === 'undefined') window.cameraX = 0;
        if (this.x > cameraX + 128) cameraX = this.x - 128;
        const maxCameraX = (MAP_WIDTH * TILE_SIZE) - 256;
        if (cameraX > maxCameraX) cameraX = maxCameraX;
        if (this.x < cameraX) { this.x = cameraX; this.vx = 0; }
        if (this.x > (MAP_WIDTH * TILE_SIZE) - this.width) { this.x = (MAP_WIDTH * TILE_SIZE) - this.width; this.vx = 0; }

        if (typeof cameraX !== 'undefined') {
            window.ram_0x071A = Math.floor(cameraX / 256);
        }

        if (this.isSkidding) {
            if (this.vx > 0) this.direction = -1; if (this.vx < 0) this.direction = 1;
        } else {
            if (keys.ArrowRight) this.direction = 1; if (keys.ArrowLeft) this.direction = -1;
        }

        if (this.throwMotionTimer === undefined) this.throwMotionTimer = 0;
        if (this.throwMotionTimer > 0) {
            this.throwMotionTimer -= dtModifier;
            if (this.throwMotionTimer < 0) this.throwMotionTimer = 0;
        }

        if (this.isFire && this.throwMotionTimer > 0) {

            this.currentSprite = marioSprites.super_throw;
        } else if (!this.isGrounded && this.playerState !== 0x05) {
            this.currentSprite = this.isSuper ? marioSprites.super_jump : marioSprites.jump;
        } else if (this.playerState === 0x05) {

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

    triggerFreezeRoutine: function() {

        if (this.playerState === 0x03 || this.playerState === 0x09 || this.playerState === 0x0A) return;

        this.playerState = 0x09; this.vx = 0; this.vy = 0;

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

            goalPoleFlag.init(poleCol);
        }

        const poleAbsoluteX = poleCol * TILE_SIZE;

        this.x = poleAbsoluteX - 4;

        this.direction = 1;

        if (typeof keys !== 'undefined') {
            keys.ArrowLeft = false; keys.ArrowRight = false; keys.ArrowDown = false;
            keys.KeyZ = false; keys.KeyX = false; keys.Space = false;
        }

        if (typeof stopAllBGM === 'function') stopAllBGM();
        if (typeof playSE === 'function') playSE('flagpole');

        let topBallY = 2 * TILE_SIZE;
        let foundBall = false;
        for (let r = 0; r < MAP_HEIGHT; r++) {
            if (tileMap[r] && tileMap[r][poleCol] === 90) {
                topBallY = r * TILE_SIZE;
                foundBall = true;
                break;
            }
        }

        const poleTouchDistance = Math.abs(this.y - topBallY);
        let poleBonusScore = 100;

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

        if (typeof addScore === 'function') { addScore(poleBonusScore); }

        let bottomStickY = 12 * TILE_SIZE;

        for (let r = MAP_HEIGHT - 1; r >= 0; r--) {
            if (tileMap[r] && tileMap[r][poleCol] === 91) {
                bottomStickY = r * TILE_SIZE;
                break;
            }
        }

        if (typeof spawnScoreEffect === 'function') {

            spawnScoreEffect(poleAbsoluteX + 16, bottomStickY, poleBonusScore);

            if (activeScoreEffects && activeScoreEffects.length > 0) {

                activeScoreEffects[activeScoreEffects.length - 1].isGoalScore = true;
            }
        }

    },

    draw: function() {
        if (this.vanished) return;

        if (this.invincibleTimer !== undefined && this.invincibleTimer > 0) {

            const rawTimerValue = this.isDamaged ? this.damageTimer : (150 - this.invincibleTimer);

            if (Math.floor(rawTimerValue) % 2 === 0) {
                return;
            }
        }

        ctx.save();
        ctx.globalAlpha = 1.0;

        const camX = (typeof cameraX !== 'undefined') ? cameraX : 0;
        const screenX = Math.floor(this.x) - Math.floor(camX);
        const screenY = Math.floor(this.y);

        if (this.currentSprite && this.currentSprite.complete) {
            if (this.direction === -1) {
                ctx.translate(screenX + this.width / 2, screenY); ctx.scale(-1, 1);
                ctx.drawImage(this.currentSprite, -this.width / 2, 0, this.width, this.height);
            } else {
                ctx.drawImage(this.currentSprite, screenX, screenY, this.width, this.height);
            }
        } else {

            if (marioSprites && marioSprites.idle && marioSprites.idle.complete) {
                ctx.drawImage(marioSprites.idle, screenX, screenY, this.width, this.height);
            }
        }
        ctx.restore();
    }
};

function refreshPlayerSpriteFolders() {
    let finalPathFolder = '';

    if (typeof player !== 'undefined' && player.isFire) {

        finalPathFolder = 'fire/';
    } else if (typeof player !== 'undefined' && player.characterType === 'luigi') {

        finalPathFolder = 'luigi/';
    } else {

        finalPathFolder = '';
    }

    if (typeof player !== 'undefined' && player.isInvincible) {
        let frameWeight = 4;
        if (player.starInvincibleTimer !== undefined && player.starInvincibleTimer <= 120) {
            frameWeight = 2;
        }

        const currentStep = Math.floor(globalFrameCounter / frameWeight);
        const colorIndex = currentStep % 4;

        if (colorIndex === 0) finalPathFolder = '';
        if (colorIndex === 1) finalPathFolder = 'color1/';
        if (colorIndex === 2) finalPathFolder = 'color2/';
        if (colorIndex === 3) finalPathFolder = 'color3/';
    }

    const fullPath = 'sprite/player/' + finalPathFolder;

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
