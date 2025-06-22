<template>
  <div class="like-dislike-container">
    <div class="d-flex gap-2">
      <button 
        @click="toggleReaction('like')" 
        :class="['btn', 'btn-outline-success', 'btn-sm', { 'active': userReaction === 'like' }]"
        :disabled="!authStore.isLoggedIn || loading"
        :title="authStore.isLoggedIn ? 'Thích bài viết' : 'Đăng nhập để thích'"
      >
        <span v-if="loading && pendingType === 'like'" class="spinner-border spinner-border-sm me-1"></span>
        <i v-else class="fas fa-thumbs-up me-1"></i>
        {{ likesCount }}
      </button>
      
      <button 
        @click="toggleReaction('dislike')" 
        :class="['btn', 'btn-outline-danger', 'btn-sm', { 'active': userReaction === 'dislike' }]"
        :disabled="!authStore.isLoggedIn || loading"
        :title="authStore.isLoggedIn ? 'Không thích bài viết' : 'Đăng nhập để đánh giá'"
      >
        <span v-if="loading && pendingType === 'dislike'" class="spinner-border spinner-border-sm me-1"></span>
        <i v-else class="fas fa-thumbs-down me-1"></i>
        {{ dislikesCount }}
      </button>
    </div>
    
    <div v-if="!authStore.isLoggedIn" class="text-muted small mt-1 text-center">
      Đăng nhập để thích bài viết
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { authStore } from "@/store/auth";

const props = defineProps({
  postId: {
    type: [String, Number],
    required: true,
  },
});

const emit = defineEmits(["reaction-updated"]);

// Reactive state
const likesCount = ref(0);
const dislikesCount = ref(0);
const userReaction = ref(null);
const loading = ref(false);
const pendingType = ref(null);

// Computed properties
const isAuthenticated = computed(() => authStore.isLoggedIn);
const currentUser = computed(() => authStore.user);

// Methods
const toggleReaction = async (type) => {
  if (!isAuthenticated.value) {
    alert("Vui lòng đăng nhập để thích bài viết!");
    return;
  }

  if (loading.value) return;

  loading.value = true;
  pendingType.value = type;

  try {
    const existingReaction = await checkUserReaction();

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Remove reaction
        await removeReaction(existingReaction.id);
        userReaction.value = null;
      } else {
        // Update reaction type
        await updateReaction(existingReaction.id, type);
        userReaction.value = type;
      }
    } else {
      // Create new reaction
      await createReaction(type);
      userReaction.value = type;
    }

    await fetchReactions();
    emit("reaction-updated");
  } catch (error) {
    console.error("Error toggling reaction:", error);
    alert("Có lỗi xảy ra khi thực hiện hành động!");
  } finally {
    loading.value = false;
    pendingType.value = null;
  }
};

const checkUserReaction = async () => {
  if (!isAuthenticated.value) return null;

  try {
    const response = await fetch(
      `http://localhost:3000/reactions?postId=${props.postId}&userId=${currentUser.value.id}`
    );
    if (!response.ok) throw new Error("Failed to check reaction");
    
    const reactions = await response.json();
    return reactions.length > 0 ? reactions[0] : null;
  } catch (error) {
    console.error("Error checking user reaction:", error);
    return null;
  }
};

const createReaction = async (type) => {
  const reaction = {
    id: Date.now().toString(),
    postId: props.postId.toString(),
    userId: currentUser.value.id.toString(),
    type: type,
    createdAt: new Date().toISOString(),
  };

  const response = await fetch("http://localhost:3000/reactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reaction),
  });

  if (!response.ok) throw new Error("Failed to create reaction");
};

const updateReaction = async (reactionId, type) => {
  const response = await fetch(`http://localhost:3000/reactions/${reactionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, updatedAt: new Date().toISOString() }),
  });

  if (!response.ok) throw new Error("Failed to update reaction");
};

const removeReaction = async (reactionId) => {
  const response = await fetch(`http://localhost:3000/reactions/${reactionId}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to remove reaction");
};

const fetchReactions = async () => {
  try {
    const response = await fetch(`http://localhost:3000/reactions?postId=${props.postId}`);
    if (!response.ok) throw new Error("Failed to fetch reactions");
    
    const reactions = await response.json();

    likesCount.value = reactions.filter((r) => r.type === "like").length;
    dislikesCount.value = reactions.filter((r) => r.type === "dislike").length;

    // Check user's current reaction
    if (isAuthenticated.value) {
      const userReactionData = reactions.find(
        (r) => r.userId === currentUser.value.id.toString()
      );
      userReaction.value = userReactionData ? userReactionData.type : null;
    } else {
      userReaction.value = null;
    }
  } catch (error) {
    console.error("Error fetching reactions:", error);
    // Set default values on error
    likesCount.value = 0;
    dislikesCount.value = 0;
    userReaction.value = null;
  }
};

// Lifecycle
onMounted(() => {
  fetchReactions();
});
</script>

<style scoped>
.like-dislike-container {
  padding: 10px 0;
}

.btn.active {
  background-color: var(--bs-primary);
  color: white;
  border-color: var(--bs-primary);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline-success.active {
  background-color: #198754;
  border-color: #198754;
}

.btn-outline-danger.active {
  background-color: #dc3545;
  border-color: #dc3545;
}

.spinner-border-sm {
  width: 0.875rem;
  height: 0.875rem;
}

@media (max-width: 576px) {
  .d-flex.gap-2 {
    gap: 0.5rem !important;
  }
  
  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.775rem;
  }
}
</style>
