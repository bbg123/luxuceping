import {
  data,
  check
} from "../../utils/util"
//获取应用实例
const app = getApp()

Page({
  data: {
    msg: '没有任何收藏'
  },
  // 获取收藏列表
  getCollectList: function () {
    data('/api/goods_collect/getList', {}, (res) => {
      this.setData({
        collectList: res.data.data
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  // 跳转到商品详情页
  goGoodsInfo: function (e) {
    wx.navigateTo({
      url: '/pages/goodsInfo/goodsInfo?id=' + e.currentTarget.dataset.id
    })
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    this.getCollectList()
  },
  onLoad: function () {
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    check(app, () => {
      this.getCollectList()
    })
  }
})