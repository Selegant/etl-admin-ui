<template>
  <a-modal
    :title="title"
    :width="1000"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <a-spin :spinning="confirmLoading">
      <j-form-container :disabled="disableSubmit">
        <a-form-model ref="form" :model="model" slot="detail" :rules="validatorRules">
          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="name"
            required
            label="项目名称">
            <a-input placeholder="项目名称" v-model="model.name"/>
          </a-form-model-item>
          <a-form-model-item
            v-if="visiblekey"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="userName"
            required
            label="所属用户">
            <a-input placeholder="所属用户" v-model="model.userName"/>
          </a-form-model-item>
          
          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="description"
            label="描述">
            <!-- <a-input placeholder="环境描述" v-model="model.description"/> -->
             <a-textarea
             v-model="model.description"
              rows="4"
              placeholder="请输入描述" />
          </a-form-model-item>
        </a-form-model>
      </j-form-container>
    </a-spin>

  </a-modal>
</template>

<script>
  import { addProject, updateProject  } from '@/api/dolphinscheduler'
  import _ from 'lodash'

  export default {
    name: 'ProjectModal',
    data() {
      return {
        name: '',
        disableSubmit: false,
        value: 1,
        title: '操作',
        visible: false,
        model: {},
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 }
        },
        confirmLoading: false,
        validatorRules: {
          userName: [
            { required: true, message: '请输入项目名称!' },
            // { validator: this.validateName }
            ],
          name: [
            { required: true, message: '请输入项目名称!' },
            // { validator: this.validateName }
            ]
        },
        editorOptions: {
          enableBasicAutocompletion: true,
          enableSnippets: true,
          enableLiveAutocompletion: true,
          tabSize:6,
          fontSize:12,
          showPrintMargin:false
        },
        visiblekey: false
      }
    },
    created() {
    },
    methods: {
      handleChange(value) {
        this.model.status = value
      },
      add() {
        this.edit({})
      },
      edit(record) {
        if (record.id) {
          this.visiblekey = true
        } else {
          this.visiblekey = false
        }
        this.model = Object.assign({}, record)
        console.log(this.model)
        this.visible = true
      },
      // 确定
      handleOk() {
        const that = this
        // 触发表单验证
        this.$refs.form.validate(valid => {
          if (valid) {
            console.log(this.model)
            let param = {
              projectName: _.trim(this.model.name),
              description: _.trim(this.model.description),
              userName: _.trim(this.model.userName)
            }
            that.confirmLoading = true
            let obj
            if (!this.model.id) {
              obj = addProject(param)
            } else {
              obj = updateProject(this.model.code, param)
            }
            obj.then((res) => {
              if (res.success) {
                that.$message.success(res.msg)
                that.$emit('ok')
              } else {
                that.$message.warning(res.msg)
              }
            }).finally(() => {
              that.confirmLoading = false
              that.close()
            })
          }else{
            return false;
          }
        })
      },
      // 关闭
      handleCancel() {
        this.close()
      },
      close() {
        this.$emit('close')
        this.visible = false
        this.$refs.form.resetFields();
      },
      /* editorInit: function () {
        require('brace/ext/language_tools') //language extension prerequsite...
        require('brace/ext/searchbox')
        require('brace/mode/text')
        require('brace/mode/html')
        require('brace/mode/javascript')    //language
        require('brace/mode/less')
        require('brace/theme/chrome')
        require('brace/snippets/javascript') //snippet
        require('brace/snippets/html')
      }, */
    }
  }
</script>

<style  lang="less">

.log {
  overflow-y: auto;
  height: 360px;
}
</style>