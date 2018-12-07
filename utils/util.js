// 请求函数
const data = (urls, data, callback) => {
  var url = "https://api.zushixiong.com"
  wx.request({
    url: url + urls,
    method: "POST",
    header: {
      "Content-Type": "application/x-www-form-urlencoded",
      "DeviceId": "xcx",
      "access-token": wx.getStorageSync('token'),
    },
    data: data,
    dataType: "json",
    success: function (res) {
      callback(res.data)
    }
  })
}

// 检查是否有token,阻塞进程
const check = (app ,callback) => {
  var timer = setInterval(() => {
    if (app.globalData.code == 200) {
      clearInterval(timer)
      callback()
    }
  }, 500)
}

// 时间换算
const  timeStamp = (second_time) => {
  var time = parseInt(second_time)
  if (parseInt(second_time) > 0) {
    var hour = parseInt(parseInt(second_time / 60) / 60)
    var second = second_time % 60
    var min = parseInt(second_time / 60)
    if (hour <= 0 && min > 0 ) {
      time = {
        s: '00',
        f: (min < 10 ? '0' + min : min),
        m: (second < 10 ? '0' + second : second)
      }
    }

    if (hour > 0 && min > 60) {
      min = parseInt(second_time / 60) % 60
      // time = (hour < 10 ? '0' + hour : hour) + ":" + (min < 10 ? '0' + min : min) + ":" + (second < 10 ? '0' + second : second)
      time = {
        s: (hour < 10 ? '0' + hour : hour),
        f: (min < 10 ? '0' + min : min),
        m: (second < 10 ? '0' + second : second)
      }
    }

    if (hour <= 0 && min <= 0 ) {
      time = {
        s: '00',
        f: '00',
        m: (second < 10 ? '0' + second : second)
      }
    }
  }
  return time
}

module.exports = {
  data: data,
  check: check,
  timeStamp: timeStamp
}
