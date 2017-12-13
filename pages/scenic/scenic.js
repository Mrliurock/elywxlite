const api = require('../../api/api.js')
let userLat, userLng
let adManager = wx.getBackgroundAudioManager()
let lineDetails = {}
Page({
  data: {
    loading:true,
    spotid:'',
    fileUrl: api.fileUrl,
    scenicPois: [],
    soundTypes: [],
    spotinfo: {},
    distance: '',
    ttimg: 'down',
    ttheight: '280rpx',
    thisPoi: {},
    thisLang: {},
    advalue: 0,
    maxvalue: 100,
    adsrc: '',
    animationData: {},
    amdata: {},
    langModalStatus: false,
    buyModalStatus: false,
    lineModalStatus: false,
    lineid: 0,
    lineList: [],
    lineDetail: {},
    scrollTop: 0,
    adplay: false,
    adtime: '0:00',
    atClick: false,
    codeClick: false,
    codeValue: '',
    codeSucc: false,
  },
  onLoad: function (query) {
    let wm = this
    if(query.userLat == undefined){
      userLat = query.userLat
      userLng = query.userLng
    } else{
      wx.getLocation({
        success: function(res) {
          userLat = res.latitude
          userLng = res.longitude
          let dis = api.getDistance(Number(userLat), Number(userLng), Number(wm.data.spotinfo.latitude), Number(wm.data.spotinfo.longitude))
          wm.data.distance = dis >= 1000 ? ((dis / 1000).toFixed(1) + 'km') : (dis.toFixed(0) + 'm')
          wm.setData({ distance: wm.data.distance })
        },
      })
    }
    wm.setData({ spotid: query.spotid ||'276c668cebd141a992e10f3d76640608'})
    let data = {spotId: wm.data.spotid}
    api.GetScenic(data).then(res=>{
      wm.data.spotinfo = Object.assign({},res.data.data.spotinfo)
      wm.data.scenicPois = [...res.data.data.scenicPois]
      wm.data.scenicPois.sort(function (a, b) {
        return a.charge - b.charge
      })
      wm.data.thisLang = res.data.data.soundTypes[0]
      wm.yycanPlay(wm.data.thisLang,wm.data.scenicPois)
      wm.setData({ soundTypes: [...res.data.data.soundTypes], spotinfo: wm.data.spotinfo, thisPoi: wm.data.scenicPois[0], thisLang: wm.data.thisLang, adsrc: wm.data.scenicPois[0].audios[0]?wm.data.fileUrl+wm.data.scenicPois[0].audios[0].url:''})
      wm.setData({loading: false})
      if(adManager.src){
        try {
          let thisPoi = wx.getStorageSync('thisPoi')
          if (thisPoi) {
            wm.setData({ thisPoi: thisPoi })
          }
        } catch (e) {
          console.log(e)
        }
      }
      wx.setNavigationBarTitle({
        title: wm.data.spotinfo.name,
      })
      let dis = api.getDistance(Number(userLat), Number(userLng), Number(wm.data.spotinfo.latitude), Number(wm.data.spotinfo.longitude))
      wm.data.distance = dis >= 1000 ? ((dis / 1000).toFixed(1) + 'km') : (dis.toFixed(0) + 'm')
      wm.setData({distance: wm.data.distance})
    })
  },
  //  展开折叠文本
  allText: function (e) {
    let dt = e.currentTarget.dataset.dt
    let wm = this
    if(dt === 'down') {
      wm.data.ttimg = 'up'
      wm.data.ttheight = 'auto'      
    } else{
      wm.data.ttimg = 'down'
      wm.data.ttheight = '280rpx'
    }
    wm.setData({ttimg: wm.data.ttimg,ttheight: wm.data.ttheight})
  },
  //  选择语言
  langModal: function(e) {
    let lm = e.currentTarget.dataset.status
    this.changeLang(lm)  
  },
  changeLang: function(lm) {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'linear',
      delay: 0
    })
    this.animation = animation
    animation.opacity(0).translateY(-200).step()
    this.setData({animationData: animation.export()})
    setTimeout(function () {
      animation.opacity(1).translateY(0).step()
      this.setData({
        animationData: animation
      })
      if (lm === 'close') {
        this.setData({ langModalStatus: false})
      }
    }.bind(this),200)
    if (lm === 'open') {
      this.setData({ langModalStatus: true })
    }
  },
  langChange: function(e){
    let scode = e.detail.value
    let wm = this
    wm.data.soundTypes.forEach((item) =>{
      item.checked = false
      if (item.scode === scode){
        item.checked = true
        wm.setData({thisLang: item})
      }
    })
    wm.yycanPlay(wm.data.thisLang,wm.data.scenicPois)
    wm.getadsrc()
    if (adManager.src) {
      wm.resetPlay()
    }
  },
  clickLang: function () {
    this.changeLang('close')
  },
  //  获取语音src
  getadsrc: function () {
    let scode = this.data.thisLang.scode
    let wm = this
    wm.data.thisPoi.audios.forEach((item)=>{
      if (item.scode == scode) {
        wm.data.adsrc = wm.data.fileUrl + item.url
      }
    })
    wm.setData({adsrc: wm.data.adsrc})
  },
  // 播放当前景点语音
  playThisPoi: function (e) {
    let tp = e.currentTarget.dataset.tp
    let wm = this
    let oldsrc = wm.data.adsrc
    if(tp.locked || tp.noAd){
      return
    }
    this.setData({thisPoi: tp})
    this.getadsrc()
    if(wm.data.adsrc == oldsrc){
      this.playAD()
    } else {
      // wm.audioCtx = wx.createAudioContext('snAudio')
      // wm.audioCtx.setSrc(wm.data.adsrc)
      // wm.audioCtx.play()
      wm.resetPlay()
      wm.setData({ adplay: true })
    }
  },
  //  地址改变，初始化播放
  resetPlay: function () {
    let wm = this
    // 储存当前播放语音的点
    try {
      wx.setStorageSync('thisPoi', wm.data.thisPoi)
    } catch (e) {
      console.log(e)
    }
    adManager.src = wm.data.adsrc
    adManager.title = wm.data.thisPoi.name
    adManager.coverImgUrl = wm.data.fileUrl + wm.data.thisPoi.imageurl
    adManager.onTimeUpdate(() => {
      wm.adtimeupdata()
    })
    adManager.onPlay(() => {
      wm.setData({ adplay: true })
      //  按钮旋转
      let ct = Math.ceil(adManager.currentTime)*1000
      wm.am.rotate(1800).step({duration: 180000-ct})
      wm.setData({ amdata: wm.am.export() })
    })
    adManager.onPause(() => {
      wm.setData({ adplay: false })
      let deg = Math.ceil(adManager.currentTime)*10 //  转过的角度
      wm.am.rotate(deg).step({duration: 0})
      wm.setData({amdata: wm.am.export()})
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
  },
  //  播放当前语音
  playAD: function () {
    let wm = this
    // wm.audioCtx = wx.createAudioContext('snAudio')
    // if (wm.data.adplay) {
    //   wm.audioCtx.pause()
    //   wm.setData({adplay: false})
    // } else if(!wm.data.adplay){
    //   wm.audioCtx.play()
    //   wm.setData({adplay: true})
    // }
    if (wm.data.adplay) {
      adManager.pause()
      wm.setData({ adplay: false })
    } else if(!wm.data.adplay){
      if(adManager.src){
        adManager.play()
      } else{
        wm.resetPlay()
      }
      wm.setData({ adplay: true })
    }
  },
  //  语音播放进度
  adtimeupdata: function () {
    let ctime = Math.ceil(adManager.currentTime)
    let dt = Math.ceil(adManager.duration)
    if (dt !== 0 && dt !== this.data.maxvalue) {
      this.setData({maxvalue:dt})
    }
    let m = parseInt(ctime / 60)
    let ss = parseInt(ctime%60/10)
    let s = parseInt(ctime % 60 % 10) 
    this.data.adtime = `${m}:${ss}${s}`
    this.setData({advalue: ctime,adtime: this.data.adtime})
  },
  // adtimeupdata: function (e) {
  //   let ctime = Math.ceil(e.detail.currentTime)
  //   let dt = Math.ceil(e.detail.duration)
  //   if (dt !== this.data.maxvalue) {
  //     this.setData({ maxvalue: dt })
  //   }
  //   let m = parseInt(ctime / 60)
  //   let ss = parseInt(ctime % 60 / 10)
  //   let s = parseInt(ctime % 60 % 10)
  //   this.data.adtime = `${m}:${ss}${s}`
  //   this.setData({ advalue: ctime, adtime: this.data.adtime })
  // },
  // adended: function () {
  //   this.setData({adplay: false,})
  // },
  //  拖动进度条
  apChange: function (e) {
    let value = e.detail.value
    // this.audioCtx = wx.createAudioContext('snAudio')
    // this.audioCtx.seek(value)
    adManager.seek(value)
  },
  //  判断当前列表语音的状态
  yycanPlay: function (tl,sps) {
    let scode = tl.scode
    let wm = this
    sps.forEach((sp)=>{
      if (sp.charge) {
        sp.locked = true
      } else{
        sp.locked = false
      }
      if(!sp.imageurl) {
        sp.imageurl = wm.data.spotinfo.image
      }
      if(!sp.audios.length){
        sp.noAd = true
      } else{
        sp.noAd = false
        let hasAd = false
        sp.audios.forEach((ad)=>{
          if(ad.scode == scode){
            hasAd = true
          }
        })
        if (!hasAd) {
          ap.noAd = true
        }
      }
    })
    this.setData({scenicPois: [...sps]})
  },
  //  初始化播放按钮旋转动画
  onShow: function() {
    var am = wx.createAnimation({
      duration: 180000,
      timingFunction: "linear",
      delay: 0,
    })
    this.am = am
    this.setData({amdata: am.export()})
    //  重新进入页面获取正在播放语音
    let wm = this
    if (adManager.src) {
      if (!adManager.paused) {
        wm.setData({ adplay: true })
        let ct = Math.ceil(adManager.currentTime) * 1000
        wm.am.rotate(1800).step({ duration: 180000 - ct })
        wm.setData({ amdata: wm.am.export() })
      }
      adManager.onTimeUpdate(() => {
        wm.adtimeupdata()
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
  },
  //  购买激活
  buyModal: function (e) {
    let bm = e.currentTarget.dataset.status
    this.setData({ atClick: false, codeClick: false})
    this.buyactive(bm)
  },
  buyactive: function (bm) {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'linear',
      delay: 0
    })
    this.animation = animation
    animation.opacity(0).translateY(-210).step()
    this.setData({ animationData: animation.export() })
    setTimeout(function () {
      animation.opacity(1).translateY(0).step()
      this.setData({
        animationData: animation
      })
      if (bm === 'close') {
        this.setData({ buyModalStatus: false })
      }
    }.bind(this), 200)
    if (bm === 'open') {
      this.setData({ buyModalStatus: true })
    }
  },
  clickAC: function(){
    this.setData({atClick: true})
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
    } else {
      let data = { spotId: wm.data.spotid, licenseCode: code }
      api.testCode(data).then(res => {
        wm.setData({ codeClick: true })
        if (res.data.data.status === 1) {
          wm.setData({ codeSucc: true, testCodeMsg: res.data.data.msg })
        } else {
          wm.setData({ testCodeMsg: res.data.data.msg })
        }
      }, err => {
      })
    }
  },
  codeConfirm: function (e) {
    let status = e.currentTarget.dataset.cdstatus
    console.log(status)
    this.buyactive('close')
  },
  //  跳转到支付页面
  toPay: function() {
    wx.navigateTo({
      url: '../pay/pay?spotId='+this.data.spotid,
    })
  },
  //  路线
  lineModal: function (e) {
    let lm = e.currentTarget.dataset.status
    this.lineout(lm)
  },
  lineout: function (lm) {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'linear',
      delay: 0
    })
    this.animation = animation
    animation.opacity(0).step()
    this.setData({ animationData: animation.export() })
    setTimeout(function () {
      animation.opacity(1).step()
      this.setData({
        animationData: animation
      })
      if (lm === 'close') {
        this.setData({ lineModalStatus: false })
      }
    }.bind(this), 200)
    if (lm === 'open') {
      let wm = this
      if(!wm.data.lineList.length){
        let data = { spotid: wm.data.spotid }
        api.GetTourrouteList(data).then(res => {
          wm.setData({lineList: [...res.data.data]})
          if (res.data.data.length) {
            wm.setData({ lineid: res.data.data[0].id})
            return res.data.data[0].id
          }
        }).then(id=>{
          let data = {id: id}
          api.GetTourrouteDetail(data).then(res=>{
            wm.data.lineDetail = Object.assign({}, res.data.data)
            wm.setData({ lineDetail: wm.data.lineDetail })
            wx.getLocation({
              type: 'gcj02',
              success: function(res) {
                userLat = res.latitude
                userLng = res.longitude
                let distotal = 0
                wm.data.lineDetail.routePois.forEach((item,i,arr)=>{
                  if(i==0){
                    let dis = api.getDistance(Number(userLat), Number(userLng), Number(arr[0].latitude), Number(arr[0].longitude))
                    distotal += dis
                    arr[0].dis = dis >= 1000 ? ((dis / 1000).toFixed(0) + '公里') : (dis.toFixed(0) + '米')
                  } else{
                    let dis = api.getDistance(Number(arr[i - 1].latitude), Number(arr[i - 1].longitude), Number(arr[i].latitude), Number(arr[i].longitude))
                    distotal += dis
                    arr[i].dis = dis >= 1000 ? ((dis / 1000).toFixed(0) + '公里') : (dis.toFixed(0) + '米')
                  }
                })
                let time = distotal / 0.5  // 计算步行时间,单位为s
                wm.data.lineDetail.time = time >= 3000 ? ((time / 3600).toFixed(1) + '小时') : ((time / 60).toFixed(0) + '分钟')
                wm.data.lineDetail.distotal = distotal >= 1000 ? ((distotal / 1000).toFixed(1) + '公里') : (distotal.toFixed(0) + '米')
                wm.setData({ lineDetail: wm.data.lineDetail })
                lineDetails[id] = wm.data.lineDetail
              },
              complete: function(res){
                console.log(res)
              }
            })
          })
        })
      }
      this.setData({ lineModalStatus: true })
    }
  },
  chooseLine: function (e){
    let id = e.currentTarget.dataset.id
    let wm = this
    wm.setData({ lineid: id, scrollTop: 0})
    if (lineDetails[id]){
      wm.setData({ lineDetail: lineDetails[id] })
    } else {
      let data = { id: id }
      api.GetTourrouteDetail(data).then(res => {
        wm.data.lineDetail = Object.assign({}, res.data.data)
        wm.setData({ lineDetail: wm.data.lineDetail })
        wx.getLocation({
          type: 'gcj02',
          success: function (res) {
            userLat = res.latitude
            userLng = res.longitude
            let distotal = 0
            wm.data.lineDetail.routePois.forEach((item, i, arr) => {
              if (i == 0) {
                let dis = api.getDistance(Number(userLat), Number(userLng), Number(arr[0].latitude), Number(arr[0].longitude))
                distotal += dis
                arr[0].dis = dis >= 1000 ? ((dis / 1000).toFixed(0) + '公里') : (dis.toFixed(0) + '米')
              } else {
                let dis = api.getDistance(Number(arr[i - 1].latitude), Number(arr[i - 1].longitude), Number(arr[i].latitude), Number(arr[i].longitude))
                distotal += dis
                arr[i].dis = dis >= 1000 ? ((dis / 1000).toFixed(0) + '公里') : (dis.toFixed(0) + '米')
              }
            })
            let time = distotal/0.5  // 计算步行时间,单位为s
            wm.data.lineDetail.time = time >=3000?((time/3600).toFixed(1)+'小时'):((time/60).toFixed(0)+'分钟')
            wm.data.lineDetail.distotal = distotal >= 1000 ? ((distotal / 1000).toFixed(1) + '公里') : (distotal.toFixed(0) + '米')
            wm.setData({ lineDetail: wm.data.lineDetail })
            if (!lineDetails[id]) {
              lineDetails[id] = wm.data.lineDetail
            }
          },
        })
      })
    }   
  },
})