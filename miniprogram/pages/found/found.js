// pages/found/found.js
const db = wx.cloud.database({})
const _ = db.command
let keyword = '' //搜索关键字
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // modalshow: false, //控制弹出层是否显示
    userInfo: {}, //用户信息列表
    hasUserInfo: false, //是否拥有用户信息
    canIUseGetUserProfile: false, //能否获取用户信息
    location: {}, //地址
    blogList: [], //博客列表
    userid: '', //用户id
    uphidden: false, //红色点赞是否隐藏
  },
  /* 发布功能*/
  onPublish() {

    var that = this;
    const app = getApp()
    if (app.globalData.apphasUserInfo) { //判断是否是否获得用户授权使用全局变量
      console.log('已拿到授权')
      wx.navigateTo({
        url: '../share-edit/share-edit',
      })
    } else {
      console.log('未拿到授权，即将开始向用户询问授权')
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
          //跳转编辑界面
          wx.navigateTo({
            url: '../share-edit/share-edit',
          })
        }
      })
    }
  },

  // 点赞
  onThumbsUp(event) {
    /*当用户点赞，触发该函数，使得并且向云数据库添加点赞数的多少 */
    const app = getApp()
    //判断用户是否登录
    if (app.globalData.apphasUserInfo) { //判断是否是否获得用户授权使用全局变量
      console.log('已登录')
      //获取openid
      wx.cloud.callFunction({
        name: 'user'
      }).then((res) => {
        this.setData({
          userid: res.result.openid
        })
      })
      //插入openid
      db.collection('blog').doc(this.data.blogList[event.target.dataset.index]._id).update({
        // data 传入需要局部更新的数据
        data: {
          upuser: _.addToSet(this.data.userid),
        }
      })
        .catch(console.error)
    }
    else {
      console.log('未拿到授权，即将开始向用户询问授权')
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

          //执行点赞操作使用addToset函数进行添加用户openid进行记录是否点赞，实现每个用户只能进行一次点赞
          //获取用户openid
          wx.cloud.callFunction({
            name: 'user'
          }).then((res) => {
            this.setData({
              userid: res.result.openid
            })
            app.globalData.appUserId = res.result.openid
          })
          //将用户加进去
          db.collection('blog').doc(this.data.blogList[event.target.dataset.index]._id).update({
            // data 传入需要局部更新的数据
            data: {
              upuser: _.addToSet(this.data.userid),
            }
          })
            .catch(console.error)
        }
      })
    }

  },
  //取消点赞
  onCancelThumbsUp() {
  },
  //进入blog详情
  onToBlogDetail(event) {
    // // 浏览记录自增
    db.collection('blog').doc(event.target.dataset.blogid).update({
      data: {
        visitor: this.data.blogList[event.target.dataset.index].visitor + 1,
      }
    })
    //页面跳转
    wx.navigateTo({
      url: '../blog-comment/blog-comment?blogId=' + event.target.dataset.blogid,
    })

  },
  /*评论跳转 */
  onToComment(event) {
    const app = getApp()
    if (app.globalData.apphasUserInfo) {
      wx.navigateTo({
        url: '../blog-comment/blog-comment?blogId=' + event.target.dataset.blogid,
      })
    } else {
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
          //跳转详情
          wx.navigateTo({
            url: '../blog-comment/blog-comment?blogId=' + event.target.dataset.blogid,
          })
        }
      })
      //浏览记录自增
      db.collection('blog').doc(event.target.dataset.blogid).update({
        data: {
          visitor: this.data.blogList[event.target.dataset.index].visitor + 1,
        }
      })
    
    }

  },

/**
 * 不要靠近这个文件，这个文件基本上已经废了，要么重构，要么忍受，下一位同志祝你好运
 * 楼上的，我恨你。bug改到一半了，忍不了了，有请下一位
 * 你们两个人让我丧失了对这份工作的热情
 */

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    this._LoadBlogList()
  },
  //模糊搜索功能
  onSearch(event) {
    this.setData({
      blogList: []
    })
    keyword = event.detail.keyword
    this._LoadBlogList(0)
  },
  //调用云函数加载博客列表
  _LoadBlogList(start = 0) {
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        keyword,
        start,
        count: 10,
        $url: 'list',
      }
    }).then((res) => {
      this.setData({
        blogList: this.data.blogList.concat(res.result)
      })
      // console.log(this.data.blogList)
    })
    wx.hideLoading({})
    wx.stopPullDownRefresh()
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
    this.setData({
      blogList: [],
    })
    this._LoadBlogList(0)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._LoadBlogList(this.data.blogList.length)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})