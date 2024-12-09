<template>
  <div class="h-full overflow-hidden">
    <n-card class="h-full shadow-sm rounded-16px">
      <n-button strong secondary type="primary" class="mb-20px" @click="handleAdd({}, 1)">
        <!--        <n-icon size="22"><svg-icon local-icon="add"></svg-icon></n-icon>-->
        新增数据源
      </n-button>
      <loading-empty-wrapper class="wrapper-content overflow-y-auto" :loading="loading" :empty="empty">
        <n-grid x-gap="12" y-gap="16" cols="3 s:3 m:3 xl:3" responsive="screen">
          <n-grid-item v-for="(item, index) in dataSource" :key="index">
            <n-card
              hoverable
              class="n-card-item rounded-13px"
              :title="item.dbKey"
              :header-style="{
                padding: '10px 20px',
                borderTopLeftRadius: '13px',
                borderTopRightRadius: '13px',
                overflow: 'hidden'
              }"
              :content-style="{ padding: '10px 0px' }"
            >
              <template #header>
                <div>
                  <div class="font-bold" style="color: #333333">
                    {{ item.dbKey }}
                  </div>
                  <div class="" style="color: #999999; font-size: 14px; font-weight: normal">
                    {{ item.dbZhName }}
                  </div>
                </div>
              </template>
              <template #header-extra>
                <div :class="item.aliveFlag ? 'success_tag_header' : 'error_tag_header'">
                  <div v-if="item.aliveFlag">连接成功</div>
                  <div v-else>连接失败</div>
                </div>
              </template>
              <template #action>
                <n-space justify="space-between" align="center">
                  <n-button text type="info" @click="handleAdd(item, 2)">
                    <template #icon>
                      <n-icon>
                        <svg-icon local-icon="edit-box-line"></svg-icon>
                      </n-icon>
                    </template>
                    编辑
                  </n-button>
                  <n-divider vertical class="divider" />
                  <n-button text type="info" @click="handleAdd(item, 3)">
                    <template #icon>
                      <n-icon>
                        <svg-icon local-icon="menu-search-line"></svg-icon>
                      </n-icon>
                    </template>
                    详情
                  </n-button>
                  <n-divider vertical class="divider" />
                  <n-popconfirm positive-text="确定" negative-text="取消" @positive-click="handleDelete(item)">
                    <template #icon>
                      <n-icon>
                        <svg-icon local-icon="error-warning-line"></svg-icon>
                      </n-icon>
                    </template>
                    <template #trigger>
                      <n-button text type="info">
                        <template #icon>
                          <n-icon>
                            <svg-icon local-icon="delete-bin-line"></svg-icon>
                          </n-icon>
                        </template>
                        删除
                      </n-button>
                    </template>
                    确定删除数据源？
                  </n-popconfirm>
                  <n-divider vertical class="divider" />
                  <n-button v-if="item.monitorFlag == 0" text type="info" @click="handleMonitor(item, 1)">
                    <template #icon>
                      <n-icon>
                        <svg-icon local-icon="play-circle-line"></svg-icon>
                      </n-icon>
                    </template>
                    开启监控
                  </n-button>
                  <n-button v-else text type="info" @click="handleMonitor(item, 0)">
                    <template #icon>
                      <n-icon>
                        <svg-icon local-icon="pause-circle-line"></svg-icon>
                      </n-icon>
                    </template>
                    关闭监控
                  </n-button>
                </n-space>
              </template>
              <n-space justify="space-between" align="center">
                <div style="color: #666666">
                  <div class="line-height-14px">
                    <label class="inline-block w-62px text-right">地址：</label>
                    <span>{{ item.host }}</span>
                    <br />
                  </div>
                  <div class="mt-10px line-height-14px">
                    <label class="inline-block w-62px text-right">端口：</label>
                    <span>{{ item.port }}</span>
                    <br />
                  </div>
                  <div class="flex mt-10px line-height-14px">
                    <label class="inline-block w-62px text-right">库名：</label>
                    <div class="flex-1 truncate text-left">
                      {{ item.dbKey }}
                    </div>
                  </div>
                  <div class="mt-10px line-height-14px">
                    <label class="inline-block w-62px text-right">用户：</label>
                    <span>{{ item.username }}</span>
                    <br />
                  </div>
                </div>
                <div style="padding-right: 50px">
                  <n-icon size="70">
                    <svg-icon
                      :local-icon="
                        item.dbType == 'MYSQL'
                          ? 'mysql'
                          : item.dbType == 'ORACLE'
                          ? 'oracle'
                          : item.dbType == 'SQLSERVER'
                          ? 'sqlserver'
                          : item.dbType == 'STARROCKS'
                          ? 'starrocks'
                          : ''
                      "
                    ></svg-icon>
                  </n-icon>
                </div>
              </n-space>
            </n-card>
          </n-grid-item>
        </n-grid>
      </loading-empty-wrapper>
    </n-card>
    <!-- <datasource-modal
      ref="datasourceModalRef"
      @close="
        () => {
          getData();
        }
      "
    ></datasource-modal> -->
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRouterPush } from '@/composables';
import { useLoadingEmpty } from '@/hooks';
import { request } from '@/service/request';
import SvgIcon from '@/components/custom/svg-icon.vue';
// import DatasourceModal from '../component/datasource-modal.vue';
const { routerPush } = useRouterPush();
const { loading, startLoading, endLoading, empty, setEmpty } = useLoadingEmpty();
interface dataItem {
  dbZhName: string;
  dbKey: string;
  dbType: string;
  host: string;
  port: string;
  jdbcUrl: string;
  username: string;
  monitorFlag: number;
  aliveFlag: number;
}
const datasourceModalRef = ref<any>();
const dataSource = ref<dataItem[]>([]);
async function getData() {
  startLoading();
  const { data } = await request.get(`/data/datasource/list`);
  endLoading();
  if (data) {
    dataSource.value = (data as dataItem[]) || [];
  }
  setEmpty(!dataSource.value.length);
}
function handleAdd(item: any, type: number) {
  // type:1新增 2编辑 3详情
  // datasourceModalRef.value.open(item, type);
  routerPush({
    name: 'datasource_add',
    query: {
      type,
      record: JSON.stringify(item),
      metaTitle: type === 1 ? '新增数据源' : type === 2 ? '编辑数据源' : '数据源详情'
    }
  });
}
function handleMonitor(item: any, monitorFlag: number) {
  // type:1新增 2编辑 3详情
  // datasourceModalRef.value.open(item, type);
  const params = { id: item.id, monitorFlag };
  request.post(`/data/datasource/updateMonitor`, params).then(res => {
    console.log(res, 'deleteres');
    if (!res.error) {
      if (monitorFlag === 1) {
        window.$message?.success('开启监控成功');
      } else {
        window.$message?.success('关闭监控成功');
      }
      getData();
    }
  });
}
function handleDelete(record: any) {
  request.delete(`/data/datasource/delete?dbKey=${record.dbKey}`).then(res => {
    console.log(res, 'deleteres');
    if (!res.error) {
      window.$message?.success('删除成功');
      getData();
    }
  });
}
onMounted(() => {
  console.log('数据源列表页加载中');

  getData();
});
</script>

<style lang="scss" scoped>
:deep(.n-card__content) {
  height: 100% !important;
}
.wrapper-content {
  height: calc(100% - 54px);
}
.divider {
  background-color: rgb(var(--primary-color));
}
:deep(.n-card-item.n-card > .n-card-header .n-card-header__main) {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
:deep(.n-card > .n-card__action) {
  padding: 5px 30px;
  border-bottom-left-radius: 13px;
  border-bottom-right-radius: 13px;
}

.success_tag_header {
  width: 120px;
  line-height: 20px;
  text-align: center;
  background-color: #4bcfb1; /* 标题栏背景色 */
  color: #fff; /* 标题栏文字颜色 */
  padding: 3px;
  position: relative;
  top: 0;
  right: 0;
  transform: translateY(170%) rotate(45deg) translateX(36%); /* 旋转标题栏 */
  transform-origin: 145% 0; /* 旋转原点在右上角 */
}

.error_tag_header {
  width: 120px;
  line-height: 20px;
  text-align: center;
  background-color: #d03050; /* 标题栏背景色 */
  color: #fff; /* 标题栏文字颜色 */
  padding: 3px;
  position: relative;
  top: 0;
  right: 0;
  transform: translateY(170%) rotate(45deg) translateX(36%); /* 旋转标题栏 */
  transform-origin: 145% 0; /* 旋转原点在右上角 */
}
</style>
