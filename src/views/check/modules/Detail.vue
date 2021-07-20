<template>
  <a-modal
    title="处方明细信息表        2020-11-20"
    :width="840"
    :visible="visible"
    @ok="clean"
    @cancel="clean"
  >
    <div style="overflow: auto;height: calc(60vh)">
      <s-table
        ref="table"
        size="default"
        rowKey="key"
        :columns="columns"
        :data="loadData"
        showPagination="true"
      >
      </s-table>
    </div>
  </a-modal>
</template>

<script>
import moment from 'moment'
import { STable, Ellipsis } from '@/components'

const tableData = [
  {
    id: '1',
    recordId: 18362,
    errorMsg: 'drug_code字段过长，要求字段50,实际字段56'
  },
  {
    id: '2',
    recordId: 67247,
    errorMsg: 'drug_code字段过长，要求字段50,实际字段69'
  },
  {
    id: '3',
    recordId: 17936,
    errorMsg: 'use_drug_channel_code字段过长，要求字段50,实际字段78'
  },
  {
    id: '4',
    recordId: 46892,
    errorMsg: 'drug_code字段过长，要求字段50,实际字段78'
  },
  {
    id: '5',
    recordId: 37357,
    errorMsg: 'packet_amount数据类型错误'
  },
  {
    id: '6',
    recordId: 8473,
    errorMsg: 'use_drug_channel_code字段过长，要求字段50,实际字段102'
  },
  {
    id: '7',
    recordId: 4326,
    errorMsg: 'use_drug_channel_code字段过长，要求字段50,实际字段168'
  },
  {
    id: '8',
    recordId: 28347,
    errorMsg: 'collect_serial_no不能为空'
  },
  {
    id: '9',
    recordId: 136783,
    errorMsg: 'use_drug_channel_name字段过长，要求字段50,实际字段78'
  },
  {
    id: '10',
    recordId: 17345,
    errorMsg: 'cancel_flag不能为空'
  }
]

export default {
  name: 'Detail',
  components: {
    STable,
    Ellipsis
  },
  data () {
    return {
      visible: false,
      moment,
      tableData,
      listTimer: null,
      timeInterval: Object,
      dateFormat: 'YYYY-MM-DD',
      logDetail: '',
      logDetailVisible: false,
      // 调度备注modal
      triggerMsgVisible: false,
      mdl: {},
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {
      },
      // jobGroupList
      jobGroupList: [],
      // 表头
      columns: [
        {
          title: '序号',
          dataIndex: 'id',
          width: '100px'
        },
        {
          title: '记录ID',
          dataIndex: 'recordId'
        },
        {
          title: '异常原因',
          dataIndex: 'errorMsg'
        }
      ],
      loadData: parameter => {
        return new Promise(function (resolve, reject) {
          // 异步处理
          // 处理结束后、调用resolve 或 reject
          const result = {
            'data': tableData,
            'pageNo': 1,
            'pageSize': 10,
            'totalCount': 52,
            'totalPage': 10
          }
          resolve(result)
        })
      }
    }
  },
  methods: {
    modal () {
      // this.logDetail = detail
      // // this.confirmLoading = true
      this.visible = true
    },
    clean () {
      // 将日志详情置空 结束定时器
      this.visible = false
      this.$parent.$parent.logDetail = ''
      window.clearInterval(this.$parent.$parent.timeInterval)
    }
  }
}
</script>
