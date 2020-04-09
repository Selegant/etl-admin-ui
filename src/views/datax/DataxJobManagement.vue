<template>
  <a-card :bordered="false">
    <a-steps class="steps" :current="currentTab">
      <a-step title="建立映射关系" />
      <a-step title="创建调度任务" />
      <a-step title="完成" />
    </a-steps>
    <div class="content">
      <step1 v-if="currentTab === 0" @nextStep="nextStep"/>
      <step2 :execute-param="data" v-if="currentTab === 1" @nextStep="nextStep" @prevStep="prevStep"/>
      <step3 v-if="currentTab === 2" @prevStep="prevStep" @finish="finish"/>
    </div>
  </a-card>
</template>

<script>
import Step1 from './step/Step1'
import Step2 from './step/Step2'
import Step3 from './step/Step3'

export default {
  name: 'DataxJobManagement',
  components: {
    Step1,
    Step2,
    Step3
  },
  data () {
    return {
      description: '映射表结构建立DataX任务',
      currentTab: 0,

      // form
      form: null,
      data: ''
    }
  },
  methods: {

    // handler
    nextStep (data) {
      if (this.currentTab < 2) {
        this.currentTab += 1
      }
      if (this.currentTab === 1) {
        this.data = data
      }
    },
    prevStep () {
      if (this.currentTab > 0) {
        this.currentTab -= 1
      }
    },
    finish () {
      this.currentTab = 0
    }
  }
}
</script>

<style lang="less" scoped>
  .steps {
    max-width: 750px;
    margin: 16px auto;
  }
</style>
