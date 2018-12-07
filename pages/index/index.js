//index.js
import {
  data,
  check
} from '../../utils/util'
//获取应用实例
const app = getApp()

Page({
  data: {
    goTop: false, // 检测是否显示回到顶部按钮
    get_shopcar: 0,
    homeData: [{
        goods_id: 103,
        goods_name: 'BEGEEL时尚锆钻百搭钨钢情侣对表1',
        goods_img: '../images/home3.jpg',
        goods_max: 10,
        goods_now: 5,
        goods_price: '13800.00',
        goods_final_price: '9800.00'
      },
      {
        goods_id: 104,
        goods_name: 'BEGEEL时尚锆钻百搭钨钢情侣对表2',
        goods_img: '../images/home3.jpg',
        goods_max: 10,
        goods_now: 0,
        goods_price: '1380.00',
        goods_final_price: '980.00'
      },
    ]
  },
  // 滚动检测
  onPageScroll: function (e) {
    if (e.scrollTop >= 420) {
      this.setData({
        goTop: true
      })
    } else {
      this.setData({
        goTop: false
      })
    }
  },
  // 回到顶部
  goTop: function () {
    wx.pageScrollTo({
      scrollTop: 0
    })
  },
  // 跳转到砍价
  gobar: function () {
    wx.navigateTo({
      url: '/pages/bargain/bargain'
    })
  },
  // 跳转到拼团
  gobuy: function () {
    wx.navigateTo({
      url: '/pages/buyJoint/buyJoint'
    })
  },
  // 跳转到领劵中心
  goroll: function () {
    wx.navigateTo({
      url: '/pages/getcoupon/getcoupon'
    })
  },
  // 跳转到头条
  goheadline: function () {
    wx.navigateTo({
      url: '/pages/headline/headline'
    })
  },
  // 跳转搜索页
  gosearch: function () {
    wx.showToast({
      title: '暂不支持搜索',
      duration: 2000,
      icon: 'none'
    })
  },
  // 首页数据
  goodsdata: function () {

  },
  // 添加购物车
  addCart: function (e) {
    data('/api/cart/addCart', {
      goods_id: e.currentTarget.dataset.id,
      spec_key: e.currentTarget.dataset.speckey,
      goods_num: 1
    }, (res) => {
      if (res.code == 0) {
        this.setData({
          get_shopcar: e.currentTarget.dataset.index
        })
        let time = setTimeout(() => {
          this.setData({
            get_shopcar: 0
          })
          wx.setTabBarBadge({
            index: 1,
            text: '+1'
          })
          clearTimeout(time)
        }, 1000)
      }
    })
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    wx.hideLoading()
    wx.stopPullDownRefresh()
  },
  // 跳转到详情页
  goGoodsInfo: function (e) {
    wx.navigateTo({
      url: '/pages/goodsInfo/goodsInfo?id=' + e.currentTarget.dataset.id
    })
  },
  // 打开选择商品框
  openGoodsSelect: function (e) {
    this.setData({
      goodsSelect: true,
      goodsId: e.currentTarget.dataset.id
    })
  },
  onLoad: function () {
    check(app, () => {
      this.goodsdata()
      // wx.setTabBarBadge({
      //   index: 1,
      //   text: '2'
      // })
      // wx.setTabBarBadge({
      //   index: 2,
      //   text: '999+'
      // })
    })
  },
})