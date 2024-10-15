<template>
  <div class="h-full overflow-hidden">
    <n-card ref="cardRef" class="h-full shadow-sm rounded-16px">
      <!-- <n-space :wrap="true"> -->
      <n-form
        ref="searchForm"
        :show-feedback="false"
        class="searchForm"
        inline
        :model="searchModel"
        label-placement="left"
        size="medium"
      >
        <n-form-item label="关键字" path="queryKey">
          <n-input v-model:value="searchModel.queryKey" placeholder="请输入任务名称或描述" />
        </n-form-item>
        <n-form-item label="清洗模式" path="isIncrement">
          <n-select
            v-model:value="searchModel.isIncrement"
            class="w-180px"
            placeholder="请选择清洗模式"
            :options="collectOptions"
          />
        </n-form-item>
        <n-form-item label="清洗源" path="originalDbKey">
          <n-select
            v-model:value="searchModel.originalDbKey"
            class="w-180px"
            placeholder="请选择清洗源"
            :options="originalList"
          />
        </n-form-item>
        <n-form-item label="目标源" path="targetDbKey">
          <n-select
            v-model:value="searchModel.targetDbKey"
            class="w-180px"
            placeholder="请选择目标源"
            :options="originalList"
          />
        </n-form-item>
        <n-form-item label="上线状态" path="offLine">
          <n-select
            v-model:value="searchModel.offLine"
            class="w-180px"
            placeholder="请选择上线状态"
            :options="offLineList"
          />
        </n-form-item>
        <n-form-item label="定时状态" path="status">
          <n-select
            v-model:value="searchModel.status"
            class="w-180px"
            placeholder="请选择定时状态"
            :options="statusList"
          />
        </n-form-item>
        <n-form-item label="定时频率" path="cron">
          <n-select v-model:value="searchModel.cron" class="w-180px" placeholder="请选择定时频率" :options="cronList" />
        </n-form-item>
        <n-form-item label="所属项目" path="projectCode">
          <n-select
            v-model:value="searchModel.projectCode"
            class="w-180px"
            placeholder="请选择所属项目"
            :options="projectList"
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
      <!-- </n-space> -->
      <n-space justify="space-between">
        <n-space>
          <n-button strong secondary type="primary" @click="addClick({}, 1)">新建任务</n-button>
          <n-button strong secondary type="primary" @click="download">导出清洗列表</n-button>
          <!--          <n-button strong secondary type="primary" @click="addClick({}, 4)">批量任务创建</n-button>-->
        </n-space>
        <!-- <n-button :disabled="!checkedRowKeysRef.length" strong secondary type="error" @click="batchdelete(1)">
          批量删除
        </n-button> -->
        <n-dropdown
          trigger="hover"
          placement="bottom-start"
          :options="!checkedRowKeysRef.length ? [] : batchOptions"
          @select="batchSelect"
        >
          <n-button :disabled="!checkedRowKeysRef.length" strong secondary type="primary">批量操作</n-button>
        </n-dropdown>
      </n-space>
      <loading-empty-wrapper :style="{ height: maxHeight + 'px' }" class="mt-14px" :loading="loading" :empty="empty">
        <n-data-table
          remote
          :max-height="maxHeight"
          :columns="columns"
          :data="dataList"
          :scroll-x="1800"
          :pagination="pagination"
          :checked-row-keys="checkedRowKeysRef"
          :row-key="(row: RowData) => row.code"
          @update:checked-row-keys="handleCheck"
        />
      </loading-empty-wrapper>
    </n-card>
    <timing-modal ref="timingRef" @close="timingClose" />
    <inc-time-modal ref="incTimeRef" @close="timingClose"></inc-time-modal>
  </div>
</template>

<script lang="ts" setup>
import { h, ref, reactive, onActivated } from 'vue';
import type { DataTableColumns, DataTableRowKey } from 'naive-ui';
import { NTag, NButton, NSwitch, NIcon, NPopconfirm, useMessage } from 'naive-ui';
import qs from 'qs';
import {
  getCleanJobList,
  cleanJobDelete,
  offCollectionExecuteOnce,
  onlineJob,
  offlineJob,
  startJob,
  stopJob,
  downloadFile,
  getDblist,
  getAllCronDict,
  getProjectList,
  batchOnline,
  batchOffline,
  batchStartScheduler,
  batchStopScheduler
} from '@/service';
import { useRouterPush } from '@/composables';
import { useLoadingEmpty } from '@/hooks';
import SvgIcon from '@/components/custom/svg-icon.vue';
import TimingModal from '@/views/offline-collection/component/timing-modal.vue';
import IncTimeModal from '@/views/data-cleaning/component/inc-time-modal.vue';
import { getServiceEnvConfig } from '~/.env-config';
const { loading, startLoading, endLoading, empty, setEmpty } = useLoadingEmpty();
const { routerPush } = useRouterPush();
const createModel = () => ({
  queryKey: '',
  isIncrement: '-1',
  originalDbKey: '',
  targetDbKey: '',
  offLine: '-1',
  status: '-1',
  cron: '',
  projectCode: ''
});
const searchModel = ref(createModel());
const collectOptions = [
  { label: '全部', value: '-1' },
  { label: '全量', value: 0 },
  { label: '增量', value: 1 }
];
const offLineList = [
  { label: '全部', value: '-1' },
  { label: '下线', value: 0 },
  { label: '上线', value: 1 }
];
const statusList = [
  { label: '全部', value: '-1' },
  { label: '开启', value: 1 },
  { label: '关闭', value: 2 }
];
const batchOptions = [
  { label: '上线', key: '0' },
  { label: '下线', key: '1' },
  { label: '运行一次', key: '2' },
  { label: '定时调整', key: '3' },
  { label: '开启定时', key: '4' },
  { label: '关闭定时', key: '5' },
  { label: '修改增量时间', key: '6' },
  { label: '删除', key: '7' }
];
const searchForm = ref();
const timingRef = ref();
const incTimeRef = ref();
const maxHeight = ref(0);
type RowData = {
  code: string;
  taskName: string;
  taskDesc: string;
  collectionType: number;
  fromDataName: string;
  formTable: string;
  toDataName: string;
  toTable: string;
  time: string;
  nextTime: string;
  open: number;
};
const createColumns = (): DataTableColumns<RowData> => {
  return [
    {
      type: 'selection',
      fixed: 'left'
    },
    {
      title: '任务名称',
      key: 'name',
      width: 200
    },
    {
      title: '任务描述',
      key: 'description',
      width: 200
    },
    {
      title: '采集模式',
      key: 'isIncrement',
      width: 100,
      render: rowData => {
        if (rowData.isIncrement || rowData.isIncrement === 0) {
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
      }
    },
    {
      title: '源头数据',
      key: 'originalDbKey',
      width: 150
    },
    {
      title: '源头表',
      key: 'originalTable',
      width: 200
    },
    {
      title: '目标数据',
      key: 'targetDbKey',
      width: 150
    },
    {
      title: '目标表',
      key: 'targetTable',
      width: 200
    },
    {
      title: '运行开关',
      key: 'status',
      fixed: 'right',
      width: 100,
      render: rowData => {
        return h(
          NSwitch,
          {
            checkedValue: 1,
            uncheckedValue: 2,
            size: 'small',
            value: rowData.status,
            disabled: rowData.powerJobId === 0 && rowData.status === 2,
            'on-update:value': async value => {
              rowData.status = value;
              console.log(value, 'value');
              startStop(value, rowData.code);
            }
          },
          {
            checked: () => '开启',
            unchecked: () => '关闭'
          }
        );
      }
    },
    {
      title: '操作',
      key: 'actions',
      width: 460,
      fixed: 'right',
      render: rowData => {
        const actionslist = [
          {
            localIcon: 'edit',
            value: '编辑',
            disabled: rowData.powerJobId !== 0,
            onClick: (row: any) => {
              addClick(row, 2);
            }
          },
          {
						localIcon: rowData.powerJobId === 0 ? 'upload-2-line' : 'download-2-line',
            value: rowData.powerJobId === 0 ? '上线' : '下线',
            onClick: async () => {
              const { error } =
                rowData.powerJobId === 0
                  ? await onlineJob({ code: rowData.code })
                  : await offlineJob({ code: rowData.code });
              if (!error) {
                window.$message?.success(`${rowData.powerJobId === 0 ? '上线' : '下线'}成功`);
                getData();
              }
            }
          },
          {
						localIcon: 'play-circle-line',
            value: '运行一次',
            disabled: rowData.powerJobId === 0,
            onClick: async row => {
              console.log('运行一次');
              const params = [
                {
                  jobId: row.powerJobId,
                  appName: row.projectCode
                }
              ];
              executeOnce(params, 0);
            }
          },
          {
						localIcon: 'ci-alarm',
            value: '定时',
            disabled: rowData.powerJobId === 0,
            onClick: (row: any) => {
              timingClick(row);
            }
          },
          {
						localIcon: 'list-view',
            value: '运行记录',
            onClick: (row: any) => {
              console.log('运行记录');
              operationRecordClick(row);
            }
          },
          {
						localIcon: 'news-line',
            value: '详情',
            onClick: (row: any) => {
              addClick(row, 3);
            }
          }
        ];
        return h(
          'div',
          { class: 'flex' },
          actionslist
            .map(v => {
              return h(
                NButton,
                {
                  quaternary: true,
                  disabled: v.disabled,
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
            .concat([
              h(
                NPopconfirm,
                {
                  onPositiveClick: async () => {
                    batchdelete(0, rowData.code);
                  }
                },
                {
                  trigger: () => {
                    return h(
                      NButton,
                      {
                        quaternary: true,
                        disabled: rowData.powerJobId !== 0,
                        size: 'tiny',
                        type: 'primary',
                        class: 'flex-center',
                        renderIcon: () => {
                          return h(NIcon, { size: 16 }, { default: () => [h(SvgIcon, { localIcon: 'delete' })] });
                        }
                      },
                      {
                        default: () => '删除'
                      }
                    );
                  },
                  default: () => '此操作将永久删除该数据, 是否继续?'
                }
              )
            ])
        );
      }
    }
  ];
};
const columns = createColumns();
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
const checkedRowKeysRef = ref<DataTableRowKey[]>([]);
const dataList = ref([]);
async function batchdelete(type: number, code?: string) {
  // const params = {
  //   codes: type === 1 ? checkedRowKeysRef.value : [code]
  // };
  const codes = type === 1 ? checkedRowKeysRef.value : [code];
  const params = codes.map(v => {
    const obj: any = dataList.value.find((item: any) => item.code === v);
    return {
      projectCode: obj.projectCode,
      code: v
    };
  });
  const { error } = await cleanJobDelete(params);
  if (!error) {
    window.$message?.success('删除成功');
    checkedRowKeysRef.value = [];
    getData(1);
  }
}
function handleCheck(rowKeys: DataTableRowKey[]) {
  checkedRowKeysRef.value = rowKeys;
}
function getCardDetailsTableHeight() {
  maxHeight.value = window.innerHeight - searchForm.value.$el.offsetHeight - 360;
}
function addClick(record: any, type: number) {
  routerPush({
    name: 'data-cleaning_add',
    query: {
      type,
      // record: JSON.stringify(record),
      code: record.code ? record.code : '',
      metaTitle: type === 1 ? '新建任务' : type === 2 ? '编辑任务' : type === 3 ? '任务详情' : '批量创建任务'
    }
  });
}
function operationRecordClick(row: any) {
  routerPush({
    name: 'data-cleaning_operation-records',
    query: { ...row }
  });
}
function timingClick(item: any) {
  timingRef.value.open(item);
}
async function startStop(value: any, code: any) {
  const { error } = value === 1 ? await startJob({ code }) : await stopJob({ code });
  if (!error) {
    window.$message?.success(`${value === 1 ? '开启' : '关闭'}成功`);
    getData();
  }
}
function download() {
  // downloadFile('/data/offCollection/exportJobInfo', new Date().getTime(), queryParams);
  window.location.href = `${
    import.meta.env.VITE_HTTP_PROXY === 'Y' ? '/proxy-pattern' : ''
  }/data/offCollection/exportJobInfo?${qs.stringify(searchModel.value)}`;
}
async function getData(arg?: number) {
  if (arg === 1) {
    pagination.page = 1;
  }
  startLoading();
  console.log(searchModel.value, 'searchModel.value');
  const params = {
    ...searchModel.value,
    page: pagination.page,
    size: pagination.pageSize
  };
  const { data } = await getCleanJobList(params);
  endLoading();
  pagination.itemCount = data ? data.total : 0;
  dataList.value = data && data.list ? data.list : [];
  setEmpty(!dataList.value.length);
}
function resetClick() {
  searchModel.value = createModel();
  getData(1);
}
// 监听窗口变化动态设置表格高度
window.onresize = () => {
  getCardDetailsTableHeight();
};
const originalList = ref([]);
async function getDb() {
  const { data } = await getDblist();
  if (data) {
    originalList.value = (data as any)?.map((v: string) => {
      return { label: v, value: v };
    });
  }
}
const cronList = ref([]);
async function getCron() {
  const { data } = await getAllCronDict();
  if (data) {
    cronList.value = (data as any)?.map((v: string) => {
      return { label: v.cronZh, value: v.cron };
    });
  }
}
const projectList = ref([]);
async function getProjectLists() {
  const { data } = await getProjectList();
  projectList.value =
    data && data.list
      ? data.list.map((v: any) => {
          return {
            label: v.name,
            value: v.code
          };
        })
      : [];
}
async function executeOnce(params: any, type: any) {
  const { error } = await offCollectionExecuteOnce(params);
  if (!error) {
    window.$message?.success(type ? '批量运行成功' : '运行成功');
    checkedRowKeysRef.value = [];
    getData();
  }
}
function timingClose() {
  checkedRowKeysRef.value = [];
  getData();
}
async function batchSelect(key: string) {
  if (key === '0' || key === '1') {
    const { error } =
      key === '0'
        ? await batchOnline({ codes: checkedRowKeysRef.value })
        : await batchOffline({ codes: checkedRowKeysRef.value });
    if (!error) {
      window.$message?.success(`批量${key === '0' ? '上线' : '下线'}成功`);
      checkedRowKeysRef.value = [];
      getData();
    }
  }
  if (key === '2') {
    const params = checkedRowKeysRef.value.map(v => {
      const obj = dataList.value.find(q => q.code === v);
      return {
        jobId: obj?.powerJobId,
        appName: obj?.projectCode
      };
    });
    executeOnce(params, 1);
  }
  if (key === '4' || key === '5') {
    const { error } =
      key === '4'
        ? await batchStartScheduler({ codes: checkedRowKeysRef.value })
        : await batchStopScheduler({ codes: checkedRowKeysRef.value });
    if (!error) {
      window.$message?.success(`批量${key === '4' ? '开启' : '关闭'}定时任务成功`);
      checkedRowKeysRef.value = [];
      getData();
    }
  }
  if (key === '3') {
    timingRef.value.open({}, checkedRowKeysRef.value);
  }
  if (key === '6') {
    incTimeRef.value.open(checkedRowKeysRef.value);
  }
  if (key === '7') {
    batchdelete(1);
  }
}
onActivated(() => {
  getCardDetailsTableHeight();
  getData();
  getDb();
  getCron();
  getProjectLists();
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
</style>
