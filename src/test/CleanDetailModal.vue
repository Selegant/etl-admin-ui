<template>
  <div>
    <a-modal ref="modal"
        title="清洗结果详情"
        :destroyOnClose="true" 
        :visible="errvisible"
        :footer="null"
        @cancel="close"
        width="80%">
        <a-table
          ref="table"
          size="middle"
          bordered
          rowKey="id"
          :columns="columns"
          :dataSource="list"
          :pagination="false"
          :loading="isLoading"
          :scroll="{ x: 1000 }"
        >
        </a-table>
    </a-modal>
  </div>
</template>

<script>
 import { getCleanDetailList } from '@api/api'
export default {
  name: 'CleanDetailModal',
  components: { },
  props:{
      resultId:{
         type:[String,Number],
         default:null
      },
      visible:{
          type:Boolean,
          default:false
      }
  },

  data() {
    return {
      list:[],
      isLoading:false,
      errvisible:false,
      columns:[
        {
          title: '编号',
          dataIndex: 'id',
          align: 'center',
          width: 60,
        },
        {
          title: '清洗字段名',
          dataIndex: 'columnName',
          align: 'center',
          width: 150,
        },
        {
          title: '清洗的汇总主键',
          dataIndex: 'resultId',
          align: 'center',
          width: 130,
        },
        {
          title: '清洗总数',
          dataIndex: 'total',
          align: 'center',
          width:100,
        },
        {
          title: '通过清洗数',
          dataIndex: 'complete',
          align: 'center',
          width: 100
        },
        {
          title: '清洗成功率',
          dataIndex: 'successRate',
          align: 'center',
          width: 100
        },
        {
          title: '清洗失败率',
          dataIndex: 'failRate',
          align: 'center',
          width: 100
        },
        {
          title: '清洗开始时间',
          dataIndex: 'start',
          align: 'center',
          width: 180
        },
        {
          title: '清洗结束时间',
          dataIndex: 'end',
          align: 'center',
          width: 180
        },
      ]
    }
  },
  computed:{
  },
  watch:{
      visible(val){
          if(val){
            this.getCleanDetailList()
          }
          this.errvisible = val
      }
  },
  mounted() {
    
  },
  methods: {
    close(){
        this.errvisible=false
        this.$emit("update:visible",false)
    },
    getCleanDetailList () {
      var that = this
      that.isLoading = true
      getCleanDetailList({resultId:that.resultId})
        .then(res => {
            console.log(res,'result');
            if (res.success) {
                that.list = res.result || [];
            } else {
                that.list = []
                that.$message.error(res.message);
            }
        })
        .catch(err => {
          that.$message.error(err.message);
        }).finally(()=>{
            that.isLoading = false
        })
    },
  },
  destroyed () {
    
  }
}
</script>

<style scoped lang="less">
    
</style>
