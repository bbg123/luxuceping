//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
  },
  getAddress: function() {
    wx.chooseAddress({
      success: (res) => {
        console.log(res)
      }
    })
  },
  onLoad: function () {
  }
})
