<template>
  <n-modal
    v-model:show="visible"
    :mask-closable="false"
    preset="dialog"
    :title="modalTitle"
    :show-icon="false"
    :on-close="close"
  >
    <n-form
      ref="formRef"
      :model="model"
      :rules="rules"
      label-placement="left"
      label-width="121"
      require-mark-placement="right-hanging"
      size="medium"
      :disabled="formDisabled"
    >
      <n-form-item label="数据源英文名称" path="dbKey">
        <n-input v-model:value="model.dbKey" placeholder="请输入数据源英文名称" />
      </n-form-item>
      <n-form-item label="数据源中文名称" path="dbZhName">
        <n-input v-model:value="model.dbZhName" placeholder="请输入数据源中文名称" />
      </n-form-item>
      <n-form-item label="数据库类型" path="dbType">
        <n-select
          v-model:value="model.dbType"
          placeholder="请选择数据库类型"
          :options="dataSourceTypeOptions"
          @update:value="dbtypechange"
        />
      </n-form-item>
      <n-form-item label="Host" path="host">
        <n-input v-model:value="model.host" placeholder="请输入数据库Host" />
      </n-form-item>
      <n-form-item label="Port" path="port">
        <n-input v-model:value="model.port" placeholder="请输入数据库端口号" />
      </n-form-item>
      <n-form-item label="JDBC_URL" path="jdbcUrl">
        <n-input v-model:value="model.jdbcUrl" placeholder="请输入数据库连接地址" />
      </n-form-item>
      <n-form-item label="驱动类型" path="driverClassName">
        <n-select v-model:value="model.driverClassName" placeholder="请选择驱动类型" :options="driverTypeOptions" />
      </n-form-item>
      <n-form-item label="连接池类型" path="dataSourceClassName">
        <n-select
          v-model:value="model.dataSourceClassName"
          placeholder="请选择连接池类型"
          :options="dataSourceClassOptions"
        />
      </n-form-item>
      <n-form-item v-if="model.dbType == 'ORACLE' || model.dbType == 'SQLSERVER'" label="服务名" path="serverName">
        <n-input v-model:value="model.serverName" placeholder="请输入数据库服务名" />
      </n-form-item>
      <n-form-item
        v-if="model.dbType === 'MYSQL' || model.dbType == 'SQLSERVER' || model.dbType == 'STARROCKS'"
        label="Database"
        path="dbName"
      >
        <n-input v-model:value="model.dbName" placeholder="请输入数据库名" />
      </n-form-item>
      <n-form-item v-if="model.dbType == 'STARROCKS'" label="FE节点地址" path="feUrls">
        <n-input
          v-model:value="model.feUrls"
          type="textarea"
          placeholder="请输入FE节点地址"
          :autosize="{
            minRows: 4,
            maxRows: 8
          }"
        />
      </n-form-item>
      <n-form-item label="用户名" path="username">
        <n-input v-model:value="model.username" placeholder="请输入用户名" />
      </n-form-item>
      <n-form-item label="密码" path="password">
        <n-input v-model:value="model.password" type="password" show-password-on="click" placeholder="请输入密码" />
      </n-form-item>
      <n-form-item label="备注" path="remark">
        <n-input v-model:value="model.remark" placeholder="请输入备注" />
      </n-form-item>
    </n-form>
    <template v-if="Type !== 3" #action>
      <div class="flex-center w-full">
        <n-button type="warning" class="mr-16px min-w-100px" :loading="testloading" @click="connection">
          测试连接
        </n-button>
        <n-button type="warning" ghost class="mr-16px min-w-100px" :loading="submitloading" @click="handleSubmit">
          提交
        </n-button>
        <n-button ghost class="min-w-100px" @click="close">取消</n-button>
      </div>
    </template>
  </n-modal>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import type { FormInst, FormRules } from 'naive-ui';
import { request } from '@/service/request';
interface Emits {
  (e: 'close'): void;
}
const emit = defineEmits<Emits>();
const formRef = ref<FormInst | null>(null);
const visible = ref<boolean>(false);
const testloading = ref<boolean>(false);
const submitloading = ref<boolean>(false);
const formDisabled = ref<boolean>(false);
const modalTitle = ref<string>('');
const Type = ref<number>();
let model = reactive({
  id: '',
  dbKey: '',
  dbType: '',
  host: '',
  port: '',
  serverName: '',
  dbName: '',
  feUrls: '',
  username: '',
  password: '',
  remark: '',
  dbZhName: '',
  jdbcUrl: '',
  driverClassName: undefined,
  dataSourceClassName: undefined
});
const rules = reactive<FormRules>({
  dbKey: [{ required: true, trigger: 'blur', message: '请输入数据源英文名称!' }],
  dbZhName: [{ required: true, trigger: 'blur', message: '请输入数据源中文名称!' }],
  dbType: [{ required: true, trigger: 'blur', message: '请选择数据库类型!' }],
  host: [{ required: true, trigger: 'blur', message: '请输入数据库Host!' }],
  port: [{ required: true, trigger: 'blur', message: '请输入数据库端口号!' }],
  jdbcUrl: [{ required: true, message: '请重新输入数据库地址!' }],
  driverClassName: [{ required: true, message: '请选择驱动类型' }],
  dataSourceClassName: [{ required: true, message: '请选择连接池类型' }],
  dbName: [{ required: true, trigger: 'blur', message: '请输入数据库名!' }],
  serverName: [{ required: true, trigger: 'blur', message: '请输入服务名!' }],
  username: [{ required: true, trigger: 'blur', message: '请输入用户名!' }],
  password: [{ required: true, trigger: 'blur', message: '请输入密码!' }],
  feUrls: [{ required: true, trigger: 'blur', message: '请输入FE节点地址!' }]
});
const dataSourceTypeOptions = ['MYSQL', 'ORACLE', 'SQLSERVER', 'STARROCKS'].map(v => ({
  label: v,
  value: v
}));
const driverTypeOptions = [
  'com.mysql.jdbc.Driver',
  'com.mysql.cj.jdbc.Driver',
  'oracle.jdbc.driver.OracleDriver',
  'com.microsoft.sqlserver.jdbc.SQLServerDriver'
].map(v => ({
  label: v,
  value: v
}));
const dataSourceClassOptions = [
  'com.zaxxer.hikari.HikariDataSource',
  'com.alibaba.druid.pool.DruidDataSource',
  'org.apache.tomcat.jdbc.pool.DataSource',
  'org.apache.commons.dbcp2.BasicDataSource'
].map(v => ({
  label: v,
  value: v
}));
function open(record: any, type: number) {
  // type:1新增 2编辑 3详情
  Type.value = type;
  modalTitle.value = type === 1 ? '新增' : type === 2 ? '编辑' : '详情';
  visible.value = true;
  formDisabled.value = type === 3;
  model = reactive({ ...record });
}
function dbtypechange(v: any) {
  model.serverName = v === 'SQLSERVER' ? 'dbo' : '';
}
function connection() {
  formRef.value?.validate(async errors => {
    if (!errors) {
      testloading.value = true;
      request
        .post(`/data/datasource/test`, model)
        .then(res => {
          if (!res.error) {
            window.$message?.success('测试成功');
          }
          console.log(res, '测试结果');
        })
        .finally(() => {
          testloading.value = false;
        });
    }
  });
}
function handleSubmit() {
  // 触发表单验证
  formRef.value?.validate(errors => {
    if (!errors) {
      submitloading.value = true;
      request
        .post(`/data/datasource/save`, model)
        .then(res => {
          if (!res.error) {
            window.$message?.success('提交成功');
            emit('close');
            close();
          }
        })
        .finally(() => {
          submitloading.value = false;
        });
    }
  });
}
function close() {
  visible.value = false;
}
defineExpose({
  open,
  formDisabled
});
</script>

<style lang="scss" scoped></style>
