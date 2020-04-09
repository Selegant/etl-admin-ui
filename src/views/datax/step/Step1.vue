<template>
  <div style="margin: 40px auto 0;">
    <a-form :form="form">
      <a-row>
        <a-col
          :xs="6"
          :sm="6"
          :md="6"
          :lg="6"
          :xl="6">
          <a-row class="form-row" :gutter="8">
            <a-form-item
              label="原始数据源"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-select placeholder="请选择" @change="getOriginTables" v-decorator="['originDatasourceId', { rules: [{required: true, message: '原始数据源必选'}] }]">
                <a-select-option v-for="item in originDatasourceList" :key="item.id" :value="item.id">{{ item.datasourceName }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-row>
          <a-row class="form-row" :gutter="8">
            <a-form-item
              label="原始表"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-select placeholder="请选择" showSearch @change="getOriginColumns" v-decorator="['originTableName', { rules: [{required: true, message: '原始数据表必选'}] }]">
                <a-select-option v-for="item in originTableList" :key="item" :value="item">{{ item }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-row>
          <a-row class="form-row" :gutter="8">
            <a-form-item
              label="querySql"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-textarea v-decorator="['querySql', { rules: [{required: false}] }]"></a-textarea>
            </a-form-item>
          </a-row>
          <a-row class="form-row" :gutter="8">
            <div
              style="border: 1px solid #D5D5D5;padding: 10px;border-radius: 5px;height: 500px;overflow: auto;margin-bottom: 30px ">
              <a-checkbox
                :indeterminate="originIndeterminate"
                @change="originColumnsAllCheck"
                :checked="originCheckAll">
                全选
              </a-checkbox>
              <br/>
              <a-checkbox-group :options="originColumns" v-model="originCheckedList" @change="originCheck">
              </a-checkbox-group>
            </div>
          </a-row>
          <a-row class="form-row" :gutter="8">
            <a-form-item
              label="splitPk"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-input v-decorator="['splitPk', { rules: [{required: false}] }]"></a-input>
            </a-form-item>
          </a-row>
          <a-row class="form-row" :gutter="8">
            <a-form-item
              label="where"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-textarea v-decorator="['where', { rules: [{required: false}] }]"></a-textarea>
            </a-form-item>
          </a-row>
        </a-col>
        <a-col
          :xs="6"
          :sm="6"
          :md="6"
          :lg="6"
          :xl="6"
          :offset="2">
          <a-row class="form-row" :gutter="8">
            <a-form-item
              label="目标数据源"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-select placeholder="请选择" @change="getTargetTables" v-decorator="['targetDatasourceId', { rules: [{required: true, message: '目标数据源必选'}] }]">
                <a-select-option v-for="item in targetDatasourceList" :key="item.id" :value="item.id">{{ item.datasourceName }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-row>
          <a-row class="form-row" :gutter="8">
            <a-form-item
              label="目标表"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-select placeholder="请选择" showSearch @change="getTargetColumns" v-decorator="['targetTableName', { rules: [{required: true, message: '目标数据源必选'}] }]">
                <a-select-option v-for="item in targetTableList" :key="item" :value="item">{{ item }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-row>
          <a-row class="form-row" :gutter="8">
            <a-form-item
              label="preSql"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-textarea v-decorator="['preSql', { rules: [{required: false}] }]"></a-textarea>
            </a-form-item>
          </a-row>
          <a-row class="form-row" :gutter="8">
            <div
              style="border: 1px solid #D5D5D5;padding: 10px;border-radius: 5px;height: 500px;overflow: auto;margin-bottom: 30px">
              <a-checkbox
                :indeterminate="targetIndeterminate"
                @change="targetColumnsAllCheck"
                :checked="targetCheckAll">
                全选
              </a-checkbox>
              <br/>
              <a-checkbox-group :options="targetColumns" v-model="targetCheckedList" @change="targetCheck">
              </a-checkbox-group>
            </div>
          </a-row>
          <a-row class="form-row" :gutter="8">
            <a-form-item
              label="执行类型"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-select placeholder="请选择" v-decorator="['writeMode', { rules: [{required: true, message:'执行类型必选'}] }]">
                <a-select-option value="insert">insert</a-select-option>
                <a-select-option value="update">update</a-select-option>
                <a-select-option value="replace">replace</a-select-option>
              </a-select>
            </a-form-item>
          </a-row>
          <a-row class="form-row" :gutter="8">
            <a-form-item
              label="batchSize"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-input v-decorator="['batchSize', { rules: [{required: false}] }]"></a-input>
              <a-input style="display: none" v-decorator="['resultData', { rules: [{required: false}] }]"></a-input>
            </a-form-item>
          </a-row>
        </a-col>
        <a-col
          :xs="8"
          :sm="8"
          :md="8"
          :lg="8"
          :xl="8"
          :offset="2">
          <a-row class="form-row" :gutter="8">
            <div style="border: 1px solid #D5D5D5;padding: 10px;border-radius: 5px;height: 708px;overflow: auto ">
              <json-viewer :value="resultData" :expand-depth="4" copyable sort></json-viewer>
            </div>
          </a-row>
          <a-row class="form-row" :gutter="8" style="margin-top: 30px">
            <a-form-item :wrapperCol="{span: 19}">
              <a-button type="primary" @click="generateDataXJson">生成DataX JSON</a-button>
            </a-form-item>
          </a-row>
          <a-row class="form-row" :gutter="8">
            <a-form-item :wrapperCol="{span: 19}">
              <a-button type="primary" @click="nextStep">下一步</a-button>
            </a-form-item>
          </a-row>
        </a-col>
      </a-row>
      <a-divider/>
      <div class="step-form-style-desc">
        <h3>说明</h3>
        <h4>生成DataX执行参数</h4>
        <p>如果需要，这里可以放一些关于产品的常见问题说明。如果需要，这里可以放一些关于产品的常见问题说明。如果需要，这里可以放一些关于产品的常见问题说明。</p>
      </div>
    </a-form>
  </div>
</template>

<script>
import { dataXDatasourceList, getTables, getColumns, generateDataXJson } from '@/api/datax'
export default {
  name: 'Step1',
  data () {
    return {
      labelCol: { lg: { span: 7 }, sm: { span: 7 } },
      wrapperCol: { lg: { span: 17 }, sm: { span: 17 } },
      querySql: '',
      splitPk: '',
      where: '',
      preSql: '',
      batchSize: '',
      writeMode: '',
      originTableName: '',
      targetTableName: '',
      originDatasourceList: [],
      originTableList: [],
      originDatasource: '',
      originColumns: [],
      originCheckedList: [],
      originIndeterminate: true,
      originCheckAll: false,
      targetDatasourceList: [],
      targetTableList: [],
      targetDatasource: '',
      targetColumns: [],
      targetCheckedList: [],
      targetIndeterminate: true,
      targetCheckAll: false,
      form: this.$form.createForm(this),
      resultData: ''
    }
  },
  created () {
    this.init()
  },
  methods: {
    init () {
      dataXDatasourceList()
        .then(res => {
          if (res.code === 200) {
            this.originDatasourceList = res.data
            this.targetDatasourceList = res.data
          } else {
            this.$message.error(res.message)
          }
        })
    },
    getOriginTables (id) {
      getTables({ id: id }).then(res => {
        if (res.code === 200) {
          this.originTableList = res.data
        } else {
          this.$message.error(res.message)
        }
      })
    },
    getOriginColumns (tableName) {
      getColumns({ id: this.form.getFieldValue('originDatasourceId'), tableName: tableName }).then(res => {
        if (res.code === 200) {
          this.originColumns = res.data
        } else {
          this.$message.error(res.message)
        }
      })
    },
    originColumnsAllCheck (e) {
      Object.assign(this, {
        originCheckedList: e.target.checked ? this.originColumns : [],
        originIndeterminate: false,
        originCheckAll: e.target.checked
      })
    },
    originCheck () {
      this.originIndeterminate = !!this.originCheckedList.length && this.originCheckedList.length < this.originColumns.length
      this.originCheckAll = this.originCheckedList.length === this.originColumns.length
    },
    getTargetTables (id) {
      getTables({ id: id }).then(res => {
        if (res.code === 200) {
          this.targetTableList = res.data
        } else {
          this.$message.error(res.message)
        }
      })
    },
    getTargetColumns (tableName) {
      getColumns({ id: this.form.getFieldValue('targetDatasourceId'), tableName: tableName }).then(res => {
        if (res.code === 200) {
          this.targetColumns = res.data
        } else {
          this.$message.error(res.message)
        }
      })
    },
    targetColumnsAllCheck (e) {
      Object.assign(this, {
        targetCheckedList: e.target.checked ? this.targetColumns : [],
        targetIndeterminate: false,
        targetCheckAll: e.target.checked
      })
    },
    targetCheck () {
      this.targetIndeterminate = !!this.targetCheckedList.length && this.targetCheckedList.length < this.targetColumns.length
      this.targetCheckAll = this.targetCheckedList.length === this.targetColumns.length
    },
    generateDataXJson () {
      const { form: { validateFields } } = this
      // 先校验，通过表单校验后，才进入下一步
      validateFields((err, values) => {
        if (!err) {
          values.originColumns = this.originCheckedList
          values.targetColumns = this.targetCheckedList
          const that = this
          generateDataXJson(values).then(res => {
            if (res.code === 200) {
              this.resultData = JSON.parse(res.data)
              that.form.setFieldsValue({
                resultData: res.data
              })
            } else {
              this.$message.error(res.message)
            }
          })
        }
      })
      // const data = {
      //   querySql: this.querySql,
      //   splitPk: this.splitPk,
      //   where: this.where,
      //   preSql: this.preSql,
      //   batchSize: this.batchSize,
      //   writeMode: this.writeMode,
      //   originDatasourceId: this.originDatasource,
      //   targetDatasourceId: this.targetDatasource,
      //   originTableName: this.originTableName,
      //   targetTableName: this.targetTableName,
      //   originColumns: this.originCheckedList,
      //   targetColumns: this.targetCheckedList
      // }
    },
    nextStep () {
      const { form: { validateFields } } = this
      // 先校验，通过表单校验后，才进入下一步
      validateFields((err, values) => {
        if (!err) {
          console.log(values)
          this.$emit('nextStep', this.form.getFieldValue('resultData'))
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.ant-checkbox-group-item {
  width: 100%;
}
.step-form-style-desc {
  padding: 0 56px;
  color: rgba(0,0,0,.45);

  h3 {
    margin: 0 0 12px;
    color: rgba(0,0,0,.45);
    font-size: 16px;
    line-height: 32px;
  }

  h4 {
    margin: 0 0 4px;
    color: rgba(0,0,0,.45);
    font-size: 14px;
    line-height: 22px;
  }

  p {
    margin-top: 0;
    margin-bottom: 12px;
    line-height: 22px;
  }

}
</style>
