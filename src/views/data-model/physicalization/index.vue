<template>
  <div class="h-full overflow-hidden">
    <n-card ref="cardRef" :title="(route.meta.title as string)" class="h-full shadow-sm rounded-16px">
      <common-title title="基础信息"></common-title>
      <n-grid class="pl-24px mt-14px" x-gap="50">
        <n-gi span="6">
          <n-space>
            <p class="label-name">模型名称:</p>
            <p class="label-value">fdsfjsdjfldsjlf</p>
          </n-space>
          <n-space class="mt-14px">
            <p class="label-name">模型描述:</p>
            <p class="label-value">住院记录</p>
          </n-space>
        </n-gi>
        <n-gi span="6">
          <n-space>
            <p class="label-name">模型版本:</p>
            <p class="label-value">v1</p>
          </n-space>
        </n-gi>
      </n-grid>
      <common-title title="物理化" class="mt-14px"></common-title>
      <n-form
        ref="form"
        class="pl-24px mt-14px"
        :model="model"
        :rules="rules"
        label-placement="left"
        require-mark-placement="right-hanging"
        size="medium"
      >
        <n-space>
          <n-form-item label="物理化数据源" path="source">
            <n-select
              v-model:value="model.source"
              label-field="dataSourceName"
              value-field="id"
              :options="originalList"
              class="w-300px"
            />
          </n-form-item>
          <n-button type="primary" class="ml-20px min-w-100px">执行物理化</n-button>
        </n-space>
      </n-form>
      <common-title title="物理化记录" class="mt-14px"></common-title>
      <n-data-table
        class="mt-14px pl-24px"
        :columns="columns"
        :data="data"
        :scroll-x="1100"
        :pagination="false"
        :row-key="row => row.id"
      />
      <template #action>
        <div class="flex-center w-full">
          <n-button type="primary" class="mr-16px min-w-100px">确定</n-button>
          <n-button ghost class="min-w-100px" @click="close">返回</n-button>
        </div>
      </template>
    </n-card>
    <physical-detail ref="physicalDetailRef"></physical-detail>
  </div>
</template>

<script lang="ts" setup>
import { h, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { FormRules, DataTableColumns } from 'naive-ui';
import { NTag, NButton, NIcon, useMessage } from 'naive-ui';
import { useRouterPush } from '@/composables';
import SvgIcon from '@/components/custom/svg-icon.vue';
import PhysicalDetail from '../component/physical-detail.vue';
const { routerPush, routerBack } = useRouterPush();
const route = useRoute();
const createFormData = () => ({ source: undefined });
const model = reactive(createFormData());
const rules = reactive<FormRules>({});
const physicalDetailRef = ref();
const originalList = [
  {
    id: 44,
    dataSourceName: 'nbcdr',
    jdbcUrl: 'jdbc:mysql://172.16.255.158:3306/nbcdr?useSSL=false',
    username: 'root',
    password: 'root',
    remark: '临床数据中心',
    dbType: 'MYSQL',
    aliveFlag: false,
    purpose: 1,
    host: '172.16.255.158',
    port: '3306',
    dbName: 'nbcdr',
    serverName: '',
    createTime: '2022-10-10 16:04:37',
    updateTime: '2022-11-29 09:57:28',
    defaultfs: null,
    path: null,
    hadoopConfig: null,
    monitorFlag: 0
  },
  {
    id: 53,
    dataSourceName: 'cdrmpi',
    jdbcUrl: 'jdbc:mysql://172.16.255.158:3306/cdrmpi?useSSL=false',
    username: 'root',
    password: 'root',
    remark: null,
    dbType: 'MYSQL',
    aliveFlag: false,
    purpose: 1,
    host: '172.16.255.158',
    port: '3306',
    dbName: 'cdrmpi',
    serverName: '',
    createTime: '2022-11-23 15:16:16',
    updateTime: '2023-09-11 14:55:13',
    defaultfs: null,
    path: null,
    hadoopConfig: null,
    monitorFlag: 0
  }
];
const data = reactive([
  {
    id: '1',
    modelName: 'dsfsdfsdf',
    remark: '患者信息',
    modelStatusCode: 1,
    physicalFlag: true,
    currentVersion: 'v1'
  },
  {
    id: '2',
    modelName: 'dsfsdfsdf',
    remark: '患者信息',
    modelStatusCode: 2,
    time: '2023-03-12 00:00:00',
    physicalFlag: false,
    currentVersion: 'v2'
  }
]);
const createColumns = (): DataTableColumns => {
  return [
    {
      title: '序号',
      key: 'key',
      render: (_, index) => {
        return `${index + 1}`;
      }
    },
    {
      title: '模型名称',
      key: 'modelName'
    },
    {
      title: '模型描述',
      key: 'remark'
    },
    {
      title: '版本',
      key: 'version'
    },
    {
      title: '执行时间',
      key: 'time'
    },
    {
      title: '物理化状态',
      key: 'physicalFlag',
      render: row => {
        return h(
          NTag,
          {
            size: 'small',
            color: row.physicalFlag ? { color: '#40DE5A', textColor: '#fff' } : { color: '#f45a3a', textColor: '#fff' },
            bordered: false
          },
          { default: () => (row.physicalFlag ? '成功' : '失败') }
        );
      }
    },
    {
      title: '操作',
      key: 'actions',
      width: 130,
      fixed: 'right',
      render: rowData => {
        return h(
          NButton,
          {
            quaternary: true,
            size: 'tiny',
            type: 'primary',
            class: 'flex-center',
            renderIcon: () => {
              return h(
                NIcon,
                { size: 16 },
                {
                  default: () => [h(SvgIcon, { localIcon: 'news-line' })]
                }
              );
            },
            onClick: () => {
              physicalDetailRef.value.open(rowData);
            }
          },
          {
            default: () => '详情'
          }
        );
      }
    }
  ];
};
const columns = reactive(createColumns());
function close() {
  Object.assign(model, createFormData());
  // routerPush({ name: 'data-model' });
  routerBack();
}
</script>

<style lang="scss" scoped>
.label-name {
  color: #333;
}
.label-value {
  color: #666;
}
</style>
