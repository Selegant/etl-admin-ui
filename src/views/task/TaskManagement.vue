<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="4" :sm="24">
            <a-form-item label="执行器">
              <a-select v-model="queryParam.jobGroup" placeholder="请选择">
                <a-select-option v-for="item in jobGroupList" :key="item.id" :value="item.id">{{ item.title }}</a-select-option>
              </a-select>
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
                <a-select-option :value="0">作业</a-select-option>
                <a-select-option :value="1">转换</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="24">
            <a-form-item label="任务描述">
              <a-input v-model="queryParam.jobDesc" style="width: 100%" placeholder="请输入任务描述"/>
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
          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
              <a @click="toggleAdvanced" style="margin-left: 8px">
                {{ advanced ? '收起' : '展开' }}
                <a-icon :type="advanced ? 'up' : 'down'"/>
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="$refs.createModal.add()">新建</a-button>
      <a-button type="dashed" @click="tableOption">{{ optionAlertShow && '关闭' || '开启' }} alert</a-button>
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
      rowKey="key"
      :columns="columns"
      :data="loadData"
      :alert="options.alert"
      :rowSelection="options.rowSelection"
      showPagination="auto"
    >
      <span slot="jobDesc" slot-scope="record">
        {{ record.glueType }} : {{ record.executorHandler }}
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
              <a-menu-item @click="queryLog(record)">查询日志</a-menu-item>
              <a-menu-item key="3">注册节点</a-menu-item>
              <a-menu-item @click="getNextTriggerTime(record)">下次执行时间</a-menu-item>
              <a-menu-item v-if="record.triggerStatus===0" @click="startTask(record)">启动</a-menu-item>
              <a-menu-item v-if="record.triggerStatus===1" @click="stopTask(record)">停止</a-menu-item>
              <a-menu-item @click="$refs.taskEditForm.edit(record,jobGroupList)">编辑</a-menu-item>
              <a-menu-item key="7">删除</a-menu-item>
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

    <a-modal
      title="下次执行时间"
      v-model="nextTriggerTimeShow"
      @ok="() => this.nextTriggerTimeShow=false"
    >
      <p v-for="item in nextTriggerTimeList" :key="item.index">{{item}}</p>
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
import { getJobInfoPageList, getJobInfoSelectList, jobStart, jobStop, jobNextTriggerTime } from '@/api/task'
import TagSelectOption from '../../components/TagSelect/TagSelectOption'

const statusMap = {
  0: {
    text: '停止'
  },
  1: {
    text: '运行'
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
    StepByStepModal
  },
  data () {
    return {
      nextTriggerTimeList: [],
      mdl: {},
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {
      },
      // jobGroupList
      jobGroupList: [],
      // 表头
      columns: [
        {
          title: '#'
        },
        {
          title: '任务ID',
          dataIndex: 'id'
        },
        {
          title: '任务描述',
          // dataIndex: 'jobDesc',
          scopedSlots: { customRender: 'jobDesc' }
        },
        {
          title: '运行模式',
          dataIndex: 'executorHandler'
        },
        {
          title: 'Cron',
          dataIndex: 'jobCron'
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
    }
  },
  created () {
    this.tableOption()
    this.loadSelectInfo()
    // getRoleList({ t: new Date() })
  },
  methods: {
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
    stopTask (e) {
      this.$confirm({
        title: '系统提示',
        content: '确定停止任务？',
        okText: '确认',
        cancelText: '取消',
        onOk () {
          jobStop({ id: e.id }).then((res) => {
            if (res.code === 200) {
              window.location.reload()
              // return resolve
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
        onOk () {
          jobStart({ id: e.id }).then((res) => {
            if (res.code === 200) {
              window.location.reload()
              // return resolve
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
        this.queryParam.jobGroup = res.data.jobGroup
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
        date: moment(new Date())
      }
    }
  }
}
</script>
