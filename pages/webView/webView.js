import { data } from "../../utils/util"
//获取应用实例
const app = getApp()

Page({
  data: {},
  onLoad: function () {
    if (wx.getStorageSync('link')) {
      this.setData({
        link: wx.getStorageSync('link')
      })
    }
  },
  onUnload: function() {
    wx.removeStorageSync('link')
  }
})
