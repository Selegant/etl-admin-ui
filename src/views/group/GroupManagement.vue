<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
      </a-form>
    </div>

    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="$refs.createModal.add()">新建</a-button>
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
      showPagination="true"
    >
      <span slot="addressType" slot-scope="text">
        {{ text | addressTypeFilter }}
      </span>
      <span slot="addressList" slot-scope="text">
        <a-tag v-if="text!='' && text!=null" color="green">{{ text }}</a-tag>
        <span v-else ></span>
      </span>
      <span slot="action" slot-scope="record">
        <template>
<!--          <a-button type="primary" size="small" icon="form" @click="edit(record)">编辑</a-button>-->
<!--          <a-divider type="vertical" />-->
          <a-button type="danger" size="small" icon="delete" @click="del(record)">删除</a-button>
        </template>
      </span>
    </s-table>

    <create-form ref="createModal" @ok="handleOk"/>
    <step-by-step-modal ref="modal" @ok="handleOk"/>
    <task-edit-form ref="taskEditForm" @ok="handleOk"/>
    <execute-form ref="executeForm" @ok="handleOk"/>
  </a-card>
</template>

<script>
import moment from 'moment'
import { STable, Ellipsis } from '@/components'
import StepByStepModal from './modules/StepByStepModal'
import CreateForm from './modules/CreateForm'
import TaskEditForm from './modules/TaskEditForm'
import ExecuteForm from './modules/ExecuteForm'
import { jobGroupPageList, jobGroupRemove } from '@/api/group'
import TagSelectOption from '../../components/TagSelect/TagSelectOption'

const addressTypeMap = {
  0: {
    text: '自动注册'
  },
  1: {
    text: '手动录入'
  }
}

export default {
  name: 'GroupManagement',
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
      // 列表循环器
      listTimer: null,
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
          title: '排序',
          dataIndex: 'order'
        },
        {
          title: 'AppName',
          dataIndex: 'appName',
          ellipsis: true
        },
        {
          title: '名称',
          dataIndex: 'title',
          ellipsis: true
        },
        {
          title: '注册方式',
          dataIndex: 'addressType',
          scopedSlots: { customRender: 'addressType' }
        },
        {
          title: 'OnLine 机器地址',
          dataIndex: 'addressList',
          scopedSlots: { customRender: 'addressList' }
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
        return jobGroupPageList(Object.assign(parameter, this.queryParam))
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
    addressTypeFilter (type) {
      return addressTypeMap[type].text
    }
  },
  created () {
    this.queryParam.id = this.$route.query.id
    this.tableOption()
    // this.startPolling()
  },
  beforeDestroy () {
    if (this.listTimer) {
      window.clearInterval(this.listTimer)
    }
  },
  methods: {
    edit (e) {

    },
    del (e) {
      this.$confirm({
        title: '删除转换',
        content: '确认删除执行器吗？',
        onOk: () => {
          jobGroupRemove({ id: e.id })
            .then(res => {
              if (res.code === 200) {
                this.$message.success('删除成功')
                this.handleOk()
              } else {
                this.$message.error(res.msg)
              }
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
    },
    startPolling () {
      this.listTimer = window.setInterval(() => {
        setTimeout(this.handleOk(), 0)
      }, 3000)
    }
  }
}
</script>
