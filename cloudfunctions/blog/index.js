// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // 跟换云环境需要将每个云函数的环境进行更改
  env:"cloud3-8gc559j231062d8a"
})
const TcbRouter = require('tcb-router')
const db = cloud.database()
const blogCollection = db.collection('blog')
const commentCollection = db.collection('blog-comment')
const replyCollection = db.collection('reply-comment')
const MAX_LIMIT = 100
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })
  //查询blog的列表信息
  app.router('list', async (ctx, next) => {
    const keyword = event.keyword
    let w = {}
    if (keyword.trim() != '') {
      w = {
        content: db.RegExp({
          regexp: keyword,
          options: 'i'
        })
      }
    }
    let blogList = await blogCollection.where(w).skip(event.start).limit(event.count).orderBy('createtime', 'desc').get().then((res) => {
      return res.data
    })
    ctx.body = blogList
  })
  //查询blog页面的信息
  app.router('detail', async (ctx, next) => {
    let blogId = event.blogId
    console.log(event)
    //详情查询
    let detail = await blogCollection.where({
      _id: blogId
    }).get().then((res) => {
      console.log(res.data)
      return res.data
    })
    //评论查询
    const countResult = await commentCollection.count()
    const total = countResult.total
    let commentList = {
      data: []
    }
    if (total > 0) {
      const batchTimes = Math.ceil(total / MAX_LIMIT)
      const tasks = []
      for (let i = 0; i < batchTimes; i++) 
      {
        let promise = commentCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).where({blogId:blogId}).orderBy('createtime', 'desc').get()
        tasks.push(promise)
      }
      if (tasks.length > 0) {
        commentList = (await Promise.all(tasks)).reduce((acc, cur) => {
          return {
            data: acc.data.concat(cur.data),
          }
        })
        // commentList = await commentCollection.where({blogId}).skip(0).limit(MAX_LIMIT).orderBy('createtime', 'desc').get().then((res) => {
        //   return res.data
        // })
      }
    }
    ctx.body = {
      commentList,
      detail,
    }
  })
  //查询点赞的用户
  app.router('upNum',async(ctx,next)=>{
    let blogId = event.blogId;//
    let detail = await blogCollection.where({
      _id: blogId
    }).get().then((res) => {
      return res.data
    })
  ctx.body = detail
  })
  //查询有照片的blog
  // app.router('news',async(ctx,next)=>{
  //   let blogList = await blogCollection.where({
  //   }).skip(event.start).limit(event.count).orderBy('createtime', 'desc').get().then((res) => {
  //     return res.data
  //   })
  //   ctx.body = blogList
  // })
  //查询回复评论
  app.router('reply',async(ctx,next)=>{
    const countResult = await replyCollection.count()//集和元素总数
    const CommentId = event.CommentId
    const total = countResult.total
    let ReplyList = {
      data: []
    }
    if (total > 0) {
      const batchTimes = Math.ceil(total / MAX_LIMIT)
      const tasks = []
      for (let i = 0; i < batchTimes; i++) 
      {
        let promise = replyCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).where({commentId:CommentId}).orderBy('createtime', 'desc').get()
        tasks.push(promise)
      }
      if (tasks.length > 0) {
        ReplytList = (await Promise.all(tasks)).reduce((acc, cur) => {
          return {
            data: acc.data.concat(cur.data),
          }
        })
      }
    }
    ctx.body = {
      ReplyList
    }
  })
  return app.serve()
}
