const api = require('../../api/api.js')
let adManager = wx.getBackgroundAudioManager()
let userLat,userLng,adsrc
Page({
  data: {
    cityCode: '',
    fileUrl: api.fileUrl,
    banners: [],
    spotLists: [],
    recSpots: [],
    page: 1,
    pages: 0,
    loading: false,
    nodata:false,
    codeModel: false,
    centerModel: false,
    animationData: {},
    codeValue: '',
    codeClick: false,
    codeSucc: false,
    playimg: '',
    adplay:true,
    playbtnStatus: false,
    amdata: {},
  },
  onLoad: function (query) {
    let cityCode
    let wm = this
    wm.getBanners()
    wm.getRecommend()
    wm.getUser()
    if (!query.cityCode) {
      if (wx.getStorageSync('cityCode')) {
        cityCode = wx.getStorageSync('cityCode')
      } else {
        cityCode = '440100'
      }
      wm.setData({cityCode: cityCode})
      wm.getspotList(cityCode)
      wx.getLocation({
        type: 'gcj02',
        success: function (res) {
          userLat = res.latitude
          userLng = res.longitude
          let data = { key: api.gaodeRestKey, location: `${res.longitude},${res.latitude}` }
          api.GetCity(data).then(res => {
            return res.data.regeocode.addressComponent.city
          }).then(city => {
            let data = { cityCode: city }
            api.GetCityByCode(data).then(res => {
              return res.data.data
            }).then(data => {
              if (data.areacode == wm.data.cityCode) {
                return
              } else {
                wx.showModal({
                  title: '切换城市',
                  content: `定位到您在${data.areaname},是否切换城市?`,
                  confirmText: "切换",
                  cancelText: "取消",
                  success: function (res) {
                    console.log(res)
                    if (res.confirm) {
                      wm.setData({ cityCode: data.areacode, spotLists: [] })
                      wx.setStorageSync('cityCode', data.areacode)
                      wm.getspotList(data.areacode)
                    } else {
                      console.log('取消')
                    }
                  }
                })
              }
            })
          })
        }
      })
    } else {
      cityCode = query.cityCode
      wm.setData({cityCode: cityCode})
      wm.getspotList(cityCode)
    }
  },
  //  获取用户个人信息
  getUser: function(){
    wx.login({
      success: function (res) {
        console.log(res)
      }
    })
  },
  // 获取banner
  getBanners: function () {
    let wm = this
    api.GetBanners().then(res => {
      wm.setData({banners: res.data.data})
    },err=>{
      console.log(err)
    })
  },
  //  获取推荐景区
  getRecommend: function () {
    let wm = this
    wm.data.recSpots = []
    api.GetRecommend().then(res => {
      wm.data.recSpots = [...wm.data.recSpots, ...res.data.data]
      wm.setData({recSpots: wm.data.recSpots})
    })
  },
  //  切换推荐景区
  changeRecSpots: function () {
    this.getRecommend()
  },
  // 个人中心
  mycenter: function () {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'linear',
      delay: 0
    })
    this.animation = animation
    animation.translateX(-260).step()
    this.setData({
      animationData: animation.export(),
      centerModel: true
    })
    setTimeout(function () {
      animation.translateX(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
  },
  hideCenterModel: function () {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateX(-260).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateX(0).step()
      this.setData({
        animationData: animation.export(),
        centerModel: false
      })
    }.bind(this), 200)
  },
  // 弹出授权码激活窗口
  codeActive: function () {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'linear',
      delay: 0
    })
    this.animation = animation
    animation.translateY(-200).step()
    this.setData({
      animationData: animation.export(),
      codeClick: false,
      codeModel: true
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
  },
  hideCodeModel: function () {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(-200).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        codeModel: false
      })
    }.bind(this), 200)
  },
  // 输入激活码验证
  codeInput: function (e) {
    this.setData({
      codeValue: e.detail.value
    })
  },
  testCode: function (e) {
    let code = e.currentTarget.dataset.cd
    let wm = this
    if (!code) {
      return
    } else{
      let data = { spotId: '276c668cebd141a992e10f3d76640608', licenseCode: code}
      api.testCode(data).then(res => {
        wm.setData({codeClick: true})
        if(res.data.data.status === 1) {
          wm.setData({codeSucc: true,testCodeMsg: res.data.data.msg})
        } else{
          wm.setData({ testCodeMsg: res.data.data.msg})
        }
      },err =>{
      })
    }
  },
  codeConfirm: function(e){
    let status = e.currentTarget.dataset.cdstatus
    console.log(status)
    this.hideCodeModel()
  },
  // 弹出二维码扫描
  scanewm: function () {
    wx.scanCode({
      success: (res) => {
        console.log(res)
      }
    })
  },
  // 切换城市
  changeCity: function () {
    wx.navigateTo({
      url: '../city/city'
    })
  },
  // 附近洗手间
  toBathroom: function(){
    wx.navigateTo({
      url: '../bathroom/bathroom',
    })
  },
  //  点击搜索
  toSearch: function () {
    wx.navigateTo({
      url: '../search/search',
    })
  },
  //  点击跳转Scenic页面
  toScenic: function (e) {
    let spid = e.currentTarget.dataset.spid
    wx.navigateTo({
      url: `../scenic/scenic?spotid=${spid}&userLat=${userLat}&userLng=${userLng}`,
    })
  },
  // 支付
  toPay: function (){
    wx.navigateTo({
      url: '../pay/pay',
    })
  },
  // 查看订单
  toOrder: function () {
    wx.navigateTo({
      url: '../order/order',
    })
  },
  //  意见反馈
  toFeedback: function(){
    wx.navigateTo({
      url: '../feedback/feedback',
    })
  },
  //  收费说明
  toCharge: function(){
    wx.navigateTo({
      url: '../charge/charge',
    })
  },
  //  授权码
  toCode: function(){
    wx.navigateTo({
      url: '../code/code',
    })
  },
  // 触底加载
  onReachBottom: function () {
    let wm = this
    if(wm.data.page >= wm.data.pages) {
      wm.setData({loading: true})
      setTimeout(() =>{
        wm.setData({ loading: false })
        wm.setData({nodata:true})
        setTimeout(()=>{
          wm.setData({nodata: false})
        },2000)
      },3000)
    } else{
      wm.data.page++
      wm.setData({page: wm.data.page})
      wm.getspotList(wm.data.cityCode, wm.data.page)
    }
  },
  // 加载列表
  getspotList: function (code, page = 1) {
    let data = {cityCode: code, page: page}
    let wm = this
    api.GetspotList(data).then(res => {
      wm.setData({ spotLists: [...wm.data.spotLists, ...res.data.data.records],pages:res.data.data.pages})
      wx.getLocation({
        success: function(res) {
          userLat = res.latitude
          userLng = res.longitude
          wm.data.spotLists.forEach(item => {
            let dis = api.getDistance(userLat, userLng, Number(item.latitude), Number(item.longitude))
            dis = dis >= 1000 ? ((dis / 1000).toFixed(1) + 'km') : (dis.toFixed(0) + 'm')
            item.distance = dis
          })
          wm.setData({spotLists: [...wm.data.spotLists]})
        },
      })
      console.log(wm.data.spotLists)
    })
  },
  onShow: function(){
    let wm = this
    if(wx.getStorageSync('thisPoi')){
      let tp = wx.getStorageSync('thisPoi')
      wm.setData({playimg: wm.data.fileUrl+tp.imageurl})
    }
    if (adManager.src){
      adsrc = adManager.src
      var am = wx.createAnimation({
        duration: 180000,
        timingFunction: "linear",
        delay: 0,
      })
      wm.am = am
      wm.setData({ amdata: am.export() })

      let canr = false
      adManager.onTimeUpdate(() => {
          if(!canr) {
            let ct = Math.ceil(adManager.currentTime) * 1000
            wm.am.rotate(1800).step({ duration: 180000 - ct })
            wm.setData({ amdata: wm.am.export() })
            canr = true
          }
      })
      adManager.onPlay(() => {
        wm.setData({ adplay: true })
        //  按钮旋转
        let ct = Math.ceil(adManager.currentTime) * 1000
        wm.am.rotate(1800).step({ duration: 180000 - ct })
        wm.setData({ amdata: wm.am.export() })
      })
      adManager.onPause(() => {
        wm.setData({ adplay: false })
        let deg = Math.ceil(adManager.currentTime) * 10 //  转过的角度
        wm.am.rotate(deg).step({ duration: 0 })
        wm.setData({ amdata: wm.am.export() })
      })
      adManager.onStop(() => {
        wm.setData({ adplay: false })
        wm.am.rotate(0).step({ duration: 0 })
        wm.setData({ amdata: wm.am.export() })
      })
      adManager.onEnded(() => {
        wm.setData({ adplay: false })
        wm.am.rotate(0).step({ duration: 0 })
        wm.setData({ amdata: wm.am.export() })
      })
      if (!adManager.paused) {
        wm.setData({ playbtnStatus: true,adplay:true})
      }
    }
  },
  //  点击播放按钮
  btnplayClk: function (){
    if(adManager.paused){
      adManager.play()
    } else{
      adManager.pause()
    }
    if(!adManager.src){
      let wm = this
      let tp = wx.getStorageSync('thisPoi')
      adManager.src = adsrc
      adManager.title = tp.name
      adManager.coverImgUrl = wm.data.fileUrl + tp.imageurl
      adManager.onTimeUpdate(() => {
      })
      adManager.onPlay(() => {
        wm.setData({ adplay: true })
        //  按钮旋转
        let ct = Math.ceil(adManager.currentTime) * 1000
        wm.am.rotate(1800).step({ duration: 180000 - ct })
        wm.setData({ amdata: wm.am.export() })
      })
      adManager.onPause(() => {
        wm.setData({ adplay: false })
        let deg = Math.ceil(adManager.currentTime) * 10 //  转过的角度
        wm.am.rotate(deg).step({ duration: 0 })
        wm.setData({ amdata: wm.am.export() })
      })
      adManager.onStop(() => {
        wm.setData({ adplay: false })
        wm.am.rotate(0).step({ duration: 0 })
        wm.setData({ amdata: wm.am.export() })
      })
      adManager.onEnded(() => {
        wm.setData({ adplay: false })
        wm.am.rotate(0).step({ duration: 0 })
        wm.setData({ amdata: wm.am.export() })
      })
    }
  }
})