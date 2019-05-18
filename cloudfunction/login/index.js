// 云函数入口文件
const cloud = require('wx-server-sdk')

// 与小程序端一致，均需调用 init 方法初始化
cloud.init({
  env: 'class-release-8cfbab'
})

// 可在入口函数外缓存 db 对象
const db = cloud.database({
  env: 'class-release-8cfbab'
})

// 数据库查询更新指令对象
const _ = db.command

/**
 * this function will examine whether this user is a new one. 
 * if the user is new, a record for the user will be created in the user set, 
 * and a collection containing a root record will be established, and the highest score returned is 0.
 * if the user is not new, the user's record will be found and the highest score will be found and returned.
 * both the case the unique openid will be returned.
 * 
 * however, this function has not considered the problems which may occur during the execution on 
 * various devices.
 * 
 * @return {object} : {openid, highest score}
 */
exports.main = async (event, context) => {
  const col = db.collection('users')
  try {
    const doc = await col.where({
      _openid: _.eq(event.userInfo.openId)
    })
    let rec = await doc.get()
    return {
      openid: event.userInfo.openId, 
      score: rec.data[0].score,
      gameTime: rec.data[0].gameTime
    }
  } catch(error) {
    await col.add({
      data: {
        _openid: event.userInfo.openId, 
        score: 0,
        gameTime: 0
      }
    })

    let piece = {}
    piece["user_id"] = event.userInfo.openId
    piece["record"] = []

    await db.collection('user_data').add({
      data: piece
    })

    // await db.createCollection(`${event.userInfo.openId}-record`)
    // await db.collection(event.userInfo.openId + '-record').add({
    //   data: {
    //     _openid: event.userInfo.openId
    //   }
    // })
    return {
      openid: event.userInfo.openId, 
      score: 0,
      gameTime: 0
    }
  }
}