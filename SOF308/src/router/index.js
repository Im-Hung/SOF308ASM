import { createRouter, createWebHistory } from 'vue-router'
import { authStore } from '@/store/auth'
import MainLayout from '../layouts/MainLayout.vue'
import SideLayout from '../layouts/SideLayout.vue'
import PersonalLayout from '../layouts/PersonalLayout.vue'
import Dashboard from '@/views/Dashboard.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import ManageUsers from '@/components/ManageUsers.vue'
import ManagePosts from '@/components/ManagePosts.vue'
import ManageComments from '@/components/ManageComments.vue'
import ManageQnA from '@/components/ManageQnA.vue'
import Home from '../views/Home.vue'

import QnA from '../views/Q&A.vue'
import QnADetail from '../views/QnADetail.vue'

import Blog from '../views/Blog.vue'
import Discussion from '../views/Discussion.vue'
import About from '../views/About.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Pagi from '../views/Pagination.vue'
import FormPost from '@/components/FormPost.vue'
import Profile from '../views/Profile.vue'
import EditProfile from '../views/EditProfile.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', component: Home },
    ],
  },
  {
    path: '/',
    component: SideLayout,
    children: [
      { path: 'blog', component: Blog },
      { path: 'qna', component: QnA },
      { path: '/qna/:id', component: QnADetail },
      { path: 'discussion', component: Discussion },
      { path: 'about', component: About },
      { path: 'pagi', component: Pagi },
    ],
  },
  {
    path: '/',
    component: PersonalLayout,
    meta: { requiresAuth: true },
    children: [
      { path: 'profile', component: Profile },
      { 
        path: 'FormPost', 
        component: FormPost,
        meta: { requiresAuth: true, roles: ['admin', 'user'] }
      },
      { path: 'editProfile', component: EditProfile },
    ],
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      { path: '', component: Dashboard },
      { path: 'users', component: ManageUsers },
      { path: 'posts', component: FormPost },
      { path: 'comments', component: ManageComments },
      { path: 'qna', component: ManageQnA },
    ],
  },

  { path: '/login', component: Login },
  { path: '/register', component: Register },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard
router.beforeEach((to, from, next) => {
  // Kiểm tra xem route có yêu cầu đăng nhập không
  if (to.meta.requiresAuth) {
    if (!authStore.isLoggedIn) {
      // Chưa đăng nhập, chuyển về login với redirect
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
    
    // Kiểm tra role nếu có yêu cầu
    if (to.meta.roles && !to.meta.roles.includes(authStore.userRole)) {
      alert('Bạn không có quyền truy cập trang này!')
      next('/')
      return
    }
  }
  
  // Nếu đã đăng nhập và truy cập login page, redirect về home
  if (to.path === '/login' && authStore.isLoggedIn) {
    next('/')
    return
  }
  
  next()
})

export default router
