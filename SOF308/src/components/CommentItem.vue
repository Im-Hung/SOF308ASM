<template>
  <div class="comment-item mb-3">
    <div class="card border-start border-primary border-3">
      <div class="card-body p-3">
        <!-- Comment Header -->
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div class="d-flex align-items-center">
            <div class="user-avatar me-2">
              <img
                :src="getAuthorAvatar(comment.authorId)"
                :alt="getAuthorName(comment.authorId)"
                class="rounded-circle"
                width="32"
                height="32"
              />
            </div>
            <div>
              <strong class="d-block">{{ getAuthorName(comment.authorId) }}</strong>
              <small class="text-muted">
                <i class="fas fa-clock me-1"></i>{{ formatDate(comment.createdAt) }}
              </small>
            </div>
          </div>

          <!-- Comment Actions -->
          <div class="dropdown" v-if="canDeleteComment(comment)">
            <button
              class="btn btn-sm btn-outline-secondary dropdown-toggle"
              data-bs-toggle="dropdown"
              title="Tùy chọn"
            >
              <i class="fas fa-ellipsis-v"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <a
                  class="dropdown-item text-danger"
                  href="#"
                  @click.prevent="deleteComment"
                >
                  <i class="fas fa-trash-alt me-2"></i>Xóa bình luận
                </a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Comment Content -->
        <div class="comment-content mb-3">
          <p class="mb-0">{{ comment.content }}</p>
        </div>

        <!-- Comment Actions -->
        <div class="comment-actions d-flex align-items-center gap-3">
          <!-- Like/Dislike -->
          <div v-if="authStore.isLoggedIn" class="d-flex gap-2">
            <button
              @click="toggleReaction('like')"
              :class="`btn btn-sm ${userReaction === 'like' ? 'btn-success' : 'btn-outline-success'}`"
              :title="userReaction === 'like' ? 'Bỏ thích' : 'Thích'"
            >
              <i class="fas fa-thumbs-up me-1"></i>{{ likesCount }}
            </button>
            <button
              @click="toggleReaction('dislike')"
              :class="`btn btn-sm ${userReaction === 'dislike' ? 'btn-danger' : 'btn-outline-danger'}`"
              :title="userReaction === 'dislike' ? 'Bỏ không thích' : 'Không thích'"
            >
              <i class="fas fa-thumbs-down me-1"></i>{{ dislikesCount }}
            </button>
          </div>

          <!-- Reply Button -->
          <button
            v-if="canComment"
            @click="toggleReplyForm"
            class="btn btn-sm btn-outline-primary"
            :title="showReplyForm ? 'Hủy trả lời' : 'Trả lời bình luận'"
          >
            <i class="fas fa-reply me-1"></i>
            {{ showReplyForm ? 'Hủy' : 'Trả lời' }}
          </button>

          <!-- Reply count -->
          <span v-if="replies.length > 0" class="text-muted small">
            <i class="fas fa-comments me-1"></i>{{ replies.length }} phản hồi
          </span>
        </div>

        <!-- Reply Form -->
        <div v-if="showReplyForm" class="reply-form mt-3 p-3 bg-light rounded">
          <div class="d-flex gap-2">
            <div class="flex-grow-1">
              <textarea
                v-model="replyContent"
                class="form-control"
                rows="2"
                :placeholder="`Trả lời ${getAuthorName(comment.authorId)}...`"
                @keydown.ctrl.enter="submitReply"
                @keydown.meta.enter="submitReply"
              ></textarea>
              <small class="text-muted">Nhấn Ctrl+Enter để gửi nhanh</small>
            </div>
            <div class="d-flex flex-column gap-1">
              <button
                @click="submitReply"
                class="btn btn-primary btn-sm"
                :disabled="!replyContent?.trim() || submittingReply"
              >
                <span v-if="submittingReply" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="fas fa-paper-plane me-1"></i>
                {{ submittingReply ? 'Đang gửi...' : 'Gửi' }}
              </button>
              <button
                @click="cancelReply"
                class="btn btn-outline-secondary btn-sm"
                type="button"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Replies -->
        <div v-if="replies.length > 0" class="replies mt-3">
          <div class="replies-header mb-2">
            <button 
              @click="toggleReplies"
              class="btn btn-link btn-sm p-0 text-decoration-none"
            >
              <i :class="`fas ${showReplies ? 'fa-chevron-up' : 'fa-chevron-down'} me-1`"></i>
              {{ showReplies ? 'Ẩn' : 'Hiện' }} {{ replies.length }} phản hồi
            </button>
          </div>

          <div v-if="showReplies" class="replies-list">
            <div
              v-for="reply in replies"
              :key="reply.id"
              class="reply-item ms-4 mb-2"
            >
              <div class="card bg-light border-0">
                <div class="card-body p-3">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="d-flex align-items-center">
                      <div class="user-avatar me-2">
                        <img
                          :src="getAuthorAvatar(reply.authorId)"
                          :alt="getAuthorName(reply.authorId)"
                          class="rounded-circle"
                          width="24"
                          height="24"
                        />
                      </div>
                      <div>
                        <strong class="d-block">{{ getAuthorName(reply.authorId) }}</strong>
                        <small class="text-muted">
                          <i class="fas fa-clock me-1"></i>{{ formatDate(reply.createdAt) }}
                        </small>
                      </div>
                    </div>
                    
                    <div class="dropdown" v-if="canDeleteComment(reply)">
                      <button
                        class="btn btn-sm btn-outline-secondary dropdown-toggle"
                        data-bs-toggle="dropdown"
                      >
                        <i class="fas fa-ellipsis-v"></i>
                      </button>
                      <ul class="dropdown-menu dropdown-menu-end">
                        <li>
                          <a
                            class="dropdown-item text-danger"
                            href="#"
                            @click.prevent="$emit('delete-comment', reply.id)"
                          >
                            <i class="fas fa-trash-alt me-2"></i>Xóa
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <p class="mb-0">{{ reply.content }}</p>
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
import { ref, computed } from "vue";
import { authStore } from "@/store/auth";

const props = defineProps({
  comment: {
    type: Object,
    required: true,
  },
  post: {
    type: Object,
    required: true,
  },
  replies: {
    type: Array,
    default: () => [],
  },
  commentReactions: {
    type: Array,
    default: () => [],
  },
  users: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["delete-comment", "submit-reply", "toggle-reaction"]);

// Reactive state
const showReplyForm = ref(false);
const showReplies = ref(false);
const replyContent = ref("");
const submittingReply = ref(false);

// Computed properties
const canComment = computed(() => {
  if (!authStore.isLoggedIn) return false;
  
  const userPermissions = {
    admin: ['comment_posts', 'like_posts', 'edit_posts', 'delete_posts'],
    user: ['comment_posts', 'like_posts', 'edit_posts'],
    guest: []
  };
  
  return userPermissions[authStore.userRole]?.includes('comment_posts') || false;
});

const likesCount = computed(() => {
  return props.commentReactions.filter(
    (r) => r.commentId === props.comment.id && r.type === "like"
  ).length;
});

const dislikesCount = computed(() => {
  return props.commentReactions.filter(
    (r) => r.commentId === props.comment.id && r.type === "dislike"
  ).length;
});

const userReaction = computed(() => {
  if (!authStore.isLoggedIn) return null;
  
  const reaction = props.commentReactions.find(
    (r) => r.commentId === props.comment.id && r.userId === authStore.user.id
  );
  return reaction?.type || null;
});

// Methods
const toggleReplyForm = () => {
  showReplyForm.value = !showReplyForm.value;
  if (showReplyForm.value) {
    replyContent.value = "";
  }
};

const toggleReplies = () => {
  showReplies.value = !showReplies.value;
};

const submitReply = async () => {
  if (!replyContent.value?.trim() || submittingReply.value) return;

  submittingReply.value = true;

  try {
    const replyData = {
      postId: props.post.id,
      content: replyContent.value.trim(),
      parentId: props.comment.id,
    };

    emit("submit-reply", replyData);
    replyContent.value = "";
    showReplyForm.value = false;
    showReplies.value = true; // Auto show replies after submitting
  } catch (error) {
    console.error("Error submitting reply:", error);
  } finally {
    submittingReply.value = false;
  }
};

const cancelReply = () => {
  replyContent.value = "";
  showReplyForm.value = false;
};

const toggleReaction = (type) => {
  if (!authStore.isLoggedIn) {
    alert('Vui lòng đăng nhập để thích bình luận!');
    return;
  }

  emit("toggle-reaction", {
    commentId: props.comment.id,
    type: type,
  });
};

const deleteComment = () => {
  if (confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
    emit("delete-comment", props.comment.id);
  }
};

const canDeleteComment = (comment) => {
  if (!authStore.isLoggedIn) return false;
  if (authStore.userRole === 'admin') return true;
  if (props.post.authorId === authStore.user.id) return true;
  if (comment.authorId === authStore.user.id) return true;
  return false;
};

// Get author name from users array
const getAuthorName = (authorId) => {
  const user = props.users.find(u => u.id === authorId);
  if (user) {
    return user.fullName || user.username;
  }
  
  // Fallback for current logged in user
  if (authStore.user && authStore.user.id === authorId) {
    return authStore.user.fullName || authStore.user.username;
  }
  
  return 'Unknown User';
};

// Get author avatar from users array
const getAuthorAvatar = (authorId) => {
  const user = props.users.find(u => u.id === authorId);
  if (user && user.avatar) {
    return user.avatar;
  }
  
  // Fallback for current logged in user
  if (authStore.user && authStore.user.id === authorId && authStore.user.avatar) {
    return authStore.user.avatar;
  }
  
  // Generate avatar based on name
  const name = getAuthorName(authorId);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=007bff&color=fff&size=32`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return "Vừa xong";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} phút trước`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} giờ trước`;
  } else {
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};
</script>

<style scoped>
.comment-item {
  transition: all 0.3s ease;
}

.comment-item:hover {
  transform: translateX(2px);
}

.user-avatar {
  flex-shrink: 0;
}

.user-avatar img {
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.comment-content {
  line-height: 1.6;
}

.comment-actions {
  border-top: 1px solid #f0f0f0;
  padding-top: 0.75rem;
}

.reply-form {
  border: 1px solid #e9ecef;
  background-color: #f8f9fa !important;
}

.reply-form textarea {
  border: 1px solid #ced4da;
  border-radius: 6px;
  resize: vertical;
  min-height: 50px;
}

.reply-form textarea:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.replies-list {
  border-left: 3px solid #e9ecef;
  padding-left: 1rem;
}

.reply-item {
  position: relative;
}

.reply-item::before {
  content: '';
  position: absolute;
  left: -1rem;
  top: 1rem;
  width: 0.75rem;
  height: 2px;
  background-color: #e9ecef;
}

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
  transform: translateX(3px);
}

.dropdown-item.text-danger:hover {
  background-color: #f8d7da;
  color: #721c24 !important;
}

.spinner-border-sm {
  width: 0.875rem;
  height: 0.875rem;
}

@media (max-width: 576px) {
  .comment-actions {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 0.75rem !important;
  }
  
  .d-flex.gap-2 {
    gap: 0.5rem !important;
  }
  
  .reply-form .d-flex.gap-2 {
    flex-direction: column;
    gap: 0.75rem !important;
  }
  
  .reply-form .d-flex.flex-column.gap-1 {
    flex-direction: row !important;
    gap: 0.5rem !important;
  }
}
</style>
