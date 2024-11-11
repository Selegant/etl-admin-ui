<template>
  <div class="h-full overflow-hidden">
    <div class="flex h-full">
      <div class="flex-col w-260px h-full shadow-sm rounded-6px mr-10px left-slide flex-shrink-0">
        <n-input v-model:value="pattern" placeholder="搜索">
          <template #suffix>
            <n-icon size="16"><svg-icon local-icon="search"></svg-icon></n-icon>
          </template>
        </n-input>
        <n-space justify="end" class="mt-14px">
          <n-button size="tiny" ghost type="primary" @click="modelTypeRef.open()">创建新分层</n-button>
        </n-space>
        <n-tree
          class="mt-14px flex-1 overflow-y-auto"
          :pattern="pattern"
          :show-irrelevant-nodes="false"
          block-line
          key-field="id"
          label-field="name"
          :selected-keys="selectedKeys"
          default-expand-all
          :data="treeData"
          :render-switcher-icon="renderSwitcherIcon"
          selectable
          :render-suffix="renderSuffix"
          :node-props="nodeProps"
          @update:selected-keys="changeTreeNode"
        />
      </div>
      <n-card class="flex-1 h-full shadow-sm rounded-6px overflow-auto">
        <n-space>
          <n-input v-model:value="queryKey" placeholder="关键词搜索" style="width: 260px">
            <template #suffix>
              <n-icon size="16"><svg-icon local-icon="search"></svg-icon></n-icon>
            </template>
          </n-input>
          <n-button class="mb-14px" strong secondary type="primary" @click="loadData(1)">
            <n-icon size="16"><svg-icon local-icon="search"></svg-icon></n-icon>
            查询
          </n-button>
          <n-button class="mb-14px" strong secondary type="tertiary" @click="resetClick">
            <n-icon size="16"><svg-icon local-icon="delete"></svg-icon></n-icon>
            重置
          </n-button>
        </n-space>
        <n-space justify="end">
          <!-- <n-button type="primary" @click="addClick({}, 1)">新建模型</n-button> -->
          <n-space>
            <!-- <n-dropdown trigger="hover" :options="matchoptions" @update:show="matchUpdateshow" @select="matchSelect">
              <n-button class="mr-14px" ghost type="primary">
                批量操作
                <n-icon size="16" class="ml-5px"><svg-icon :icon="iconname"></svg-icon></n-icon>
              </n-button>
            </n-dropdown> -->
            <!-- <n-dropdown
              trigger="hover"
              :options="importoptions"
              @update:show="importUpdateshow"
              @select="imprtsTypeSelect"
            > -->
            <n-button
              :disabled="!checkedRowKeysRef.length"
              strong
              secondary
              type="error"
              @click="deleteHandle(checkedRowKeysRef.join(','), checkedRowKeysRef.length)"
            >
              批量删除
            </n-button>
            <n-button type="primary" @click="addClick({ modelTypeId: selectedKey }, 5)">
              导入模型
              <!-- <n-icon size="16" class="ml-5px"><svg-icon :icon="importiconname"></svg-icon></n-icon> -->
            </n-button>
            <!-- </n-dropdown> -->
          </n-space>
        </n-space>
        <loading-empty-wrapper :style="{ height: maxHeight + 'px' }" class="mt-14px" :loading="loading" :empty="empty">
          <n-data-table
            remote
            class="mt-14px"
            :max-height="maxHeight"
            :columns="columns"
            :data="tabledata"
            :pagination="pagination"
            :row-key="row => row.id"
            @update:checked-row-keys="handleCheck"
          />
        </loading-empty-wrapper>
      </n-card>
    </div>
    <model-type-modal ref="modelTypeRef" @close="init"></model-type-modal>
    <match-physical-modal ref="matchPhysicalRef"></match-physical-modal>
    <ddl-modal ref="ddlRef"></ddl-modal>
  </div>
</template>

<script lang="ts" setup>
import { h, ref, reactive, onActivated, computed } from 'vue';
import type { TreeOption, DataTableColumns, DataTableRowKey } from 'naive-ui';
import { NButton, NIcon, NPopconfirm, useMessage, NDropdown } from 'naive-ui';
import { getModelTypeTreeList, deleteModelType, getModelList, deleteModel, importModel } from '@/service';
import { useRouterPush } from '@/composables';
import { useLoadingEmpty } from '@/hooks';
import { reCalculatePage } from '@/utils';
import SvgIcon from '@/components/custom/svg-icon.vue';
import MatchPhysicalModal from '../component/match-physical-modal.vue';
import ModelTypeModal from '../component/model-type-modal.vue';
import DdlModal from '../component/ddl-modal.vue';
const { loading, startLoading, endLoading, empty, setEmpty } = useLoadingEmpty();
const { routerPush } = useRouterPush();
const maxHeight = window.innerHeight - 413;
const matchPhysicalRef = ref();
const ddlRef = ref();
const pattern = ref('');
const queryKey = ref('');
const message = useMessage();
const checkedRowKeysRef = ref<DataTableRowKey[]>([]);
const matchoptions = [
  { label: '批量上架', key: 1 },
  { label: '批量删除', key: 2 },
  { label: '批量物理化', key: 3 }
];
const importoptions = [
  { label: 'DDL导入', key: 1 },
  { label: '数据库导入', key: 2 }
];
const iconname = ref('ep:arrow-down');
const importiconname = ref('ep:arrow-down');
const treeData = ref([]);
const selectedKey = ref('');
const selectedKeys = computed(() => {
  return [selectedKey.value];
});
const renderSwitcherIcon = ({ expanded }: { expanded: boolean }) =>
  h(NIcon, null, {
    default: () => h(SvgIcon, { localIcon: expanded ? 'ci-add-minus-square' : 'ci-add-plus-square' })
  });
const renderIcon = (icon: string) => {
  return () => {
    return h(NIcon, null, {
      default: () => [h(SvgIcon, { localIcon: icon })]
    });
  };
};
const currentHoverKey = ref('');
const moreActionShowKey = ref('');
const modelTypeRef = ref();
function renderSuffix({ option }: { option: TreeOption }) {
  if (currentHoverKey.value === option.id || moreActionShowKey.value === option.id) {
    return h(
      NDropdown,
      {
        options: [
          {
            label: '添加',
            key: '1',
            icon: renderIcon('add-circle-line')
          },
          {
            label: '编辑',
            key: '2',
            icon: renderIcon('edit-2-line')
          },
          {
            label: '删除',
            key: '3',
            icon: renderIcon('indeterminate-circle-line')
          }
        ],
        'on-update:show': (value: any) => {
          console.log(value, '更多操作显示隐藏');
          if (value) {
            console.log(option, 'option');

            moreActionShowKey.value = option.id as string;
          } else {
            moreActionShowKey.value = '';
          }
        },
        'on-select': async (key: string) => {
          if (key === '1') {
            modelTypeRef.value.open({ id: option.id, parentId: option.id, theTitle: '新建模型目录' });
          }
          if (key === '2') {
            modelTypeRef.value.open({
              id: option.id,
              folderName: option.name,
              parentId: option.parentId
            });
          }
          if (key === '3') {
            const { error } = await deleteModelType(option.id as string);
            if (!error) {
              window.$message?.success('删除成功');
              init();
            }
          }
        }
      },
      {
        default: () =>
          h(NIcon, null, {
            default: () => h(SvgIcon, { localIcon: 'more-2-fill' })
          })
      }
    );
  }
  return '';
}
const nodeProps = ({ option }: { option: TreeOption }) => {
  return {
    onmouseenter() {
      currentHoverKey.value = option.id as string;
    },
    onmouseleave() {
      currentHoverKey.value = '';
    }
  };
};
const modelStatusCodeList = [
  { label: '未发布', key: 1 },
  { label: '已发布', key: 2 }
];
const releaseList = [
  {
    icon: 'system-uicons:arrow-up',
    value: '发布',
    onClick: (row: any) => {}
  }
];
const offList = [
  {
    icon: 'system-uicons:arrow-down',
    value: '下架',
    onClick: (row: any) => {}
  }
];
const actionslist = [
  // {
  //   icon: 'ri:folder-history-line',
  //   value: '历史版本',
  //   onClick: (row: any) => {
  //     routerPush({
  //       name: 'data-model_history-version'
  //     });
  //   }
  // },
  // {
  //   icon: 'mdi:google-physical-web',
  //   value: '物理化',
  //   onClick: (row: any) => {
  //     routerPush({
  //       name: 'data-model_physicalization'
  //     });
  //   }
  // },
  {
    localIcon: 'Arrow_Down_Up',
    value: 'DDL转换',
    onClick: (row: any) => {
      ddlRef.value.open(row);
    }
  },
  {
    icon: 'ic:outline-cloud-sync',
    value: '质检',
    onClick: (row: any) => {
      routerPush({
        name: 'data-model_model-quality-check',
        query: {
          record: JSON.stringify(row)
        }
      });
    }
  },
  {
    localIcon: 'news-line',
    value: '详情',
    onClick: (row: any) => {
      addClick({ id: row.id }, 3);
    }
  }
];
const npopconfirmList = [
  {
    icon: 'ic:outline-cloud-sync',
    value: '更新',
    info: '是否确认更新模型信息',
    onPositiveClick: async (row: any) => {
      const params = {
        tableList: [row.modelName],
        dbKey: row.dbKey,
        modelTypeId: row.modelTypeId,
        dbType: row.dbType
      };
      const { error } = await importModel(params);
      if (!error) {
        window.$message?.success('更新成功');
        loadData();
      }
    }
  },
  {
    localIcon: 'delete',
    value: '删除',
    info: '此操作将永久删除该数据, 是否继续?',
    onPositiveClick: (row: any) => {
      deleteHandle(row.id as string, 1);
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
      title: '模型名称',
      key: 'modelName'
    },
    {
      title: '模型描述',
      key: 'modelRemark'
    },
    {
      title: '来源数据库',
      key: 'dbKey'
    },
    {
      title: '导入时间',
      key: 'createDate'
    },
    {
      title: '操作',
      key: 'actions',
      width: 320,
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
                  onClick: () => {
                    v.onClick(rowData);
                  }
                },
                {
                  default: () => v.value
                }
              );
            })
            .concat(
              npopconfirmList.map(npopconfirmItem => {
                return h(
                  NPopconfirm,
                  {
                    onPositiveClick: async () => {
                      npopconfirmItem.onPositiveClick(rowData);
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
                            return h(
                              NIcon,
                              { size: 16 },
                              {
                                default: () => [
                                  h(
                                    SvgIcon,
                                    npopconfirmItem.localIcon
                                      ? { localIcon: npopconfirmItem.localIcon }
                                      : npopconfirmItem.icon
                                      ? { icon: npopconfirmItem.icon }
                                      : {}
                                  )
                                ]
                              }
                            );
                          }
                        },
                        {
                          default: () => npopconfirmItem.value
                        }
                      );
                    },
                    default: () => npopconfirmItem.info
                  }
                );
              })
            )
        );
      }
    }
  ];
};
const columns = createColumns();
let tabledata = reactive([]);
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: (page: number) => {
    pagination.page = page;
    loadData();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    loadData();
  }
});
// function matchUpdateshow(value: any) {
//   iconname.value = value ? 'ep:arrow-up' : 'ep:arrow-down';
// }
// function importUpdateshow(value: any) {
//   importiconname.value = value ? 'ep:arrow-up' : 'ep:arrow-down';
// }
function handleCheck(rowKeys: DataTableRowKey[]) {
  checkedRowKeysRef.value = rowKeys;
}
function addClick(item: any, type: number) {
  routerPush({
    name: 'data-model_add',
    query: {
      type,
      record: JSON.stringify(item),
      metaTitle:
        type === 1
          ? '新建模型'
          : type === 2
          ? '编辑模型'
          : type === 3
          ? '模型详情'
          : type === 4
          ? 'DDL导入模型'
          : type === 5
          ? '导入模型'
          : ''
    }
  });
}
// function imprtsTypeSelect(key: number) {
//   // 1:DDL导入 2:数据库导入
//   if (key === 1) {
//     addClick({}, 4);
//   } else {
//     addClick({}, 5);
//   }
// }
// function matchSelect(key: number) {
//   if (key === 3) {
//     // 批量物理化
//     matchPhysicalRef.value.open();
//   }
// }
function changeTreeNode(keys: string[]) {
  console.log('选中项改变');

  if (keys.length !== 0) {
    selectedKey.value = keys[0];
    // 选中层级改变，右边列表重新请求
    loadData(1);
  }
}
async function init() {
  const { data } = await getModelTypeTreeList();
  treeData.value = (data || []) as any;
  if (!selectedKey.value) {
    selectedKey.value = data ? (data as any)[0].id : '';
  }
}
function resetClick() {
  queryKey.value = '';
  loadData(1);
}
async function deleteHandle(ids: string, deleteCount: number) {
  const { error } = await deleteModel(ids as string);
  if (!error) {
    window.$message?.success('删除成功');
    await reCalculatePage(deleteCount, pagination);
    loadData();
  }
}
async function loadData(arg?: any) {
  if (arg === 1) {
    pagination.page = 1;
  }
  startLoading();
  const params = {
    modelTypeId: selectedKey.value,
    page: pagination.page,
    size: pagination.pageSize,
    queryKey: queryKey.value
  };
  const { data } = await getModelList(params);
  endLoading();
  tabledata = data && (data as any).list ? (data as any).list : [];
  pagination.itemCount = data && data.total ? data.total : 0;
  console.log(pagination.itemCount, pagination, 'pagination.itemCount');
}
onActivated(async () => {
  await init();
  loadData();
});
</script>

<style lang="scss" scoped>
:deep(.n-tree .n-tree-node-switcher.n-tree-node-switcher--expanded) {
  transform: rotate(0deg);
}
.left-slide {
  background: #fff;
  padding: 20px;
}
</style>
