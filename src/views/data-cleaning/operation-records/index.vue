<template>
  <div class="h-full overflow-hidden">
    <n-card ref="cardRef" :title="(route.meta.title as string)" class="h-full shadow-sm rounded-16px">
      <template #header>
        <child-card-title @back="close"></child-card-title>
      </template>
      <common-title title="基础信息"></common-title>
      <n-grid class="mt-14px pl-24px">
        <n-gi :span="6">
          <n-space>
            <p class="w-70px label-name">任务名称:</p>
            <p class="label-value">{{ detailObj.name }}</p>
          </n-space>
          <n-space>
            <p class="w-70px label-name">源头数据:</p>
            <p class="label-value">{{ detailObj.originalDbKey }}</p>
          </n-space>
          <n-space>
            <p class="w-70px label-name">源头表:</p>
            <p class="label-value">{{ detailObj.originalTable }}</p>
          </n-space>
        </n-gi>
        <n-gi :span="6">
          <n-space>
            <p class="w-70px label-name">任务描述:</p>
            <p class="label-value">{{ detailObj.description }}</p>
          </n-space>
          <n-space>
            <p class="w-70px label-name">目标数据:</p>
            <p class="label-value">{{ detailObj.targetDbKey }}</p>
          </n-space>
          <n-space>
            <p class="w-70px label-name">目标表:</p>
            <p class="label-value">{{ detailObj.targetTable }}</p>
          </n-space>
        </n-gi>
      </n-grid>
      <common-title title="运行记录" class="mt-14px"></common-title>
      <n-form
        ref="searchForm"
        :show-feedback="false"
        class="searchForm mt-14px pl-24px"
        inline
        :model="searchModel"
        label-placement="left"
        size="medium"
      >
        <n-form-item label="实例ID" path="instanceId">
          <n-input v-model:value="searchModel.instanceId" />
        </n-form-item>
        <n-form-item label="清洗模式" path="isIncrement">
          <n-select v-model:value="searchModel.isIncrement" class="w-180px" :options="collectOptions" />
        </n-form-item>
        <n-form-item label="运行状态" path="status">
          <n-select v-model:value="searchModel.status" class="w-180px" :options="collectStateOptions" />
        </n-form-item>
        <n-form-item label="清洗状态" path="jobStatus">
          <n-select v-model:value="searchModel.jobStatus" class="w-180px" :options="collectJobStateOptions" />
        </n-form-item>
        <n-form-item label="最近运行时间" path="startTime">
          <n-date-picker
            v-model:formatted-value="searchModel.startTime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="开始时间"
            type="date"
          />
          <span class="ml-10px mr-10px">-</span>
          <n-date-picker
            v-model:formatted-value="searchModel.endTime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="结束时间"
            type="date"
          />
        </n-form-item>
        <n-button class="mb-14px" strong secondary type="primary" @click="getData(1)">
          <n-icon size="16"><svg-icon local-icon="search"></svg-icon></n-icon>
          搜索
        </n-button>
        <n-button class="mb-14px ml-10px" strong secondary type="tertiary" @click="resetClick">
          <n-icon size="16"><svg-icon local-icon="delete"></svg-icon></n-icon>
          清空
        </n-button>
      </n-form>
      <n-space justify="end">
        <n-button :disabled="!checkedRowKeysRef.length" strong secondary type="primary" @click="batchstop">
          批量停止
        </n-button>
        <n-button :disabled="!checkedRowKeysRef.length" strong secondary type="error">批量删除</n-button>
      </n-space>
      <n-data-table
        remote
        :loading="tableLoading"
        class="mt-14px"
        :max-height="maxHeight"
        :columns="columns"
        :data="dataList"
        :scroll-x="1800"
        :pagination="pagination"
        :row-key="row => row.instanceId"
        :checked-row-keys="checkedRowKeysRef"
        @update:checked-row-keys="handleCheck"
      />
    </n-card>
    <OperationParams ref="operationParamsRef"></OperationParams>
    <error-data-modal ref="errorDataRef"></error-data-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, h, computed } from 'vue';
import { useRoute } from 'vue-router';
import type { DataTableColumns, DataTableRowKey } from 'naive-ui';
import { NTag, NButton, NIcon, NPopconfirm, useMessage } from 'naive-ui';
import { getCleanInstanceList, stopOffCollectionRecord } from '@/service';
import { useRouterPush } from '@/composables';
const { routerBack } = useRouterPush();
import SvgIcon from '@/components/custom/svg-icon.vue';
import ErrorDataModal from '@/components/business/error-data-modal.vue';
import OperationParams from '@/views/offline-collection/component/operttion-params.vue';
import ExecuteParams from '@/views/offline-collection/component/execute-params.vue';
const route = useRoute();
const tableLoading = ref(false);
const detailObj = computed(() => {
  return {
    ...route.query
  };
});
const searchForm = ref();
const maxHeight = ref(0);
const collectOptions = [
  { label: '全量', value: 0 },
  { label: '增量', value: 1 }
];
const collectStateOptions = [
  { label: '等待派发', value: 1 },
  { label: '等待Worker接收', value: 2 },
  { label: '运行中', value: 3 },
  { label: '失败', value: 4 },
  { label: '成功', value: 5 },
  { label: '取消', value: 9 },
  { label: '手动停止', value: 10 }
];
const collectJobStateOptions = [
  { label: '失败', value: 4 },
  { label: '成功', value: 5 }
];
const operationParamsRef = ref();
const errorDataRef = ref();
const checkedRowKeysRef = ref([]);
const createModel = () => ({
  instanceId: null,
  isIncrement: null,
  status: null,
  jobStatus: null,
  startTime: null,
  endTime: null
});
const searchModel = ref(createModel());
const actionslist = [
  {
    icon: 'solar:programming-broken',
    value: '运行参数',
    onClick: (row: any) => {
			operationParamsRef.value.open('运行参数', row);
    }
  },
  {
    localIcon: 'news-line',
    value: '日志',
    onClick: (row: any) => {
      operationParamsRef.value.open('日志', row);
    }
  },
  {
    icon: 'fluent:clipboard-error-16-regular',
    value: '错误数据',
    onClick: (row: any) => {
      const params = {
        ...row,
        tableName: detailObj.value.targetTable
      };
      errorDataRef.value.open('', params);
    }
  }
];
const createColumns = (): DataTableColumns => {
  return [
    {
      type: 'selection',
      fixed: 'left'
    },
    {
      title: '实例ID',
      key: 'instanceId',
      width: '200'
    },
    {
      title: '运行状态',
      key: 'status',
      render: rowData => {
        return h(
          NTag,
          {
            size: 'small',
            color:
              rowData.status === 4 || rowData.status === 9 || rowData.status === 10
                ? { color: '#f45a3a', textColor: '#fff' }
                : rowData.status === 5 || rowData.status === 3
                ? { color: '#40DE5A', textColor: '#fff' }
                : rowData.status === 1 || rowData.status === 2
                ? { color: '#1890ff', textColor: '#fff' }
                : { color: 'transparent', textColor: 'transparent' },
            bordered: false
          },
          {
            default: () => collectStateOptions.find(v => v.value === rowData.status)?.label
          }
        );
      }
    },
    {
      title: '清洗状态',
      key: 'jobStatus',
      render: rowData => {
        return h(
          NTag,
          {
            size: 'small',
            color:
              rowData.jobStatus === 4 || rowData.jobStatus === 9 || rowData.jobStatus === 10
                ? { color: '#f45a3a', textColor: '#fff' }
                : rowData.jobStatus === 5 || rowData.jobStatus === 3
                ? { color: '#40DE5A', textColor: '#fff' }
                : rowData.jobStatus === 1 || rowData.jobStatus === 2
                ? { color: '#1890ff', textColor: '#fff' }
                : { color: 'transparent', textColor: 'transparent' },
            bordered: false
          },
          {
            default: () => collectStateOptions.find(v => v.value === rowData.jobStatus)?.label
          }
        );
      }
    },
    {
      title: '清洗模式',
      key: 'isIncrement',
      render: rowData => {
        return h(
          NTag,
          {
            size: 'small',
            color:
              rowData.isIncrement === 0
                ? { color: '#1790FF', textColor: '#fff' }
                : rowData.isIncrement === 1
                ? { color: '#9DC9FF', textColor: '#fff' }
                : {},
            bordered: false
          },
          {
            default: () => collectOptions.find(v => v.value === rowData.isIncrement)?.label
          }
        );
      }
    },

    {
      title: '触发时间',
      key: 'actualTriggerTime',
      width: '180'
    },
    {
      title: '结束时间',
      key: 'finishedTime',
      width: '180'
    },
    {
      title: '清洗条数',
      key: 'dataTotalNum'
    },
    {
      title: '正确数据',
      key: 'transformSuccessNum'
    },
    {
      title: '错误数据',
      key: 'transformErrorNum'
    },
    {
      title: '清洗耗时',
      key: 'consumeTime'
    },
    {
      title: '清洗速度',
      key: 'dataWriteSpeed'
    },
    {
      title: '清洗数据量',
      key: 'dataTotalSize'
    },
    {
      title: '操作',
      key: 'actions',
      width: 300,
      fixed: 'right',
      render: rowData => {
        return h(
          'div',
          { class: 'flex' },
          actionslist
            .concat(
              rowData.status === 3
                ? [
                    {
                      icon: 'ion:stop-circle-outline',
                      value: '停止',
                      onClick: async () => {
                        stopRecord(rowData.instanceId);
                      }
                    }
                  ]
                : []
            )
            .map(v => {
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
                        default: () => [
                          h(SvgIcon, v.localIcon ? { localIcon: v.localIcon } : v.icon ? { icon: v.icon } : {})
                        ]
                      }
                    );
                  },
                  onClick: () => {
                    v.onClick(rowData);
                  }
                },
                {
                  default: () => v.value
                }
              );
            })
          // .concat([
          //   h(
          //     NPopconfirm,
          //     {
          //       onPositiveClick: () => {
          //         console.log('删除');
          //       }
          //     },
          //     {
          //       trigger: () => {
          //         return h(
          //           NButton,
          //           {
          //             quaternary: true,
          //             size: 'tiny',
          //             type: 'primary',
          //             class: 'flex-center',
          //             renderIcon: () => {
          //               return h(NIcon, { size: 16 }, { default: () => [h(SvgIcon, { localIcon: 'delete' })] });
          //             }
          //           },
          //           {
          //             default: () => '删除'
          //           }
          //         );
          //       },
          //       default: () => '此操作将永久删除该数据, 是否继续?'
          //     }
          //   )
          // ])
        );
      }
    }
  ];
};
const columns = createColumns();
const dataList = ref([]);
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: (page: number) => {
    pagination.page = page;
    getData();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    getData();
  }
});
async function batchstop() {
  await stopRecord(checkedRowKeysRef.value.join(','));
  checkedRowKeysRef.value = [];
}
async function stopRecord(code) {
  let arr = code.split(',');
  arr = arr.map(v => {
    return {
      projectCode: route.query.projectCode,
      code: v
    };
  });
  const { error } = await stopOffCollectionRecord(arr);
  if (!error) {
    window.$message?.success('停止成功');
    getData();
  }
}
function handleCheck(rowKeys: any) {
  checkedRowKeysRef.value = rowKeys;
}
function getCardDetailsTableHeight() {
  maxHeight.value = window.innerHeight - searchForm.value.$el.offsetHeight - 570;
}
window.onresize = () => {
  getCardDetailsTableHeight();
};
function close() {
  routerBack();
}
function resetClick() {
  searchModel.value = createModel();
  getData(1);
}
async function getData(arg?: number) {
  if (arg === 1) {
    pagination.page = 1;
  }
  tableLoading.value = true;
  console.log(searchModel.value, 'searchModel.value');
  const params = {
    ...searchModel.value,
    page: pagination.page,
    size: pagination.pageSize,
    index: pagination.page - 1,
    pageSize: pagination.pageSize,
    projectCode: route.query.projectCode,
    taskCode: route.query.code,
    startTime: searchModel.value.startTime ? searchModel.value.startTime : '',
    endTime: searchModel.value.endTime ? searchModel.value.endTime : ''
  };
  const { data } = await getCleanInstanceList(params);
  tableLoading.value = false;
  pagination.itemCount = data ? data.total : 0;
  dataList.value = data && data.list ? data.list : [];
}
onMounted(() => {
  getCardDetailsTableHeight();
  getData();
});
</script>

<style lang="scss" scoped>
:deep(.n-card__content) {
  height: 100% !important;
}
:deep(.searchForm) {
  flex-wrap: wrap;
  .n-form-item {
    margin-bottom: 14px;
  }
}
.label-name {
  color: #333;
}
.label-value {
  color: #666;
}
</style>
