<template>
  <a-modal
    title="批量修改采集时间"
    :width="1200"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="updateCollectTime"
    @cancel="clean"
  >
    <a-row :gutter="48">
      <a-col :md="6" :sm="24" v-for="item in jobList" :key="item.id">
        <p> {{ item.jobDesc }} </p>
      </a-col>
    </a-row>
    <a-row>
      <div>
        <a-date-picker
          :show-time="{ format: 'HH' }"
          format="YYYY-MM-DD HH"
          valueFormat="YYYY-MM-DD HH"
          placeholder="请选择采集开始时间"
          v-model="collectTime"/>
      </div>
    </a-row>
  </a-modal>
</template>

<script>
import { batchUpdateCollectTime } from '@/api/task'
export default {
  name: 'CronUpdateDetail',
  data () {
    return {
      visible: false,
      confirmLoading: false,
      collectTime: '',
      jobList: [],
      cronList: [],
      cron: ''
    }
  },
  methods: {
    modal (jobList) {
      // this.logDetail = detail
      // // this.confirmLoading = true
      this.collectTime = ''
      this.jobList = jobList
      this.visible = true
    },
    onChange (value) {
      this.collectTime = value
    },
    onOk (value) {
      this.collectTime = value
    },
    updateCollectTime () {
      let rowKeys = ''
      for (let i = 0; i < this.jobList.length; i++) {
        rowKeys += this.jobList[i].jobDesc + ','
      }
      rowKeys = rowKeys.substr(0, rowKeys.length - 1)
      batchUpdateCollectTime({ jobNames: rowKeys, collectTime: this.collectTime }).then((res) => {
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
      this.collectTime = ''
      this.visible = false
    }
  }
}
</script>
