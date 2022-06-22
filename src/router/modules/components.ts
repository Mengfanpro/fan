import Layout from '@/layouts';

export default [
  {
    path: '/system',
    name: 'system',
    component: Layout,
    meta: { title: '系统管理', icon: 'setting', hidden: false },
    children: [
      {
        path: 'user',
        name: 'UserIndex',
        component: () => import('@/pages/system/user.vue'),
        meta: { title: '用户管理', hidden: false },
      },
      {
        path: 'role',
        name: 'RoleIndex',
        component: () => import('@/pages/system/role.vue'),
        meta: { title: '角色管理', hidden: false },
      },
      {
        path: 'menu',
        name: 'MenuIndex',
        component: () => import('@/pages/system/menu.vue'),
        meta: { title: '菜单管理', hidden: false },
      },
    ],
  },
]
