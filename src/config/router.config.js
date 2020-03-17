// eslint-disable-next-line
import { UserLayout, BasicLayout, RouteView, BlankLayout, PageView } from '@/layouts'
// import { bxAnaalyse } from '@/core/icons'

export const asyncRouterMap = [

  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: '首页' },
    redirect: '/task/task-management',
    children: [
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
