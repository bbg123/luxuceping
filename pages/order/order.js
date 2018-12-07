import {
  data,
  check,
  timeStamp
} from "../../utils/util"
//获取应用实例
const app = getApp()
var timer

Page({
  data: {
    swiperIndex: 0,
    msg: '没有任何订单', // 没有数据
    list: false
  },
  // 切换导航栏
  switchSwiper: function (e) {
    this.setData({
      swiperIndex: e.detail.current
    })
  },
  // 点击导航栏
  switch: function (e) {
    this.setData({
      swiperIndex: e.currentTarget.dataset.index
    })
  },
  // 获取订单数据
  getOrderList: function () {
    data('/api/order/getList', {}, (res) => {
      clearInterval(timer)
      let OrderData1 = []
      let OrderData2 = []
      let OrderData3 = []
      let OrderData4 = []
      let timeArr = []
      let arrTime = []
      // 循环计算出总数量
      res.data.forEach((items, index) => {
        if (items.over_second != 0 && items.status == 0) {
          timeArr.push(timeStamp(items.over_second))
          arrTime.push(items.over_second)
          this.setData({
            timeArr: timeArr
          })
        }
        // 判断其他页面是否有数据
        if (items.status == 0 && items.over_second != 0) {
          OrderData1.push(items)
        }
        if (items.status == 1) {
          OrderData2.push(items)
        }
        if (items.status == 2) {
          OrderData3.push(items)
        }
        if (items.status == 3 || items.status == 4) {
          OrderData4.push(items)
        }
      })
      this.setData({
        OrderData: res.data,
        OrderData1: OrderData1,
        OrderData2: OrderData2,
        OrderData3: OrderData3,
        OrderData4: OrderData4
      })
      // 计算时间
      timer = setInterval(() => {
        arrTime.forEach((item, index) => {
          if (item != 0) {
            item--
          } else {
            let arr = this.data.OrderData1
            arr.splice(index, 1)
            this.setData({
              OrderData1: arr
            })
          }
          arrTime.splice(index, 1, item)
          timeArr.splice(index, 1, timeStamp(item))
          this.setData({
            timeArr: timeArr
          })
        })
      }, 1000)
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  // 微信支付
  payMent: function (e) {
    data('/api/pay/pay', {
      order_sn: e.currentTarget.dataset.sn
    }, (res) => {
      if (!res.code) {
        wx.requestPayment({
          timeStamp: res.timeStamp,
          nonceStr: res.nonceStr,
          package: res.package,
          signType: res.signType,
          paySign: res.paySign,
          success: (rs) => {
            if (rs.errMsg == 'requestPayment:ok') {
              this.setData({
                swiperIndex: 2
              })
              this.getOrderList()
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
  // 关闭订单
  closeOrder: function (e) {
    wx.showModal({
      title: '是否关闭订单?',
      success: res => {
        if (res.confirm) {
          data('/api/order/closeOrder', {
            order_sn: e.currentTarget.dataset.sn
          }, res => {
            if (res.code == 0) {
              this.getOrderList()
            }
          })
        }
      }
    })
  },
  // 确认收货
  confirmGoods: function (e) {
    data('/api/order/confirmShipping', {
      order_sn: e.currentTarget.dataset.sn
    }, res => {
      if (res.code == 0) {
        wx.showToast({
          title: '确认成功',
          duration: 1500,
          success: () => {
            this.setData({
              swiperIndex: 4
            })
            this.getOrderList()
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
  // 查看快递轨迹
  checkLogistics: function (e) {
    wx.navigateTo({
      url: '/pages/expressTrack/expressTrack?sn=' + e.currentTarget.dataset.sn
    })
  },
  // 跳转到订单详情
  goOrderInfo: function (e) {
    wx.navigateTo({
      url: '/pages/orderInfo/orderInfo?sn=' + e.currentTarget.dataset.sn
    })
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    // 判断第几页是否有数据,再加载对应的数据
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    this.getOrderList()
  },
  // 跳转到团购详情
  goBuyJoin: function(e) {
    wx.navigateTo({
      url: '/pages/buyJoint/buyJoint?url_code=' + e.currentTarget.dataset.code
    })
  },
  onLoad: function (o) {
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    if (o.index) {
      this.setData({
        swiperIndex: o.index
      })
    }
    check(app, () => {
      this.getOrderList()
    })
    if (o.sn) {
      let time = setTimeout(() => {
        this.setData({
          sn: 'id' + o.sn
        })
        clearTimeout(time)
      }, 1000)
    }
  },
  onUnload: function () {
    clearInterval(timer)
  }
})