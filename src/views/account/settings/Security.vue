<template>
  <div>
    <a-list
      itemLayout="horizontal"
      :dataSource="data"
    >
      <a-list-item slot="renderItem" slot-scope="item, index" :key="index">
        <a-list-item-meta>
          <a slot="title">{{ item.title }}</a>
          <span slot="description">
            <span class="security-list-description">{{ item.description }}</span>
            <span v-if="item.value"> : </span>
            <span class="security-list-value">{{ item.value }}</span>
          </span>
        </a-list-item-meta>
        <template v-if="item.actions">
          <a slot="actions" @click="item.actions.callback">{{ item.actions.title }}</a>
        </template>
      </a-list-item>
    </a-list>
    <a-modal @ok="handleSubmit" v-model="visible">
      <a-form @submit="handleSubmit" :form="form" style="margin-top: 30px">
        <a-row class="form-row" :gutter="24">
          <a-form-item
            label="原密码"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-input-password allowClear v-decorator="['oldPassword', {rules:[{required: true, message: '原密码'}]}]" />
          </a-form-item>
        </a-row>
        <a-row class="form-row" :gutter="24">
          <a-form-item
            label="新密码"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-input-password allowClear v-decorator="['newPassword', {rules:[{required: true, message: '新密码'}]}]" />
          </a-form-item>
        </a-row>
        <a-row class="form-row" :gutter="24">
          <a-form-item
            label="确认密码"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-input-password allowClear v-decorator="['confirmPassword', {rules:[{required: true, message: '确认密码'}]}]" />
          </a-form-item>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { changePassword } from '@/api/login'

export default {
  data () {
    return {
      visible: false,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 }
      },
      form: this.$form.createForm(this),
      data: [
        { title: '账户密码', description: '', value: '', actions: { title: '修改', callback: () => { this.openUpdatePassword() } } }
        // { title: '密保手机', description: '已绑定手机', value: '138****8293', actions: { title: '修改', callback: () => { this.$message.success('This is a message of success') } } },
        // { title: '密保问题', description: '未设置密保问题，密保问题可有效保护账户安全', value: '', actions: { title: '设置', callback: () => { this.$message.error('This is a message of error') } } },
        // { title: '备用邮箱', description: '已绑定邮箱', value: 'ant***sign.com', actions: { title: '修改', callback: () => { this.$message.warning('This is message of warning') } } },
        // { title: 'MFA 设备', description: '未绑定 MFA 设备，绑定后，可以进行二次确认', value: '', actions: { title: '绑定', callback: () => { this.$message.info('This is a normal message') } } }
      ]
    }
  },
  methods: {
    openUpdatePassword () {
      this.visible = true
      this.form.resetFields()
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      this.visible = true
      validateFields((errors, values) => {
        if (!errors) {
          changePassword(values)
            .then(res => {
              if (res.code === 200) {
                this.$message.success('修改成功')
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

<style scoped>

</style>
