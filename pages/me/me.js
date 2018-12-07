import {
  data
} from "../../utils/util"
//获取应用实例
const app = getApp()

Page({
  data: {
    userImg: wx.getStorageSync('userimg') || '../images/me.png',
    username: wx.getStorageSync('username') || '未登录,点击登录',
    addressCode: 200
  },
  // 跳转领券中心
  goCoupon: function () {
    wx.navigateTo({
      url: '/pages/getcoupon/getcoupon'
    })
  },
  // 打开系统地址
  openAddress: function () {
    wx.chooseAddress({
      success: (res) => {
        if (res.errMsg == 'login:ok') {
          this.setData({
            addressCode: 200
          })
        }
      },
      fail: (res) => {
        if (res.errMsg == 'chooseAddress:fail cancel') {
          return false
        }
        if (res.errMsg == 'chooseAddress:fail auth deny') {
          this.setData({
            addressCode: 201
          })
          return false
        }
        if (res.errMsg != 'login:ok' && this.data.addressCode != 200) {
          this.setData({
            addressCode: 201
          })
        }
      }
    })
  },
  // 跳转地址
  goAddress: function () {
    this.openAddress()
    // 判断是否拒绝授权
    if (this.data.addressCode === 201) {
      // 拒绝授权打开设置
      wx.openSetting({
        success: (res) => {
          if (res.authSetting['scope.address'] == true) {
            this.setData({
              addressCode: 200
            })
            this.openAddress()
          }
        }
      })
    }
  },
  // 获取用户数据
  getUserInfo: function (e) {
    if (e.detail.userInfo) {
      wx.setStorageSync('username', e.detail.userInfo.nickName)
      wx.setStorageSync('userimg', e.detail.userInfo.avatarUrl)
      this.setData({
        userImg: e.detail.userInfo.avatarUrl,
        username: e.detail.userInfo.nickName
      })
      data('/api/xcx/saveUserInfo', {
        rawData: e.detail.rawData,
        signature: e.detail.signature,
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv
      }, (res) => {})
    }
  },
  // 跳转到订单页
  goOrder: function (e) {
    wx.navigateTo({
      url: '/pages/order/order?index=' + e.currentTarget.dataset.index
    })
  },
  // 跳转到收藏
  goCollect: function () {
    wx.navigateTo({
      url: '/pages/myCollect/myCollect'
    })
  },
  // 跳转到退款页面
  goRefund: function () {
    wx.navigateTo({
      url: '/pages/refund/refund'
    })
  },
  onLoad: function () {
    wx.removeTabBarBadge({
      index: 2
    })
  }
})