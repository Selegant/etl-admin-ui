<template>
  <a-modal
    title="编辑资源库"
    :width="840"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
    @cancel="visible = false"
  >
    <a-form :form="form">
      <a-form-item
        label="资源库名称"
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
      >
        <a-input v-decorator="['repositoryName', {rules: [{required: true, message: '请输入资源库名称'}]}]" />
      </a-form-item>
      <a-form-item
        label="登录用户名"
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
      >
        <a-input v-decorator="['repositoryUsername', {rules: [{required: true, message: '请输入登录用户名'}]}]" />
      </a-form-item>
      <a-form-item
        label="登录密码"
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
      >
        <a-input-password v-decorator="['repositoryPassword', {rules: [{required: true, message: '请输入登录密码'}]}]" />
      </a-form-item>
      <a-form-item
        label="资源库数据库类型"
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
      >
        <a-select placeholder="请选择" v-decorator="['repositoryType', {rules:[{required: true, message: '请选择资源库数据库类型'}]}]">
          <a-select-option value="MYSQL">MYSQL</a-select-option>
          <a-select-option value="ORACLE">ORACLE</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item
        label="资源库数据库访问模式"
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
      >
        <a-select placeholder="请选择" v-decorator="['databaseAccess', {rules:[{required: true, message: '请选择资源库数据库访问模式'}]}]">
          <a-select-option value="Native">Native</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item
        label="资源库数据库地址"
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
      >
        <a-input v-decorator="['databaseHost', {rules: [{required: true, message: '请输入资源库数据库地址'}]}]" />
      </a-form-item>
      <a-form-item
        label="资源库数据库端口号"
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
      >
        <a-input v-decorator="['databasePort', {rules: [{required: true, message: '请输入资源库数据库端口号'}]}]" />
      </a-form-item>
      <a-form-item
        label="资源库数据库名称"
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
      >
        <a-input v-decorator="['databaseName', {rules: [{required: true, message: '请输入资源库数据库名称'}]}]" />
      </a-form-item>
      <a-form-item
        label="数据库登录账号"
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
      >
        <a-input v-decorator="['databaseUsername', {rules: [{required: true, message: '请输入数据库登录账号'}]}]" />
      </a-form-item>
      <a-form-item
        label="数据库登录密码"
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
      >
        <a-input-password v-decorator="['databasePassword', {rules: [{required: true, message: '请输入数据库登录密码'}]}]" />
      </a-form-item>
      <a-row class="form-row" :gutter="24">
        <a-form-item :wrapper-col="{ span: 12, offset: 10 }">
          <a-button type="primary" @click="testDataSource">测试连接</a-button>
        </a-form-item>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script>
import { repositoryTestConnection, saveRepository } from '@/api/kettle'
export default {
  name: 'EditRepositoryForm',
  data () {
    return {
      jobGroupList: [],
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 }
      },
      confirmLoading: false,
      visible: false,
      form: this.$form.createForm(this),
      editRecord: ''
    }
  },
  methods: {
    edit (record) {
      this.editRecord = record
      const { form: { setFieldsValue } } = this
      this.visible = true
      this.$nextTick(() => {
        setFieldsValue(record)
      })
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      this.confirmLoading = true
      const that = this
      validateFields((errors, values) => {
        if (!errors) {
          values.repositoryId = that.editRecord.repositoryId
          saveRepository(values)
            .then(res => {
              if (res.code === 200) {
                this.$message.success('保存成功')
                this.visible = false
                this.form.resetFields()
                this.confirmLoading = false
                this.$emit('ok')
              } else {
                this.$message.error(res.msg)
                this.confirmLoading = false
              }
            })
        } else {
          this.confirmLoading = false
        }
      })
    },
    testDataSource () {
      const { form: { validateFields } } = this
      this.confirmLoading = true
      validateFields((errors, values) => {
        if (!errors) {
          repositoryTestConnection(values)
            .then(res => {
              if (res.code === 200) {
                this.$message.success('连接成功')
                this.confirmLoading = false
              } else {
                this.$message.error(res.msg)
                this.confirmLoading = false
              }
            })
        } else {
          this.confirmLoading = false
        }
      })
    }
  }
}
</script>
