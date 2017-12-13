const api = require('../../api/api.js')
Page({
  data: {
    lat: 23.12908,
    lng: 113.26436,
    bathrooms: [],
    markers:[],

  },
  onLoad: function (options) {
    let wm = this
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
      },
      complete: function (res) {
        if(res.latitude){
          wm.setData({ lat: res.latitude, lng: res.longitude })
        }
        let data = { key: api.gaodeRestKey,location: `${wm.data.lng},${wm.data.lat}`,keywords:'洗手间',types:'200300',radius: 5000,}
        api.GetAround(data).then(res=>{
          wm.setData({bathrooms: [...res.data.pois]})
          res.data.pois.forEach(item=>{
            let marker = { iconPath: '/imgs/broom.png', width: 20, height: 22 }
            marker.latitude = Number(item.location.split(',')[1])
            marker.longitude = Number(item.location.split(',')[0])
            wm.data.markers.push(marker)
          })
          wm.setData({markers: [...wm.data.markers]})
        })
      }
    })

  },
  viewAddr: function (e) {
    let lat = Number(e.currentTarget.dataset.poi.location.split(',')[1])
    let lng = Number(e.currentTarget.dataset.poi.location.split(',')[0])
    wx.openLocation({
      latitude: lat,
      longitude: lng,
      complete: function(res){
        console.log(res)
      }
    })
  },
})