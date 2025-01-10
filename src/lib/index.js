import { l_BackgroundSkySea } from '$lib/data/l_BackgroundSkySea.js'
import { l_SecondaryBackgroundForest } from '$lib/data/l_SecondaryBackgroundForest.js'
import { l_Decoration } from '$lib/data/l_Decoration.js'
import { l_Ground } from '$lib/data/l_Ground.js'
import { l_Collisions } from '$lib/data/l_Collisions.js'
import { l_Gems } from '$lib/data/l_Gems.js'
import { l_Cherries } from '$lib/data/l_Cherries.js'
import { collisions } from '$lib/data/collisions.js'

import { loadImage } from '$lib/utils.js'

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
  l_Gems: l_Gems,
  l_Cherries: l_Cherries,
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

  // Update player position
  player.player.handleInput(keys)
  player.player.update(deltaTime, collisionBlocks, platforms)

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

