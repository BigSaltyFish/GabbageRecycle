/**
 * 游戏基础的精灵类
 */
export default class Sprite {
  constructor(imgSrc = '', width = 0, height = 0, x = 0, y = 0) {
    this.img = new Image()
    this.img.src = imgSrc
    this.width = width
    this.height = height
    this.classification = 0
    this.isLiving = 0
    // Math.floor(Math.random() * 4) + 1
    // console.log(this.classification)
    this.x = x
    this.y = y

    this.visible = true
  }

  /**
   * 将精灵图绘制在canvas上
   */
  drawToCanvas(ctx) {
    // console.log(this.visible)
    if (!this.visible)
      return
//ctx.strokeStyle='fgba(255,0,0,0.5)'
//ctx.fillStyle='rgba(255,0,0,0.5)'
    ctx.drawImage(
      this.img,
      this.x,
      this.y,
      this.width,
      this.height
    )



  }

  /**
   * 简单的碰撞检测定义：
   * 另一个精灵的中心点处于本精灵所在的矩形内即可
   * @param{Sprite} sp: Sptite的实例
   */
  isCollideWith(sp) {
    let spX = sp.x + sp.width / 2
    let spY = sp.y + sp.height / 2

    if (!this.visible || !sp.visible)
      return false

    return !!(spX >= this.x &&
      spX <= this.x + this.width &&
      spY >= this.y &&
      spY <= this.y + this.height)
  }


  come(x, y, classifition) {

  }
}