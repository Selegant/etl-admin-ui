<template>
  <div class="analysis-contain">
    <div class="analysis-page-content">
      <div class="top">
        <div class="top-left">{{timeStr}}</div>
        <span class="top-center" :style="{width:getSizeByScreen(680)+'px'}">数据治理平台数据监控</span>
        <div class="top-right">
          <a-button type="primary" ghost @click="gotobsshow">
            投屏
          </a-button>
        </div>
      </div>
      <div class="center">
        <div class="center-left">
          <div class="center-item center-left-one">
            <div class="title">离线数据采集</div>
            <a-spin :spinning="leftOneLoading">
              <div>
                <div v-for="(item,index) in leftOneTopList" :key="index" class="center-left-one-detail-item">
                  <p class="center-left-one-detail-item-title">{{item.title}}</p>
                  <div class="detail-content">
                      <div v-for="(detailitem,detailindex) in item.details" :key="detailindex">{{index==1&&detailindex==2?'修\xa0\xa0\xa0\xa0改：':detailitem.name}}<span class="value" :style="{color:detailitem.color}">{{detailitem.value}}{{detailitem.unit||''}}</span></div>
                  </div>
                </div>
              </div>
              <div style="height:189px;">
                <bar-charts :bar-item="barItem" class="barone" style="width:100%;height:100%;"></bar-charts>
                <!-- <div v-else class="no-data"><svg-icon icon-class="noData"/><span>无数据</span></div> -->
              </div>
            </a-spin>
          </div>
          <div class="center-item center-left-two">
            <div class="title">实时数据采集</div>
            <a-spin :spinning="leftTwoLoading">
              <div class="center-left-two-detail-item">
                <p class="center-left-one-detail-item-title">{{leftTwoTop.title}}</p>
                <div class="detail-content">
                    <div v-for="(detailitem,detailindex) in leftTwoTop.details" :key="detailindex">{{detailitem.name}}<span class="value" :style="{color:detailitem.color}">{{detailitem.value}}{{detailitem.unit||''}}</span></div>
                </div>
              </div>
              <div style="height:189px;">
                <bar-charts :bar-item="barTwoItem" class="bartwo" style="width:100%;height:100%;"></bar-charts>
                <!-- <div v-else class="no-data"><svg-icon icon-class="noData"/>无数据</div> -->
              </div>
            </a-spin>
          </div>
          <div class="center-item center-left-three">
            <div class="title">数据清洗</div>
            <a-spin :spinning="leftThreeLoading">
<!--              <div class="center-left-three-top">-->
<!--                <div v-for="(item,index) in leftThreeTopList" :key="index" class="center-left-three-top-item" :style="{background:item.color}">-->
<!--                  <p class="top-item-title">{{item.title}}</p>-->
<!--                  <p class="data-content"><span class="value">{{item.value}}</span>{{item.unit}}</p>-->
<!--                </div>-->
<!--              </div>-->
              <div class="center-left-three-detailtwo-item">
                <p class="center-left-one-detail-item-title">{{leftThreeDetail.title}}</p>
                <div class="detail-content">
                    <div v-for="(detailitem,detailindex) in leftThreeDetail.details" :key="detailindex">{{detailitem.name}}<span class="value" :style="{color:detailitem.color}">{{detailitem.value}}{{detailitem.unit||''}}</span></div>
                </div>
              </div>
              <div class="center-left-three-detailtwo-item">
                <p class="center-left-one-detail-item-title">{{leftThreeTwoDetail.title}}</p>
                <div class="detail-content">
                    <div v-for="(detailitem,detailindex) in leftThreeTwoDetail.details" :key="detailindex">{{detailitem.name}}
                      <p class="value">{{detailitem.value}}{{detailitem.unit||''}}</p>
                    </div>
                </div>
              </div>
            </a-spin>
          </div>
        </div>
        <div id="center-middle" :style="{width:getSizeByScreen(680)+'px'}">
          <div class="center-top">
            <div class="title">全量数据</div>
            <a-spin :spinning="centerOneLoading">
              <div class="center-top-detail">
                <div class="center-top-detail-item" v-for="(item,index) in centerTopList" :key="index" :style="{background:item.color}">
                  <div>
                    <p class="center-top-detail-item-name">{{ item.name }}</p>
                    <p class="center-top-detail-item-left"><span class="center-top-detail-item-num">{{ item.value }}</span>{{ item.unit }}</p>
                  </div>
                  <svg-icon :icon-class="item.image" class="icon"/>
                </div>
              </div>
            </a-spin>
          </div>
          <div class="liquidfill-content">
            <div v-for="(item,index) in liquidfillList" :key="index" class="liquidfill-content-item" :style="{left:getSizeByScreen(item.left)+'px',top:getSizeByScreen(item.top)+'px',width:getSizeByScreen(item.size)+'px',height:getSizeByScreen(item.size)+'px'}" @mouseenter="mouseEnter(index)" @mouseleave="mouseLeave(index)">
              <div class="liquidfill-content-item-content" :class="{'liquidfill-content-item-content':true,'beat':index==1||index==2||index==4,'beattwo':index==3||index==0}">
                <liquidfill-charts :liquidfill-item="item.liquidfillItem"  :style="{width:getSizeByScreen(item.size)+'px',height:getSizeByScreen(item.size)+'px'}"></liquidfill-charts>
              </div>
              <!-- <div class="liquidfill-content-item-content beattwo" v-else>
                <liquidfill-charts :liquidfill-item="item.liquidfillItem"  :style="{width:item.size+'px',height:item.size+'px'}"></liquidfill-charts>
              </div> -->
            </div>
          </div>
        </div>
        <div class="center-right">
          <div class="center-item center-right-one">
            <div class="title">主索引</div>
            <a-spin :spinning="rightOneLoading">
              <div class="center-right-one-top">
                <div class="center-right-one-top-item" v-for="(item,index) of rightOneTopList" :key="index" :style="{background:item.color}">
                  <p class="center-right-one-top-item-name">{{item.name}}</p>
                  <p><span class="center-right-one-top-item-value">{{item.value}}</span>{{item.unit}}</p>
                </div>
              </div>
              <div class="center-right-one-bottom">
                <div class="center-right-one-bottom-item" v-for="(item,index) in rightOneBottomList" :key="index">
                  <pie-charts :pie-item="item.pieItem" style="height:100%;width:100%;"/>
                </div>
              </div>
            </a-spin>
          </div>
          <div class="center-item center-right-two">
            <div class="title">数据质量</div>
            <a-spin :spinning="rightTwoLoading">
              <div class="center-left-three-detail-item">
                <p class="center-left-one-detail-item-title">{{rightTwoDetail.title}}</p>
                <div class="detail-content">
                    <div v-for="(detailitem,detailindex) in rightTwoDetail.details" :key="detailindex">{{detailitem.name}}<span class="value" :style="{color:detailitem.color}">{{detailitem.value}}{{detailitem.unit||''}}</span></div>
                </div>
              </div>
              <div class="center-left-three-detailtwo-item">
                <p class="center-left-one-detail-item-title">{{rightTwoTwoDetail.title}}</p>
                <div class="detail-content">
                    <div v-for="(detailitem,detailindex) in rightTwoTwoDetail.details" :key="detailindex">{{detailitem.name}}
                      <p class="value">{{detailitem.value}}{{detailitem.unit||''}}</p>
                    </div>
                </div>
              </div>
            </a-spin>
          </div>
          <div class="center-item center-right-three">
            <div class="title warning-title">
              <span>告警信息(<span class="warning-num">{{warnTotal}}条</span>)</span>
              <div class="warning-more">查看更多<a-icon type="right" /></div>
<!--              <div class="warning-more" @click="checkAllClick">查看更多<a-icon type="right" /></div>-->
            </div>
            <a-spin :spinning="rightThreeLoading">
              <div class="left-warning-chart">
                <template v-if="warningList.length">
                  <div class="warning-item" v-for="(item,index) in warningList" :key="index">
                    <div class="warning-item-top">
                      <span class="item-title">{{item.alarmTitle}}</span>
                      <span>{{item.alarmTime}}</span>
<!--                      <span><a @click="()=>{$info({'width': 800,'title':'告警详情','content':item.alarmContent})}">详细信息</a></span>-->
                    </div>
                    <div class="warning-item-bottom">
                      <span v-for="(module_item,index) in cutAlarmModule(item.alarmModule)">
                        <span>{{module_item}}</span><a-icon type="swap-right" />
                      </span>
                      <span>{{item.taskName}}任务告警</span>
                    </div>
                  </div>
                </template>
                <div v-else class="no-data"><svg-icon icon-class="noData"/>无数据</div>
              </div>
            </a-spin>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { AnalysisMixin } from '@/mixins/AnalysisMixin'
const liquidfillCommon = {
  isHover:false,
  backgroundColors:[
    {
        offset: 0,
        color: "#fff"
    },
    {
        offset: 0.4,
        color: "#f0f4f6"
    },
    {
        offset: 0.8,
        color: "#6ec4f0"
    },
    {
        offset: 1,
        color: "#50b6eb"
    }
  ],
  colors:[
    {
        offset: 0, color: 'rgba(190,225,243,0.4)' // 0% 处的颜色
    }, {
        offset: 1, color: '#B4E5FF' // 100% 处的颜色
    }
  ],
  mouseoverEvents:()=>{},
  mouseoutEvents:()=>{}
}
const barCommon = {
  tooltipBackcolor:'rgba(0,0,0,0.70)',
  textColor:'#fff',
  gridLeft:1,
  gridRight:26,
  barWidth:24,
  ySplitLineColor:'#E8E8E8',
  xAxisSplitLineShow:false,
  yAxisSplitLineShow:true,
  yAxisAxisLineshow:true,
  moreSeries:true,
  tooltipAxisPointer:'shadow',
  xAxisRotate:50,
  gridTop:15,
  gridBottom:-6,
  xAxisName:'日期',
  yAxisName:'',
  color:['#3AC9A8','#24BEE8'],
  tooltipFormatter: function(params) {
      return params[0].name+'<br/>' + params[0].marker+`   ${params[0].seriesName}：${
      params[0].value == null ? 0 : params[0].value
      }<br/>
      ${params[1].marker}   ${params[1].seriesName}：${
      params[1].value == null ? 0 : params[1].value
      }
      `
  },
}
const rightOnePieCommon = {
  radius:['40%','60%'],
  tooltipFormatter:(params)=>{
      return params.name+'<br>数量：'+params.value+'次'
  },
  labelFormatter:(params)=>{
      return params.value
  },
  legendFormatter: ['{namewidth|{name}}'].join('\n'),
  titleFontSize:12,
  tooltipBack:'rgba(0,0,0,0.70)',
  tooltipColor:'#fff',
  tooltipFontsize:12,
  legendShow: true,
  legendIcon:'rect',
  legendItemWidth:12,
  legendItemHeight:12,
  labelShow: false,
  titleShow: true,
  center:['50%','46%']
}
  export default {
    name: "Analysis",
    mixins:[AnalysisMixin],
    computed:{
    },
    data() {
      return {
        liquidfillCommon,
        rightOneBottomList:[
          {
            pieItem:{
              title:'运行情况',
              color:['#3AC9A8','#FA8383'],
              legendBottom:18,
              data:[{name:'成功',value:0},{name:'失败',value:0}],
              ...rightOnePieCommon
            }
          },
          {
            pieItem:{
              title:'昨日主索引生成情况',
              color:['#CCCCCC','#3AC9A8','#FFC569'],
              legendBottom:5,
              data:[{name:'已匹配',value:0},{name:'新建索引',value:0},{name:'疑似患者',value:0}],
              ...rightOnePieCommon
            }
          }
        ],
        barItem:{
            xData:[],
            series:[],
            yAxisMax:100,
            ...barCommon
        },
        barTwoItem:{
            xData:[],
            series:[],
            yAxisMax:100,
            ...barCommon
        },
        leftOneTopList:[
          {
            title:'今日运行情况(次)',
            details:[]
          },
          {
            title:'今日采集情况(条)',
            details:[
              {name:'总数：',value:0,unit:'',color:'#333333'},{name:'新增：',value:0,unit:'',color:'#3AC9A8'},{name:'修改：',value:0,unit:'',color:'#24BEE8'}
            ]
          }
        ],
        leftTwoTop:{
          title:'今日采集情况(条)',
          details:[
            {name:'总数：',value:0,unit:'',color:'#333333'},{name:'新增：',value:0,unit:'',color:'#3AC9A8'},{name:'修改：',value:0,unit:'',color:'#24BEE8'}
          ]
        },
        leftThreeDetail:{
          title:'今日运行情况(次)',
          details:[
            {name:'运行：',value:0,unit:'',color:'#333333'},{name:'成功：',value:0,unit:'',color:'#3AC9A8'},{name:'失败：',value:0,color:'#F36969'}
          ]
        },
        leftThreeTopList:[
          {title:'总清洗数据',value:0,unit:'条',color:'rgba(91,150,253,0.20)'},{title:'清洗成功',value:0,unit:'条',color:'rgba(58,201,168,0.20)'},{title:'清洗失败',value:0,unit:'条',color:'rgba(243,105,105,0.20)'}
        ],
        rightOneTopList:[
          {name:'平台患者数',value:0,unit:'条',color:'rgba(58,201,168,0.20)'},{name:'主索引数',value:0,unit:'条',color:'rgba(91,150,253,0.20)'},{name:'疑似患者数',value:0,unit:'条',color:'rgba(255,197,105,0.20)'}
        ],
        rightTwoDetail:{
          title:'今日运行情况(次)',
          details:[
            {name:'运行：',value:0,unit:'',color:'#333333'},{name:'成功：',value:0,unit:'',color:'#3AC9A8'},{name:'失败：',value:0,color:'#F36969'}
          ]
        },
        liquidfillList:[]
      }
    },
    created() {

    },
    mounted(){
      console.log(this.$route.name,'首页路由name');
    },
    methods: {
      // getSizeByScreen,
      gotobsshow(){
        this.$router.push({
          name: 'bsshow'
        })
      },
      checkAllClick(){
        this.$router.push({
          name: 'warningList'
        })
      }
    }
  }
</script>
<style lang="less" scoped>
p{
  margin:0;
}
.analysis-page-content{
  height:100%;
}
::v-deep.barone,::v-deep.bartwo{
  width: 100% !important;
  height: 100% !important;
  div {
    &:nth-child(1) {
      width: 100% !important;
      height: 100% !important;
      canvas {
        width: 100% !important;
        height: 100% !important;
      }
    }
  }
}
.top,.center {
    // grid-template-columns: 28.04% auto 28.04%;
    display: flex;
}
.top-left,.top-right,.center-left,.center-right{
  flex:1;
}
.top-center,#center-middle{
  padding:0 16px;
}
@keyframes beat {
    0% {
        bottom: 4%;
    }

    100% {
        bottom: 0%;
    }
}
.beat{
  animation-duration: .5s;
}
.beattwo{
  animation-duration: .7s;
}
#center-middle{
  height:904px;
  display:flex;
  flex-direction: column;
  .liquidfill-content{
    flex:1;
    position:relative;
    &-item{
      position:absolute;
      // background: rgba(241,246,255,0.10);
      // box-shadow: 0px 1px 20px 0px #8bcff2 inset;
      &-content{
        position: absolute;
        animation-name: beat;
        animation-timing-function: linear;
        /*速度曲线*/
        animation-iteration-count: infinite;
        /*播放次数*/
        animation-direction: alternate;
        /*逆向播放*/
        animation-play-state: running;
      }
    }
  }
}
/deep/ .ant-btn-background-ghost.ant-btn-primary{
  color:#198eeb;
  border-color:#198eeb;
  height:26px;
}
  .analysis-contain{
    position:relative;
    width:100%;
    height:calc( 100vh - 130px );

    .top{
      // display:grid;
      font-size: 14px;
      color: #666;
      align-items: center;
      margin-bottom:20px;
      .top-center{
        text-align:center;
        font-size: 16px;
        color: #333;
        font-weight: 500;
      }
      .top-right{
        text-align: right;
      }
    }
    .center{
      height:calc(100% - 46px );
      font-size:12px;
      line-height:12px;
      color:#333;
      // display:grid;
      .detail-content{
        display: flex;
        color:#666;
        div{
          width:33.33%;
          margin-top:10px;
          .value{
            font-weight:500;
          }
        }
      }
      .center-left{
        height:100%;
        display: flex;
        flex-direction: column;
        // justify-content: space-between;
        &-one{
          // height:36.37%;
          // display: flex;
          // flex-direction: column;
          &-detail-item{
            height:54px;
            &:first-child{
              margin:16px 0 8px;
            }
            &-title{
              font-weight: 500;
            }
          }
        }
        &-two{
          // height:29.39%;
          // display: flex;
          // flex-direction: column;
          &-detail-item{
              margin-top:16px;
          }
        }
        &-one,&-two{
          margin-bottom:16px;
        }
        &-one,&-two,&-three{
          &-detail-item,&-detailtwo-item{
            background:#F5F7F8;
            padding:10px;
          }
        }
        &-three{
          // height:30.63%;
          &-detail-item{
              margin-top:16px;
          }
          .detail-content{
            .value{
              color:#333;
              margin-top:8px;
            }
          }
          &-detailtwo-item{
            margin-top:10px;
          }
          &-top{
            display: flex;
            justify-content: space-between;
            margin-top:16px;
            &-item{
              width:31.09%;
              // height:54px;
              padding:10px 0;
              text-align:center;
              .top-item-title{
                color:#666;
              }
              .data-content{
                margin-top:8px;
                .value{
                  font-weight: 500;
                  font-size:14px;
                  line-height:14px;
                }
              }
            }
          }
        }
      }
      .title{
        font-weight: 500;
        color:#333;
        height:16px;
        line-height:14px;
        border-left:4px solid #198EEB;
        font-size:14px;
        padding-left:10px;
        display:flex;
        align-items: center;
      }
      .center-top{
        padding:16px;
        background:#fff;
        &-detail{
          display:flex;
          flex-wrap: wrap;
          justify-content: space-between;
          &-item{
            width:calc(50% - 8px);
            height:72px;
            padding:11px 20px;
            border-radius: 3px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color:#fff;
            .icon{
              width:50px;
              height:50px;
            }
            &:nth-child(1),&:nth-child(2){
              margin:16px 0 8px;
            }
            &-name{
              margin-bottom:8px;
            }
            &-num{
              font-size:20px;
              line-height:20px;
              font-weight: 500;
              margin-right:3px;
            }
            &-left{
              font-size:14px;
            }
          }
        }
      }
      .center-right{
        display:flex;
        flex-direction: column;
        height:100%;
        &-one{
          // height:38.51%;
          &-top{
            display: flex;
            justify-content: space-between;
            margin:16px 0;
            &-item{
              width:calc(33.33% - 10.67px);
              height:56px;
              padding:12px 0 10px;
              text-align:center;
              &-name{
                color:#666;
                margin-bottom:8px;
              }
              &-value{
                font-size: 14px;
                line-height:14px;
                font-weight: 500;
              }
            }
          }
          &-bottom{
            display: flex;
            justify-content: space-between;
            &-item{
              padding:16px 0 0;
              width:calc(50% - 5px);
              height:220px;
              background:#F5F7F8;
            }
          }
        }
        &-two{
          // height:22.52%;
          .detail-content{
            .value{
              color:#333;
              margin-top:8px;
            }
          }
        }
        &-one,&-two{
          margin-bottom:16px;
        }
        &-three{
          // flex:1
        }
      }
      .center-item{
        background: #fff;
        padding: 16px;
        .warning-title{
          display:flex;
          justify-content: space-between;
          align-items: center;
          .warning-num{
            color:#F36969;
          }
          .warning-more{
            font-size:12px;
            color:#3B8FD9;
            cursor: pointer;
          }
        }
        .left-warning-chart{
          overflow:hidden;
          height:268px;
          .warning-item{
            margin-top: 5px;
            padding:14px 0 14px 0px;
            border-bottom:1px solid #E8E8E8;
            font-size: 12px;
            .warning-item-top{
              display: flex;
              justify-content: space-between;
              color:#999;
              .item-title{
                font-size: 14px;
                color: #333333;
                width: 180px;
              }
            }
            .warning-item-bottom{
              color:#666;
              margin-top:10px;
            }
          }
        }
      }
    }
  }
</style>
