<template>
  <n-modal
    v-model:show="visible"
    :show-icon="false"
    :mask-closable="false"
    preset="dialog"
    title="DDL转换"
    :on-close="close"
    style="width: 90%"
  >
    <n-grid>
      <n-gi :span="10" class="mr-20px">
        <p class="h-34px item-content mb-14px">
          <span class="w-90px inline-block text-right">来源数据库：</span>
          {{ model.dbKey }}
        </p>
        <p class="h-34px item-content mb-14px">
          <span class="w-90px inline-block text-right">模型名称：</span>
          {{ model.modelName }}
        </p>
        <div class="h-500px">
          <ace-editor :content="content" :ace-config="aceConfig"></ace-editor>
        </div>
      </n-gi>
      <n-gi :span="14">
        <p class="flex-y-center mb-14px">
          <span>目标数据源：</span>
          <n-select v-model:value="model.targetDbKey" :options="originalList" style="width: 50%" />
        </p>
        <n-button class="mb-14px" type="primary" :loading="submitloading" @click="ddlClick">DDL转换</n-button>
        <div class="h-500px">
          <ace-editor :content="contentTwo" :ace-config="aceConfig"></ace-editor>
        </div>
      </n-gi>
    </n-grid>
  </n-modal>
</template>
<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { saveModelType, getDblist, getTableDDL, getDDLCreateTableSQL } from '@/service';
// import AceEditor from '@/components/common/ace-editor.vue';
import { request } from '@/service/request';
const visible = ref<boolean>(false);
const createFormData = () => ({ dbKey: '', modelName: '', targetDbKey: null });
const model = reactive(createFormData());
const originalList = ref([]);
const content: any = ref('');
const contentTwo: any = ref('');
const submitloading = ref(false);
const aceConfig = reactive({
  lang: 'html',
  theme: 'monokai',
  readOnly: false,
  options: {
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true,
    tabSize: 2,
    showPrintMargin: false,
    fontSize: 13
  }
});
async function ddlClick() {
  contentTwo.value = '';
  if (!model.targetDbKey) {
    window.$message?.warning('请选择目标数据源');
  } else {
    submitloading.value = true;
    const { error, data } = await getDDLCreateTableSQL({
      originDbKey: model.dbKey,
      targetDbKey: model.targetDbKey,
      originTable: model.modelName
    });
    submitloading.value = false;
    if (!error) {
      contentTwo.value = data ? (data as Array<string>)[0] : '';
    }
  }
}
async function getOriginalList() {
  const { data } = await request.get(`/data/datasource/list`);
  if (data) {
    originalList.value = (data as any)?.map((v: any) => {
      return { label: `${v.dbKey} (类型：${v.dbType})`, value: v.dbKey };
    });
  }
}
async function tableDDL() {
  const { error, data } = await getTableDDL({ dbKey: model.dbKey, tableName: model.modelName });
  if (!error) {
    content.value = data || '';
  }
}
function open(obj: any) {
  visible.value = true;
  model.dbKey = obj.dbKey;
  model.modelName = obj.modelName;
  getOriginalList();
  tableDDL();
}
function close() {
  Object.keys(model).forEach(key => {
    delete model[key];
  });
  content.value = '';
  contentTwo.value = '';
  // Object.assign(model, createFormData());
  visible.value = false;
}
defineExpose({
  open
});
</script>

<style lang="scss" scoped>
.item-content {
  line-height: 34px;
}
</style>
