import {
  data,
  check,
  timeStamp
} from '../../utils/util'
//获取应用实例
const app = getApp()
var timer
Page({
  data: {
    msg: '没有任何记录', // 是否有数据文字提示
    goTop: false, // 检测是否显示回到顶部按钮
    swiperIndex: 0,
    goodsList: [],
    mygoodsList: [],
    timeArr: [],
    msgList: []
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
  // 跳转详情
  goinfo: function (e) {
    if (e.currentTarget.dataset.code) {
      wx.navigateTo({
        url: '/pages/bargainInfo/bargainInfo?url_code=' + e.currentTarget.dataset.code
      })
      return false
    }
  },
  // 点击导航栏
  switch: function (e) {
    this.setData({
      swiperIndex: e.currentTarget.dataset.index
    })
    this.getdata()
  },
  // 回到首页
  backHome: function () {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  // 获取商品列表数据
  goodsList: function () {
    data('/api/cutprice/getList', {}, (res) => {
      this.setData({
        goodsList: res.list,
        msgList: res.push_list
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  // 我的商品列表
  mygoodsList: function () {
    data('/api/cutprice/getMyList', {}, (res) => {
      clearInterval(timer)
      let timeArr = []
      let arrTime = []
      res.data.forEach((item, index) => {
        timeArr.push(timeStamp(item.over_second))
        arrTime.push(item.over_second)
        this.setData({
          timeArr: timeArr
        })
        res.data[index].yikan = Math.round((item.goods_price - item.goods_now_price) * 100) / 100
        res.data[index].weikan = Math.round((item.goods_now_price - item.goods_final_price) * 100) / 100
      })

      // 计算时间
      timer = setInterval(() => {
        arrTime.forEach((item, index) => {
          if (item != 0) {
            item--
          }
          arrTime.splice(index, 1, item)
          timeArr.splice(index, 1, timeStamp(item))
          this.setData({
            timeArr: timeArr
          })
        })
      }, 1000)

      this.setData({
        mygoodsList: res.data.length == 0 ? [null] : res.data
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  // 发送请求判断
  getdata: function () {
    // 判断第几页是否有数据,再加载对应的数据
    if (this.data.swiperIndex == 0 && this.data.goodsList.length == 0) {
      wx.showLoading({
        title: '正在加载',
        mask: true
      })
      this.goodsList()
    } else if (this.data.swiperIndex == 1 && this.data.mygoodsList.length == 0) {
      wx.showLoading({
        title: '正在加载',
        mask: true
      })
      this.mygoodsList()
    }
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    // 判断第几页是否有数据,再加载对应的数据
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    if (this.data.swiperIndex == 0) {
      this.goodsList()
    } else if (this.data.swiperIndex == 1) {
      clearInterval(timer)
      this.mygoodsList()
    }
  },
  // 禁止消息滑动
  catchTouchStart: function (res) {
    return false
  },
  // 跳转到商品详情页
  goGoodsInfo: function (e) {
    wx.navigateTo({
      url: '/pages/goodsInfo/goodsInfo?id=' + e.currentTarget.dataset.id
    })
  },
  // 打开选择商品框
  openGoodsSelect: function (e) {
    if (e.currentTarget.dataset.code) {
      wx.navigateTo({
        url: '/pages/bargainInfo/bargainInfo?url_code=' + e.currentTarget.dataset.code
      })
      return false
    }
    this.setData({
      goodsSelect: true,
      goodsId: e.currentTarget.dataset.id
    })
  },
  // 前往购买
  goPayInfo: function (e) {
    let index = e.currentTarget.dataset.index
    if (this.data.mygoodsList[index].order_sn) {
      data('/api/pay/pay', {
        order_sn: this.data.mygoodsList[index].order_sn
      }, res => {
        if (!res.code) {
          wx.requestPayment({
            timeStamp: res.timeStamp,
            nonceStr: res.nonceStr,
            package: res.package,
            signType: res.signType,
            paySign: res.paySign,
            success: rs => {
              if (rs.errMsg == 'requestPayment:ok') {
                this.getdata()
                wx.navigateTo({
                  url: '/pages/order/order?index=2'
                })
              }
            }
          })
        } else {
          wx.showToast({
            title: res.msg,
            icon: 'none'
          })
        }
      })
      return false
    }
    let arr = [{
      cid: 1,
      goods_id: this.data.mygoodsList[index].goods_id,
      goods_name: this.data.mygoodsList[index].goods_name,
      spec_key: this.data.mygoodsList[index].spec_key,
      goods_num: this.data.mygoodsList[index].goods_num,
      goods_img: this.data.mygoodsList[index].goods_img,
      shop_price: this.data.mygoodsList[index].goods_now_price,
      spec_key_name: this.data.mygoodsList[index].spec_key_name
    }]
    wx.setStorageSync('goodsData', arr)
    wx.navigateTo({
      url: '/pages/payInfo/payInfo'
    })
  },
  // 跳转到订单页
  goOrder: function () {
    wx.navigateTo({
      url: '/pages/order/order'
    })
  },
  onLoad: function (o) {
    if (o.url_code) {
      wx.navigateTo({
        url: '/pages/bargainInfo/bargainInfo?url_code=' + o.url_code
      })
    }
  },
  onShow: function () {
    check(app, () => {
      this.getdata()
    })
  },
  onUnload: function () {
    clearInterval(timer)
  }
})