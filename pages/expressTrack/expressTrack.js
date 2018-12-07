import {
  data
} from "../../utils/util"
//获取应用实例
const app = getApp()

Page({
  data: {
    msg: '没有任何快递轨迹'
  },
  getTrack: function () {
    data('/api/order/shippingLogistic', {
      order_sn: this.data.sn
    }, res => {
      if (res.code == 0) {
        this.setData({
          trackData: res.data
        })
      }
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    // 判断第几页是否有数据,再加载对应的数据
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    this.getTrack()
  },
  onLoad: function (o) {
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    if (o.sn) {
      this.setData({
        sn: o.sn
      })
      this.getTrack()
    }
  }
})