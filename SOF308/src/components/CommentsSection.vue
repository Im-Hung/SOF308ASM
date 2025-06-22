<template>
  <div class="comments-section">
    <!-- Comments Header -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6 class="mb-0">
        <i class="fas fa-comments me-2 text-primary"></i>
        Bình luận ({{ totalCommentsCount }})
      </h6>
      <button 
        class="btn btn-outline-secondary btn-sm" 
        @click="toggleComments"
        :title="showComments ? 'Ẩn bình luận' : 'Hiện bình luận'"
      >
        <i :class="`fas ${showComments ? 'fa-eye-slash' : 'fa-eye'} me-1`"></i>
        {{ showComments ? "Ẩn" : "Hiện" }}
      </button>
    </div>

    <!-- Comment Form -->
    <div v-if="canComment" class="comment-form mb-3">
      <div class="card border-0 bg-light">
        <div class="card-body p-3">
          <div class="d-flex gap-2">
            <div class="flex-grow-1">
              <textarea
                v-model="newComment"
                class="form-control"
                rows="2"
                :placeholder="`Viết bình luận cho bài viết của ${authorName}...`"
                @keydown.ctrl.enter="submitComment"
                @keydown.meta.enter="submitComment"
              ></textarea>
              <small class="text-muted">Nhấn Ctrl+Enter để gửi nhanh</small>
            </div>
            <div class="d-flex flex-column gap-1">
              <button
                @click="submitComment"
                class="btn btn-primary btn-sm"
                :disabled="!newComment?.trim() || submittingComment"
                :title="newComment?.trim() ? 'Gửi bình luận' : 'Nhập nội dung bình luận'"
              >
                <span
                  v-if="submittingComment"
                  class="spinner-border spinner-border-sm me-1"
                ></span>
                <i v-else class="fas fa-paper-plane me-1"></i>
                {{ submittingComment ? "Đang gửi..." : "Gửi" }}
              </button>
              <button
                v-if="newComment?.trim()"
                @click="clearComment"
                class="btn btn-outline-secondary btn-sm"
                type="button"
                title="Xóa nội dung"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Login prompt for guests -->
    <div v-else-if="!authStore.isLoggedIn" class="alert alert-info">
      <i class="fas fa-user me-1"></i>
      <strong>Đăng nhập</strong>
      để viết bình luận và tham gia thảo luận.
    </div>

    <!-- No permission message -->
    <div v-else class="alert alert-warning">
      <i class="fas fa-exclamation-triangle me-2"></i>
      Bạn không có quyền bình luận trên bài viết này.
    </div>

    <!-- Comments List -->
    <div v-if="showComments" class="comments-list">
      <div v-if="parentComments.length === 0" class="text-center text-muted py-4">
        <i class="fas fa-comment-dots fa-3x mb-3 opacity-50"></i>
        <h6>Chưa có bình luận nào</h6>
        <p class="small">Hãy là người đầu tiên bình luận về bài viết này!</p>
      </div>

      <div v-else class="comments-container">
        <CommentItem
          v-for="comment in parentComments"
          :key="comment.id"
          :comment="comment"
          :post="post"
          :replies="getReplies(comment.id)"
          :comment-reactions="commentReactions"
          :users="users"
          @delete-comment="handleDeleteComment"
          @submit-reply="handleSubmitReply"
          @toggle-reaction="handleToggleCommentReaction"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { authStore } from "@/store/auth";
import CommentItem from "./CommentItem.vue";

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
  comments: {
    type: Array,
    default: () => [],
  },
  authorName: {
    type: String,
    required: true,
  },
  commentReactions: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  "submit-comment",
  "delete-comment",
  "submit-reply",
  "toggle-comment-reaction",
]);

// Reactive state
const showComments = ref(false);
const newComment = ref("");
const submittingComment = ref(false);
const users = ref([]);

// Fetch users from db.json
const fetchUsers = async () => {
  try {
    const response = await fetch('http://localhost:3000/users');
    if (response.ok) {
      users.value = await response.json();
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

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

const parentComments = computed(() => {
  return props.comments
    .filter((c) => !c.parentId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
});

const totalCommentsCount = computed(() => {
  return props.comments.length;
});

// Methods
const toggleComments = () => {
  showComments.value = !showComments.value;
};

const getReplies = (commentId) => {
  return props.comments
    .filter((c) => c.parentId === commentId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

const submitComment = async () => {
  if (!newComment.value?.trim() || submittingComment.value) return;

  submittingComment.value = true;

  try {
    const commentData = {
      postId: props.post.id,
      content: newComment.value.trim(),
      parentId: null,
    };

    emit("submit-comment", commentData);
    newComment.value = "";
    showComments.value = true;
  } catch (error) {
    console.error("Error submitting comment:", error);
    alert("Có lỗi khi gửi bình luận!");
  } finally {
    submittingComment.value = false;
  }
};

const clearComment = () => {
  newComment.value = "";
};

const handleDeleteComment = (commentId) => {
  emit("delete-comment", commentId);
};

const handleSubmitReply = (replyData) => {
  emit("submit-reply", replyData);
  showComments.value = true;
};

const handleToggleCommentReaction = (data) => {
  emit("toggle-comment-reaction", data);
};

// Lifecycle
onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.comments-section {
  border-top: 1px solid #e9ecef;
  padding-top: 1.5rem;
  margin-top: 1rem;
}

.comment-form .card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.comment-form .card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.comment-form textarea {
  border: 1px solid #ced4da;
  border-radius: 8px;
  resize: vertical;
  min-height: 60px;
  transition: all 0.3s ease;
}

.comment-form textarea:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.comments-container {
  max-height: 600px;
  overflow-y: auto;
}

.comments-container::-webkit-scrollbar {
  width: 6px;
}

.comments-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.comments-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.comments-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.spinner-border-sm {
  width: 0.875rem;
  height: 0.875rem;
}

@media (max-width: 576px) {
  .d-flex.gap-2 {
    flex-direction: column;
    gap: 0.75rem !important;
  }
  
  .d-flex.flex-column.gap-1 {
    flex-direction: row !important;
    gap: 0.5rem !important;
  }
  
  .comment-form .card-body {
    padding: 1rem !important;
  }
}
</style>
