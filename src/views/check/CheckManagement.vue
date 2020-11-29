<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="日期">
              <a-date-picker :default-value="moment('2020-11-20', dateFormat)" :format="dateFormat"/>
            </a-form-item>
          </a-col>
          <a-col :md="5" :sm="24">
            <a-form-item label="数据集">
              <a-select v-model="queryParam.logStatus" placeholder="请选择" default-value="1">
                <a-select-option value="卡号信息表">卡号信息表</a-select-option>
                <a-select-option value="患者信息表">患者信息表</a-select-option>
                <a-select-option value="住院记录表">住院记录表</a-select-option>
                <a-select-option value="处方信息表">处方信息表</a-select-option>
                <a-select-option value="处方明细信息表">处方明细信息表</a-select-option>
                <a-select-option value="医嘱执行记录表">医嘱执行记录表</a-select-option>
                <a-select-option value="住院医嘱表">住院医嘱表</a-select-option>
                <a-select-option value="住院记录表">住院记录表</a-select-option>
                <a-select-option value="挂号信息表">挂号信息表</a-select-option>
                <a-select-option value="住院诊断记录表">住院诊断记录表</a-select-option>
                <a-select-option value="检验结果表">检验结果表</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <template v-if="advanced">

          </template>
          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
              <a-button style="margin-left: 8px" @click="resetSearchForm">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!--    <div class="table-operator">-->
    <!--      <a-button type="primary" icon="plus" @click="$refs.createModal.add()">新建</a-button>-->
    <!--      <a-button type="dashed" @click="tableOption">{{ optionAlertShow && '关闭' || '开启' }} alert</a-button>-->
    <!--      <a-dropdown v-action:edit v-if="selectedRowKeys.length > 0">-->
    <!--        <a-menu slot="overlay">-->
    <!--          <a-menu-item key="1"><a-icon type="delete" />删除</a-menu-item>-->
    <!--          &lt;!&ndash; lock | unlock &ndash;&gt;-->
    <!--          <a-menu-item key="2"><a-icon type="lock" />锁定</a-menu-item>-->
    <!--        </a-menu>-->
    <!--        <a-button style="margin-left: 8px">-->
    <!--          批量操作 <a-icon type="down" />-->
    <!--        </a-button>-->
    <!--      </a-dropdown>-->
    <!--    </div>-->

    <s-table
      ref="table"
      size="default"
      rowKey="key"
      :columns="columns"
      :data="loadData"
      showPagination="auto"
    >
      <span slot="handleNum" slot-scope="text">
        <span v-if="text!=null">{{ text }}</span>
        <span v-else>-</span>
      </span>
      <span slot="handleCode" slot-scope="text">
        <a-tag v-if="text!=null" :color="text | handleCodeColorFilter">
          <span v-if="text==0">正常</span>
          <span v-if="text!=0">异常</span>
        </a-tag>
        <a-tag v-else>执行中</a-tag>
      </span>
      <span slot="action" slot-scope="record">
        <template>
          <a @click="showLogDetail(record)">详情</a>
        </template>
      </span>
    </s-table>

    <detail ref="detail"></detail>
  </a-card>
</template>

<script>
import moment from 'moment'
import { STable, Ellipsis } from '@/components'
import Detail from './modules/Detail'
import TagSelectOption from '../../components/TagSelect/TagSelectOption'
import Remark from '@/views/log/modules/Remark'

const tableData = [
  {
    id: '1',
    tableName: '卡号信息表',
    odsNum: 248976,
    proNum: 248976,
    errorNum: 0,
    handleCode: 0
  },
  {
    id: '2',
    tableName: '患者信息表',
    odsNum: 248976,
    proNum: 248976,
    errorNum: 0,
    handleCode: 0
  },
  {
    id: '3',
    tableName: '住院记录表',
    odsNum: 145739,
    proNum: 145739,
    errorNum: 0,
    handleCode: 0
  },
  {
    id: '4',
    tableName: '处方信息表',
    odsNum: 333568,
    proNum: 333568,
    errorNum: 0,
    handleCode: 0
  },
  {
    id: '5',
    tableName: '处方明细信息表',
    odsNum: 333568,
    proNum: 333274,
    errorNum: 294,
    handleCode: 500
  },
  {
    id: '6',
    tableName: '医嘱执行记录表',
    odsNum: 583456,
    proNum: 583409,
    errorNum: 47,
    handleCode: 500
  },
  {
    id: '7',
    tableName: '住院医嘱表',
    odsNum: 247689,
    proNum: 247689,
    errorNum: 0,
    handleCode: 0
  },
  {
    id: '8',
    tableName: '挂号信息表',
    odsNum: 326578,
    proNum: 326578,
    errorNum: 0,
    handleCode: 0
  },
  {
    id: '9',
    tableName: '住院诊断记录表',
    odsNum: 357348,
    proNum: 357348,
    errorNum: 0,
    handleCode: 0
  },
  {
    id: '10',
    tableName: '检验结果表',
    odsNum: 1248726,
    proNum: 1248726,
    errorNum: 0,
    handleCode: 0
  }
]

const handleCodeColorMap = {
  0: {
    text: 'green'
  },
  500: {
    text: 'red'
  }
}

export default {
  name: 'CheckManagement',
  components: {
    Remark,
    TagSelectOption,
    STable,
    Ellipsis,
    Detail
  },
  data () {
    return {
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
          title: '表名',
          dataIndex: 'tableName'
        },
        {
          title: '生产数据量',
          dataIndex: 'odsNum',
          width: '150px'
        },
        {
          title: '原始数据量',
          dataIndex: 'proNum',
          width: '150px'
        },
        {
          title: '失败数据量',
          dataIndex: 'errorNum',
          width: '150px'
        },
        {
          title: '操作',
          width: '150px',
          scopedSlots: { customRender: 'action' }
        },
        {
          title: '执行结果',
          dataIndex: 'handleCode',
          scopedSlots: { customRender: 'handleCode' }
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
  filters: {
    handleCodeColorFilter (type) {
      return handleCodeColorMap[type].text
    }
  },
  methods: {
    resetSearchForm () {
      this.queryParam = {
      }
    },
    showLogDetail (e) {
      // this.logDetail = ''
      // window.clearInterval(this.timeInterval)
      // this.logDetailVisible = true
      this.$refs.detail.modal()
    }
  }
}
</script>
