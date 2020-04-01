<template>
  <a-modal
    title="日志详情"
    :width="840"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="clean"
    @cancel="clean"
  >
    <div style="overflow: auto;height: calc(60vh)">
      <p v-html="this.$parent.$parent.logDetail"></p>
    </div>
  </a-modal>
</template>

<script>
export default {
  name: 'Detail',
  data () {
    return {
      visible: false,
      confirmLoading: false
    }
  },
  methods: {
    modal () {
      console.log(this.$parent.$parent.logDetail)
      // this.logDetail = detail
      // // this.confirmLoading = true
      this.visible = true
    },
    clean () {
      // 将日志详情置空 结束定时器
      this.visible = false
      this.$parent.$parent.logDetail = ''
      window.clearInterval(this.$parent.$parent.timeInterval)
    }
  }
}
</script>
