<template>
  <div class="h-full overflow-hidden">
    <n-card ref="cardRef" :title="(route.query.metaTitle as string)" class="h-full shadow-sm rounded-16px">
      <template #header>
        <child-card-title @back="close"></child-card-title>
      </template>
      <common-title title="基础信息"></common-title>
      <n-form
        ref="form"
        class="pl-24px mt-14px"
        :model="model"
        :rules="rules"
        label-width="80"
        label-placement="left"
        require-mark-placement="right-hanging"
        size="medium"
      >
        <n-form-item v-if="Type !== 5" label="模型名称" path="modelName">
          <span>{{ model.modelName }}</span>
        </n-form-item>
        <n-form-item v-if="Type !== 5" label="模型描述" path="modelRemark">
          <span>{{ model.modelRemark }}</span>
        </n-form-item>
        <n-form-item v-if="Type === 5" label="数据源" path="dbKey">
          <n-select
            v-model:value="model.dbKey"
            :options="originalList"
            class="w-300px"
            @update:value="updateOriginal"
          />
        </n-form-item>
        <n-input
          v-if="Type !== 3"
          v-model:value="queryKey"
          clearable
          class="ml-80px mb-24px"
          placeholder="关键词搜索"
          style="width: 260px"
        >
          <template #suffix>
            <n-icon size="16"><svg-icon local-icon="search"></svg-icon></n-icon>
          </template>
        </n-input>
      </n-form>
      <common-title v-if="Type === 3" title="字段信息"></common-title>
      <n-data-table
        v-if="Type === 3"
        class="mt-14px pl-24px"
        :columns="columns"
        :data="detailData"
        :pagination="false"
        :row-key="row => row.id"
      />
      <n-data-table
        v-if="Type === 5"
        class="pl-44px"
        :columns="importcolumns"
        :data="importTableData"
        :pagination="false"
        :row-key="row => row.tableName"
        @update:checked-row-keys="handleCheck"
      />
      <template v-if="Type !== 3" #action>
        <div class="flex-center w-full">
          <n-button type="primary" class="mr-16px min-w-100px" :loading="submitloading" @click="handleSumbit">
            确定
          </n-button>
          <!-- <n-button ghost class="min-w-100px" @click="close">返回</n-button> -->
        </div>
      </template>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { h, ref, reactive, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { FormRules, DataTableColumns, DataTableRowKey } from 'naive-ui';
import { NInput, NSelect, NCheckbox, NButton } from 'naive-ui';
import { getTableList, importModel, getModelDetail } from '@/service';
import { useRouterPush } from '@/composables';
import { request } from '@/service/request';
const route = useRoute();
const { routerPush, routerBack } = useRouterPush();
const createFormData = () => ({
  id: '',
  modelName: '',
  modelRemark: '',
  dbType: undefined,
  dbKey: null,
  modelTypeId: ''
});
const model = reactive(createFormData());
const rules = reactive<FormRules>({
  dbKey: [{ required: true, trigger: 'blur', message: '请选择数据源' }]
});
const form = ref();
// const formDisabled = ref<boolean>(false);
const submitloading = ref<boolean>(false);
const Type = ref();
const originalList = ref([]);
const detailData = ref([]);
const queryKey = ref('');
watch(
  () => queryKey.value,
  () => {
    getTableLists();
  }
);
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
      title: '字段名称',
      key: 'fieldName'
    },
    {
      title: '字段类型',
      key: 'fieldTypeName'
    },
    {
      title: '描述',
      key: 'remarks'
    },
    {
      title: '主键',
      key: 'isPrimaryKey',
      render: row => {
        return h(NCheckbox, {
          checked: row.isPrimaryKey === 0,
          disabled: true
        });
      }
    },
    {
      title: '非空',
      key: 'nullable',
      render: row => {
        return h(NCheckbox, {
          checked: row.nullable === '0',
          disabled: true
        });
      }
    },
    {
      title: '长度',
      key: 'displaySize'
    }
  ];
};
const columns = reactive(createColumns());
const createImportColumn = (): DataTableColumns => {
  return [
    {
      type: 'selection'
    },
    {
      title: '表名',
      key: 'tableName'
    },
    {
      title: '表注释',
      key: 'remarks'
    }
  ];
};
const importcolumns = reactive(createImportColumn());
const importTableData = ref([]);
function close() {
  Object.assign(model, createFormData());
  // routerPush({ name: 'data-model' });
  routerBack();
}
function updateOriginal(val, option) {
  model.dbType = option.dbType;
  getTableLists();
}
function getTableLists() {
  const params = {
    dbKey: model.dbKey,
    queryKey: queryKey.value
  };
  getTableList(params).then(res => {
    if (res.data && res.data.length) {
      importTableData.value = res.data as any;
    } else {
      importTableData.value = [];
    }
  });
}
async function initDbList() {
  const { data } = await request.get(`/data/datasource/list`);
  if (data) {
    originalList.value = (data as any)?.map(v => {
      return { label: v.dbKey, value: v.dbKey, dbType: v.dbType };
    });
  }
}
const checkedRowKeysRef = ref<DataTableRowKey[]>([]);
function handleCheck(rowKeys: DataTableRowKey[]) {
  checkedRowKeysRef.value = rowKeys;
}
function handleSumbit() {
  form.value?.validate(async (errors: any) => {
    if (!errors) {
      if (!checkedRowKeysRef.value.length) {
        window.$message?.warning('请选择表名');
        return;
      }
      submitloading.value = true;
      const params = {
        tableList: checkedRowKeysRef.value,
        dbKey: model.dbKey,
        modelTypeId: model.modelTypeId,
        dbType: model.dbType
      };
      const { error } = await importModel(params);
      submitloading.value = false;
      if (!error) {
        window.$message?.success('保存成功');
        close();
      }
    }
  });
}
onMounted(async () => {
  const type = route.query.type ? Number(route.query.type) : 1;
  const currentItem = route.query.record ? JSON.parse(route.query.record as string) : {};
  Type.value = type;
  Object.assign(model, currentItem);
  if (type === 5) {
    // 数据库导入模型
    initDbList();
  }
  if (type === 3) {
    const { data } = await getModelDetail(model.id);
    if (data) {
      model.modelName = data.modelName;
      model.modelRemark = data.modelRemark;
      detailData.value = data.columns || [];
    } else {
      detailData.value = [];
    }
  }
});
</script>

<style lang="scss" scoped>
:deep(.n-card__content) {
  height: 100% !important;
  overflow: auto;
}
.add-btn {
  border-color: #edeaea;
}
</style>
