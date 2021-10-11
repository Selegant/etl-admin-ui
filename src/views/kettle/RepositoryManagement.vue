<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="6" :sm="24">
            <a-form-item label="资源库名称">
              <a-input v-model="queryParam.repositoryName" style="width: 100%" placeholder="请输入资源库名称"/>
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
      <a-button type="primary" icon="plus" @click="$refs.createModal.add()">新增资源库</a-button>
      <!--      <a-button type="danger" icon="delete" @click="kettleTruncateJob">清空作业</a-button>-->
      <!--      <a-button type="danger" icon="close" @click="kettleJobAndTransDelete">批量删除</a-button>-->
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
          <a-button icon="select" size="small" v-if="record.useFlag===1" disabled >当前</a-button>
          <a-button type="primary" size="small" icon="check" v-if="record.useFlag===0" @click="check(record)">切换</a-button>
          <a-divider type="vertical" />
          <a-button type="danger" size="small" icon="delete" @click="del(record)">删除</a-button>
        </template>
      </span>
    </s-table>

    <create-form ref="createModal" @ok="handleOk"/>
    <step-by-step-modal ref="modal" @ok="handleOk"/>
    <edit-form ref="editForm" @ok="handleOk"/>
    <execute-form ref="executeForm" @ok="handleOk"/>

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
import CreateForm from './modules/CreateRepositoryForm'
import EditForm from './modules/EditRepositoryForm'
import ExecuteForm from './modules/ExecuteForm'
import { repositoryPageList, checkRepository, deleteRepository } from '@/api/kettle'
import TagSelectOption from '../../components/TagSelect/TagSelectOption'

const objectTypeMap = {
  2: {
    text: '作业'
  },
  1: {
    text: '转换'
  }
}

export default {
  name: 'RepositoryManagement',
  components: {
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
          title: 'ID',
          dataIndex: 'repositoryId'
        },
        {
          title: '资源库名称',
          dataIndex: 'repositoryName'
        },
        {
          title: '资源库数据库类型',
          dataIndex: 'repositoryType'
        },
        // {
        //   title: '资源库数据库访问模式',
        //   dataIndex: 'databaseAccess'
        // },
        {
          title: '资源库地址',
          dataIndex: 'databaseHost'
        },
        {
          title: '资源库端口号',
          dataIndex: 'databasePort'
        },
        {
          title: '资源库数据库名称',
          dataIndex: 'databaseName'
        },
        {
          title: '编辑时间',
          dataIndex: 'editTime'
        },
        {
          title: '操作',
          // dataIndex: 'action',
          width: '300px',
          scopedSlots: { customRender: 'action' }
        }
      ],
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        console.log('loadData.parameter', parameter)
        return repositoryPageList(Object.assign(parameter, this.queryParam))
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
      optionAlertShow: true,
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
        title: '删除资源库',
        content: '确认删除资源库吗？',
        onOk: () => {
          const rowKeys = record.repositoryId
          deleteRepository({ id: rowKeys })
            .then(res => {
              if (res.code === 200) {
                this.$message.success('删除资源库成功')
                this.handleOk()
              } else {
                this.$message.error(res.msg)
              }
            })
        },
        onCancel () {}
      })
    },
    check (record) {
      this.$confirm({
        title: '切换数据源',
        content: '确认切换数据源吗？切换数据源会清空所有已运行记录',
        onOk: () => {
          const rowKeys = record.repositoryId
          checkRepository({ id: rowKeys })
            .then(res => {
              if (res.code === 200) {
                this.$message.success('切换数据源成功')
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
    }
  }
}
</script>
