import {
  data,
  check
} from "../../utils/util"
//获取应用实例
const app = getApp()

Page({
  data: {
    msg: '没有任何订单' // 没有数据的提示
  },
  // 退款中数据
  getRefundData: function () {
    data('/api/order/getRefund', {}, res => {
      this.setData({
        OrderData: res.data
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  // 跳转到订单详情
  goOrderInfo: function (e) {
    wx.navigateTo({
      url: '/pages/orderInfo/orderInfo?sn=' + e.currentTarget.dataset.sn
    })
  },
  // 再次购买
  buyAgain: function (e) {
    data('/api/order/buyAgain', {
      order_sn: e.currentTarget.dataset.sn
    }, res => {
      if (res.code == 0) {
        wx.switchTab({
          url: '/pages/shopCar/shopCar'
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
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    this.getRefundData()
  },
  onLoad: function () {
    check(app, () => {
      this.getRefundData()
    })
  }
})