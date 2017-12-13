const api = require('../../api/api.js')
Page({
  data: {
    fdImg: [],
    comments:'',
    linkman: '',
    contact: '',
  },

  onLoad: function (options) {

  },
  cmvalue: function (e) {
    this.data.comments = e.detail.value
  },
  ctvalue: function (e) {
    this.data.contact = e.detail.value
  },
  lmvalue: function (e) {
    this.data.comments = e. detail.value
  },
  addImg: function(){
    let wm = this
    wx.chooseImage({
      count: 3, 
      success: function (res) {
       wm.setData({ fdImg: [...wm.data.fdImg, ...res.tempFilePaths] })  
      }
    })
  },
  submit: function (){
    if(this.data.comments){
      let data = {linkman: this.data.linkman,contact: this.data.contact,comments: this.data.comments}
      let wm = this
      api.feedback(data).then(res=>{
        let msg = res.data.msg
        wx.showModal({
          title: '',
          content: msg,
          showCancel: false,
          success: res=>{
            if(res.confirm){
              wm.setData({fdImg:[],comments:'',linkman:'',contact: ''})
            }
          }
        })
      })
    } else {
      wx.showModal({
        title: '',
        content: '意见反馈不能为空',
        showCancel: false,
      })
    }   
  }
})