// pages/my/my.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hiddentips: false,
    userInfo: {},//用户授权信息
    useropenid: '',
  },
  //登录
  onLogin() {
    //用户对小程序进行授权
    const app = getApp()
    wx.getUserProfile({
      desc: '获取用户信息',
      success: (res) => {
        console.log(res.userInfo),
          this.setData({
            hasUserInfo: true,
            location: res.location,
            canIUseGetUserProfile: true,
            userInfo: res.userInfo
          })
        //存储授权信息到小程序全局变量中
        app.globalData.apphasUserInfo = true
        app.globalData.appserInfo = res.userInfo
        //为页面授权
        this.setData({
          userInfo: app.globalData.appserInfo,
          useropenid: app.globalData.appUserId,
          hiddentips: true,
        })
        console.log(res)
      }
    })
  },
  onExit() {
    // 退出登录
    const app = getApp();
    app.globalData.appUserId = ''
    app.globalData.apphasUserInfo = false
    app.globalData.appserInfo = {}
    this.onShow()
    console.log(app.globalData.appUserId)
    this.setData({
      userInfo:{},
      useropenid:'',
      hiddentips:false,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //检测是否已经授权/登录
    const app = getApp();
    if (app.globalData.apphasUserInfo) {
      this.setData({
        userInfo: app.globalData.appserInfo,
        useropenid: app.globalData.appUserId,
        hiddentips: true,
      })
    }

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
this.onShow()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})