import {
  data,
  timeStamp
} from '../../utils/util'
//获取应用实例
const app = getApp()
var timer
Page({
  data: {
    goTop: false, // 检测是否显示回到顶部按钮
    bargainStatus: false,
    rule: false
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
  // 获取砍价数据
  getBargainInfo: function () {
    data('/api/cutprice/getInfo', {
      url_code: this.data.url_code
    }, (res) => {
      clearInterval(timer)
      let timeArr = res.data.over_second
      let arrTime = res.data.over_second
      res.data.yikan = Math.round((res.data.goods_price - res.data.goods_now_price) * 100) / 100
      res.data.weikan = Math.round((res.data.goods_now_price - res.data.goods_final_price) * 100) / 100
      this.setData({
        bargainInfo: res.data
      })
      // 计算时间
      if (arrTime > 0) {
        timer = setInterval(() => {
          if (arrTime != 0) {
            arrTime--
            timeArr = timeStamp(arrTime)
            this.setData({
              timeArr: timeArr
            })
          } else {
            clearInterval(timer)
          }
        }, 1000)
      } else {
        this.setData({
          timeArr: 0
        })
      }
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  // 点击砍价
  tapBargain: function () {
    if (this.data.cutprice_price > 0) {
      this.setData({
        bargainStatus: true
      })
      return false
    }
    wx.showLoading({
      title: '正在砍价',
      mask: true
    })
    data('/api/cutprice/getCut', {
      url_code: this.data.url_code
    }, (res) => {
      if (res.code == 0) {
        this.setData({
          bargainStatus: true,
          cutprice_price: res.cutprice_price
        })
      }
      wx.showToast({
        title: res.msg,
        icon: 'none',
        mask: true
      })
    })
  },
  // 转发砍价
  onShareAppMessage: function (e) {
    return {
      title: '一刀999,还不快来砍我!!!',
      path: '/pages/bargain/bargain?url_code=' + this.data.bargainInfo.url_code
    }
  },
  // 关闭弹出框
  closePopout: function () {
    this.setData({
      bargainStatus: false
    })
    if (this.data.is_bangta) {
      return false
    }
    this.getBargainInfo()
  },
  // 查看其他商品
  checkOther: function () {
    wx.redirectTo({
      url: '/pages/bargain/bargain'
    })
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    this.getBargainInfo()
  },
  // 前往购买
  goPayInfo: function () {
    if (this.data.bargainInfo.order_sn && this.data.bargainInfo.order_status == 1) {
      data('/api/pay/pay', {
        order_sn: this.data.bargainInfo.order_sn
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
                wx.redirectTo({
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
      goods_id: this.data.bargainInfo.goods_id,
      goods_name: this.data.bargainInfo.goods_name,
      spec_key: this.data.bargainInfo.spec_key,
      goods_num: this.data.bargainInfo.goods_num,
      goods_img: this.data.bargainInfo.goods_img,
      shop_price: this.data.bargainInfo.goods_now_price,
      spec_key_name: this.data.bargainInfo.spec_key_name
    }]
    wx.setStorageSync('goodsData', arr)
    wx.redirectTo({
      url: '/pages/payInfo/payInfo'
    })
  },
  // 前往订单
  goOrder: function () {
    wx.navigateTo({
      url: '/pages/order/order'
    })
  },
  // 再砍一次
  chopAgain: function () {
    wx.showModal({
      title: '是否再次发起砍价?',
      content: '规格: ' + this.data.bargainInfo.spec_key_name,
      success: rs => {
        if (rs.confirm) {
          data('/api/cutprice/addCutprice', {
            goods_id: this.data.bargainInfo.goods_id,
            spec_key: this.data.bargainInfo.spec_key,
            goods_num: this.data.bargainInfo.goods_num
          }, res => {
            if (res.code == 0) {
              this.setData({
                url_code: res.url_code
              })
              this.getBargainInfo()
            } else {
              wx.showToast({
                title: res.msg,
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },
  // 显示规则
  getRule: function() {
    this.setData({
      rule: true
    })
  },
  // 关闭规则
  closeRule: function() {
    this.setData({
      rule: false
    })
  },
  onLoad: function (o) {
    if (o.url_code) {
      wx.showLoading({
        title: '正在加载',
        mask: true
      })
      this.setData({
        url_code: o.url_code
      })
      this.getBargainInfo()
    }
  },
  onUnload: function () {
    clearInterval(timer)
  }
})