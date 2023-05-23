// pages/blog-comment/blog-comment.js
const db = wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    blog: {}, //博客的数据链
    blogId: '', //博客Id
    content: '', //评论的内容
    commentList: [],//加载评论的列表
    Input: {},//用于清除输入框中的数据
    blogDetail: {},
    commentNum: 0,//评论数量
    ReplyList: [],//评论回复
    PutRepliInput: false,//是否弹出回复输出框
    CommentId: '',//传输给组件的评论ID
    upshow: false,//红色点赞是否展示
    userid: '',//用户id
  },
  /* 评论开始*/

  //点击输入框判断登陆状态
  onCheck() {
    //判断是否登录
    const app = getApp()
    //判断用户是否登录
    if (app.globalData.apphasUserInfo) { //判断是否是否获得用户授权使用全局变量
      console.log('已登录')
    } else {
      console.log('未拿到授权，即将开始向用户询问授权')
      wx.getUserProfile({
        desc: '获取用户信息',
        success: (res) => {
          //存储授权信息到小程序全局变量中
          app.globalData.apphasUserInfo = true
          app.globalData.appserInfo = res.userInfo
        }
      })
    }
  },
  // 获取评论内容
  onInput(event) {
    this.setData({
      Input: event,
      content: event.detail.value
    })
  },
  //评论
  onSend() {
    //插入云数据库
    const app = getApp()
    let content = this.data.content
    console.log(this.data.blogId)
    if (content.trim() === '') {
      // wx.showModal({
      //   title:'内容不能为空'
      // })
      return
    }
    db.collection('blog-comment').add({
      data: {
        content,
        createtime: db.serverDate(),
        blogId: this.data.blogId,
        nickName: app.globalData.appserInfo.nickName,
        avatarUrl: app.globalData.appserInfo.avatarUrl
      }
    }).then((res) => {
      wx.showToast({
        title: '评论成功',
      })
    })
    //刷新blog详情界面
    this.onPullDownRefresh()
    //清除input中的数据
    this.data.Input.detail.value = ''
    this.onInput(this.data.Input.detail.value)
    //推送模板消息
  },
  /* 评论结束 */

  /**评论回复开始 */
  onReply(event) {
    this.setData({
      PutRepliInput: true,
      CommentId: event.target.dataset.commentid
    })
  },
  //加载评论回复列表

  /**现在问题是在每个评论下都显示回复列表，暂时不知道怎么显示回复列表
   * 1.尝试将下面的函数放在每个commentcat里面能不能进行逐个显示
   */
  // _LoadreplyList(){
  //   wx.cloud.callFunction({
  //     name:'blog',
  //     data:{
  //       CommentId:
  //     }
  //   })
  // },

  /**评论回复结束 */

  /* 点赞开始 */
  onUp() {
    const app = getApp()
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
      db.collection('blog').doc(this.data.blogId).update({
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

          wx.cloud.callFunction({
            name: 'user'
          }).then((res) => {
            this.setData({
              userid: res.result.openid
            })
            app.globalData.appUserId = res.result.openid
          })
          //将用户加进去
          db.collection('blog').doc(this.data.blogId).update({
            // data 传入需要局部更新的数据
            data: {
              upuser: _.addToSet(this.data.userid),
            }
          })
            .catch(console.error)
          this.setData({
            upshow: true,
          })
        }
      })
    }
  },
  onCancelUp() {
    
  },
  /* 点赞结束 */
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
    this.setData({
      blogId: options.blogId
    })
    this._getBlogDetail()
  },
  //加载blog数据
  _getBlogDetail() {
    // wx.showLoading({
    //   title: '加载中',
    //   mask: true,
    // })
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        blogId: this.data.blogId,
        $url: 'detail',
      }
    }).then((res) => {
      // wx.hideLoading({})
      // console.log(res)
      this.setData({
        commentList: res.result.commentList.data,
        blog: res.result.detail[0],
        commentNum: res.result.commentList.data.length,
      })
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this._getBlogDetail(this.data.blogId)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})