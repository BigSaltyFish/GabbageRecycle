const fs = wx.getFileSystemManager()

export default class ImageManager {
  constructor() {
    this.introPage = new Image()
    this.imageGet(this.introPage, 'cloud://classification-test-d20ada.636c-classification-test-d20ada/intro.jpg', 'intro.jpg')
    this.imageGet('cloud://classification-test-d20ada.636c-classification-test-d20ada/home_page.png', 'home_page.png')
  }

  /**
   * get an image from the server and save it. 
   * The download will start right after the name start, 
   * but the game won't be blocked and image objects will be empty initially. 
   * If the image has already been stored, it will be obtained directly.
   * @param {Image} img: the image object.
   * @param {string} fileID: the ID for the picture.
   * @param {string} path: the location to store the image.
   */
  imageGet(img, fileID, path) {
    fs.getFileInfo({
      filePath: `${wx.env.USER_DATA_PATH}/${path}`,
      success: res => {
        console.log('success')
        img.src = `${wx.env.USER_DATA_PATH}/${path}`
      }, 
      fail: () => {
        console.log('reach')
        wx.cloud.downloadFile({
          fileID: fileID,
          success: res => {
            fs.saveFile({
              tempFilePath: res.tempFilePath,
              filePath: `${wx.env.USER_DATA_PATH}/${path}`,
              success: res => {
                console.log(res.savedFilePath)
                img.src = res.savedFilePath
              },
              fail: err => {
                console.log('image load failed')
              }
            })
          }
        })
      }
    })
  }

}