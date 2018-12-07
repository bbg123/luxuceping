import {
  data
} from "../../utils/util"
//获取应用实例
const app = getApp()

Page({
  data: {
    userName: '',
    telNumber: '',
    province: '',
    city: '',
    district: '',
    address: '',
    zipcode: '',
    user_note: '',
    goodsData: '',
    totalPrice: 0,
    usableCouponIndex: 0, // 可用优惠券默认索引
  },
  // 跳转地址
  getAddress: function () {
    this.openAddress()
    // 判断是否拒绝授权
    if (this.data.addressCode === 201) {
      // 拒绝授权打开设置
      wx.openSetting({
        success: (res) => {
          if (res.authSetting['scope.address'] == true) {
            this.setData({
              addressCode: 200
            })
            this.openAddress()
          }
        }
      })
    }
  },
  // 打开系统地址
  openAddress: function () {
    wx.chooseAddress({
      success: (res) => {
        if (res.errMsg == 'login:ok') {
          this.setData({
            addressCode: 200
          })
        }
        this.setData({
          'userName': res.userName,
          'telNumber': res.telNumber,
          'province': res.provinceName,
          'city': res.cityName,
          'district': res.countyName,
          'address': res.detailInfo,
          'zipcode': res.postalCode
        })
        wx.setStorageSync('userName', res.userName)
        wx.setStorageSync('telNumber', res.telNumber)
        wx.setStorageSync('province', res.provinceName)
        wx.setStorageSync('city', res.cityName)
        wx.setStorageSync('district', res.countyName)
        wx.setStorageSync('address', res.detailInfo)
        wx.setStorageSync('zipcode', res.postalCode)
      },
      fail: (res) => {
        if (res.errMsg != 'login:ok' && this.data.addressCode != 200) {
          this.setData({
            addressCode: 201
          })
        }
      }
    })
  },
  // 支付
  payment: function () {
    // 验证信息
    let userName = this.data.userName || ''
    if (userName == '') {
      this.showToast('请填写收件人')
      return false
    }
    let telNumber = this.data.telNumber || ''
    let myreg = /^[1][3,4,5,7,8][0-9]{9}$/
    if (telNumber == '') {
      this.showToast('请填写手机号')
      return false
    } else if (!myreg.test(telNumber)) {
      this.showToast('请填写正确的手机号')
      return false
    }
    let province = this.data.province || ''
    if (province == '') {
      this.showToast('请填写省份')
      return false
    }
    let city = this.data.city || ''
    if (city == '') {
      this.showToast('请填写城市')
      return false
    }
    let district = this.data.district || ''
    if (district == '') {
      this.showToast('请填写地区')
      return false
    }
    let address = this.data.address || ''
    if (address == '') {
      this.showToast('请填写详细地址')
      return false
    }
    // 判断如果获取过订单号就直接调用支付
    if (this.data.order_sn) {
      this.requestPayment(this.data.order_sn)
      return false
    }
    // 判断是否是购物车页面结算
    if (this.data.goodsData[0].id) { //购物车购买,需要传cart_id
      let arr = []
      this.data.goodsData.forEach(item => {
        arr.push(item.id)
      })
      data('/api/order/addOrder', {
        cart_id: arr,
        consignee: userName,
        mobile: telNumber,
        province: province,
        city: city,
        district: district,
        address: address,
        zipcode: this.data.zipcode,
        coupon_code: this.data.usableCoupon[this.data.usableCouponIndex].code,
        pay_type: this.data.pay_type || 1,
        user_note: this.data.user_note
      }, (res) => {
        if (res.code == 0) {
          this.setData({
            order_sn: res.order_sn
          })
          this.requestPayment(res.order_sn)
        }
      })
    } else {
      data('/api/order/addOrder', { //单个购买,需要传cid
        cid: this.data.goodsData[0].cid || 0,
        cart_id: '',
        consignee: userName,
        mobile: telNumber,
        province: province,
        city: city,
        district: district,
        address: address,
        zipcode: this.data.zipcode,
        pay_type: this.data.pay_type || 1,
        user_note: this.data.user_note,
        goods_id: this.data.goodsData[0].goods_id,
        spec_key: this.data.goodsData[0].spec_key,
        goods_num: this.data.goodsData[0].goods_num,
        url_code: this.data.goodsData[0].url_code || '' // 加入拼团需要传url_code
      }, (res) => {
        if (res.code == 0) {
          this.setData({
            order_sn: res.order_sn
          })
          this.requestPayment(res.order_sn)
        } else if (res.code == 2) {
          wx.showToast({
            title: res.msg,
            icon: 'none',
            duration: 1500,
            success: () => {
              let time = setTimeout(() => {
                wx.navigateTo({
                  url: '/pages/order/order?index=1'
                })
                clearTimeout(time)
              }, 1500)
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
    }
  },
  // 调用微信支付
  requestPayment: function (sn = '') {
    data('/api/pay/pay', {
      order_sn: sn
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
              if (this.data.goodsData[0].cid == 2) {
                wx.redirectTo({
                  url: '/pages/buyJointInfo/buyJointInfo?url_code=' + this.data.goodsData[0].urlCode
                })
              } else {
                wx.redirectTo({
                  url: '/pages/order/order?index=2'
                })
              }
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
  // 筛选
  showToast: function (msg) {
    wx.showToast({
      title: msg,
      icon: 'none',
      mask: true,
      duration: 1500
    })
  },
  // 获取可用优惠券
  getcoupon: function () {
    if (this.data.goodsData[0].cid > 0) {
      // 如果是活动商品直接使用原价格, 不需要扣除优惠券
      this.setData({
        payMentPrice: this.data.totalPrice
      })
      return false
    }
    data('/api/coupon/getMyList', {}, (res) => {
      let usableCoupon = []
      // 筛选可用的优惠券
      res.data.forEach(item => {
        if (this.data.totalPrice >= item.use_condition && item.status == 0) {
          usableCoupon.push(item)
        }
      })
      if (usableCoupon.length == 0) {
        usableCoupon.push({
          code: '',
          name: '无可用',
          money: 0
        })
      } else {
        // 将优惠券最大的放前面
        for (let i = 0; i < usableCoupon.length; i++) {
          for (let j = 0; j < usableCoupon.length - i; j++) {
            if (usableCoupon[i].money > usableCoupon[j].money) {
              [usableCoupon[i], usableCoupon[j]] = [usableCoupon[j], usableCoupon[i]]
            }
          }
        }
      }

      this.setData({
        usableCoupon: usableCoupon
      })
      this.getPayNum()
    })
  },
  // 选择优惠券
  bindPickerChange: function (e) {
    this.setData({
      usableCouponIndex: e.detail.value
    })
    this.getPayNum()
  },
  // 计算应付价格 (扣优惠券)
  getPayNum: function () {
    this.setData({
      payMentPrice: this.data.totalPrice - this.data.usableCoupon[this.data.usableCouponIndex].money
    })
  },
  // 计算总价
  getTotalPrice: function () {
    let num = 0
    this.data.goodsData.forEach(item => {
      num += parseInt(item.shop_price) * item.goods_num
    })
    this.setData({
      totalPrice: num
    })
    this.getcoupon()
  },
  // 获取备注
  getRemark: function (e) {
    this.setData({
      user_note: e.detail.value
    })
  },
  onLoad: function () {
    this.setData({
      goodsData: wx.getStorageSync('goodsData'),
      userName: wx.getStorageSync('userName') || '',
      telNumber: wx.getStorageSync('telNumber') || '',
      province: wx.getStorageSync('province') || '',
      city: wx.getStorageSync('city') || '',
      district: wx.getStorageSync('district') || '',
      address: wx.getStorageSync('address') || '',
      zipcode: wx.getStorageSync('zipcode') || ''
    })
    this.getTotalPrice()
  },
  onHide: function () {
    wx.removeStorageSync('goodsData')
  },
  onUnload: function () {
    wx.removeStorageSync('goodsData')
  }
})