<template>
  <n-modal
    v-model:show="visible"
    :show-icon="false"
    :mask-closable="false"
    preset="dialog"
    :title="title"
    :on-close="close"
    style="width: 800px"
  >
    <n-form
      ref="form"
      class="pl-24px mt-14px"
      :model="model"
      :rules="rules"
      :label-width="125"
      label-placement="left"
      require-mark-placement="right-hanging"
      size="medium"
    >
      <n-grid x-gap="20">
        <n-form-item-gi :span="12" label="数据元字段名称" path="fieldName">
          <n-input v-model:value="model.fieldName" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="数据元中文名称" path="metadataCaptioon">
          <n-input v-model:value="model.metadataCaptioon" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="数据类型代码" path="dataTypeCode">
          <n-select v-model:value="model.dataTypeCode" :options="getDictType('data_type_code')" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="值域来源代码" path="rangeSourceCode">
          <n-select
            v-model:value="model.rangeSourceCode"
            :options="getDictType('range_parent_code')"
            clearable
            @update:value="rangeSourceCodeChange"
          />
        </n-form-item-gi>
        <n-form-item-gi
          v-if="model.rangeSourceCode === 8 || model.rangeSourceCode === '8'"
          :span="12"
          label="公共值域父类"
          path="rangeParentCode"
        >
          <n-select
            v-model:value="model.rangeParentCode"
            label-field="dictname"
            value-field="dictcode"
            :options="rangeParentList"
            clearable
            filterable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="值域类" path="rangeType">
          <n-select v-model:value="model.rangeType" :options="getDictType('range_type_value')" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="数据元标识符" path="metadataIdentifier">
          <n-input v-model:value="model.metadataIdentifier" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="数据元定义" path="metadataDefine">
          <n-input v-model:value="model.metadataDefine" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="长度" path="valueLength">
          <n-input v-model:value="model.valueLength" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="是否脱敏" path="desensitizationFlag">
          <n-select
            v-model:value="model.desensitizationFlag"
            :options="desensitizationFlagList"
            @update:value="model.ruleCode = null"
          />
        </n-form-item-gi>
        <n-form-item-gi v-if="model.desensitizationFlag === 1" :span="12" label="脱敏规则" path="ruleCode">
          <n-select
            v-model:value="model.ruleCode"
            :options="ruleList"
            label-field="ruleCaptioon"
            value-field="ruleCode"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="备注" path="remark">
          <n-input v-model:value="model.remark" :rows="2" type="textarea" />
        </n-form-item-gi>
      </n-grid>
    </n-form>
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
import type { FormRules } from 'naive-ui';
import {
  standMetaInfoPublicDict,
  desenRuleList,
  standMetaInfoSave,
  standMetaInfoDetail,
  countryMetaInfoSave,
  countryMetaInfoPublicDict,
  countryMetaInfoDetail
} from '@/service';
import { getDictType } from '@/utils';
interface Emits {
  (e: 'close'): void;
}
const emit = defineEmits<Emits>();
const visible = ref<boolean>(false);
const title = ref('');
const activeName = ref('');
const createFormData = () => ({
  fieldName: '',
  metadataCaptioon: '',
  metadataIdentifier: '',
  metadataDefine: '',
  dataTypeCode: null,
  valueLength: '',
  remark: '',
  ruleCode: null,
  rangeSourceCode: null,
  rangeType: null,
  rangeParentCode: null,
  desensitizationFlag: 0
});
const ruleList = ref([]);
const dataTypeList = ref([
  { label: '字符串', value: '1' },
  { label: '数值', value: '2' },
  { label: '时间', value: '3' }
]);
const desensitizationFlagList = ref([
  { label: '否', value: 0 },
  { label: '是', value: 1 }
]);
const model = reactive(createFormData());
const rules = reactive<FormRules>({
  fieldName: [{ required: true, trigger: 'blur', message: '请输入数据元字段名称' }],
  metadataCaptioon: [{ required: true, trigger: 'blur', message: '请输入数据元中文名称' }],
  dataTypeCode: [{ required: true, trigger: 'blur', message: '请选择数据类型代码' }]
});
const submitloading = ref(false);
const form = ref();
function rangeSourceCodeChange() {
  model.rangeParentCode = null;
}
function handleSubmit() {
  form.value?.validate(async (errors: any) => {
    if (!errors) {
      submitloading.value = true;
      const { error } = await (activeName.value === '1' ? standMetaInfoSave : countryMetaInfoSave)(model);
      submitloading.value = false;
      if (!error) {
        window.$message?.success(`${title.value}成功`);
        emit('close');
        close();
      }
    }
  });
}
const rangeParentList = ref([]);
async function getStandMetaInfoPublicDict() {
  const { error, data } = await (activeName.value === '1' ? standMetaInfoPublicDict : countryMetaInfoPublicDict)();
  if (!error) {
    rangeParentList.value = data ? data : [];
  }
}
async function getDesenRuleList() {
  const { error, data } = await desenRuleList();
  if (!error) {
    ruleList.value = data ? data : [];
  }
}
async function getStandMetaInfoDetail(incrementId: any) {
  const { error, data } = await (activeName.value === '1' ? standMetaInfoDetail : countryMetaInfoDetail)({
    incrementId
  });
  if (!error) {
    Object.assign(model, data);
    model.desensitizationFlag = model.desensitizationFlag ? 1 : 0;
  }
}
function open(record: any, tabName: string) {
  title.value = record ? '编辑数据元' : '新增数据元';
  activeName.value = tabName;
  // folderObj不存在表示左侧树结构没有数据，开始创建第一层分类
  if (record) {
    getStandMetaInfoDetail(record.incrementId);
    // Object.assign(model, record);
  }
  getStandMetaInfoPublicDict();
  getDesenRuleList();
  visible.value = true;
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

<style lang="scss" scoped></style>
