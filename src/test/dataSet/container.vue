<template>
  <div class="operation-container has-tabs-page-container">
    <div class="left">
        <a-form-model :model="queryParam" layout="inline">
          <a-row :gutter="24">
            <a-col :md="9" :sm="24">
              <a-form-model-item style="width:100%;" :wrapperCol="{span: 24}">
                <a-input
                  style="width:100%;"
                  v-model="queryParam.keyword"
                  placeholder="请输入关键字查询"
                ></a-input>
              </a-form-model-item>
            </a-col>
            <a-col :md="15" :sm="24">
              <a-form-model-item>
                <a-button type="primary" @click="searchQuery">查询</a-button>
                <HzButton type="secondary_btn" name="重置" style="margin: 0 8px;" @click="reset"></HzButton>
                <!-- <a-button type="primary" icon="reload" style="margin-left: 8px" @click="reset">重置</a-button> -->
                <HzButton type="second_btn" name="数据同步" @click="syncClick"></HzButton>
                <!-- <a-button style="margin-left: 8px" @click="syncClick">数据同步</a-button> -->
              </a-form-model-item>
            </a-col>
          </a-row>
        </a-form-model>
        <a-table
        :loading="loading"
        :scroll="{ y: tableHeight }"
        ref="table"
        style="width: 100%;margin-top:10px;"
        size="middle"
        bordered
        rowKey="incrementId"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :customRow="rowClick"
        :rowClassName="tableRowClassName"
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
    </div>
    <div class="right">
      <hz-title type="short" title="详情"></hz-title>
      <a-table
        :scroll="{ x: 1100, y: tableHeight }"
        ref="righttable"
        style="width: 100%;margin-top:10px;"
        size="middle"
        bordered
        :pagination="false"
        :columns="rightColumns"
        :dataSource="selectRow.fieldInfoList"
        >
            <template slot="diseaseCode" slot-scope="text">
                <a-popover overlayClassName="define-popover-style">
                    <template slot="content">
                        <p>{{ text }}</p>
                    </template>
                    <div class="one-ellipsis">{{text}}</div>
                </a-popover>
            </template>
            <a slot="action" slot-scope="text,record" href="javascript:;" @click="fieldInfoClick(record)">查看</a>
        </a-table>
    </div>
    <relation-modal ref="relationModal" :relation-visible.sync="relationVisible"></relation-modal>
    <sync-modal :sync-visible.sync="syncVisible"></sync-modal>
  </div>
</template>

<script>
import HzTitle from '@/components/HzUi/HzTitle'
import TextView from '@/components/HzUi/TextView'
import { getAction } from '@/api/manage'
import { DataStandardMixin } from '@/mixins/DataStandardMixin'
import RelationModal from './RelationModal.vue'
import SyncModal from './SyncModal.vue'
export default {
  name: "Operation",
  mixins: [DataStandardMixin],
  components: {
      HzTitle,
      TextView,
      RelationModal,
      SyncModal
    },
  data() {
    return {
      syncVisible:false,
      dictType:'',
      uid:'',
      relationVisible:false,
      tableHeight: window.innerHeight - 435,
      labels: [
        { key: "fieldNameCaption", name: "数据元字段中文名称" },
        { key: "fieldName", name: "数据元字段名称" },
        { key: "dataTypeCode", name: "数据类型代码" },
        { key: "rangeType", name: "值域类型" },
        { key: "rangeSourceCode", name: "值域来源代码" },
        { key: "rangeParentCode", name: "公共值域父类" },
        { key: "masterdbName", name: "主数据表名" },
      ],
      columns: [
        {
            title: "序号",
            width: 60,
            customRender: (text, record, index) => `${index + 1}`,
        },
        {
          title: '数据集名称',
          dataIndex: 'datatableCaptioon',
          ellipsis: true,
        //   scopedSlots: { customRender: 'diseaseCode'}
        },
        {
          title: '数据集表名',
          dataIndex: 'datatableName',
          ellipsis: true,
        //   scopedSlots: { customRender: 'diseaseCode'}
        }
      ],
      rightColumns: [
        {
            title: "序号",
            width: 60,
            customRender: (text, record, index) => `${index + 1}`,
        },
        {
          title: '字段',
          wdith:150,
          dataIndex: 'fieldName',
          // ellipsis: true,
        //   scopedSlots: { customRender: 'diseaseCode'}
        },
        {
          title: '字段名称',
          width:200,
          dataIndex: 'fieldNameCaption',
          // ellipsis: true,
        //   scopedSlots: { customRender: 'diseaseCode'}
        },
        {
          title: '值域来源代码',
          width:150,
          dataIndex: 'rangeSourceCode'
        },
        {
          title: '主数据表名',
          width:200,
          dataIndex: 'masterdbName',
          // ellipsis: true,
        //   scopedSlots: { customRender: 'diseaseCode'}
        },
        {
          title: '对应数据表名',
          dataIndex: 'correspondingName',
          // ellipsis: true,
        //   scopedSlots: { customRender: 'diseaseCode'}
        },
        {
          title: '值域对应关系',
          dataIndex: 'action',
          width:120,
          fixed: 'right',
          align:'center',
          scopedSlots: { customRender: 'action'}
        },
      ],
      url: {
        list: '/dictDataCleanStandard/queryDictModelInfo'
      },
      queryParam:{
        keyword:'',
      }
    };
  },
  mounted() {
  },
  methods: {
    syncClick(){
      this.syncVisible = true
    },
    fieldInfoClick(row){
      this.relationVisible = true
      this.dictType = row.rangeSourceCode
      this.uid = row.rangeParentCode
      console.log(row,row.rangeSourceCode,row.rangeParentCode,'当前行');
      this.$refs.relationModal.dictType = row.rangeSourceCode || ''
      this.$refs.relationModal.uid = row.rangeParentCode || ''
      this.$refs.relationModal.loadData()
    },
      // 表格选中
    tableRowClassName(row) {
        if (row.incrementId && row.incrementId === this.selectRow.incrementId) {
            return "table-row-select";
        }
    }
  },
};
</script>

<style lang="less" scoped>
@import '~@/assets/less/common.less';
.right{
  width:55% !important;
}
</style>
