import { DashboardIcon } from 'tdesign-icons-vue';
import Layout from '@/layouts';

export default [
  {
    path: '/dashboard',
    component: Layout,
    redirect: '/dashboard/base',
    name: 'dashboard',
    meta: {
      title: '首页',
      icon: 'desktop',
      hidden: false
    },
    children: [
      {
        path: 'base',
        name: 'DashboardBase',
        component: () => import('@/pages/dashboard/base/index.vue'),
        meta: { title: '概览仪表盘', hidden: false },
      },
      // {
      //   path: 'detail',
      //   name: 'DashboardDetail',
      //   component: () => import('@/pages/dashboard/detail/index.vue'),
      //   meta: { title: '统计报表' },
      // },
    ],
  },
];
