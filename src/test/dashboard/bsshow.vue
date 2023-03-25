<template>
    <div class="home">
        <div class="header">
            <span>{{timeStr}}</span>
            <a-button type="primary" ghost @click="exitbsshow">
            退出投屏
            </a-button>
        </div>
        <div class="center" style="overflow:hidden;">
            <div class="center-left" style="overflow:hidden;">
                <div class="left-item center-left-one" :style="{height:getSizeByScreenHeight(340)+'px'}">
                    <div class="flex-between item-top">
                        <div class="item-top-left">
                            <img src="@/assets/bsshowleftonetitle.png">
                            <span>离线数据采集</span>
                        </div>
                    </div>
                    <div>
                        <div v-for="(item,index) in leftOneTopList" :key="index" class="center-left-one-detail-item">
                            <p class="center-left-one-detail-item-title">{{item.title}}</p>
                            <div class="detail-content">
                                <div v-for="(detailitem,detailindex) in item.details" :key="detailindex">{{index==1&&detailindex==2?'修\xa0\xa0\xa0\xa0改：':detailitem.name}}<span class="value" :style="{color:detailitem.color}">{{detailitem.value}}{{detailitem.unit||''}}</span></div>
                            </div>
                        </div>
                    </div>
                    <div class="echarts-contain">
                        <bar-charts :bar-item="barItem" class="barone" style="width:100%;height:100%;"></bar-charts>
                        <!-- <div v-else class="no-data"><svg-icon icon-class="noDataScreen"/><span>无数据</span></div> -->
                    </div>
                </div>
                <div class="left-item center-left-two" :style="{height:getSizeByScreenHeight(269)+'px'}">
                    <div class="flex-between item-top">
                        <div class="item-top-left">
                            <img src="@/assets/bsshowlefttwotitle.png">
                            <span>实时数据采集</span>
                        </div>
                    </div>
                    <div class="center-left-two-detail-item">
                        <p class="center-left-one-detail-item-title">{{leftTwoTop.title}}</p>
                        <div class="detail-content">
                            <div v-for="(detailitem,detailindex) in leftTwoTop.details" :key="detailindex">{{detailitem.name}}<span class="value" :style="{color:detailitem.color}">{{detailitem.value}}{{detailitem.unit||''}}</span></div>
                        </div>
                    </div>
                    <div class="echarts-contain">
                        <bar-charts :bar-item="barTwoItem" class="bartwo" style="width:100%;height:100%;"></bar-charts>
                        <!-- <div v-else class="no-data"><svg-icon icon-class="noDataScreen"/>无数据</div> -->
                    </div>
                </div>
                <div class="left-item center-left-three" :style="{height:getSizeByScreenHeight(302)+'px'}">
                    <div class="flex-between item-top">
                        <div class="item-top-left">
                            <img src="@/assets/bsshowleftthreetitle.png">
                            <span>数据清洗</span>
                        </div>
                    </div>
                    <div class="center-left-three-top">
                        <div v-for="(item,index) in leftThreeTopList" :key="index" class="center-left-three-top-item" :style="{background:item.color,border:`1px solid ${item.borderColor}`}">
                            <p class="top-item-title" :style="{color:item.titleColor}">{{item.title}}</p>
                            <p class="data-content"><span class="value">{{item.value}}</span>{{item.unit}}</p>
                        </div>
                    </div>
                    <div class="center-left-three-detail-item">
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
                </div>
            </div>
            <div id="center-middle" :style="{width:getSizeByScreen(704)+'px'}">
                <div class="center-top">
                    <div class="flex-between item-top">
                        <div class="item-top-left">
                            <img src="@/assets/bsshowcenteronetitle.png">
                            <span>全量数据</span>
                        </div>
                    </div>
                    <div class="center-top-detail">
                        <div class="center-top-detail-item" v-for="(item,index) in centerTopList" :key="index" :style="{background:item.color}">
                            <div>
                            <p class="center-top-detail-item-name">{{ item.name }}</p>
                            <p class="center-top-detail-item-left"><span class="center-top-detail-item-num">{{ item.value }}</span>{{ item.unit }}</p>
                            </div>
                            <svg-icon :icon-class="item.image" class="icon"/>
                        </div>
                    </div>
                </div>
                <div class="liquidfill-content">
                    <div v-for="(item,index) in liquidfillList" :key="index" class="liquidfill-content-item" :style="{left:getSizeByScreen(item.left)+'px',top:getSizeByScreenHeight(item.top)+'px',width:getSizeByScreen(item.size)+'px',height:getSizeByScreenHeight(item.size)+'px'}" @mouseenter="mouseEnter(index)" @mouseleave="mouseLeave(index)">
                        <div class="liquidfill-content-item-content" :class="{'liquidfill-content-item-content':true,'beat':index==1||index==2||index==4,'beattwo':index==3||index==0}">
                            <liquidfill-charts :liquidfill-item="item.liquidfillItem"  :style="{width:getSizeByScreen(item.size)+'px',height:getSizeByScreenHeight(item.size)+'px'}"></liquidfill-charts>
                        </div>
                    </div>
                </div>
            </div>
            <div class="center-right">
                <div class="left-item center-right-one" :style="{height:getSizeByScreenHeight(364)+'px'}">
                    <div class="flex-between item-top">
                        <div class="item-top-left">
                            <img src="@/assets/bsshowrightonetitle.png">
                            <span>主索引</span>
                        </div>
                    </div>
                    <div class="center-right-one-top">
                        <div class="center-right-one-top-item" v-for="(item,index) of rightOneTopList" :key="index" :style="{background:item.color,border:`1px solid ${item.borderColor}`}">
                            <p class="center-right-one-top-item-name" :style="{color:item.titleColor}">{{item.name}}</p>
                            <p><span class="center-right-one-top-item-value">{{item.value}}</span>{{item.unit}}</p>
                        </div>
                    </div>
                    <div class="center-right-one-bottom">
                        <div class="center-right-one-bottom-item" v-for="(item,index) in rightOneBottomList" :key="index">
                            <pie-charts :pie-item="item.pieItem" style="height:100%;width:100%;"/>
                        </div>
                    </div>
                </div>
                <div class="left-item center-right-two" style="flex:1">
                    <div class="flex-between item-top">
                        <div class="item-top-left">
                            <img src="@/assets/bsshowrighttwotitle.png">
                            <span>数据质量</span>
                        </div>
                    </div>
                    <div class="center-left-three-detail-item">
                        <p class="center-left-one-detail-item-title">{{rightTwoDetail.title}}</p>
                        <div class="detail-content">
                            <div v-for="(detailitem,detailindex) in rightTwoDetail.details" :key="detailindex">{{detailitem.name}}<span class="value" :style="{color:detailitem.color}">{{detailitem.value}}{{detailitem.unit||''}}</span></div>
                        </div>
                    </div>
                    <div class="center-left-three-detailtwo-item" style="margin-top:0.11rem;">
                        <p class="center-left-one-detail-item-title">{{rightTwoTwoDetail.title}}</p>
                        <div class="detail-content">
                            <div v-for="(detailitem,detailindex) in rightTwoTwoDetail.details" :key="detailindex">{{detailitem.name}}
                                <p class="value">{{detailitem.value}}{{detailitem.unit||''}}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="left-item center-right-three" style="padding:0.2rem 0.2rem 0;" :style="{height:getSizeByScreenHeight(310)+'px'}">
                    <div class="flex-between item-top">
                        <div class="item-top-left">
                            <img src="@/assets/warningInfo.png">
                            <span>告警信息</span>
                        </div>
                        <div class="item-top-right">
                            <span>告警数量：</span>
                            <span class="value" style="color:#EE4263;">{{warnTotal}}条</span>
                            <!-- <a-button type="primary" ghost class="warn-btn" style="margin-left:0.14rem;">
                            1/5页
                            </a-button> -->
                        </div>
                    </div>
                    <div class="left-warning-chart">
                        <template v-if="warningList.length">
                            <div class="warning-item" v-for="(item,index) in warningList" :key="index">
                                <div class="warning-item-top">
                                <span class="item-title">{{item.alarmTitle}}</span>
                                <span>{{item.alarmTime}}</span>
                                </div>
                                <div class="warning-item-bottom">{{item.content}}</div>
                            </div>
                        </template>
                        <div v-else class="no-data"><svg-icon icon-class="noDataScreen"/>无数据</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { AnalysisMixin } from '@/mixins/AnalysisMixin'
const liquidfillCommon = {
  seriesNameColor:'#fff',
  totalNameColor:'#80CFFF',
  totalValueColor:'#80CFFF',
  percentColor:'#45F8CD',
  isHover:false,
  backgroundColors:[
    {
        offset: 0,
        color: "#8298ae00"
    },
    {
        offset: 0.4,
        color: "#6f7b8700"
    },
    {
        offset: 0.5,
        color: "#58a897"
    },
    {
        offset: 1,
        color: "rgba(79,208,178,0.1)"
    }
  ],
  colors:[
    {
        offset: 0, color: 'rgba(209,255,244,0.10)' // 0% 处的颜色
    }, {
        offset: 1, color: 'rgba(209,255,244,0.30)' // 100% 处的颜色
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
    ySplitLineColor:'#055382',
    xAxisSplitLineShow:false,
    yAxisSplitLineShow:true,
    moreSeries:true,
    tooltipAxisPointer:'shadow',
    xAxisColor:'#80CFFF',
    axisLineColor:'#42A1F1',
    ySplitLineType:'dashed',
    gridTop:15,
    gridBottom:1,
    xAxisName:'日期',
    yAxisName:'',
    color:['#45F8CD','#0091FF'],
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
    radius:['40%','55%'],
    tooltipFormatter:(params)=>{
        return params.name+'<br>数量：'+params.value+'次'
    },
    labelFormatter:(params)=>{
        return params.value
    },
    titleColor:'#80CFFF',
    labelColor:'#80CFFF',
    legendColor:'#80CFFF',
    borderColor:'#083C65',
    legendFormatter: ['{namewidth|{name}}'].join('\n'),
    titleFontSize:12,
    tooltipBack:'rgba(0,0,0,0.70)',
    tooltipColor:'#fff',
    tooltipFontsize:12,
    legendShow:true,
    legendIcon:'rect',
    legendItemWidth:12,
    legendItemHeight:12,
    labelShow:false,
    titleShow:true,
    center:['50%','45%']
}
export default {
    name:'Bsshow',
    mixins:[AnalysisMixin],
    data(){
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
                  title:'昨日匹配数',
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
            rightTwoDetail:{
                title:'今日运行情况(次)',
                details:[
                    {name:'运行：',value:0,unit:'',color:'#fff'},{name:'成功：',value:0,unit:'',color:'#45F8CD'},{name:'失败：',value:0,unit:'',color:'#EE4263'}
                ]
            },

            liquidfillList:[],
            rightOneTopList:[
                {name:'机构患者数',value:0,unit:'条',color:'rgba(0,145,255,0.30)',borderColor:'rgba(0,145,255,0.40)',titleColor:'#80CFFF'},{name:'主索引数',value:0,unit:'条',color:'rgba(58,201,168,0.30)',borderColor:'rgba(58,201,168,0.40)',titleColor:'#45F8CD'},{name:'疑似患者数',value:0,unit:'条',color:'rgba(255,197,105,0.30)',borderColor:'rgba(243,105,105,0.40)',titleColor:'#FFC569'}
            ],

            leftThreeDetail:{
                title:'今日运行情况(次)',
                details:[
                    {name:'运行：',value:0,unit:'',color:'#fff'},{name:'成功：',value:0,unit:'',color:'#45F8CD'},{name:'失败：',value:0,unit:'',color:'#EE4263'}
                ]
            },
            leftThreeTopList:[
                {title:'总清洗数据',value:0,unit:'条',color:'rgba(0,145,255,0.30)',borderColor:'rgba(0,145,255,0.40)',titleColor:'#80CFFF'},{title:'清洗成功',value:0,unit:'条',color:'rgba(58,201,168,0.30)',borderColor:'rgba(58,201,168,0.40)',titleColor:'#45F8CD'},{title:'清洗失败',value:0,unit:'条',color:'rgba(243,105,105,0.30)',borderColor:'rgba(243,105,105,0.40)',titleColor:'#F36969'}
            ],


            leftTwoTop:{
                title:'今日采集情况(条)',
                details:[
                    {name:'总数：',value:0,unit:'',color:'#fff'},{name:'新增：',value:0,unit:'',color:'#45F8CD'},{name:'修改：',value:0,color:'#24BEE8'}
                ]
            },
            leftOneTopList:[
                {
                    title:'今日运行情况(次)',
                    details:[]
                },
                {
                    title:'今日采集情况(条)',
                    details:[
                    {name:'总数：',value:0,unit:'',color:'#fff'},{name:'新增：',value:0,unit:'',color:'#45F8CD'},{name:'修改：',value:0,unit:'',color:'#24BEE8'}
                    ]
                }
            ]
        }
    },
    mounted(){
    },
    methods:{
        // getSizeByScreen,
        exitbsshow(){
            this.$router.push('dashboard/analysis')
        }
    }
}
</script>
<style lang="less" scoped>
// /deep/.warn-btn.ant-btn-background-ghost.ant-btn-primary{
//     color:#80CFFF;
//     background: rgba(0,145,255,0.10) !important;
//     border: 1px solid rgba(0,145,255,0.40);
//     height:auto;
//     min-width:0.56rem;
//     padding:0;
// }
.no-data{
    color:#80CFFF;
}
p{
    margin:0;
}
.flex-between{
    display: flex;
    justify-content: space-between;
    align-items: center;
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
.home{
    background:url(~@/assets/bsshowback.png) no-repeat;
    background-size: 100% 100%;
    width:100%;
    height:100%;
    color:#fff;
    .header {
        background: url('../../assets/bsTop.png') no-repeat;
        background-size: 100% 1.05rem;
        width: 100%;
        height: 1.05rem;
        line-height: 1.05rem;
        color: #fff;
        font-size:0.14rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding:0 0.24rem;
        /deep/ .ant-btn-background-ghost.ant-btn-primary{
            color:#80CFFF;
            border-color:#80CFFF;
            height:0.32rem;
        }
    }
    .center{
        height:calc(100% - 1.05rem);
        display:flex;
        // display:grid;
        // grid-template-columns: 27% auto 27%;
        padding:0 24px 24px;
        font-size:0.12rem;
        line-height:0.12rem;
        color:#fff;
        #center-middle{
            display:flex;
            flex-direction: column;
            padding:0 0.2rem;
            .liquidfill-content{
                flex:1;
                position:relative;
                &-item{
                    position:absolute;
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
            .center-top{
                padding:0.18rem;
                background-size:100% 100% !important;
                background: url(~@/assets/bsshowcenteroneback.png) no-repeat;
                &-detail{
                    display:flex;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    &-item{
                        width:calc(50% - 0.08rem);
                        height:0.72rem;
                        padding:0.11rem 0.2rem;
                        border-radius: 3px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        color:#fff;
                        .icon{
                        width:0.5rem;
                        height:0.5rem;
                        }
                        &:nth-child(1),&:nth-child(2){
                        margin:0.16rem 0;
                        }
                        &-name{
                        margin-bottom:0.08rem;
                        }
                        &-num{
                        font-size:0.2rem;
                        line-height:0.2rem;
                        font-weight: 500;
                        }
                        &-left{
                        font-size:0.14rem;
                        }
                    }
                }
            }
        }
        .item-top{
            font-size:0.18rem;
            line-height:0.18rem;
            font-weight:500;
            &-left{
               img{
                    width:0.28rem;
                    height:0.28rem;
                    margin-right:0.05rem;
                }
                display: flex;
                align-items: center;
                // font-weight: bold;
            }
            &-right{
                display: flex;
                align-items: center;
                font-size: 0.14rem;
                color: #80cfff;
                .value{
                    font-size:0.16rem;
                    line-height:0.16rem;
                    color: #ffb754;
                    font-weight:700;
                }
            }
        }
        .detail-content{
            display: flex;
            color:#80CFFF;
            font-size:0.14rem;
            line-height:0.14rem;
            div{
                width:33.33%;
                margin-top:0.1rem;
            .value{
                font-weight:700;
            }
            }
        }
        &-right{
            flex:1;
            height:100%;
            display:flex;
            flex-direction:column;
            &-one{
                background: url(~@/assets/bsshowrightoneback.png) no-repeat;
                &-top{
                    display: flex;
                    justify-content: space-between;
                    margin:0.16rem 0;
                    &-item{
                        width:calc(33.33% - 0.1067rem);
                        height:0.56rem;
                        padding:0.1rem 0;
                        text-align:center;
                        border-radius: 3px;
                        &-name{
                            color:#666;
                            margin-bottom:0.08rem;
                        }
                        &-value{
                            font-size: 0.14rem;
                            line-height:0.14rem;
                            font-weight: 700;
                        }
                    }
                }
                &-bottom{
                    flex:1;
                    display: flex;
                    justify-content: space-between;
                    &-item{
                        padding:0.24rem 0 0;
                        width:calc(50% - 0.08rem);
                        height:100%;
                        background: rgba(0,145,255,0.10);
                        border: 1px solid rgba(0,145,255,0.40);
                        border-radius: 3px;
                    }
                }
            }
            &-two{
                background: url(~@/assets/bsshowrighttwoback.png) no-repeat;
                .detail-content{
                    .value{
                        color:#fff;
                        margin-top:0.08rem;
                    }
                }
            }
            &-three{
                background: url(~@/assets/bsshowrightthreeback.png) no-repeat;
            }
        }
        &-left,&-right{
            &-one,&-two{
                margin-bottom:20px;
            }
        }
        &-left{
            flex:1;
            height:100%;
            display: flex;
            flex-direction: column;
            .echarts-contain{
                flex:1;
            }
            &-one{
                // background: url(~@/icons/svg/bsshowleftoneback.svg) no-repeat;
                background: url(~@/assets/bsshowleftoneback.png) no-repeat;
                // height:3.34rem;
                &-detail-item{
                    height:0.58rem;
                    &:first-child{
                        margin:0.14rem 0 0.08rem;
                    }
                    &-title{
                        font-weight: 500;
                    }
                }
            }
            &-one,&-two,&-three{
                &-detail-item,&-detailtwo-item{
                    background: rgba(0,145,255,0.10);
                    border: 1px solid rgba(0,145,255,0.40);
                    border-radius: 0.03rem;
                    padding:10px;
                }
            }
            &-two{
                background: url(~@/assets/bsshowlefttwoback.png) no-repeat;
                &-detail-item{
                    margin-top:0.16rem;
                }
            }
            &-three{
                background: url(~@/assets/bsshowleftthreeback.png) no-repeat;
                &-detail-item{
                    margin-top:16px;
                }
                .detail-content{
                    .value{
                        color:#fff;
                        margin-top:8px;
                    }
                }
                &-detailtwo-item{
                    margin-top:8px;
                }
                &-top{
                    display: flex;
                    justify-content: space-between;
                    margin-top:0.16rem;
                    &-item{
                        width:31.09%;
                        // height:54px;
                        padding:10px 0;
                        text-align:center;
                        .data-content{
                            margin-top:8px;
                            .value{
                                font-weight: 700;
                                font-size:0.14rem;
                                line-height:0.14rem;
                            }
                        }
                    }
                }
            }
        }
        .left-item{
            // background: url(~@/assets/bsLeftBack.svg) no-repeat;
            background-size:100% 100%;
            padding:0.2rem;
            display: flex;
            flex-direction: column;
            .item-content,.left-two-echart{
                flex:1;
            }
            .left-warning-chart{
                flex:1;
                overflow:hidden;
                // height:2.63rem;
                .warning-item{
                    padding:0.15rem 0;
                    border-bottom:1px dashed #055382;
                    font-size: 0.12rem;
                    .warning-item-top{
                        display: flex;
                        justify-content: space-between;
                        color:#3E7698;
                        .item-title{
                            font-size: 0.14rem;
                            color: #fff;
                        }
                    }
                    .warning-item-bottom{
                        color:#80CFFF;
                        margin-top:0.1rem;
                    }
                }
            }
        }

    }
}
</style>