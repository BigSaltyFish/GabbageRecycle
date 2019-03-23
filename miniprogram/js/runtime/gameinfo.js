import DataBus from '../databus.js'
const screenWidth  = window.innerWidth
const screenHeight = window.innerHeight

let databus = new DataBus()
let heart=new Image()
heart.src = 'images/garbages/heart.png'


export default class GameInfo {
  constructor(gameMode) {
    this.start = new Date()
    this.gameData = {
      mode: gameMode, 
      startTime: this.start.toUTCString(),
      record: []
    }
  }
  renderGameScore(ctx, score) {
    ctx.fillStyle = "#ffffff"
    ctx.font      = "20px Arial"

    ctx.fillText(
      score,
      10,
      30
    )
  }

  renderGameLife(ctx,lifeNumber){
    for(let i=0;i<lifeNumber;i++){
      ctx.drawImage(
        heart, 
        0, 0, heart.width, heart.height, 
        2,30+30*i, 30, 30)
    }
  }

  renderGameOver(ctx, score, personalHighScore) {
    let img = databus.images.pop
    ctx.drawImage(
      img, 
      0, 0, img.width, img.height,
      screenWidth / 2 - img.width / 2, screenHeight / 2 - img.height / 2,
      img.width, img.height
    )
    ctx.fillStyle = "#000000"
    ctx.font    = "20px Arial"
    ctx.textAlign = "center"

    ctx.fillText(
      'Game Over!',
      screenWidth / 2,
      screenHeight / 2
    )

    ctx.save()
    ctx.font = "30px Helvetica bold"
    ctx.fillText(
      '' + score,
      screenWidth / 2,
      screenHeight / 2 + 50
    )
    ctx.restore()

    if (personalHighScore) {
      ctx.fillText(
        '最高分: ' + personalHighScore,
        screenWidth / 2,
        screenHeight / 2 - 100 + 180
      )
    }
    
    ctx.fillText(
      '重新开始',
      screenWidth / 2,
      screenHeight / 2 - 100 + 205
    )

    /**
     * 重新开始按钮区域
     * 方便简易判断按钮点击
     */
    this.btnArea = {
      startX: screenWidth / 2 - 40,
      startY: screenHeight / 2 - 100 + 180,
      endX  : screenWidth / 2  + 50,
      endY  : screenHeight / 2 - 100 + 255
    }
  }
}

