<template>
<div>
    <j-modal
      width="80%"
      :title="title"
      :visible.sync="modalVisible"
      :fullscreen.sync="fullscreen"
      :switch-fullscreen="switchFullscreen"
      @cancel="handleCancleDbSync"
      :footer="false"
      :destroyOnClose="true"
    >
      <a-table
        :loading="loading"
        ref="table"
        style="width: 100%;"
        size="middle"
        bordered
        rowKey="incrementId"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        @change="handleTableChange">
            <template slot="diseaseCode" slot-scope="text">
                <a-popover overlayClassName="define-popover-style">
                    <template slot="content">
                        <p>{{ text }}</p>
                    </template>
                    <div class="one-ellipsis">{{text}}</div>
                </a-popover>
            </template>
        </a-table>
    </j-modal>
    </div>
</template>
<script>
import { getAction } from '@/api/manage'
// import { JeecgListMixin } from '@/mixins/JeecgListMixin'
export default {
  name: 'RelationModal',
  props:{
      relationVisible:{
          type:Boolean,
          default:false
      }
  },
//   mixins: [JeecgListMixin],
  data() {
    return {
      loading:false,
      dictType:'',
      uid:'',
      dataSource:[],
      ipagination:{
        current: 1,
        pageSize: 10,
        pageSizeOptions: ['10', '20', '30'],
        showTotal: (total, range) => {
          return range[0] + "-" + range[1] + " 共" + total + "条"
        },
        showQuickJumper: true,
        showSizeChanger: true,
        total: 0
      },
      modalVisible:false,
      title: '值域对应关系',
      fullscreen: false,
      switchFullscreen: true,
      columns: [
        {
            title: "序号",
            width: 60,
            customRender: (text, record, index) => `${index + 1}`,
        },
        {
          title: '字段值域父类代码',
          wdith:150,
          dataIndex: 'parentDictUid',
          // ellipsis: true,
        //   scopedSlots: { customRender: 'diseaseCode'}
        },
        {
          title: '平台字段值域代码',
          width:200,
          dataIndex: 'publicDictCode',
          // ellipsis: true,
        //   scopedSlots: { customRender: 'diseaseCode'}
        },
        {
          title: '平台字段值域数值',
          width:150,
          dataIndex: 'publicDictName'
        },
        {
          title: '机构字段值域代码',
          width:200,
          dataIndex: 'orgDictCode',
          // ellipsis: true,
        //   scopedSlots: { customRender: 'diseaseCode'}
        },
        {
          title: '机构字段值域数值',
          dataIndex: 'orgDictName',
          // ellipsis: true,
        //   scopedSlots: { customRender: 'diseaseCode'}
        },
      ],
      url: {
        list:'/dictDataCleanStandard/queryRangeMapping'
      }
    }
  },
  watch: {
      relationVisible(val){
          this.modalVisible = val
      }
  },
  mounted() {

  },
  methods: {
      handleTableChange(pagination) {
        this.ipagination = pagination;
        this.loadData();
      },
      handleCancleDbSync(){
          this.dataSource = []
          this.ipagination = this.$options.data().ipagination
          this.$emit('update:relationVisible',false)
      },
      loadData(arg) {
          console.log('加载数据');
        //加载数据 若传入参数1则加载第一页的内容
        if (arg === 1) {
            this.ipagination.current = 1;
        }
        let params = {
            dictType:this.dictType,
            uid:this.uid,
            pageNo:this.ipagination.current,
            pageSize:this.ipagination.pageSize
        }
        console.log(params,'传参');
        this.loading = true;
        getAction(this.url.list, params).then((res) => {
            if (res.success) {
                this.dataSource = res.result.records || []
                if(res.result.total)
                {
                    this.ipagination.total = res.result.total;
                }else{
                    this.ipagination.total = 0;
                }
            }else{
                this.$message.warning(res.message)
            }
        }).finally(()=>{
            this.loading = false;
        })
    },
  }
}
</script>
<style lang="less" scoped>

</style>
<style scoped>
@import '~@assets/less/common.less'
</style>
