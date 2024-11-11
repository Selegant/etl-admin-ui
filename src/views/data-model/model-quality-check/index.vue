<template>
  <div class="h-full overflow-hidden">
    <n-card ref="cardRef" :title="(route.meta.title as string)" class="h-full shadow-sm rounded-16px">
      <template #header>
        <child-card-title @back="close"></child-card-title>
      </template>
      <common-title title="模型基础信息"></common-title>
      <n-space class="ml-24px mt-10px">
        <n-space>
          <p class="label-name">模型名称:</p>
          <p class="label-value">{{ model.modelName }}</p>
        </n-space>
        <n-space class="ml-40px mr-40px">
          <p class="label-name">模型描述:</p>
          <p class="label-value">{{ model.modelRemark }}</p>
        </n-space>
        <n-space>
          <p class="label-name">模型来源:</p>
          <p class="label-value">{{ model.dbKey }}</p>
        </n-space>
      </n-space>
      <n-tabs v-model:value="tabKey" type="line" animated class="mt-14px">
        <n-tab-pane name="1" tab="数据值域质检">
          <value-range-check></value-range-check>
        </n-tab-pane>
        <n-tab-pane name="2" tab="关联性质检">
          <relevance-check></relevance-check>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useRouterPush } from '@/composables';
const { routerBack } = useRouterPush();
import ValueRangeCheck from '../component/value-range-check.vue';
import RelevanceCheck from '../component/relevance-check.vue';
const route = useRoute();
const createFormData = () => ({});
const model = reactive(createFormData());
const tabKey = ref('1');
function close() {
  routerBack();
}
onMounted(() => {
  const currentItem = route.query.record ? JSON.parse(route.query.record as string) : {};
  Object.assign(model, currentItem);
});
</script>

<style lang="scss" scoped>
:deep(.n-card__content) {
  height: 100% !important;
  overflow: auto;
}
.label-name {
  color: #333;
}
.label-value {
  color: #666;
}
</style>
