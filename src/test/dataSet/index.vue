<template>
  <div class="nation-container standrad">
    <a-tabs v-model="activeName">
      <!-- <a-tab-pane key="Drugs" tab="药品数据标准" /> -->
      <a-tab-pane key="Platform" tab="平台数据集" />
      <!-- <a-tab-pane key="Nation" tab="国家数据集" /> -->
    </a-tabs>
    <keep-alive>
      <component :is="activeName" :key="activeName" :type="activeName" />
    </keep-alive>
  </div>
</template>

<script>
import Nation from "./container.vue";
import Platform from "./container.vue";
export default {
  name: "DataSet",
  components: {
    Nation,
    Platform
  },
  data() {
    return {
      activeName: "Platform",
    };
  },
  provide() {
    return {
      isNation: false,
      isOrg: false,
    };
  },
  mounted() {},
};
</script>

<style lang="less" scoped>
.nation-container{
    height:calc(100vh - 204px);
    background: #fff;
    padding:0 14px 0;
}
/deep/ .ant-tabs-ink-bar.ant-tabs-ink-bar-animated{
  background-color: #198EEB !important;
}
/deep/.ant-tabs-bar{
    margin:0 !important;
}
// /deep/ .ant-form-item{
//     width: 100%;
//     display: flex;
//     .ant-form-item-control-wrapper{
//         flex: 1;
//     }
// }
</style>
