// components/commentcar/commentcar.js
import formatTime from '../../utils/formatTime.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    comment: Object,
    ReplyList: [],
    PutReplyInput:Boolean,//是否弹出评论回复框
  },
  //格式化时间
  observers: {
    ['comment.createtime'](val) {
      if (val) {
        this.setData({
          _createtime: formatTime(new Date(val)),
        })
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    _createtime: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
  _LoadreplyList(){
    wx.cloud.callFunction({
      name:'blog',
      data:{
        CommentId:this.data._id,
        $url:'reply'
      }
    }).then((res)=>{
      console.log(res)
      this.setData({

      })
    })
  },
  }
})
