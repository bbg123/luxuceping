import { data } from '../../utils/util'
//获取应用实例
const app = getApp()

Page({
  data: {
    goTop: false, // 检测是否显示回到顶部按钮
    collect: false
  },
  // 滚动检测
  onPageScroll: function(e) {
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
  goTop: function() {
    wx.pageScrollTo({
      scrollTop: 0
    })
  },
  // 回到首页
  gohome: function() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  // 获取拼团商品数据
  getJointGoodsInfo: function() {
    data('/api/goods/getInfo', {
      id: this.data.goodsId
    }, res => {
      this.setData({
        JointGoods: res.data,
        collect: res.data.is_collect
      })
    })
  },
  collect: function(e) {
    data('/api/goods_collect/addCollect', {
      id: e.currentTarget.dataset.id
    }, (res) => {
      if (res.code) {
        wx.showToast({
          title: res.msg,
          icon: 'none'
        })
        this.setData({
          collect: true
        })
      }
    })
  },
  onLoad: function (o) {
    if (o.id) {
      this.setData({
        goodsId: o.id
      })
      this.getJointGoodsInfo()
    }
  },
})
