<template>
  <j-modal
    :width="1500"
    title="执行记录"
    :visible="recordDialog"
    v-if="recordDialog"
    @cancel="closeRecord"
    :fullscreen.sync="modal.fullscreen"
    :switchFullscreen="modal.switchFullscreen"
    :footer="null"
  >
    <a-card :bordered="false">
      <!-- 查询区域 -->
      <div class="table-page-search-wrapper">
        <a-form layout="inline" @keyup.enter.native="searchQuery">
          <a-row :gutter="24">
          </a-row>
        </a-form>
      </div>
      <!-- 查询区域-END -->

      <!-- 操作按钮区域 -->
      <div class="table-operator">
        <!--      <a-button @click="handleAdd" type="primary" icon="plus-square">创建环境</a-button>-->
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <a-menu slot="overlay">
            <a-menu-item key="1" @click="batchDel">
              <a-icon type="delete"/>
              删除
            </a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px"> 批量操作
            <a-icon type="down"/>
          </a-button>
        </a-dropdown>
      </div>

      <!-- table区域-begin -->
      <div>
        <a-table
          ref="table"
          size="middle"
          :scroll="{x:false}"
          bordered
          rowKey="id"
          :columns="columns"
          :dataSource="dataSource"
          :pagination="ipagination"
          :loading="loading"
          class="j-table-force-nowrap"
          @change="handleTableChange">
        <span slot="timeFormat" slot-scope="time">
          <template>
           <span v-if="moment(time).isValid()">{{ moment(time).format('YYYY-MM-DD HH:mm:ss') }}</span>
           <span v-else>—</span>
          </template>
        </span>
          <template slot="stateFormat" slot-scope="state">
            <span v-html="_rtState(state)" style="cursor: pointer;"></span>
          </template>
          <template slot="htmlSlot" slot-scope="text">
            <div v-html="text"></div>
          </template>
          <template slot="imgSlot" slot-scope="text">
            <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
            <img v-else :src="getImgView(text)" height="25px" alt=""
                 style="max-width:80px;font-size: 12px;font-style: italic;"/>
          </template>
          <template slot="fileSlot" slot-scope="text">
            <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
            <a-button
              v-else
              :ghost="true"
              type="primary"
              icon="download"
              size="small"
              @click="uploadFile(text)">
              下载
            </a-button>
          </template>

          <span slot="action" slot-scope="text, record">
<!--          <a @click="handleEdit(record)">编辑</a>-->
            <!--          <a-divider type="vertical" />-->
          <a @click="commandLog(record)">COMMAND日志</a>
            <a-divider type="vertical" />
          <a @click="yarnLog(record)">YARN日志</a>
            <!--          <a-divider type="vertical" />-->
            <!--          <a-dropdown>-->
            <!--            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>-->
            <!--            <a-menu slot="overlay">-->
            <!--              <a-menu-item>-->
            <!--                <a @click="handleDetail(record)">详情</a>-->
            <!--              </a-menu-item>-->
            <!--              <a-menu-item>-->
            <!--                <a-popconfirm title="确定删除吗?" @confirm="() => handleDeleteEnv(record.code)">-->
            <!--                  <a>删除</a>-->
            <!--                </a-popconfirm>-->
            <!--              </a-menu-item>-->
            <!--            </a-menu>-->
            <!--          </a-dropdown>-->
        </span>

        </a-table>
      </div>
    </a-card>

    <j-modal
      title="日志详情"
      width="1300px"
      :visible="logDetailVisible"
      @cancel="logDetailVisible=false"
      @ok="logDetailVisible=false"
      cancelText="关闭">
      <div class="log">
        <editor v-model="logDetailText" @init="editorInit" lang="html" :options="editorOptions" theme="chrome"></editor>
      </div>
    </j-modal>


  </j-modal>
</template>

<script>

import '@/assets/less/TableExpand.less'
import {mixinDevice} from '@/utils/mixin'
import {DolphinSchedulerTableMixin} from '@/mixins/DolphinSchedulerTableMixin'
import {deleteEnvironment, getDolphinSchedulerLog} from '@/api/dolphinscheduler'
import moment from 'moment'
import {tasksState} from '@/views/dolphinScheduler/project/dag/_source/config'


export default {
  name: "CollectionOnlineTaskLogListModal",
  mixins: [DolphinSchedulerTableMixin, mixinDevice],
  components: {
    editor: require('vue2-ace-editor')
  },
  data() {
    return {
      logDetailText: '',
      editorOptions: {
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        tabSize:0,
        fontSize:12,
        showPrintMargin:false,
        readOnly: true
      },
      modal: {
        fullscreen: true,
        switchFullscreen: true
      },
      logDetailVisible: false,
      moment: moment,
      modalAddTitle: '创建环境',
      modalEditTitle: '编辑环境',
      recordDialog: false,
      // 表头
      columns: [
        {
          title: '编号',
          align: "center",
          dataIndex: 'id',
          width: 50
        }, {
          title: '名称',
          align: "center",
          dataIndex: 'name'
        }, {
          title: '执行节点',
          align: "center",
          dataIndex: 'host'
        },
        {
          title: '状态',
          align: "center",
          dataIndex: 'state',
          scopedSlots: {customRender: 'stateFormat'}
        },
        {
          title: '提交时间',
          align: "center",
          dataIndex: 'submitTime',
          scopedSlots: {customRender: 'timeFormat'}
        },
        {
          title: '开始时间',
          align: "center",
          dataIndex: 'startTime',
          scopedSlots: {customRender: 'timeFormat'}
        },
        {
          title: '结束时间',
          align: "center",
          dataIndex: 'endTime',
          scopedSlots: {customRender: 'timeFormat'}
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: "center",
          width: 147,
          scopedSlots: {customRender: 'action'}
        }
      ],
      url: {
        list: "/dolphinscheduler/projects/" + localStorage.getItem('projectCode') + "/task-instances",
        delete: "/sys/tenant/delete",
        deleteBatch: "/sys/tenant/deleteBatch"
      },
      dictOptions: {},
    }
  },
  created() {
  },
  mounted() {
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
    },
  },
  methods: {
    queryRecord(record) {
      this.recordDialog = true
      this.queryParam.searchVal = record.taskName
      this.loadData();
    },
    _rtState(code) {
      let o = tasksState[code]
      return `<em class="${o.icoUnicode} ${o.isSpin ? 'as as-spin' : ''}" style="color:${o.color}" data-toggle="tooltip" data-container="body" title="${o.desc}"></em>`
    },
    initDictConfig() {
    },
    handleDeleteEnv(code) {
      let that = this
      deleteEnvironment({'environmentCode': code}).then((res) => {
        if (res.success) {
          //重新计算分页问题
          that.reCalculatePage(1)
          that.$message.success(res.msg);
          that.loadData();
        } else {
          that.$message.warning(res.msg);
        }
      });
    },
    closeRecord(){
      this.recordDialog = false
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
    commandLog(record){
      this.logDetailText = ''
      let params = {'taskInstanceId':record.id,'skipLineNum':0,'limit':1000}
      getDolphinSchedulerLog(params).then((res)=>{
        if(res.success){
          this.logDetailVisible = true
          this.logDetailText = res.data.commandLog
        }

      })
    },
    yarnLog(record){
      this.logDetailText = ''
      let params = {'taskInstanceId':record.id,'skipLineNum':0,'limit':1000}
      getDolphinSchedulerLog(params).then((res)=>{
        if(res.success){
          this.logDetailVisible = true
          this.logDetailText = res.data.yarnLog[0]
        }

      })
    }
  }
}
</script>
<style scoped>
@import '~@assets/dolphinSchedulerLess/index.less';
@import '~@/assets/less/common.less';
</style>