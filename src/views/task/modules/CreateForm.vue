<template>
  <a-modal
    title="新建任务"
    :width="840"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
    @cancel="cancel"
  >
    <a-form @submit="handleSubmit" :form="form">
      <a-row class="form-row" :gutter="24">
        <a-col :lg="12" :md="24" :sm="48">
          <a-form-item
            label="执行器"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-select placeholder="请选择" v-decorator="['record.jobGroup', {rules:[{required: true, message: '请选择执行器'}]}]">
              <a-select-option v-for="item in jobGroupList" :key="item.id" :value="item.id">{{ item.title }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :lg="12" :md="24" :sm="48">
          <a-form-item
            label="任务描述"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-input v-decorator="['record.jobDesc', {rules:[{required: true, message: '请输入任务描述'}]}]" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row class="form-row" :gutter="24">
        <a-col :lg="12" :md="24" :sm="48">
          <a-form-item
            label="路由策略"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-select placeholder="请选择" v-decorator="['record.executorRouteStrategy', {rules:[{required: true, message: '请选择路由策略'}]}]">
              <a-select-option value="FIRST">第一个</a-select-option>
              <a-select-option value="LAST">最后一个</a-select-option>
              <a-select-option value="ROUND">轮询</a-select-option>
              <a-select-option value="RANDOM">随机</a-select-option>
              <a-select-option value="CONSISTENT_HASH">一致性HASH</a-select-option>
              <a-select-option value="LEAST_FREQUENTLY_USED">最不经常使用</a-select-option>
              <a-select-option value="LEAST_RECENTLY_USED">最近最久未使用</a-select-option>
              <a-select-option value="FAILOVER">故障转移</a-select-option>
              <a-select-option value="BUSYOVER">忙碌转移</a-select-option>
              <a-select-option value="SHARDING_BROADCAST">分片广播</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :lg="12" :md="24" :sm="48">
          <a-form-item
            label="Cron"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-select
              showSearch
              placeholder="请选择Cron表达式"
              optionFilterProp="children"
              v-decorator="['record.jobCron', {rules:[{required: true, message: '请选择Cron表达式'}]}]"
            >
              <a-select-option v-for="item in cronList" :key="item.id" :value="item.cron">{{ item.cronDesc }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row class="form-row" :gutter="24">
        <a-col :lg="12" :md="24" :sm="48">
          <a-form-item
            label="运行模式"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-select placeholder="请选择" disabled v-decorator="['record.glueType', {rules:[{required: true, message: '请选择运行模式'}],initialValue:'BEAN'}]">
              <a-select-option value="BEAN">BEAN</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :lg="12" :md="24" :sm="48">
          <a-form-item
            label="JobHandler"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-input v-decorator="['record.executorHandler', {rules:[{required: true, message: '请输入JobHandler'}]}]" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row class="form-row" :gutter="24">
        <a-col :lg="12" :md="24" :sm="48">
          <a-form-item
            label="阻塞处理策略"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-select placeholder="请选择" v-decorator="['record.executorBlockStrategy', {rules:[{required: true, message: '请选择阻塞处理策略'}]}]">
              <a-select-option value="SERIAL_EXECUTION">单机串行</a-select-option>
              <a-select-option value="DISCARD_LATER">丢弃后续调度</a-select-option>
              <a-select-option value="COVER_EARLY">覆盖之前调度</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :lg="12" :md="24" :sm="48">
          <a-form-item
            label="子任务ID"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-input v-decorator="['record.childJobid', {rules:[{required: false, message: '请输入子任务ID'}]}]"/>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row class="form-row" :gutter="24">
        <a-col :lg="12" :md="24" :sm="48">
          <a-form-item
            label="任务超时时间"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-input v-decorator="['record.executorTimeout', {rules:[{required: false, message: '请输入任务超时时间'}]}]"/>
          </a-form-item>
        </a-col>
        <a-col :lg="12" :md="24" :sm="48">
          <a-form-item
            label="失败重试次数"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-input v-decorator="['record.executorFailRetryCount', {rules:[{required: false, message: '请输入失败重试次数'}]}]"/>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row class="form-row" :gutter="24">
        <a-col :lg="12" :md="24" :sm="48">
          <a-form-item
            label="负责人"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-input v-decorator="['record.author', {rules:[{required: true, message: '请输入负责人'}]}]" />
          </a-form-item>
        </a-col>
        <a-col :lg="12" :md="24" :sm="48">
          <a-form-item
            label="报警邮件"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-input v-decorator="['record.alarmEmail', {rules:[{required: false, message: '请输入报警邮件'}]}]" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row class="form-row" :gutter="24">
        <a-col :lg="12" :md="24" :sm="48">
          <a-form-item
            label="任务参数"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-textarea
              rows="10"
              placeholder="请输入任务参数"
              v-decorator="['record.executorParam',{rules: [{ required: false, message: '请输入任务参数' }]}]" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script>
import { jobInfoAdd } from '@/api/task'
export default {
  name: 'CreateForm',
  data () {
    return {
      jobGroupList: [],
      cronList: [],
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
      form: this.$form.createForm(this)
    }
  },
  methods: {
    add (jobGroupList, cronList) {
      this.visible = true
      this.jobGroupList = jobGroupList
      this.cronList = cronList
    },
    cancel () {
      this.visible = false
      this.form.resetFields()
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      this.confirmLoading = true
      validateFields((errors, values) => {
        if (!errors) {
          values.record.objectType = 3
          jobInfoAdd(values.record)
            .then(res => {
              if (res.code === 200) {
                this.$message.success('新增成功')
                this.visible = false
                this.form.resetFields()
                this.confirmLoading = false
                this.form.resetFields()
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
    }
  }
}
</script>
