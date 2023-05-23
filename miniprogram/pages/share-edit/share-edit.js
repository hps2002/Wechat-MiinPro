// pages/share-edit/share-edit.js
const MaxWordsNum = 200 //输入的最大字数
const MaxImageNum = 9 //最多上传的图片

const db = wx.cloud.database() //云数据库初始化
let content = '' //输入的文字内容
let userInfo = {}

Page({

    /**
     * 页面的初始数据
     */
    data: {
        wordsnum: 0,
        footerbotton: 0,
        images: [],
        selectimage: true, //是否能够选择图片
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)
        const app = getApp()
        userInfo = app.globalData.appserInfo
        console.log(userInfo)
    },
    //监听输入框的文本数量
    onInput(event) {
        console.log(event.detail)
        let wordsnum = event.detail.cursor
        content = event.detail.value
    },
    //获取当前的键盘高度
    onFocus(event) {
        console.log(event)
        this.setData({
            footerbotton: event.detail.heigth,
        })
    },
    //失去焦点时footer复位
    onBlur() {

    },
    //选择图片处理函数
    onChooseimage() {
        let max = MaxImageNum - this.data.images.length
        wx.chooseImage({
            count: max,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: (res) => {
                console.log(res)
                this.setData({
                    images: this.data.images.concat(res.tempFilePaths)
                })
                //判断是否还能继续选择图片
                max = MaxImageNum - this.data.images.length
                this.setData({
                    selectimage: max <= 0 ? false : true,
                })
            },
        })
    },
    //取消选择图片
    onDeleteImage(event) {
        this.data.images.splice(event.target.dataset.index, 1)
        this.setData({
            images: this.data.images
        })
        if (this.data.images.length < MaxImageNum) {
            this.setData({
                selectimage: true,
            })
        }
    },
    //预览图片
    onPreviewIamge(event) {
        wx.previewImage({
            urls: this.data.images,
            current: event.target.dataset.imgsrc,
        })
    },
    //发布
    onPublish() {
        //判断content是否为空
        if ((content.trim() === '')&&(this.data.images.length===0)) {
            wx.showModal({
                title: '请输入内容',
                content: '',
            })
            return
        }
        wx.showLoading({
            title: '发布中',
            mask:true,
        })

        let promiseArr = []
        let fileIds = []
        //将图片上传到云存储
        for (let i = 0, len = this.data.images.length; i < len; i++) //使用for循环的原因：云存储上传图片的api只允许单张图片上传，所以要使用for循环进行多张图片上传  
        {
            let p = new Promise((resolve, reject) => {
                let item = this.data.images[i]
                let suffix = /\.\w+$/.exec(item)[0]
                wx.cloud.uploadFile({
                    cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 1000000 + suffix,
                    filePath: item,
                    success: (res) => {
                        console.log(res)
                        fileIds = fileIds.concat(res.fileID)
                        resolve()
                    },
                    fail: (err) => {
                        console.error(err)
                        reject()
                    }
                })
            })
            promiseArr.push(p)
        }
        console.log(fileIds)
        //存入云数据库
        Promise.all(promiseArr).then((res) => {
            db.collection('blog').add({
                data: {
                    userInfo,
                    content,
                    img: fileIds,
                    createtime: db.serverDate(), //获取服务端时间
                    upuser:[],//点赞的人
                    visitors:0,//浏览人数
                },
            }).then((res) => {
                console.log('UpLoadFileSuccessful!')
                wx.hideLoading({})
                wx.showToast({
                    title: '发布成功',
                })
                //返回并刷新
                wx.reLaunch({
                  url: '../found/found',
                })
                content = ''//清空content的内容防止第二次发送的时候忽略空白
            })
        }).catch((err) => {
            wx.hideLoading({})
            wx.showToast({
                title: '发布失败',
            })
        })
    
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