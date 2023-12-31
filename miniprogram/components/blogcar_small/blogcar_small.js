// components/blogcar_small/blogcar_small.js
import formatTime from '../../utils/formatTime.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blog: Object,
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

  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
