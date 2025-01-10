export class Platform {
  constructor({ x, y, width = 16, height = 4 }) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  draw(c) {
    c.fillStyle = 'rgba(255, 0, 0, 0.5)'
    c.fillRect(this.x, this.y, this.width, this.height)
  }

checkCollision(player, deltaTime) {
    const nextY = player.hitbox.y + player.velocity.y * deltaTime;
    const currentBottom = player.hitbox.y + player.hitbox.height;
    const nextBottom = currentBottom + player.velocity.y * deltaTime;

    return (
        currentBottom <= this.y &&
        nextBottom >= this.y &&
        player.hitbox.x + player.hitbox.width > this.x &&
        player.hitbox.x < this.x + this.width
    );
}
}
