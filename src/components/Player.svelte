<script>
    import { onMount } from 'svelte';
  
    // Original constants
    const X_VELOCITY = 200;
    const JUMP_POWER = 250;
    const GRAVITY = 580;
  
    // Exported props so this component can be reused and customized
    export let x = 0;
    export let y = 0;
    export let size = 32;
    export let velocity = { x: 0, y: 0 };
  
    // Internal state
    let width = size;
    let height = size;
    let isOnGround = false;
    let loaded = false;
  
    // Image and sprite data
    let image = new Image();
    let currentFrame = 0;
    let frameInterval = 0.1;
    let elapsedTime = 0;
  
    let sprites = {
      idle: { x: 0,   y: 2,   width: 33, height: 30, frames: 4 },
      jump: { x: 0,   y: 160, width: 33, height: 28, frames: 1 },
      run:  { x: 0,   y: 36,  width: 33, height: 28, frames: 6 },
      fall: { x: 33,  y: 160, width: 33, height: 28, frames: 1 }
    };
  
    // Default to idle cropbox
    let cropbox = sprites.idle;
  
    // Player’s hitbox (for collision detection)
    let hitbox = {
      x: x + 5,
      y: y + 10,
      width: 20,
      height: 23
    };
  
    let isFacingLeft = false;
  
    // Load sprite image
    onMount(() => {
      image.src = './images/player.png';
      image.onload = () => {
        loaded = true;
      };
    });
  
    /**
     * Draw the player at the current position.
     * @param {CanvasRenderingContext2D} c
     * @param {number} deltaTime
     */
    export function draw(c, deltaTime) {
      if (!deltaTime || !loaded) return;
  
      elapsedTime += deltaTime;
      if (isFacingLeft) {
        c.save();
        c.scale(-1, 1);
        c.drawImage(
          image,
          cropbox.x + currentFrame * cropbox.width,
          cropbox.y,
          cropbox.width,
          cropbox.height,
          -x - width,
          y,
          width,
          height
        );
        c.restore();
      } else {
        c.drawImage(
          image,
          cropbox.x + currentFrame * cropbox.width,
          cropbox.y,
          cropbox.width,
          cropbox.height,
          x,
          y,
          width,
          height
        );
      }
  
      // Update frame if enough time has elapsed
      if (elapsedTime > frameInterval) {
        currentFrame = (currentFrame + 1) % cropbox.frames;
        elapsedTime -= frameInterval;
      }
    }
  
    /**
     * Update player’s movement, collision detection, and sprite choice.
     * @param {number} deltaTime
     * @param {Array} collisionBlocks - collisions bounding boxes
     * @param {Array} platforms - platforms in the scene
     */
    export function update(deltaTime, collisionBlocks = [], platforms = []) {
      if (!deltaTime || !loaded) return;
  
      applyGravity(deltaTime);
  
      // Horizontal movement and collisions
      updateHorizontalPosition(deltaTime);
      checkForHorizontalCollisions(collisionBlocks);
  
      // Platform collisions
      checkPlatformCollisions(platforms, deltaTime);
  
      // Vertical movement and collisions
      updateVerticalPosition(deltaTime);
      checkForVerticalCollisions(collisionBlocks);
  
      chooseSprite();
    }
  
    /**
     * Select the correct sprite depending on the player’s movement (idle, jump, fall, run).
     */
    function chooseSprite() {
      if (velocity.y < 0 && cropbox !== sprites.jump) {
        cropbox = sprites.jump;
        currentFrame = 0;
      } else if (velocity.y > 0 && cropbox !== sprites.fall) {
        cropbox = sprites.fall;
        currentFrame = 0;
      } else if (velocity.x !== 0 && isOnGround && cropbox !== sprites.run) {
        cropbox = sprites.run;
        currentFrame = 0;
      } else if (velocity.x === 0 && isOnGround && cropbox !== sprites.idle) {
        cropbox = sprites.idle;
        currentFrame = 0;
      }
  
      // Direction facing
      if (velocity.x > 0) {
        isFacingLeft = false;
      } else if (velocity.x < 0) {
        isFacingLeft = true;
      }
    }
  
    /**
     * Make the player jump.
     */
    export function jump() {
      velocity.y = -JUMP_POWER;
      isOnGround = false;
    }
  
    /**
     * Update horizontal position and move the hitbox accordingly.
     */
    function updateHorizontalPosition(deltaTime) {
      // Don’t allow the player to move outside the level (if desired)
      if (hitbox.x + velocity.x * deltaTime < 0) return;
  
      x += velocity.x * deltaTime;
      hitbox.x = x + 5; // offset
    }
  
    /**
     * Update vertical position and move the hitbox accordingly.
     */
    function updateVerticalPosition(deltaTime) {
      y += velocity.y * deltaTime;
      hitbox.y = y + 9; // offset
    }
  
    /**
     * Apply gravity to the player.
     */
    function applyGravity(deltaTime) {
      velocity.y += GRAVITY * deltaTime;
    }
  
    /**
     * Reset horizontal collision if the player runs into a wall.
     */
    function checkForHorizontalCollisions(collisionBlocks) {
      const buffer = 0.0001;
      for (let block of collisionBlocks) {
        if (
          hitbox.x <= block.x + block.width &&
          hitbox.x + hitbox.width >= block.x &&
          hitbox.y + hitbox.height >= block.y &&
          hitbox.y <= block.y + block.height
        ) {
          // Colliding left
          if (velocity.x < 0) {
            x = block.x + block.width + buffer - 5;
            hitbox.x = block.x + block.width + buffer;
            break;
          }
          // Colliding right
          if (velocity.x > 0) {
            x = block.x - width - buffer + 5;
            hitbox.x = block.x - hitbox.width - buffer;
            break;
          }
        }
      }
    }
  
    /**
     * Reset vertical collision if the player hits the ceiling or ground.
     */
    function checkForVerticalCollisions(collisionBlocks) {
      const buffer = 0.0001;
      for (let block of collisionBlocks) {
        if (
          hitbox.x <= block.x + block.width &&
          hitbox.x + hitbox.width >= block.x &&
          hitbox.y + hitbox.height >= block.y &&
          hitbox.y <= block.y + block.height
        ) {
          // Colliding upward
          if (velocity.y < 0) {
            velocity.y = 0;
            y = block.y + block.height + buffer - 9;
            hitbox.y = block.y + block.height + buffer;
            break;
          }
          // Colliding downward
          if (velocity.y > 0) {
            velocity.y = 0;
            y = block.y - height - buffer;
            hitbox.y = block.y - hitbox.height - buffer;
            isOnGround = true;
            break;
          }
        }
      }
    }
  
    /**
     * Check if we land on a platform. If so, stop vertical movement.
     */
    function checkPlatformCollisions(platforms, deltaTime) {
      const buffer = 0.0001;
      for (let platform of platforms) {
        if (platform.checkCollision({ x, y, hitbox, velocity, width, height }, deltaTime)) {
          velocity.y = 0;
          y = platform.y - height - buffer;
          hitbox.y = platform.y - hitbox.height - buffer;
          isOnGround = true;
          return;
        }
      }
      isOnGround = false;
    }
  
    /**
     * Optional helper to handle movement inputs. 
     * Could be used from parent or directly attached to keyboard events.
     */
    export function handleInput(keys) {
      velocity.x = 0;
      if (keys.d?.pressed) {
        velocity.x = X_VELOCITY;
      } else if (keys.a?.pressed) {
        velocity.x = -X_VELOCITY;
      }
    }
  </script>
  
  <!-- 
    This is just a placeholder canvas. A parent component or a game manager 
    typically handles the actual drawing and passes down the 2D context. 
  -->
  <canvas style="display: none;" />