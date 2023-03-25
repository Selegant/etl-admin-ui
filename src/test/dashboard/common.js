const stateType = [
    {
      code: '',
      label: '全部状态'
    }, {
      code: 'SUBMITTED_SUCCESS',
      label: '提交成功'
    }, {
      code: 'RUNNING_EXECUTION',
      label: '正在运行'
    }, {
      code: 'READY_PAUSE',
      label: '准备暂停'
    }, {
      code: 'PAUSE',
      label: '暂停'
    }, {
      code: 'READY_STOP',
      label: '准备停止'
    }, {
      code: 'STOP',
      label: '停止'
    }, {
      code: 'FAILURE',
      label: '失败'
    }, {
      code: 'SUCCESS',
      label: '成功'
    }, {
      code: 'NEED_FAULT_TOLERANCE',
      label: '需要容错'
    }, {
      code: 'KILL',
      label: 'Kill'
    }, {
      code: 'WAITING_THREAD',
      label: '等待线程'
    }, {
      code: 'WAITING_DEPEND',
      label: '等待依赖完成'
    }, {
      code: 'DELAY_EXECUTION',
      label: '延时执行'
    }, {
      code: 'FORCED_SUCCESS',
      label: '强制成功'
    }
  ]
  
  export {
    stateType
  }