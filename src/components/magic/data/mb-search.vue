<template>
    <n-form :size="$global.uiSize.value"  inline label-placement="left" @keyup.enter="search" style="flex-wrap:wrap">
        <template v-for="(it, i) in where">
            <n-form-item v-if="it && it.label" :label="it.label" :key="i" :show-feedback="false">
                <component
                        :is="
                        !it.component ? 'mb-input' : it.component.startsWith('n-') ||
                        // $global.dynamicComponentNames.indexOf(it.component) != -1 ? it.component :
                        'mb-' + it.component
                    "
                        v-model="it.value"
                        :item-label="it.label"
                        v-bind="it.componentProps || it.props"
                />
            </n-form-item>
        </template>
        <n-form-item :show-feedback="false">
            <n-space>
                <n-button :size="$global.uiSize.value"  type="primary" @click="search">
                    <n-icon>
                        <Search/>
                    </n-icon>
                    搜索
                </n-button>
                <n-button :size="$global.uiSize.value"  @click="reset">
                    <n-icon>
                        <TrashOutline/>
                    </n-icon>
                    清空
                </n-button>
                <slot name="buttons"/>
            </n-space>
        </n-form-item>
    </n-form>
</template>

<script setup>
import {nextTick} from 'vue'
import {Search, TrashOutline, AddOutline, ArrowDownOutline} from "@vicons/ionicons5";

const props = defineProps({
	where: {
		type: Object,
		default: () => {
		}
	},
	notReset: {
		type: String,
		default: ''
	}
})

for (let key in props.where) {
	if (props.where[key] instanceof Object) {
		if (props.where[key].value == undefined) {
			props.where[key].value = null
		}
		if (props.where[key].component == 'date') {
			let isResetValue = false
			for (let k in props.where[key]) {
				if (k == 'resetValue') {
					isResetValue = true
				}
			}
			if (!isResetValue) {
				// date 组件 要reset为 undefined 要不然报错
				props.where[key].resetValue = undefined
			}
		}
	}
}

const emit = defineEmits(['search'])

function input(input) {
	if (input) {
		emit('search')
	}
}

function search() {
	for (let key in props.where) {
		if (props.where[key] instanceof Object) {
			if (props.where[key].component && props.where[key].component.startsWith('date') && props.where[key].value instanceof Array && props.where[key].value.join(',')) {
				props.where[key].value = props.where[key].value.join(',')
			}
		}
	}
	nextTick(() => {
		emit('search')
		for (let key in props.where) {
			if (props.where[key] instanceof Object) {
				if (props.where[key].component && props.where[key].component.startsWith('date') && props.where[key].value) {
					props.where[key].value = props.where[key].value.split(',')
				}
			}
		}
	})
}

function reset() {
	for (let key in props.where) {
		if (props.notReset.indexOf(key) == -1) {
			if (props.where[key] instanceof Object) {
				let isResetValue = false
				for (let k in props.where[key]) {
					if (k == 'resetValue') {
						isResetValue = true
					}
				}
				if (isResetValue) {
					props.where[key].value = props.where[key].resetValue
				} else {
					if (props.where[key].value instanceof Array) {
						props.where[key].value = []
					} else {
						props.where[key].value = null
					}
				}
			} else {
				if (props.where[key] instanceof Array) {
					props.where[key] = []
				} else {
					props.where[key] = null
				}
			}
		}
	}
	nextTick(() => emit('search'))
}

</script>

<style scoped>
:deep(.n-form-item){
    margin-bottom:10px;
}
</style>
