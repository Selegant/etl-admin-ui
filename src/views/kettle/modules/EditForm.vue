<template>
  <a-modal :width="600" :visible="visible" title="编辑作业调度参数" @ok="handleSubmit" @cancel="visible = false">
    <a-form @submit="handleSubmit" :form="form">
      <a-row class="form-row" :gutter="24">
        <a-form-item
          label="执行器"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <a-input disabled v-decorator="['job.id', {rules:[{required: false, message: '作业ID'}]}]" />
        </a-form-item>
      </a-row>
      <a-row class="form-row" :gutter="24">
        <a-form-item
          label="作业名称"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <a-input disabled v-decorator="['job.name', {rules:[{required: false, message: '请输入作业名称'}]}]" />
        </a-form-item>
      </a-row>
      <a-row class="form-row" :gutter="24">
        <a-form-item
          label="作业地址"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <a-input disabled v-decorator="['job.repositoryDirectory', {rules:[{required: false, message: '请输入作业地址'}]}]" />
        </a-form-item>
      </a-row>
      <a-row class="form-row" :gutter="24">
        <a-form-item
          label="编辑者"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <a-input disabled v-decorator="['job.modifiedUser', {rules:[{required: false, message: '请输入编辑者'}]}]" />
        </a-form-item>
      </a-row>
      <a-row class="form-row" :gutter="24">
        <a-form-item
          label="资源类型"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <a-select disabled placeholder="请选择" v-decorator="['job.objectType', {rules:[{required: false, message: '请选择资源类型'}]}]">
            <a-select-option :value="1">转换</a-select-option>
            <a-select-option :value="2">作业</a-select-option>
          </a-select>
        </a-form-item>
      </a-row>
      <a-row class="form-row" :gutter="24">
        <a-form-item
          label="编辑时间"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <a-input disabled v-decorator="['job.modifiedDate', {rules:[{required: false, message: '请输入编辑时间'}]}]" />
        </a-form-item>
      </a-row>
      <a-row class="form-row" :gutter="24">
        <a-form-item
          label="同步时间"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <a-input disabled v-decorator="['job.updateTime', {rules:[{required: false, message: '请输入同步时间'}]}]" />
        </a-form-item>
      </a-row>
      <a-row class="form-row" :gutter="24">
        <a-form-item
          label="日志等级"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <a-select placeholder="请选择" v-decorator="['job.logLevel', {rules:[{required: true, message: '请选择资源类型'}]}]">
            <a-select-option :value="0">没有日志</a-select-option>
            <a-select-option :value="1">错误日志</a-select-option>
            <a-select-option :value="2">最小日志</a-select-option>
            <a-select-option :value="3">基本日志</a-select-option>
            <a-select-option :value="4">详细日志</a-select-option>
            <a-select-option :value="5">调试</a-select-option>
            <a-select-option :value="6">行级日志</a-select-option>
          </a-select>
        </a-form-item>
      </a-row>
      <a-row class="form-row" :gutter="24">
        <a-form-item
          label="任务参数"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <!--          <a-textarea-->
          <!--            v-html="JSON.stringify(job.kettleParams, null, 4)" />-->
          <!--          <pre style="white-space: pre-wrap;word-wrap: break-word;">{{job.kettleParams}}</pre>-->
          <json-viewer :value="Object.keys(job).length!==0?JSON.parse(job.kettleParams):''" :expand-depth="4" copyable sort></json-viewer>
        </a-form-item>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script>
import { kettleJobGenerateParams } from '@/api/kettle'
export default {
  name: 'EditForm',
  data () {
    return {
      id: '',
      job: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 }
      },

      visible: false,
      form: this.$form.createForm(this)
    }
  },
  methods: {
    add () {
      this.visible = true
    },
    edit (record) {
      const { form: { setFieldsValue } } = this
      this.job = record
      this.visible = true
      this.$nextTick(() => {
        setFieldsValue({ job: record })
      })
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      this.visible = true
      validateFields((errors, values) => {
        if (!errors) {
          console.log(this.job)
          values.job.objectId = this.job.objectId
          kettleJobGenerateParams(values.job)
            .then(res => {
              if (res.code === 200) {
                this.$message.success('转换修改成功')
                this.visible = false
                this.$emit('ok')
              } else {
                this.$message.error(res.msg)
              }
            })
        }
      })
    }
  }
}
</script>
