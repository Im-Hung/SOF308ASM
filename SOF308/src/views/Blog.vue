<template>
  <div class="container mt-4">
    <!-- Header với thông tin user -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4 rounded">
      <div class="container-fluid">
        <span class="navbar-brand">📝 Quản lý bài viết</span>
        <div class="d-flex align-items-center"></div>
      </div>
    </nav>

    <!-- Stats Section -->
    <div class="stats-section mb-4">
      <div class="row g-3">
        <div class="col-md-3 col-sm-6">
          <div class="stat-card text-center p-3">
            <i class="fas fa-newspaper text-primary fs-2 mb-2"></i>
            <h6 class="text-muted">TỔNG BÀI VIẾT</h6>
            <h4 class="text-primary">{{ totalPosts }}</h4>
          </div>
        </div>
        <div class="col-md-3 col-sm-6">
          <div class="stat-card text-center p-3">
            <i class="fas fa-thumbs-up text-success fs-2 mb-2"></i>
            <h6 class="text-muted">LƯỢT THÍCH</h6>
            <h4 class="text-success">{{ totalLikes }}</h4>
          </div>
        </div>
        <div class="col-md-3 col-sm-6">
          <div class="stat-card text-center p-3">
            <i class="fas fa-thumbs-down text-danger fs-2 mb-2"></i>
            <h6 class="text-muted">LƯỢT KHÔNG THÍCH</h6>
            <h4 class="text-danger">{{ totalDislikes }}</h4>
          </div>
        </div>
        <div class="col-md-3 col-sm-6">
          <div class="stat-card text-center p-3">
            <i class="fas fa-comments text-warning fs-2 mb-2"></i>
            <h6 class="text-muted">BÌNH LUẬN</h6>
            <h4 class="text-warning">{{ totalComments }}</h4>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <ul class="nav nav-pills nav-fill bg-light rounded p-2 mb-4">
      <li class="nav-item">
        <button
          :class="`nav-link ${activeTab === 'all' ? 'active' : ''}`"
          @click="setActiveTab('all')"
        >
          <i class="fas fa-newspaper me-2"></i>Tất cả bài viết
        </button>
      </li>
      <li v-if="authStore.isLoggedIn" class="nav-item">
        <button
          :class="`nav-link ${activeTab === 'my-posts' ? 'active' : ''}`"
          @click="setActiveTab('my-posts')"
        >
          <i class="fas fa-folder-open me-2"></i>Bài viết của tôi
        </button>
      </li>
      <li
        v-if="
          authStore.isLoggedIn &&
          (authStore.userRole === 'admin' || authStore.userRole === 'user')
        "
        class="nav-item"
      >
        <button
          :class="`nav-link ${activeTab === 'create' ? 'active' : ''}`"
          @click="setActiveTab('create')"
        >
          <i class="fas fa-plus me-2"></i>Tạo bài viết
        </button>
      </li>
      <li v-if="authStore.userRole === 'admin'" class="nav-item">
        <button
          :class="`nav-link ${activeTab === 'admin' ? 'active' : ''}`"
          @click="setActiveTab('admin')"
        >
          <i class="bi bi-person-gear me-2"></i>Quản trị
        </button>
      </li>
    </ul>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- All Posts Tab -->
      <div v-if="activeTab === 'all'">
        <PostList
          :reload="reloadCounter"
          :active-tab="activeTab"
          @edit-post="handleEditPost"
          @create-post="setActiveTab('create')"
          @view-post="handleViewPost"
          @reaction-updated="handleReactionUpdated"
          @show-login="handleShowLogin"
          @posts-loaded="handlePostsLoaded"
          @stats-updated="handleStatsUpdated"
        />
      </div>

      <!-- My Posts Tab -->
      <div v-if="activeTab === 'my-posts' && authStore.isLoggedIn">
        <UserPosts
          :user-id="authStore.user.id"
          :reload="reloadCounter"
          :author-name="authStore.user.fullName"
          @edit-post="handleEditPost"
          @create-post="setActiveTab('create')"
          @view-post="handleViewPost"
          @post-deleted="handlePostDeleted"
          @posts-loaded="handleMyPostsLoaded"
          @stats-updated="handleStatsUpdated"
        />
      </div>

      <!-- Create Post Tab -->
      <div v-if="activeTab === 'create' && authStore.isLoggedIn">
        <div class="create-post-container">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h4>
              <i class="bi bi-journal-plus text-primary me-2"></i>
              {{ editingPost ? "Chỉnh sửa bài viết" : "Tạo bài viết mới" }}
            </h4>
            <button @click="handleCancelEdit" class="btn btn-outline-secondary">
              <i class="bi bi-arrow-left me-1"></i>Quay lại
            </button>
          </div>

          <FormPost
            :edit-post="editingPost"
            @post-success="handlePostSuccess"
            @cancel-edit="handleCancelEdit"
          />
        </div>
      </div>

      <!-- Admin Panel Tab -->
      <div v-if="activeTab === 'admin' && authStore.userRole === 'admin'">
        <div class="admin-panel">
          <h4><i class="bi bi-person-gear me-2"></i>Bảng quản trị</h4>
          <div class="row g-3">
            <div class="col-md-6">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">
                    <i class="bi bi-person me-2"></i>Quản lý người dùng
                  </h5>
                  <p class="card-text">Xem và quản lý tài khoản người dùng</p>
                  <router-link to="/admin/users" class="btn btn-primary">
                    Truy cập
                  </router-link>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">
                    <i class="fas fa-file-alt me-2"></i>Quản lý bài viết
                  </h5>
                  <p class="card-text">Kiểm duyệt và quản lý tất cả bài viết</p>
                  <router-link to="/admin/posts" class="btn btn-primary">
                    Truy cập
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { authStore } from "@/store/auth";
import { useStats } from "@/composables/useStats";

import FormPost from "@/components/FormPost.vue";
import PostList from "@/components/PostList.vue";
import UserPosts from "@/components/UserPosts.vue";

const router = useRouter();

// Khởi tạo stats composable
const statsComposable = useStats();

// Destructure từ stats composable
const { totalLikes, totalDislikes, totalComments, fetchStats } =
  statsComposable;

// State quản lý local
const activeTab = ref("all");
const editingPost = ref(null);
const reloadCounter = ref(0);
const totalPosts = ref(0);
const isLoading = ref(false);

// Chuyển đổi role sang tiếng Việt
const getRoleText = (role) => {
  const roleMap = {
    admin: "Quản trị viên",
    user: "Người dùng",
    guest: "Khách",
  };
  return roleMap[role] || role;
};

// Chuyển đổi tab và reset editing post
const setActiveTab = (tab) => {
  activeTab.value = tab;
  if (tab !== "create") {
    editingPost.value = null;
  }
};

// Xử lý khi click edit post từ child component
const handleEditPost = (post) => {
  editingPost.value = post;
  activeTab.value = "create";
};

// Chuyển hướng đến trang chi tiết bài viết
const handleViewPost = (post) => {
  router.push(`/post/${post.id}`);
};

// Xử lý sau khi tạo/sửa bài viết thành công
const handlePostSuccess = () => {
  reloadCounter.value++;
  editingPost.value = null;
  activeTab.value = "all";

  // Refresh tất cả stats
  nextTick(async () => {
    await refreshStats();
    // Force refresh cho tất cả child components
    reloadCounter.value++;
  });
};

// Hủy chỉnh sửa và quay về tab all
const handleCancelEdit = () => {
  editingPost.value = null;
  activeTab.value = "all";
};

// Xử lý sau khi xóa bài viết
const handlePostDeleted = (postId) => {
  reloadCounter.value++;
  // Refresh stats sau khi xóa
  refreshStats();
};

// Log số lượng bài viết của user
const handleMyPostsLoaded = (posts) => {
  console.log(`Loaded ${posts.length} posts in my posts tab`);
};

// Reload stats khi có reaction mới
const handleReactionUpdated = () => {
  reloadCounter.value++;
  // Refresh stats khi có reaction mới
  refreshStats();
};

// Chuyển hướng đến trang login
const handleShowLogin = () => {
  router.push("/login");
};

// Cập nhật tổng số bài viết từ PostList
const handlePostsLoaded = (posts) => {
  totalPosts.value = posts.length;
  console.log(`Loaded ${posts.length} posts in all posts tab`);
};

// Cập nhật stats từ child component
const handleStatsUpdated = (stats) => {
  totalPosts.value = stats.totalPosts;

  // Cập nhật từ composable nếu có
  if (statsComposable && statsComposable.fetchStats) {
    statsComposable.fetchStats();
  }
};

// Xử lý đăng xuất với xác nhận
const handleLogout = () => {
  if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
    authStore.logout();
    activeTab.value = "all";
    editingPost.value = null;
    router.push("/");
  }
};

// Refresh stats với debounce để tránh gọi quá nhiều
const refreshStats = async () => {
  if (isLoading.value) return;

  isLoading.value = true;
  try {
    await fetchStats();
  } catch (error) {
    console.error("Error refreshing stats:", error);
  } finally {
    isLoading.value = false;
  }
};

// Load dữ liệu ban đầu khi component mount - chỉ gọi một lần
onMounted(async () => {
  await refreshStats();
});
</script>

<style scoped>
.nav-pills .nav-link {
  color: #6c757d;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
  border: none;
  background: transparent;
}

.nav-pills .nav-link:hover {
  background-color: #e9ecef;
  color: #495057;
}

.nav-pills .nav-link.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stats-section {
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #f1f3f4;
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-card h4 {
  font-weight: 700;
  font-size: 1.8rem;
  margin: 0;
}

.stat-card h6 {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.create-post-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.admin-panel {
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.admin-panel .card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.admin-panel .card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }

  .stat-card {
    margin-bottom: 15px;
  }

  .stat-card h4 {
    font-size: 1.5rem;
  }

  .create-post-container {
    padding: 16px;
  }

  .admin-panel {
    padding: 16px;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tab-content > div {
  animation: fadeIn 0.3s ease-out;
}
</style>
