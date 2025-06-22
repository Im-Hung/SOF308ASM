<template>
  <div class="card mb-4">
    <div class="card-body">
      <!-- Avatar Upload -->
      <div class="text-center mb-4">
        <img
          :src="form.avatar"
          alt="Avatar Preview"
          class="rounded-circle img-thumbnail"
          style="width: 120px; height: 120px; object-fit: cover"
        />
        <div class="mt-2">
          <input type="file" accept="image/*" @change="onAvatarChange" />
        </div>
      </div>

      <!-- Full Name -->
      <div class="row mb-3">
        <div class="col-sm-3"><label class="form-label">Full Name</label></div>
        <div class="col-sm-9">
          <input v-model="form.fullName" type="text" class="form-control" />
        </div>
      </div>

      <!-- Email -->
      <div class="row mb-3">
        <div class="col-sm-3"><label class="form-label">Email</label></div>
        <div class="col-sm-9">
          <input v-model="form.email" type="email" class="form-control" />
        </div>
      </div>

      <!-- Phone -->
      <div class="row mb-3">
        <div class="col-sm-3"><label class="form-label">Phone</label></div>
        <div class="col-sm-9">
          <input v-model="form.phone" type="text" class="form-control" />
        </div>
      </div>

      <!-- Address -->
      <div class="row mb-3">
        <div class="col-sm-3"><label class="form-label">Address</label></div>
        <div class="col-sm-9">
          <input v-model="form.address" type="text" class="form-control" />
        </div>
      </div>

      <!-- Buttons -->
      <div class="text-end">
        <button class="btn btn-secondary me-2" @click="$emit('cancel')">Cancel</button>
        <button class="btn btn-primary" @click="saveProfile">Save</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineEmits, reactive } from 'vue'

const emit = defineEmits(['cancel', 'save'])

const form = reactive({
  avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp',
  fullName: 'V-TEC CORPORATION',
  email: 'vtec@corporation.com',
  phone: '(+84) 125-680-7412',
  address: 'Bien Hoa City, Dong Nai Province, Viet Nam',
})

function onAvatarChange(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = () => {
      form.avatar = reader.result
    }
    reader.readAsDataURL(file)
  }
}

function saveProfile() {
  emit('save', { ...form })
}
</script>
