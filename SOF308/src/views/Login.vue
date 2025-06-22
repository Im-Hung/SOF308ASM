<template>
  <div class="d-flex min-vh-100">
    <!-- Left: Image Section (50%) -->
    <div class="d-none d-md-flex col-md-6 align-items-center justify-content-center text-white image-section">
      <div class="welcome-content text-center">
        <i class="fas fa-newspaper fa-4x mb-4 text-primary"></i>
        <h1 class="fw-bold display-4 welcome px-4">Chào mừng đến với V-TEC</h1>
        <p class="lead">Chia sẻ ý tưởng và kết nối với cộng đồng</p>
        
        <!-- Features showcase -->
        <div class="features mt-4">
          <div class="feature-item mb-2">
            <i class="fas fa-edit me-2"></i>
            Tạo và chỉnh sửa bài viết dễ dàng
          </div>
          <div class="feature-item mb-2">
            <i class="fas fa-comments me-2"></i>
            Hệ thống bình luận tương tác
          </div>
          <div class="feature-item mb-2">
            <i class="fas fa-thumbs-up me-2"></i>
            Like và dislike bài viết
          </div>
          <div class="feature-item">
            <i class="fas fa-chart-bar me-2"></i>
            Thống kê chi tiết
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Form Section (50%) -->
    <div class="col-md-6 d-flex align-items-center justify-content-center bg-white p-4">
      <div class="w-100" style="max-width: 500px">
        <!-- Logo -->
        <router-link class="logo navbar-brand fs-2 fw-bold text-primary mb-4 text-center d-block" to="/">
          <i class="fas fa-newspaper me-2 text-primary"></i>V-TEC
        </router-link>

        <!-- Alert Messages -->
        <div v-if="message" 
             :class="`alert alert-dismissible fade show ${success ? 'alert-success' : 'alert-danger'}`" 
             role="alert">
          <i :class="`fas ${success ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`"></i>
          {{ message }}
          <button type="button" class="btn-close" @click="message = ''" aria-label="Close"></button>
        </div>

        <!-- Tabs -->
        <div class="nav nav-pills nav-fill mb-4">
          <button class="nav-link" :class="{ active: currentForm === 'login' }" @click="switchForm('login')">
            <i class="bi bi-person-circle me-2"></i>
            Đăng nhập
          </button>
          <button class="nav-link" :class="{ active: currentForm === 'signup' }" @click="switchForm('signup')">
            <i class="bi bi-person-fill-add"></i>
            Đăng ký
          </button>
        </div>

        <!-- Login Form -->
        <form v-if="currentForm === 'login'" @submit.prevent="HandleLogin">
          <div class="mb-3">
            <label class="form-label">
              <i class="fas fa-user me-2"></i>Tên đăng nhập
            </label>
            <input 
              v-model="username" 
              type="text" 
              class="form-control" 
              placeholder="Nhập tên đăng nhập" 
              required 
              autocomplete="username"
            />
          </div>
          
          <div class="mb-3 position-relative">
            <label class="form-label">
              <i class="bi bi-lock me-2"></i>Mật khẩu
            </label>
            <input 
              v-model="password" 
              :type="showPassword.login ? 'text' : 'password'" 
              class="form-control"
              placeholder="Nhập mật khẩu" 
              required 
              autocomplete="current-password"
            />
            <button 
              type="button" 
              class="btn btn-sm btn-light position-absolute password-toggle"
              @click="togglePassword('login')"
            >
              <i :class="`fas ${showPassword.login ? 'fa-eye-slash' : 'fa-eye'}`"></i>
            </button>
          </div>

          <!-- Remember Me -->
          <div class="mb-3">
            <div class="form-check">
              <input
                type="checkbox"
                id="rememberMe"
                v-model="rememberMe"
                class="form-check-input"
              />
              <label for="rememberMe" class="form-check-label">
                Ghi nhớ đăng nhập
              </label>
            </div>
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary w-100 mb-3"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
            <i class="bi bi-box-arrow-in-left"></i>
            {{ isLoading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
          </button>
          
          <!-- Guest Access -->
          <button 
            type="button" 
            class="btn btn-outline-secondary w-100"
            @click="loginAsGuest"
          >
            Tiếp tục với tư cách khách
          </button>
        </form>

        <!-- Signup Form -->
        <form v-if="currentForm === 'signup'" @submit.prevent="HandleRegister">
          <div class="mb-3">
            <label class="form-label">
              <i class="fas fa-user me-2"></i>Tên đăng nhập
            </label>
            <input 
              v-model="username" 
              type="text" 
              class="form-control" 
              placeholder="Nhập tên đăng nhập" 
              required 
              autocomplete="username"
            />
          </div>
          
          <div class="mb-3">
            <label class="form-label">
              <i class="fas fa-id-card me-2"></i>Họ và tên
            </label>
            <input 
              v-model="fullName" 
              type="text" 
              class="form-control" 
              placeholder="Nhập họ và tên" 
              required 
              autocomplete="name"
            />
          </div>
          
          <div class="mb-3">
            <label class="form-label">
              <i class="fas fa-envelope me-2"></i>Email
            </label>
            <input 
              v-model="email" 
              type="email" 
              class="form-control" 
              placeholder="Nhập email" 
              required 
              autocomplete="email"
            />
          </div>
          
          <div class="mb-3 position-relative">
            <label class="form-label">
              <i class="bi bi-lock me-2"></i>Mật khẩu
            </label>
            <input 
              v-model="password" 
              :type="showPassword.signup ? 'text' : 'password'" 
              class="form-control" 
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)" 
              required
              minlength="6" 
              autocomplete="new-password"
            />
            <button 
              type="button" 
              class="btn btn-sm btn-light position-absolute password-toggle"
              @click="togglePassword('signup')"
            >
              <i :class="`fas ${showPassword.signup ? 'fa-eye-slash' : 'fa-eye'}`"></i>
            </button>
          </div>
          
          <button 
            type="submit" 
            class="btn btn-success w-100"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="i bi-door-open me-2"></i>
            {{ isLoading ? 'Đang đăng ký...' : 'Đăng ký' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from "vue-router";
import { authStore } from '@/store/auth';

const router = useRouter();

// Reactive data
const currentForm = ref('login');
const showPassword = ref({ login: false, signup: false });
const username = ref('');
const fullName = ref('');
const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const isLoading = ref(false);
const message = ref('');
const success = ref(true);

// Methods
function togglePassword(field) {
  showPassword.value[field] = !showPassword.value[field];
}

const switchForm = (form) => {
  currentForm.value = form;
  message.value = '';
  // Clear form data when switching
  username.value = '';
  fullName.value = '';
  email.value = '';
  password.value = '';
};

// Generate random ID for new user
const generateId = () => {
  return Math.random().toString(36).substr(2, 4);
};

// Fetch user from db.json
const fetchUser = async (username, password) => {
  try {
    const response = await fetch('http://localhost:3000/users');
    if (!response.ok) throw new Error('Không thể kết nối đến server');
    
    const users = await response.json();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      // Fetch role information
      const roleResponse = await fetch(`http://localhost:3000/roles/${user.roleId || 2}`);
      const role = roleResponse.ok ? await roleResponse.json() : { name: 'user' };
      
      return {
        ...user,
        role: role.name
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// Check if username exists
const checkUserExists = async (username) => {
  try {
    const response = await fetch('http://localhost:3000/users');
    if (!response.ok) throw new Error('Không thể kết nối đến server');
    
    const users = await response.json();
    return users.some(u => u.username === username);
  } catch (error) {
    console.error('Error checking user:', error);
    throw error;
  }
};

// Create new user in db.json
const createUser = async (userData) => {
  try {
    const response = await fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) throw new Error('Không thể tạo tài khoản');
    
    return await response.json();
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

const HandleLogin = async () => {
  if (isLoading.value) return;
  
  isLoading.value = true;
  message.value = '';
  
  try {
    // Validate input
    if (!username.value.trim() || !password.value.trim()) {
      throw new Error('Vui lòng nhập đầy đủ thông tin');
    }

    // Fetch user from db.json
    const user = await fetchUser(username.value.trim(), password.value.trim());
    
    if (!user) {
      throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    // Prepare user data for authStore
    const userData = {
      id: user.id,
      username: user.username,
      fullName: user.fullName || user.username,
      email: user.email,
      phone: user.phone || '',
      birthday: user.birthday || '',
      address: user.address || '',
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.username)}&background=007bff&color=fff&size=40`,
      role: user.role || 'user'
    };

    // Login success
    authStore.login(userData);
    
    if (rememberMe.value) {
      localStorage.setItem('rememberLogin', 'true');
    }

    message.value = 'Đăng nhập thành công!';
    success.value = true;
    
    // Redirect after success
    setTimeout(() => {
      router.push('/blog');
    }, 1500);

  } catch (error) {
    message.value = error.message || 'Có lỗi xảy ra khi đăng nhập';
    success.value = false;
    console.error('Login error:', error);
  } finally {
    isLoading.value = false;
  }
};

const HandleRegister = async () => {
  if (isLoading.value) return;
  
  isLoading.value = true;
  message.value = '';
  
  try {
    // Validate form
    if (!username.value.trim() || !fullName.value.trim() || !email.value.trim() || password.value.length < 6) {
      throw new Error('Vui lòng điền đầy đủ thông tin hợp lệ (mật khẩu tối thiểu 6 ký tự)');
    }

    // Check if username already exists
    const userExists = await checkUserExists(username.value.trim());
    if (userExists) {
      throw new Error('Tên đăng nhập đã tồn tại');
    }

    // Create new user data
    const newUser = {
      id: generateId(),
      username: username.value.trim(),
      fullName: fullName.value.trim(),
      email: email.value.trim(),
      password: password.value.trim(),
      phone: '',
      birthday: '',
      address: '',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName.value.trim())}&background=007bff&color=fff&size=40`,
      roleId: 2 // Default to user role
    };

    // Save to db.json
    await createUser(newUser);
    
    message.value = 'Đăng ký thành công! Vui lòng đăng nhập.';
    success.value = true;
    
    setTimeout(() => {
      switchForm('login');
      // Pre-fill username for convenience
      username.value = newUser.username;
    }, 2000);
    
  } catch (error) {
    message.value = error.message || 'Đăng ký thất bại';
    success.value = false;
  }
  
  isLoading.value = false;
};

const loginAsGuest = () => {
  router.push('/blog');
};

// Lifecycle
onMounted(() => {
  // Check if user is already logged in
  if (authStore.isLoggedIn) {
    router.push('/blog');
    return;
  }

  // Check remember me
  const rememberLogin = localStorage.getItem('rememberLogin');
  if (rememberLogin) {
    rememberMe.value = true;
  }
});
</script>

<style scoped>
.welcome-content {
  backdrop-filter: blur(4px);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.welcome {
  color: white;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.features {
  margin-top: 2rem;
}

.feature-item {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.image-section {
  background: linear-gradient(135deg, rgba(13, 110, 253, 0.8), rgba(108, 117, 125, 0.8)),
              url('https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3') center/cover;
}

.nav-link {
  cursor: pointer;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background-color: rgba(13, 110, 253, 0.1);
}

.nav-link.active {
  background-color: #0d6efd;
  color: white;
  box-shadow: 0 4px 8px rgba(13, 110, 253, 0.3);
}

.password-toggle {
  top: 2.2rem;
  right: 0.5rem;
  border: none;
  background: transparent;
  z-index: 10;
}

.form-control {
  border-radius: 8px;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.alert {
  border-radius: 8px;
  border: none;
}

.logo {
  text-decoration: none;
  transition: all 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

@media (max-width: 768px) {
  .image-section {
    display: none !important;
  }
  
  .col-md-6 {
    width: 100%;
  }
  
  .welcome-content {
    padding: 1.5rem;
  }
  
  .feature-item {
    font-size: 0.9rem;
  }
}

* {
  transition: 0.3s ease;
}
</style>
