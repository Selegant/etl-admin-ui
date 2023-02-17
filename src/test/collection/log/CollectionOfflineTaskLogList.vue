<template>
  <a-card :bordered="false">

    <div class="table-page-search-wrapper">
      <a-form layout="inline" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
        <a-row :gutter="24">
          <a-col :md="6" :sm="24">
            <a-form-item label="任务名称">
              <a-input placeholder="请输入任务名称" v-model="queryParam.jobName" @change="inputChange"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="7" :sm="24">
            <a-form-item label="调度时间" >
              <a-range-picker show-time style="width: 100%;" v-model="queryParam.triggerTime"
                format="YYYY-MM-DD HH:mm:ss"
                valueFormat="YYYY-MM-DD HH:mm:ss"
                :placeholder="['开始时间', '结束时间']"/>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="24">
            <a-form-item label="执行结果" >
              <a-select defaultValue="0" style="width: 100%" v-model="queryParam.logStatus">
                <a-icon type="caret-down" slot="suffixIcon" />
                <a-select-option value="0">全部</a-select-option>
                <a-select-option value="1">成功</a-select-option>
                <a-select-option value="2">失败</a-select-option>
                <a-select-option value="3">运行中</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :md="7" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery">查询</a-button>
              <HzButton type="secondary_btn" name="重置" style="margin-left: 8px" @click="reset"></HzButton>
              <a-popconfirm placement="topLeft" ok-text="确认清空" cancel-text="取消" @confirm="confirmClear" @cancel="clearCancel">
                <a-icon slot="icon" type="" style="color: red" />
                <template slot="title">
                   <a-form-item label="清理选项" :labelCol="{ span: 5 }" :wrapperCol="{ span: 10 }">
                     <a-select style="width: 300px" v-model="queryParam.clearLogType">
                     <a-icon type="caret-down" slot="suffixIcon" />
                      <a-select-option value="1">一个月之前日志数据</a-select-option>
                      <a-select-option value="2">三个月之前日志数据</a-select-option>
                      <a-select-option value="3">六个月之前日志数据</a-select-option>
                      <a-select-option value="4">一年之前日志数据</a-select-option>
                      <a-select-option value="5">一千条以前日志数据</a-select-option>
                      <a-select-option value="6">一万条以前日志数据</a-select-option>
                      <a-select-option value="7">三万条以前日志数据</a-select-option>
                      <a-select-option value="8">十万条以前日志数据</a-select-option>
                      <a-select-option value="9">清理所有日志数据</a-select-option>
                    </a-select>
                   </a-form-item>
                </template>
                <a-button type="danger" icon="interation" style="margin-left: 8px">清空日志</a-button>
              </a-popconfirm>
<!--              <a-button type="danger" @click="" icon="delete" style="margin-left: 8px" v-if="showDelete">批量删除</a-button>-->
            </span>
          </a-col>

        </a-row>
      </a-form>
    </div>

    <j-vxe-table
      ref="vTable"
      toolbar
      keep-source
      :height="484"
      :dataSource="dataSource"
      :columns="columns"
      :pagination="ipagination"
      :toolbar-config="toolbarConfig"
      @pageChange="handlePageChange"
      style="margin-top: 0px;"
    >
      <template v-slot:timeFormat="props">
        <template>
          <span v-if="moment(props.value).isValid()">{{moment(props.value).format('YYYY-MM-DD HH:mm:ss')}}</span>
          <span v-else>—</span>
        </template>
      </template>

      <template v-slot:executeTime="props">
        <template>
          <span v-if="moment(props.row.triggerTime).isValid()&&moment(props.row.handleTime).isValid() && moment(props.row.handleTime) >= moment(props.row.triggerTime)">{{ ((moment(props.row.handleTime).diff(moment(props.row.triggerTime),'seconds'))/60).toFixed(2)}}分钟</span>
          <span v-else-if="moment(props.row.jobTotalTime).isValid()">{{(moment(props.row.jobTotalTime)/60).toFixed(2)}}分钟</span>
          <span v-else>-</span>
        </template>
      </template>

      <template v-slot:triggerMsg="props">
        <template>
          <a-tooltip placement="left">
            <template slot="title">
              <div v-html="props.value"></div>
            </template>
            <a>查看</a>
          </a-tooltip>
        </template>
      </template>

      <template v-slot:triggerCode="props">
        <template>
<!--          <span>{{props.value}}</span>-->
          <a-tag color="#87d068" v-if="props.value===200">成功</a-tag>
          <a-tag color="#f50" v-if="props.value===500||(props.value===0&&props.row.handleCode===500)">失败</a-tag>
          <a-tag color="#2db7f5" v-if="props.value===0&&props.row.handleCode!==500">运行中</a-tag>
        </template>
      </template>

      <template v-slot:handleCode="props">
        <template>
          <a-tag color="#87d068" v-if="props.row.triggerCode===200&&props.row.handleCode===200">成功</a-tag>
          <a-tag color="#f50" v-if="props.row.triggerCode===500||props.row.handleCode===500">失败</a-tag>
          <a-tag color="#2db7f5" v-if="props.row.triggerCode===200&&props.row.handleCode===0">运行中</a-tag>
        </template>
      </template>

      <template v-slot:commonNum="props">
        <template v-if="props.value>0">
          {{props.value}}
        </template>
        <template v-else>
          -
        </template>
      </template>

      <template v-slot:dataWriteSpeed="props">
        <template v-if="props.value>0">
          {{props.value}}条/每秒
        </template>
        <template v-else>
          -
        </template>
      </template>

      <template v-slot:dataFlow="props">
          {{props.value}}
      </template>

      <template v-slot:dataTotalSize="props">
        <template v-if="props.value>0">
          {{sizeFilter(props.value)}}
        </template>
        <template v-else>
          -
        </template>
      </template>

      <template v-slot:jobTotalTime="props">
        <template v-if="props.value>0">
          {{props.value}}秒
        </template>
        <template v-else>
          -
        </template>
      </template>

      <template v-slot:action="props">
        <template>
          <a :disabled="!(props.row.triggerCode===200&&props.row.handleCode===0)" @click="killJob(props.row)">终止任务</a>
          <a-divider type="vertical"/>
          <a @click="showDetail(props.row)">执行日志</a>
        </template>
      </template>


    </j-vxe-table>

    <j-modal
      title="日志详情"
      width="1300px"
      :visible="detailVisible"
      @cancel="detailVisible=false"
      @ok="detailVisible=false"
      :switchFullscreen="true"
      :fullscreen="false"
      cancelText="关闭">
      <div class="log">
        <editor v-model="detailText" @init="editorInit" lang="html" :options="editorOptions" theme="chrome"></editor>
      </div>
    </j-modal>

  </a-card>
</template>

<script>

import moment from 'moment'
import { getAction } from '@/api/manage'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
// import { WebsocketTableMixin } from '../../../mixins/WebsocketTableMixin'
import { JVXETypes } from '@/components/jeecg/JVxeTable'
import store from '@/store/'
import { clearLog, getLogDetail, killOfflineJob } from '../../../api/api'

export default {
  name: 'CollectionOfflineTaskLogList',
  mixins: [JeecgListMixin],
  components: {
    editor: require('vue2-ace-editor')
  },
  props: {
    jobName: {
      type: String,
    },
    jobId: {
      type: [String, Number],
      default:null
    },
  },
  data() {
    return {
      editorOptions: {
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        tabSize:6,
        fontSize:12,
        showPrintMargin:false,
        readOnly: true
      },
      moment,
      queryParam:{
        logStatus: '0',
        jobName:'',
        triggerTime:[],
        clearLogType:''
      },
      detailVisible: false,
      detailText: '',
      showDelete:false,
      loading: false,
      dataSource: [],
      toolbarConfig: {
        // prefix 前缀；suffix 后缀
        slot: ['prefix', 'suffix'],
        // add 新增按钮；remove 删除按钮；clearSelection 清空选择按钮
        btn: ['clearSelection']
      },
      columns: [
        {
          title: '任务ID',
          key: 'id',
          width: '100px'
        },
        {
          title: '任务名称',
          key: 'taskName',
          width: '250px',
          ellipsis: true
        },
        {
          title: '任务描述',
          key: 'jobDesc',
          width: '150px',
          ellipsis: true
        },
        // {
        //   title: '任务类型',
        //   key: 'executorHandler',
        //   width: '100px',
        //   scopedSlots: { customRender: 'executorHandler' }
        // },
        {
          title: '调度开始时间',
          key: 'triggerTime',
          width: '200px',
          type: JVXETypes.slot,
          slotName: 'timeFormat',
        },
        {
          title: '调度结束时间',
          key: 'handleTime',
          type: JVXETypes.slot,
          width: '200px',
          slotName: 'timeFormat',
        },
        {
          title: '执行时间',
          key: 'handleTime',
          type: JVXETypes.slot,
          width: '150px',
          slotName: 'executeTime',
        },
        {
          title: '调度结果',
          key: 'triggerCode',
          width: '80px',
          type: JVXETypes.slot,
          slotName: 'triggerCode',
          align: 'center'
        },
        {
          title: '执行结果',
          key: 'handleCode',
          width: '80px',
          type: JVXETypes.slot,
          slotName: 'handleCode',
          align: 'center'
        },
        {
          title: '调度备注',
          key: 'triggerMsg',
          width: '80px',
          type: JVXETypes.slot,
          slotName: 'triggerMsg',
          align: 'center'
        },
        {
          title: '读取条数',
          key: 'dataTotalNum',
          width: '120px',
          type: JVXETypes.slot,
          slotName: 'commonNum'
        },
        {
          title: '错误条数',
          key: 'writeErrorNum',
          width: '120px',
          type: JVXETypes.slot,
          slotName: 'commonNum'
        },
        {
          title: '总计耗时',
          key:'jobTotalTime',
          width: '120px',
          type: JVXETypes.slot,
          slotName: 'jobTotalTime'
        },
        {
          title: '写入速度',
          key:'dataWriteSpeed',
          width: '120px',
          type: JVXETypes.slot,
          slotName: 'dataWriteSpeed'
        },
        {
          title: '平均流量',
          key:'dataFlow',
          width: '120px',
          type: JVXETypes.slot,
          slotName: 'dataFlow'
        },
        {
          title: '数据大小',
          key:'dataTotalSize',
          width: '120px',
          type: JVXETypes.slot,
          slotName: 'dataTotalSize'
        },
        {
          title: '操作',
          // key: 'action',
          fixed: 'right',
          width: '180px',
          align: 'center',
          type: JVXETypes.slot,
          slotName: 'action'
        }
      ],
      // socketUrl: 'waterfallWebsocket'
      url: {
        list: '/api/log/list'
      },
      timeInterval:null
    }
  },
  watch:{
    jobName:{
      handler(val){
        console.log('jobName变化');
        this.queryParam.jobName = val
      },
      immediate:true
    },
    $route:{
      handler(val){
        console.log(val,'离线数据日志route变化');
        if(val.query.taskName){
          this.queryParam.jobName = val.query.taskName
        }
      },
      immediate:true,
      deep:true
    }
  },
  mounted() {
    // this.getDefaultJobName()
    this.startTime()
    // this.$nextTick(()=>{
    //   this.queryParamLog()
    // })
    // this.websocketSend(JSON.stringify(this.queryParam))
    // console.log(111111)
  },
  destroyed(){
    console.log('组件销毁');
    this.clearTime()
  },
  methods: {
    startTime(){
      this.clearTime()
      this.timeInterval = setInterval(()=>{
        this.loadData()
      },10000)
    },
    clearTime(){
      if(this.timeInterval){
        clearInterval(this.timeInterval)
        this.timeInterval = null
      }
    },
    loadData(arg) {
      if(!this.url.list){
        this.$message.error("请设置url.list属性!")
        return
      }
      //加载数据 若传入参数1则加载第一页的内容
      if (arg === 1) {
        this.ipagination.current = 1;
      }
      var params = this.getQueryParams();//查询条件
      params.executorHandler = 'dataxJobHandler'
      params.triggerTime = params.triggerTime.length?params.triggerTime.join(','):''
      params.jobId = this.jobId
      console.log(params,'查询条件');
      getAction(this.url.list, params).then((res) => {
        if (res.code==200) {
          //update-begin---author:zhangyafei    Date:20201118  for：适配不分页的数据列表------------
          this.dataSource = res.content.records
          if(res.content.total)
          {
            this.ipagination.total = res.content.total;
          }else{
            this.ipagination.total = 0;
          }
          //update-end---author:zhangyafei    Date:20201118  for：适配不分页的数据列表------------
        }
        if(res.code===510){
          this.$message.warning(res.message)
        }
      })
    },
    getDefaultJobName(){
      if(this.$route.query.taskName){
        this.queryParam.jobName = this.$route.query.taskName
      }else {
        this.queryParam.jobName = this.jobName
      }
    },
    reset(){
      this.queryParam = this.$options.data().queryParam
      this.getDefaultJobName()
      this.loadData(1)
    },
    inputChange(val){
      console.log(val,this.queryParam.jobName,'jobnamechange');
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
    handlePageChange(event) {
      // 重新赋值
      this.ipagination.current = event.current
      this.ipagination.pageSize = event.pageSize
      this.loadData();
    },
    checkChange(e){
      if(e.selectedRowIds.length>0){
        this.showDelete = true
      }else {
        this.showDelete = false
      }
    },
    clearCancel(){
      this.queryParam.clearLogType = ''
    },
    confirmClear(){
      let formData=new FormData()
      formData.append('jobGroup',1)
      formData.append('type',this.queryParam.clearLogType)
      formData.append('jobId',-1)
      clearLog(formData).then((res)=>{
        // console.log(res)
        if(res.code===200){
          this.$message.success('清空成功')
          this.queryParam=this.$options.data().queryParam
          this.getDefaultJobName()
          this.loadData(1)
        }else {
          this.$message.error('清空失败')
        }
      })
    },
    showDetail(row){
      this.detailVisible = true
      let params= {}
      params.executorAddress = row.executorAddress
      params.triggerTime = row.triggerTime
      params.logId = row.id
      params.fromLineNum = 1
      // formData.append('executorAddress',row.executorAddress)
      // formData.append('triggerTime',row.triggerTime)
      // formData.append('logId',row.jobId)
      getLogDetail(params).then((res)=>{
        // console.log(res)
        if(res.code===200){
          this.detailText = res.content.logContent
        }else {
          this.$message.error(res.msg)
        }
      })
    },
    sizeFilter($bytesize) {
      let $i = 0
      // 当$bytesize 大于是1024字节时，开始循环，当循环到第4次时跳出；
      while (Math.abs($bytesize) >= 1024) {
        $bytesize = $bytesize / 1024
        $i++
        if ($i === 4) break
      }
      // 将Bytes,KB,MB,GB,TB定义成一维数组；
      const $units = ['Bytes', 'KB', 'MB', 'GB', 'TB']
      const $newsize = Math.round($bytesize, 2)
      return $newsize + ' ' + $units[$i]
    },
    killJob(row){
      killOfflineJob({'id':row.id}).then(res=>{
        if(res.code===200){
          this.$message.success(res.msg)
        }else {
          this.$message.error(res.msg)
        }
      })
    }
  }
}
</script>
<style  lang="less">

.log {
   overflow-y: auto;
   height: 500px;
}
</style>