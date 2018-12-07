//app.js
const login_url = 'https://api.zushixiong.com/api/xcx/'
App({
  // 更新小程序
  updatezsx: function () {
    // 判断版本号
    wx.getSystemInfo({
      success: function (res) {
        var version = res.SDKVersion;
        if (version >= '1.9.90') {
          const updateManager = wx.getUpdateManager()
          updateManager.onCheckForUpdate(function (res) {
            // 请求完新版本信息的回调
          })

          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })

          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '更新提示',
              content: '新版本下载失败',
              showCancel: false
            })
          })
        }
      }
    })
  },
  // 获取token
  getToken: function (callback = function(){}) {
    // 登录验证
    wx.login({
      success: (res) =>　{
        wx.request({
          url: login_url + 'getSession',
          data: {
            'code': res.code
          },
          method: 'POST',
          dataType: 'json',
          success: (res)　=> {
            wx.setStorageSync('token', res.data.session3rd)
            callback(res)
            this.globalData.code = 200
          }
        })
      }
    })
  },
  // 登录
  login: function (callback = function(){}) {
    let token = wx.getStorageSync('token') || ''
    if (token == '') {
      this.getToken()
    } else {
      // 返回token是否有效
      this.checkToken(token, (res) => {
        if (res.data.code == 1) {
          this.getToken()
        } else {
          this.globalData.code = 200
          callback(res)
        }
      })
    }
  },
  // 检查token
  checkToken: function (token, callback) {
    wx.request({
      url: login_url + 'checkSession',
      data: {
        'session3rd': token
      },
      method: 'POST',
      dataType: 'json',
      success: function (res) {
        callback(res)
      }
    })
  },
  onLaunch: function () {
    this.login()
  },
  globalData: {
    code: 201
  }
})