export class CollisionBlock {
  constructor({ x, y, size }) {
    this.x = x
    this.y = y
    this.width = size
    this.height = size
  }

  draw(c) {
    c.fillStyle = 'rgba(255, 0, 0, 0.5)'
    c.fillRect(this.x, this.y, this.width, this.height)
  }
}