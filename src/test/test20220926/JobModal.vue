<template>
  <div>
    <j-modal
      width="80%"
      :title="title"
      :visible.sync="editModalVisible"
      :fullscreen.sync="fullscreen"
      :switch-fullscreen="switchFullscreen"
      @cancel="handleCancleDbSync"
      :destroyOnClose="true"
    >
      <template slot="footer">
        <a-button @click="handleCancleDbSync">
          关闭
        </a-button>
        <a-button v-if="!isDetail" type="primary" :loading="syncLoading" @click="handleDbSync" >确定</a-button>
      </template>
      <div class="table-page-search-wrapper warp" :style="{maxHeight:fullscreen?'779px':'588px'}">
        <a-form-model ref="ruleForm" :model="formData" :rules="isDetail?{}:rules" :label-col="labelCol" :wrapper-col="wrapperCol">
          <div style="display: flex;justify-content: center">
            <div style="width: 800px;">
              <a-form-model-item  label="数据源" :labelCol="labelCol" prop="oriDatasourceId">
                <a-select placeholder="请选择数据源" @change="(v)=>updateOriginal(v,1)" v-model="formData.oriDatasourceId" :getPopupContainer="node => node.parentNode">
                <a-icon type="caret-down" slot="suffixIcon" />
                  <a-select-option v-for="item in targetList" :key="item.id" :value="item.id">
                    {{ item.dataSourceName }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
<!--              <a-row>-->
<!--                <a-col :span="18">-->
                  <a-form-model-item  label="表" prop="oriTableName" :labelCol="labelCol" :wrapper-col="{span:14}">
                    <div style="display:flex;justify-content: space-around">
                      <a-select  placeholder="请选择需要清洗的表" show-search
                                 :filter-option="filterOption"  v-model="formData.oriTableName" @change="updateoriTableName" :getPopupContainer="node => node.parentNode">
                                 <a-icon type="caret-down" slot="suffixIcon" />
                        <a-select-option v-for="item in targetTableListOne" :key="item" :value="item">{{
                            item
                          }}
                        </a-select-option>
                      </a-select>

                      <a-button style="margin-left: 50px"  type="primary"  @click.prevent="importModel" >导入</a-button>
                    </div>
                  </a-form-model-item>
<!--                </a-col>-->
<!--                <a-col :span="2" :offset="1">-->

<!--                </a-col>-->
<!--              </a-row>-->
              <a-form-model-item label="计划名称" :labelCol="labelCol" prop="jobName">
                <a-input v-model="formData.jobName" placeholder="请输入计划名称"/>
              </a-form-model-item>
              <a-form-model-item label="计划描述" :labelCol="labelCol" prop="jobDesc">
                <span v-if="isDetail">{{formData.jobDesc}}</span>
                <a-textarea v-else v-model="formData.jobDesc" placeholder="请输入计划描述" allow-clear :auto-size="{ minRows: 3, maxRows: 5 }" />
              </a-form-model-item>
            </div>
            <div style="width: 800px;">
              <a-form-model-item  label="目标数据源" :labelCol="labelCol"  prop="tarDatasourceId">
                <a-select placeholder="请选择数据源" @change="(v)=>updateOriginal(v,2)" v-model="formData.tarDatasourceId" :getPopupContainer="node => node.parentNode">
                <a-icon type="caret-down" slot="suffixIcon" />
                  <a-select-option v-for="item in targetList" :key="item.id" :value="item.id">
                    {{ item.dataSourceName }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
              <a-form-model-item  label="目标表" prop="tarTableName" :label-col="labelCol" :wrapper-col="{span:14}">
                <a-select  placeholder="请选择需要清洗的表" show-search @change="updateTarTable"
                           :filter-option="filterOption"  v-model="formData.tarTableName" :getPopupContainer="node => node.parentNode">
                           <a-icon type="caret-down" slot="suffixIcon" />
                  <a-select-option v-for="item in targetTableListTwo" :key="item" :value="item">{{
                      item
                    }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
              <a-form-model-item  label="清洗主键" prop="cleanPrimaryKey" :label-col="labelCol" :wrapper-col="{span:14}">
                <a-select  placeholder="请选择需要清洗的表" show-search
                           :filter-option="filterOption"  v-model="formData.cleanPrimaryKey" :getPopupContainer="node => node.parentNode">
                           <a-icon type="caret-down" slot="suffixIcon" />
                  <a-select-option v-for="(item,index) in targetTableColumns" :key="index" :value="item.columnName">{{
                      item.columnName
                    }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
              <div style="display:flex;width:100%;">
                <a-form-model-item style="width:50%;"  label="增量清洗开始时间" prop="incCleanTime" :label-col="{span:8}" :wrapper-col="{span:10}">
                  <a-date-picker v-model="formData.incCleanTime" :show-time="{ format: 'HH:mm' }" format="YYYY-MM-DD HH:mm" valueFormat="YYYY-MM-DD HH:mm:ss">
                  </a-date-picker>
                </a-form-model-item>
                 <a-form-model-item style="width:50%;"  label="增量清洗截至时间" prop="incEndTime" :label-col="{span:8}" :wrapper-col="{span:10}">
                  <a-date-picker  v-model="formData.incEndTime" :show-time="{ format: 'HH:mm' }" format="YYYY-MM-DD HH:mm" valueFormat="YYYY-MM-DD HH:mm:ss">
                  </a-date-picker>
                </a-form-model-item>
              </div>
              <div style="display: flex;">
                <!--<div style="width: 265px">
                  <a-form-model-item  label="清洗天数" prop="cleanDays" :label-col="{ span: 12 }" :wrapper-col="{span:12}">
                    <a-input-number  v-model="formData.cleanDays" :min="0" :max="100"></a-input-number>
                  </a-form-model-item>
                </div>-->
                <div style="width: 250px">
                  <a-form-model-item  label="清洗并行度" prop="scanPartitionNum" :label-col="{ span: 12 }" :wrapper-col="{span:12}">
                    <a-input-number  v-model="formData.scanPartitionNum" :min="1" :max="100"></a-input-number>
                  </a-form-model-item>
                </div>
              </div>
            </div>
          </div>

          <a-tabs defaultActiveKey="1" type="card">
            <a-tab-pane key="1" tab="字段信息">
              <!-- 数据字段 -->
              <div class="table-operator">
                <p class="title">数据字段：</p>
                <div v-if="!isDetail">
                  <a-button type="link" v-if="dataSelectedRowKeys.length" icon="minus" @click="handleRemoveModelFields('dataSelectedRowKeys','modelFields')">删除</a-button>
                </div>
              </div>
              <a-table
                style="margin-bottom:20px;"
                size="middle"
                bordered
                :rowKey="(record, index) => index"
                :columns="columns"
                :data-source="formData.columnsList"
                :pagination="false"
              >
                <div slot="primaryFlag" slot-scope="text, record">
                  <span v-if="text" style="color: #00DB00;font-weight:bolder">是</span>
                  <span v-else>否</span>
                </div>
                <div slot="cleanFlag" slot-scope="text, record">
                  <span v-if="text" style="color: #00DB00;font-weight:bolder">是</span>
                  <span v-else>否</span>
                </div>
                <div slot="cleanMethod" slot-scope="text, record">
                  <span v-if="text">{{ text }}</span>
                  <span v-else>-</span>
                </div>
                <div slot="fieldName" slot-scope="text, record">
                  <span v-if="isDetail">{{text}}</span>
                  <a-input
                    v-else
                    style="margin: -5px 0"
                    :value="text"
                    v-model="record['fieldName']"
                  />
                </div>
                <div slot="fieldTypeName" slot-scope="text, record">
                  <span v-if="isDetail">{{text}}</span>
                  <a-select v-else show-search v-model="record.fieldTypeName" :getPopupContainer="node => node.parentNode">
                  <a-icon type="caret-down" slot="suffixIcon" />
                    <a-select-option v-for="(type,index) in dataTypes" :key="index" :value="type">
                      {{type}}
                    </a-select-option>
                  </a-select>
                </div>
                <div slot="scanColumnKeyFlag" slot-scope="text,record">
                  <a-checkbox v-if="checkShowScan(record)" :disabled="isDetail" :checked="record['scanColumnKeyFlag']" @change="checkboxChange(record,'scanColumnKeyFlag')" style="margin: -5px 0"></a-checkbox>
                  <span v-else>-</span>
                </div>
                <div slot="remark" slot-scope="text, record">
                  <span v-if="isDetail">{{text}}</span>
                  <a-input
                    v-else
                    style="margin: -5px 0"
                    :value="text"
                    v-model="record['remark']"
                  />
                </div>
                <div slot="length" slot-scope="text, record, index">
                  <span v-if="isDetail">{{text}}</span>
                  <a-form-model-item class="length-form-item" v-else :prop="'modelFields.' + index + '.length'" :rules="{required: true,message: '请输入长度',trigger: 'change'}" :wrapper-col="{span:21}">
                    <a-input v-if="record.fieldTypeName === 'DECIMAL'" type="text" style="margin: -5px 0" v-model="record.length" />
                    <a-input v-else type="number" style="margin: -5px 0" v-model.number="record['length']" ></a-input>
                  </a-form-model-item>
                </div>
              </a-table>
            </a-tab-pane>
          </a-tabs>
        </a-form-model>
      </div>
    </j-modal>
  </div>
</template>
<script>
import {
  getDataModuleDetail,
  getDataSourceList,
  getDataSourceTables,
  getModalByDDL,
  getDataTypes,
  generateCleanColumns, getTableColumns, getCleanColumnsByJobId
} from '@/api/api'
import { postAction, putAction, getAction } from '@/api/manage'
import { validateSome } from "@/utils/util"
export default {
  name: "data-cleaning-job-modal",
  data() {
    return {
      tmpRealTime: false,
      editFlag: false,
      accumulation:'',
      dataTypes:[],
      isImport:true,
      targetTableListOne:[],
      targetTableListTwo:[],
      targetList:[],
      targetTableColumns:[],
      isDetail:false,
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      editModalVisible: false,
      title: '编辑',
      syncLoading: false,
      fullscreen: true,
      switchFullscreen: true,
      dataSelectedRowKeys: [],
      partitionsSelectedRowKeys:[],
      tblPropertiesSelRowKeys:[],
      projectCode: '',
      scanColumnKey: '',
      columns: [
        {
          title: '字段名称',
          align: 'center',
          width: '15%',
          dataIndex: 'columnName',
          // scopedSlots: { customRender: 'fieldName' }
        },
        {
          title: '是否需要清洗',
          align: 'center',
          width: '12%',
          dataIndex: 'isClean',
          scopedSlots: { customRender: 'cleanFlag' }
        },
        {
          title: '清洗方法',
          align: 'center',
          dataIndex: 'cleanMethod',
          width: '15%',
          scopedSlots: { customRender: 'cleanMethod' }
        },
        {
          title: '主键',
          align: 'center',
          dataIndex: 'isPaimary',
          width: '12%',
          scopedSlots: { customRender: 'primaryFlag' }
        },
        // 暂时只支持INT与时间类型
        {
          title: '分区清洗字段',
          align: 'center',
          dataIndex: 'scanColumnKeyFlag',
          width: '12%',
          scopedSlots: { customRender: 'scanColumnKeyFlag' }
        },
        {
          title: '描述',
          align: 'center',
          dataIndex: 'columnDesc',
          // scopedSlots: { customRender: 'remark' }
        }
      ],
      url: {
        edit: '/dataCleaning/saveCleanJob',
        add: '/dataCleaning/saveCleanJob'
      },
      rules: {
        jobName: [
          { required: true, message: '请输入计划名称', trigger: 'change' }
        ],
        oriDatasourceId: [
          { required: true, message: '请选择数据源', trigger: 'change' }
        ],
        tarDatasourceId: [
          { required: true, message: '请选择目标数据源', trigger: 'change' }
        ],
        oriTableName: [
          { required: true, message: '请选择需要清洗的表', trigger: 'change' }
        ],
        tarTableName: [
          { required: true, message: '请选择需要清洗的表', trigger: 'change' }
        ],
        cleanPrimaryKey:[
          { required: true, message: '请选择清洗主键', trigger: 'change' }
        ]
      },
      tblPropertiesOneData:[
        {propertyName:'row format自定义',value:'',remark:''},
        {propertyName:'store as自定义',value:'',remark:''},
        {propertyName:'location自定义',value:'',remark:''},
      ],
      formData: {
        scanPartitionNum: 1,
        scanColumnKey: '',
        jobName: '',
        incCleanTime: '',
        incEndTime:'',
        cleanPrimaryKey: '',
        oriDatasourceId:null,
        oriTableName:'',
        tarDatasourceId:null,
        tarTableName:'',
        modelName:'',
        remark:'',
        columnsList:[],
        modelPartitions:[],
        tblProperties:[],
        folderId:null,
        id:null,
        importType:1,
        sql:'',
        dbType:'',
        isExternal:false,
        isRealTime:false,
        rowFormat:'',
        fileFormat:'',
        location:'',
        projectCode: '',
        cleanDays: ''
      },
      newModelFieldsData: {
        fieldName:'',
        fieldTypeName:'',
        remark:'',
        primarykeyFlag:true,
        length:255
      },
      newModelPartitionsData:{
        partitionName:'',
        partitionType:'',
        remark:'',
        length:255
      },
      newTblProperties:{
        propertyName: "",
        propertyValue: "",
        remark: ""
      },
    }
  },
  watch: {
    editModalVisible(newVal){
      if(newVal){
        getDataTypes('HIVE').then((res)=>{
          this.dataTypes=res.result
        })
      }
    }
  },
  mounted() {

  },
  methods: {
    tblPropertiesOneValueHandle(index){
      switch(index){
        case 0: return this.formData.rowFormat
        case 1: return this.formData.fileFormat
        case 2: return this.formData.location
      }
    },
    importTypeChange(){
      let {folderId,importType} = this.formData
      this.formData=this.$options.data().formData
      this.formData={
        ...this.formData,
        folderId,
        importType
      }
    },
    ddlImport(){
      const valiSome = ['sql','dbType']
      const that = this
      const validFlag= validateSome('ruleForm',valiSome,that)
      if(validFlag){
        let {folderId,sql,dbType}=this.formData
        let params={
          folderId,
          sql,
          dbType
        }
        getModalByDDL(params).then(res=>{
          if(res.success){
            this.formData = {
              ...this.formData,
              ...res.result
            }
          }else{
            this.$message.warning(res.message)
          }
        })
      }
    },
    importModel(){
      const valiSome = ['source','tableName']
      const that = this
      const validFlag= validateSome('ruleForm',valiSome,that)
      if(validFlag){
        console.log(this.formData)
        let {oriDatasourceId,oriTableName,isRealTime,isExternal}=this.formData
        let params={
          oriDatasourceId,
          oriTableName,
          isRealTime,
          isExternal
        }
        console.log(params)
        generateCleanColumns(params).then(res=>{
          if(res.success){
            this.formData.columnsList = res.result
            this.formData.jobName = 'clean_'+this.formData.oriTableName
            // this.formData = {
            //   ...this.formData,
            //   ...res.result
            // }
            // this.formData.isRealTime = params.isRealTime
            // this.formData.isExternal = params.isExternal
          }else{
            this.$message.warning(res.message)
          }
        })
      }
    },
    updateOriginal(v,type,isclean=true) {
      console.log(isclean,'isclean');
      var idType
      // type:1 数据源改变  2:目标数据源改变 
      // isclean:是否清空
      this.formData.source = v
      if(type==1){
        if(isclean){
          this.formData.columnsList = []
          this.formData.jobDesc = ''
          this.formData.jobName = ''
          this.formData.oriTableName = ''
          this.targetTableListOne=[]
        }
        idType = v+'-0'
      }
      if(type==2){
        if(isclean){
          this.formData.tarTableName = ''
          this.targetTableListTwo = []
          this.formData.cleanPrimaryKey = ''
          this.targetTableColumns = []
        }
        idType = v+'-1'
      }
      this.formData.tableName = ''
      const that = this
      getDataSourceTables(idType).then((res) => {
        if (res.success) {
          if(type==1){
            that.targetTableListOne = res.result
          }
          if(type==2){
            that.targetTableListTwo = res.result
          }
        }
      })
    },
    updateoriTableName(){
      this.formData.columnsList = []
      this.formData.jobDesc = ''
      this.formData.jobName = ''
    },
    updateTarTable(v){
      this.formData.cleanPrimaryKey = ''
      this.targetTableColumns = []
      const params = {
        'id': this.formData.tarDatasourceId,
        'tableName': v
      }
      getTableColumns(params).then((res) => {
        if (res.success) {
          this.targetTableColumns = res.result
        }
      })
    },
    getTargetList(){
      getDataSourceList({purpose:2}).then(res=>{
        this.targetList=res.result || []
      })
    },
    handleCancleDbSync() { // 关闭
      this.formData = this.$options.data().formData
      this.isImport = false
      this.isDetail = false
      this.editModalVisible = false
    },
    edit(record) {
      this.projectCode = record.projectCode
      this.editModalVisible = true
      this.editFlag = true
      if(record.cleanMode===0){
        record.incCleanTime = ''
        record.incEndTime = ''
        record.cleanDays = ''
      }else if(record.cleanMode===1){
        record.cleanDays = ''
      }else if(record.cleanMode===2){
        record.incCleanTime = ''
        record.incEndTime = ''
      }
      this.formData = {
        jobName: record.jobName,
        incCleanTime: record.incCleanTime,
        incEndTime: record.incEndTime,
        cleanPrimaryKey: record.cleanPrimaryKey,
        oriDatasourceId:record.oriDatasourceId,
        oriTableName:record.oriTableName,
        tarDatasourceId:record.tarDatasourceId,
        tarTableName:record.tarTableName,
        id:record.id,
        projectCode: record.projectCode,
        columnsList: [],
        scanColumnKey: record.scanColumnKey,
        scanPartitionNum: record.scanPartitionNum || 1,
        cleanDays: record.cleanDays
      }
      this.getTargetList()
      this.updateOriginal(record.oriDatasourceId,1,false)
      this.updateOriginal(record.tarDatasourceId,2,false)
      getCleanColumnsByJobId({jobId:record.id}).then((res) => {
        this.formData.columnsList = res.result
        console.log(111111)
        console.log(this.formData.columnsList)
      })
    },
    add(projectCode) {
      this.projectCode = projectCode
      this.editFlag = false
      this.editModalVisible = true
      this.getTargetList()
    },
    getCleanColumns(){
      this.$nextTick(()=>{
        getCleanColumnsByJobId({jobId:this.formData.id}).then((res) => {
          this.formData.columnsList = res.result
          console.log(111111)
          console.log(this.formData.columnsList)
        })
      })
    },
    async handleDbSync() { // 弹窗点击确定
      const valid = await this.$refs['ruleForm'].validate()
      if (valid) {
        this.updateData()
      }
    },
    updateData() { // 保存提交数据
      console.log(this.formData.id);

      if(this.formData.incCleanTime&&this.formData.cleanDays){
        this.$message.warning("增量开始时间和天数不可以同时设置")
        return
      }
      if(!this.formData.scanColumnKey){
        this.$message.warning("请选择分区字段")
        return
      }
      if((this.formData.incCleanTime&&!this.formData.incEndTime)||(!this.formData.incCleanTime&&this.formData.incEndTime)){
        this.$message.warning("增量开始时间和增量结束时间需同步存在与否")
        return
      }
      this.syncLoading = true
      const fun = (res) => {
        if (res.success) {
          this.$message.success(res.message)
          this.handleCancleDbSync()
          this.$emit('modalFormOk')
        } else {
          this.$message.warning(res.message)
        }
      }
      const params = {
        ...this.formData,
        columnsList:this.formData.columnsList,
        projectCode: this.projectCode
      }
      if (this.formData.id) {
        //编辑数据模型
        postAction(this.url.edit, params).then(
          fun
        ).finally(() => {
          this.syncLoading = false
        })
      } else {
        //新增数据模型
        postAction(this.url.add, params).then(
          fun
        ).finally(() => {
          this.syncLoading = false
        })
      }
    },
    handleAddModelPartitions() { // 新增分区字段
      const newData = {...this.newModelPartitionsData}
      this.formData.modelPartitions.push(newData)
    },
    handleAddTblProperties() { // 新增分区字段
      const newData = {...this.newTblProperties}
      this.formData.tblProperties.push(newData)
    },
    handleAddModelFields() { // 新增数据字段
      const newData = {...this.newModelFieldsData}
      this.formData.columnsList.push(newData)
    },

    handleRemoveModelFields(rowKeysName,modelName) { // 删除数据字段
      var that = this
      this[rowKeysName].sort(function(a, b) { return b - a })
      this[rowKeysName].forEach(function(index) {
        that.formData[modelName].splice(index, 1)
      })
      this[rowKeysName] = []
    },
    onPartitionsSelectChange(partitionsSelectedRowKeys){
      this.partitionsSelectedRowKeys = partitionsSelectedRowKeys
    },
    ontblPropertiesSelectChange(tblPropertiesSelRowKeys){
      this.tblPropertiesSelRowKeys = tblPropertiesSelRowKeys
    },
    onDataSelectChange(dataSelectedRowKeys) {
      this.dataSelectedRowKeys = dataSelectedRowKeys
    },
    checkboxChange(data, name) {
      // data[name] = !data[name]
      this.formData.columnsList.forEach((record,index)=>{
        if(record.columnName===data.columnName){
          if(data.columnName===this.formData.scanColumnKey){
            this.formData.scanColumnKey = ''
            record[name] = false;
          }else {
            this.formData.scanColumnKey = data.columnName
            record[name] = true;
          }
        }else {
          record[name] = false;
        }
      })
    },
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    },
    selectDetailTable(e){
      console.log(e.target.checked)
      if(e.target.checked===true){
        this.formData.isExternal = true
      }else {
        this.formData.isExternal = false
      }
      if(!this.tmpRealTime){
        this.importModel()
      }
    },
    checkShowScan(record){
      if(record.columnType==='INT'||record.columnType==='DATETIME'||record.columnType==='int'||record.columnType==='datetime'){
        return true
      } else {
        return false
      }
    }
  }
}
</script>
<style lang="less" scoped>
.model-name{
  display: flex;
  align-items: center;
}
.warp .ant-select{
  width: 100%;
}
.ddl-style{
  text-align: right;
  margin-bottom: 24px;
}
.warp .table-operator{
  //   margin-bottom: 10px;
  display:flex;
  justify-content: space-between;
  line-height:35px;
  .title{
    margin-bottom:0;
  }
}
.ant-card-body .warp {
  padding: 10px;
}
.warp .table-operator .ant-btn{
  margin: 0px 8px 0 0 !important;
}
.ant-card-body .warp .table-operator{
  margin-bottom:10px !important;
}
// /deep/ .ant-tabs.ant-tabs-card .ant-tabs-card-bar .ant-tabs-tab-active{
//     border-top: 3px solid #1890FF;
// }
/deep/ .length-form-item.ant-form-item{
  margin-bottom:0 !important;
}
.table-page-search-wrapper{
  overflow:auto;
}
</style>
<style scoped>
@import '~@assets/less/common.less'
</style>
