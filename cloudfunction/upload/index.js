// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  if(event.breakRec) {
    await db.collection('users').where({
      _openid: _.eq(event.openid)
    }).update({
      data: {
        score: event.record.score
      }
    })
  }

  await db.collection(`${event.openid}-record`).add({
    data: event.record
  })

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}