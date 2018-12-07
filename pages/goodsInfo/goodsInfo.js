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
    collect: false,
    cid: 0, // 0是普通商品 2是拼团
    buyNum: 1,
    goodsSelect: false,
    selectArr: [],
    storeCountArr: [],
    buyJoinBox: false
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
  goinfo: function () {
    wx.navigateTo({
      url: '/pages/bargainInfo/bargainInfo'
    })
  },
  // 回到首页
  gohome: function () {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  // 收藏
  collect: function () {
    if (this.data.collect) {
      wx.showModal({
        title: '是否取消收藏?',
        success: res => {
          if (res.confirm) {
            this.isCollect()
          }
        }
      })
      return false
    }
    this.isCollect()
  },
  isCollect: function () {
    data('/api/goods_collect/addCollect', {
      id: this.data.goodsData.id
    }, (res) => {
      if (res.code == 0) {
        this.setData({
          collect: !this.data.collect
        })
      }
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
    })
  },
  // 获取商品数据
  getGoodsData: function () {
    data('/api/goods/getInfo', {
      id: this.data.goods_id
    }, (res) => {
      res.data.spec_map = this.bubbleSort(res.data.spec_map)
      let arr1 = []
      let img
      res.data.spec_map.forEach(item => {
        // 默认选中第一张图片
        for (let i = 0; i < item.item.length; i++) {
          if (img) {
            break
          }
          img = item.item[i].img
        }
        arr1.push(null)
      })

      clearInterval(timer)
      let timeArr = []
      let arrTime = []
      res.data.pintuan.record_list.forEach(item => {
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
        goodsData: res.data,
        collect: res.data.is_collect,
        speMap: res.data.spec_map,
        specList: res.data.spec_list,
        goodsImg: img,
        selectArr: arr1
      })
      this.countPrice()
      this.getOptionItem()
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },
  // 从小到大排序
  bubbleSort: function (arr) {
    for (var i = 0; i < arr.length; i++) {
      for (var j = i; j < arr.length; j++) {
        if (arr[i].item.length > arr[j].item.length) {
          [arr[i], arr[j]] = [arr[j], arr[i]]
        } else if (arr[i].item.length == arr[j].item.length) {
          if (arr[i].id > arr[j].id) {
            [arr[i], arr[j]] = [arr[j], arr[i]]
          }
        }
      }
    }
    return arr
  },
  // 选择商品
  selectGoods: function (e) {
    let id = e.currentTarget.dataset.id
    let cid = e.currentTarget.dataset.cid
    let arr1 = this.data.selectArr
    let arr2 = this.data.speMap
    if (e.currentTarget.dataset.img) {
      this.setData({
        goodsImg: e.currentTarget.dataset.img
      })
    }
    // 判断是否选择
    arr2.forEach((items, index) => {
      if (items.id == cid) {
        if (arr1[index] != id) {
          arr1[index] = id
        } else {
          arr1[index] = null
        }
      }
    })
    this.setData({
      selectArr: arr1
    })
    this.countPrice()
    this.getOptionItem()
  },
  // 筛选选中哪条数据
  countPrice: function () {
    let key = this.data.selectArr.join('_')
    let index = 0
    let arr = this.data.goodsData.spec_list
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].key == key) {
        this.setData({
          goodsPrice: arr[i].price,
          keyName: arr[i].key_name,
          storeCount: arr[i].store_count
        })
        break
      }
      index++
    }
    if (index == arr.length) {
      this.setData({
        goodsPrice: 0,
        keyName: '',
        storeCount: 0
      })
    }
  },
  // 获取可以选择的选项
  getOptionItem: function () {
    let data = this.data.speMap
    let arr1 = []
    let arr = []
    let key = ''
    this.data.specList.forEach(items => {
      this.data.selectArr.forEach(item => {
        if (item == null) {
          return false
        }
        if (items.key.indexOf(item) != -1 && items.store_count <= 0 && key != items.key) {
          key = items.key
          arr1.push(items.key.split('_'))
        }
      })
    })

    arr1.forEach(aitem => {
      let index = 0
      for (let i = 0; i < aitem.length; i++) {
        if (aitem[i] == this.data.selectArr[i] && this.data.selectArr.length >= Math.ceil(data.length / 2)) {
          index++
        }
      }
      if (index >= Math.ceil(this.data.selectArr.length / 2)) {
        arr = arr.concat(aitem)
      }
    })

    arr = Array.from(new Set(arr))

    this.data.selectArr.forEach(items => {
      arr.forEach((item, index) => {
        if (items == item) {
          arr.splice(index, 1)
        }
      })
    })

    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].item.length; j++) {
        if (arr.length == 0) {
          data[i].item[j].noStore = false
          continue
        }
        for (let z = 0; z < arr.length; z++) {
          if (data[i].item[j].id == arr[z]) {
            data[i].item[j].noStore = true
            break
          } else {
            data[i].item[j].noStore = false
          }
        }
      }
    }
    this.setData({
      speMap: data
    })
  },
  // 减少数量
  delNum: function () {
    if (this.data.buyNum <= 1) {
      return false
    }
    this.setData({
      buyNum: this.data.buyNum - 1
    })
  },
  // 增加数量
  addNum: function () {
    if (this.data.buyNum >= this.data.storeCount) {
      return false
    }
    this.setData({
      buyNum: this.data.buyNum + 1
    })
  },
  // 关闭选择商品框
  closeGoodsSelect: function () {
    this.setData({
      goodsSelect: false
    })
  },
  // 打开选择商品框
  openGoodsSelect: function () {
    this.setData({
      goodsSelect: true
    })
  },
  // 点击购买
  tapBuy: function (e) {
    let type = this.checkSelectArr()
    if (type) {
      wx.showToast({
        title: '请选择商品规格',
        icon: 'none'
      })
      return false
    }
    let arr = []
    if (e.currentTarget.dataset.cid == 2) {
      data('/api/pintuan/addPintuan', {
        goods_id: this.data.goodsData.id,
        spec_key: this.data.selectArr.join('_'),
        goods_num: this.data.buyNum
      }, res => {
        if (res.code == 0) {
          arr = [{
            cid: e.currentTarget.dataset.cid,
            goods_id: this.data.goodsData.id,
            goods_name: this.data.goodsData.goods_name,
            spec_key: this.data.selectArr.join('_'),
            goods_num: this.data.buyNum,
            goods_img: this.data.goodsImg,
            shop_price: this.data.goodsData.pintuan.pintuan_price,
            spec_key_name: this.data.keyName,
            urlCode: res.url_code
          }]
          wx.setStorageSync('goodsData', arr)
          wx.navigateTo({
            url: '/pages/payInfo/payInfo'
          })
        } else {
          wx.showToast({
            title: res.msg,
            icon: 'none'
          })
        }
      })

    } else {
      arr = [{
        goods_id: this.data.goodsData.id,
        goods_name: this.data.goodsData.goods_name,
        spec_key: this.data.selectArr.join('_'),
        goods_num: this.data.buyNum,
        goods_img: this.data.goodsImg,
        shop_price: this.data.goodsPrice,
        spec_key_name: this.data.keyName
      }]
      wx.setStorageSync('goodsData', arr)
      wx.navigateTo({
        url: '/pages/payInfo/payInfo'
      })
    }
  },
  // 添加到购物车
  addShopCar: function () {
    let type = this.checkSelectArr()
    if (type) {
      wx.showToast({
        title: '请选择商品规格',
        icon: 'none'
      })
      return false
    }
    if (this.data.selectArr.length == this.data.speMap.length) {
      let selectArr = this.data.selectArr.join('_')
      data('/api/cart/addCart', {
        goods_id: this.data.goodsData.id,
        spec_key: selectArr,
        goods_num: this.data.buyNum
      }, (res) => {
        if (res.code == 0) {
          wx.showModal({
            title: '已加入购物车,去看看?',
            cancelText: '再逛逛',
            confirmText: '去看看',
            success: (res) => {
              if (res.confirm) {
                wx.switchTab({
                  url: '/pages/shopCar/shopCar'
                })
              } else {
                this.setData({
                  goodsSelect: false
                })
              }
            }
          })
        }
      })
    } else {
      wx.showToast({
        title: '请选择商品',
        icon: 'none',
        duration: 2000
      })
    }
  },
  // 判断是否选择完整
  checkSelectArr: function () {
    let type = false
    for (let i = 0; i < this.data.selectArr.length; i++) {
      if (this.data.selectArr[i] == null) {
        type = true
        break
      }
    }
    return type
  },
  // 查看轮播图图片大图
  viewSwiperImg: function (e) {
    wx.previewImage({
      urls: this.data.goodsData.imgs,
      current: e.currentTarget.dataset.imgsrc
    })
  },
  // 查看选择图片大图
  viewSelectImg: function (e) {
    wx.previewImage({
      urls: [e.currentTarget.dataset.imgsrc],
      current: e.currentTarget.dataset.imgsrc
    })
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    // 判断第几页是否有数据,再加载对应的数据
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    this.getGoodsData()
  },
  // 跳转到拼团详情
  goBuyJoinInfo: function(e) {
    wx.navigateTo({
      url: '/pages/buyJointInfo/buyJointInfo?url_code=' + e.currentTarget.dataset.code
    })
  },
  // 操作拼团
  openBuyJoinBox: function() {
    this.setData({
      buyJoinBox: !this.data.buyJoinBox
    })
  },
  // 跳转到拼团商品详情
  goJoinGoodsInfo: function() {
    wx.navigateTo({
      url: '/pages/goodsInfo/goodsInfo?id=' + this.data.goodsData.id + '&cid=2'
    })
  },
  onLoad: function (o) {
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    if (o.cid == 2) {
      this.setData({
        cid: o.cid
      })
    }
    this.setData({
      goods_id: o.id
    })
    this.getGoodsData()
  },
  onReady: function() {
    let time = setTimeout(() => {
      this.setData({
        buyJoinBox: true
      })
      clearTimeout(time)
    }, 1000)
  }
})