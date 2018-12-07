import {
  data,
  check
} from '../../utils/util'
//获取应用实例
const app = getApp()

Page({
  data: {
    goodsList: [],
    isExit: false
  },
  // 点击选择商品
  select: function (e) {
    let i = e.currentTarget.dataset.index
    this.data.goodsList[i].selected = !this.data.goodsList[i].selected
    this.setData({
      goodsList: this.data.goodsList,
      isExit: true
    })
    this.allSelect()
    this.getTotal()
  },
  // 全选判断
  allSelect: function () {
    let checkedNum = 0
    this.data.goodsList.forEach(item => {
      if (item.selected) {
        checkedNum++
      }
    })
    if (checkedNum == this.data.goodsList.length) {
      this.setData({
        allSelect: true
      })
    } else {
      this.setData({
        allSelect: false
      })
    }
  },
  // 点击全选
  tapAllSelect: function () {
    for (let i = 0; i < this.data.goodsList.length; i++) {
      this.data.goodsList[i].selected = !this.data.allSelect
    }
    this.setData({
      goodsList: this.data.goodsList,
      allSelect: !this.data.allSelect,
      isExit: true
    })
    this.getTotal()
  },
  // 减号
  minus: function (e) {
    let i = e.currentTarget.dataset.index
    if (this.data.goodsList[i].goods_num > 1) {
      this.data.goodsList[i].goods_num--
      this.setData({
        goodsList: this.data.goodsList,
        isExit: true
      })
      this.getTotal()
    }
  },
  // 加号
  plus: function (e) {
    let i = e.currentTarget.dataset.index
    this.data.goodsList[i].goods_num++
    this.setData({
      goodsList: this.data.goodsList,
      isExit: true
    })
    this.getTotal()
  },
  // 计算选择中的商品数量和计算总价
  getTotal: function () {
    let totalNum = 0
    let totalPrices = 0
    this.data.goodsList.forEach(item => {
      if (item.selected) {
        totalNum++
        totalPrices += item.shop_price * item.goods_num
      }
    })
    this.setData({
      totalNum: totalNum,
      totalPrices: Math.round(totalPrices * 100) / 100
    })
  },
  // 结算
  clearing: function () {
    if (this.data.totalNum == 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none',
        duration: 1500
      })
      return false
    }
    let arr = []
    this.data.goodsList.forEach(item => {
      if (item.selected) {
        arr.push(item)
      }
    })
    wx.setStorageSync('goodsData', arr)
    wx.navigateTo({
      url: '/pages/payInfo/payInfo'
    })
  },
  // 删除商品
  del: function (e) {
    wx.showModal({
      title: '是否删除该商品?',
      success: (res) => {
        if (res.confirm) {
          let arr = this.data.goodsList
          arr.splice(e.currentTarget.dataset.index, 1)
          this.setData({
            goodsList: arr,
            isExit: true
          })
          this.getTotal()
        } else {
          console.log(res)
        }
      }
    })
  },
  // 获取购物车列表
  getShopCarList: function () {
    data('/api/cart/getList', {}, (res) => {
      for (let i = 0; i < res.data.length; i++) {
        res.data[i].selected = res.data[i].selected == 0 ? false : true
      }
      this.setData({
        goodsList: res.data
      })
      this.allSelect()
      this.getTotal()
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  // 跳转到商品详情
  goGoodsInfo: function (e) {
    wx.navigateTo({
      url: '/pages/goodsInfo/goodsInfo?id=' + e.currentTarget.dataset.id
    })
  },
  // 修改购物车
  editCart: function () {
    let arr = this.data.goodsList
    for (let i = 0; i < arr.length; i++) {
      arr[i].selected = arr[i].selected ? 1 : 0
    }
    data('/api/cart/editCart', {
      data: JSON.stringify(arr)
    }, (res) => {})
  },
  // 回到首页逛逛
  goHome: function () {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    // 判断是否修改过
    if (this.data.isExit) {
      this.editCart()
    }
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    this.getShopCarList()
  },
  onLoad: function () {},
  onShow: function () {
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    this.setData({
      isExit: false
    })
    check(app, () => {
      this.getShopCarList()
      wx.removeTabBarBadge({
        index: 1
      })
    })
  },
  onHide: function () {
    // 判断是否修改过
    if (this.data.isExit) {
      this.editCart()
    }
  }
})