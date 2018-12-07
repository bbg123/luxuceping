import {
  data
} from "../../utils/util"
//获取应用实例
const app = getApp()

Page({
  data: {},
  // 获取商品详情数据
  getOrderInfo: function () {
    data('/api/order/getInfo', {
      order_sn: this.data.sn
    }, res => {
      this.setData({
        OrderInfoData: res.data
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  // 跳转商品详情页
  goGoodsInfo: function (e) {
    wx.navigateTo({
      url: '/pages/goodsInfo/goodsInfo?id=' + e.currentTarget.dataset.id
    })
  },
  // 跳转到物流信息页
  goTrack: function (e) {
    wx.navigateTo({
      url: '/pages/expressTrack/expressTrack?sn=' + e.currentTarget.dataset.sn
    })
  },
  // 确认收货
  confirmGoods: function (e) {
    data('/api/order/confirmShipping', {
      order_sn: e.currentTarget.dataset.sn
    }, res => {
      if (res.code == 0) {
        wx.showToast({
          title: res.msg,
          icon: 'none',
          duration: 1500,
          success: () => {
            this.getOrderInfo()
          }
        })
      } else {
        wx.showToast({
          title: res.msg,
          icon: 'none',
          duration: 1500
        })
      }
    })
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    // 判断第几页是否有数据,再加载对应的数据
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    this.getOrderInfo()
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
      this.getOrderInfo()
    }
  }
})