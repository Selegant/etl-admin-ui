<template>
  <div class="page-header-index-wide">
    <a-row :gutter="24">
      <a-col :sm="24" :md="6" :xl="6" :style="{ marginBottom: '24px' }">
        <a-card title="今日采集数量" :bordered="false" >
<!--          <span style="font-weight: bold;font-size: 20px;" slot="extra">{{ dashboardInfo.jobInfoCount }}</span>-->
          <span style="font-weight: bold;font-size: 20px;color: #00FFFF">{{ statisticalInfo.sumWriteNum }}</span>
        </a-card>
      </a-col>
      <a-col :sm="24" :md="6" :xl="6" :style="{ marginBottom: '24px' }">
        <a-card title="今日更新数据量" :bordered="false" >
<!--          <span style="font-weight: bold;font-size: 20px;" slot="extra">{{ dashboardInfo.jobLogCount }}</span>-->
          <span style="font-weight: bold;font-size: 20px;color: #00BFFF">{{ statisticalInfo.sunUpdateNum }}</span>
        </a-card>
      </a-col>
      <a-col :sm="24" :md="6" :xl="6" :style="{ marginBottom: '24px' }">
        <a-card title="今日实际写入数据量" :bordered="false" >
          <!--          <span style="font-weight: bold;font-size: 20px;" slot="extra">{{ dashboardInfo.jobLogCount }}</span>-->
          <span style="font-weight: bold;font-size: 20px;color: #1E90FF">{{ statisticalInfo.sumOutputNum }}</span>
        </a-card>
      </a-col>
      <a-col :sm="24" :md="6" :xl="6" :style="{ marginBottom: '24px' }">
        <a-card title="今日错误数据量" :bordered="false" >
<!--          <span style="font-weight: bold;font-size: 20px;" slot="extra">{{ dashboardInfo.jobInfoCount }}</span>-->
          <span style="font-weight: bold;font-size: 20px;color: red">{{ statisticalInfo.sumErrorNum }}</span>
        </a-card>
      </a-col>
    </a-row>
    <a-row :gutter="24">
      <a-col :sm="24" :md="8" :xl="8" :style="{ marginBottom: '24px' }">
        <a-card title="任务数量" :bordered="false" >
          <span style="font-weight: bold;font-size: 20px;" slot="extra">{{ dashboardInfo.jobInfoCount }}</span>
          <ve-pie :data="monitorJobTypeInfo"></ve-pie>
        </a-card>
      </a-col>
      <a-col :sm="24" :md="8" :xl="8" :style="{ marginBottom: '24px' }">
        <a-card title="调度执行" :bordered="false" >
          <span style="font-weight: bold;font-size: 20px;" slot="extra">{{ dashboardInfo.jobLogCount }}</span>
          <ve-pie :data="monitorJobExecInfo"></ve-pie>
        </a-card>
      </a-col>
      <a-col :sm="24" :md="8" :xl="8" :style="{ marginBottom: '24px' }">
        <a-card title="作业状态" :bordered="false" >
          <span style="font-weight: bold;font-size: 20px;" slot="extra">{{ dashboardInfo.jobInfoCount }}</span>
          <ve-pie :data="monitorJobStatusInfo"></ve-pie>
        </a-card>
      </a-col>
    </a-row>

    <a-card :loading="loading" :bordered="false" :body-style="{padding: '0'}">
      <div class="salesCard">
        <a-tabs default-active-key="1" size="large" :tab-bar-style="{marginBottom: '24px', paddingLeft: '16px'}">
          <div class="extra-wrapper" slot="tabBarExtraContent">
            <div class="extra-item">
              <a @click="loadChat('10')">最近十天</a>
              <a @click="loadChat('week')">本周</a>
              <a @click="loadChat('month')">本月</a>
              <a @click="loadChat('year')">本年</a>
            </div>
            <a-range-picker :style="{width: '256px'}" @change="loadChatByDate" :disabledDate="disabledDate"/>
          </div>
          <a-tab-pane loading="true" tab="运行监控" key="1">
            <a-row>
              <a-col
                :push="2"
                :xl="20"
                :lg="20"
                :md="20"
                :sm="20"
                :xs="20">
                <ve-line :data="jobExecData"></ve-line>
              </a-col>
            </a-row>
          </a-tab-pane>
          <!--          <a-tab-pane tab="转换执行" key="2">-->
          <!--            <a-row>-->
          <!--              <a-col :xl="16" :lg="12" :md="12" :sm="24" :xs="24">-->
          <!--                <bar :data="barData2" title="销售额趋势" />-->
          <!--              </a-col>-->
          <!--              <a-col :xl="8" :lg="12" :md="12" :sm="24" :xs="24">-->
          <!--                <rank-list title="门店销售排行榜" :list="rankList"/>-->
          <!--              </a-col>-->
          <!--            </a-row>-->
          <!--          </a-tab-pane>-->
        </a-tabs>
      </div>
    </a-card>
  </div>
</template>

<script>
import moment from 'moment'
import { ChartCard, MiniArea, MiniBar, MiniProgress, RankList, Bar, Trend, NumberInfo, MiniSmoothArea } from '@/components'
import { dashboardInfo, chartInfo, monitorJobTypeInfo, monitorJobExecInfo, monitorJobStatusInfo } from '@/api/monitor'
import { getStatistical } from '@/api/kettle'

export default {
  name: 'Analysis',
  components: {
    ChartCard,
    MiniArea,
    MiniBar,
    MiniProgress,
    RankList,
    Bar,
    Trend,
    NumberInfo,
    MiniSmoothArea
  },
  data () {
    return {
      loading: true,
      statisticalInfo: {},
      dashboardInfo: {},
      jobExecData: {
        columns: ['日期', '成功次数', '失败次数', '正在运行数'],
        rows: []
      },
      monitorJobTypeInfo: {
        columns: ['类型', '数量'],
        rows: []
      },
      monitorJobExecInfo: {
        columns: ['类型', '数量'],
        rows: []
      },
      monitorJobStatusInfo: {
        columns: ['运行状态', '数量'],
        rows: []
      }
    }
  },
  created () {
    this.init()
  },
  methods: {
    disabledDate (current) {
      // Can not select days before today and today
      return current && current > moment().endOf('day').add(1, 'days')
    },
    init () {
      let startDate = ''
      let endDate = ''
      startDate = moment().subtract('days', 8).format('YYYY-MM-DD')
      endDate = moment().subtract('days', -1).format('YYYY-MM-DD')
      dashboardInfo().then((res) => {
        if (res.code === 200) {
          this.dashboardInfo = res.content
        } else {
          this.$message.error(res.msg)
        }
      })
      chartInfo({ 'startDate': startDate, 'endDate': endDate }).then((res) => {
        if (res.code === 200) {
          this.jobExecData.rows = res.content
        } else {
          this.$message.error(res.msg)
        }
      })
      monitorJobTypeInfo().then((res) => {
        if (res.code === 200) {
          this.monitorJobTypeInfo.rows = res.content
        } else {
          this.$message.error(res.msg)
        }
      })
      monitorJobExecInfo().then((res) => {
        if (res.code === 200) {
          this.monitorJobExecInfo.rows = res.content
        } else {
          this.$message.error(res.msg)
        }
      })
      monitorJobStatusInfo().then((res) => {
        if (res.code === 200) {
          this.monitorJobStatusInfo.rows = res.content
        } else {
          this.$message.error(res.msg)
        }
      })
      getStatistical().then((res) => {
        if (res.code === 200) {
          this.statisticalInfo = res.data
        } else {
          this.$message.error(res.msg)
        }
      })
      this.loading = false
    },
    loadChat (param) {
      let startDate = ''
      let endDate = ''
      if (param === 'month') {
        startDate = moment().startOf('month').format('YYYY-MM-DD')
        endDate = moment().startOf('day').format('YYYY-MM-DD')
      } else if (param === 'week') {
        startDate = moment().startOf('week').format('YYYY-MM-DD')
        endDate = moment().startOf('day').format('YYYY-MM-DD')
      } else if (param === 'year') {
        startDate = moment().startOf('year').format('YYYY-MM-DD')
        endDate = moment().startOf('day').format('YYYY-MM-DD')
      } else if (param === '10') {
        startDate = moment().subtract('days', 8).format('YYYY-MM-DD')
        endDate = moment().subtract('days', -1).format('YYYY-MM-DD')
      }
      chartInfo({ 'startDate': startDate, 'endDate': endDate }).then((res) => {
        if (res.code === 200) {
          this.jobExecData.rows = res.content
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    loadChatByDate (e) {
      chartInfo({ 'startDate': e[0].format('YYYY-MM-DD'), 'endDate': e[1].format('YYYY-MM-DD') }).then((res) => {
        if (res.code === 200) {
          this.jobExecData.rows = res.content
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
