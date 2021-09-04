<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="6" :sm="24">
            <a-form-item label="作业名称">
              <a-input v-model="queryParam.name" style="width: 100%" placeholder="请输入作业名称"/>
            </a-form-item>
          </a-col>
          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => queryParam = {}">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <div class="table-operator">
      <a-button type="primary" icon="reload" @click="kettleSyncJob">同步作业</a-button>
      <a-button type="primary" icon="upload" @click="$refs.kettleResource.open(2)">同步作业（手动选择）</a-button>
      <a-button type="danger" icon="delete" @click="kettleTruncateJob">清空作业</a-button>
      <a-button type="danger" icon="close" @click="kettleJobAndTransDelete">批量删除</a-button>
    </div>

    <div style="text-align: center">
      <a-spin v-if="displayLoading" size="large" />
    </div>

    <s-table
      ref="table"
      size="default"
      rowKey="id"
      :columns="columns"
      :data="loadData"
      :alert="options.alert"
      :rowSelection="options.rowSelection"
      showPagination="true"
    >
      <span slot="jobDesc" slot-scope="record">
        {{ record.jobDesc }}
      </span>
      <span slot="objectType" slot-scope="text">
        <a-tag color="blue">{{ text | objectTypeFilter }}</a-tag>
      </span>
      <span slot="action" slot-scope="record">
        <template>
          <a-button type="primary" size="small" icon="form" @click="$refs.editForm.edit(record)">编辑</a-button>
          <a-divider type="vertical" />
          <a-button type="danger" size="small" icon="delete" @click="del(record)">删除</a-button>
        </template>
      </span>
    </s-table>

    <create-form ref="createModal" @ok="handleOk"/>
    <step-by-step-modal ref="modal" @ok="handleOk"/>
    <edit-form ref="editForm" @ok="handleOk"/>
    <execute-form ref="executeForm" @ok="handleOk"/>
    <kettle-resource-form ref="kettleResource" @ok="handleOk" />

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
import EditForm from './modules/EditForm'
import ExecuteForm from './modules/ExecuteForm'
import { kettleJobPageList, kettleSyncJob, kettleTruncateJob, kettleJobAndTransDelete } from '@/api/kettle'
import TagSelectOption from '../../components/TagSelect/TagSelectOption'
import KettleResourceForm from '@/views/kettle/modules/KettleResourceForm'

const objectTypeMap = {
  2: {
    text: '作业'
  },
  1: {
    text: '转换'
  }
}

export default {
  name: 'JobManagement',
  components: {
    KettleResourceForm,
    TagSelectOption,
    STable,
    Ellipsis,
    CreateForm,
    ExecuteForm,
    EditForm,
    StepByStepModal
  },
  data () {
    return {
      nextTriggerTimeList: [],
      mdl: {},
      displayLoading: false,
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
          title: '作业ID',
          dataIndex: 'id'
        },
        {
          title: '作业名称',
          dataIndex: 'name'
        },
        {
          title: '作业地址',
          dataIndex: 'repositoryDirectory'
        },
        {
          title: '编辑者',
          dataIndex: 'modifiedUser'
        },
        {
          title: '资源类型',
          dataIndex: 'objectType',
          scopedSlots: { customRender: 'objectType' }
        },
        {
          title: '编辑时间',
          dataIndex: 'modifiedDate'
        },
        {
          title: '同步时间',
          dataIndex: 'updateTime'
        },
        {
          title: '操作',
          // dataIndex: 'action',
          width: '250px',
          scopedSlots: { customRender: 'action' }
        }
      ],
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        console.log('loadData.parameter', parameter)
        return kettleJobPageList(Object.assign(parameter, this.queryParam))
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
    objectTypeFilter (type) {
      return objectTypeMap[type].text
    }
  },
  created () {
    this.tableOption()
    // getRoleList({ t: new Date() })
  },
  methods: {
    del (record) {
      this.$confirm({
        title: '删除作业',
        content: '确认删除作业吗？',
        onOk: () => {
          const rowKeys = record.id
          kettleJobAndTransDelete({ ids: rowKeys })
            .then(res => {
              if (res.code === 200) {
                this.$message.success('删除作业成功')
                this.$refs.table.clearSelected()
                this.handleOk()
              } else {
                this.$message.error(res.msg)
              }
            })
        },
        onCancel () {}
      })
    },
    kettleJobAndTransDelete () {
      console.log(this.selectedRowKeys.length)
      if (this.selectedRowKeys.length === 0) {
        this.$message.error('请选择需要删除的数据')
        return
      }
      this.$confirm({
        title: '删除作业',
        content: '确认删除作业吗？',
        onOk: () => {
          let rowKeys = ''
          for (let i = 0; i < this.selectedRowKeys.length; i++) {
            rowKeys += this.selectedRowKeys[i] + ','
          }
          this.selectedRowKeys = []
          rowKeys = rowKeys.substr(0, rowKeys.length - 1)
          kettleJobAndTransDelete({ ids: rowKeys })
            .then(res => {
              if (res.code === 200) {
                this.$message.success('删除成功')
                this.$refs.table.clearSelected()
                this.handleOk()
              } else {
                this.$message.error(res.msg)
              }
            })
        },
        onCancel () {}
      })
    },
    kettleTruncateJob () {
      this.$confirm({
        title: '清空作业',
        content: '确认清空作业吗？',
        onOk: () => {
          this.displayLoading = true
          kettleTruncateJob()
            .then(res => {
              this.displayLoading = false
              if (res.code === 200) {
                this.$message.success('清空作业成功')
                this.handleOk()
              } else {
                this.$message.error(res.msg)
              }
            })
        },
        onCancel () {}
      })
    },
    kettleSyncJob () {
      this.$confirm({
        title: '同步作业',
        content: '确认重新同步作业吗？',
        onOk: () => {
          this.displayLoading = true
          kettleSyncJob()
            .then(res => {
              this.displayLoading = false
              if (res.code === 200) {
                this.$message.success('同步作业成功')
                this.handleOk()
              } else {
                this.$message.error(res.msg)
              }
            }).catch(() => {
              this.$message.error('同步作业失败')
            })
        },
        onCancel () {}
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
