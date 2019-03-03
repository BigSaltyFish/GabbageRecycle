import Sprite from '../base/sprite'
import DataBus from '../databus.js'

const screenWidth = window.innerWidth
const screenHeight = window.innerHeight
let databus = new DataBus()

const BG_IMG = new Image()
BG_IMG.src = 'images/start/bg.png'
const BG_WIDTH = 330
const BG_HEIGHT = 586

let modeBtn = new Image()
modeBtn.src = 'images/start/mode.png'
let infoBtn = new Image()
infoBtn.src = 'images/start/info.png'
let settingBtn = new Image()
settingBtn.src = 'images/start/setting.png'

/**
 * 游戏背景类
 * 提供update和render函数实现无限滚动的背景功能
 */
export default class BackGround extends Sprite {
  constructor(ctx) {
    super(BG_IMG, BG_WIDTH, BG_HEIGHT)

    this.modeBtnArea = {}
    this.infoBtnArea = {}
    this.settingBtnArea = {}

    this.top = 0

    this.render(ctx)
  }

  /**
   * change the icon of the mode button
   */
  changeModeIcon() {
    if(modeBtn == normal) modeBtn = difficult
    else if(modeBtn == difficult) modeBtn = normal
    console.log('changed!')
  }

  // update() {
  //   this.top += 2

  //   if (this.top >= screenHeight)
  //     this.top = 0
  // }

  /**
   * this function is for the tip render
   * it only renders the background image
   * @param {object} ctx: the rendering context
   */
  bgRender(ctx) {
    ctx.drawImage(
      this.img,
      145,
      0,
      screenWidth,
      screenHeight,
      0,
      this.top,
      screenWidth,
      screenHeight
    )
  }

  /**
   * 背景图重绘函数
   * 绘制两张图片，两张图片大小和屏幕一致
   * 第一张漏出高度为top部分，其余的隐藏在屏幕上面
   * 第二张补全除了top高度之外的部分，其余的隐藏在屏幕下面
   */
  render(ctx) {
    ctx.drawImage(
      BG_IMG,
      0,
      0,
      BG_IMG.width,
      BG_IMG.height,
      0,
      this.top,
      screenWidth,
      screenHeight
    )

    this.imgLoad(ctx,
      modeBtn,
      0,
      this.modeBtnArea)
    this.imgLoad(ctx,
      infoBtn,
      1,
      this.infoBtnArea)
    this.imgLoad(ctx,
      settingBtn,
      2,
      this.settingBtnArea)
  }

  /**
   * used to load picture, locate the picture according to num.
   * @param url the url of the picture
   * @param area the button area, used to response the touch
   */
  imgLoad(ctx, img, num, area) {
    this.renderBtn(ctx, img,
      (screenWidth - 10) / 2 + 5 - img.width / 2,
      screenHeight * (2 + num) / 6 - img.height / 2)
    area.startX = (screenWidth - 10) / 2 + 5 - img.width / 2
    area.startY = screenHeight * (2 + num) / 6 - img.height / 2
    area.endX = (screenWidth - 10) / 2 + 5 + img.width / 2
    area.endY = screenHeight * (2 + num) / 6 + img.height / 2
  }

  /**
   * draw the button onto the canvas on the specific region.
   * @param ctx the rendering context
   * @param img the picture
   * @param X the x position
   * @param Y the y position
   */
  renderBtn(ctx, img, X, Y) {
    ctx.drawImage(
      img,
      0, 0,
      img.width, img.height,
      X,
      Y,
      img.width,
      img.height
    )
  }
}
