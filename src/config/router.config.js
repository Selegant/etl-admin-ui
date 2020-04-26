// eslint-disable-next-line
import { UserLayout, BasicLayout, RouteView, BlankLayout, PageView } from '@/layouts'
// import { bxAnaalyse } from '@/core/icons'

export const asyncRouterMap = [

  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: '首页' },
    redirect: '/monitor/analysis',
    children: [
      // kettle
      {
        path: '/monitor',
        name: 'monitor',
        component: PageView,
        redirect: '/monitor/analysis',
        meta: { title: '调度分析', icon: 'fund', permission: [ 'table' ] },
        children: [
          {
            path: '/monitor/analysis',
            name: 'Analysis',
            hideChildrenInMenu: true, // 强制显示 MenuItem 而不是 SubMenu
            component: () => import('@/views/monitor/Analysis'),
            meta: { title: '监控分析', keepAlive: true, permission: [ 'table' ] }
          },
          {
            path: '/monitor/taskAnalysis',
            name: 'TaskAnalysis',
            hideChildrenInMenu: true, // 强制显示 MenuItem 而不是 SubMenu
            component: () => import('@/views/monitor/TaskAnalysis'),
            meta: { title: '作业分析', keepAlive: true, permission: [ 'table' ] }
          }
        ]
      },

      // task
      {
        path: '/task',
        name: 'task',
        component: PageView,
        redirect: '/task/task-management',
        meta: { title: '调度程序', icon: 'sliders', permission: [ 'table' ] },
        children: [
          {
            path: '/task/task-management',
            name: 'TaskManagement',
            hideChildrenInMenu: true, // 强制显示 MenuItem 而不是 SubMenu
            component: () => import('@/views/task/TaskManagement'),
            meta: { title: '任务管理', keepAlive: true, permission: [ 'table' ] }
          },
          {
            path: '/log/log-management',
            name: 'LogManagement',
            hideChildrenInMenu: true, // 强制显示 MenuItem 而不是 SubMenu
            component: () => import('@/views/log/LogManagement'),
            meta: { title: '日志管理', keepAlive: true, permission: [ 'table' ] }
          },
          {
            path: '/log/log-alert-management',
            name: 'LogAlertManagement',
            hideChildrenInMenu: true, // 强制显示 MenuItem 而不是 SubMenu
            component: () => import('@/views/log/LogAlertManagement'),
            hidden: true,
            meta: { title: '告警管理', keepAlive: true, permission: [ 'table' ] }
          },
          {
            path: '/group/group-management',
            name: 'GroupManagement',
            hideChildrenInMenu: true, // 强制显示 MenuItem 而不是 SubMenu
            component: () => import('@/views/group/GroupManagement'),
            meta: { title: '执行器列表', keepAlive: true, permission: [ 'table' ] }
          }
        ]
      },

      // kettle
      {
        path: '/kettle',
        name: 'kettle',
        component: PageView,
        redirect: '/kettle/job-management',
        meta: { title: 'KETTLE', icon: 'project', permission: [ 'table' ] },
        children: [
          {
            path: '/kettle/repository-management',
            name: 'RepositoryManagement',
            hideChildrenInMenu: true, // 强制显示 MenuItem 而不是 SubMenu
            component: () => import('@/views/kettle/RepositoryManagement'),
            meta: { title: '资源库管理', keepAlive: true, permission: [ 'table' ] }
          },
          {
            path: '/kettle/job-management',
            name: 'JobManagement',
            hideChildrenInMenu: true, // 强制显示 MenuItem 而不是 SubMenu
            component: () => import('@/views/kettle/JobManagement'),
            meta: { title: '作业管理', keepAlive: true, permission: [ 'table' ] }
          },
          {
            path: '/kettle/trans-management',
            name: 'TransManagement',
            hideChildrenInMenu: true, // 强制显示 MenuItem 而不是 SubMenu
            component: () => import('@/views/kettle/TransManagement'),
            meta: { title: '转换管理', keepAlive: true, permission: [ 'table' ] }
          },
          {
            path: '/kettle/collect-time',
            name: 'CollectTime',
            hideChildrenInMenu: true, // 强制显示 MenuItem 而不是 SubMenu
            component: () => import('@/views/kettle/CollectTime'),
            meta: { title: '采集时间', keepAlive: true, permission: [ 'table' ] }
          }
        ]
      },

      // datax
      {
        path: '/datax',
        name: 'datax',
        component: PageView,
        redirect: '/datax/dataSource-management',
        meta: { title: 'DATAX', icon: 'close', permission: [ 'datax' ] },
        children: [
          {
            path: '/datax/dataSource-management',
            name: 'DataSourceManagement',
            hideChildrenInMenu: true, // 强制显示 MenuItem 而不是 SubMenu
            component: () => import('@/views/datax/DataSourceManagement'),
            meta: { title: '数据源管理', keepAlive: true, permission: [ 'datax' ] }
          },
          {
            path: '/datax/datax-job-management',
            name: 'DataxJobManagement',
            hideChildrenInMenu: true, // 强制显示 MenuItem 而不是 SubMenu
            component: () => import('@/views/datax/DataxJobManagement'),
            meta: { title: 'DataX任务', keepAlive: true, permission: [ 'datax' ] }
          }
        ]
      },

      // account
      {
        path: '/account',
        component: RouteView,
        redirect: '/account/center',
        name: 'account',
        meta: { title: '个人页', icon: 'user', keepAlive: true, permission: [ 'table' ] },
        children: [
          {
            path: '/account/settings',
            name: 'settings',
            component: () => import('@/views/account/settings/Index'),
            meta: { title: '个人设置', hideHeader: true, permission: [ 'table' ] },
            redirect: '/account/settings/security',
            hideChildrenInMenu: true,
            children: [
              {
                path: '/account/settings/base',
                name: 'BaseSettings',
                component: () => import('@/views/account/settings/BaseSetting'),
                meta: { title: '基本设置', permission: [ 'table' ] }
              },
              {
                path: '/account/settings/security',
                name: 'SecuritySettings',
                component: () => import('@/views/account/settings/Security'),
                meta: { title: '安全设置', keepAlive: true, permission: [ 'table' ] }
              }
              // {
              //   path: '/account/settings/custom',
              //   name: 'CustomSettings',
              //   component: () => import('@/views/account/settings/Custom'),
              //   meta: { title: '个性化设置', keepAlive: true, permission: [ 'table' ] }
              // },
              // {
              //   path: '/account/settings/binding',
              //   name: 'BindingSettings',
              //   component: () => import('@/views/account/settings/Binding'),
              //   meta: { title: '账户绑定', keepAlive: true, permission: [ 'table' ] }
              // },
              // {
              //   path: '/account/settings/notification',
              //   name: 'NotificationSettings',
              //   component: () => import('@/views/account/settings/Notification'),
              //   meta: { title: '新消息通知', keepAlive: true, permission: [ 'table' ] }
              // }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*', redirect: '/404', hidden: true
  }
]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Register')
      },
      {
        path: 'register-result',
        name: 'registerResult',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/RegisterResult')
      },
      {
        path: 'recover',
        name: 'recover',
        component: undefined
      }
    ]
  },

  {
    path: '/test',
    component: BlankLayout,
    redirect: '/test/home',
    children: [
      {
        path: 'home',
        name: 'TestHome',
        component: () => import('@/views/Home')
      }
    ]
  },

  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }

]
