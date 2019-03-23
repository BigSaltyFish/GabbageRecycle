import Player from './player/index'
import Enemy from './npc/enemy'
import BackGround from './runtime/background'
import GameInfo from './runtime/gameinfo'
import Music from './runtime/music'
import DataBus from './databus'
import Ashcan from './player/ashcan'
import HOME from './home/home'
import Button from './display/button.js'
const openDataContext = wx.getOpenDataContext()
const sharedCanvas = openDataContext.canvas

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
let introBtn = new Button(null, 'images/intro/start.png')

let normalTip = new Image()
normalTip.src = 'images/tip/normal.png'
let diffTip = new Image()
diffTip.src = 'images/tip/diff.png'
let normalTipText = new Image()
normalTipText.src = 'images/tip/normalText.png'
let diffTipText = new Image()
diffTipText.src = 'images/tip/diffText.png'

let introText = new Image()
introText.src = 'images/intro/introduction.png'

// these are for the button in introduction
let rad = 0

/**
   * calculating the zoom rate by the index.
   * @param {number} index: the index of the animation, from 0 to 10.
   * @return {number}: the zoom rate.
   */
const zoom = (index) => {
  return (4 * (index * index) / 25 - 8 * index / 5 + 10) / 10
}

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

    // render the shared canvas
    openDataContext.postMessage({
      option: 'initialize',
      size: [screenWidth, screenHeight]
    })

    this.music = new Music()
    this.music.playBgm()

    introBtn.beginAnimation(true, zoom, 0, 0)

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
    this.music.gameBgm()

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
    if (classification != 0) this.music.playTouch()

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
        this.music.playBgm()
        this.home()
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
    // draw the ashcans onto the canvas
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

      // if (!this.hasEventBind) {
      //   this.hasEventBind = true
      //   this.touchHandler = this.touchEventHandler.bind(this)
      //   canvas.addEventListener('touchstart', this.touchHandler)
      // }
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
            if(refresh) {
              that.personalHighScore = databus.score
              openDataContext.postMessage({
                option: 'update',
              })
            }
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
              KVDataList: [
                {
                  key: "score",
                  value: that.personalHighScore.toString()
                }
              ],
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
    ctx.clearRect(0, 0, screenWidth, screenHeight)

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
    introBtn.x = screenWidth / 2 + earth.width / 2 - introBtn.img.width/2
    introBtn.y = 22 * screenHeight / 100 + earth.height - introBtn.img.height/2
    rad = introBtn.img.width / 2
    introBtn.drawOn(
      ctx, 
      0, 0, 
      introBtn.img.width, introBtn.img.height, 
      introBtn.x, introBtn.y,
      introBtn.img.width, introBtn.img.height
    )

    ctx.drawImage(
      introText,
      0, 0,
      introText.width, introText.height,
      screenWidth / 20, introBtn.y + introBtn.img.height + 5,
      9 * screenWidth / 10, (9 * screenWidth / 10)*(introText.height/introText.width)
    )

    //play the animations
    databus.animations.forEach((ani) => {
      if(ani.isPlaying) {
        ani.aniZoom(ctx)
      }
    })
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
    
    let area = this.bg.modeBtnArea

    if (x >= area.startX &&
      x <= area.endX &&
      y >= area.startY &&
      y <= area.endY) {
      this.music.playTouch()
      this.bg.modeBtn.onClick(() => {
        if(!this.bg.modePoped) {
          // do not change the sequence
          this.bg.showMode(this)
          this.bg.modePoped = true
        }
      }, zoom)
      return;
    }

    area = this.bg.infoBtnArea

    if (x >= area.startX &&
      x <= area.endX &&
      y >= area.startY &&
      y <= area.endY) {
      this.music.playTouch()
      this.bg.infoBtn.onClick(() => {
        this.pause(this.rankTouch, this.rankRender)
      }, zoom)
      return;
    }

    area = this.bg.settingBtnArea

    if (x >= area.startX &&
      x <= area.endX &&
      y >= area.startY &&
      y <= area.endY) {
      this.music.playTouch()
      this.bg.settingBtn.onClick(() => {
        if(!this.bg.settingPoped){
          this.bg.showSetting(this)
          this.bg.settingPoped = true
        }
      }, zoom)
      return;
    }

    if(this.bg.modePoped) {
      let button = this.bg.normalModeBtn
      area = {
        startX: button.x,
        startY: button.y,
        endX: button.x + button.img.width,
        endY: button.y + button.img.height
      }
      if (x >= area.startX &&
        x <= area.endX &&
        y >= area.startY &&
        y <= area.endY) {
        this.music.playTouch()
        button.onClick(() => {
          databus.mode = 0
          this.pause(this.tipTouch, this.tip_render)
        }, zoom)
        return;
        }

      button = this.bg.difficultModeBtn
      area = {
        startX: button.x,
        startY: button.y,
        endX: button.x + button.img.width,
        endY: button.y + button.img.height
      }
      if (x >= area.startX &&
        x <= area.endX &&
        y >= area.startY &&
        y <= area.endY) {
        this.music.playTouch()
        button.onClick(() => {
          databus.mode = 1
          this.pause(this.tipTouch, this.tip_render)
        }, zoom)
        return;
      }
    }

    if(this.bg.settingPoped) {
      let button = this.bg.bgmBtn
      area = {
        startX: button.x,
        startY: button.y,
        endX: button.x + button.img.width,
        endY: button.y + button.img.height
      }
      if (x >= area.startX &&
        x <= area.endX &&
        y >= area.startY &&
        y <= area.endY) {
        this.music.playTouch()
        button.onClick(() => {
          databus.music = !databus.music
          this.music.playFlip(databus.music)
        }, zoom)
        return;
      }

      button = this.bg.soundBtn
      area = {
        startX: button.x,
        startY: button.y,
        endX: button.x + button.img.width,
        endY: button.y + button.img.height
      }
      if (x >= area.startX &&
        x <= area.endX &&
        y >= area.startY &&
        y <= area.endY) {
        this.music.playTouch()
        button.onClick(() => {
          databus.sound = !databus.sound
        }, zoom)
        return;
      }
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
    this.music.playTouch()
    let x = e.touches[0].clientX
    let y = e.touches[0].clientY

    if(this.distance(x, introBtn.x + introBtn.img.width/2, y, introBtn.y + introBtn.img.height/2) <= rad*rad){
      introBtn.onClick(() => this.home(), zoom)
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

    databus.animations.forEach((ani) => {
      if (ani.isPlaying) {
        ani.aniZoom(ctx)
      }
    })
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
    let img
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    img = databus.images.tip
    ctx.drawImage(
      img, 
      0, 0, img.width, img.height,
      0, 0, screenWidth, screenHeight
    )

    if(databus.mode == 0) img = normalTip
    else img = diffTip
    let drawWidth = 2 * screenWidth / 3
    let drawHeight = (2 * img.width / 3) * img.height / img.width
    ctx.drawImage(
      img,
      0, 0, img.width, img.height,
      screenWidth / 2 - drawWidth / 2, screenHeight / 12 - drawHeight / 2,
      drawWidth, drawHeight
    )

    if (databus.mode == 0) img = normalTipText
    else img = diffTipText
    drawWidth = 5 * screenWidth / 6
    drawHeight = (5 * img.width / 6) * img.height / img.width
    ctx.drawImage(
      img,
      0, 0, img.width, img.height,
      screenWidth / 2 - drawWidth / 2, screenHeight / 5,
      drawWidth, drawHeight
    )

    img = databus.images.heart
    ctx.drawImage(
      img,
      0, 0, img.width, img.height,
      screenWidth - img.width, screenHeight - img.height,
      img.width, img.height
    )

  }

  /**
   * the touch handler for the tip
   * @param {object} e: the touch event
   */
  tipTouch(e) {
    e.preventDefault()
    this.music.playTouch()
    this.restart()
  }

  rankTouch(e) {
    e.preventDefault()
    this.music.playTouch()
    this.home()
  }

  rankRender() {
    // sharedCanvas.width = screenWidth
    // sharedCanvas.height = screenHeight
    ctx.clearRect(0, 0, screenWidth, screenHeight)
    ctx.drawImage(
      sharedCanvas,
      0, 0,
      screenWidth, screenHeight)
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