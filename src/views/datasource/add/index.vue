<template>
  <div class="h-full overflow-hidden">
    <n-card :title="(route.query.metaTitle as string)" class="h-full shadow-sm rounded-16px">
      <template #header>
        <child-card-title @back="close"></child-card-title>
      </template>
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
        <n-form-item label="额外参数" path=" jdbcAttributes">
          <n-input v-model:value="model.jdbcAttributes" placeholder="请输入额外参数" />
        </n-form-item>
        <n-form-item v-if="model.dbType == 'ORACLE' || model.dbType == 'SQLSERVER'" label="服务名" path="serverName">
          <n-input v-model:value="model.serverName" placeholder="请输入数据库服务名" />
        </n-form-item>
        <n-form-item label="Database" path="dbName">
          <n-input v-model:value="model.dbName" placeholder="请输入数据库名" />
        </n-form-item>
        <n-form-item label="JDBC_URL" path="jdbcUrl">
          <n-input
            v-model:value="model.jdbcUrl"
            :disabled="true"
            type="textarea"
            :autosize="{
              minRows: 4,
              maxRows: 8
            }"
            placeholder="请输入数据库连接地址"
          />
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
        <n-form-item label="连接池类型" path="dataSourceClassName">
          <n-select
            v-model:value="model.dataSourceClassName"
            placeholder="请选择连接池类型"
            :options="dataSourceClassOptions"
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
          <!-- <n-button ghost class="min-w-100px" @click="close">返回</n-button> -->
        </div>
      </template>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { FormInst, FormRules } from 'naive-ui';
import { useRouterPush } from '@/composables';
import { request } from '@/service/request';
const { routerPush } = useRouterPush();
const route = useRoute();
const formRef = ref<FormInst | null>(null);
const testloading = ref<boolean>(false);
const submitloading = ref<boolean>(false);
const formDisabled = ref<boolean>(false);
// const modalTitle = ref<string>('');
const Type = ref<number>();

const createFormData = () => ({
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
  jdbcAttributes: '',
  driverClassName: '',
  dataSourceClassName: undefined
});
const model = reactive(createFormData());
watch(
  [
    () => model.dbType,
    () => model.host,
    () => model.port,
    () => model.dbName,
    () => model.jdbcAttributes,
    () => model.serverName
  ],
  ([dbType, host, port, dbName, jdbcAttributes, serverName]) => {
    if (dbType === 'SQLSERVER') {
      model.jdbcUrl = `jdbc:sqlserver://${host}:${port};databaseName=${dbName}${
        jdbcAttributes ? `?${jdbcAttributes}` : ''
      }`;
    } else if (dbType === 'ORACLE') {
      model.jdbcUrl = `jdbc:oracle:thin:@${host}:${port}/${serverName}${jdbcAttributes ? `?${jdbcAttributes}` : ''}`;
    } else if (dbType === 'MYSQL' || dbType === 'STARROCKS') {
      model.jdbcUrl = `jdbc:mysql://${host}:${port}/${dbName}${jdbcAttributes ? `?${jdbcAttributes}` : ''}`;
    } else {
      model.jdbcUrl = '';
    }
  }
);
const rules = reactive<FormRules>({
  dbKey: [{ required: true, trigger: 'blur', message: '请输入数据源英文名称!' }],
  dbZhName: [{ required: true, trigger: 'blur', message: '请输入数据源中文名称!' }],
  dbType: [{ required: true, trigger: 'blur', message: '请选择数据库类型!' }],
  host: [{ required: true, trigger: 'blur', message: '请输入数据库Host!' }],
  port: [{ required: true, trigger: 'blur', message: '请输入数据库端口号!' }],
  jdbcUrl: [{ required: true, message: '数据库地址不能为空!' }],
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
const dataSourceClassOptions = [
  'com.zaxxer.hikari.HikariDataSource',
  'com.alibaba.druid.pool.DruidDataSource'
  // 'org.apache.tomcat.jdbc.pool.DataSource',
  // 'org.apache.commons.dbcp2.BasicDataSource'
].map(v => ({
  label: v,
  value: v
}));
function dbtypechange(v: any) {
  model.serverName = v === 'SQLSERVER' ? 'dbo' : '';
  model.driverClassName =
    v === 'MYSQL' || v === 'STARROCKS'
      ? 'com.mysql.jdbc.Driver'
      : v === 'ORACLE'
      ? 'oracle.jdbc.driver.OracleDriver'
      : v === 'SQLSERVER'
      ? 'com.microsoft.sqlserver.jdbc.SQLServerDriver'
      : '';
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
  Object.assign(model, createFormData());
  routerPush({ name: 'datasource' });
}
onMounted(() => {
  const type = route.query.type ? Number(route.query.type) : 1;
  const currentItem = route.query.record ? JSON.parse(route.query.record) : {};
  Type.value = type;
  formDisabled.value = type === 3;
  // model = reactive({ ...currentItem });
  Object.assign(model, currentItem);
});
</script>

<style lang="scss" scoped>
:deep(.n-card__content) {
  height: 100% !important;
  overflow: auto;
}
</style>
