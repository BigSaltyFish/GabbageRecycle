import Sprite from '../base/sprite'
import DataBus from '../databus.js'
import Button from '../display/button.js'

const screenWidth = window.innerWidth
const screenHeight = window.innerHeight
let databus = new DataBus()

const BG_IMG = new Image()
BG_IMG.src = 'images/start/bg.png'
const BG_WIDTH = 330
const BG_HEIGHT = 586

/**
 * 游戏背景类
 * 提供update和render函数实现无限滚动的背景功能
 */
export default class BackGround extends Sprite {
  constructor(ctx) {
    super(BG_IMG, BG_WIDTH, BG_HEIGHT)

    this.modeBtn = new Button(null, 'images/start/mode.png')
    this.infoBtn = new Button(null, 'images/start/info.png')
    this.settingBtn = new Button(null, 'images/start/setting.png')

    this.modeBtnArea = {}
    this.infoBtnArea = {}
    this.settingBtnArea = {}

    this.modePoped = false
    this.settingPoped = false

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

  /**
   * show the buttons for the two mode.
   */
  showMode(main) {
    const zoom = (x) => {return x*x/100}
    this.normalModeBtn = new Button(null, 'images/start/normal.png', screenWidth/2, screenHeight/3)
    this.difficultModeBtn = new Button(null, 'images/start/difficult-1.png', screenWidth/2, screenHeight/3)

    this.normalModeBtn.onClick(null, zoom, -screenWidth / 4, -screenHeight/6)
    this.difficultModeBtn.onClick(null, zoom, screenWidth / 4, -screenHeight / 6)
  }

  showSetting(main) {
    const zoom = (x) => { return x * x / 100 }
    this.bgmBtn = new Button(null, 'images/start/bgm.png', screenWidth/2, 2*screenHeight/3)
    this.soundBtn = new Button(null, 'images/start/sound.png', screenWidth/2, 2*screenHeight/3)

    this.bgmBtn.onClick(null, zoom, -screenWidth/4, screenHeight/6)
    this.soundBtn.onClick(null, zoom, screenWidth/4, screenHeight/6)
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

    if(this.modePoped) {
      if(!this.normalModeBtn.isPlaying) {
        let button = this.normalModeBtn.img
        this.normalModeBtn.drawOn(
          ctx,
          0, 0, button.width, button.height,
          screenWidth/4 - button.width/2,
          screenHeight/6 - button.height/2, 
          button.width, button.height
        )
      }
      if(!this.difficultModeBtn.isPlaying) {
        let button = this.difficultModeBtn.img
        this.difficultModeBtn.drawOn(
          ctx,
          0, 0, button.width, button.height,
          3*screenWidth / 4 - button.width / 2,
          screenHeight / 6 - button.height/2,
          button.width, button.height
        )
      }
    }

    if(this.settingPoped) {
      if (!this.bgmBtn.isPlaying) {
        let button = this.bgmBtn.img
        this.bgmBtn.drawOn(
          ctx,
          0, 0, button.width, button.height,
          screenWidth / 4 - button.width / 2,
          5 * screenHeight / 6 - button.height / 2,
          button.width, button.height
        )
      }
      if (!this.soundBtn.isPlaying) {
        let button = this.soundBtn.img
        this.soundBtn.drawOn(
          ctx,
          0, 0, button.width, button.height,
          3 * screenWidth / 4 - button.width / 2,
          5* screenHeight / 6 - button.height / 2,
          button.width, button.height
        )
      }
    }

    this.buttonLoad(ctx,
      this.modeBtn,
      0,
      this.modeBtnArea)
    this.buttonLoad(ctx,
      this.infoBtn,
      1,
      this.infoBtnArea)
    this.buttonLoad(ctx,
      this.settingBtn,
      2,
      this.settingBtnArea)
  }

  /**
   * used to load a button, locate the button according to num.
   * @param button the url of the picture
   * @param area the button area, used to response the touch
   */
  buttonLoad(ctx, button, num, area) {
    button.drawOn(
      ctx,
      0, 0,
      button.img.width, button.img.height,
      (screenWidth - 10) / 2 + 5 - button.img.width / 2,
      screenHeight * (2 + num) / 6 - button.img.height / 2,
      button.img.width, button.img.height
    )
    
    area.startX = (screenWidth - 10) / 2 + 5 - button.img.width / 2
    area.startY = screenHeight * (2 + num) / 6 - button.img.height / 2
    area.endX = (screenWidth - 10) / 2 + 5 + button.img.width / 2
    area.endY = screenHeight * (2 + num) / 6 + button.img.height / 2
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
