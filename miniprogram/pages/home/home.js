// pages/home/home.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    blogList: [],
    blogList2: [],
  },
  //下载数据库数据
  _LoadBlogList() {
    //第一个竖框
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        keyword: '',
        start: 0,
        count: 2,
        $url: 'list',
      }
    }).then((res) => {
      // for (var i in res.result) {
      //   if(res.result[i].img.length>0){
      //     this.setData({
      //       blogList: this.data.blogList.concat(res.result[i])
      //     })
      //   }
      // }
      this.setData({
        blogList: this.data.blogList.concat(res.result)
      })
    })
    //第二个竖框
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        keyword: '',
        start: 2,
        count: 2,
        $url: 'list',
      }
    }).then((res) => {
      this.setData({
        blogList2: this.data.blogList2.concat(res.result)
      })
    })
  },
  //跳转详情
  onToblogDetail(event) {
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._LoadBlogList()
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