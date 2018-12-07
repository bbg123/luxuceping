import {
  data,
  check
} from "../../utils/util"
//获取应用实例
const app = getApp()

Page({
  data: {},
  // 获取新闻列表
  getNewsList: function () {
    data('/api/wx/getNewsList', {}, res => {
      this.setData({
        newsList: res.list
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  // 前往网页
  goWebView: function (e) {
    wx.setStorageSync('link', e.currentTarget.dataset.link)
    wx.navigateTo({
      url: '/pages/webView/webView'
    })
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    this.getNewsList()
  },
  onLoad: function () {
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    check(app, () => {
      this.getNewsList()
    })
  }
})