<template>
  <div class="h-full overflow-hidden">
    <n-card ref="cardRef" class="h-full shadow-sm rounded-16px">
      <common-title title="历史版本"></common-title>
      <n-data-table
        class="mt-14px pl-24px"
        :max-height="maxHeight"
        :columns="columns"
        :data="data"
        :scroll-x="1200"
        :pagination="false"
        :row-key="row => row.id"
      />
      <template #action>
        <div class="flex-center w-full">
          <n-button ghost class="min-w-100px" @click="close">返回</n-button>
        </div>
      </template>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { h, reactive } from 'vue';
import type { DataTableColumns } from 'naive-ui';
import { NTag, NButton, NIcon, useMessage } from 'naive-ui';
import { useRouterPush } from '@/composables';
import SvgIcon from '@/components/custom/svg-icon.vue';
const { routerPush } = useRouterPush();
const maxHeight = window.innerHeight - 400;
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
    editTime: '2023-03-12 00:00:00',
    physicalFlag: false,
    currentVersion: 'v2'
  }
]);
const actionslist = [
  {
    localIcon: 'news-line',
    value: '详情',
    onClick: (row: any) => {
      routerPush({
        name: 'data-model_add',
        query: {
          type: 3,
          record: JSON.stringify(row),
          metaTitle: '模型详情'
        }
      });
    }
  },
  {
    icon: 'mdi:google-physical-web',
    value: '物理化',
    onClick: (row: any) => {
      routerPush({ name: 'data-model_physicalization' });
    }
  }
];
const createColumns = (): DataTableColumns => {
  return [
    {
      title: '序号',
      key: 'key',
      width: 80,
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
      title: '编辑时间',
      key: 'editTime'
    },
    {
      title: '物理化状态',
      key: 'physicalFlag',
      render: row => {
        return h(
          NTag,
          {
            size: 'small',
            color: row.physicalFlag ? { color: '#40DE5A', textColor: '#fff' } : { color: '#c7c4c4', textColor: '#fff' },
            bordered: false
          },
          { default: () => (row.physicalFlag ? '已物理化' : '未物理化') }
        );
      }
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: rowData => {
        return h(
          'div',
          { class: 'flex' },
          actionslist.map(v => {
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
        );
      }
    }
  ];
};
const columns = reactive(createColumns());
function close() {
  routerPush({ name: 'data-model' });
}
</script>

<style lang="scss" scoped>
:deep(.n-card__content) {
  height: 100% !important;
  overflow: auto;
}
</style>
