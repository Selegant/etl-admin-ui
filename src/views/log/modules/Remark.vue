<template>
  <a-modal
    title="调度备注"
    :width="640"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="clean"
    @cancel="clean"
  >
    <p v-html="data"></p>
  </a-modal>
</template>

<script>
export default {
  name: 'Remark',
  data () {
    return {
      visible: false,
      confirmLoading: false,
      data: ''
    }
  },
  methods: {
    modal (record) {
      console.log(record)
      this.data = record
      // this.logDetail = detail
      // // this.confirmLoading = true
      this.visible = true
    },
    clean () {
      // 将日志详情置空 结束定时器
      this.visible = false
      this.data = ''
    }
  }
}
</script>
