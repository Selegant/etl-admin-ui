<template>
  <div class="page-header-index-wide">
    <a-card :loading="loading" :bordered="false" :body-style="{padding: '0'}">
      <div class="salesCard">
        <a-tabs default-active-key="1" size="large" :tab-bar-style="{marginBottom: '24px', paddingLeft: '16px'}">
          <div class="extra-wrapper" slot="tabBarExtraContent">
            <div class="extra-item">
              <a @click="loadChat('now')">今日</a>
              <a @click="loadChat('day')">昨日</a>
              <a @click="loadChat('week')">本周</a>
              <a @click="loadChat('month')">本月</a>
              <a @click="loadChat('year')">本年</a>
            </div>
            <a-range-picker
              :style="{width: '256px'}"
              @change="loadChatByDate"
              :disabledDate="disabledDate"
              :defaultValue="[this.$moment(this.startDate, 'YYYY-MM-DD'), this.$moment(this.endDate, 'YYYY-MM-DD')]"
              :value="[this.$moment(this.startDate, 'YYYY-MM-DD'), this.$moment(this.endDate, 'YYYY-MM-DD')]"/>
            <!--            <a-input slot="tabBarExtraContent" placeholder="请输入作业名称"/>-->
            <!--            <a-button slot="tabBarExtraContent" type="primary">查询</a-button>-->
          </div>
          <a-tab-pane loading="true" tab="运行监控" key="1">
            <a-row :gutter="48">
              <a-col :md="8" :sm="24" :push="1">
                <a-select
                  showSearch
                  placeholder="请选择任务"
                  optionFilterProp="children"
                  style="width:90%"
                  v-model="jobId"
                >
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option v-for="item in jobList" :key="item.id" :value="item.id">{{ item.jobDesc }}</a-select-option>
                </a-select>
              </a-col>
              <a-col :md="2" :sm="24">
                <a-button type="primary" @click="queryMonitor">查询</a-button>
              </a-col>
              <a-col :md="2" :sm="24" >
                <a-button @click="queryReset">重置</a-button>
              </a-col>
            </a-row>
            <a-divider />
            <a-row>
              <a-col
                :push="2"
                :xl="20"
                :lg="20"
                :md="20"
                :sm="20"
                :xs="20">
                <ve-bar :data="taskData" :height="height" :settings="chartSettings"></ve-bar>
              </a-col>
            </a-row>
            <!--            <a-row>-->
            <!--              <a-col-->
            <!--                :push="2"-->
            <!--                :xl="20"-->
            <!--                :lg="20"-->
            <!--                :md="20"-->
            <!--                :sm="20"-->
            <!--                :xs="20">-->
            <!--                <a-table-->
            <!--                  ref="table"-->
            <!--                  size="default"-->
            <!--                  rowKey="key"-->
            <!--                  :columns="columns"-->
            <!--                  :dataSource="logData"-->
            <!--                  v-if="tableVisable"-->
            <!--                >-->
            <!--                  <span slot="triggerCode" slot-scope="text">-->
            <!--                    <a-tag :color="text===200 ? 'green' : 'red'">-->
            <!--                      {{ text | triggerCodeFilter }}-->
            <!--                    </a-tag>-->
            <!--                  </span>-->
            <!--                  <span slot="triggerMsg" slot-scope="text">-->
            <!--                    <template>-->
            <!--                      <a @click="showTriggerMsg">查看</a>-->
            <!--                      <a-modal title="调度备注" :mask="false" v-model="triggerMsgVisible" @ok="handleTriggerMsgOk">-->
            <!--                        <p v-html="text"></p>-->
            <!--                      </a-modal>-->
            <!--                    </template>-->
            <!--                  </span>-->
            <!--                  <span slot="handleTime" slot-scope="text">-->
            <!--                    <span v-if="text!=null">{{ text }}</span>-->
            <!--                    <span v-else>-</span>-->
            <!--                  </span>-->
            <!--                  <span slot="handleMsg" slot-scope="text">-->
            <!--                    <p v-if="text!='' && text!=null">{{ text }}</p>-->
            <!--                    <a-tag v-else>无</a-tag>-->
            <!--                  </span>-->
            <!--                  <span slot="handleCode" slot-scope="text">-->
            <!--                    <a-tag v-if="text!=null" :color="text | handleCodeColorFilter">-->
            <!--                      {{ text | handleCodeFilter }}-->
            <!--                    </a-tag>-->
            <!--                    <a-tag v-else>执行中</a-tag>-->
            <!--                  </span>-->
            <!--                  <span slot="action" slot-scope="record">-->
            <!--                    <template>-->
            <!--                      <a @click="showLogDetail(record)">执行日志</a>-->
            <!--                    </template>-->
            <!--                  </span>-->
            <!--                </a-table>-->
            <!--              </a-col>-->
            <!--            </a-row>-->
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-card>
  </div>
</template>

<script>
import moment from 'moment'
import { ChartCard, MiniArea, MiniBar, MiniProgress, RankList, Bar, Trend, NumberInfo, MiniSmoothArea, STable } from '@/components'
import { monitorTaskExecInfo } from '@/api/monitor'
import { jobList } from '@/api/task'

const triggerCodeMap = {
  200: {
    text: '成功'
  },
  500: {
    text: '失败'
  }
}

const handleCodeMap = {
  0: {
    text: '执行中'
  },
  200: {
    text: '成功'
  },
  500: {
    text: '无结果'
  },
  502: {
    text: '失败(超时)'
  }
}

const handleCodeColorMap = {
  0: {
    text: 'blue'
  },
  200: {
    text: 'green'
  },
  500: {
    text: 'red'
  },
  502: {
    text: 'red'
  }
}

export default {
  name: 'TaskAnalysis',
  components: {
    ChartCard,
    MiniArea,
    MiniBar,
    MiniProgress,
    RankList,
    Bar,
    Trend,
    NumberInfo,
    MiniSmoothArea,
    STable
  },
  data () {
    this.chartSettings = {
      stack: {
        'xxx': ['成功次数', '失败次数', '正在运行数']
      }
    }
    return {
      tableVisable: false,
      triggerMsgVisible: false,
      jobList: [],
      jobId: '',
      loading: true,
      startDate: moment().subtract('days', 1).format('YYYY-MM-DD'),
      endDate: moment().subtract('days', -1).format('YYYY-MM-DD'),
      height: '',
      logData: [],
      taskData: {
        columns: ['作业', '成功次数', '失败次数', '正在运行数'],
        rows: []
      },
      columns: [
        {
          title: '任务ID',
          dataIndex: 'id'
        },
        {
          title: '调度时间',
          dataIndex: 'triggerTime',
          scopedSlots: { customRender: 'handleTime' }
        },
        {
          title: '调度结果',
          dataIndex: 'triggerCode',
          scopedSlots: { customRender: 'triggerCode' }
        },
        {
          title: '调度备注',
          dataIndex: 'triggerMsg',
          scopedSlots: { customRender: 'triggerMsg' }
        },
        {
          title: '执行时间',
          dataIndex: 'handleTime',
          scopedSlots: { customRender: 'handleTime' }
        },
        {
          title: '执行结果',
          dataIndex: 'handleCode',
          scopedSlots: { customRender: 'handleCode' }
        },
        {
          title: '执行备注',
          dataIndex: 'handleMsg',
          scopedSlots: { customRender: 'handleMsg' }
        },
        {
          title: '操作',
          // dataIndex: 'action',
          width: '150px',
          scopedSlots: { customRender: 'action' }
        }
      ]
    }
  },
  filters: {
    triggerCodeFilter (type) {
      return triggerCodeMap[type].text
    },
    handleCodeFilter (type) {
      return handleCodeMap[type].text
    },
    handleCodeColorFilter (type) {
      return handleCodeColorMap[type].text
    }
  },
  created () {
    this.init()
  },
  methods: {
    queryReset () {
      this.jobId = ''
      this.init()
    },
    queryMonitor () {
      monitorTaskExecInfo({ 'startDate': this.startDate, 'endDate': this.endDate, 'jobId': this.jobId }).then((res) => {
        if (res.code === 200) {
          this.taskData.rows = res.content.chartInfo
          this.height = res.content.chartInfo.length * 300 + 'px'
          // console.log(res.content.monitorTaskTable.length)
          // if (res.content.monitorTaskTable.length > 0) {
          //   // this.logData = res.content.monitorTaskTable
          //   for (const i in res.content.monitorTaskTable) {
          //     this.logData.push(i)
          //   }
          //   this.tableVisable = true
          // }
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    handleTriggerMsgOk () {
      this.triggerMsgVisible = false
    },
    disabledDate (current) {
      // Can not select days before today and today
      return current && current > moment().endOf('day')
    },
    init () {
      this.tableVisable = false
      this.startDate = moment().subtract('days', 0).format('YYYY-MM-DD')
      this.endDate = moment().subtract('days', -1).format('YYYY-MM-DD')
      monitorTaskExecInfo({ 'startDate': this.startDate, 'endDate': this.endDate, 'jobId': this.jobId }).then((res) => {
        if (res.code === 200) {
          this.taskData.rows = res.content.chartInfo
          this.height = res.content.chartInfo.length * 100 + 'px'
        } else {
          this.$message.error(res.msg)
        }
      })
      jobList().then((res) => {
        if (res.code === 200) {
          this.jobList = res.content
        } else {
          this.$message.error(res.msg)
        }
      })
      this.loading = false
    },
    loadChat (param) {
      if (param === 'month') {
        this.startDate = moment().startOf('month').format('YYYY-MM-DD')
        this.endDate = moment().startOf('day').format('YYYY-MM-DD')
      } else if (param === 'week') {
        this.startDate = moment().startOf('week').format('YYYY-MM-DD')
        this.endDate = moment().startOf('day').format('YYYY-MM-DD')
      } else if (param === 'year') {
        this.startDate = moment().startOf('year').format('YYYY-MM-DD')
        this.endDate = moment().startOf('day').format('YYYY-MM-DD')
      } else if (param === 'day') {
        this.startDate = moment().subtract('days', 1).format('YYYY-MM-DD')
        this.endDate = moment().subtract('days', 0).format('YYYY-MM-DD')
      } else if (param === 'now') {
        this.startDate = moment().subtract('days', 0).format('YYYY-MM-DD')
        this.endDate = moment().subtract('days', -1).format('YYYY-MM-DD')
      }
      monitorTaskExecInfo({ 'startDate': this.startDate, 'endDate': this.endDate, 'jobId': this.jobId }).then((res) => {
        if (res.code === 200) {
          this.taskData.rows = res.content.chartInfo
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    loadChatByDate (e) {
      this.startDate = e[0].format('YYYY-MM-DD')
      this.endDate = e[1].format('YYYY-MM-DD')
      monitorTaskExecInfo({ 'startDate': this.startDate, 'endDate': this.endDate, 'jobId': this.jobId }).then((res) => {
        if (res.code === 200) {
          this.taskData.rows = res.content.chartInfo
        } else {
          this.$message.error(res.msg)
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .extra-wrapper {
    line-height: 55px;
    padding-right: 24px;

    .extra-item {
      display: inline-block;
      margin-right: 24px;

      a {
        margin-left: 24px;
      }
    }
  }

  .antd-pro-pages-dashboard-analysis-twoColLayout {
    position: relative;
    display: flex;
    display: block;
    flex-flow: row wrap;
  }

  .antd-pro-pages-dashboard-analysis-salesCard {
    height: calc(100% - 24px);
    /deep/ .ant-card-head {
      position: relative;
    }
  }

  .dashboard-analysis-iconGroup {
    i {
      margin-left: 16px;
      color: rgba(0,0,0,.45);
      cursor: pointer;
      transition: color .32s;
      color: black;
    }
  }
  .analysis-salesTypeRadio {
    position: absolute;
    right: 54px;
    bottom: 12px;
  }
</style>
