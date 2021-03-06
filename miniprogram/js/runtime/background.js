import Sprite from '../base/sprite'
import DataBus from '../databus.js'

const screenWidth  = window.innerWidth
const screenHeight = window.innerHeight
let databus = new DataBus()

const BG_IMG   = databus.images.bg
const BG_WIDTH     = 512
const BG_HEIGHT    = 512

/**
 * 游戏背景类
 * 提供update和render函数实现无限滚动的背景功能
 */
export default class BackGround extends Sprite {
  constructor(ctx) {
    super(BG_IMG, BG_WIDTH, BG_HEIGHT)

    this.top = 0

    this.render(ctx)
  }

  update() {
    this.top += 2

    if ( this.top >= screenHeight )
      this.top = 0
  }

  /**
   * 背景图重绘函数
   * 绘制两张图片，两张图片大小和屏幕一致
   * 第一张漏出高度为top部分，其余的隐藏在屏幕上面
   * 第二张补全除了top高度之外的部分，其余的隐藏在屏幕下面
   */
  render(ctx) {
    ctx.drawImage(
      this.img,
      0,
      0,
      this.img.width,
      this.img.height,
      0,
      0,
      screenWidth,
      screenHeight
    )

    let img = databus.images.cloudleft
    ctx.drawImage(
      img,
      0, 0, img.width, img.height,
      0, screenHeight/15, img.width, img.height
    )

    img = databus.images.cloudright
    ctx.drawImage(
      img,
      0, 0, img.width, img.height,
      screenWidth - img.width, screenHeight / 15, img.width, img.height
    )

    img = databus.images.cloudcenter
    ctx.drawImage(
      img,
      0, 0, img.width, img.height,
      screenWidth / 2 - img.width / 2, screenHeight / 15, img.width, img.height
    )
  }
}
