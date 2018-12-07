import { data, check } from '../../utils/util'
const app = getApp()
Page({
  data: {
    couponitem: [],
    MycouponItem: [],
    pageIndex: 0,
    msg: '没有任何可领优惠券'
  },
  // 获取券数据
  getData: function() {
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    data('/api/coupon/getList', {}, (res) => {
      this.setData({
        couponitem: res.data
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  // 点击领券
  getCoupon: function(e) {
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    data('/api/coupon/addCoupon', {
      code: e.currentTarget.dataset.code
    }, (res) => {
      wx.showToast({
        title: res.msg,
        icon: 'none',
        duration: 1000
      })
      this.getData()
    })
  },
  // 获取我的优惠券
  getMyCoupon: function() {
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    data('/api/coupon/getMyList', {}, (res) => {
      this.setData({
        MycouponItem: res.data
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  // 判断哪个页面加载对应的数据
  getIndex: function() {
    if (this.data.pageIndex == 0 && this.data.couponitem.length == 0) {
      this.getData()
    } else if (this.data.pageIndex == 1 && this.data.MycouponItem.length == 0) {
      this.getMyCoupon()
    }
  },
  // 切换导航栏
  nav: function(e) {
    this.setData({
      pageIndex: e.currentTarget.dataset.index
    })
    if (e.currentTarget.dataset.index == 1) {
      this.setData({
        msg: '没有任何记录'
      })
    }
    this.getIndex()
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    if (this.data.pageIndex == 0) {
      this.getData()
    } else if (this.data.pageIndex == 1) {
      this.getMyCoupon()
    }
  },
  onLoad: function () {
    check(app, () => {
      this.getIndex()
    })
  },
  onShow: function () {}
})