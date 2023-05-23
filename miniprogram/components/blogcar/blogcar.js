// components/blogcar/blogcar.js
import formatTime from '../../utils/formatTime.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blog: Object,
  },
  options: {
    styleIsolation: 'apply-shared', //使用这句话能够调用外部文件中的样式
  },
  observers: {
    ['blog.createtime'](val) {
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
    onPreviewIamge(event) {
      wx.previewImage({
        urls: this.data.blog.img,
        current: event.target.dataset.imgsrc,
      })
    }
  }
})