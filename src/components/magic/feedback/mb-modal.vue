<template>
    <n-modal
        v-model:show="showModal"
        preset="dialog"
        :title="title"
        :show-icon="false"
        :mask-closable="maskClosable"
        :style="{ width }"
        :size="$global.uiSize.value"
    >
        <div style="margin-top:24px">
            <slot/>
        </div>
        <template #action>
            <slot name="action" v-if="showFooter">
                <n-button :size="$global.uiSize.value" @click="() => showModal = false">
                    <n-icon>
                        <Close />
                    </n-icon>
                    关闭
                </n-button>
                <n-button :size="$global.uiSize.value" type="primary" :loading="confirmLoading" @click="confirm">
                    <n-icon>
                        <Checkmark />
                    </n-icon>
                    确定
                </n-button>
            </slot>
        </template>
    </n-modal>
</template>

<script setup>
import {ref} from 'vue'
import {Close,Checkmark} from '@vicons/ionicons5'

const emit = defineEmits(['confirm'])
const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    width: {
        type: String,
        default: ''
    },
    maskClosable: {
        type: Boolean,
        default: true
    },
    showFooter: {
        type: Boolean,
        default: true
    }
})
const showModal = ref(false)
const confirmLoading = ref(false)

function show() {
    showModal.value = true
}

function hide() {
    showModal.value = false
}

function loading() {
    confirmLoading.value = true
}

function hideLoading() {
    confirmLoading.value = false
}

function confirm() {
    emit('confirm', {
        loading,
        hideLoading,
        hide,
        title: props.title
    })
}

defineExpose({show, hide, loading, hideLoading})
</script>
