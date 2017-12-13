Page({
  data: {
    nav: 1,
  },

  onLoad: function (options) {
    
  },
  navClick: function (e) {
    let nav = e.currentTarget.dataset.nav
    this.setData({nav: nav})
  },
  toOrdetail: function(){
    wx.navigateTo({
      url: '../ordetail/ordetail',
    })
  }
})