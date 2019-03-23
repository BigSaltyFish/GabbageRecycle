import DataBus from '../databus.js'
import Animation from '../base/animation.js'

/**
 * this the class to implement the buttons
 * and will implement a simple animation for them
 */
export default class Button extends Animation {
  constructor(img=null, src=null, x=0, y=0) {
    super(null, 0, 0)
    if(src != null && src != undefined) {
      this.img = new Image()
      this.img.src = src
    } else{
      this.img = img
    }
    this.x = x
    this.y = y
    this.center_x = x
    this.center_y = y
  }

  /**
   * this is the function to put the button onto the screen.
   */
  drawOn(ctx, x1, y1, w1, h1, x2, y2, w2, h2) {
    if(!this.isPlaying){
      ctx.drawImage(
        this.img,
        x1, y1, w1, h1, x2, y2, w2, h2
      )
    }

    this.x = x2
    this.y = y2
    this.center_x = x2 + w2/2
    this.center_y = y2 + h2/2
  }

  /**
   * the function to create the animation after click
   * and undertake the event handler
   * @param {function} handler: the handler of the touch event.
   */
  onClick(handler, move, handleFrame = 11, zoom_x = 0, zoom_y = 0) {
    this.stop()
    this.initZoom(11, handler, handleFrame, move, zoom_x, zoom_y)
    this.playAnimation()
  }

  beginAnimation(isLoop, move, zoom_x = 0, zoom_y = 0) {
    this.initZoom(100, null, 0, move, zoom_x, zoom_y)
    this.playAnimation(0, isLoop)
  }
}