const fs = wx.getFileSystemManager()
wx.cloud.init()
const ID = 'cloud://classification-test-d20ada.636c-classification-test-d20ada/'

export default class ImageManager {
  constructor() {
    this.introPage = new Image()
    this.tipImg = new Image()
    this.home_page = new Image()
    this.bg = new Image()

    this.imageGet(this.introPage, 'cloud://classification-test-d20ada.636c-classification-test-d20ada/intro.jpg', 'intro.jpg')
    this.imageGet(this.home_page, 'cloud://classification-test-d20ada.636c-classification-test-d20ada/home_page.png', 'home_page.png')
    this.imageGet(this.tipImg, 'cloud://classification-test-d20ada.636c-classification-test-d20ada/tip.png', 'tip.png')
    this.imageGet(this.bg, 'cloud://classification-test-d20ada.636c-classification-test-d20ada/bg.jpg', 'bg.jpg')

    this.startBtn = new Image()
    this.rankBtn = new Image()
    this.difficult = new Image()
    this.normal = new Image()

    this.imageGet(this.startBtn,
      'cloud://classification-test-d20ada.636c-classification-test-d20ada/button/start.png', 'button/start.png')
    this.imageGet(this.rankBtn,
      'cloud://classification-test-d20ada.636c-classification-test-d20ada/button/rank.png', 'button/rank.png')
    this.imageGet(this.difficult, 'cloud://classification-test-d20ada.636c-classification-test-d20ada/button/mode-difficult.png', 'button/mode-difficult.png')
    this.imageGet(this.normal, 'cloud://classification-test-d20ada.636c-classification-test-d20ada/button/mode-normal.png', 'button/mode-normal.png')

    this.normal_cans = new Array(4)
    this.fill(this.normal_cans)
    this.dark_can = new Image()

    this.imageGet(this.normal_cans[0], 'cloud://classification-test-d20ada.636c-classification-test-d20ada/gabbages/normal/cans/dry_ashcan.png', 'gabbages/normal/cans/dry_ashcan.png')
    this.imageGet(this.normal_cans[1], 'cloud://classification-test-d20ada.636c-classification-test-d20ada/gabbages/normal/cans/recyclable_ashcan.png', 'gabbages/normal/cans/recyclable_ashcan.png')
    this.imageGet(this.normal_cans[2], 'cloud://classification-test-d20ada.636c-classification-test-d20ada/gabbages/normal/cans/wet_ashcan.png', 'gabbages/normal/cans/wet_ashcan.png')
    this.imageGet(this.normal_cans[3], 'cloud://classification-test-d20ada.636c-classification-test-d20ada/gabbages/normal/cans/harmful_ashcan.png', 'gabbages/normal/cans/harmful_ashcan.png')
    this.imageGet(this.dark_can, 'cloud://classification-test-d20ada.636c-classification-test-d20ada/gabbages/normal/cans/dark.png', 'gabbages/normal/cans/dark.png')

    this.difficult_cans = new Array(5)
    this.getImageList(this.difficult_cans, 'gabbages/difficult/cans/', '.jpg', ID)

    this.dry = new Array(5)
    this.getImageList(this.dry, 'gabbages/normal/dry/', '.png', ID)

    this.recyclable = new Array(7)
    this.getImageList(this.recyclable, 'gabbages/normal/recyclable/', '.png', ID)

    this.wet = new Array(5)
    this.getImageList(this.wet, 'gabbages/normal/wet/', '.png', ID)

    this.harmful = new Array(6)
    this.getImageList(this.harmful, 'gabbages/normal/harmful/', '.png', ID)

    this.normal_gabbage = new Array(this.dry, this.recyclable, this.wet, this.harmful)

    this.coarse = new Array(4)
    this.getImageList(this.coarse, 'gabbages/difficult/coarse/', '.png', ID)

    this.combustible = new Array(8)
    this.getImageList(this.combustible, 'gabbages/difficult/combustible/', '.png', ID)

    this.non_burnable = new Array(7)
    this.getImageList(this.non_burnable, 'gabbages/difficult/non-burnable/', '.png', ID)

    this.plastic_packaging = new Array(4)
    this.getImageList(this.plastic_packaging, 'gabbages/difficult/plastic-packaging/', '.png', ID)

    this.resource = new Array(2)
    this.getImageList(this.resource, 'gabbages/difficult/resource/', '.png', ID)

    this.difficult_gabbage = new Array(this.coarse, this.combustible, this.non_burnable, this.plastic_packaging, this.resource)

    this.gabbage = new Array(this.normal_gabbage, this.difficult_gabbage)
  }

  /**
   * get an image from the server and save it. 
   * The download will start right after the name start, 
   * but the game won't be blocked and image objects will be empty initially. 
   * If the image has already been stored, it will be obtained directly.
   * If the image is to store in a subdirectory which doesn't exist, 
   * the dir will be created first.
   * the recursive option for mkdir doesn't work, so i mannual created it.
   * @param {Image} img: the image object.
   * @param {string} fileID: the ID for the picture.
   * @param {string} path: the location to store the image.
   */
  imageGet(img, fileID, path) {
    fs.getFileInfo({
      filePath: `${wx.env.USER_DATA_PATH}/${path}`,
      success: res => {
        img.src = `${wx.env.USER_DATA_PATH}/${path}`
      }, 
      fail: () => {
        if(path.indexOf('/') != -1){
          let arr = path.split('/')
          let pathName = wx.env.USER_DATA_PATH + '/'
          for(let i = 0; i < arr.length - 1; i++) {
            pathName += arr[i] + '/'
            fs.mkdir({
              dirPath: pathName,
              recursive: true,
              success: res => console.log('path created'),
              fail: err => console.log(err)
            })
          }
          
        }
        wx.cloud.downloadFile({
          fileID: fileID,
          success: res => {
            fs.saveFile({
              tempFilePath: res.tempFilePath,
              filePath: `${wx.env.USER_DATA_PATH}/${path}`,
              success: res => {
                img.src = res.savedFilePath
                console.log(res.savedFilePath)
              },
              fail: err => {
                console.log(err)
              }
            })
          },
          fail: err => console.log(err)
        })
      }
    })
  }

  /**
   * fill the array with empty Image object
   * @param {Array} arr: an array
   */
  fill(arr) {
    for(let i = 0; i < arr.length; i++) {
      arr[i] = new Image()
    }
  }

  /**
   * get a list of images.
   * @param {Array} list: the list to store the images.
   * @param {String} dir: the directory to store the images.
   * @param {String} format: the format of the images.
   * @param {String} id: the id of the files.
   */
  getImageList(list, dir, format, id) {
    this.fill(list)
    for(let i = 1; i < list.length + 1; i++) {
      let path = dir + i + format
      this.imageGet(list[i - 1], id + path, path)
    }
  }

}