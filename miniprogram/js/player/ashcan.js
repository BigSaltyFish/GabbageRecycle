import Sprite from '../base/sprite'
import Bullet from './bullet'
import DataBus from '../databus'

const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

// 玩家相关常量设置
const PLAYER_NORMAL_IMG_SRC1 = 'images/garbages/dry_ashcan.png'
const PLAYER_NORMAL_IMG_SRC2 = 'images/garbages/recyclable_ashcan.png'
const PLAYER_NORMAL_IMG_SRC3 = 'images/garbages/wet_ashcan.png'
const PLAYER_NORMAL_IMG_SRC4 = 'images/garbages/harmful_ashcan.png'
const DARK_CAN = 'images/garbages/dark.png'

const NORMAL_CANS = new Array('images/garbages/dry_ashcan.png',
  'images/garbages/recyclable_ashcan.png',
  'images/garbages/wet_ashcan.png',
  'images/garbages/harmful_ashcan.png')
const DIFFICULT_CANS = new Array(5)


const PLAYER_WIDTH = 25 * 2
const PLAYER_HEIGHT = 63 * 2

let databus = new DataBus()
let cans

export default class Ashcan {
  constructor(ctx, gameMode) {
    if(gameMode == 0) {
      this.ashcans = new Array(4)
      this.canNumber = 4
      cans = NORMAL_CANS
    }
    else if(gameMode == 1) {
      this.ashcans = new Array(5)
      this.canNumber = 5
      cans = DIFFICULT_CANS
    }

    for(let i = 0; i < this.canNumber; i++) {
      this.ashcans[i] = new Sprite(cans[i], PLAYER_WIDTH, PLAYER_HEIGHT,
        (i + 1) * (screenWidth - 10) / (this.canNumber + 1) + 5 - PLAYER_WIDTH / 2, 
        screenHeight - PLAYER_HEIGHT - 30)
    }
    // this.x1 = screenWidth / 4 - this.width / 2
    // this.y1 = screenHeight - this.height - 30
    // this.sprite1 = new Sprite(PLAYER_NORMAL_IMG_SRC1, PLAYER_WIDTH, PLAYER_HEIGHT, (screenWidth / 8 - PLAYER_WIDTH / 2), (screenHeight - PLAYER_HEIGHT - 30))
    // this.sprite2 = new Sprite(PLAYER_NORMAL_IMG_SRC2, PLAYER_WIDTH, PLAYER_HEIGHT, (screenWidth * 3 / 8 - PLAYER_WIDTH / 2), (screenHeight - PLAYER_HEIGHT - 30))
    // this.sprite3 = new Sprite(PLAYER_NORMAL_IMG_SRC3, PLAYER_WIDTH, PLAYER_HEIGHT, (screenWidth * 5 / 8 - PLAYER_WIDTH / 2), (screenHeight - PLAYER_HEIGHT - 30))
    // this.sprite4 = new Sprite(PLAYER_NORMAL_IMG_SRC4, PLAYER_WIDTH, PLAYER_HEIGHT, (screenWidth * 7 / 8 - PLAYER_WIDTH / 2), (screenHeight - PLAYER_HEIGHT - 30))
    

    // 玩家默认处于屏幕底部居中位置

    // 用于在手指移动的时候标识手指是否已经在飞机上了
    this.touched = false

    this.bullets = []

    // 初始化事件监听
    this.initEvent()
  }

  /**
   * 当手指触摸屏幕的时候
   * 判断手指是否在飞机上
   * @param {Number} x: 手指的X轴坐标
   * @param {Number} y: 手指的Y轴坐标
   * @return {Boolean}: 用于标识手指是否在飞机上的布尔值
   */
  checkIsFingerOnAir(x, y) {
    const deviation = 30

    return !!(x >= this.x - deviation &&
      y >= this.y - deviation &&
      x <= this.x + this.width + deviation &&
      y <= this.y + this.height + deviation)
  }

  /**
   * 根据手指的位置设置飞机的位置
   * 保证手指处于飞机中间
   * 同时限定飞机的活动范围限制在屏幕中
   */
  setAirPosAcrossFingerPosZ(x, y) {
    let disX = x - this.width / 2
    let disY = y - this.height / 2

    if (disX < 0)
      disX = 0

    else if (disX > screenWidth - this.width)
      disX = screenWidth - this.width

    if (disY <= 0)
      disY = 0

    else if (disY > screenHeight - this.height)
      disY = screenHeight - this.height

    this.x = disX
    this.y = disY
  }

  /**
   * 玩家响应手指的触摸事件
   * 改变战机的位置
   */
  initEvent() {
    canvas.addEventListener('touchstart', ((e) => {
      e.preventDefault()

      let x = e.touches[0].clientX
      let y = e.touches[0].clientY

      //
      if (this.checkIsFingerOnAir(x, y)) {
        this.touched = true

        this.setAirPosAcrossFingerPosZ(x, y)
      }

    }).bind(this))

    canvas.addEventListener('touchmove', ((e) => {
      e.preventDefault()

      let x = e.touches[0].clientX
      let y = e.touches[0].clientY

      if (this.touched)
        this.setAirPosAcrossFingerPosZ(x, y)

    }).bind(this))

    canvas.addEventListener('touchend', ((e) => {
      e.preventDefault()

      this.touched = false
    }).bind(this))
  }

  /**
   * 玩家射击操作
   * 射击时机由外部决定
   */
  shoot() {
    let bullet = databus.pool.getItemByClass('bullet', Bullet)

    bullet.init(
      this.x + this.width / 2 - bullet.width / 2,
      this.y - 10,
      10
    )

    databus.bullets.push(bullet)
  }

  /**
   * change the ashcans except the selected one into gray
   * when I replace the src, the image fails to load in time
   * so I resort to renew the sprites, just like the old implementation
   * @param {number} number: the classification of the ashcan selected
   */
  changeColor(number) {
    for(let i = 0; i < this.canNumber; i++) {
      let x = this.ashcans[i].x
      let y = this.ashcans[i].y
      let url
      if(number == 0) url = cans[i]
      else if(i + 1 != number) url = DARK_CAN
      else url = cans[i]
      this.ashcans[i] = new Sprite(url, PLAYER_WIDTH, PLAYER_HEIGHT,
        x, y)
    }
    // switch(number) {
    //   case 0:
    //     this.sprite1 = new Sprite(PLAYER_NORMAL_IMG_SRC1, PLAYER_WIDTH, PLAYER_HEIGHT, (screenWidth / 8 - PLAYER_WIDTH / 2), (screenHeight - PLAYER_HEIGHT - 30))
    //     this.sprite2 = new Sprite(PLAYER_NORMAL_IMG_SRC2, PLAYER_WIDTH, PLAYER_HEIGHT, (screenWidth * 3 / 8 - PLAYER_WIDTH / 2), (screenHeight - PLAYER_HEIGHT - 30))
    //     this.sprite3 = new Sprite(PLAYER_NORMAL_IMG_SRC3, PLAYER_WIDTH, PLAYER_HEIGHT, (screenWidth * 5 / 8 - PLAYER_WIDTH / 2), (screenHeight - PLAYER_HEIGHT - 30))
    //     this.sprite4 = new Sprite(PLAYER_NORMAL_IMG_SRC4, PLAYER_WIDTH, PLAYER_HEIGHT, (screenWidth * 7 / 8 - PLAYER_WIDTH / 2), (screenHeight - PLAYER_HEIGHT - 30))
    //     break
    //   case 1:
    //     this.sprite1 = new Sprite(PLAYER_NORMAL_IMG_SRC1, PLAYER_WIDTH, PLAYER_HEIGHT, (screenWidth / 8 - PLAYER_WIDTH / 2), (screenHeight - PLAYER_HEIGHT - 30))
    //     this.sprite2 = new Sprite(PLAYER_IMG_SRC5, PLAYER_WIDTH, PLAYER_HEIGHT, (screenWidth * 3 / 8 - PLAYER_WIDTH / 2), (screenHeight - PLAYER_HEIGHT - 30))
    //     this.sprite3 = new Sprite(PLAYER_IMG_SRC5, PLAYER_WIDTH, PLAYER_HEIGHT, (screenWidth * 5 / 8 - PLAYER_WIDTH / 2), (screenHeight - PLAYER_HEIGHT - 30))
    //     this.sprite4 = new Sprite(PLAYER_IMG_SRC5, PLAYER_WIDTH, PLAYER_HEIGHT, (screenWidth * 7 / 8 - PLAYER_WIDTH / 2), (screenHeight - PLAYER_HEIGHT - 30))
    //     break
    //   case 2:
    //     this.sprite1 = new Sprite(PLAYER_IMG_SRC5, PLAYER_WIDTH, PLAYER_HEIGHT, (screenWidth / 8 - PLAYER_WIDTH / 2), (screenHeight - PLAYER_HEIGHT - 30))
    //     this.sprite2 = new Sprite(PLAYER_NORMAL_IMG_SRC2, PLAYER_WIDTH, PLAYER_HEIGHT, (screenWidth * 3 / 8 - PLAYER_WIDTH / 2), (screenHeight - PLAYER_HEIGHT - 30))
    //     this.sprite3 = new Sprite(PLAYER_IMG_SRC5, PLAYER_WIDTH, PLAYER_HEIGHT, (screenWidth * 5 / 8 - PLAYER_WIDTH / 2), (screenHeight - PLAYER_HEIGHT - 30))
    //     this.sprite4 = new Sprite(PLAYER_IMG_SRC5, PLAYER_WIDTH, PLAYER_HEIGHT, (screenWidth * 7 / 8 - PLAYER_WIDTH / 2), (screenHeight - PLAYER_HEIGHT - 30))
    //     break
    //   case 3:
    //     this.sprite1 = new Sprite(PLAYER_IMG_SRC5, PLAYER_WIDTH, PLAYER_HEIGHT, (screenWidth / 8 - PLAYER_WIDTH / 2), (screenHeight - PLAYER_HEIGHT - 30))
    //     this.sprite2 = new Sprite(PLAYER_IMG_SRC5, PLAYER_WIDTH, PLAYER_HEIGHT, (screenWidth * 3 / 8 - PLAYER_WIDTH / 2), (screenHeight - PLAYER_HEIGHT - 30))
    //     this.sprite3 = new Sprite(PLAYER_NORMAL_IMG_SRC3, PLAYER_WIDTH, PLAYER_HEIGHT, (screenWidth * 5 / 8 - PLAYER_WIDTH / 2), (screenHeight - PLAYER_HEIGHT - 30))
    //     this.sprite4 = new Sprite(PLAYER_IMG_SRC5, PLAYER_WIDTH, PLAYER_HEIGHT, (screenWidth * 7 / 8 - PLAYER_WIDTH / 2), (screenHeight - PLAYER_HEIGHT - 30))
    //     break
    //   case 4:
    //     this.sprite1 = new Sprite(PLAYER_IMG_SRC5, PLAYER_WIDTH, PLAYER_HEIGHT, (screenWidth / 8 - PLAYER_WIDTH / 2), (screenHeight - PLAYER_HEIGHT - 30))
    //     this.sprite2 = new Sprite(PLAYER_IMG_SRC5, PLAYER_WIDTH, PLAYER_HEIGHT, (screenWidth * 3 / 8 - PLAYER_WIDTH / 2), (screenHeight - PLAYER_HEIGHT - 30))
    //     this.sprite3 = new Sprite(PLAYER_IMG_SRC5, PLAYER_WIDTH, PLAYER_HEIGHT, (screenWidth * 5 / 8 - PLAYER_WIDTH / 2), (screenHeight - PLAYER_HEIGHT - 30))
    //     this.sprite4 = new Sprite(PLAYER_NORMAL_IMG_SRC4, PLAYER_WIDTH, PLAYER_HEIGHT, (screenWidth * 7 / 8 - PLAYER_WIDTH / 2), (screenHeight - PLAYER_HEIGHT - 30))
    //     break
    // }
  }

  /**
   * draw the ashcans to the canvas
   * @param ctx: the rendering context
   */
  drawToCanvas(ctx) {
    for(let i = 0; i < this.canNumber; i++) {
      this.ashcans[i].drawToCanvas(ctx)
    }
    // this.sprite1.drawToCanvas(ctx)
    // this.sprite2.drawToCanvas(ctx)
    // this.sprite3.drawToCanvas(ctx)
    // this.sprite4.drawToCanvas(ctx)
  }

  /**
   * judge which ash can was touched according to the given position
   * the old implementation was not flexible at all
   * @param {number} x: the touch position
   * @param {number} y: the touch position
   * @return {number} which ashcan is touched
   */
  whichIsTouched(x, y) {
    for(let i = 0; i < this.canNumber; i++) {
      if (x > ((i + 1) * (screenWidth - 10) / (this.canNumber + 1) + 5 - PLAYER_WIDTH / 2) && 
        x < ((i + 1) * (screenWidth - 10) / (this.canNumber + 1) + 5 + PLAYER_WIDTH / 2) && 
      y > (screenHeight - PLAYER_HEIGHT - 30) && 
      y < (screenHeight - 30)) {
        console.log(i + 1)
        return i + 1
      }
    }
    return 0
    // if (x > (screenWidth / 8 - PLAYER_WIDTH / 2) && x < (screenWidth / 8 + PLAYER_WIDTH / 2) && y < (screenHeight - 30) && y > (screenHeight - PLAYER_HEIGHT - 30)) {
    //   return 1
    // } else if (x > (screenWidth * 3 / 8 - PLAYER_WIDTH / 2) && x < (screenWidth * 3/ 8 + PLAYER_WIDTH / 2) && y < (screenHeight - 30) && y > (screenHeight - PLAYER_HEIGHT - 30)) {
    //   return 2
    // } else if (x > (screenWidth * 5 / 8 - PLAYER_WIDTH / 2) && x < (screenWidth * 5/ 8 + PLAYER_WIDTH / 2) && y < (screenHeight - 30) && y > (screenHeight - PLAYER_HEIGHT - 30)) {
    //   return 3
    // } else if (x > (screenWidth * 7 / 8 - PLAYER_WIDTH / 2) && x < (screenWidth * 7/ 8 + PLAYER_WIDTH / 2) && y < (screenHeight - 30) && y > (screenHeight - PLAYER_HEIGHT - 30)) {
    //   return 4
    // }
    // return 0
  }
}