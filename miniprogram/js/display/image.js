const fs = wx.getFileSystemManager()
// wx.cloud.init()
const ID = 'cloud://classification-test-d20ada.636c-classification-test-d20ada/'

export default class ImageManager {
  constructor() {
    this.bg = new Image()
    this.imageGet(this.bg, ID + 'bg1.png', 'bg1.png')
    this.tip = new Image()
    this.imageGet(this.tip, ID + 'Tip.png', 'Tip.png')
    this.stars = new Image()
    this.imageGet(this.stars, ID + 'stars.png', 'stars.png')
    
    this.heart = new Image()
    this.imageGet(this.heart, ID + 'heart.png', 'heart.png')
    this.pop = new Image()
    this.imageGet(this.pop, ID + 'pop.png', 'pop.png')

    this.cloudleft = new Image()
    this.imageGet(this.cloudleft, ID + 'cloudleft.png', 'cloudleft.png')
    this.cloudcenter = new Image()
    this.imageGet(this.cloudcenter, ID + 'cloudcenter.png', 'cloudcenter.png')
    this.cloudright = new Image()
    this.imageGet(this.cloudright, ID + 'cloudright.png', 'cloudright.png')

    this.normal_cans = new Array(4)
    this.getImageList(this.normal_cans, 'gabbages/normal/cans/', '.png', ID)
    this.dark_can_normal = new Image()
    this.imageGet(this.dark_can_normal, 'cloud://classification-test-d20ada.636c-classification-test-d20ada/gabbages/normal/cans/dark.png', 'gabbages/normal/cans/dark.png')

    this.difficult_cans = new Array(5)
    this.getImageList(this.difficult_cans, 'gabbages/difficult/cans/', '.png', ID)
    this.dark_can_difficult = new Image()
    this.imageGet(this.dark_can_difficult, ID + 'gabbages/difficult/cans/dark.png', 'gabbages/difficult/cans/dark.png')

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
          fail: err => {
            console.log(err)
            console.log('fail to fetch'+fileID)
          }
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