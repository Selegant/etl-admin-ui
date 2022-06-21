<template>
    <a-modal v-model="modalVisible" :title="title" width="40%" :confirm-loading="confirmLoading" @ok="sureClick" @cancel="cancelClick">
        <a-form-model
            ref="ruleForm"
            :model="form"
            :rules="rules"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
        >
            <a-form-model-item label="字典" prop="dictType">
                <a-select v-model="form.dictType" placeholder="请选择需要同步的字典">
                <a-icon type="caret-down" slot="suffixIcon" />
                    <a-select-option v-for="item in dictTypeList" :key="item.code" :value="item.code">
                    {{item.name}}
                    </a-select-option>
                </a-select>
            </a-form-model-item>
        </a-form-model>
    </a-modal>
</template>
<script>
import { throttle } from "@/utils/util"
import { dataSynchronizationEs } from '@/api/api'
export default {
  name: 'SyncModal',
  props:{
      syncVisible:{
          type:Boolean,
          default:false
      }
  },
  data() {
    return {
      confirmLoading:false,
      modalVisible:false,
      title: '数据同步',
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      form: {
        dictType: null,
      },
      rules: {
        dictType: [{ required: true, message: '请选择需要同步的字典', trigger: 'change' }]
      },
      dictTypeList:[
          {name:'药品',code:1},
          {name:'疾病',code:2},
          {name:'手术',code:3},
          {name:'科室',code:4},
          {name:'收费项目',code:5},
          {name:'耗材',code:6},
          {name:'行政区划',code:7},
          {name:'公共字典',code:8}
      ]
    }
  },
  watch: {
      syncVisible(val){
          this.modalVisible = val
      }
  },
  mounted() {

  },
  methods: {
      sureClick:throttle(function(){
        this.$refs.ruleForm.validate(valid => {
            if (valid) {
                this.confirmLoading = true
                dataSynchronizationEs(this.form).then((res) => {
                    if (res.success) {
                        this.cancelClick()
                        this.$message.success(res.message)
                    }else{
                        this.$message.warning(res.message)
                    }
                }).finally(()=>{
                    this.confirmLoading = false
                })
            } else {
                return false;
            }
        });
      },3000),
      cancelClick(){
          this.confirmLoading = false
          this.form = this.$options.data().form
          this.$refs.ruleForm.resetFields();
          this.$emit('update:syncVisible',false)
      },
  }
}
</script>
<style lang="less" scoped>

</style>
<style scoped>
@import '~@assets/less/common.less'
</style>
