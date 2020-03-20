<template>
  <a-modal
    title="批量修改执行时间"
    :width="1200"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="updateExecTime"
    @cancel="clean"
  >
    <a-row :gutter="48">
      <a-col :md="6" :sm="24" v-for="item in jobList" :key="item.id">
        <p> {{item.jobDesc}} </p>
      </a-col>
    </a-row>
    <a-row>
      <a-select
        showSearch
        placeholder="请选择Cron表达式"
        optionFilterProp="children"
        v-model="cron"
        style="width: 250px"
      >
        <a-select-option  v-for="item in cronList" :key="item.id" :value="item.cron">{{ item.cronDesc }}</a-select-option>
      </a-select>
    </a-row>
  </a-modal>
</template>

<script>
import { batchUpdateCron } from '@/api/task'
export default {
  name: 'CronUpdateDetail',
  data () {
    return {
      visible: false,
      confirmLoading: false,
      jobList: [],
      cronList: [],
      cron: ''
    }
  },
  methods: {
    modal (jobList, cronList) {
      // this.logDetail = detail
      // // this.confirmLoading = true
      this.jobList = jobList
      this.cronList = cronList
      this.visible = true
    },
    updateExecTime () {
      let rowKeys = ''
      for (let i = 0; i < this.jobList.length; i++) {
        rowKeys += this.jobList[i].id + ','
      }
      rowKeys = rowKeys.substr(0, rowKeys.length - 1)
      batchUpdateCron({ ids: rowKeys, cron: this.cron }).then((res) => {
        if (res.code === 200) {
          this.$message.success('批量修改成功')
          this.visible = false
          this.$emit('ok')
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    clean () {
      // 将日志详情置空 结束定时器
      this.visible = false
    }
  }
}
</script>
