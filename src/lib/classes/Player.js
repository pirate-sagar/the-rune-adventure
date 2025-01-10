import { Platform } from "./Platform.js"

const X_VELOCITY = 200
const JUMP_POWER = 250
const GRAVITY = 580

export class Player {
  constructor({ x, y, size, velocity = { x: 0, y: 0 } }) {
    this.x = x
    this.y = y
    this.width = size
    this.height = size
    this.velocity = velocity
    this.isOnGround = false
    this.loaded = false
    this.image = new Image()
    this.image.onload = () => {
      this.loaded = true
    }
    this.image.src = './images/player.png'
    this.currentFrame = 0
    this.frameInterval = 0.1
    this.elapsedTime = 0
    this.sprites = {
      idle: {
        x: 0,
        y: 2,
        width: 33,
        height: 30,
        frames: 4,
      },
      jump: {
        x: 0,
        y: 160,
        width: 33,
        height: 28,
        frames: 1,
      },
      run: {
        x: 0,
        y: 36,
        width: 33,
        height: 28,
        frames: 6,
      },
      fall: {
        x: 33,
        y: 160,
        width: 33,
        height: 28,
        frames: 1,
      },
    }
    this.cropbox = this.sprites.idle
    this.hitbox = {
      x: 5 + this.x,
      y: 10 + this.y,
      width: 20,
      height: 23,
    }
    this.isFacingLeft = false
  }

  draw(c, deltaTime) {
    if (!deltaTime || !this.loaded) return

    this.elapsedTime += deltaTime
    if (this.isFacingLeft) {
      c.save()
      c.scale(-1, 1)
      c.drawImage(
        this.image,
        this.cropbox.x + this.currentFrame * this.cropbox.width,
        this.cropbox.y,
        this.cropbox.width,
        this.cropbox.height,
        -this.x - this.width,
        this.y,
        this.width,
        this.height,
      )
      c.restore()
    } else {
      c.drawImage(
        this.image,
        this.cropbox.x + this.currentFrame * this.cropbox.width,
        this.cropbox.y,
        this.cropbox.width,
        this.cropbox.height,
        this.x,
        this.y,
        this.width,
        this.height,
      )
    }

    if (this.elapsedTime > this.frameInterval) {
      this.currentFrame = (this.currentFrame + 1) % this.cropbox.frames
      this.elapsedTime -= this.frameInterval
    }
  }

  update(deltaTime, collisionBlocks, platforms) {
    if (!deltaTime || !this.loaded) return
    this.applyGravity(deltaTime)

    // Update horizontal position and check collisions
    this.updateHorizontalPosition(deltaTime)
    this.checkForHorizontalCollisions(collisionBlocks)

    // Check for any platform collisions
    this.checkPlatformCollisions(platforms, deltaTime)

    // Update vertical position and check collisions
    this.updateVerticalPosition(deltaTime)
    this.checkForVerticalCollisions(collisionBlocks)

    this.chooseSprite()
  }

  chooseSprite() {
    if (this.velocity.y < 0 && this.cropbox !== this.sprites.jump) {
      // Jump
      this.cropbox = this.sprites.jump
      this.currentFrame = 0
    } else if (this.velocity.y > 0 && this.cropbox !== this.sprites.fall) {
      // Fall
      this.cropbox = this.sprites.fall
      this.currentFrame = 0
    } else if (
      this.velocity.x !== 0 &&
      this.isOnGround &&
      this.cropbox !== this.sprites.run
    ) {
      // Run
      this.cropbox = this.sprites.run
      this.currentFrame = 0
    } else if (
      this.velocity.x === 0 &&
      this.isOnGround &&
      this.cropbox !== this.sprites.idle
    ) {
      // Idle
      this.cropbox = this.sprites.idle
      this.currentFrame = 0
    }

    if (this.velocity.x > 0) {
      this.isFacingLeft = false
    } else if (this.velocity.x < 0) {
      this.isFacingLeft = true
    }
  }

  jump() {
    this.velocity.y = -JUMP_POWER
    this.isOnGround = false
  }

  updateHorizontalPosition(deltaTime) {
    if (this.hitbox.x + this.velocity.x * deltaTime < 0) return
    this.x += this.velocity.x * deltaTime
    const hitboxOffsetX = 5
    this.hitbox.x = this.x + hitboxOffsetX
  }

  updateVerticalPosition(deltaTime) {
    this.y += this.velocity.y * deltaTime
    const hitboxOffsetY = 9
    this.hitbox.y = this.y + hitboxOffsetY
  }

  applyGravity(deltaTime) {
    const gravity = GRAVITY
    this.velocity.y += gravity * deltaTime
  }

  handleInput(keys) {
    this.velocity.x = 0

    if (keys.d.pressed) {
      this.velocity.x = X_VELOCITY
    } else if (keys.a.pressed) {
      this.velocity.x = -X_VELOCITY
    }
  }

  checkForHorizontalCollisions(collisionBlocks) {
    const buffer = 0.0001
    for (let i = 0; i < collisionBlocks.length; i++) {
      const collisionBlock = collisionBlocks[i]

      // Check if a collision exists on all axes
      if (
        this.hitbox.x <= collisionBlock.x + collisionBlock.width &&
        this.hitbox.x + this.hitbox.width >= collisionBlock.x &&
        this.hitbox.y + this.hitbox.height >= collisionBlock.y &&
        this.hitbox.y <= collisionBlock.y + collisionBlock.height
      ) {
        // Check collision while player is going left
        if (this.velocity.x < -0) {
          this.x = collisionBlock.x + collisionBlock.width + buffer - 5
          this.hitbox.x = collisionBlock.x + collisionBlock.width + buffer

          break
        }

        // Check collision while player is going right
        if (this.velocity.x > 0) {
          this.x = collisionBlock.x - this.width - buffer + 5
          this.hitbox.x = collisionBlock.x - this.hitbox.width - buffer

          break
        }
      }
    }
  }

  checkForVerticalCollisions(collisionBlocks) {
    const buffer = 0.0001
    for (let i = 0; i < collisionBlocks.length; i++) {
      const collisionBlock = collisionBlocks[i]

      // If a collision exists
      if (
        this.hitbox.x <= collisionBlock.x + collisionBlock.width &&
        this.hitbox.x + this.hitbox.width >= collisionBlock.x &&
        this.hitbox.y + this.hitbox.height >= collisionBlock.y &&
        this.hitbox.y <= collisionBlock.y + collisionBlock.height
      ) {
        // Check collision while player is going up
        if (this.velocity.y < 0) {
          this.velocity.y = 0
          this.y = collisionBlock.y + collisionBlock.height + buffer - 9
          this.hitbox.y = collisionBlock.y + collisionBlock.height + buffer
          break
        }

        // Check collision while player is going down
        if (this.velocity.y > 0) {
          this.velocity.y = 0
          this.y = collisionBlock.y - this.height - buffer
          this.hitbox.y = collisionBlock.y - this.hitbox.height - buffer
          this.isOnGround = true
          break
        }
      }
    }
  }

  checkPlatformCollisions(platforms, deltaTime) {
    const buffer = 0.0001
    for (let platform of platforms) {
      if (platform.checkCollision(this, deltaTime)) {
        this.velocity.y = 0
        this.y = platform.y - this.height - buffer
        this.hitbox.y = platform.y - this.hitbox.height - buffer
        this.isOnGround = true
        return
      }
    }
    this.isOnGround = false
  }
}
