<template>
  <div class="h-full overflow-hidden">
    <n-card ref="cardRef" class="h-full shadow-sm rounded-16px standrad">
      <n-tabs v-model:value="activeName" type="line" @update:value="tabChange">
        <n-tab v-for="item in tabs" :key="item.name" :name="item.name">{{ item.label }}</n-tab>
      </n-tabs>
      <div class="has-tabs-page-container">
        <div class="left">
          <n-space justify="space-between">
            <n-button strong secondary type="primary" class="mb-14px" @click="addModalRef.open(null, activeName)">
              新增
            </n-button>
            <n-space>
              <n-input v-model:value="queryKey" placeholder="输入关键字查询" />
              <n-button class="mb-14px" strong secondary type="primary" @click="getData(1)">
                <n-icon size="16"><svg-icon local-icon="search"></svg-icon></n-icon>
                查询
              </n-button>
              <n-button class="mb-14px" strong secondary type="tertiary" @click="resetClick">
                <n-icon size="16"><svg-icon local-icon="delete"></svg-icon></n-icon>
                重置
              </n-button>
            </n-space>
          </n-space>
          <div class="table-wrapper">
            <n-data-table
              :loading="tableLoading"
              remote
              :max-height="maxHeight"
              :columns="columns"
              :data="dataList"
              :pagination="pagination"
              :row-class-name="tableRowClassName"
              :row-props="rowProps"
            />
          </div>
        </div>
        <div class="right">
          <common-title title="详情"></common-title>
          <n-spin v-if="rightInfoLoading" class="w-full detail-spin" size="small" />
          <text-view
            v-else
            style="padding-left: 24px"
            :data="rightInfo"
            :labels="labels"
            :label-width="115"
          ></text-view>
        </div>
      </div>
      <add-modal ref="addModalRef" @close="getData"></add-modal>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch, h } from 'vue';
import type { DataTableColumns } from 'naive-ui';
import { NButton, NIcon, NPopconfirm } from 'naive-ui';
import { standMetaInfoList, standMetaInfoDelete, countryMetaInfoList, countryMetaInfoDelete } from '@/service';
import { useRouterPush } from '@/composables';
import { getDictType, reCalculatePage } from '@/utils';
import SvgIcon from '@/components/custom/svg-icon.vue';
import AddModal from './add-modal.vue';
const { routerPush } = useRouterPush();
const activeName = ref('1');
const tabs = reactive([
  { label: '平台数据元', name: '1' },
  { label: '国家数据元', name: '2' }
]);
const addModalRef = ref();
const tableLoading = ref(false);
const maxHeight = window.innerHeight - 465;
const dataList = ref([]);
const selectRow = ref({});
const queryKey = ref('');
const dataTypeList = ref([]);
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
const labels = [
  { key: 'fieldName', name: '数据元字段名称' },
  { key: 'metadataCaptioon', name: '数据元中文名称' },
  { key: 'metadataIdentifier', name: '数据元标识符' },
  { key: 'metadataDefine', name: '数据元定义' },
  { key: 'dataTypeCode', name: '数据类型代码' },
  { key: 'rangeParentCode', name: '公共值域父类' },
  { key: 'valueLength', name: '长度' },
  { key: 'rangeSourceCode', name: '值域来源代码' },
  { key: 'masterdbName', name: '主数据表名' },
  { key: 'remark', name: '备注' }
];
watch(
  () => selectRow.value,
  () => {
    if (selectRow.value.incrementId) {
      getRightInfo();
    }
  },
  { immediate: true }
);
const actionslist = [
  {
    localIcon: 'edit',
    value: '编辑',
    onClick: (row: any) => {
      addModalRef.value.open(row, activeName.value);
    }
  }
];
const createColumns = (): DataTableColumns => {
  return [
    {
      title: '序号',
      key: 'key',
      width: 60,
      render: (_, index) => {
        return `${index + 1}`;
      }
    },
    {
      title: '数据元字段名称',
      key: 'fieldName',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '数据元中文名称',
      key: 'metadataCaptioon',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '数据类型代码',
      key: 'dataTypeCode',
      ellipsis: {
        tooltip: true
      },
      render: rowData => {
        return getDictType('data_type_code').find(v => v.value === rowData.dataTypeCode)?.label;
      }
    },
    {
      title: '脱敏规则',
      key: 'ruleCaptioon',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '操作',
      key: 'actions',
      width: 190,
      fixed: 'right',
      render: rowData => {
        return h(
          'div',
          { class: 'flex' },
          actionslist
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
                  onClick: e => {
                    e.stopPropagation();
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
                    const { error } = await (activeName.value === '1' ? standMetaInfoDelete : countryMetaInfoDelete)(
                      rowData.incrementId
                    );
                    if (!error) {
                      window.$message?.success('删除成功！');
                      await reCalculatePage(1, pagination);
                      getData();
                    }
                  }
                },
                {
                  trigger: () => {
                    return h(
                      NButton,
                      {
                        quaternary: true,
                        size: 'tiny',
                        type: 'primary',
                        class: 'flex-center',
                        renderIcon: () => {
                          return h(NIcon, { size: 16 }, { default: () => [h(SvgIcon, { localIcon: 'delete' })] });
                        },
                        onClick: e => {
                          e.stopPropagation();
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
const rightInfoLoading = ref(false);
const rightInfo = ref({});
function tabChange() {
  queryKey.value = '';
  selectRow.value = {};
  rightInfo.value = {};
  tableLoading.value = false;
  getData(1);
}
function resetClick() {
  queryKey.value = '';
  getData(1);
}
async function getRightInfo() {
  rightInfo.value = { ...selectRow.value };
  // rightInfoLoading.value = true;
  // const { data } = await standard[infoUrl]({ id: selectRow.value.incrementId });
  // rightInfo.value = data || {};
  // rightInfoLoading.value = false;
}
function rowProps(row: any) {
  return {
    style: 'cursor: pointer;',
    onClick: e => {
      e.stopPropagation();
      selectRow.value = row;
    }
  };
}
function tableRowClassName(row) {
  if (row.incrementId && row.incrementId === selectRow.value.incrementId) {
    return 'table-row-select';
  }
  return '';
}
async function getData(arg?: number) {
  if (arg === 1) {
    pagination.page = 1;
  }
  selectRow.value = {};
  tableLoading.value = true;
  const params = {
    queryKey: queryKey.value,
    page: pagination.page,
    size: pagination.pageSize
  };
  const { data } = await (activeName.value === '1' ? standMetaInfoList : countryMetaInfoList)(params);
  tableLoading.value = false;
  pagination.itemCount = data ? data.total : 0;
  dataList.value = data && data.list ? data.list : [];
  if (dataList.value.length > 0) {
    selectRow.value = dataList.value[0];
  } else {
    rightInfo.value = {};
  }
}
onMounted(() => {
  getData();
});
</script>

<style lang="scss" scoped></style>
