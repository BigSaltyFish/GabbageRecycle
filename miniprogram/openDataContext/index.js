const sharedCanvas = wx.getSharedCanvas()
const ctx = sharedCanvas.getContext('2d')
let screenWidth = sharedCanvas.width
let screenHeight = sharedCanvas.height

let friendData

wx.onMessage(data => {
  if(data.option == 'update') {
    wx.getFriendCloudStorage({
      keyList: ['score'],
      success: res => {
        console.log(res)
        friendData = res.data
      },
      fail: err => console.log(err)
    })
  }
  if(data.option == 'initialize') {
    screenWidth = data.size[0]
    screenHeight = data.size[1]
    console.log(`index:${screenWidth}:${screenHeight}`)
    wx.getFriendCloudStorage({
      keyList: ['score'],
      success: res => {
        console.log(res)
        friendData = res.data
        drawRankList(res.data)
      },
      fail: err => console.log(err)
    })
  }
  
})

function* getAvatar(avatarList) {
  for(let i = 0; i < 6; i++) {
    if(i == friendData.length) break
    yield new Promise((resolve, reject) => {
      let ava = wx.createImage()
      ava.src = friendData[i].avatarUrl
      avatarList.push(ava)
      ava.onload = () => resolve(avatarList)
    })
  }
  return null
}

function drawRankList(data) {
  new Promise((resolve, reject) => {
    let rankBg = wx.createImage()
    rankBg.src = 'images/rank/background.png'
    rankBg.onload = () => resolve(rankBg)
  }).then(rankBg => {
    ctx.drawImage(
      rankBg,
      0, 0,
      screenWidth, screenHeight
    )
  })
  
  new Promise((resolve, reject) => {
    let throne = wx.createImage()
    throne.src = 'images/rank/throne.png'
    throne.onload = () => resolve(throne)
  }).then(throne => {
    ctx.drawImage(
      throne,
      screenWidth / 4 - throne.width / 2,
      screenHeight / 4 + 15 - throne.height,
      throne.width, throne.height
    )
    console.log('reached!')
  })

  new Promise((resolve, reject) => {
    let box = wx.createImage()
    box.src = 'images/rank/box.png'
    box.onload = () => resolve(box)
  }).then(box => {
    return new Promise((resolve, reject) => {
      let photo = wx.createImage()
      photo.src = 'images/rank/photo.png'
      photo.onload = () => resolve([box, photo])
    })
  }).then(([box, photo]) => {
    friendData.sort((a, b) => {
      return parseInt(b.KVDataList[0].value) - parseInt(a.KVDataList[0].value)
    })
    let promise, avatarList = [box, photo]
    promise = getAvatar(avatarList)
    while(true) {
      let tmp = getAvatar(avatarList)
      if (tmp === null) break
      promise = promise.then(list => {
        return getAvatar(list)
      })
    }
    return promise
  }).then((list) => {
    let box = list[0], photo = list[1], avatarList = list.splice(2)
    for (let i = 0; i < 6; i++) {
      ctx.drawImage(
        box,
        screenWidth / 2 - box.width / 2,
        screenHeight / 4 + box.height * i + 10 * i + 15,
        box.width, box.height
      )
      ctx.drawImage(
        photo,
        screenWidth / 2 - photo.width / 2 - box.width / 4,
        screenHeight / 4 + box.height * i + 10 * i + 16,
        photo.width, photo.height
      )
      ctx.drawImage(
        avatarList[i],
        screenWidth / 2 - photo.width / 2 - box.width / 4,
        screenHeight / 4 + box.height * i + 10 * i + 16,
        photo.width, photo.height
      )
      ctx.textAlign = "left"
      ctx.fillStyle = "red"
      ctx.font = "20px bold"
      ctx.fillText(
        (i + 1).toString(),
        screenWidth / 2 - photo.width / 4 - 3 * box.width / 8,
        screenHeight / 4 + box.height * i + 10 * i + 20 + box.height / 2
      )
    }
  })
  

  // let long = wx.createImage()
  // long.src = 'images/rank/long.png'
  // long.onload = () => {
  //   ctx.drawImage(
  //     long,
  //     screenWidth / 2 - long.width / 2,
  //     screenHeight / 4 + 15 - box.height,
  //     long.width, long.height
  //   )
  // }
  // let select = wx.createImage()
  // select.src = 'images/rank/select.png'

}

