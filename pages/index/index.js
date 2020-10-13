//index.js
const util = require('../../utils/util.js')
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    newTaskContent: '', // 新增待办任务的内容，用于删除input内容
    tasks: [
      {
        id: util.createNonceStr(11),
        content: '待办事项1',
        isFinished: false
      },
      {
        id: util.createNonceStr(11),
        content: '已办事项1',
        isFinished: true
      }
    ],
    slideButtons: [{ // 左划按钮
      type: 'warn',
      text: '删除',
    }],
    actionSheet: {
      title: '请选择以下操作',
      showActionSheet: false,
      currentIndex: null, // 当前操作的任务对象索引
      actionGroups: [
        { text: '标记为已完成', value: 1 },
        { text: '重新开启任务', value: 2 },
        { text: '删除该任务', type: 'warn', value: 3 }
      ],
    },
    msg: '', // 提示文本
    msgType: 'success' // 提示文本的类型
  },

  // 新增任务
  addTask: function(e) {
    if (!e.detail.value.trim()) {
      this.setData({
        msg: '请输入待办事项',
        msgType: 'error'
      })
      return
    }
    const newTask = {
      id: util.createNonceStr(11),
      content: e.detail.value.trim(),
      isFinished: false
    }
    const tasks = this.data.tasks
    tasks.unshift(newTask)
    this.setData({
      tasks,
      msg: '添加成功',
      msgType: 'success',
      newTaskContent: ''
    })
    this.updateStorageTasks()
  },

  // 删除任务
  deleteTask: function(e) {
    const tasks = this.data.tasks
    const index = e.currentTarget.dataset.index
    tasks.splice(index, 1)
    this.setData({
      tasks,
      msg: '删除成功',
      msgType: 'success'
    })
    this.updateStorageTasks()
  },

  // 任务状态的切换
  toggleFinishStatus: function(e) {
    const tasks = this.data.tasks
    const index = e.currentTarget.dataset.index
    tasks[index].isFinished = !tasks[index].isFinished
    const msg = tasks[index].isFinished ? 'Nice，又完成了一项任务！' : '重新启动任务成功'
    this.setData({
      tasks,
      msg: msg,
      msgType: 'success'
    })
    this.updateStorageTasks()
  },

  // 显示ActionSheet
  showActionSheet: function(e) {
    let actionGroups = []
    if (e.currentTarget.dataset.status === true) {
      actionGroups = [
        { text: '重新开启任务', value: 2 },
        { text: '删除该任务', type: 'warn', value: 3 }
      ]
    } else {
      actionGroups = [
        { text: '标记为已完成', value: 1 },
        { text: '删除该任务', type: 'warn', value: 3 }
      ]
    }
    this.setData({
      "actionSheet.actionGroups": actionGroups,
      "actionSheet.currentIndex": e.currentTarget.dataset.index,
      "actionSheet.showActionSheet": true
    })
  },

  // 底部弹起的操作按钮事件处理
  actionSheet: function(e) {
    if (e.detail.groupindex == 0) {
      switch(e.detail.value) {
        case 1: // 标识为已完成
          // no break
        case 2: // 重新开启任务
          this.toggleFinishStatus(e)
          break
        case 3: // 删除该任务
          this.deleteTask(e)
          break
      }
    }
    this.setData({
      "actionSheet.showActionSheet": false
    })
  },

  // 更新保存到本地缓存的任务数据
  updateStorageTasks: function() {
    wx.setStorage({
      data: this.data.tasks,
      key: 'tasks',
    })
  },

  onLoad: function () {
    var tasks = wx.getStorageSync('tasks') || []
    this.setData({
      tasks
    })
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
