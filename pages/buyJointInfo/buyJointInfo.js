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
  getBuyJointInfo: function () {
    data('/api/pintuan/getInfo', {
      url_code: this.data.url_code
    }, (res) => {
      clearInterval(timer)
      let timeArr = res.data.over_second
      let arrTime = res.data.over_second
      if (res.data.status == 1) {
        wx.hideShareMenu()
      }
      this.setData({
        buyJointInfo: res.data
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
  // 转发拼团
  onShareAppMessage: function () {
    return {
      title: '团长喊你来打团,点击加入!!!',
      path: '/pages/buyJoint/buyJoint?url_code=' + this.data.buyJointInfo.url_code
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
    this.getBuyJointInfo()
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
    this.getBuyJointInfo()
  },
  // 前往购买
  goPayInfo: function () {
    if (this.data.buyJointInfo.order_sn && this.data.buyJointInfo.order_status == 1) {
      data('/api/pay/pay', {
        order_sn: this.data.buyJointInfo.order_sn
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
                this.getBuyJointInfo()
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
  },
  // 前往订单
  goOrder: function () {
    if (this.data.buyJointInfo.status == 4) {
      wx.navigateTo({
        url: '/pages/refund/refund'
      })
    } else {
      wx.navigateTo({
        url: '/pages/order/order?sn=' + this.data.buyJointInfo.order_sn
      })
    }
  },
  // 再拼一次
  chopAgain: function () {
    wx.showModal({
      title: '是否再次发起拼团?',
      content: '规格: ' + this.data.buyJointInfo.spec_key_name,
      success: rs => {
        if (rs.confirm) {
          data('/api/pintuan/addPintuan', {
            goods_id: this.data.buyJointInfo.goods_id,
            spec_key: this.data.buyJointInfo.spec_key,
            goods_num: this.data.buyJointInfo.goods_num
          }, res => {
            if (res.code == 0) {
              this.setData({
                url_code: res.url_code
              })
              this.getBuyJointInfo()
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
  // 跳转到拼团商品
  gobuyJoint: function() {
    wx.redirectTo({
      url: '/pages/buyJoint/buyJoint'
    })
  },
  // 加入团购,支付
  payGoodsJoin: function() {
    if (this.data.buyJointInfo.user_sum == this.data.buyJointInfo.user_max) {
      wx.showToast({
        title: '抱歉,该团已满员,无法加入.',
        icon: 'none'
      })
      return false
    }
    let arr = [{
      cid: 2,
      goods_id: this.data.buyJointInfo.goods_id,
      goods_name: this.data.buyJointInfo.goods_name,
      spec_key: this.data.buyJointInfo.spec_key,
      goods_num: this.data.buyJointInfo.goods_num,
      goods_img: this.data.buyJointInfo.goods_img,
      shop_price: this.data.buyJointInfo.goods_final_price,
      spec_key_name: this.data.buyJointInfo.spec_key_name,
      url_code: this.data.buyJointInfo.url_code
    }]
    wx.setStorageSync('goodsData', arr)
    wx.navigateTo({
      url: '/pages/payInfo/payInfo'
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
      this.getBuyJointInfo()
    }
  },
  onUnload: function () {
    clearInterval(timer)
  }
})