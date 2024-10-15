<template>
  <div class="h-full overflow-hidden">
    <n-card ref="cardRef" :title="(route.query.metaTitle as string)" class="h-full shadow-sm rounded-16px">
      <template #header>
        <child-card-title @back="close"></child-card-title>
      </template>
      <offline-collection-add ref="offlineCollectionAddRef"></offline-collection-add>
      <template v-if="Type !== 3" #action>
        <div class="flex-center w-full">
          <n-button type="primary" class="mr-16px min-w-100px" :loading="submitloading" @click="handleSubmit">
            确定
          </n-button>
        </div>
      </template>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  getDblist,
  getTableList,
  getDbmetaColumns,
  getColumnsBySql,
  qualityCheckJobSave,
  offCollectionDetail,
  getProjectList,
  offCollectionSaveAll
} from '@/service';
import { useRouterPush } from '@/composables';
import OfflineCollectionAdd from '@/components/common/offline-collection-add.vue';
const { routerPush } = useRouterPush();
const offlineCollectionAddRef = ref();
const route = useRoute();
const submitloading = ref<boolean>(false);
const Type = ref();
function handleSubmit() {
  if (Type.value !== 4) {
    offlineCollectionAddRef.value.form?.validate((errors: any) => {
      if (!errors) {
        submitloading.value = true;
        qualityCheckJobSave(offlineCollectionAddRef.value.model)
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
  } else {
    if (!offlineCollectionAddRef.value.model.jobsInfo.length) {
      window.$message?.warning('任务列表不能为空');
      return;
    }
    let flag = true;
    for (let i = 0; i < offlineCollectionAddRef.value.model.jobsInfo.length; i++) {
      const item = offlineCollectionAddRef.value.model.jobsInfo[i];
      if (!item.projectCode) {
        flag = false;
        window.$message?.warning(`任务列表第${i}行的所属项目不能为空`);
        break;
      }
      if (!item.name) {
        flag = false;
        window.$message?.warning(`任务列表第${i}行的任务名称不能为空`);
        break;
      }
      if (!item.description) {
        flag = false;
        window.$message?.warning(`任务列表第${i}行的任务描述不能为空`);
        break;
      }
      if (!item.writeMode) {
        flag = false;
        window.$message?.warning(`任务列表第${i}行的更新类型不能为空`);
        break;
      }
      if ((item.writeMode === 'update' || item.writeMode === 'replace') && !item.uniqueColumn) {
        flag = false;
        window.$message?.warning(`任务列表第${i}行的更新字段不能为空`);
        break;
      }
      if (!item.isIncrement && item.isIncrement !== 0) {
        flag = false;
        window.$message?.warning(`任务列表第${i}行的采集类型不能为空`);
        break;
      }
      if (item.isIncrement === 1 && !item.incColumn) {
        flag = false;
        window.$message?.warning(`任务列表第${i}行的增量字段不能为空`);
        break;
      }
      if (item.isIncrement === 1 && !item.incStartTime) {
        flag = false;
        window.$message?.warning(`任务列表第${i}行的增量时间不能为空`);
        break;
      }
    }
    if (flag) {
      submitloading.value = true;
      const arr = offlineCollectionAddRef.value.model.jobsInfo.map(v => {
        return {
          ...v,
          uniqueColumn: v.uniqueColumn.join(',')
        };
      });
      offCollectionSaveAll({ jobsInfo: arr })
        .then(res => {
          if (!res.error) {
            window.$message?.success('批量创建成功');
            close();
          }
        })
        .finally(() => {
          submitloading.value = false;
        });
    }
  }
}
function close() {
  offlineCollectionAddRef.value.close();
  routerPush({ name: 'data-comparison' });
}
onMounted(() => {
  const type = route.query.type ? Number(route.query.type) : 1;
  Type.value = type;
});
</script>

<style lang="scss" scoped>
:deep(.n-card__content) {
  height: 100% !important;
  overflow: auto;
}
// .border-style {
//   border-color: #eeebeb;
// }
// .table-item:nth-child(even) {
//   background: #f9f5f5;
// }
// .checked {
//   background: #fffbe0 !important;
// }
</style>
