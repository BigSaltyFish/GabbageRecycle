const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
exports.main = (event, context) => {
  try {
    db.collection('users').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        description: 'learn cloud database',
        due: new Date('2018-09-01'),
        tags: [
          'cloud',
          'database'
        ],
        // 位置（113°E，23°N）
        location: new db.Geo.Point(113, 23),
        done: false
      }
    })
      .then((res) => {
        console.log('yes')
      })
  } catch (e) {
    console.error(e)
  }
}