import Sprite  from './sprite'
import DataBus from '../databus'

let databus = new DataBus()
// delete an element from an array
const del = (arr, val) => {
  for(let i = 0; i < arr.length; i++) {
    if(arr[i] === val){
      arr.splice(i, 1)
    }
  }
}

const __ = {
  timer: Symbol('timer'),
}

/**
 * 简易的帧动画类实现
 */
export default class Animation extends Sprite {
  constructor(imgSrc, width, height) {
    super(imgSrc, width, height)

    // 当前动画是否播放中
    this.isPlaying = false

    // 动画是否需要循环播放
    this.loop = false

    // 每一帧的时间间隔
    this.interval = 1000 / 60

    // 帧定时器
    this[__.timer] = null

    // 当前播放的帧
    this.index = -1

    // 总帧数
    this.count = 0

    // 帧图片集合
    this.imgList = []

    // the event handler if exist
    this.handler = null

    /**
     * 推入到全局动画池里面
     * 便于全局绘图的时候遍历和绘制当前动画帧
     */
    // databus.animations.push(this)
  }

  /**
   * 初始化帧动画的所有帧
   * 为了简单，只支持一个帧动画
   */
  initFrames(imgList) {
    imgList.forEach((imgSrc) => {
      let img = new Image()
      img.src = imgSrc

      this.imgList.push(img)
    })

    this.count = imgList.length
  }

  /**
   * init the zoom animation
   * @param {number} count: the frame number.
   * @param {function} handler: the touch event handler.
   */
  initZoom(count, handler, move, zoom_x = 0, zoom_y = 0) {
    this.imgList.push(this.img)
    this.count = count
    this.handler = handler
    this.zoom = move

    this.zoom_x = zoom_x
    this.zoom_y = zoom_y

  }

  // 将播放中的帧绘制到canvas上
  aniRender(ctx) {
    ctx.drawImage(
      this.imgList[this.index],
      this.x,
      this.y,
      this.width  * 1.2,
      this.height * 1.2
    )
  }

  /** 
   * this animation is specially made for the buttons
   * it can zoom it according the passing function and move it lineaily.
   * @param {Context} ctx: the drawing context.
   */
  aniZoom(ctx) {
    let k = this.zoom(10*(this.index + 1)/this.count)
    let img = this.imgList[0]

    this.x += this.zoom_x / this.count
    this.y += this.zoom_y / this.count

    ctx.drawImage(
      img,
      this.center_x - k * img.width/2,
      this.center_y - k * img.height/2,
      k * img.width,
      k * img.height
    )
  }

  // 播放预定的帧动画
  playAnimation(index = 0, loop = false) {
    databus.animations.push(this)
    // 动画播放的时候精灵图不再展示，播放帧动画的具体帧
    this.visible   = false

    this.isPlaying = true
    this.loop      = loop

    this.index     = index

    if ( this.interval > 0 && this.count ) {
      this[__.timer] = setInterval(
        this.frameLoop.bind(this),
        this.interval
      )
    }
  }

  // 停止帧动画播放
  stop() {
    this.isPlaying = false
    del(databus.animations, this)

    if ( this[__.timer] )
      clearInterval(this[__.timer])

    if(this.handler != null) this.handler()
  }

  // 帧遍历
  frameLoop() {
    this.index++

    if ( this.index > this.count - 1 ) {
      if ( this.loop ) {
        this.index = 0
      }

      else {
        this.index--
        this.stop()
      }
    }
  }
}
