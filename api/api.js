//  api接口文档
const urls = require('urls.js')
function postFetch (url, data) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      data: data,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8;',
        'accept': 'application/json'
      },
      success: res => {
        resolve(res)
      },
      fail: err => {
        reject(err)
      }
    })
  })
}
//  根据经纬度计算2点之间的距离
const EARTH_RADIUS = 6378137.0   //单位M  
const PI = Math.PI
function getRad(d) {
  return d * PI / 180.0;
}
function getDistance(lat1, lng1, lat2, lng2) {
  var f = getRad((lat1 + lat2) / 2)
  var g = getRad((lat1 - lat2) / 2)
  var l = getRad((lng1 - lng2) / 2)
  var sg = Math.sin(g)
  var sl = Math.sin(l)
  var sf = Math.sin(f)
  var s, c, w, r, d, h1, h2
  var a = EARTH_RADIUS
  var fl = 1 / 298.257
  sg = sg * sg
  sl = sl * sl
  sf = sf * sf
  s = sg * (1 - sl) + (1 - sf) * sl
  c = (1 - sg) * (1 - sl) + sf * sl
  w = Math.atan(Math.sqrt(s / c))
  r = Math.sqrt(s * c) / w
  d = 2 * w * a
  h1 = (3 * r - 1) / 2 / c
  h2 = (3 * r + 1) / 2 / s
  return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg))
}
module.exports = {
  gaodeRestKey: urls.gaodeRestKey,
  fileUrl: urls.fileUrl,
  baseUrl: urls.baseUrl,
  proUrl: urls.proUrl,
  appid: urls.appid,
  pathRoute: urls.pathRoute,
  getDistance,
  GetCity (data) {
    return postFetch(urls.geo, data)
  },
  GetAround(data){
    return postFetch(urls.ard,data)
  },
  GetCityByCode (data) {
    return postFetch(`${urls.baseUrl}getCityByCode.do`,data)
  },
  GetspotList (data) {
    return postFetch(`${urls.baseUrl}spotlist.do`,data)
  },
  Getareas (data) {
    return postFetch(`${urls.baseUrl }areas.do`, data)
  },
  GetBanners (data) {
    return postFetch(`${urls.baseUrl }banner/list.do`,data)
  },
  testCode (data) {
    return postFetch(`${urls.baseUrl}codeActive.do`, data)
  },
  GetRecommend (data) {
    return postFetch(`${urls.baseUrl}getRecommend.do`,data)
  },
  GetScenic (data) {
    return postFetch(`${urls.baseUrl}scenic/detail.do`,data)
  },
  GetTourrouteList(data){
    return postFetch(`${urls.baseUrl}tourroute/list.do`,data)
  },
  GetTourrouteDetail(data){
    return postFetch(`${urls.baseUrl}tourroute/detail.do`, data)
  },
  feedback(data){
    return postFetch(`${urls.baseUrl}feedback/report.do`,data)
  },
}