import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import BadugiDistribution from '../components/BadugiDistribution.vue';
import RangeEquity from '../components/RangeEquity.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: BadugiDistribution
  },
  {
    path: '/range-equity',
    name: 'RangeEquity',
    component: RangeEquity
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router; 
