<template>
  <div>
    <a-card :bordered="false" class="card-area" style="height: 80%">
<!--      <a-tabs defaultActiveKey="1" tab-position="left">-->
<!--        <a-tab-pane tab="离线任务日志" key="1">-->
          <collection-offline-task-log-list ref="CollectionOfflineTaskLogList"></collection-offline-task-log-list>
<!--        </a-tab-pane>-->
<!--        <a-tab-pane tab="实时任务" key="2" forceRender>-->
<!--          <online-task-list ref="OnlineTaskList"></online-task-list>-->
<!--        </a-tab-pane>-->
<!--      </a-tabs>-->
    </a-card>

  </div>
</template>

<script>
import STable from '@/components/table/'
import { getDataSourceTreeList, getDataSourceTables, getAmountList, asyncAmount, getOfflineTaskList } from '@/api/api'
import CollectionOfflineTaskLogList from './CollectionOfflineTaskLogList'

const MYSQL = 'MYSQL'
const ORACLE = 'ORACLE'

const TABS = ['离线任务', '实时任务']

export default {
  name: 'CollectionLogList',
  components: {
    CollectionOfflineTaskLogList,
    STable,
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
    callback(key) {
      this.params.purpose = Number(key)
      // console.log(`table${key}`)
      // if(this.params.purpose ===1 ){
      //   this.$refs[`table${key}`][0].refresh()
      // }
    },
    init() {
      // console.log(TABS[0].name)
      // getDataSourceTreeList({ 'purpose': this.params.purpose }).then((res) => {
      //   if (res.success) {
      //     this.treeData = res.result.trees
      //   }
      // })
      // this.$refs.CollectionOfflineTaskLogList.initWebSocket()
    },
    handleDelete(item) {
      const that = this
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