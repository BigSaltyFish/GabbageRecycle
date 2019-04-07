const sharedCanvas = wx.getSharedCanvas()
const ctx = sharedCanvas.getContext('2d')
let screenWidth = sharedCanvas.width
let screenHeight = sharedCanvas.height

// stores the scores and avatars
let friendData

/*
 * listen to the messages from the main field.
 * update for the score of the user has update, say him or her has broke
 * the record, so the score list has to be refetch immediately.
 * initialize for getting the size of the screen and paint the page. It will be 
 * called immediately the game starts, so when the rank button is clicked, the 
 * shared canvas won't be empty.
 */
wx.onMessage(data => {
  if(data.option == 'update') {
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
  if(data.option == 'initialize') {
    screenWidth = data.size[0]
    screenHeight = data.size[1]
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

/**
 * the function to draw the entire page. all elements are drew only once,
 * instead of the repeat drawing in the main field. es7 is not supported here,
 * so async, await was not used here. Generator is not supported, too. use Promises
 * to ensure the valid render. Show up to six users.
 */
function drawRankList(data) {
  ctx.clearRect(0, 0, screenWidth, screenHeight)
  new Promise((resolve, reject) => {
    let rankBg = wx.createImage()
    rankBg.src = 'images/start/bg.png'
    rankBg.onload = () => resolve(rankBg)
  }).then(rankBg => {
    ctx.drawImage(
      rankBg,
      0, 0,
      screenWidth, screenHeight
    )
  })

  new Promise((resolve, reject) => {
    let title = wx.createImage()
    title.src = 'images/rank/title.png'
    title.onload = () => resolve(title)
  }).then(title => {
    let drawWidth = 2 * screenWidth / 3
    let drawHeight = (2 * screenWidth / 3) * title.height / title.width
    ctx.drawImage(
      title,
      0, 0, title.width, title.height,
      screenWidth / 2 - drawWidth / 2, screenHeight / 8 - drawHeight / 2,
      drawWidth, drawHeight
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
    for (let i = 0; i < 6; i++) {
      if (i == friendData.length) break
      if(i == 0){
        promise = new Promise((resolve, reject) => {
          let ava = wx.createImage()
          ava.src = friendData[i].avatarUrl
          avatarList.push(ava)
          ava.onload = () => resolve(avatarList)
        })
      }
      else {
        promise = promise.then(list => {
          return new Promise((resolve, reject) => {
            let ava = wx.createImage()
            ava.src = friendData[i].avatarUrl
            avatarList.push(ava)
            ava.onload = () => resolve(list)
          })
        })
      }
    }
    return promise
  }).then((list) => {
    let box = list[0], photo = list[1], avatarList = list.splice(2)
    for (let i = 0; i < 6; i++) {
      if(i >= avatarList.length) break
      ctx.drawImage(
        box,
        screenWidth / 2 - box.width / 2,
        screenHeight / 4 + box.height * i + 10 * i + 15,
        box.width, box.height
      )
      ctx.drawImage(
        avatarList[i],
        screenWidth / 2 - photo.width / 2 - box.width / 4,
        screenHeight / 4 + box.height * i + 10 * i + 16,
        photo.width, photo.height
      )
      ctx.drawImage(
        photo,
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
      ctx.fillStyle = "black"
      let txt = friendData[i].nickname.slice(0, 5)
      if (friendData[i].nickname.length > 5) txt += '…'
      ctx.fillText(
        txt,
        screenWidth / 2 + photo.width / 2 - box.width / 4 + 10,
        screenHeight / 4 + box.height * i + 10 * i + 20 + box.height / 2,
        80
      )
      ctx.fillText(
        friendData[i].KVDataList[0].value.toString(),
        screenWidth / 2 + photo.width / 2 - box.width / 4 + 90,
        screenHeight / 4 + box.height * i + 10 * i + 20 + box.height / 2
      )
    }
  })
}

