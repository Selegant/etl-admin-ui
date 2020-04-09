<template>
  <a-modal
    :width="600"
    :visible="visible"
    title="新增数据源"
    okText="保存"
    @ok="handleSubmit"
    @cancel="visible = false">
    <a-form @submit="handleSubmit" :form="form">
      <a-row class="form-row" :gutter="24">
        <a-form-item
          label="数据源名称"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <a-input v-decorator="['datasource.datasourceName', {rules:[{required: true, message: '请输入数据源名称'}]}]" />
        </a-form-item>
      </a-row>
      <a-row class="form-row" :gutter="24">
        <a-form-item
          label="数据源类型"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <a-select placeholder="请选择" v-decorator="['datasource.datasource', {rules:[{required: true, message: '请选择数据源类型'}]}]">
            <a-select-option value="oracle">Oracle</a-select-option>
            <a-select-option value="mysql">Mysql</a-select-option>
            <a-select-option value="phoenix">Phoenix</a-select-option>
          </a-select>
        </a-form-item>
      </a-row>
      <a-row class="form-row" :gutter="24">
        <a-form-item
          label="数据库驱动"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <a-select placeholder="请选择" v-decorator="['datasource.jdbcDriverClass', {rules:[{required: true, message: '请选择数据库驱动'}]}]">
            <a-select-option value="oracle.jdbc.OracleDriver">Oracle</a-select-option>
            <a-select-option value="com.mysql.jdbc.Driver">Mysql</a-select-option>
            <a-select-option value="org.apache.phoenix.jdbc.PhoenixDriver">Phoenix</a-select-option>
          </a-select>
        </a-form-item>
      </a-row>
      <a-row class="form-row" :gutter="24">
        <a-form-item
          label="数据库用户名"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <a-input v-decorator="['datasource.jdbcUsername', {rules:[{required: true, message: '请输入数据库用户名'}]}]" />
        </a-form-item>
      </a-row>
      <a-row class="form-row" :gutter="24">
        <a-form-item
          label="数据库密码"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <a-input-password v-decorator="['datasource.jdbcPassword', {rules:[{required: true, message: '请输入数据库密码'}]}]" />
        </a-form-item>
      </a-row>
      <a-row class="form-row" :gutter="24">
        <a-form-item
          label="数据库地址"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <a-input v-decorator="['datasource.jdbcUrl', {rules:[{required: true, message: '请输入数据库地址'}]}]" />
        </a-form-item>
      </a-row>
      <a-row class="form-row" :gutter="24">
        <a-form-item
          label="备注"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
        >
          <a-input v-decorator="['datasource.comments', {rules:[{required: false, message: '请输入备注'}]}]" />
        </a-form-item>
      </a-row>
      <a-row class="form-row" :gutter="24">
        <a-form-item :wrapper-col="{ span: 12, offset: 10 }">
          <a-button type="primary" @click="testDataSource">测试连接</a-button>
        </a-form-item>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script>
import { testDataSource, saveDataSource } from '@/api/datax'
export default {
  name: 'CreateForm',
  data () {
    return {
      datasource: {},
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
    testDataSource () {
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {
          // console.log(this.datasource)
          testDataSource(values.datasource)
            .then(res => {
              if (res.code === 200) {
                this.$message.success('测试连接成功')
              } else {
                this.$message.error(res.message)
              }
            })
        }
      })
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      this.visible = true
      validateFields((errors, values) => {
        if (!errors) {
          saveDataSource(values.datasource)
            .then(res => {
              if (res.code === 200) {
                this.$message.success('保存成功')
                this.$emit('ok')
                this.visible = false
                this.form.resetFields()
              } else {
                this.$message.error(res.message)
              }
            })
        }
      })
    }
  }
}
</script>
