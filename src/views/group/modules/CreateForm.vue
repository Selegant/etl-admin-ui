<template>
  <a-modal
    title="新建规则"
    :width="640"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item
          label="AppName"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <a-input v-decorator="['appName', {rules: [{required: true, min:4, max:64, message: '请输入至少4个字符的AppName！'}]}]" />
        </a-form-item>
        <a-form-item
          label="名称"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <a-input v-decorator="['title', {rules: [{required: true, min:4, max:12,message: '请输入名称(4-12位)！'}]}]" />
        </a-form-item>
        <a-form-item
          label="排序"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <a-input v-decorator="['order', {rules: [{required: true,pattern: '^[0-9]*[1-9][0-9]*$', message: '请输入数字！'}]}]" />
        </a-form-item>
        <a-form-item
          label="注册方式"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <a-radio-group buttonStyle="solid" v-decorator="['addressType', {rules: [{required: true, message: '请输入至少五个字符的规则描述！'}], initialValue:'0'}]">
            <a-radio-button value="0" @click="() => this.textareaDisabled=true">自动注册</a-radio-button>
            <a-radio-button value="1" @click="() => this.textareaDisabled=false">手动注册</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          label="机器地址"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <a-textarea :disabled="textareaDisabled" v-decorator="['addressList', {rules: [{required: !textareaDisabled, message: '请输入机器地址！'}]}]" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import { jobGroupSave } from '@/api/group'

export default {
  data () {
    return {
      textareaDisabled: true,
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
    handleSubmit () {
      const { form: { validateFields } } = this
      this.confirmLoading = true
      validateFields((errors, values) => {
        if (!errors) {
          jobGroupSave(values)
            .then(res => {
              if (res.code === 200) {
                this.$message.success('新增成功')
                this.visible = false
                this.form.resetFields()
                this.$emit('ok')
                this.confirmLoading = false
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
