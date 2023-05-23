const db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    PutReplyInput: Boolean,//控制回复输入框是否弹出
    CommentId: String,//当前评论的id
  },

  /**
   * 组件的初始数据
   */
  data: {
    footerbotton: 0,//当前键盘高度
    Replycomment: '',//回复评论中的内容
    Input:{},//用于清楚输入框中的数据
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //获取当前键盘的高度
    onFocus(event) {
      console.log(event)
      this.setData({
        footerbotton: event.detail.heigth,
      })
    },
    //推出回复输入框
    onExit() {
      this.setData({
        PutReplyInput: false,
      })
    },
    //获取输入框中的内容
    onInput(event) {
      this.setData({
        Replycomment: event.detail.value,
      })
    },
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
    //将内容上传到数据库
    onSend() {
      const app = getApp()
      if (this.data.Replycomment.trim() === '') {
        // wx.showModal({
        //   title:'内容不能为空'
        // })
        return
      }
      db.collection('reply-comment').add({
        data: {
          Replycomment:this.data.Replycomment,
          createtime: db.serverDate(),
          commentId: this.data.CommentId,
          nickName: app.globalData.appserInfo.nickName,
          // avatarUrl: app.globalData.appserInfo.avatarUrl//回复评论中暂不显示头像
        }
      }).then((res) => {
        wx.showToast({
          title: '回复成功',
        })
      })
      this.setData({
        PutReplyInput:false,
      })
    //清除input中的数据
    this.data.Input.detail.value = '',
    this.onInput(this.data.Input.detail.value)
    }
  }
})
