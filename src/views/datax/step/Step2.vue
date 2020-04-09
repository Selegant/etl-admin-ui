<template>
  <div>
    <a-form :form="form">
      <a-row class="form-row" :gutter="24">
        <a-col :lg="12" :md="24" :sm="48">
          <a-form-item
            label="执行器"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-select placeholder="请选择" v-decorator="['jobGroup', {rules:[{required: true, message: '请选择执行器'}]}]">
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
            <a-input v-decorator="['jobDesc', {rules:[{required: true, message: '请输入任务描述'}]}]" />
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
            <a-select placeholder="请选择" v-decorator="['executorRouteStrategy', {rules:[{required: true, message: '请选择路由策略'}]}]">
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
              v-decorator="['jobCron', {rules:[{required: true, message: '请选择Cron表达式'}]}]"
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
            <a-select placeholder="请选择" disabled v-decorator="['glueType', {rules:[{required: true, message: '请选择运行模式'}],initialValue:'BEAN'}]">
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
            <a-input v-decorator="['executorHandler', {rules:[{required: true, message: '请输入JobHandler'}]}]" />
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
            <a-select placeholder="请选择" v-decorator="['executorBlockStrategy', {rules:[{required: true, message: '请选择阻塞处理策略'}]}]">
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
            <a-input v-decorator="['childJobid', {rules:[{required: false, message: '请输入子任务ID'}]}]"/>
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
            <a-input v-decorator="['executorTimeout', {rules:[{required: false, message: '请输入任务超时时间'}]}]"/>
          </a-form-item>
        </a-col>
        <a-col :lg="12" :md="24" :sm="48">
          <a-form-item
            label="失败重试次数"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-input v-decorator="['executorFailRetryCount', {rules:[{required: false, message: '请输入失败重试次数'}]}]"/>
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
            <a-input v-decorator="['author', {rules:[{required: true, message: '请输入负责人'}]}]" />
          </a-form-item>
        </a-col>
        <a-col :lg="12" :md="24" :sm="48">
          <a-form-item
            label="报警邮件"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-input v-decorator="['alarmEmail', {rules:[{required: false, message: '请输入报警邮件'}]}]" />
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
              v-decorator="['executorParam',{rules: [{ required: false, message: '请输入任务参数' }]}]" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row class="form-row" :gutter="24">
        <a-col :lg="12" :md="24" :sm="48">
          <a-form-item :wrapperCol="{span: 19, offset: 5}">
            <a-button :loading="loading" type="primary" @click="nextStep">提交</a-button>
            <a-button style="margin-left: 8px" @click="prevStep">上一步</a-button>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script>
import { jobInfoAdd, getJobInfoSelectList } from '@/api/task'
import { getCron } from '@/api/cron'
export default {
  name: 'Step2',
  props: {
    executeParam: {
      type: String,
      default: ''
    }
  },
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
      visible: false,
      loading: false,
      form: this.$form.createForm(this)
    }
  },
  created () {
    // this.form.setFieldsValue({
    //   executorParam: this.executeParam
    // })
    this.$nextTick(() => {
      this.form.setFieldsValue({
        executorParam: this.executeParam
      })
    })
    this.loadSelectInfo()
    // const { form: { validateFields } } = this
    // validateFields((err, values) => {
    //   if (!err) {
    //     console.log('表单 values', values)
    //   } else {
    //   }
    // })
  },
  methods: {
    nextStep (resultData) {
      // console.log(resultData)
      // const { form: { setFieldsValue } } = this
      console.log(this.form)
      // this.$nextTick(() => {
      //   setFieldsValue({ record: record })
      // })
      const { form: { validateFields } } = this
      const that = this
      that.loading = true
      validateFields((err, values) => {
        if (!err) {
          jobInfoAdd(values)
            .then(res => {
              if (res.code === 200) {
                // this.$message.success('新增成功')
                this.form.resetFields()
                that.loading = false
                this.$emit('nextStep')
              } else {
                this.$message.error(res.msg)
                that.loading = false
              }
            })
          // console.log('表单 values', values)
          // that.timer = setTimeout(function () {
          //   that.loading = false
          //   that.$emit('nextStep')
          // }, 1500)
        } else {
          that.loading = false
        }
      })
    },
    loadSelectInfo () {
      getJobInfoSelectList().then(res => {
        console.log(res.data)
        this.jobGroupList = res.data.jobGroupList
        // this.queryParam.jobGroup = res.data.jobGroup
        return res.data
      })
      getCron().then(res => {
        this.cronList = res.data
      })
    },
    prevStep () {
      this.$emit('prevStep')
    }
    // handleSubmit () {
    //   const { form: { validateFields } } = this
    //   validateFields((errors, values) => {
    //     if (!errors) {
    //       jobInfoAdd(values.record)
    //         .then(res => {
    //           if (res.code === 200) {
    //             this.$message.success('新增成功')
    //             this.visible = false
    //             this.form.resetFields()
    //             this.$emit('ok')
    //           } else {
    //             this.$message.error(res.msg)
    //           }
    //         })
    //     } else {
    //     }
    //   })
    // }
  }
}
</script>

<style lang="less" scoped>
  .stepFormText {
    margin-bottom: 24px;

    .ant-form-item-label,
    .ant-form-item-control {
      line-height: 22px;
    }
  }

</style>
