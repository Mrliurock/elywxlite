const api = require('../../api/api.js')
let cityData, ctNodes
let ctHeight = {}
Page({
  data: {
    fileUrl: api.fileUrl,
    hotList: [],
    searchtext: '',
    cityList: {},
    noCity: false,
    scrollTop: 0,
    ctlter: '',
    ctclick: false,
    ifsearch: false,
    searchList: []
  },
  onLoad: function (options) {
    let wm = this
    wm.getareas('')
  },
  getareas: function (st) {
    let wm = this
    let params = { cityName: st }
    api.Getareas(params).then(res => {
      console.log(res)
      wm.setData({ hotList: [...wm.data.hotList, ...res.data.data.hot]})
      let citys = res.data.data.areas
      if (citys.length === 0) {
        wm.setData({noCity: true})
      } else {
        wm.setData({noCity: false})
      }
      cityData = citys
      citys.forEach(function (item, index) {
        let key = item.firstLetter
        if (!wm.data.cityList[key]) {
          wm.data.cityList[key] = []
        }
        wm.data.cityList[key].push(item)
        wm.setData({cityList: wm.data.cityList})
      })
      setInterval
      console.log(wm.data.cityList)
    })
  },
  moveTop: function () {
    this.setData({scrollTop: 0})
  },
  getctNodes: function () {
    if (ctNodes) {
      return
    } else{
      return new Promise((resolve, reject) => {
        var query = wx.createSelectorQuery()
        query.selectAll('.ct-class').boundingClientRect()
        query.exec(function (res) {
          ctNodes = [...res[0]]
          let arr2 = []
          ctNodes.forEach((item,i,arr)=>{
           let sum = 0
           for(let j=0;j<=i;j++){
              sum+=arr[j].height
           }
           arr2.push(sum)
           ctHeight[arr[i].id] = arr2[i]
          })
          resolve(ctHeight)
        })
      })
    }
  },
  toCity: function(e) {
    console.log(e)
    let wm = this
    let ct = e.currentTarget.dataset.ct
    wm.setData({ctlter: ct})
    wm.setData({ ctclick: true })
    setTimeout(() => {
      wm.setData({ ctclick: false })
    }, 2000)
    if(!ctNodes) {
      wm.getctNodes().then(ctHeight =>{
        Object.entries(ctHeight).forEach((item, i, arr) => {
         if(ct == arr[i][0]) {
           if (i<1){
             wm.setData({ scrollTop: 0 })
           } else{
             wm.setData({ scrollTop: arr[i-1][1] })
           }
         }
        })
      })
    } else{
      Object.entries(ctHeight).forEach((item, i, arr) => {
        if (ct == arr[i][0]) {
          if (i < 1) {
            wm.setData({ scrollTop: 0 })
          } else {
            wm.setData({ scrollTop: arr[i-1][1] })
          }
        }
      })
    }
  },
  scroll: function (e) {
    let sT = e.detail.scrollTop
    let wm = this
    if (!ctNodes) {
      wm.getctNodes()
    } else {
      Object.entries(ctHeight).forEach((item, i, arr)=>{
        if(sT>=0&&sT<arr[0][1]) {
          wm.setData({ctlter: arr[0][0]})
        } else if(sT>=arr[i][1]&&sT<arr[i+1][1]) {
          wm.setData({ctlter: arr[i+1][0]})
        }
      })
    }
  },
  inputchange: function (e) {
    let wm = this
    wm.data.searchList = []
    if(!e.detail.value) {
      wm.setData({ifsearch: false})      
    } else {
      wm.setData({ifsearch: true})
      let text = e.detail.value.toUpperCase()
      cityData.forEach((item,i,arr) =>{
        if(item.jianpin.includes(text)||item.pinyin.includes(text)||item.areaname.includes(text)){
          wm.data.searchList.push(item)
        }
      })
      wm.setData({searchList: wm.data.searchList})
      console.log(wm.data.searchList)
    }
  },
  chooseCity: function(e) {
    let ct = e.currentTarget.dataset.ct
    wx.setStorageSync('cityCode', ct)
    wx.reLaunch({
      url: `../home/home?cityCode=${ct}`
    })
  }
})