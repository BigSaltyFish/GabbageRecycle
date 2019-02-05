import Sprite from '../base/sprite'

const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

const BG_IMG_SRC = 'images/garbages/home_page.png'
const BG_WIDTH = 512
const BG_HEIGHT = 512

let startBtn = new Image()
startBtn.src = 'images/button/start.png'
let modeBtn = new Image()
modeBtn.src = 'images/button/mode-normal.png'
let rankBtn = new Image()
rankBtn.src = 'images/button/rank.png'

let atlas = new Image()
atlas.src = 'images/Common.png'
/**
 * 游戏背景类
 * 提供update和render函数实现无限滚动的背景功能
 */
export default class BackGround extends Sprite {
  constructor(ctx) {
    super(BG_IMG_SRC, BG_WIDTH, BG_HEIGHT)

    this.startBtnArea = {}
    this.modeBtnArea = {}
    this.rankBtnArea = {}

    this.top = 0

    this.render(ctx)
  }

  // update() {
  //   this.top += 2

  //   if (this.top >= screenHeight)
  //     this.top = 0
  // }

  /**
   * 背景图重绘函数
   * 绘制两张图片，两张图片大小和屏幕一致
   * 第一张漏出高度为top部分，其余的隐藏在屏幕上面
   * 第二张补全除了top高度之外的部分，其余的隐藏在屏幕下面
   */
  render(ctx) {
    // ctx.drawImage(
    //   this.img,
    //   0,
    //   0,
    //   this.width,
    //   this.height,
    //   0,
    //   -screenHeight + this.top,
    //   screenWidth,
    //   screenHeight
    // )

    ctx.drawImage(
      this.img,
      0,
      0,
      this.width,
      this.height,
      0,
      this.top,
      screenWidth,
      screenHeight
    )

    // ctx.drawImage(atlas, 0, 0, 119, 108, screenWidth / 2 - 150, screenHeight / 2 - 100, 300, 300)
    // ctx.drawImage(
    //   atlas,
    //   120, 6, 39, 24,
    //   screenWidth / 2 - 60,
    //   screenHeight / 2 - 100 + 180,
    //   120, 40
    // )

    this.imgLoad(ctx,
      startBtn,
      0,
      '开始游戏', 
      this.startBtnArea)
    this.imgLoad(ctx,
      modeBtn,
      1,
      '难度：普通', 
      this.modeBtnArea)
    this.imgLoad(ctx,
      rankBtn,
      2,
      '查看排名', 
      this.rankBtnArea)

    // ctx.fillText(
    //   '开始游戏',
    //   screenWidth / 2 - 40,
    //   screenHeight / 2 - 100 + 205
    // )
    // this.btnArea = {
    //   startX: screenWidth / 2 - 40,
    //   startY: screenHeight / 2 - 100 + 180,
    //   endX: screenWidth / 2 + 50,
    //   endY: screenHeight / 2 - 100 + 255
    // }
  }

  /**
   * used to load picture, locate the picture according to num.
   * @param ctx the rendering context
   * @param url the url of the picture
   * @param area the button area, used to response the touch
   */
  imgLoad(ctx, img, num, text, area) {
    console.log('imgload begin')
    this.renderBtn(ctx, img,
      (screenWidth - 10) / 2 + 5 - img.width / 2,
      (screenHeight - 10) * (8 + num) / 12 - img.height / 2)
    if(!area)
      area = {
        startX: (screenWidth - 10) / 2 + 5 - img.width / 2,
        startY: (screenHeight - 10) * (8 + num) / 12 - img.height / 2, 
        endX: (screenWidth - 10) / 2 + 5 + img.width / 2, 
        endY: (screenHeight - 10) * (8 + num) / 12 + img.height / 2
      }
    console.log('imgload end')
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
    console.log('reached')
  }
}
