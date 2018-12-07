import {
  data
} from "../../utils/util"
//获取应用实例
const app = getApp()

Component({
  properties: {
    goodsSelect: {
      type: Boolean,
      value: false
    },
    boxLink: {
      type: String,
      value: ''
    },
    goodsId: {
      type: String,
      value: ''
    },
    goodsName: {
      type: String,
      value: ''
    }
  },
  data: {
    buyNum: 1,
    goodsSelect: false,
    selectArr: [],
    storeCountArr: []
  },
  attached: function () {
    this.getGoodsData()
  },
  methods: {
    // 获取商品数据
    getGoodsData: function () {
      data('/api/goods/getSpec', {
        id: this.data.goodsId
      }, (res) => {
        res.spec_map = this.bubbleSort(res.spec_map)
        let arr = []
        let img
        res.spec_map.forEach(item => {
          // 默认选中第一张图片
          for (let i = 0; i < item.item.length; i++) {
            if (img) {
              break
            }
            img = item.item[i].img
          }
          arr.push(null)
        })
        this.setData({
          speMap: res.spec_map,
          specList: res.spec_list,
          goodsImg: img,
          selectArr: arr
        })
        this.countPrice()
        this.getOptionItem()
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
      let arr = this.data.specList
      let index = 0
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].key == key) {
          this.setData({
            keyName: arr[i].key_name,
            storeCount: arr[i].store_count
          })
          if (this.data.boxLink == "bargain") {
            this.setData({
              goodsPrice: arr[i].cutprice_price
            })
          } else if (this.data.boxLink == "buyJoint") {
            this.setData({
              goodsPrice: arr[i].pintuan_price
            })
          } else {
            this.setData({
              goodsPrice: arr[i].price
            })
          }
          break
        }
        index++
      }
      if (arr.length == index) {
        this.setData({
          keyName: '',
          storeCount: 0,
          goodsPrice: 0
        })
      }
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
    // 关闭选择商品框
    closeGoodsSelect: function () {
      var pages = getCurrentPages()
      var currPage = pages[pages.length - 1]
      currPage.setData({
        goodsSelect: false
      })
    },
    // 确认选择
    confirmSelect: function () {
      let type = false
      for (let i = 0; i < this.data.selectArr.length; i++) {
        if (this.data.selectArr[i] == null) {
          type = true
          break
        }
      }
      if (type) {
        wx.showToast({
          title: '请选择商品规格',
          icon: 'none'
        })
        return false
      }

      if (this.data.boxLink == 'bargain') {
        // 砍价接口
        data('/api/cutprice/addCutprice', {
          goods_id: this.data.goodsId,
          spec_key: this.data.selectArr.join('_'),
          goods_num: this.data.buyNum
        }, (res) => {
          if (res.code == 0) {
            this.closeGoodsSelect()
            wx.navigateTo({
              url: '/pages/bargainInfo/bargainInfo?url_code=' + res.url_code
            })
          } else {
            wx.showToast({
              title: res.msg,
              icon: 'none'
            })
          }
        })
      } else if (this.data.boxLink == 'buyJoint') {
        // 拼团接口
        data('/api/pintuan/addPintuan', {
          goods_id: this.data.goodsId,
          spec_key: this.data.selectArr.join('_'),
          goods_num: this.data.buyNum
        }, res => {
          if (res.code == 0) {
            let arr = [{
              cid: 2,
              goods_id: this.data.goodsId,
              goods_name: this.data.goodsName,
              spec_key: this.data.selectArr.join('_'),
              goods_num: this.data.buyNum,
              goods_img: this.data.goodsImg,
              shop_price: this.data.goodsPrice,
              spec_key_name: this.data.keyName,
              urlCode: res.url_code
            }]
            wx.setStorageSync('goodsData', arr)
            this.closeGoodsSelect()
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

      } else if (this.data.boxLink == 'common') {
        // 普通商品购买
        data('/api/cart/addCart', {
          goods_id: this.data.goodsId,
          spec_key: this.data.selectArr.join('_'),
          goods_num: this.data.buyNum
        }, (res) => {
          if (res.code == 0) {
            // 获取到当前页面, 修改数据
            var pages = getCurrentPages()
            var prevPage = pages[pages.length - 1]
            // 判断是否是首页, 加个特效
            if (prevPage.route == 'pages/index/index') {
              prevPage.setData({
                get_shopcar: this.data.goodsId,
                goodsSelect: false
              })
              let time = setTimeout(() => {
                prevPage.setData({
                  get_shopcar: 0
                })
                wx.setTabBarBadge({
                  index: 1,
                  text: '+1'
                })
                clearTimeout(time)
              }, 1000)
            } else {
              // 如果不是首页就提示是否跳转到购物车
              wx.showModal({
                title: '已加入购物车,去看看?',
                cancelText: '再逛逛',
                confirmText: '去看看',
                success: (res) => {
                  if (res.confirm) {
                    this.closeGoodsSelect()
                    wx.switchTab({
                      url: '/pages/shopCar/shopCar'
                    })
                  } else {
                    prevPage.setData({
                      goodsSelect: false
                    })
                  }
                }
              })
            }
          }
        })
      }
    },
    // 查看选择图片大图
    viewSelectImg: function (e) {
      wx.previewImage({
        urls: [e.currentTarget.dataset.imgsrc],
        current: e.currentTarget.dataset.imgsrc
      })
    },
  }
})