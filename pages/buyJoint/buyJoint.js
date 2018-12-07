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
    goTop: false, // 检测是否显示回到顶部按钮
    swiperIndex: 0,
    goodsList: [],
    msgList: [],
    mygoodsList: []
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
    wx.navigateTo({
      url: '/pages/goodsInfo/goodsInfo?id=' + e.currentTarget.dataset.id + '&cid=2'
    })
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
  // 禁止消息滑动
  catchTouchStart: function () {
    return false
  },
  // 获取列表
  getGoodsList: function () {
    data('/api/pintuan/getList', {}, (res) => {
      let arr = []
      // 筛选不为空值的数据
      res.push_list.forEach(item => {
        if (item.goods_name != null) {
          arr.push(item)
        }
      })
      this.setData({
        goodsList: res.list,
        msgList: arr
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  // 获取我的团购数据
  getMyGoodsList: function () {
    data('/api/pintuan/getMyList', {}, (res) => {
      clearInterval(timer)
      let timeArr = []
      let arrTime = []
      res.forEach((item, index) => {
        timeArr.push(timeStamp(item.over_second))
        arrTime.push(item.over_second)
        this.setData({
          timeArr: timeArr
        })
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
        mygoodsList: res
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
      this.getGoodsList()
    } else if (this.data.swiperIndex == 1 && this.data.mygoodsList.length == 0) {
      wx.showLoading({
        title: '正在加载',
        mask: true
      })
      this.getMyGoodsList()
    }
  },
  // 打开选择商品框
  openGoodsSelect: function (e) {
    this.setData({
      goodsSelect: true,
      goodsId: e.currentTarget.dataset.id,
      goodsName: this.data.goodsList[e.currentTarget.dataset.index].goods_name
    })
  },
  // 跳转到拼团详情
  goBuyJointInfo: function (e) {
    wx.navigateTo({
      url: '/pages/buyJointInfo/buyJointInfo?url_code=' + e.currentTarget.dataset.code
    })
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    // 判断第几页是否有数据,再加载对应的数据
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    if (this.data.swiperIndex == 0) {
      this.getGoodsList()
    } else if (this.data.swiperIndex == 1) {
      this.getMyGoodsList()
    }
  },
  // 再拼一次
  chopAgain: function (e) {
    let index = e.currentTarget.dataset.index
    wx.showModal({
      title: '是否再次发起拼团?',
      content: '规格: ' + this.data.mygoodsList[index].spec_key_name,
      success: rs => {
        if (rs.confirm) {
          data('/api/pintuan/addPintuan', {
            goods_id: this.data.mygoodsList[index].goods_id,
            spec_key: this.data.mygoodsList[index].spec_key,
            goods_num: this.data.mygoodsList[index].goods_num
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
  // 前往订单
  goOrder: function (e) {
    wx.navigateTo({
      url: '/pages/order/order?sn=' + this.data.mygoodsList[e.currentTarget.dataset.index].order_sn
    })
  },
  // 前往购买
  goPayInfo: function (e) {
    let index = e.currentTarget.dataset.index
    if (this.data.mygoodsList[index].order_status == 1) {
      data('/api/pay/pay', {
        order_sn: this.data.mygoodsList[index].order_sn
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
                wx.navigateTo({
                  url: '/pages/buyJointInfo/buyJointInfo?url_code=' + this.data.mygoodsList[index].url_code
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
    } else {
      let arr = [{
        cid: 2,
        goods_id: this.data.mygoodsList[index].goods_id,
        goods_name: this.data.mygoodsList[index].goods_name,
        spec_key: this.data.mygoodsList[index].spec_key,
        goods_num: this.data.mygoodsList[index].goods_num,
        goods_img: this.data.mygoodsList[index].goods_img,
        shop_price: this.data.mygoodsList[index].goods_final_price,
        spec_key_name: this.data.mygoodsList[index].spec_key_name
      }]
      wx.setStorageSync('goodsData', arr)
      wx.navigateTo({
        url: '/pages/payInfo/payInfo'
      })
    }
  },
  // 转发拼团
  onShareAppMessage: function (e) {
    if (e.from === 'button') {
      return {
        title: '团长喊你来打团,点击加入!!!',
        path: '/pages/buyJoint/buyJoint?url_code=' + this.data.mygoodsList[e.target.dataset.index].url_code
      }
    } else {
      return {
        title: '海量团购商品等你来选',
        path: '/pages/buyJoint/buyJoint'
      }
    }
  },
  onLoad: function (o) {
    check(app, () => {
      if (o.url_code) {
        wx.navigateTo({
          url: '/pages/buyJointInfo/buyJointInfo?url_code=' + o.url_code
        })
      }
      this.getdata()
    })
  },
})