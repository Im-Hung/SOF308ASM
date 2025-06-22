<template>
  <nav
    class="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm"
  >
    <div class="container">
      <!-- Logo -->
      <router-link class="navbar-brand fs-3 fw-bold text-primary" to="/">
        V-TEC
      </router-link>

      <!-- Toggle button for mobile -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <!-- Left menu -->
        <ul class="navbar-nav me-auto ms-3">
          <li class="nav-item">
            <router-link class="nav-link" to="/blog">Bài Viết</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/qna">Câu Hỏi</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/discussion"
              >Thảo Luận</router-link
            >
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/about">Về Chúng Tôi</router-link>
          </li>
          <!-- Admin menu - chỉ hiển thị cho admin -->
          <li v-if="isLoggedIn && userRole === 'admin'" class="nav-item">
            <router-link class="nav-link text-danger fw-semibold" to="/admin">
              <i class="bi bi-person-gear me-2"></i>Admin
            </router-link>
          </li>
        </ul>

        <!-- Search form -->
        <form class="d-flex me-3" @submit.prevent="handleSearch">
          <div class="input-group">
            <input
              v-model="searchQuery"
              class="form-control"
              type="search"
              placeholder="Tìm kiếm trên V-TEC"
              aria-label="Search"
            />
            <button class="btn btn-outline-primary" type="submit">
              Tìm kiếm
            </button>
          </div>
        </form>

        <!-- Right menu - Conditional rendering based on login status -->
        <div class="d-flex align-items-center">
          <!-- Not logged in - Show login/register button -->
          <template v-if="!isLoggedIn">
            <router-link to="/login" class="btn btn-primary btn-sm">
              <i class="fas fa-user me-1"></i>Đăng nhập/Đăng ký
            </router-link>
          </template>

          <!-- Logged in - Show avatar dropdown -->
          <template v-else>
            <!-- User dropdown -->
            <div class="dropdown">
              <a
                class="d-flex align-items-center text-decoration-none dropdown-toggle"
                href="#"
                id="dropdownUser"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <!-- User avatar -->
                <div class="user-avatar me-2">
                  <img
                    :src="getUserAvatar()"
                    :alt="user.fullName"
                    class="rounded-circle"
                    width="40"
                    height="40"
                  />
                  <!-- Role badge -->
                  <span
                    :class="`role-badge ${getRoleBadgeClass()}`"
                    :title="getRoleText(userRole)"
                  >
                    {{ getRoleIcon() }}
                  </span>
                </div>
                <!-- User name -->
                <div class="user-info d-none d-md-block">
                  <div class="user-name fw-semibold text-dark">
                    {{ user.fullName }}
                  </div>
                  <div class="user-role text-muted small">
                    {{ getRoleText(userRole) }}
                  </div>
                </div>
              </a>

              <!-- Dropdown menu -->
              <ul
                class="dropdown-menu dropdown-menu-end shadow"
                style="min-width: 220px"
              >
                <!-- User info header -->
                <li class="dropdown-header">
                  <div class="d-flex align-items-center">
                    <img
                      :src="getUserAvatar()"
                      :alt="user.fullName"
                      class="rounded-circle me-2"
                      width="32"
                      height="32"
                    />
                    <div>
                      <div class="fw-semibold">{{ user.fullName }}</div>
                      <div class="text-muted small">{{ user.email }}</div>
                    </div>
                  </div>
                </li>
                <li><hr class="dropdown-divider" /></li>

                <!-- User menu items -->
                <li>
                  <router-link class="dropdown-item" to="/profile">
                    <i class="fas fa-user me-2"></i>Trang cá nhân
                  </router-link>
                </li>
                <li>
                  <router-link
                    class="dropdown-item"
                    to="/blog"
                    @click="setActiveTab('my-posts')"
                  >
                    <i class="fas fa-newspaper me-2"></i>Bài viết của tôi
                  </router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/settings">
                    <i class="bi bi-gear me-2"></i>Cài đặt
                  </router-link>
                </li>

                <!-- Admin specific menu -->
                <template v-if="userRole === 'admin'">
                  <li><hr class="dropdown-divider" /></li>
                  <li class="dropdown-header text-danger">
                    <i class="bi bi-person-gear me-2"></i>Quản trị viên
                  </li>
                  <li>
                    <router-link class="dropdown-item" to="/admin/dashboard">
                      <i class="bi bi-speedometer2 me-2"></i>Bảng điều khiển
                    </router-link>
                  </li>
                  <li>
                    <router-link class="dropdown-item" to="/admin/users">
                      <i class="bi bi-person me-2"></i>Quản lý người dùng
                    </router-link>
                  </li>
                  <li>
                    <router-link class="dropdown-item" to="/admin/posts">
                      <i class="fas fa-file-alt me-2"></i>Quản lý bài viết
                    </router-link>
                  </li>
                </template>

                <li><hr class="dropdown-divider" /></li>

                <!-- Logout -->
                <li>
                  <a
                    class="dropdown-item text-danger"
                    href="#"
                    @click.prevent="handleLogout"
                  >
                    <i class="bi bi-box-arrow-right me-2"></i>Đăng xuất
                  </a>
                </li>
              </ul>
            </div>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { authStore } from "@/store/auth";

const router = useRouter();
const searchQuery = ref("");

// Computed properties từ authStore
const isLoggedIn = computed(() => authStore.isLoggedIn);
const user = computed(() => authStore.user);
const userRole = computed(() => authStore.userRole);

// Watch for auth changes để update navbar real-time
watch(
  () => authStore.isLoggedIn,
  (newValue) => {
    console.log("Auth status changed:", newValue);
  }
);

// Get user avatar (fallback to generated avatar)
const getUserAvatar = () => {
  if (user.value?.avatar) {
    return user.value.avatar;
  }
  // Generate avatar based on user name or email
  const seed = user.value?.fullName || user.value?.email || "default";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(seed)}&background=007bff&color=fff&size=40`;
};

// Get role text in Vietnamese
const getRoleText = (role) => {
  const roleMap = {
    admin: "Quản trị viên",
    user: "Người dùng",
    guest: "Khách",
  };
  return roleMap[role] || role;
};

// Get role icon
const getRoleIcon = () => {
  const iconMap = {
    admin: "👑",
    user: "👤",
    guest: "👁️",
  };
  return iconMap[userRole.value] || "👤";
};

// Get role badge CSS class
const getRoleBadgeClass = () => {
  const classMap = {
    admin: "badge-admin",
    user: "badge-user",
    guest: "badge-guest",
  };
  return classMap[userRole.value] || "badge-user";
};

// Handle search
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`);
  }
};

// Set active tab for blog page
const setActiveTab = (tab) => {
  localStorage.setItem("blogActiveTab", tab);
};

// Handle logout
const handleLogout = () => {
  if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
    authStore.logout();
    router.push("/");
  }
};

// Initialize on mount
onMounted(() => {
  // Check auth status on mount
  if (authStore.checkAuth) {
    authStore.checkAuth();
  }
});
</script>

<style scoped>
.navbar {
  z-index: 1030;
}

.navbar-brand {
  font-family: "Arial Black", sans-serif;
  letter-spacing: -1px;
}

.input-group {
  width: 300px;
}

@media (max-width: 768px) {
  .input-group {
    width: 100%;
    margin: 10px 0;
  }
}

.user-avatar {
  position: relative;
}

.user-avatar img {
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.role-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
}

.badge-admin {
  background: linear-gradient(135deg, #dc3545, #c82333);
}

.badge-user {
  background: linear-gradient(135deg, #007bff, #0056b3);
}

.badge-guest {
  background: linear-gradient(135deg, #6c757d, #545b62);
}

.user-info {
  text-align: left;
  max-width: 120px;
}

.user-name {
  font-size: 0.9rem;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.75rem;
  line-height: 1;
}

.dropdown-menu {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  overflow: hidden;
  z-index: 9999 !important;
}

.dropdown-header {
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.dropdown-item {
  padding: 8px 16px;
  transition: all 0.2s ease;
  border: none;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  transform: translateX(2px);
}

.dropdown-item.text-danger:hover {
  background-color: #f8d7da;
  color: #721c24 !important;
}

.btn {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

@media (max-width: 991px) {
  .user-info {
    display: none;
  }

  .navbar-nav {
    margin-top: 10px;
  }

  .d-flex.align-items-center {
    flex-direction: column;
    align-items: stretch !important;
    gap: 10px;
  }

  .d-flex.align-items-center > * {
    width: 100%;
    justify-content: center;
  }
}

.nav-link.router-link-active {
  color: #007bff !important;
  font-weight: 600;
}

.nav-link.text-danger {
  position: relative;
}

.nav-link.text-danger::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(220, 53, 69, 0.1),
    rgba(200, 35, 51, 0.1)
  );
  border-radius: 4px;
  z-index: -1;
}
</style>
