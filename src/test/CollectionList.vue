<template>
  <div>
    <a-card :bordered="false" class="card-area" style="height: 80%">
<!--      <a-tabs default-active-key="1" @change="callback" tab-position="left" v-show="showList">-->
<!--        <a-tab-pane v-for="(index,item) in TABS" :key="`${item+1}`" :tab="`${index}`" force-render>-->
<!--          <div style="display: flex;">-->
<!--            <div style="width: 1500px;">-->
<!--              <div style="margin-bottom: 20px;">-->
<!--                <a-row type="flex">-->
<!--                  <a-col>-->
<!--                    <a-button icon="plus" type="primary" @click="addOfflineTask">新增离线任务</a-button>-->
<!--                  </a-col>-->
<!--                  <a-col>-->
<!--                    <a-input-search :allowClear="true" v-model="queryParam.queryParam" placeholder="输入任务名或表名搜索" style="margin-left: 30px;width: 300px" @search="searchTaskList"></a-input-search>-->
<!--                  </a-col>-->
<!--                </a-row>-->
<!--              </div>-->
<!--              <div>-->
<!--                <s-table-->
<!--                  :ref="`table${item+1}`"-->
<!--                  rowKey="id"-->
<!--                  size="default"-->
<!--                  :columns="columns"-->
<!--                  :data="loadData"-->
<!--                  bordered-->
<!--                  showPagination="auto"-->
<!--                  v-if="params.purpose===1"-->
<!--                  :alert="options.alert"-->
<!--                  :rowSelection="options.rowSelection"-->
<!--                >-->
<!--                  <span slot="collectionType" slot-scope="collectionType">-->
<!--                    <template>-->
<!--                      <div style="">-->
<!--                        <a-tag v-if="collectionType===0" color="#2db7f5">全量</a-tag>-->
<!--                        <a-tag v-if="collectionType===1" color="#87d068">增量</a-tag>-->
<!--                      </div>-->
<!--                    </template>-->
<!--                  </span>-->
<!--                  <span slot="triggerStatus" slot-scope="triggerStatus">-->
<!--                    <template>-->
<!--                      <div style="">-->
<!--                        <a-tag v-if="triggerStatus===0" color="#f50">停止</a-tag>-->
<!--                        <a-tag v-if="triggerStatus===1" color="#87d068">运行</a-tag>-->
<!--                      </div>-->
<!--                    </template>-->
<!--                  </span>-->
<!--                  <span slot="action" slot-scope="record">-->
<!--                    <template>-->
<!--                      <a-dropdown>-->
<!--                        <a-menu slot="overlay">-->
<!--                          <a-menu-item @click="$refs.executeForm.execute(record)">执行一次</a-menu-item>-->
<!--                          <a-menu-item>-->
<!--                            <router-link :to="{ name: 'LogManagement', query:{jobId:record.id,jobType:record.objectType}}">-->
<!--                              <span>查询日志</span>-->
<!--                            </router-link>-->
<!--                          </a-menu-item>-->
<!--                          <a-menu-item>-->
<!--                            <router-link-->
<!--                              :to="{ name: 'LogManagement', query:{jobId:record.id,logStatus:2,jobType:record.objectType}}">-->
<!--                              <span style="color: red">查询错误日志</span>-->
<!--                            </router-link>-->
<!--                          </a-menu-item>-->
<!--&lt;!&ndash;                          <a-menu-item>&ndash;&gt;-->
<!--&lt;!&ndash;                            <router-link :to="{ name: 'GroupManagement', query:{id:record.jobGroup} }">&ndash;&gt;-->
<!--&lt;!&ndash;                              <span>注册节点</span>&ndash;&gt;-->
<!--&lt;!&ndash;                            </router-link>&ndash;&gt;-->
<!--&lt;!&ndash;                          </a-menu-item>&ndash;&gt;-->
<!--                          <a-menu-item @click="getNextTriggerTime(record)">下次执行时间</a-menu-item>-->
<!--                          <a-menu-item v-if="record.triggerStatus===0" @click="startTask(record)">启动</a-menu-item>-->
<!--                          <a-menu-item v-if="record.triggerStatus===1" @click="stopTask(record)">停止</a-menu-item>-->
<!--                          <a-menu-item @click="$refs.taskEditForm.edit(record,jobGroupList,cronList)">编辑</a-menu-item>-->
<!--                          <a-menu-item @click="deleteTask(record)">删除</a-menu-item>-->
<!--                        </a-menu>-->
<!--                        <a-button> 操作 <a-icon type="down"/> </a-button>-->
<!--                      </a-dropdown>-->
<!--                    </template>-->
<!--                  </span>-->
<!--                </s-table>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </a-tab-pane>-->
<!--      </a-tabs>-->

<!--      <add-offline-task ref="add" v-show="showAdd" @close="closeOfflineTask"></add-offline-task>-->
      <a-tabs defaultActiveKey="1" tab-position="left" @change="changeTabs">
        <a-tab-pane tab="离线任务" key="1">
          <offline-task-list ref="OfflineTaskList"></offline-task-list>
        </a-tab-pane>
        <a-tab-pane tab="实时任务" key="2">
          <online-task-list ref="OnlineTaskList"></online-task-list>
        </a-tab-pane>
      </a-tabs>
    </a-card>

  </div>
</template>

<script>
import STable from '@/components/table/'
import { getDataSourceTreeList, getDataSourceTables, getAmountList, asyncAmount, getOfflineTaskList } from '@/api/api'
import DataSourceModal from '../datasource/modules/DataSourceModal'
import AddOfflineTask from './modules/AddOfflineTask'
import OfflineTaskList from './OfflineTaskList'
import OnlineTaskList from './OnlineTaskList'

const MYSQL = 'MYSQL'
const ORACLE = 'ORACLE'

const TABS = ['离线任务', '实时任务']

export default {
  name: 'CollectionList',
  components: {
    DataSourceModal,
    STable,
    AddOfflineTask,
    OfflineTaskList,
    OnlineTaskList
  },
  data() {
    return {
      MYSQL,
      ORACLE,
      TABS,
      params: {
        'purpose': 1,
        'id': '-1',
        'type': '1'
      },
      queryParam:{},
      syncLoading: false,
      showList: true,
      showAdd: false,
      treeData: [],
      columns: [
        {
          title: '编号',
          dataIndex: 'id'
        },
        {
          title: '离线任务名称',
          dataIndex: 'taskName'
        },
        {
          title: '源表',
          dataIndex: 'originalTable'
        },
        {
          title: '目标表',
          dataIndex: 'targetTable'
        },
        {
          title: '全量/增量',
          dataIndex: 'collectionType',
          scopedSlots: { customRender: 'collectionType' }
        },
        // {
        //   title: '更新时间',
        //   dataIndex: 'updateTime'
        // },
        {
          title: '状态',
          dataIndex: 'triggerStatus',
          scopedSlots: { customRender: 'triggerStatus' }
        },
        {
          title: '上次运行时间',
          dataIndex: 'triggerLastTime',
        },
        {
          title: '下次运行时间',
          dataIndex: 'triggerNextTime',
        },
        {
          title: '操作',
          // dataIndex: 'action',
          width: '100px',
          fixed: 'right',
          scopedSlots: { customRender: 'action' }
        }
      ],
      loadData: parameter => {
        console.log(Object.assign(parameter,this.queryParam))
        return getOfflineTaskList(Object.assign(parameter,this.queryParam))
          .then(res => {
            // console.log(res.result)
            return res.result
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
  created() {
    this.tableOption()
    this.init()
  },
  methods: {
    changeTabs(key){
      console.log(key==='1')
      if(key==='1'){
        this.$refs.OfflineTaskList.loadData(1)
        clearInterval(this.$refs.OnlineTaskList.timeInterval)
        this.$refs.OnlineTaskList.timeInterval=null
      }else {
        this.$nextTick(()=>{
          this.$refs.OnlineTaskList.loadData(1)
          this.$refs.OnlineTaskList.startTime()
        })
      }
    },
    callback(key) {
      this.params.purpose = Number(key)
      // console.log(`table${key}`)
      // if(this.params.purpose ===1 ){
      //   this.$refs[`table${key}`][0].refresh()
      // }
    },
    init() {
      console.log(TABS[0].name)
      getDataSourceTreeList({ 'purpose': this.params.purpose }).then((res) => {
        if (res.success) {
          this.treeData = res.result.trees
        }
      })
    },
    handleDelete(item) {
      const that = this
      delDataSource([item.id]).then((res) => {
        if (res.success) {
          that.treeData = res.result
          that.init()
        }
      })
    },
    getTablesAndViews(e) {
      console.log(`table${this.params.purpose}`)
      this.params.id = e[0].split('-')[0]
      this.params.type = e[0].split('-')[1]
      this.$refs[`table${this.params.purpose}`][0].refresh()
    },
    addOfflineTask() {
      this.showAdd = true
      this.showList = false
    },
    closeOfflineTask(){
      this.showAdd = false
      this.showList = true
      this.$refs[`table${this.params.purpose}`][0].refresh()
    },
    searchTaskList(){
      this.$refs[`table${this.params.purpose}`][0].refresh()
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
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    }
  }
}


</script>

<style scoped>

</style>