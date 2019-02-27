import Animation from '../base/animation'
import DataBus from '../databus'
import Ashcan from '../player/ashcan.js'

const ENEMY_WIDTH = 60
const ENEMY_HEIGHT = 60

const screenWidth = window.innerWidth
const screenHeight = window.innerHeight
const PLAYER_WIDTH = 25 * 2
const PLAYER_HEIGHT = 63 * 2

const normalGabbage = new Array(
  {
    name: 'dry',
    size: 5
  },
  {
    name: 'recyclable',
    size: 7
  },
  {
    name: 'wet',
    size: 5
  },
  {
    name: 'harmful',
    size: 6
  }
)

const difficultGabbage = new Array(
  {
    name: 'coarse',
    size: 4
  },
  {
    name: 'combustible',
    size: 8
  },
  {
    name: 'non-burnable',
    size: 7
  },
  {
    name: 'plastic-packaging',
    size: 4
  },
  {
    name: 'resource',
    size: 2
  }
)

// a set for all the gabbages
const gabbageSet = new Array(
  normalGabbage, difficultGabbage
)

const __ = {
  speed: Symbol('speed'),
  move: Symbol('move')
}

let databus = new DataBus()

function rnd(start, end) {
  return Math.floor(Math.random() * (end - start) + start)
}

export default class Enemy extends Animation {
  constructor() {
    let gabbageNumber = 0
    let modeString = ''
    if(databus.mode == 0) {
      gabbageNumber = 4
      modeString = 'normal/'
    }
    else if(databus.mode == 1) {
      gabbageNumber = 5
      modeString = 'difficult/'
    }

    let CLASSIFICATION = Math.floor(Math.random() * gabbageNumber) + 1
    let classification = CLASSIFICATION
    let NUMBER = Math.floor(Math.random() * 
      gabbageSet[databus.mode][classification - 1].size)
    
    let ENEMY_IMG = databus.images.gabbage[databus.mode][classification - 1][NUMBER]

    super(ENEMY_IMG, ENEMY_WIDTH, ENEMY_HEIGHT)
    this.classification = classification
  }

  init(speed) {
    let gabbageNumber = 0
    let modeString = ''
    if (databus.mode == 0) {
      gabbageNumber = 4
      modeString = 'normal/'
    }
    else if (databus.mode == 1) {
      gabbageNumber = 5
      modeString = 'difficult/'
    }

    this.color_bright = 0
    this.x = rnd(0, window.innerWidth - ENEMY_WIDTH)
    this.y = -this.height
    this[__.speed] = speed
    this[__.move] = 0
    this.isLiving = 0
    this.visible = true
    let CLASSIFICATION = Math.floor(Math.random() * gabbageNumber) + 1
    let classification = CLASSIFICATION
    let NUMBER = Math.floor(Math.random() *
      gabbageSet[databus.mode][classification - 1].size)

    let ENEMY_IMG = databus.images.gabbage[databus.mode][classification - 1][NUMBER]
    this.classification = classification
    this.img = ENEMY_IMG
    // console.log(this.classification)
  }

  // 预定义爆炸的帧动画
  initExplosionAnimation() {
    let frames = []

    const EXPLO_IMG_PREFIX = 'images/explosion'
    const EXPLO_FRAME_COUNT = 19

    for (let i = 0; i < EXPLO_FRAME_COUNT; i++) {
      frames.push(EXPLO_IMG_PREFIX + (i + 1) + '.png')
    }

    this.initFrames(frames)
  }

  // 每一帧更新子弹位置
  // 这个是垃圾桶的位置吧？
  update() {
    this.y += this[__.speed]

    this.x += this[__.move]

    // 对象回收
    if (this.y > (window.innerHeight - PLAYER_HEIGHT / 2 - 30)) {
      if (this.isLiving == 0){
        this.isLiving = -1
      }
        
      databus.updateColor = 1
      databus.removeEnemey(this)
    }

  }
  comeout(x, y, classifition) {
    this.isLiving = 1
    let center_x = databus.cans.ashcans[classifition - 1].center_x
    let center_y = databus.cans.ashcans[classifition - 1].center_y

    let error_x = center_x - x - ENEMY_WIDTH / 2
    let error_y = center_y - y - ENEMY_HEIGHT / 2
    let ratio = error_y / this[__.speed]
    this[__.speed] = this[__.speed] * 5
    this[__.move] = error_x / ratio * 5

  }
}