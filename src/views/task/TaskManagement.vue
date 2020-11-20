<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <!--          <a-col :md="4" :sm="24">-->
          <!--            <a-form-item label="执行器">-->
          <!--              <a-select v-model="queryParam.jobGroup" placeholder="请选择">-->
          <!--                <a-select-option value="-1">全部</a-select-option>-->
          <!--                <a-select-option v-for="item in jobGroupList" :key="item.id" :value="item.id">{{ item.title }}</a-select-option>-->
          <!--              </a-select>-->
          <!--            </a-form-item>-->
          <!--          </a-col>-->
          <a-col :md="5" :sm="24">
            <a-form-item label="任务描述">
              <a-input v-model="queryParam.jobDesc" style="width: 100%" placeholder="请输入任务描述"/>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="24">
            <a-form-item label="运行状态">
              <a-select v-model="queryParam.triggerStatus" placeholder="请选择" default-value="1">
                <a-select-option :value="0">停止</a-select-option>
                <a-select-option :value="1">运行</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="24">
            <a-form-item label="任务类型">
              <a-select v-model="queryParam.objectType" placeholder="请选择" default-value="1">
                <a-select-option :value="2">作业</a-select-option>
                <a-select-option :value="1">转换</a-select-option>
                <a-select-option :value="3">普通作业</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="5" :sm="24">
            <a-form-item label="CRON">
              <a-select showSearch v-model="queryParam.cron" placeholder="请选择">
                <a-select-option value="-1">全部</a-select-option>
                <a-select-option v-for="item in cronList" :key="item.id" :value="item.cron">{{ item.cronDesc }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="调用次数">
                <a-input-number v-model="queryParam.callNo" style="width: 100%"/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="更新日期">
                <a-date-picker v-model="queryParam.date" style="width: 100%" placeholder="请输入更新日期"/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="使用状态">
                <a-select v-model="queryParam.useStatus" placeholder="请选择" default-value="0">
                  <a-select-option value="0">全部</a-select-option>
                  <a-select-option value="1">关闭</a-select-option>
                  <a-select-option value="2">运行中</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="使用状态">
                <a-select placeholder="请选择" default-value="0">
                  <a-select-option value="0">全部</a-select-option>
                  <a-select-option value="1">关闭</a-select-option>
                  <a-select-option value="2">运行中</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </template>
          <a-col :md="5" :sm="24">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="$refs.createModal.add(jobGroupList,cronList)">新建</a-button>
      <a-button icon="form" @click="batchUpdateExecTime">批量修改执行时间</a-button>
      <a-button icon="form" @click="batchUpdateCollectTime">批量修改采集时间</a-button>
      <a-button type="primary" icon="poweroff" @click="startBatch">批量启动任务</a-button>
      <a-button type="danger" icon="stop" @click="stopBatch">批量关闭任务</a-button>
      <!--      <a-button type="dashed" @click="tableOption">{{ optionAlertShow && '关闭' || '开启' }} alert</a-button>-->
      <a-dropdown v-action:edit v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1"><a-icon type="delete" />删除</a-menu-item>
          <!-- lock | unlock -->
          <a-menu-item key="2"><a-icon type="lock" />锁定</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          批量操作 <a-icon type="down" />
        </a-button>
      </a-dropdown>
    </div>

    <s-table
      ref="table"
      size="default"
      rowKey="id"
      :columns="columns"
      :data="loadData"
      :alert="options.alert"
      :rowSelection="options.rowSelection"
      showPagination="auto"
    >
      <span slot="jobDesc" slot-scope="record">
        {{ record.jobDesc }}
      </span>
      <span slot="executorHandler" slot-scope="record">
        {{ record.glueType }}:{{ record.executorHandler }}
      </span>
      <span slot="collectTime" slot-scope="text">
        <span v-if="text!=null">{{ text }}</span>
        <span v-else>-</span>
      </span>
      <span slot="triggerStatus" slot-scope="text">
        <a-tag :color="text===0 ? 'gray' : 'green'">
          {{ text | statusFilter }}
        </a-tag>
      </span>
      <span slot="action" slot-scope="record">
        <template>
          <a-dropdown>
            <a-menu slot="overlay">
              <a-menu-item @click="$refs.executeForm.execute(record)">执行一次</a-menu-item>
              <a-menu-item >
                <router-link :to="{ name: 'LogManagement', query:{jobId:record.id}}">
                  <span>查询日志</span>
                </router-link>
              </a-menu-item>
              <a-menu-item >
                <router-link :to="{ name: 'LogManagement', query:{jobId:record.id,logStatus:2}}">
                  <span style="color: red">查询错误日志</span>
                </router-link>
              </a-menu-item>
              <a-menu-item >
                <router-link :to="{ name: 'GroupManagement', query:{id:record.jobGroup} }">
                  <span>注册节点</span>
                </router-link>
              </a-menu-item>
              <a-menu-item @click="getNextTriggerTime(record)">下次执行时间</a-menu-item>
              <a-menu-item v-if="record.triggerStatus===0" @click="startTask(record)">启动</a-menu-item>
              <a-menu-item v-if="record.triggerStatus===1" @click="stopTask(record)">停止</a-menu-item>
              <a-menu-item @click="$refs.taskEditForm.edit(record,jobGroupList,cronList)">编辑</a-menu-item>
              <a-menu-item @click="deleteTask(record)">删除</a-menu-item>
            </a-menu>
            <a-button> 操作 <a-icon type="down" /> </a-button>
          </a-dropdown>
        </template>
      </span>
    </s-table>

    <create-form ref="createModal" @ok="handleOk"/>
    <step-by-step-modal ref="modal" @ok="handleOk"/>
    <task-edit-form ref="taskEditForm" @ok="handleOk"/>
    <execute-form ref="executeForm" @ok="handleOk"/>
    <cron-update-detail ref="cronUpdateDetail" @ok="handleOk"/>
    <collect-time-update-detail ref="collectTimeUpdateDetail" @ok="handleOk"/>

    <a-modal
      title="下次执行时间"
      v-model="nextTriggerTimeShow"
      @ok="() => this.nextTriggerTimeShow=false">
      <p v-for="item in nextTriggerTimeList" :key="item.index">{{ item }}</p>
    </a-modal>
  </a-card>
</template>

<script>
import moment from 'moment'
import { STable, Ellipsis } from '@/components'
import StepByStepModal from './modules/StepByStepModal'
import CreateForm from './modules/CreateForm'
import TaskEditForm from './modules/TaskEditForm'
import ExecuteForm from './modules/ExecuteForm'
import CronUpdateDetail from './modules/CronUpdateDetail'
import CollectTimeUpdateDetail from './modules/CollectTimeUpdateDetail'
import { getJobInfoPageList, getJobInfoSelectList, jobStart, jobStop, jobNextTriggerTime, jobDelete, startBatch, stopBatch } from '@/api/task'
import { getCron } from '@/api/cron'
import TagSelectOption from '../../components/TagSelect/TagSelectOption'

const statusMap = {
  0: {
    text: '停止'
  },
  1: {
    text: '运行'
  }
}

const cronMap = {
  '*/5 * * * * ?': {
    text: '5秒执行一次'
  },
  '0 0/1 * * * ?': {
    text: '1分钟执行一次'
  },
  '0 0/2 * * * ?': {
    text: '2分钟执行一次'
  },
  '0 0/3 * * * ?': {
    text: '3分钟执行一次'
  },
  '0 0/5 * * * ?': {
    text: '5分钟执行一次'
  },
  '0 0/30 * * * ?': {
    text: '30分钟执行一次'
  },
  '0 0 0/1 * * ?': {
    text: '1小时执行一次'
  },
  '0 0 0/2 * * ?': {
    text: '2小时执行一次'
  },
  '0 0 0/3 * * ?': {
    text: '3小时执行一次'
  },
  '0 0 0 * * ?': {
    text: '每日0点执行一次'
  },
  '0 0 1 * * ?': {
    text: '每日1点执行一次'
  },
  '0 0 2 * * ?': {
    text: '每日2点执行一次'
  },
  '0 */15 * * * ?': {
    text: '每15分钟执行一次'
  },
  '0 30 0 * * ?': {
    text: '每日0点30分执行一次'
  }
}

export default {
  name: 'TaskManagement',
  components: {
    TagSelectOption,
    STable,
    Ellipsis,
    CreateForm,
    ExecuteForm,
    TaskEditForm,
    StepByStepModal,
    CronUpdateDetail,
    CollectTimeUpdateDetail
  },
  data () {
    return {
      nextTriggerTimeList: [],
      mdl: {},
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {
        jobGroup: '-1'
      },
      // jobGroupList
      jobGroupList: [],
      // cronList
      cronList: [],
      // 表头
      columns: [
        {
          title: '任务ID',
          dataIndex: 'id'
        },
        {
          title: '任务描述',
          // dataIndex: 'jobDesc',
          sorter: true,
          scopedSlots: { customRender: 'jobDesc' }
        },
        {
          title: '采集开始时间',
          dataIndex: 'currentCollectTime',
          sorter: true,
          scopedSlots: { customRender: 'collectTime' }
          // scopedSlots: { customRender: 'executorHandler' }
        },
        {
          title: '调度时间',
          dataIndex: 'cronDesc'
          // scopedSlots: { customRender: 'cronHandler' }
        },
        {
          title: 'Cron',
          dataIndex: 'jobCron'
          // scopedSlots: { customRender: 'cronHandler' }
        },
        {
          title: '负责人',
          dataIndex: 'author'
        },
        {
          title: '状态',
          dataIndex: 'triggerStatus',
          scopedSlots: { customRender: 'triggerStatus' }
        },
        {
          title: '操作',
          // dataIndex: 'action',
          width: '150px',
          scopedSlots: { customRender: 'action' }
        }
      ],
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        console.log('loadData.parameter', parameter)
        return getJobInfoPageList(Object.assign(parameter, this.queryParam))
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
      optionAlertShow: false,
      nextTriggerTimeShow: false
    }
  },
  filters: {
    statusFilter (type) {
      return statusMap[type].text
    },
    statusTypeFilter (type) {
      return statusMap[type].status
    },
    cronFilter (cron) {
      return cronMap[cron].text
    }
  },
  created () {
    this.tableOption()
    this.loadSelectInfo()
    // getRoleList({ t: new Date() })
  },
  methods: {
    startBatch () {
      console.log(this.selectedRowKeys.length)
      if (this.selectedRowKeys.length === 0) {
        this.$message.error('请选择需要启动的任务')
        return
      }
      this.$confirm({
        title: '系统提示',
        content: '确定确认启动选中的任务？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          let rowKeys = ''
          for (let i = 0; i < this.selectedRowKeys.length; i++) {
            rowKeys += this.selectedRowKeys[i] + ','
          }
          this.selectedRowKeys = []
          rowKeys = rowKeys.substr(0, rowKeys.length - 1)
          startBatch({ jobIds: rowKeys })
            .then(res => {
              if (res.code === 200) {
                this.$message.success('批量启动成功')
                this.$refs.table.clearSelected()
                this.handleOk()
              }
            })
        },
        onCancel () {}
      })
    },
    stopBatch () {
      console.log(this.selectedRowKeys.length)
      if (this.selectedRowKeys.length === 0) {
        this.$message.error('请选择需要停止的任务')
        return
      }
      this.$confirm({
        title: '系统提示',
        content: '确定确认停止选中的任务？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          let rowKeys = ''
          for (let i = 0; i < this.selectedRowKeys.length; i++) {
            rowKeys += this.selectedRowKeys[i] + ','
          }
          this.selectedRowKeys = []
          rowKeys = rowKeys.substr(0, rowKeys.length - 1)
          stopBatch({ jobIds: rowKeys })
            .then(res => {
              if (res.code === 200) {
                this.$message.success('批量关闭成功')
                this.$refs.table.clearSelected()
                this.handleOk()
              }
            })
        },
        onCancel () {}
      })
    },
    batchUpdateExecTime () {
      console.log(this.selectedRowKeys.length)
      if (this.selectedRowKeys.length === 0) {
        this.$message.error('请选择需要编辑的数据')
        return
      }
      this.$refs.cronUpdateDetail.modal(this.selectedRows, this.cronList)
      console.log(this.selectedRows)
    },
    batchUpdateCollectTime () {
      if (this.selectedRowKeys.length === 0) {
        this.$message.error('请选择需要编辑的数据')
        return
      }
      this.$refs.collectTimeUpdateDetail.modal(this.selectedRows)
      console.log(this.selectedRows)
    },
    getNextTriggerTime (e) {
      jobNextTriggerTime({ cron: e.jobCron }).then((res) => {
        if (res.code === 200) {
          this.nextTriggerTimeList = res.content
          console.log(this.nextTriggerTimeList)
          this.nextTriggerTimeShow = true
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    deleteTask (e) {
      this.$confirm({
        title: '系统提示',
        content: '确定删除任务？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          jobDelete({ id: e.id }).then((res) => {
            if (res.code === 200) {
              this.handleOk()
            } else {
              this.$message.error(res.msg)
            }
          })
        },
        onCancel () {}
      })
    },
    stopTask (e) {
      this.$confirm({
        title: '系统提示',
        content: '确定停止任务？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          jobStop({ id: e.id }).then((res) => {
            if (res.code === 200) {
              this.handleOk()
            } else {
              this.$message.error(res.msg)
            }
          })
        },
        onCancel () {}
      })
    },
    startTask (e) {
      this.$confirm({
        title: '系统提示',
        content: '确定启动任务？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          jobStart({ id: e.id }).then((res) => {
            if (res.code === 200) {
              this.handleOk()
            } else {
              this.$message.error(res.msg)
            }
          })
        },
        onCancel () {}
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
        console.log(res.data)
        this.jobGroupList = res.data.jobGroupList
        // this.queryParam.jobGroup = res.data.jobGroup
        return res.data
      })
      getCron().then(res => {
        this.cronList = res.data
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
      this.$refs.table.clearSelected()
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
        date: moment(new Date())
      }
    }
  }
}
</script>
