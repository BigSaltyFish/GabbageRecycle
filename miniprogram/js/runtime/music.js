import DataBus from '../databus.js'

let instance
let databus = new DataBus()

/**
 * 统一的音效管理器
 */
export default class Music {
  constructor() {
    if ( instance )
      return instance

    instance = this

    this.bgmAudio = new Audio()
    this.bgmAudio.loop = true
    this.bgmAudio.src  = 'audio/bgm.mp3'

    this.playAudio = new Audio()
    this.playAudio.loop = true
    this.playAudio.src = 'audio/play.mp3'

    this.touch = new Audio()
    this.touch.src = 'audio/touch.mp3'
  }

  playBgm() {
    if(databus.music) {
      this.playAudio.pause()
      this.bgmAudio.play()
    }
  }

  gameBgm() {
    if(databus.music) {
      this.bgmAudio.pause()
      this.playAudio.play()
    }
  }

  playTouch() {
    if(databus.sound) {
      this.touch.play()
    }
  }

  playFlip(onPlay) {
    if(onPlay) this.bgmAudio.play()
    else this.bgmAudio.pause()
  }
}
