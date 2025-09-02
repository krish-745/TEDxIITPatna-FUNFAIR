import { createRouter, createWebHistory } from "vue-router";

// only the home view is loaded at first. all other routes are lazy-loaded when called.
// this is done simply to cut down on network usage and speed up loading a bit on initial landing.
// but i'm not sure whether this is the right thing to do.

// NOTE: when using lazy loading feature, be sure to add the webpackChunkName directives (yes, it's not random comments)
const routes = [
  {
    path: "/snake",
    name: "snake",
    component: () =>
      import(
        /* webpackChunkName: "commingsoon" */ "../views/Snake.vue"
      ),
    meta: {
      title: "Snake",
    },
  },
  {
    path: "/flappybird",
    name: "flappybird",
    component: () =>
      import(
        /* webpackChunkName: "commingsoon" */ "../views/FlappyBird.vue"
      ),
    meta: {
      title: "Flappy Bird",
    },
  },
  {
    path: "/stacktheblocks",
    name: "stacktheblocks",
    component: () =>
      import(
        /* webpackChunkName: "commingsoon" */ "../views/StackTheBlocks.vue"
      ),
    meta: {
      title: "Stack The Blocks",
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});
router.beforeEach((to, from, next) => {
  // Check if the target route requires a reload and we're coming from a different route that also requires reload
  if (to.meta.requiresReload && from.meta.requiresReload && to.path !== from.path) {
    // Force a page reload by navigating to the URL directly
    window.location.href = to.path
    return
  }
  
  // Set page title
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  next()
})

export default router;
