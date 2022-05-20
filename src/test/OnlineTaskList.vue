<template>
  <a-card :bordered="false">
    <div v-if="showList">
      <!-- 操作按钮区域 -->
      <div class="table-operator" :md="24" :sm="24" style="margin: -25px 0px 10px 0px">
        <a-button @click="handleAdd" type="primary" icon="plus">新增实时任务</a-button>

<!--        <a-dropdown v-if="selectedRowKeys.length > 0">-->
<!--          <a-menu slot="overlay">-->
<!--            <a-menu-item key="1" @click="batchDel">-->
<!--              开启-->
<!--            </a-menu-item>-->
<!--            <a-menu-item key="2" @click="batchDel">-->
<!--              停止-->
<!--            </a-menu-item>-->
<!--            <a-menu-item key="3" @click="batchDel">-->
<!--              删除-->
<!--            </a-menu-item>-->
<!--          </a-menu>-->
<!--          <a-button style="margin-left: 8px;margin-top: 1px"> 批量操作-->
<!--            <a-icon type="down"/>-->
<!--          </a-button>-->
<!--        </a-dropdown>-->
      </div>

      <!-- table区域-begin -->
      <div>
<!--        <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">-->
<!--          <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a-->
<!--          style="font-weight: 600">{{ selectedRowKeys.length }}</a>项-->
<!--          <a style="margin-left: 24px" @click="onClearSelected">清空</a>-->
<!--        </div>-->

        <a-table
          ref="table"
          :scroll="{x:500}"
          size="middle"
          bordered
          rowKey="id"
          :columns="columns"
          :dataSource="dataSource"
          :pagination="ipagination"
          @change="handleTableChange">
            <span slot="collectionType" slot-scope="collectionType">
              <template>
                <div style="text-align: center">
                  <a-tag v-if="collectionType===0" color="#2db7f5">全量</a-tag>
                  <a-tag v-if="collectionType===1" color="#87d068">增量</a-tag>
                </div>
              </template>
            </span>
          <span slot="releaseState" slot-scope="releaseState">
              <a-tag v-if="releaseState==='OFFLINE'" color="#f50">下线</a-tag>
              <a-tag v-else-if="releaseState==='ONLINE'" color="#87d068">上线</a-tag>
              <span v-else>-</span>
          </span>
          <span slot="scheduleReleaseState" slot-scope="scheduleReleaseState">
              <a-tag v-if="scheduleReleaseState==='OFFLINE'" color="#f50">下线</a-tag>
              <a-tag v-else-if="scheduleReleaseState==='ONLINE'" color="#87d068">上线</a-tag>
              <span v-else>-</span>
          </span>
          <span slot="taskStatus" slot-scope="taskStatus">
              <a-tag v-if="taskStatus===0" color="#0097e0">未运行</a-tag>
              <a-tag v-else-if="taskStatus===1" color="#87d068">运行中</a-tag>
              <a-tag v-else-if="taskStatus===2" color="#f50">运行失败</a-tag>
              <a-tag v-else-if="taskStatus===3" color="#FF8001">停止</a-tag>
              <span v-else>-</span>
          </span>
          <span slot="timeFormat" slot-scope="time">
              <template>
               <span v-if="moment(time).isValid()">{{moment(time).format('YYYY-MM-DD HH:mm:ss')}}</span>
               <span v-else>—</span>
              </template>
            </span>
          <span slot="action" slot-scope="text, record">
            <a-tooltip title="编辑">
              <a-button
                type="primary"
                icon="form"
                shape="circle"
                size="small"
                @click="handleEdit(record)"
                :disabled="record.releaseState==='ONLINE'">
              </a-button>
            </a-tooltip>
            <a-divider type="vertical" v-if="record.releaseState==='OFFLINE'"/>
            <a-tooltip title="上线" v-if="record.releaseState==='OFFLINE'">
              <a-button
                type="warning"
                icon="to-top"
                shape="circle"
                size="small"
                @click="release(record)">
              </a-button>
            </a-tooltip>
            <a-divider type="vertical" v-if="record.releaseState==='ONLINE'"/>
            <a-tooltip title="下线" v-if="record.releaseState==='ONLINE'">
              <a-button
                type="danger"
                icon="vertical-align-bottom"
                shape="circle"
                size="small"
                @click="release(record)"
                :disabled="record.taskStatus===1">
              </a-button>
            </a-tooltip>
            <a-divider type="vertical"  v-if="record.taskStatus!==1"/>
            <a-tooltip title="运行" v-if="record.taskStatus!==1">
              <a-button
                type="success"
                icon="play-circle"
                shape="circle"
                size="small"
                @click="_start(record)"
                :disabled="record.releaseState==='OFFLINE'">
              </a-button>
            </a-tooltip>
            <a-divider type="vertical" v-if="record.releaseState==='ONLINE'&&record.taskStatus===1"/>
            <a-popconfirm title="确定停止吗?" @confirm="() => _stop(record)" v-if="record.releaseState==='ONLINE'&&record.taskStatus===1">
              <a-tooltip title="停止">
              <a-button
                type="danger"
                icon="pause-circle"
                shape="circle"
                size="small">
            </a-button>
              </a-tooltip>
            </a-popconfirm>
            <a-divider type="vertical"/>
            <a-tooltip title="日志">
            <a-button
              type="primary"
              icon="file-text"
              shape="circle"
              size="small"
              @click="_log(record)"
              :disabled="record.releaseState==='OFFLINE'||record.taskStatus===0||record.taskStatus===2||record.taskStatus===3">
              </a-button>
             </a-tooltip>
            <a-divider type="vertical"/>
            <a-tooltip title="执行记录">
            <a-button
              type="primary"
              icon="profile"
              shape="circle"
              size="small"
              @click="_record(record)">
              </a-button>
             </a-tooltip>
            <a-divider type="vertical"/>
            <a-tooltip title="删除" v-if="record.releaseState==='ONLINE'">
                <a-button
                  type="danger"
                  icon="delete"
                  shape="circle"
                  size="small"
                  :disabled="record.releaseState==='ONLINE'">
                </a-button>
             </a-tooltip>
            <a-popconfirm title="确定删除吗?" @confirm="() => _delete(record)" v-else>
              <a-tooltip title="删除">
                <a-button
                  type="danger"
                  icon="delete"
                  shape="circle"
                  size="small">
                </a-button>
              </a-tooltip>
            </a-popconfirm>
            <!--              <a-divider type="vertical"/>-->
            <!--              <a-dropdown>-->
            <!--                <a class="ant-dropdown-link">-->
            <!--                  更多 <a-icon type="down"/>-->
            <!--                </a>-->
            <!--                <a-menu slot="overlay">-->
            <!--                  <a-menu-item>-->
            <!--                    <a href="javascript:;" @click="triggerTask(record)">树形图</a>-->
            <!--                  </a-menu-item>-->
            <!--                  <a-menu-item>-->
            <!--                    <a href="javascript:;" @click="jsonDetail(record)">复制工作流</a>-->
            <!--                  </a-menu-item>-->
            <!--                  <a-menu-item>-->
            <!--                    <a href="javascript:;" @click="handleDetail(record)">导出</a>-->
            <!--                  </a-menu-item>-->
            <!--                  <a-menu-item>-->
            <!--                    <a href="javascript:;" @click="handleDetail(record)">版本信息</a>-->
            <!--                  </a-menu-item>-->
            <!--                  <a-menu-item>-->
            <!--                    <a href="javascript:;" @click="handleDetail(record)">详情</a>-->
            <!--                  </a-menu-item>-->
            <!--                  <a-menu-item>-->
            <!--                    <a href="javascript:;" @click="logList(record)">删除</a>-->
            <!--                  </a-menu-item>-->
            <!--                </a-menu>-->
            <!--              </a-dropdown>-->
            </span>
        </a-table>
      </div>
    </div>

    <a-modal
      :width="900"
      :title="$t('Please set the parameters before starting')"
      :visible="startDialog"
      v-if="startDialog"
      @cancel="closeStart"
      :footer="null"
    >
      <start-online-task :startData="startData" @onUpdateStart="onUpdateStart" @closeStart="closeStart"></start-online-task>
    </a-modal>

    <a-modal
      :width="900"
      :title="$t('Set parameters before timing')"
      :visible="timingDialog"
      v-if="timingDialog"
      @cancel="closeTiming"
      :footer="null"
    >
      <m-timing :timingData="timingData" @onUpdateTiming="onUpdateTiming" @closeTiming="closeTiming"></m-timing>
    </a-modal>

<!--    <a-modal-->
<!--      :width="1500"-->
<!--      title="执行记录"-->
<!--      :visible="recordDialog"-->
<!--      v-if="recordDialog"-->
<!--      @cancel="closeStart"-->
<!--      :footer="null"-->
<!--    >-->
    <collection-online-task-log-list-modal ref="collectionLogList" ></collection-online-task-log-list-modal>
<!--    </a-modal>-->

    <j-modal
      title="DataX执行参数"
      width="1300px"
      :visible="detailVisible"
      @cancel="detailVisible=false"
      @ok="detailVisible=false"
      cancelText="关闭">
      <div class="log">
        <editor v-model="detailText" @init="editorInit" lang="html" :options="editorOptions" theme="chrome"></editor>
      </div>
    </j-modal>

    <online-task-modal ref="modalForm" @close="_onUpdate"></online-task-modal>

    <j-modal
      title="日志详情"
      width="1300px"
      :visible="logDetailVisible"
      @cancel="logDetailVisible=false"
      @ok="logDetailVisible=false"
      :switch-refresh="switchRefresh"
      @refresh="_log(nowRecord)"
      cancelText="关闭">
      <div class="log">
        <editor v-model="logDetailText" @init="editorInit" lang="html" :options="editorOptions" theme="chrome"></editor>
      </div>
    </j-modal>

  </a-card>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { getAction } from '@/api/manage'
import AddOfflineTask from './modules/AddOfflineTask'
import moment from 'moment'
import {
  triggerOfflineTask,
  removeOfflineTask,
  getOnlineCollectionProjectCode,
  getOnlineTaskLog,
  stopOnlineTask, deleteOnlineTask, getOnlineTaskList
} from '@/api/api'
import EditOfflineTask from './modules/EditOfflineTask'
import Modal from 'ant-design-vue/lib/modal/Modal'
import { processRelease } from '@/api/dolphinscheduler'
import OnlineTaskModal from './modules/OnlineTaskModal'
import sqlFormatter from 'sql-formatter'
import { mapActions, mapMutations } from 'vuex'
import mStart from '@/views/dolphinScheduler/project/pages/definition/pages/list/_source/start'
import mTiming from '@/views/dolphinScheduler/project/pages/definition/pages/list/_source/timing'
import startOnlineTask from "@views/collection/modules/StartOnlineTask";
import CollectionOnlineTaskLogListModal from "@views/collection/log/CollectionOnlineTaskLogListModal";
import {tasksState} from "@views/dolphinScheduler/project/dag/_source/config";


export default {
  name: 'OfflineTaskList',
  mixins: [JeecgListMixin],
  components: {
    CollectionOnlineTaskLogListModal,
    OnlineTaskModal,
    EditOfflineTask,
    AddOfflineTask,
    editor: require('vue2-ace-editor'),
    mStart,
    mTiming,
    startOnlineTask
  },
  data() {
    return {
      tasksState,
      nowRecord: {},
      switchRefresh: true,
      logDetailText: '',
      timingDialog: false,
      recordDialog: false,
      taskName: '',
      timingData: {
        item: {},
        type: '',
      },
      startDialog: false,
      startData: {},
      editorOptions: {
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        tabSize:0,
        fontSize:12,
        showPrintMargin:false,
        readOnly: true
      },
      moment,
      detailVisible: false,
      logDetailVisible: false,
      detailText: '',
      showList: true,
      showAdd: false,
      // 表头
      columns: [
        {
          title: '编号',
          width: '50px',
          align: 'center',
          dataIndex: 'id'
        },
        {
          title: '任务名称',
          dataIndex: 'taskName',
          width: 400,
          ellipsis: true,
        },
        {
          title: '状态',
          dataIndex: 'releaseState',
          align: 'center',
          width: '120px',
          scopedSlots: { customRender: 'releaseState'}
        },
        {
          title: '运行状态',
          dataIndex: 'taskStatus',
          align: 'center',
          width: '120px',
          scopedSlots: { customRender: 'taskStatus'}
        },
        {
          title: '数据源',
          dataIndex: 'originalSourceName',
          width: 150,
          ellipsis: true,
        },
        {
          title: '源表',
          dataIndex: 'originalTable',
          width: 150,
          ellipsis: true,
        },
        {
          title: '目标端',
          dataIndex: 'targetSourceName',
          width: 150,
          ellipsis: true,
        },
        {
          title: '目标表',
          dataIndex: 'targetTable',
          width: 150,
          ellipsis: true,
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          width: '170px',
          scopedSlots: { customRender: 'timeFormat'}
        },
        {
          title: '修改时间',
          dataIndex: 'updateTime',
          width: '170px',
          scopedSlots: { customRender: 'timeFormat'}
        },
        {
          title: '操作',
          // dataIndex: 'action',
          width: '250px',
          fixed: 'right',
          scopedSlots: { customRender: 'action' }
        }
      ],
      // socketUrl: 'waterfallWebsocket'
      url: {
        list: '/onlineTask/list'
      },
      timeInterval:null
    }
  },
  created() {
    getOnlineCollectionProjectCode().then((res)=>{
      this.setProjectCode(res.result)
      localStorage.setItem('projectCode', res.result)
    })
  },
  mounted(){
  },
  destroyed(){
    console.log('组件销毁');
    this.clearTime()
  },
  methods: {
    ...mapMutations('dag', ['setProjectCode']),
    ...mapActions('dag', ['deleteDefinition', 'batchDeleteDefinition', 'getStartCheck', 'editProcessState']),
    ...mapActions('security', ['getWorkerGroupsAll']),
    startTime(){
      this.clearTime()
      this.timeInterval = setInterval(()=>{
        this.loadData()
      },10000)
    },
    clearTime(){
      console.log(this.timeInterval,'清空实时任务定时器');
      if(this.timeInterval){
        clearInterval(this.timeInterval)
        this.timeInterval = null
      }
    },
    handleAdd: function (params) {
      this.$refs.modalForm.add(params);
      this.$refs.modalForm.title = "新增";
      this.$refs.modalForm.disableSubmit = false;
    },
    handleEdit: function (record) {
      this.$refs.modalForm.edit(record);
      this.$refs.modalForm.title = "编辑";
      this.$refs.modalForm.disableSubmit = false;
    },
    handlePageChange(event) {
      // 重新赋值
      let params = this.getQueryParams();
      params.command = '/onlineCollectionTaskPages'
      this.query = params
      // 查询数据
      // this.randomPage(event.current, event.pageSize, true)
      this.websocketSend(JSON.stringify(this.query))
    },
    initTable(){
      console.log('initTable');
      // this.query.current = 1
      // this.query.pageSize = this.pagination.pageSize
      // this.query.pageNo = 1
      // this.query.command = '/onlineCollectionTaskPages'
      // this.query.executorHandler = 'dataxJobHandler'
      let params = this.getQueryParams();
      params.command = '/onlineCollectionTaskPages'
      this.query = params
      this.loading = true
      // 查询数据
      // this.randomPage(event.current, event.pageSize, true)
      getOnlineTaskList(params).then((res)=>{
        this.loading = false
        let result  = res.result
        this.dataSource = result.records
        this.pagination.current = result.current
        this.pagination.pageSize = result.size
        this.pagination.total = result.total
      })
    },
    release(record){
      const that = this
      let params = {
        name: record.taskName,
        releaseState: record.releaseState === 'ONLINE' ? 'OFFLINE' : 'ONLINE'
      }
      processRelease(record.projectCode,record.processDefinitionCode,params)
        .then((res)=>{
          if(res.success){
            console.log('上线下线');
            that.loadData();
            that.$message.success(res.msg)
          }});
    },
    getOrderMain(orderId) {
      this.queryParam.mainId = orderId
      this.loadData(1)
    },
    handleDelete(id){
      const that = this
      removeOfflineTask(id).then((res)=>{
        if(res.success){
          that.$message.success(res.message)
        }
      });
    },
    closeOfflineTask() {
      // this.showAdd = false
      // this.showList = true
      // this.$refs[`table${this.params.purpose}`][0].refresh()
      this.loadData(1)
    },
    triggerTask(record){
      const that = this
      triggerOfflineTask({ 'jobId':record.id }).then((res)=>{
        if(res.success){
          that.$message.success(res.message)
        }
      });
    },
    logList(record){
      // console.log(record.taskNmae)
      this.$router.push({ path: '/collection/CollectionLogList' , query: { taskName: record.taskName }})
    },
    jsonDetail(record){
      // this.$info({
      //   width: 600,
      //   title: 'DataX执行参数',
      //   content: JSON.stringify(JSON.parse(record.taskExecuteJson), null, 2),
      //   okText: '确定',
      //   maskClosable: true
      // })
      this.detailVisible = true
      let reg=new RegExp("\\\\n","g");
      this.detailText = sqlFormatter.format(record.collectionSql.replace(reg,''));
    },
    prettyFormat(str) {
      try {
        // 设置缩进为2个空格
        str = JSON.stringify(JSON.parse(str), null, 2)
        str = str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
        return str.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
          var cls = 'number'
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'key'
            } else {
              cls = 'string'
            }
          } else if (/true|false/.test(match)) {
            cls = 'boolean'
          } else if (/null/.test(match)) {
            cls = 'null'
          }
          return '<span class="' + cls + '">' + match + '</span>'
        })
      } catch (e) {
        alert('异常信息:' + e)
      }
    },
    editorInit: function () {
      require('brace/ext/language_tools') //language extension prerequsite...
      require('brace/ext/searchbox')
      require('brace/mode/text')
      require('brace/mode/html')
      require('brace/mode/javascript')    //language
      require('brace/mode/less')
      require('brace/theme/chrome')
      require('brace/snippets/javascript') //snippet
      require('brace/snippets/html')
    },
    _start(item) {
      this.getWorkerGroupsAll()
      item.code = parseInt(item.processDefinitionCode)
      this.getStartCheck({ processDefinitionCode: item.code })
        .then((res) => {
          this.startData = item
          this.startDialog = true
        })
        .catch((e) => {
          this.$message.error(e.msg || '')
        })
    },
    _onUpdate() {
      console.log('onUpdate');
      this.loadData()
    },
    onUpdateStart() {
      this._onUpdate()
      this.startDialog = false
    },
    closeStart() {
      this.startDialog = false
    },
    onUpdateTiming() {
      this._onUpdate()
      this.timingDialog = false
    },
    closeTiming() {
      this.timingDialog = false
    },
    _timing(item) {
      this.timingData.item = item
      this.timingData.item.code = item.processDefinitionCode
      this.timingData.type = 'timing'
      this.timingDialog = true
    },
    _timingManage(item) {
      this.$router.push({ path: `/projects/${item.projectCode}/definition/list/timing/${item.processDefinitionCode}` })
    },
    _log(record) {
      this.nowRecord = record
      getOnlineTaskLog(record.id).then((res)=>{
        if (res.success) {
          this.logDetailVisible = true
          this.logDetailText = res.result
        } else {
          this.$message.error(res.message)
        }
      })
    },
    _stop(record) {
      stopOnlineTask(record).then((res) => {
        if (res.success) {
          this.$message.success("停止成功")
          this._onUpdate()
        }else {
          this.$message.error(res.message)
        }
      })
    },
    _delete(record) {
      deleteOnlineTask(record.processDefinitionCode).then((res) => {
        if (res.success) {
          //重新计算分页问题
          this.reCalculatePage(1)
          this.$message.success("删除成功")
          this.loadData();
        } else {
          this.$message.warning(res.message);
        }
      })
    },
    _record(record){
      // this.recordDialog = true
      this.$refs.collectionLogList.queryRecord(record)
    }
  }
}
</script>
<style>
.log{
  overflow-y: auto;
  height: 600px;
}
</style>