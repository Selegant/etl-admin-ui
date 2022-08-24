<template>
  <div class="wowjoy-logo">
<!--    <router-link :to="{name:'index'}">-->
    <div>
      <img src="~@/assets/wowjoy-logo.svg" alt="logo" width="100px">
    </div>
    <div style=" margin: 38px 0px;padding-left: 14px;color: #ffffff;font-size: 16px;padding-top: 5px" >
      {{ title }}
    </div>
<!--    <span v-if="showTitle" style="color: #ffffff;font-size: 18px;margin-top: 25px;height: 30px">{{ title }}</span>-->
<!--    </router-link>-->
  </div>
</template>

<script>
export default {
  name: 'Logo',
  props: {
    title: {
      type: String,
      default: '数据采集平台',
      required: false
    },
    showTitle: {
      type: Boolean,
      default: true,
      required: false
    }
  }
}
</script>

<style scoped>
.wowjoy-logo{
  position: relative;
  height: 64px;
  padding-left: 24px;
  overflow: hidden;
  line-height: 64px;
  background: #002140;
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
  display: flex;
  align-items: center;
}
</style>
