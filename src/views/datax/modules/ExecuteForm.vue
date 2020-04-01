<template>
  <a-modal
    title="执行一次"
    :width="840"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item
          label="任务参数"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <a-textarea rows="6" v-decorator="['record.executorParam', {rules: [{required: false, min: 5, message: ''}]}]" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import { jobTrigger } from '@/api/task'
export default {
  name: 'ExecuteForm',
  data () {
    return {
      id: '',
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 }
      },
      visible: false,
      confirmLoading: false,

      form: this.$form.createForm(this)
    }
  },
  methods: {
    add () {
      this.visible = true
    },
    execute (record) {
      const { form: { setFieldsValue } } = this
      this.id = record.id
      this.visible = true
      this.$nextTick(() => {
        setFieldsValue({ record: record })
      })
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      this.confirmLoading = true
      validateFields((errors, values) => {
        if (!errors) {
          values.record.id = this.id
          jobTrigger(values.record)
            .then(res => {
              if (res.code === 200) {
                this.$message.success('执行成功')
                this.visible = false
              } else {
                this.$message.error(res.msg)
              }
            })
        } else {
          this.confirmLoading = false
        }
      })
    },
    handleCancel () {
      this.visible = false
    }
  }
}
</script>
