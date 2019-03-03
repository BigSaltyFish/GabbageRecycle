import Player from './player/index'
import Enemy from './npc/enemy'
import BackGround from './runtime/background'
import GameInfo from './runtime/gameinfo'
import Music from './runtime/music'
import DataBus from './databus'
import Ashcan from './player/ashcan'
import HOME from './home/home'
let ctx = canvas.getContext('2d')
let databus = new DataBus()
let background = databus.images.home_page
let tipImg = databus.images.tipImg

const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

let intro_bottom = new Image()
intro_bottom.src = 'images/intro/underLayer.png'
let logo = new Image()
logo.src = 'images/intro/logo.png'
let earth = new Image()
earth.src = 'images/intro/earth.png'
let introBtn = new Image()
introBtn.src = 'images/intro/start.png'
let introText = new Image()
introText.src = 'images/intro/introduction.png'
// these are for the button in introduction
let introBtnX = 0
let introBtnY = 0
let rad = 0


let startbg = new Image()
startbg.src = 'images/start/bg.png'

wx.cloud.init()
const db = wx.cloud.database({
  env: 'classification-test-d20ada'
})

/**
 * 游戏主函数
 */
export default class Main {
  constructor() {
    // 维护当前requestAnimationFrame的id
    this.aniId = 0
    this.personalHighScore = null
    // 0 present the normal and 1 present the difficult
    databus.mode = 0
    // display the introduction page
    this.pause(this.introTouch, this.intro_render)
    this.login()
  }

  test() {
    wx.cloud.callFunction({
      name: 'test',
      data: {
        a: 1,
        b: 2
      }
    })
      .then(res => {
        console.log(res.result)
      })
      .catch(console.error)
  }

  /**
   * get the openid, record and the game time.
   */
  login() {
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        window.openid = res.result.openid
        this.personalHighScore = res.result.score
        this.gameTime = res.result.gameTime
      },
      fail: err => {
        console.error('get openid failed with error', err)
      }
    })
  }

  // abondoned
  prefetchHighScore() {
    // 预取历史最高分
    db.collection('score').doc(`${window.openid}-score`).get()
      .then(res => {
        if (this.personalHighScore) {
          if (res.data.max > this.personalHighScore) {
            this.personalHighScore = res.data.max
          }
        } else {
          this.personalHighScore = res.data.max
        }
      })
      .catch(err => {
        console.error('db get score catch error', err)
        this.prefetchHighScoreFailed = true
      })
  }

  /**
   * clear the initial page and start the game loop
   */
  restart() {
    databus.reset()

    canvas.removeEventListener(
      'touchstart',
      this.touchHandler
    )
    this.hasEventBind = true
    this.touchHandler = this.touchEventHandler.bind(this)
    canvas.addEventListener('touchstart', this.touchHandler)

    this.bg = new BackGround(ctx)
    this.player = new Ashcan(ctx, databus.mode)
    this.gameinfo = new GameInfo(databus.mode)
    this.music = new Music()

    databus.cans = this.player

    this.bindLoop = this.loop.bind(this)
    this.hasEventBind = false

    // 清除上一局的动画
    window.cancelAnimationFrame(this.aniId);

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }

  /**
   * 随着帧数变化的敌机生成逻辑
   * 帧数取模定义成生成的频率
   */
  enemyGenerate() {
    if (databus.frame % 100 === 0) {
      let enemy = databus.pool.getItemByClass('enemy', Enemy)
      // enemy.init(6)
      enemy.init(2, Math.floor(Math.random() * 4) + 1)
      databus.enemys.push(enemy)
    }
  }

  /**
   * response the touch on the cans
   * @param {object} e: the touch event
   */
  touchEventHandler(e) {
    e.preventDefault()
    const normalName = ['dry', 'recyclable', 'wet', 'harmful']

    let x = e.touches[0].clientX
    let y = e.touches[0].clientY
    let classification = this.player.whichIsTouched(x, y)

    let that = this

    if (databus.enemys.length == 0) {
      this.player.changeColor(0)
    } else {
      let enemy = databus.enemys[0]
      if (enemy.isLiving != 1) {
        if (enemy.classification == classification) {
          enemy.comeout(enemy.x, enemy.y, enemy.classification)
          this.player.changeColor(databus.enemys[0].classification)
          if (databus.mode == 0) databus.score += 20
          else if (databus.mode == 1) databus.score += 30
        }

        let piece = {
          choose: normalName[classification - 1],
          answer: normalName[enemy.classification - 1]
        }
        this.gameinfo.gameData.record.push(piece)
      }
      
    }

    if (databus.gameOver) {
      let area = this.gameinfo.btnArea
      if (x >= area.startX &&
        x <= area.endX &&
        y >= area.startY &&
        y <= area.endY) {
        this.restart()
      }
    }

  }

  /**
   * canvas重绘函数
   * 每一帧重新绘制所有的需要展示的元素
   */
  render() {
    // clear the old canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // render the scrolling background
    this.bg.render(ctx)
    // draw the enemies onto the canvas
    databus.enemys.forEach((item) => {
        item.drawToCanvas(ctx)
      })
    // draw the four ashcans onto the canvas
    this.player.drawToCanvas(ctx)
    // play the animations in the queue
    databus.animations.forEach((ani) => {
      if (ani.isPlaying) {
        ani.aniRender(ctx)
      }
    })

    this.gameinfo.renderGameScore(ctx, databus.score)

    this.gameinfo.renderGameLife(ctx,databus.life)

    // 游戏结束停止帧循环
    if (databus.gameOver) {
      this.gameinfo.renderGameOver(
        ctx,
        databus.score,
        this.personalHighScore
      )

      if (!this.hasEventBind) {
        this.hasEventBind = true
        this.touchHandler = this.touchEventHandler.bind(this)
        canvas.addEventListener('touchstart', this.touchHandler)
      }
    }
  }

  // 游戏逻辑更新主函数
  update() {
    if (databus.gameOver)
      return;

    // this.bg.update()
    let that = this

    databus.enemys.forEach((item) => {
        item.update()
        if (item.isLiving == -1) {

          if(databus.life==1){
            databus.life = databus.life - 1
            databus.gameOver = true

            let refresh = databus.score > that.personalHighScore
            let end = new Date()
            that.gameinfo.gameData.score = databus.score
            that.gameinfo.gameData.endTime = end.toUTCString()
            that.gameinfo.gameData.gameTime = end.getTime() - 
              that.gameinfo.start.getTime()
            let tmp = that.gameinfo.gameData
            let time = tmp.gameTime + that.gameTime
            wx.cloud.callFunction({
              name: 'upload',
              data: {
                openid: window.openid,
                breakRec: refresh,
                record: tmp,
                gameTime: time
              }
            })
            wx.setUserCloudStorage({
              KVDataList: {
                "score": tmp.score
              },
              success: res => console.log(res),
              fail: err => console.log(err)
            })

          }else{
            databus.life = databus.life - 1
          }
          
          return;
        }else{
          
        }
      })
    // console.log(databus.updateColor)
    if (databus.updateColor==1){
      this.player.changeColor(0)
      databus.updateColor=0
    }
    
    this.enemyGenerate()

    // if (databus.frame % 20 === 0) {
    //   // this.player.shoot()
    //   this.music.playShoot()
    // }
  }

  // 实现游戏帧循环
  loop() {
    databus.frame++

    this.update()
    this.render()

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }

  /**
   * render the introduction page
   */
  intro_render() {
    ctx.drawImage(intro_bottom, 
    0, 0, 
    intro_bottom.width, intro_bottom.height, 
    0, 0, screenWidth, screenHeight)

    ctx.drawImage(
      logo,
      screenWidth/2 - logo.width/2, screenHeight/19,
      logo.width, logo.height
    )

    ctx.drawImage(
      earth,
      screenWidth/2 - earth.width/2, 22*screenHeight/100, 
      earth.width, earth.height
    )
    //this is the center of the start button
    introBtnX = screenWidth / 2 + earth.width / 2
    introBtnY = 22 * screenHeight / 100 + earth.height
    rad = introBtn.width / 2
    ctx.drawImage(
      introBtn,
      introBtnX - introBtn.width/2, introBtnY - introBtn.height/2,
      introBtn.width, introBtn.height
    )
    // ctx.font = "18px bold 黑体"
    // ctx.fillStyle = "black"
    // ctx.textAlign = "left"
    // ctx.textBaseline = "middle"
    // ctx.fillText("以上海为例，政府确立目标在2020年，上海生活垃圾综合处理能力要达到3.28万吨/日心上，而目前上海的实际垃圾处理能力公2万多吨/日。垃圾的不正确放置导致了资源的低效利用，那我们又该如何正确进行垃圾分类呢？", screenWidth/5, y+introBtn.height/2 + 5)

    ctx.drawImage(
      introText,
      0, 0,
      introText.width, introText.height,
      screenWidth / 20, introBtnY + introBtn.height / 2 + 5,
      9 * screenWidth / 10, (9 * screenWidth / 10)*(introText.height/introText.width)
    )
  }

  /**
   * the touch handler for the three buttons on the initial page.
   * note that the restart function will remove the touch handler, 
   * so the function should return immediately after the touch response.
   * @param e the touch event
   */
  game_start(e) {
    e.preventDefault()

    let x = e.touches[0].clientX
    let y = e.touches[0].clientY

    area = this.bg.modeBtnArea

    if (x >= area.startX &&
      x <= area.endX &&
      y >= area.startY &&
      y <= area.endY) {
      this.changeMode()
      return;
    }

    area = this.bg.rankBtnArea

    if (x >= area.startX &&
      x <= area.endX &&
      y >= area.startY &&
      y <= area.endY) {
      console.log('rank!')
      return;
    }

    let area = this.bg.startBtnArea

    if (x >= area.startX &&
      x <= area.endX &&
      y >= area.startY &&
      y <= area.endY) {
      this.pause(this.tipTouch, this.tip_render)
      return;
    }

  }

  /**
   * change the mode of the game, together the icon of the mode button
   */
  changeMode() {
    databus.mode = (databus.mode + 1) % 2
    this.bg.changeModeIcon()
  }

  /**
   * the touch handler in the introduction page, 
   * start the game when pressed the button.
   * @param {object} e: the touch event
   */
  introTouch(e) {
    e.preventDefault()
    let x = e.touches[0].clientX
    let y = e.touches[0].clientY

    if(this.distance(x, introBtnX, y, introBtnY) <= rad*rad){
      this.home()
    }
  }

  /**
   * compute the distance of the points.
   */
  distance(x1, x2, y1, y2) {
    return (x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2)
  }


  home() {
    canvas.removeEventListener(
      'touchstart',
      this.touchHandler
    )
    this.hasEventBind = true
    this.touchHandler = this.game_start.bind(this)
    canvas.addEventListener('touchstart', this.touchHandler)
    this.bg = new HOME(ctx)
    this.bindLoop = this.home_loop.bind(this)
    this.hasEventBind = false

    // 清除上一局的动画
    window.cancelAnimationFrame(this.aniId);

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )

  }
  home_render() {
    ctx.clearRect(0, 0, screenWidth, screenHeight)

    this.bg.render(ctx)
  }
  home_loop() {
    this.home_render()
    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }

  /**
   * the function to render the tip on the screen.
   * @param {number} gameMode: 0 for normal and 1 for difficult
   */
  tip_render(gameMode) {
    // this.bg.bgRender(ctx)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(
      background,
      145,
      0,
      screenWidth,
      screenHeight,
      0,
      0,
      screenWidth,
      screenHeight
    )

    ctx.drawImage(
      tipImg,
      0, 0, 
      tipImg.width, tipImg.height, 
      screenWidth / 6, screenHeight / 2 - screenWidth / 3, 
      4 * screenWidth / 6, 2 * screenWidth / 3)
  }

  /**
   * the touch handler for the tip
   * @param {object} e: the touch event
   */
  tipTouch(e) {
    e.preventDefault()
    this.restart()
  }

  /**
   * pause the game to display something.
   * @param {function} touchHandler: the touch handler for the page
   * @param {function} render: the function to draw the page
   */
  pause(touchHandler, render) {
    canvas.removeEventListener(
      'touchstart',
      this.touchHandler
    )
    this.hasEventBind = true
    this.touchHandler = touchHandler.bind(this)
    canvas.addEventListener('touchstart', this.touchHandler)
    render()
    this.bindLoop = (() => {
      render()
      this.aniId = window.requestAnimationFrame(
        this.bindLoop,
        canvas
      )
    }).bind(this)
    this.hasEventBind = false

    // 清除上一局的动画
    window.cancelAnimationFrame(this.aniId);

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }
}