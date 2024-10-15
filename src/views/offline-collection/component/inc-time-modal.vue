<template>
  <n-modal
    v-model:show="visible"
    :show-icon="false"
    :mask-closable="false"
    preset="dialog"
    title="修改增量时间"
    :on-close="close"
    style="width: 50%"
  >
    <div class="pl-24px mt-14px">
      <n-space align="center">
        <span>增量时间：</span>
        <n-date-picker
          v-model:formatted-value="model.incStartTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          format="yyyy-MM-dd HH:mm:ss"
          placeholder="yyyy-MM-dd HH:mm:ss"
          type="datetime"
        />
      </n-space>
    </div>

    <template #action>
      <div class="flex-center w-full">
        <n-button type="primary" class="mr-16px min-w-100px" :loading="submitloading" @click="handleSubmit">
          确定
        </n-button>
        <n-button ghost class="min-w-100px" @click="close">取消</n-button>
      </div>
    </template>
  </n-modal>
</template>
<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { batchChangeCollectTime } from '@/service';
interface Emits {
  (e: 'close'): void;
}
import { useRoute } from 'vue-router';
const route = useRoute();
const emit = defineEmits<Emits>();
const visible = ref<boolean>(false);
const submitloading = ref<boolean>(false);
const createFormData = () => ({
  incStartTime: null
});
const model = reactive(createFormData());
const codeslist = ref([]);
function open(codes: any) {
  visible.value = true;
  codeslist.value = codes || [];
}
async function handleSubmit() {
  // if (route.name === 'project-management_task_list') {
  const { error } = await batchChangeCollectTime({ incStartTime: model.incStartTime || '', codes: codeslist.value });
  if (!error) {
    window.$message?.success(`批量修改增量时间成功`);
    close();
    emit('close');
  }
  // }
}

function close() {
  Object.keys(model).forEach(key => {
    delete model[key];
  });
  visible.value = false;
}
defineExpose({
  open
});
</script>

<style lang="scss" scoped>
:deep(.n-dialog.n-modal) {
  min-height: auto;
}
</style>
