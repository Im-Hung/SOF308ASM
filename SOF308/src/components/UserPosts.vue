<template>
  <div class="user-posts-container">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4>
        <i class="fas fa-user-circle me-2"></i>
        {{ isMyPosts ? 'Bài viết của tôi' : `Bài viết của ${authorName}` }}
      </h4>
      <div v-if="isMyPosts" class="d-flex gap-2">
        <button @click="$emit('create-post')" class="btn btn-primary btn-sm">
          <i class="fas fa-plus me-1"></i>Tạo bài viết mới
        </button>
        <button @click="refreshPosts" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-arrow-clockwise me-1"></i>Làm mới
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
      <p class="mt-3 text-muted">Đang tải bài viết...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger">
      <i class="fas fa-exclamation-triangle me-2"></i>{{ error }}
    </div>

    <!-- Posts List -->
    <div v-else-if="userPosts.length > 0" class="row">
      <div v-for="post in userPosts" :key="post.id" class="col-12 mb-4">
        <div class="card shadow-lg border-0 post-card">
          <!-- Image Gallery -->
          <div v-if="post.images && post.images.length > 0" class="position-relative">
            <!-- Main Image -->
            <div class="image-container">
              <img
                :src="getMainImage(post)"
                :alt="post.title"
                class="card-img-top main-image"
                @click="openImageModal(post.images, 0)"
              />

              <!-- Image Count Badge -->
              <div v-if="post.images.length > 1" class="position-absolute top-0 end-0 m-3">
                <span class="badge bg-dark bg-opacity-75">
                  <i class="fas fa-images me-1"></i>{{ post.images.length }} ảnh
                </span>
              </div>

              <!-- Image Navigation -->
              <div v-if="post.images.length > 1" class="image-navigation">
                <button
                  class="btn btn-dark btn-sm nav-btn prev-btn"
                  @click.stop="changeMainImage(post, -1)"
                >
                  <i class="fas fa-chevron-left"></i>
                </button>
                <button
                  class="btn btn-dark btn-sm nav-btn next-btn"
                  @click.stop="changeMainImage(post, 1)"
                >
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>

            <!-- Image Thumbnails -->
            <div v-if="post.images.length > 1" class="image-thumbnails p-2">
              <div class="d-flex gap-2 overflow-auto">
                <img
                  v-for="(image, index) in post.images"
                  :key="index"
                  :src="image.url"
                  :alt="`${post.title} - ${index + 1}`"
                  :class="`thumbnail ${getCurrentImageIndex(post) === index ? 'active' : ''}`"
                  @click="setMainImage(post, index)"
                />
              </div>
            </div>
          </div>

          <!-- Card Body -->
          <div class="card-body">
            <div class="row">
              <div class="col-md-8">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <h5 class="card-title fw-bold text-primary">{{ post.title }}</h5>
                  
                  <!-- Action Dropdown - chỉ hiển thị cho chủ sở hữu hoặc admin -->
                  <div v-if="canManagePost(post)" class="dropdown">
                    <button
                      class="btn btn-outline-secondary btn-sm dropdown-toggle"
                      data-bs-toggle="dropdown"
                      style="position: relative; left: 243px; top: -20px; transition: none; cursor: move;"
                    >
                      <i class="bi bi-three-dots-vertical"></i>
                    </button>

                    <ul class="dropdown-menu dropdown-menu-end">
                      <li>
                        <a class="dropdown-item" href="#" @click.prevent="$emit('edit-post', post)">
                          <i class="fas fa-edit me-2 text-warning"></i>Chỉnh sửa
                        </a>
                      </li>
                      <li><hr class="dropdown-divider" /></li>
                      <li>
                        <a class="dropdown-item text-danger" href="#" @click.prevent="deletePost(post.id)">
                          <i class="fas fa-trash-alt me-2"></i>Xóa
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- Content Preview -->
                <p class="card-text text-muted" v-html="truncateContent(post.content)"></p>

                <!-- Post Meta -->
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <small class="text-muted">
                    <i class="fas fa-clock me-1"></i>{{ formatDate(post.createdAt) }}
                    <span v-if="post.updatedAt && post.updatedAt !== post.createdAt" class="ms-2">
                      <i class="fas fa-edit me-1"></i>Đã sửa
                    </span>
                  </small>
                  
                  <!-- View Detail Button -->
                  <!-- <button @click="$emit('view-post', post)" class="btn btn-outline-primary btn-sm">
                    <i class="fas fa-eye me-1"></i>Xem chi tiết
                  </button> -->
                </div>
              </div>

              <div class="col-md-4">
                <!-- Like/Dislike Component -->
                <LikeDislike 
                  :post-id="post.id" 
                  @reaction-updated="handleReactionUpdated"
                />

                <!-- Stats -->
                <div class="d-flex gap-2 flex-wrap">
                  <span class="badge bg-success">
                    <i class="fas fa-thumbs-up me-1"></i>{{ getPostLikes(post.id) }} thích
                  </span>
                  <span class="badge bg-danger">
                    <i class="fas fa-thumbs-down me-1"></i>{{ getPostDislikes(post.id) }} không thích
                  </span>
                  <span class="badge bg-info">
                    <i class="fas fa-comments me-1"></i>{{ getPostComments(post.id).length }} bình luận
                  </span>
                </div>
              </div>
            </div>

            <!-- Comments Section -->
            <CommentsSection
              :post="post"
              :comments="getPostComments(post.id)"
              :author-name="getAuthorName(post.authorId)"
              :comment-reactions="commentReactions"
              :users="users"
              @submit-comment="handleSubmitComment"
              @delete-comment="handleDeleteComment"
              @submit-reply="handleSubmitReply"
              @toggle-comment-reaction="handleToggleCommentReaction"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-5">
      <div class="card shadow-sm border-0">
        <div class="card-body">
          <i class="bi bi-plus-circle fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">
            {{ isMyPosts ? 'Bạn chưa có bài viết nào' : 'Người dùng này chưa có bài viết nào' }}
          </h5>
          <p class="text-muted">
            {{ isMyPosts ? 'Hãy tạo bài viết đầu tiên để chia sẻ ý tưởng của bạn!' : 'Hãy quay lại sau nhé!' }}
          </p>
          <button v-if="isMyPosts" @click="$emit('create-post')" class="btn btn-primary">
            <i class="fas fa-plus me-2"></i>Tạo bài viết đầu tiên
          </button>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div
      v-if="showImageModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.9)"
      @click="closeImageModal"
    >
      <div class="modal-dialog modal-xl modal-dialog-centered" @click.stop>
        <div class="modal-content bg-transparent border-0">
          <div class="modal-header border-0">
            <button type="button" class="btn-close btn-close-white" @click="closeImageModal"></button>
          </div>
          <div class="modal-body text-center p-0">
            <img
              :src="modalImages[currentModalIndex]?.url"
              :alt="`Image ${currentModalIndex + 1}`"
              class="img-fluid modal-image"
            />

            <!-- Modal Navigation -->
            <div v-if="modalImages.length > 1" class="modal-navigation">
              <button
                class="btn btn-light btn-lg modal-nav-btn prev"
                @click="changeModalImage(-1)"
                :disabled="currentModalIndex === 0"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              <button
                class="btn btn-light btn-lg modal-nav-btn next"
                @click="changeModalImage(1)"
                :disabled="currentModalIndex === modalImages.length - 1"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>

            <!-- Image Counter -->
            <div class="image-counter">
              {{ currentModalIndex + 1 }} / {{ modalImages.length }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, reactive, computed } from "vue";
import { authStore } from "@/store/auth";
import LikeDislike from "@/components/LikeDislike.vue";
import CommentsSection from "@/components/CommentsSection.vue";
// Import các hàm tiện ích xóa cascade
import { deleteCascade, updateLocalStateAfterDelete } from '@/utils/deleteHelpers';

const props = defineProps({
  userId: {
    type: [String, Number],
    default: null
  },
  reload: {
    type: Number,
    default: 0
  },
  showCreateButton: {
    type: Boolean,
    default: true
  },
  authorName: {
    type: String,
    default: ''
  }
});

const emit = defineEmits([
  "edit-post", 
  "create-post", 
  "view-post", 
  "post-deleted",
  "posts-loaded",
  "stats-updated"
]);

// Reactive data - Dữ liệu reactive
const userPosts = ref([]);
const reactions = ref([]);
const comments = ref([]);
const commentReactions = ref([]);
const users = ref([]); // Thêm để lưu thông tin users
const loading = ref(false);
const error = ref('');

// Image modal state - Trạng thái modal hình ảnh
const showImageModal = ref(false);
const modalImages = ref([]);
const currentModalIndex = ref(0);

// Track current image index for each post - Theo dõi chỉ số hình ảnh hiện tại cho mỗi bài viết
const postImageIndexes = reactive({});

// Computed properties - Các thuộc tính được tính toán
const isMyPosts = computed(() => {
  return props.userId === authStore.user?.id || (!props.userId && authStore.isLoggedIn);
});

// Computed cho stats để emit real-time
const userStats = computed(() => {
  return {
    totalPosts: userPosts.value.length,
    totalLikes: reactions.value.filter(r => r.type === 'like').length,
    totalDislikes: reactions.value.filter(r => r.type === 'dislike').length,
    totalComments: comments.value.length
  };
});

// Watch để emit stats khi data thay đổi
watch([userPosts, reactions, comments], () => {
  emit('stats-updated', userStats.value);
}, { deep: true });

/**
 * Kiểm tra quyền quản lý bài viết (chỉnh sửa/xóa)
 * @param {Object} post - Bài viết cần kiểm tra
 * @returns {boolean} True nếu có quyền quản lý
 */
const canManagePost = (post) => {
  if (!authStore.isLoggedIn) return false;
  if (authStore.userRole === 'admin') return true;
  return post.authorId === authStore.user?.id;
};

// API Functions - Các hàm gọi API

/**
 * Lấy danh sách bài viết của người dùng từ API
 * Sắp xếp bài viết theo ngày tạo (mới nhất trước)
 */
const fetchUserPosts = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const userId = props.userId || authStore.user?.id;
    if (!userId) {
      userPosts.value = [];
      return;
    }

    const res = await fetch(`http://localhost:3000/posts?authorId=${userId}`);
    if (!res.ok) throw new Error('Không thể tải bài viết');
    
    const data = await res.json();
    userPosts.value = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Khởi tạo chỉ số hình ảnh cho các bài viết có hình
    userPosts.value.forEach((post) => {
      if (post.images && post.images.length > 0) {
        postImageIndexes[post.id] = 0;
      }
    });

    emit('posts-loaded', userPosts.value);
  } catch (err) {
    error.value = err.message;
    console.error("Lỗi khi lấy bài viết người dùng:", err);
  } finally {
    loading.value = false;
  }
};

/**
 * Lấy tất cả reactions từ API
 * Cập nhật state reactions local
 */
const fetchReactions = async () => {
  try {
    const res = await fetch("http://localhost:3000/reactions");
    if (res.ok) {
      reactions.value = await res.json();
    }
  } catch (err) {
    console.error("Lỗi khi lấy reactions:", err);
    reactions.value = [];
  }
};

/**
 * Lấy tất cả comments từ API
 * Cập nhật state comments local
 */
const fetchComments = async () => {
  try {
    const res = await fetch("http://localhost:3000/comments");
    if (res.ok) {
      comments.value = await res.json();
    }
  } catch (err) {
    console.error("Lỗi khi lấy comments:", err);
    comments.value = [];
  }
};

/**
 * Lấy tất cả comment reactions từ API
 * Cập nhật state comment reactions local
 */
const fetchCommentReactions = async () => {
  try {
    const res = await fetch("http://localhost:3000/commentReactions");
    if (res.ok) {
      commentReactions.value = await res.json();
    }
  } catch (err) {
    console.error("Lỗi khi lấy comment reactions:", err);
    commentReactions.value = [];
  }
};

/**
 * Lấy danh sách users từ API để hiển thị tên tác giả
 */
const fetchUsers = async () => {
  try {
    const res = await fetch('http://localhost:3000/users');
    if (res.ok) {
      users.value = await res.json();
    }
  } catch (err) {
    console.error('Lỗi khi lấy users:', err);
    users.value = [];
  }
};

/**
 * Xóa bài viết của người dùng và tất cả dữ liệu liên quan với xác nhận
 * Thực hiện xóa cascade và cập nhật state local
 * @param {string} id - ID của bài viết cần xóa
 */
const deletePost = async (id) => {
  // Bước 1: Lấy xác nhận từ người dùng với cảnh báo chi tiết
  const confirmMessage = 'Bạn có chắc chắn muốn xóa bài viết này?\n\n' +
                        'Hành động này sẽ xóa vĩnh viễn:\n' +
                        '• Bài viết của bạn\n' +
                        '• Tất cả bình luận trên bài viết\n' +
                        '• Tất cả lượt thích/không thích\n\n' +
                        'Không thể khôi phục!';
  
  if (!confirm(confirmMessage)) return;

  // Bước 2: Lưu trạng thái lỗi ban đầu
  const originalError = error.value;
  error.value = '';

  try {
    // Bước 3: Thực hiện thao tác xóa cascade
    const result = await deleteCascade(id);
    
    if (!result.success) {
      throw new Error(result.error);
    }

    // Bước 4: Lấy các ID comment đã xóa để cập nhật state local
    const deletedCommentIds = comments.value
      .filter(c => c.postId === id)
      .map(c => c.id);

    // Bước 5: Cập nhật state local ngay lập tức
    updateLocalStateAfterDelete(id, deletedCommentIds, {
      posts: userPosts, // Lưu ý: sử dụng userPosts thay vì posts
      reactions,
      comments,
      commentReactions
    });

    // Bước 6: Emit events để thông báo cho parent components
    emit('post-deleted', id);
    
    // Bước 7: Reload tất cả dữ liệu để đảm bảo tính nhất quán
    await loadAllData();
    
    // Bước 8: Ghi log thành công với thống kê
    console.log(`✅ Xóa thành công bài viết người dùng ${id}:`, {
      reactions: result.deletedCounts.reactions,
      comments: result.deletedCounts.comments,
      commentReactions: result.deletedCounts.commentReactions
    });
    
    // Bước 9: Hiển thị phản hồi thành công
    const message = `Đã xóa bài viết cùng với ${result.deletedCounts.comments} bình luận ` +
                   `và ${result.deletedCounts.reactions} lượt đánh giá`;
    console.info(message);
    
  } catch (err) {
    // Bước 10: Xử lý lỗi một cách graceful
    console.error('❌ Lỗi khi xóa bài viết người dùng:', err);
    error.value = err.message || 'Không thể xóa bài viết';
    
    // Khôi phục trạng thái lỗi ban đầu nếu không có lỗi mới
    if (!error.value) {
      error.value = originalError;
    }
    
    // Hiển thị thông báo lỗi thân thiện với người dùng
    alert('Không thể xóa bài viết. Vui lòng thử lại sau.');
  }
};

// Event handlers - Xử lý sự kiện

/**
 * Xử lý cập nhật reactions từ các component con
 * Làm mới dữ liệu reaction
 */
const handleReactionUpdated = () => {
  fetchReactions();
};

/**
 * Xử lý submit comment mới
 * Tạo comment mới và gửi lên server
 * @param {Object} commentData - Dữ liệu comment
 */
const handleSubmitComment = async (commentData) => {
  try {
    const comment = {
      id: Date.now().toString(),
      postId: commentData.postId,
      authorId: authStore.user.id,
      content: commentData.content,
      parentId: commentData.parentId,
      createdAt: new Date().toISOString()
    };

    const response = await fetch('http://localhost:3000/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment)
    });

    if (response.ok) {
      comments.value.push(comment);
    }
  } catch (error) {
    console.error('Lỗi khi gửi comment:', error);
  }
};

/**
 * Xử lý xóa comment
 * Xóa comment khỏi server và cập nhật state local
 * @param {string} commentId - ID của comment cần xóa
 */
const handleDeleteComment = async (commentId) => {
  if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;
  
  try {
    const res = await fetch(`http://localhost:3000/comments/${commentId}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      comments.value = comments.value.filter(c => c.id !== commentId);
    }
  } catch (err) {
    console.error('Lỗi khi xóa comment:', err);
  }
};

/**
 * Xử lý submit reply cho comment
 * @param {Object} replyData - Dữ liệu reply
 */
const handleSubmitReply = async (replyData) => {
  await handleSubmitComment(replyData);
};

/**
 * Xử lý toggle reaction cho comment
 * Thêm, xóa hoặc thay đổi reaction cho comment
 * @param {Object} data - Object chứa commentId và type
 */
const handleToggleCommentReaction = async ({ commentId, type }) => {
  try {
    const existingReaction = commentReactions.value.find(
      r => r.commentId === commentId && r.userId === authStore.user.id
    );

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Xóa reaction nếu cùng loại
        await fetch(`http://localhost:3000/commentReactions/${existingReaction.id}`, {
          method: 'DELETE'
        });
        commentReactions.value = commentReactions.value.filter(r => r.id !== existingReaction.id);
      } else {
        // Cập nhật reaction nếu khác loại
        existingReaction.type = type;
        await fetch(`http://localhost:3000/commentReactions/${existingReaction.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type })
        });
      }
    } else {
      // Tạo reaction mới
      const reaction = {
        id: Date.now().toString(),
        commentId,
        userId: authStore.user.id,
        type,
        createdAt: new Date().toISOString()
      };

      await fetch('http://localhost:3000/commentReactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reaction)
      });

      commentReactions.value.push(reaction);
    }
  } catch (error) {
    console.error('Lỗi khi toggle comment reaction:', error);
  }
};

// Image handling functions - Các hàm xử lý hình ảnh

/**
 * Lấy hình ảnh chính của bài viết
 * @param {Object} post - Bài viết
 * @returns {string} URL hình ảnh chính
 */
const getMainImage = (post) => {
  if (!post.images || post.images.length === 0) return "";
  const currentIndex = postImageIndexes[post.id] || 0;
  return post.images[currentIndex]?.url || post.images[0]?.url;
};

/**
 * Lấy chỉ số hình ảnh hiện tại của bài viết
 * @param {Object} post - Bài viết
 * @returns {number} Chỉ số hình ảnh hiện tại
 */
const getCurrentImageIndex = (post) => {
  return postImageIndexes[post.id] || 0;
};

/**
 * Đặt hình ảnh chính cho bài viết
 * @param {Object} post - Bài viết
 * @param {number} index - Chỉ số hình ảnh
 */
const setMainImage = (post, index) => {
  postImageIndexes[post.id] = index;
};

/**
 * Thay đổi hình ảnh chính theo hướng
 * @param {Object} post - Bài viết
 * @param {number} direction - Hướng thay đổi (-1: trước, 1: sau)
 */
const changeMainImage = (post, direction) => {
  const currentIndex = postImageIndexes[post.id] || 0;
  const newIndex = currentIndex + direction;

  if (newIndex >= 0 && newIndex < post.images.length) {
    postImageIndexes[post.id] = newIndex;
  }
};

/**
 * Mở modal xem hình ảnh
 * @param {Array} images - Mảng hình ảnh
 * @param {number} startIndex - Chỉ số bắt đầu
 */
const openImageModal = (images, startIndex = 0) => {
  modalImages.value = images;
  currentModalIndex.value = startIndex;
  showImageModal.value = true;
  document.body.style.overflow = "hidden";
};

/**
 * Đóng modal xem hình ảnh
 */
const closeImageModal = () => {
  showImageModal.value = false;
  modalImages.value = [];
  currentModalIndex.value = 0;
  document.body.style.overflow = "auto";
};

/**
 * Thay đổi hình ảnh trong modal
 * @param {number} direction - Hướng thay đổi
 */
const changeModalImage = (direction) => {
  const newIndex = currentModalIndex.value + direction;
  if (newIndex >= 0 && newIndex < modalImages.value.length) {
    currentModalIndex.value = newIndex;
  }
};

// Stats functions - Các hàm thống kê

/**
 * Tính số lượng likes cho một bài viết cụ thể
 * @param {string} postId - ID của bài viết
 * @returns {number} Số lượng likes
 */
const getPostLikes = (postId) => {
  return reactions.value.filter((r) => r.postId === postId && r.type === "like").length;
};

/**
 * Tính số lượng dislikes cho một bài viết cụ thể
 * @param {string} postId - ID của bài viết
 * @returns {number} Số lượng dislikes
 */
const getPostDislikes = (postId) => {
  return reactions.value.filter((r) => r.postId === postId && r.type === "dislike").length;
};

/**
 * Lấy tất cả comments cho một bài viết cụ thể
 * @param {string} postId - ID của bài viết
 * @returns {Array} Mảng comments của bài viết
 */
const getPostComments = (postId) => {
  return comments.value.filter((c) => c.postId === postId);
};

// Utility functions - Các hàm tiện ích

/**
 * Lấy tên tác giả từ danh sách users hoặc authStore
 * @param {string} authorId - ID của tác giả
 * @returns {string} Tên tác giả
 */
const getAuthorName = (authorId) => {
  // Tìm trong danh sách users đã fetch
  const user = users.value.find(u => u.id === authorId);
  if (user) {
    return user.fullName || user.username;
  }
  
  // Fallback cho current user
  if (authStore.user && authStore.user.id === authorId) {
    return authStore.user.fullName || authStore.user.username;
  }
  
  return 'Unknown User';
};

/**
 * Định dạng ngày tháng theo locale Việt Nam
 * @param {string} dateString - Chuỗi ngày tháng
 * @returns {string} Ngày tháng đã định dạng
 */
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Cắt ngắn nội dung để hiển thị preview
 * @param {string} content - Nội dung cần cắt
 * @param {number} maxLength - Độ dài tối đa
 * @returns {string} Nội dung đã cắt ngắn
 */
const truncateContent = (content, maxLength = 150) => {
  const textContent = content.replace(/<[^>]*>/g, "");
  return textContent.length > maxLength
    ? textContent.substring(0, maxLength) + "..."
    : textContent;
};

/**
 * Làm mới danh sách bài viết
 */
const refreshPosts = () => {
  loadAllData();
};

/**
 * Tải tất cả dữ liệu cần thiết cho bài viết người dùng
 * Lấy bài viết người dùng, reactions, comments, comment reactions và users
 */
const loadAllData = async () => {
  try {
    await Promise.all([
      fetchUserPosts(), 
      fetchReactions(), 
      fetchComments(),
      fetchCommentReactions(),
      fetchUsers() // Thêm fetch users
    ]);
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu người dùng:', error);
    error.value = 'Không thể tải dữ liệu người dùng';
  }
};

// Lifecycle - Vòng đời component
onMounted(() => {
  loadAllData();
  
  // Keyboard navigation for modal - Điều hướng bàn phím cho modal
  document.addEventListener("keydown", (e) => {
    if (showImageModal.value) {
      if (e.key === "Escape") {
        closeImageModal();
      } else if (e.key === "ArrowLeft") {
        changeModalImage(-1);
      } else if (e.key === "ArrowRight") {
        changeModalImage(1);
      }
    }
  });
});

// Watchers - Các watcher
watch(() => props.reload, loadAllData);
watch(() => props.userId, loadAllData);
</script>

<style scoped>
.user-posts-container {
  width: 100%;
}

.post-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.post-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2) !important;
}

/* Image Styles */
.image-container {
  position: relative;
  overflow: hidden;
}

.main-image {
  height: 300px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;
  width: 100%;
}

.main-image:hover {
  transform: scale(1.02);
}

.image-navigation {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-container:hover .image-navigation {
  opacity: 1;
}

.nav-btn {
  background: rgba(0, 0, 0, 0.7) !important;
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.image-thumbnails {
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.thumbnail:hover {
  opacity: 1;
  transform: scale(1.05);
}

.thumbnail.active {
  opacity: 1;
  border-color: #007bff;
}

/* Modal Styles */
.modal-image {
  max-height: 80vh;
  max-width: 100%;
  object-fit: contain;
}

.modal-navigation {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 2rem;
}

.modal-nav-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9) !important;
  border: none;
  font-size: 1.2rem;
}

.image-counter {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

/* Card styles */
.card-title {
  font-size: 1.25rem;
  line-height: 1.4;
}

.card-text {
  line-height: 1.6;
  font-size: 0.95rem;
}

.badge {
  font-size: 0.8rem;
  padding: 0.4rem 0.6rem;
}

/* Dropdown styles */
.dropdown-menu {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  transform: translateX(5px);
}

.dropdown-item.text-danger:hover {
  background-color: #f8d7da;
  color: #721c24 !important;
}

/* Responsive */
@media (max-width: 768px) {
  .main-image {
    height: 200px;
  }

  .image-navigation {
    opacity: 1;
  }

  .nav-btn {
    width: 35px;
    height: 35px;
  }

  .modal-nav-btn {
    width: 50px;
    height: 50px;
  }

  .thumbnail {
    width: 50px;
    height: 50px;
  }

  .d-flex.justify-content-between {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 1rem;
  }

  .d-flex.gap-2 {
    flex-wrap: wrap;
    gap: 0.5rem !important;
  }

  .badge {
    font-size: 0.75rem;
    padding: 0.3rem 0.5rem;
  }
}
</style>
