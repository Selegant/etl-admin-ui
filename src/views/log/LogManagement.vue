<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
<!--          <a-col :md="4" :sm="24">-->
<!--            <a-form-item label="执行器">-->
<!--              <a-select v-model="queryParam.jobGroup" placeholder="请选择">-->
<!--                <a-select-option value="0">全部</a-select-option>-->
<!--                <a-select-option v-for="item in jobGroupList" :key="item.id" :value="item.id">{{ item.title }}</a-select-option>-->
<!--              </a-select>-->
<!--            </a-form-item>-->
<!--          </a-col>-->
          <a-col :md="4" :sm="24">
            <a-form-item label="任务类型">
              <a-select v-model="queryParam.jobType" placeholder="请选择">
                <a-select-option :value="0">采集任务</a-select-option>
                <a-select-option :value="3">普通任务</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="5" :sm="24">
            <a-form-item label="运行状态">
              <a-select v-model="queryParam.logStatus" placeholder="请选择" default-value="1">
                <a-select-option :value="-1">全部</a-select-option>
                <a-select-option :value="1">成功</a-select-option>
                <a-select-option :value="2">失败</a-select-option>
                <a-select-option :value="3">运行中</a-select-option>
                <a-select-option :value="4">超时</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="调度开始时间">
              <a-range-picker v-model="queryParam.filterTime" :format="dateFormat" :valueFormat="dateFormat"/>
            </a-form-item>
          </a-col>
          <template v-if="advanced">

          </template>
          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
              <a-button style="margin-left: 8px" @click="resetSearchForm">重置</a-button>
              <a-button style="margin-left: 8px" @click="$refs.table.refresh(true)">刷新</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!--    <div class="table-operator">-->
    <!--      <a-button type="primary" icon="plus" @click="$refs.createModal.add()">新建</a-button>-->
    <!--      <a-button type="dashed" @click="tableOption">{{ optionAlertShow && '关闭' || '开启' }} alert</a-button>-->
    <!--      <a-dropdown v-action:edit v-if="selectedRowKeys.length > 0">-->
    <!--        <a-menu slot="overlay">-->
    <!--          <a-menu-item key="1"><a-icon type="delete" />删除</a-menu-item>-->
    <!--          &lt;!&ndash; lock | unlock &ndash;&gt;-->
    <!--          <a-menu-item key="2"><a-icon type="lock" />锁定</a-menu-item>-->
    <!--        </a-menu>-->
    <!--        <a-button style="margin-left: 8px">-->
    <!--          批量操作 <a-icon type="down" />-->
    <!--        </a-button>-->
    <!--      </a-dropdown>-->
    <!--    </div>-->

    <s-table
      ref="table"
      size="default"
      rowKey="key"
      :columns="columns"
      :data="loadData"
      :alert="options.alert"
      :rowSelection="options.rowSelection"
      showPagination="true"
      :scroll="{ x: 2000 }"
    >
      <span slot="executorHandler" slot-scope="text">
        <a-tag v-if="text==='kettleJobHandler'||text==='kettleTransHandler'" :color="text==='kettleJobHandler'||text==='kettleTransHandler'? 'green' : 'blue'">
          采集任务
        </a-tag>
        <a-tag v-if="text!=='kettleJobHandler'&&text!=='kettleTransHandler'" :color="text!=='kettleJobHandler'&&text!=='kettleTransHandler' ? 'blue' : 'green'">
          普通任务
        </a-tag>
      </span>
      <span slot="triggerCode" slot-scope="text">
        <a-tag :color="text===200 ? 'green' : 'red'">
          {{ text | triggerCodeFilter }}
        </a-tag>
      </span>
      <span slot="triggerMsg" slot-scope="record">
        <template>
          <a @click="showRemark(record)">查看</a>
        </template>
      </span>
      <span slot="handleNum" slot-scope="text">
        <span v-if="text!=null">{{ text }}</span>
        <span v-else>-</span>
      </span>
      <span slot="handleTime" slot-scope="text">
        <span v-if="text!=null">{{ text }}</span>
        <span v-else>-</span>
      </span>
      <span slot="handleMsg" slot-scope="text">
        <p v-if="text!='' && text!=null">{{ text }}</p>
        <a-tag v-else>无</a-tag>
      </span>
      <span slot="handleCode" slot-scope="text">
        <a-tag v-if="text!=null" :color="text | handleCodeColorFilter">
          {{ text | handleCodeFilter }}
        </a-tag>
        <a-tag v-else>执行中</a-tag>
      </span>
      <span slot="action" slot-scope="record">
        <template>
          <a @click="showLogDetail(record)">执行日志</a>
        </template>
      </span>
    </s-table>

    <detail ref="detail"></detail>
    <remark ref="remark"></remark>
    <create-form ref="createModal" @ok="handleOk"/>
    <step-by-step-modal ref="modal" @ok="handleOk"/>
  </a-card>
</template>

<script>
import moment from 'moment'
import { STable, Ellipsis } from '@/components'
import StepByStepModal from './modules/StepByStepModal'
import CreateForm from './modules/CreateForm'
import Detail from './modules/Detail'
import Remark from './modules/Remark'
import { getJobLogPageList, jobLogDetailCat } from '@/api/log'
import { getJobInfoSelectList } from '@/api/task'
import TagSelectOption from '../../components/TagSelect/TagSelectOption'

const triggerCodeMap = {
  0: {
    text: '执行中'
  },
  200: {
    text: '成功'
  },
  500: {
    text: '失败'
  },
  600: {
    text: '超时'
  }
}

const handleCodeMap = {
  0: {
    text: '执行中'
  },
  200: {
    text: '成功'
  },
  500: {
    text: '失败'
  },
  502: {
    text: '失败(超时)'
  },
  600: {
    text: '超时'
  }
}

const handleCodeColorMap = {
  0: {
    text: 'blue'
  },
  200: {
    text: 'green'
  },
  500: {
    text: 'red'
  },
  502: {
    text: 'red'
  },
  600: {
    text: 'red'
  }
}

export default {
  name: 'LogManagement',
  components: {
    Remark,
    TagSelectOption,
    STable,
    Ellipsis,
    CreateForm,
    StepByStepModal,
    Detail
  },
  data () {
    return {
      listTimer: null,
      timeInterval: Object,
      dateFormat: 'YYYY-MM-DD',
      logDetail: '',
      logDetailVisible: false,
      // 调度备注modal
      triggerMsgVisible: false,
      mdl: {},
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {
        jobGroup: '0',
        jobId: '0',
        jobType: '0',
        logStatus: '-1',
        filterTime: []
      },
      // jobGroupList
      jobGroupList: [],
      // 表头
      columns: [
        {
          title: '任务ID',
          dataIndex: 'id'
        },
        {
          title: '任务描述',
          dataIndex: 'jobDesc',
          width: '250px',
          ellipsis: true
        },
        {
          title: '任务类型',
          dataIndex: 'executorHandler',
          width: '100px',
          scopedSlots: { customRender: 'executorHandler' }
        },
        {
          title: '调度开始时间',
          dataIndex: 'triggerTime',
          width: '250px',
          scopedSlots: { customRender: 'handleTime' }
        },
        {
          title: '调度结果',
          dataIndex: 'triggerCode',
          scopedSlots: { customRender: 'triggerCode' }
        },
        {
          title: '调度备注',
          dataIndex: 'triggerMsg',
          scopedSlots: { customRender: 'triggerMsg' }
        },
        {
          title: '调度结束时间',
          dataIndex: 'handleTime',
          width: '250px',
          scopedSlots: { customRender: 'handleTime' }
        },
        {
          title: '执行结果',
          dataIndex: 'handleCode',
          scopedSlots: { customRender: 'handleCode' }
        },
        {
          title: '写入数量',
          dataIndex: 'writeNum',
          scopedSlots: { customRender: 'handleNum' }
        },
        {
          title: '更新数量',
          dataIndex: 'updateNum',
          scopedSlots: { customRender: 'handleNum' }
        },
        {
          title: '实际输出数量',
          dataIndex: 'outputNum',
          scopedSlots: { customRender: 'handleNum' }
        },
        {
          title: '错误数量',
          dataIndex: 'errorNum',
          scopedSlots: { customRender: 'handleNum' }
        },
        // {
        //   title: '执行备注',
        //   dataIndex: 'executorParam',
        //   scopedSlots: { customRender: 'executorParam' }
        // },
        {
          title: '操作',
          // dataIndex: 'action',
          fixed: 'right',
          width: '150px',
          scopedSlots: { customRender: 'action' }
        }
      ],
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        if (this.queryParam.filterTime.length > 0) {
          this.queryParam.filterTime[0] = moment(this.queryParam.filterTime[0]).format('YYYY-MM-DD HH:mm:ss')
          this.queryParam.filterTime[1] = moment(this.queryParam.filterTime[1]).format('YYYY-MM-DD HH:mm:ss')
        }
        return getJobLogPageList(Object.assign(parameter, this.queryParam))
          .then(res => {
            return res
          })
      },
      selectedRowKeys: [],
      selectedRows: [],

      // custom table alert & rowSelection
      options: {
        alert: { show: true, clear: () => { this.selectedRowKeys = [] } },
        rowSelection: {
          selectedRowKeys: this.selectedRowKeys,
          onChange: this.onSelectChange
        }
      },
      optionAlertShow: true
    }
  },
  filters: {
    triggerCodeFilter (type) {
      return triggerCodeMap[type].text
    },
    handleCodeFilter (type) {
      return handleCodeMap[type].text
    },
    handleCodeColorFilter (type) {
      return handleCodeColorMap[type].text
    }
  },
  created () {
    this.queryParam.jobId = this.$route.query.jobId
    this.queryParam.jobType = this.$route.query.jobType === 3 ? 3 : 0
    this.queryParam.logStatus = this.$route.query.logStatus
    // console.log(this.$route.query)
    this.tableOption()
    this.loadSelectInfo()
    // this.startPolling()
    // getRoleList({ t: new Date() })
  },
  beforeDestroy () {
    if (this.listTimer) {
      window.clearInterval(this.listTimer)
    }
  },
  methods: {
    showRemark (record) {
      this.$refs.remark.modal(record)
    },
    handleTriggerMsgOk () {
      this.triggerMsgVisible = false
    },
    showLogDetail (e) {
      // this.logDetail = ''
      // window.clearInterval(this.timeInterval)
      // this.logDetailVisible = true
      const logDetailParams = {
        'executorAddress': e.executorAddress,
        'triggerTime': moment(e.triggerTime, 'YYYY-MM-DD HH:mm:ss').valueOf(),
        'logId': e.id,
        'fromLineNum': '1'
      }
      this.syncLogDetail(logDetailParams)
      this.timeInterval = window.setInterval(() => {
        this.syncLogDetail(logDetailParams)
      }, 3000)
      this.$refs.detail.modal()
    },
    syncLogDetail (logDetailParams) {
      jobLogDetailCat(logDetailParams).then(res => {
        if (res.code === 200) {
          this.logDetail = res.content.logContent
        }
      })
    },
    executeOnce (e) {
      console.log(e)
    },
    queryLog (e) {
      console.log(e)
    },
    loadSelectInfo () {
      getJobInfoSelectList().then(res => {
        this.jobGroupList = res.data.jobGroupList
        // this.queryParam.jobGroup = res.data.jobGroup
        return res.data
      })
    },
    tableOption () {
      if (!this.optionAlertShow) {
        this.options = {
          alert: { show: true, clear: () => { this.selectedRowKeys = [] } },
          rowSelection: {
            selectedRowKeys: this.selectedRowKeys,
            onChange: this.onSelectChange,
            getCheckboxProps: record => ({
              props: {
                disabled: record.no === 'No 2', // Column configuration not to be checked
                name: record.no
              }
            })
          }
        }
        this.optionAlertShow = true
      } else {
        this.options = {
          alert: false,
          rowSelection: null
        }
        this.optionAlertShow = false
      }
    },

    handleEdit (record) {
      console.log(record)
      this.$refs.modal.edit(record)
    },
    handleSub (record) {
      if (record.status !== 0) {
        this.$message.info(`${record.no} 订阅成功`)
      } else {
        this.$message.error(`${record.no} 订阅失败，规则已关闭`)
      }
    },
    handleOk () {
      this.$refs.table.refresh()
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    resetSearchForm () {
      this.queryParam = {
        jobGroup: '0',
        jobType: 0,
        jobId: '0',
        logStatus: -1,
        filterTime: []
      }
    },
    startPolling () {
      this.listTimer = window.setInterval(() => {
        setTimeout(this.handleOk(), 0)
      }, 10000)
    }
  }
}
</script>
