<template>
  <n-modal
    v-model:show="visible"
    :show-icon="false"
    :mask-closable="false"
    preset="dialog"
    :title="title"
    :on-close="close"
    style="width: 600px"
  >
    <n-form
      ref="form"
      class="pl-44px mt-14px"
      :model="model"
      :rules="rules"
      label-placement="left"
      require-mark-placement="right-hanging"
      size="medium"
    >
      <n-space>
        <n-form-item label="模型分类名称" path="modelTypeName">
          <n-input v-model:value="model.modelTypeName" style="width: 300px" />
        </n-form-item>
      </n-space>
    </n-form>
    <template #action>
      <div class="flex-center w-full">
        <n-button type="primary" class="mr-16px min-w-100px" :loading="submitloading" @click="addModelLevel">
          确定
        </n-button>
        <n-button ghost class="min-w-100px" @click="close">取消</n-button>
      </div>
    </template>
  </n-modal>
</template>
<script lang="ts" setup>
import { ref, reactive } from 'vue';
import type { FormRules } from 'naive-ui';
import { saveModelType } from '@/service';
interface Emits {
  (e: 'close'): void;
}
const emit = defineEmits<Emits>();
const visible = ref<boolean>(false);
const title = ref('');
const createFormData = () => ({ pid: '', modelTypeName: '', id: '' });
const model = reactive(createFormData());
const rules = reactive<FormRules>({
  modelTypeName: [{ required: true, trigger: 'blur', message: '请输入模型分类名称' }]
});
const submitloading = ref(false);
const form = ref();
function addModelLevel() {
  form.value?.validate(async (errors: any) => {
    if (!errors) {
      submitloading.value = true;
      const { error } = await saveModelType(model);
      submitloading.value = false;
      if (!error) {
        window.$message?.success(`${title.value}成功`);
        emit('close');
        close();
      }
    }
  });
}
function open(folderObj: any) {
  title.value = '编辑模型目录';
  // folderObj不存在表示左侧树结构没有数据，开始创建第一层分类
  if (!folderObj) {
    model.id = '';
    title.value = '新建模型层级';
    model.pid = '0';
  } else if (folderObj.theTitle) {
    // 新增 多级
    model.id = '';
    title.value = folderObj.theTitle;
    model.pid = folderObj.parentId;
  } else {
    model.id = folderObj.id;
    model.modelTypeName = folderObj.folderName;
    model.pid = folderObj.parentId;
  }
  visible.value = true;
}
function close() {
  Object.keys(model).forEach(key => {
    delete model[key];
  });
  // Object.assign(model, createFormData());
  visible.value = false;
}
defineExpose({
  open
});
</script>

<style lang="scss" scoped></style>
