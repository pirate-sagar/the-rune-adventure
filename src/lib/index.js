import { l_BackgroundSkySea } from '$lib/data/l_BackgroundSkySea.js'
import { l_SecondaryBackgroundForest } from '$lib/data/l_SecondaryBackgroundForest.js'
import { l_Decoration } from '$lib/data/l_Decoration.js'
import { l_Ground } from '$lib/data/l_Ground.js'
import { l_Collisions } from '$lib/data/l_Collisions.js'
import { l_Gems } from '$lib/data/l_Gems.js'
import { l_Cherries } from '$lib/data/l_Cherries.js'
import { collisions } from '$lib/data/collisions.js'

import { Sprite } from '$lib/classes/Sprite.js'
import { Heart } from '$lib/classes/Heart.js'
import { Oposum } from '$lib/classes/Oposum.js'
import { Eagle } from '$lib/classes/Eagle.js'

import { loadImage, checkCollisions } from '$lib/utils.js'

import { Platform } from '$lib/classes/Platform.js'
import { CollisionBlock } from '$lib/classes/CollisionBlock.js'

import { keys, player } from '$lib/store/player-control.svelte.js'


const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const dpr = 1

canvas.width = 5120 * dpr
canvas.height = 1280 * dpr

const layersData = {
  l_BackgroundSkySea: l_BackgroundSkySea,
  l_SecondaryBackgroundForest: l_SecondaryBackgroundForest,
  l_Decoration: l_Decoration,
  l_Ground: l_Ground,
  l_Collisions: l_Collisions,
};

const tilesets = {
  l_BackgroundSkySea: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_SecondaryBackgroundForest: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_Decoration: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_Ground: { imageUrl: './images/tileset.png', tileSize: 16 },
  l_Collisions: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_Gems: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_Cherries: { imageUrl: './images/decorations.png', tileSize: 16 },
};


// Change xy coordinates to move player's default position



const collisionBlocks = []
const platforms = []
const blockSize = 16 // Assuming each tile is 16x16 pixels

collisions.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 1) {
      collisionBlocks.push(
        new CollisionBlock({
          x: x * blockSize,
          y: y * blockSize,
          size: blockSize,
        }),
      )
    } else if (symbol === 2) {
      platforms.push(
        new Platform({
          x: x * blockSize,
          y: y * blockSize + blockSize,
          width: 16,
          height: 4,
        }),
      )
    }
  })
})

const renderLayer = (tilesData, tilesetImage, tileSize, context) => {
  tilesData.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol !== 0) {
        const srcX = ((symbol - 1) % (tilesetImage.width / tileSize)) * tileSize
        const srcY =
          Math.floor((symbol - 1) / (tilesetImage.width / tileSize)) * tileSize

        context.drawImage(
          tilesetImage, // source image
          srcX,
          srcY, // source x, y
          tileSize,
          tileSize, // source width, height
          x * 16,
          y * 16, // destination x, y
          16,
          16, // destination width, height
        )
      }
    })
  })
}

const renderStaticLayers = async () => {
  const offscreenCanvas = document.createElement('canvas')
  offscreenCanvas.width = canvas.width
  offscreenCanvas.height = canvas.height
  const offscreenContext = offscreenCanvas.getContext('2d')

  for (const [layerName, tilesData] of Object.entries(layersData)) {
    const tilesetInfo = tilesets[layerName]
    if (tilesetInfo) {
      try {
        const tilesetImage = await loadImage(tilesetInfo.imageUrl)
        renderLayer(
          tilesData,
          tilesetImage,
          tilesetInfo.tileSize,
          offscreenContext,
        )
      } catch (error) {
        console.error(`Failed to load image for layer ${layerName}:`, error)
      }
    }
  }

  // Optionally draw collision blocks and platforms for debugging
  // collisionBlocks.forEach(block => block.draw(offscreenContext));
  // platforms.forEach((platform) => platform.draw(offscreenContext))

  return offscreenCanvas
}




let oposums = []
let eagles = []
let sprites = []
let hearts = [
  new Heart({
    x: 10,
    y: 10,
    width: 21,
    height: 18,
    imageSrc: './images/hearts.png',
    spriteCropbox: {
      x: 0,
      y: 0,
      width: 21,
      height: 18,
      frames: 6,
    },
  }),
  new Heart({
    x: 33,
    y: 10,
    width: 21,
    height: 18,
    imageSrc: './images/hearts.png',
    spriteCropbox: {
      x: 0,
      y: 0,
      width: 21,
      height: 18,
      frames: 6,
    },
  }),
  new Heart({
    x: 56,
    y: 10,
    width: 21,
    height: 18,
    imageSrc: './images/hearts.png',
    spriteCropbox: {
      x: 0,
      y: 0,
      width: 21,
      height: 18,
      frames: 6,
    },
  }),
]
let gems = []
let gemUI = new Sprite({
  x: 13,
  y: 36,
  width: 15,
  height: 13,
  imageSrc: './images/gem.png',
  spriteCropbox: {
    x: 0,
    y: 0,
    width: 15,
    height: 13,
    frames: 5,
  },
})
let gemCount = 0

function init() {
  gems = []
  gemCount = 0
  gemUI = new Sprite({
    x: 13,
    y: 36,
    width: 15,
    height: 13,
    imageSrc: './images/gem.png',
    spriteCropbox: {
      x: 0,
      y: 0,
      width: 15,
      height: 13,
      frames: 5,
    },
  })

  l_Cherries.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol === 19) {
        gems.push(
          new Sprite({
            x: x * 16,
            y: y * 16,
            width: 15,
            height: 13,
            imageSrc: './images/gem.png',
            spriteCropbox: {
              x: 0,
              y: 0,
              width: 15,
              height: 13,
              frames: 5,
            },
            hitbox: {
              x: x * 16,
              y: y * 16,
              width: 15,
              height: 13,
            },
          }),
        )
      }
    })
  })

  l_Gems.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol === 18) {
        gems.push(
          new Sprite({
            x: x * 16,
            y: y * 16,
            width: 15,
            height: 13,
            imageSrc: './images/gem.png',
            spriteCropbox: {
              x: 0,
              y: 0,
              width: 15,
              height: 13,
              frames: 5,
            },
            hitbox: {
              x: x * 16,
              y: y * 16,
              width: 15,
              height: 13,
            },
          }),
        )
      }
    })
  })



  oposums = [
    new Oposum({
      x: 300,
      y: 100,
      width: 36,
      height: 28,
    }),
    new Oposum({
      x: 906,
      y: 515,
      width: 36,
      height: 28,
    }),

    new Oposum({
      x: 390,
      y: 304,
      width: 36,
      height: 28,
    }),

    new Oposum({
      x: 646,
      y: 224,
      width: 36,
      height: 28,
    }),

    new Oposum({
      x: 459,
      y: 432,
      width: 36,
      height: 28,
    }),
    new Oposum({
      x: 1197,
      y: 160,
      width: 36,
      height: 28,
    }),


    new Oposum({
      x: 1611,
      y: 240,
      width: 36,
      height: 28,
    }),

    new Oposum({
      x: 2106,
      y: 208,
      width: 36,
      height: 28,
    }),


    new Oposum({
      x: 2285,
      y: 192,
      width: 36,
      height: 28,
    }),

    new Oposum({
      x: 2605,
      y: 96,
      width: 36,
      height: 28,
    }),


    new Oposum({
      x: 2923,
      y: 176,
      width: 36,
      height: 28,
    }),

    new Oposum({
      x: 3295,
      y: 191,
      width: 36,
      height: 28,
    }),

    new Oposum({
      x: 3633,
      y: 127,
      width: 36,
      height: 28,
    }),

    new Oposum({
      x: 4232,
      y: 176,
      width: 36,
      height: 28,
    }),


    new Oposum({
      x: 4490,
      y: 80,
      width: 36,
      height: 28,
    }),
    new Oposum({
      x: 4707,
      y: 400,
      width: 36,
      height: 28,
    }),

    new Oposum({
      x: 4527,
      y: 431,
      width: 36,
      height: 28,
    }),

    new Oposum({
      x: 4261,
      y: 432,
      width: 36,
      height: 28,
    }),



    new Oposum({
      x: 4098,
      y: 432,
      width: 36,
      height: 28,
    }),


    new Oposum({
      x: 3561,
      y: 432,
      width: 36,
      height: 28,
    }),

    new Oposum({
      x: 2890,
      y: 432,
      width: 36,
      height: 28,
    }),

    new Oposum({
      x: 2368,
      y: 432,
      width: 36,
      height: 28,
    }),



    new Oposum({
      x: 1650,
      y: 432,
      width: 36,
      height: 28,
    }),


    new Oposum({
      x: 1242,
      y: 432,
      width: 36,
      height: 28,
    }),


  ]

  sprites = []
  hearts = [
    new Heart({
      x: 10,
      y: 10,
      width: 21,
      height: 18,
      imageSrc: './images/hearts.png',
      spriteCropbox: {
        x: 0,
        y: 0,
        width: 21,
        height: 18,
        frames: 6,
      },
    }),
    new Heart({
      x: 33,
      y: 10,
      width: 21,
      height: 18,
      imageSrc: './images/hearts.png',
      spriteCropbox: {
        x: 0,
        y: 0,
        width: 21,
        height: 18,
        frames: 6,
      },
    }),
    new Heart({
      x: 56,
      y: 10,
      width: 21,
      height: 18,
      imageSrc: './images/hearts.png',
      spriteCropbox: {
        x: 0,
        y: 0,
        width: 21,
        height: 18,
        frames: 6,
      },
    }),
  ]


}



const SCROLL_POST_RIGHT = 400
const SCROLL_POST_TOP = 100
const SCROLL_POST_BOTTOM = 240

let lastTime = 0
const camera = {
  x: 0,
  y: 0,
}
let backgroundCanvas

const animate = (currentTime) => {
  // Calculate delta time in seconds
  const deltaTime = (currentTime - lastTime) / 1000
  lastTime = currentTime

  console.log(player.player.x, player.player.y)

  // Update player position
  player.player.handleInput(keys)
  player.player.update(deltaTime, collisionBlocks, platforms)


  for (let i = oposums.length - 1; i >= 0; i--) {
    const oposum = oposums[i]
    oposum.update(deltaTime, collisionBlocks, platforms)

    // Jump on enemy
    const collisionDirection = checkCollisions(player.player, oposum)
    if (collisionDirection) {
      if (collisionDirection === 'bottom' && !player.player.isOnGround) {
        player.player.velocity.y = -200
        sprites.push(
          new Sprite({
            x: oposum.x,
            y: oposum.y,
            width: 32,
            height: 32,
            imageSrc: './images/enemy-death.png',
            spriteCropbox: {
              x: 0,
              y: 0,
              width: 40,
              height: 41,
              frames: 6,
            },
          }),
        )

        oposums.splice(i, 1)
      } else if (
        (collisionDirection === 'left' || collisionDirection === 'right') &&
        player.player.isOnGround &&
        player.player.isRolling
      ) {
        sprites.push(
          new Sprite({
            x: oposum.x,
            y: oposum.y,
            width: 32,
            height: 32,
            imageSrc: './images/enemy-death.png',
            spriteCropbox: {
              x: 0,
              y: 0,
              width: 40,
              height: 41,
              frames: 6,
            },
          }),
        )

        oposums.splice(i, 1)
      } else if (
        collisionDirection === 'left' ||
        collisionDirection === 'right'
      ) {
        const fullHearts = hearts.filter((heart) => {
          return !heart.depleted
        })

        if (!player.player.isInvincible && fullHearts.length > 0) {
          fullHearts[fullHearts.length - 1].depleted = true
        } else if (fullHearts.length === 0) {
          init()
        }

        player.player.setIsInvincible()
      }
    }
  }

  // Update eagle position
  for (let i = eagles.length - 1; i >= 0; i--) {
    const eagle = eagles[i]
    eagle.update(deltaTime, collisionBlocks)

    // Jump on enemy
    const collisionDirection = checkCollisions(player.player, eagle)
    if (collisionDirection) {
      if (collisionDirection === 'bottom' && !player.player.isOnGround) {
        player.player.velocity.y = -200
        sprites.push(
          new Sprite({
            x: eagle.x,
            y: eagle.y,
            width: 32,
            height: 32,
            imageSrc: './images/enemy-death.png',
            spriteCropbox: {
              x: 0,
              y: 0,
              width: 40,
              height: 41,
              frames: 6,
            },
          }),
        )

        eagles.splice(i, 1)
      } else if (
        collisionDirection === 'left' ||
        collisionDirection === 'right' ||
        collisionDirection === 'top'
      ) {
        const fullHearts = hearts.filter((heart) => {
          return !heart.depleted
        })

        if (!player.player.isInvincible && fullHearts.length > 0) {
          fullHearts[fullHearts.length - 1].depleted = true
        } else if (fullHearts.length === 0) {
          init()
        }

        player.player.setIsInvincible()
      }
    }
  }

  for (let i = sprites.length - 1; i >= 0; i--) {
    const sprite = sprites[i]
    sprite.update(deltaTime)

    if (sprite.iteration === 1) {
      sprites.splice(i, 1)
    }
  }


  for (let i = gems.length - 1; i >= 0; i--) {
    const gem = gems[i]
    gem.update(deltaTime)

    // THIS IS WHERE WE ARE COLLECTING GEMS
    const collisionDirection = checkCollisions(player.player, gem)
    if (collisionDirection) {
      // create an item feedback animation
      sprites.push(
        new Sprite({
          x: gem.x - 8,
          y: gem.y - 8,
          width: 32,
          height: 32,
          imageSrc: './images/item-feedback.png',
          spriteCropbox: {
            x: 0,
            y: 0,
            width: 32,
            height: 32,
            frames: 5,
          },
        }),
      )

      // remove a gem from the game
      gems.splice(i, 1)
      gemCount++

      if (gems.length === 0) {
        console.log('YOU WIN!')
      }
    }
  }


  // Track scroll post distance
  if (player.player.x > SCROLL_POST_RIGHT && player.player.x < 4500) {
    const scrollPostDistance = player.player.x - SCROLL_POST_RIGHT
    camera.x = scrollPostDistance
  }

  if (player.player.y < SCROLL_POST_TOP && camera.y > 0) {
    const scrollPostDistance = SCROLL_POST_TOP - player.player.y
    camera.y = scrollPostDistance
  }

  if (player.player.y > SCROLL_POST_BOTTOM) {
    const scrollPostDistance = player.player.y - SCROLL_POST_BOTTOM
    camera.y = -scrollPostDistance
  }

  c.save()
  c.scale(dpr + 2, dpr + 2)
  c.translate(-camera.x, camera.y)
  c.clearRect(0, 0, canvas.width, canvas.height)
  c.drawImage(backgroundCanvas, 0, 0)
  player.player.draw(c, deltaTime)
  for (let i = oposums.length - 1; i >= 0; i--) {
    const oposum = oposums[i]
    oposum.draw(c)
  }

  for (let i = eagles.length - 1; i >= 0; i--) {
    const eagle = eagles[i]
    eagle.draw(c)
  }

  for (let i = sprites.length - 1; i >= 0; i--) {
    const sprite = sprites[i]
    sprite.draw(c)
  }

  for (let i = gems.length - 1; i >= 0; i--) {
    const gem = gems[i]
    gem.draw(c)
  }

  c.restore()

  requestAnimationFrame(animate)
}

const startRendering = async () => {
  try {
    backgroundCanvas = await renderStaticLayers()
    if (!backgroundCanvas) {
      console.error('Failed to create the background canvas')
      return
    }

    animate()
  } catch (error) {
    console.error('Error during rendering:', error)
  }
}

startRendering()
init()

