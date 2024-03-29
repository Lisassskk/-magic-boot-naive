<template>
    <div class="body-container">
        <div class="table-container">
            <div style="height: 100%">
                <n-data-table
                    v-if="showTable"
                    v-bind="bindProps"
                    ref="tableRef"
                    :key="tableKey"
                    :class="{ nowrap: getNowrap }"
                    tabindex="-1"
                    :columns="showColumns"
                    :virtual-scroll="virtualScroll"
                    v-model:checked-row-keys="checkedRowKeys"
                    @update:checked-row-keys="updateCheckedRowKeys"
                    v-model:expanded-row-keys="expandedRowKeys"
                    table-layout="fixed"
                    style="height: 100%"
                    :scroll-x="scrollX"
                    :striped="striped"
                    flex-height
                    :row-key="it => it[rowKey]"
                    @unstable-column-resize="unstableColumnResize"
                    @scroll="onScroll"
                >
                    <template #switch="{ row, col }">
                        <mb-switch
                            v-model="row[col.field]"
                            @change="col.change(row)"
                            v-if="col.if != undefined ? col.if(row) : true"
                            :checked-value="col.checkedValue"
                            :unchecked-value="col.uncheckedValue"
                            v-bind="col.props"
                        />
                        <span v-else>-</span>
                    </template>
                    <template #html="{ row, col }">
                        <ShowOrTooltip>
                            <span v-html="getLabel(row, col)"></span>
                        </ShowOrTooltip>
                        <mb-icon v-if="col.copyText" class="copy-text" icon="CopyOutline" @click="copyText(row[col.field])" />
                    </template>
                    <template #templet="{ row, col, index }">
                        <ShowOrTooltip>
                            <span v-html="col.templet(row, col, index)"></span>
                        </ShowOrTooltip>
                        <mb-icon v-if="col.copyText" class="copy-text" icon="CopyOutline" @click="copyText(row[col.field])" />
                    </template>
                    <template #text="{ row, col }">
                        <ShowOrTooltip>
                            <span v-html="getLabel(row, col)"></span>
                        </ShowOrTooltip>
                        <mb-icon v-if="col.copyText" class="copy-text" icon="CopyOutline" @click="copyText(row[col.field])" />
                    </template>
                    <template #buttons="{ row, col }">
                        <n-space>
                            <template v-for="it in col.buttons">
                                <n-button
                                    v-if="it.if != undefined ? it.if(row) : true"
                                    v-permission="it.permission"
                                    :type="it.type"
                                    :text="it.link"
                                    :dashed="it.dashed"
                                    :href="it.href"
                                    :color="it.color"
                                    :target="it.target"
                                    :tag="it.tag || (it.link ? 'a' : 'button')"
                                    :text-color="it.textColor || '#2D8CF0'"
                                    @click="it.click(row)"
                                >
                                    <template #icon v-if="it.icon">
                                        <mb-icon :icon="it.icon" />
                                    </template>
                                    {{ it.label }}
                                </n-button>
                            </template>
                        </n-space>
                    </template>
                    <template #dictType="{ row, col }">
                        <ShowOrTooltip>
                            <span>{{ dictStore.getDictLabel(col.dictType, row[col.field] + '') }}</span>
                        </ShowOrTooltip>
                        <mb-icon v-if="col.copyText" class="copy-text" icon="CopyOutline" @click="copyText(row[col.field])" />
                    </template>
                    <template #dynamic="{ row, col, index }">
                        <slot :name="col.field" :row="row" :col="col" :index="index" />
                    </template>
                    <template #title="{ col }">
                        <div @contextmenu.prevent="headerClick($event, col)" class="relative">
                            <div @click="dataSort(col)">
                                <label>{{ col.label }}</label>
                                <n-icon v-if="col.editIcon">
                                    <EditFilled />
                                </n-icon>
                                <n-icon v-if="col.dataSortRule">
                                    <CaretUpOutline />
                                </n-icon>
                                <n-icon v-if="col.dataSortRule == false">
                                    <CaretDownOutline />
                                </n-icon>
                                <n-icon color="#248EF4" v-if="col.realSort && !col.realSortRule">
                                    <ArrowSort16Filled />
                                </n-icon>
                                <n-icon color="#248EF4" v-if="col.realSortRule == '0'">
                                    <ArrowSortUp16Filled />
                                </n-icon>
                                <n-icon color="#248EF4" v-if="col.realSortRule == '1'">
                                    <ArrowSortDown16Filled />
                                </n-icon>
                            </div>
                            <div class="title-tools">
                                <div class="down-menus">
                                    <n-icon @click="headerClick($event, col)">
                                        <ChevronDown />
                                    </n-icon>
                                </div>
                                <div class="align-center">
                                    <mb-icon style="cursor: pointer" icon="CopyOutline" v-if="col.copyAll" @click="copyAll(col.field)" />
                                </div>
                            </div>
                        </div>
                    </template>
                    <template #image="{ row, col }">
                        <n-image-group v-if="row[col.field]">
                            <n-space>
                                <n-image v-for="it in row[col.field].split(',')" width="30" height="30" :src="it && it.startsWith('http') ? it : $global.filePrefix + encodeURIComponent(it)" />
                            </n-space>
                        </n-image-group>
                    </template>
                </n-data-table>
            </div>
            <div style="flex: 1" v-if="props.page">
                <mb-pagination style="float: right" v-bind="paginationParams" @updatePage="paginationUpdatePage" @updatePageSize="paginationUpdatePageSize" />
            </div>
        </div>
        <div ref="tableMenusRef" class="table-menus" :style="{ left: menusLeft, top: menusTop, display: showMenus ? 'flex' : 'none', width: menusWidth + 'px' }">
            <div class="menu" v-for="(menu, i) in dropMenus" @click="menu.click({ e:$event, tableId: id, hideDropMenus, initRenderTable })" :key="i">
                {{ menu.label }}
                <div class="items" :style="{ top: itemsTop, left: itemsLeft, width: itemsWidth + 'px' }"
                     v-if="menu.children && menu.children.length > 0">
                    <div class="item" v-for="item in menu.children" :key="item.value" @click="menu.click(item, $event)">
                        <n-checkbox v-model:checked="item.show" style="vertical-align: top;margin-right: 5px;" />{{ item.type == 'selection' ? '多选' : item.label }}
                    </div>
                </div>
            </div>
        </div>
        <n-dropdown
            placement="bottom-start"
            trigger="manual"
            :x="rightClickMenuX"
            :y="rightClickMenuY"
            :options="rightClickOptions"
            :show="rightClickShowDropdown"
            :on-clickoutside="() => rightClickShowDropdown = false"
            @select="rightClickMenuSelect"
        />
    </div>
</template>

<script setup>
import Sortable from 'sortablejs'
import {ref, onMounted, nextTick, h, reactive, watch, onBeforeUnmount, defineComponent, computed} from 'vue'
import { ChevronDown, CaretUpOutline, CaretDownOutline } from '@vicons/ionicons5'
import { ArrowSort16Filled, ArrowSortUp16Filled, ArrowSortDown16Filled } from '@vicons/fluent'
import { EditFilled } from '@vicons/antd'
import global from '@/scripts/global'
import {useDictStore} from "@/store/modules/dictStore";
import componentProperties from '@/components/magic-component-properties'
import { NEllipsis } from 'naive-ui'
import { cloneDeep, isEqual } from 'lodash-es'
import { useMouse, onClickOutside } from "@vueuse/core";

const dictStore = useDictStore()

const props = defineProps({
    props: {
        type: Object,
        default: () => {
        }
    },
    id: {
        type: String,
        default: ''
    },
    rowKey: {
        type: String,
        default: 'id'
    },
    nowrap: {
        type: Boolean,
        default: undefined
    },
    virtualScroll: {
        type: Boolean,
        default: false
    },
    url: {
        type: String,
        default: ''
    },
    where: {
        type: Object,
        default: () => {
        }
    },
    cols: {
        type: Array,
        default: () => []
    },
    method: {
        type: String,
        default: 'post'
    },
    limit: {
        type: Number,
        default: 10
    },
    page: {
        type: Boolean,
        default: true
    },
    data: {
        type: Array,
        default: () => null
    },
    done: {
        type: Function,
        default: () => {}
    },
    loading: {
        type: Boolean,
        default: () => true
    },
    showNo: {
        type: Boolean,
        default: true
    },
    selection: {
        type: Boolean,
        default: false
    },
    striped: {
        type: Boolean,
        default: true
    },
    selectedRowEnable: {
        type: Boolean,
        default: true
    },
    contextmenuEnable: {
        type: Boolean,
        default: false
    },
    defaultSelectedRow: {
        type: Boolean,
        default: false
    },
    defaultColWidth: {
        type: Number,
        default: 100
    },
    checkedRowKeys: {
        type: Array,
        default: () => []
    },
    keepCurrentPage: {
        type: Boolean,
        default: false
    },
    onScroll: {
        type: Function,
        default: () => {}
    },
    onContextmenu: {
        type: Function,
        default: () => {}
    },
    onDynamicSettingContextmenu: {
        type: Function,
        default: () => {
            return []
        }
    },
    onContextmenuSelect: {
        type: Function,
        default: () => {}
    }
})
const ShowOrTooltip = defineComponent({
    setup (props, { slots }) {
        const tooltip = ref()
        tooltip.value = false
        let timers
        let duration
        if (typeof props.tooltip === 'object') {
            duration = props.tooltip.duration
        }
        return () =>
            h(
                'span',
                {
                    onMouseover: () => {
                        clearTimeout(timers)
                        const onUpdateShow = (value) => {
                            if (!value) {
                                timers = setTimeout(() => {
                                    tooltip.value = false
                                }, (duration ?? 100) + 1000)
                            }
                        }
                        let tooltipProps = cloneDeep(props.tooltip)
                        if (typeof tooltipProps === 'object') {
                            if (tooltipProps.onUpdateShow) {
                                const _onUpdateShow = tooltipProps.onUpdateShow
                                tooltipProps.onUpdateShow = (value) => {
                                    call(_onUpdateShow, value)
                                    call(onUpdateShow, value)
                                }
                            } else {
                                tooltipProps.onUpdateShow = onUpdateShow
                            }
                        } else {
                            if (props.tooltip === true) {
                                tooltipProps = { onUpdateShow }
                            }
                        }
                        tooltip.value = tooltipProps
                    }
                },
                h(
                    NEllipsis,
                    {
                        ...props,
                        tooltip: tooltip.value
                    },
                    { default: slots.default }
                )
            )
    }
})
const emit = defineEmits(['update:checked-row-keys', 'selected-row', 'update:checked-row-datas'])
const tableRef = ref()
const tableSlots = ref()
const checkedRowKeys = ref(cloneDeep(props.checkedRowKeys))
const expandedRowKeys = ref([])
const sourceColumns = ref([])
const sourceData = ref([])
const columns = ref([])
const showColumns = ref([])
const bindProps = reactive(props.props || {})
const getNowrap = computed(() => props.nowrap != undefined ? props.nowrap : componentProperties.table.nowrap != undefined ? componentProperties.table.nowrap : false)
let currentRowDom = null

bindProps.rowProps = (row) => {
    let _rowProps = {}
    if(props.selectedRowEnable){
        _rowProps['onClick'] = (e) => {
            let setBackgroundColor = (dom, color) => {
                dom.forEach(d => {
                    let _color = color
                    if(d){
                        if(!_color){
                            if(d.className.indexOf('n-data-table-tr--striped') != -1){
                                _color = 'var(--n-merged-td-color-striped)'
                            }else{
                                _color = 'var(--n-merged-td-color)'
                            }
                        }
                        d.querySelectorAll('td').forEach(it => {
                            it.style['background-color'] = _color
                        })
                    }
                })
            }
            currentRowIndex.value = bindProps.data.findIndex(it => it[props.rowKey] == row[props.rowKey])
            if(currentRowDom){
                setBackgroundColor([currentRowDom, currentRowDom.previousElementSibling, currentRowDom.nextElementSibling])
            }
            currentRowDom = e.currentTarget
            setBackgroundColor([currentRowDom], componentProperties.table.selectedRowColor)
            emit('selected-row', row)
        }
    }
    if(props.contextmenuEnable){
        _rowProps['onContextmenu'] = (e) => {
            props.onContextmenu(e, row)
            e.preventDefault()
            settingRightClickOptions(props.onDynamicSettingContextmenu(row))
            currentSelection = window.getSelection().toString()
            rightClickShowDropdown.value = false
            nextTick().then(() => {
                rightClickShowDropdown.value = true;
                rightClickMenuX.value = e.clientX;
                rightClickMenuY.value = e.clientY;
            });
        }
    }
    return _rowProps
}

let currentSelection = null
const rightClickMenuX = ref(0)
const rightClickMenuY = ref(0)
const rightClickSourceOptions = [{
    title: "复制",
    key: "copy",
    icon: $common.renderIcon('CopyOutline')
}]
const rightClickOptions = ref()
const rightClickShowDropdown = ref(false)
function rightClickMenuSelect(key){
    switch (key) {
        case 'copy':
            $common.copyText(currentSelection)
            break;
        default:
            props.onContextmenuSelect(key)
            break;
    }
    rightClickShowDropdown.value = false
}
function settingRightClickOptions(options){
    rightClickOptions.value = []
    rightClickOptions.value.push(...rightClickSourceOptions)
    rightClickOptions.value.push(...options)
}

function expandByKeys(keys){
    if(typeof(keys) == 'string'){
        expandedRowKeys.value.push(keys)
    }
    if(keys instanceof Array){
        expandedRowKeys.value.push(...keys)
    }
}

const scrollX = ref()
const paginationParams = reactive({
    page: 1,
    pageSize: props.limit
})

function paginationUpdatePage(page){
    paginationParams.page = page
    loadData()
}

function paginationUpdatePageSize(pageSize){
    paginationParams.pageSize = pageSize
    paginationParams.page = 1
    loadData()
}

function handlerData(){
    let currPageData = []
    let size = paginationParams.pageSize
    let current = paginationParams.page
    if (props.page) {
        props.data.forEach((it, i) => {
            if (i >= ((current - 1) * size) && i < (current * size) && currPageData.length < size) {
                currPageData.push(it)
            }
        })
    } else {
        currPageData = props.data
    }
    paginationParams.itemCount = props.data.length
    bindProps.data = currPageData
    sourceData.value = cloneDeep(currPageData)
    bindProps.loading = false
}

function createTable() {
    bindProps.remote = !!props.url
    bindProps.loading = props.loading
    watch(() => props.data, () => {
        if (props.page && !props.keepCurrentPage) {
            paginationParams.page = 1
        }
        handlerData()
    }, {deep: true})
    watch(() => props.loading, value => bindProps.loading = value)
    watch(() => props.checkedRowKeys, (value) => {
        if(!isEqual(value, checkedRowKeys.value)){
            checkedRowKeys.value = value
        }
    })
}

function loadData(options) {
    if (props.url) {
        let where = $common.renderWhere(props.where)
        if(options){
            if(options.reload && !options.keepCurrentPage && !props.keepCurrentPage){
                paginationParams.page = 1
            }
            if(options.page){
                paginationParams.page = options.page
            }
        }
        requestData({ where, loading: options && options.loading })
    }
    if (props.data) {
        handlerData()
        dataDone()
    }
    if(options){
        if(!options.notClearChecked){
            checkedRowKeys.value = []
        }
    }
}

function dataDone(){
    props.done(bindProps.data)
    if(props.defaultSelectedRow && props.selectedRowEnable && bindProps.data.length > 0){
        nextTick(() => {
            tableRef.value.$el.querySelector('.n-data-table-base-table-body tr').click()
        })
    }
}

function requestData({ where, loading }) {
    loading = loading == undefined ? true : loading
    if(loading){
        bindProps.loading = true
    }
    if (props.page) {
        where.current = paginationParams.page
        where.size = paginationParams.pageSize
    } else {
        where.size = 99999999
    }
    let processData = (res) => {
        const {data} = res
        bindProps.data = data.list || []
        sourceData.value = cloneDeep(data.list) || []
        if(loading){
            bindProps.loading = false
        }
        if (props.page) {
            paginationParams.itemCount = data.total
        }
        dataDone()
    }
    if (props.method.toLowerCase() == 'post') {
        $common.post(props.url, where).then(processData)
    } else if(props.method.toLowerCase() == 'postjson') {
        $common.postJson(props.url, where).then(processData)
    } else {
        $common.get(props.url, where).then(processData)
    }
}
createTable()

function calcScrollX(){
    scrollX.value = showColumns.value.reduce((total, it) => total + Number(
            typeof(it.width) == 'number' ? it.width :
                typeof(it.width) == 'string' ? it.width.replace('px', '') : 200
        )
        , 0)
}

function getColWidth(){
    let minWidth = props.defaultColWidth
    let tableWidth = tableRef.value.$el.offsetWidth
    let totalWidth = 0
    let widths = 0
    let noWidth = 50
    props.cols.forEach((it, i) => {
        let width = it.width
        if(width){
            if(typeof width == 'string'){
                width = width.replace(' ','')
                if(width.indexOf('%') != -1){
                    width = width.replace('%','')
                    width = parseFloat(width)
                    width = tableWidth * (width / 100)
                }else{
                    width = parseFloat(width)
                }
            }
            totalWidth += width
            widths++
        }
    })
    if(props.selection){
        columns.value.push({
            type: 'selection',
            show: true,
            width: noWidth,
            fixed: 'left',
            options: [{
                label: '全选',
                key: 'all',
                onSelect: (pageData) => {
                    checkedRowKeys.value = pageData.map(it => it[props.rowKey])
                }
            }, {
                label: '全不选',
                key: 'none',
                onSelect: () => {
                    checkedRowKeys.value = []
                }
            }, {
                label: '反选',
                key: 'invert',
                onSelect: (pageData) => {
                    checkedRowKeys.value = pageData.filter(it => checkedRowKeys.value.indexOf(it[props.rowKey]) == -1).map(it => it[props.rowKey])
                }
            }]
        })
        tableWidth -= noWidth
    }
    if(props.showNo){
        columns.value.push({
            label: '序号',
            title: '序号',
            width: noWidth,
            align: 'center',
            show: true,
            fixed: 'left',
            render: (_,index) => {
                return index + 1
            }
        })
        tableWidth -= noWidth
    }
    if(props.cols.length * minWidth > tableWidth){
        return minWidth
    }
    return ((tableWidth - totalWidth) / (props.cols.length - widths)) - 2
}
function renderShowColumns() {
    showColumns.value = columns.value.filter(it => it.show)
    calcScrollX()
}
function getLabel(row, col){
    return $common.notEmptyNot01(row[col.field]) ? row[col.field] : $common.notEmptyNot01(col.defaultValue) ? col.defaultValue : ''
}
function fixCols() {
    tableSlots.value = tableRef.value.$slots
    const keys = Object.keys(tableSlots.value)
    let colWidth = getColWidth()
    props.cols.forEach((col) => {
        let column = {}
        column.field = col.field || $common.uuid()
        column.key = column.field
        column.label = col.label
        column.title = (col) => {
            return h(tableSlots.value['title'], {col})
        }
        column.align = col.align
        column.width = col.width || colWidth
        column.minWidth = col.minWidth || column.width
        column.fixed = col.fixed
        column.show = col.show == undefined ? true : col.show
        column.copyAll = col.copyAll
        column.realSort = col.realSort
        column.resizable = true
        column.editIcon = col.editIcon
        let type = col.type
        if (!col.render && type && keys.indexOf(type) != -1) {
            renderSlot(col, type)
        } else {
            if (col.dictType) {
                renderSlot(col, 'dictType')
            }
            if(col.templet){
                renderSlot(col, 'templet')
            }
        }
        if (col.render) {
            column.render = col.render
        }else{
            renderSlot(col, 'text')
            column.render = col.render
        }
        if (col.props) {
            for (let key in col.props) {
                column[key] = col.props[key]
            }
        }
        columns.value.push(column)
    })
    sourceColumns.value = cloneDeep(columns.value)
    if(componentProperties?.table?.remoteLoadColumn){
        componentProperties.table?.remoteLoadColumn(props.id, columns.value).then(value => {
            columns.value = value
            renderShowColumns()
        }).catch(() => {
            renderShowColumns()
        })
    }else{
        renderShowColumns()
    }
    let columnResizeTimeout = null
    watch(() => columns, () => {
        clearTimeout(columnResizeTimeout)
        columnResizeTimeout = setTimeout(() => {
            if(componentProperties?.table?.saveCols){
                componentProperties?.table?.saveCols(props.id, columns.value)
            }
        }, 500)
        renderShowColumns()
    }, { deep: true })
}

function renderSlot(col, type) {
    col.render = (row, index) => {
        return h(tableSlots.value[type], {row, index, col})
    }
}

function updateCheckedRowKeys(keys){
    if(!isEqual(checkedRowKeys.value, keys)){
        checkedRowKeys.value = keys
        emitUpdateCheckedRowKeys()
    }
}

function emitUpdateCheckedRowKeys(){
    emit('update:checked-row-keys', checkedRowKeys.value)
    emit('update:checked-row-datas', bindProps.data.filter(it => checkedRowKeys.value.indexOf(it[props.rowKey]) != -1))
}

const tableKey = ref('magicTable' + $common.uuid())
const showTable = ref(true)

function expand() {
    nextTick(() => expandedRowKeys.value = getTreeIds())
}

function toggleExpand() {
    nextTick(() => {
        if(expandedRowKeys.value.length == 0){
            expandedRowKeys.value = getTreeIds()
        }else{
            expandedRowKeys.value = []
        }
    })
}
function getTreeIds(){
    let ids = []
    recursionGetTreeIds(bindProps.data, ids)
    return ids
}
function recursionGetTreeIds(children, ids){
    children.forEach(it => {
        ids.push(it[props.rowKey])
        if(it.children && it.children.length > 0){
            recursionGetTreeIds(it.children, ids)
        }
    })
}
function initRenderTable(){
    columns.value = cloneDeep(sourceColumns.value)
    renderShowColumns()
}

function reload(options) {
    options = options || {}
    options.reload = true
    loadData(options)
}

function renderExportData(exportData) {
    let data = []
    let fields = props.cols.filter(it => it.type != 'buttons')
    exportData.forEach(it => {
        let row = {}
        fields.forEach(f => {
            if (f.exportRender) {
                row[f.label] = f.exportRender(it)
            } else if (f.render) {
                row[f.label] = f.render(it)
            } else {
                row[f.label] = it[f.field]
            }
        })
        data.push(row)
    })
    return data
}

function exportExcel({fileName}) {
    if (props.url) {
        let where = $common.renderWhere(props.where)
        where.size = 99999999
        let processData = (res) => {
            const {data} = res
            $common.exportExcel({
                data: renderExportData(data.list),
                fileName: fileName
            })
        }
        if (props.method.toLowerCase() == 'post') {
            $common.post(props.url, where).then(res => {
                processData(res)
            })
        } else {
            $common.get(props.url, where).then(res => {
                processData(res)
            })
        }
    } else if (props.data) {
        $common.exportExcel({
            data: props.data,
            fileName: fileName
        })
    }
}

function unstableColumnResize(widthAfterResize, limitWidth, column){
    column.width = limitWidth
    calcScrollX()
}

const tableMenusRef = ref()
const menusWidth = ref(158)
const itemsWidth = ref(180)
const menusLeft = ref('')
const menusTop = ref('')
const itemsLeft = ref('')
const itemsTop = ref('')
const showMenus = ref(false)
let currentCol = null
const dropMenus = reactive([{
    value: 'asc',
    label: '升序排序',
    click: () => {
        dataSort(currentCol, '0')
        showMenus.value = false
    }
}, {
    value: 'desc',
    label: '降序排序',
    click: () => {
        dataSort(currentCol, '1')
        showMenus.value = false
    }
}, {
    value: 'lock-column',
    label: '锁定到此列',
    click: () => {
        fixedColumn(columns.value.map(it => it.field).indexOf(currentCol.field))
        showMenus.value = false
    }
}, {
    value: 'undo-lock',
    label: '撤销锁定',
    click: () => {
        unFixedColumn()
        showMenus.value = false
    }
}, {
    value: 'columns',
    label: '表格列',
    children: columns,
    click: ({col, e}) => {
        if (e && e.target.className.indexOf('n-checkbox-box') == -1) {
            col.show = !col.show
        }
    }
}])
if(componentProperties?.table?.dropMenus){
    dropMenus.push(...componentProperties.table.dropMenus)
}

let mouse = useMouse()
function headerClick(e, col) {
    currentCol = col
    let clientWidth = document.body.clientWidth;
    let clientHeight = document.body.clientHeight;
    let coord = { x: mouse.x.value, y: mouse.y.value }
    if ((clientWidth - menusWidth.value - coord.x) < 0) {
        menusLeft.value = (clientWidth - menusWidth.value) + 'px'
        if ((clientWidth - menusWidth.value - itemsWidth.value - coord.x) < 0) {
            itemsLeft.value = (clientWidth - menusWidth.value - itemsWidth.value) + 'px'
        }
    } else {
        menusLeft.value = coord.x + 'px'
        itemsLeft.value = (coord.x + menusWidth.value) + 'px'
    }
    menusTop.value = coord.y + 'px'
    showMenus.value = true
    nextTick(() => {
        let itemsHeight = tableMenusRef.value.querySelectorAll('.items .item').length * 30 + 8
        itemsHeight = itemsHeight > 500 ? 500 : itemsHeight
        let tableMenus = tableMenusRef.value.getBoundingClientRect()
        if ((clientHeight - tableMenus.bottom) < itemsHeight) {
            itemsTop.value = (tableMenus.bottom - itemsHeight - 8)
        } else {
            itemsTop.value = tableMenus.bottom - 28
        }
        if(itemsTop.value < 0 ){
            itemsTop.value = 0  + 'px'
        }else{
            itemsTop.value = itemsTop.value  + 'px'
        }
    })
}
function hideDropMenus(){
    showMenus.value = false
}
function copyText(text){
    $common.copyText(text)
}
function copyAll(field){
    $common.copyText(bindProps.data.map(it => it[field]).join('\n'))
}
function dataSort(col, rule) {
    // 重置静态排序状态
    columns.value.filter(it => it.field != col.field).forEach(it => {
        it.dataSortRule = undefined
    })
    // 重置后台排序状态
    columns.value.filter(it => it.realSort && it.field != col.field).forEach(it => {
        it.realSortRule = undefined
    })
    if (col.realSort) {
        if(rule){
            col.realSortRule = rule
        }else{
            if(col.realSortRule == undefined){
                col.realSortRule = '0' // asc
            }else if(col.realSortRule == '0'){
                col.realSortRule = '1' // desc
            }else if(col.realSortRule == '1'){
                col.realSortRule = undefined
            }
        }
        if(col.realSortRule == undefined){
            props.where.orderByColumn = ''
            props.where.direction = ''
        }else{
            props.where.orderByColumn = col.field.replace(/([A-Z])/g, "_$1").toLowerCase()
            props.where.direction = col.realSortRule
        }
        reload()
    } else {
        if(rule){
            col.dataSortRule = ('0' == rule ? true : false)
        }else{
            if(col.dataSortRule == undefined){
                col.dataSortRule = true
            }else if(col.dataSortRule == true){
                col.dataSortRule = false
            }else if(col.dataSortRule == false){
                col.dataSortRule = undefined
            }
        }
        if(col.dataSortRule == undefined){
            bindProps.data = cloneDeep(sourceData.value)
        }else{
            bindProps.data.sort((a, b) => {
                if (typeof (a[col.field]) == 'number') {
                    if (col.dataSortRule) {
                        return a[col.field] - (b[col.field] || 0)
                    }
                    return (b[col.field] || 0) - a[col.field]
                } else {
                    if (col.dataSortRule) {
                        return (a[col.field] || '').localeCompare(b[col.field] || '')
                    }
                    return (b[col.field] || '').localeCompare(a[col.field] || '')
                }
            })
        }
    }
}

let fixed = false
function fixedColumn(index) {
    unFixedColumn()
    columns.value.forEach((it, i) => {
        if (i <= index) {
            it.fixed = 'left'
        }
    })
    fixed = true
}
function unFixedColumn() {
    fixed = false
    columns.value.forEach((it) => {
        if(it.fixed != 'right'){
            it.fixed = false
        }
    })
}

function getFixedCount() {
    let index = 0;
    if (props.showNo) {
        index++
    }
    if (props.selection) {
        index++
    }
    return index
}

function arrIndexExchange(array, x, y) {
    let arr_temp = cloneDeep([].concat(array));
    arr_temp.splice(x, 0, arr_temp.splice(y, 1)[0]);
    return arr_temp;
}

let sortableTh = null
function columnDrop() {
    sortableTh && sortableTh.destroy()
    const wrapperTr = tableRef.value.$el.querySelector(`.n-data-table-base-table-header thead tr`)
    sortableTh = Sortable.create(wrapperTr, {
        animation: 180,
        delay: 0,
        handle: '.n-data-table-th__title-wrapper',
        onEnd: evt => {
            nextTick(() => {
                let _oldIndex = evt.oldIndex, _newIndex = evt.newIndex;
                let fixedIndex = 0
                for(let i =0; i<columns.value.length; i++){
                    let it = columns.value[i];
                    if(it.fixed == 'left'){
                        fixedIndex = i;
                    }
                }
                if(evt.newIndex > fixedIndex){
                    fixedIndex = fixedIndex - 1
                }else{
                    if(columns.value[_oldIndex].fixed != columns.value[_newIndex].fixed){
                        fixedIndex = fixedIndex + 1
                    }
                }
                let newIndexLabel = columns.value.filter(it => it.show).filter((it, j) => j == evt.newIndex)[0].label
                columns.value.slice(0,columns.value.findIndex(it => it.label == newIndexLabel)).forEach(it => !it.show && _newIndex++)
                columns.value.slice(0,columns.value.findIndex(it => it.label == evt.clone.innerText)).forEach(it => !it.show && _oldIndex++)
                columns.value = arrIndexExchange(columns.value, _newIndex, _oldIndex)
                if (columns.value.filter((it, i) => i <= _newIndex).some(it => it.fixed && it.fixed === 'left')) {
                    unFixedColumn()
                    fixedColumn(fixedIndex)
                }
            })
        },
        onMove: evt => {
            if (evt.related.cellIndex < getFixedCount()) {
                return false
            }
            return true
        }
    })
}
const currentRowIndex = ref(0)
function directionOperation(e) {
    if(e && (e.keyCode == 38 || e.keyCode == 40)){
        e.preventDefault();
        let updateRowDom = null
        if (e && e.keyCode == 38) {// 上
            currentRowIndex.value = Math.max(0, currentRowIndex.value - 1)
            if(currentRowDom.previousElementSibling){
                updateRowDom = currentRowDom.previousElementSibling
                currentRowDom.previousElementSibling.click()
            }
        } else if (e && e.keyCode == 40) {// 下
            currentRowIndex.value = Math.min(bindProps.data.length - 1, currentRowIndex.value + 1)
            if(currentRowDom.nextElementSibling){
                updateRowDom = currentRowDom.nextElementSibling
                currentRowDom.nextElementSibling.click()
            }
        }
        if(props.virtualScroll){
            tableRef.value.scrollTo({index: currentRowIndex.value})
        }else{
            if(updateRowDom){
                tableRef.value.scrollTo({el: updateRowDom})
            }
        }
    }
}

function addEventListener() {
    tableRef.value.$el.addEventListener('keydown', directionOperation)
}

function removeListener() {
    tableRef.value.$el.removeEventListener('keydown', directionOperation)
}

function getData(){
    return bindProps.data
}

onMounted(() => {
    fixCols()
    reload()
    bindProps.size = global.uiSize;
    nextTick(() => {
        addEventListener()
        columnDrop()
        onClickOutside(tableMenusRef, () => showMenus.value = false)
        watch(showTable, (value) => {
            if(value){
                nextTick(() => {
                    columnDrop()
                })
            }
        })
        watch(() => checkedRowKeys.value, () => {
            emitUpdateCheckedRowKeys()
        })
    })
})

onBeforeUnmount(() => {
    sortableTh && sortableTh.destroy()
    removeListener()
})

defineExpose({expand, toggleExpand, reload, exportExcel, getData, expandByKeys})

</script>
<style scoped>
.body-container{
    width: 100%;
    height: 100%;
    position: relative;
}
.table-container{
    display: flex;
    height: 100%;
    flex-direction: column;
}
.btn-blue {
    color: #2D8CF0;
    transition-property: color;
    transition-duration: .25s;
}

.btn-blue:hover{
    color: #7eb6f3;
}
.table-menus {
    color: black;
    display: flex;
    flex: 1;
    flex-direction: column;
    position: fixed;
    z-index: 99999;
    background: white;
    box-shadow: 0 8px 16px 0 rgb(0 0 0 / 20%);
    border-radius: 5px;
}

.table-menus>.menu {
    font-size: 13px;
    padding: 0 8px 0 16px;
    height: 28px;
    line-height: 28px;
    cursor: pointer;
    position: relative;
    flex: 1;
    flex-direction: column;
}

.table-menus>.menu>.items {
    display: none;
    position: fixed;
    top: 50px;
    z-index: 99999;
    background: white;
    color: black;
    max-height: 500px;
    overflow-y: auto;
}

.table-menus>.menu>.items {
    padding: 4px 0;
    box-shadow: 0 0 20px rgb(0 0 0 / 20%);
}

.table-menus>.menu:hover>.items {
    display: block;
}

.items .item {
    display: inline-flex;
    align-items: center;
    font-size: 12px;
    width: 100%;
    height: 30px;
    padding-left: 24px;
    line-height: 30px;
    float: left;
    box-sizing: border-box;
}

.items .item:hover,
.table-menus .menu:hover {
    background-color: #e0f0fe;
}
.down-menus {
    cursor: pointer;
    display: none;
}
.n-data-table-tr th:hover .down-menus,
.n-data-table-tr th .down-menus:hover {
    display: flex;
    align-items: center
}
.align-center{
    display: flex;
    align-items: center
}
.n-data-table{
    outline: none;
}
.nowrap :deep(td),
.nowrap :deep(th){
    white-space: nowrap;
    overflow: hidden;
}
.nowrap :deep(.n-space){
    flex-wrap: nowrap!important;
}
:deep(.n-data-table .n-data-table-check-extra){
    right: 0px;
}
.copy-text{
    margin-top: 5px;
    float: right;
    cursor: pointer;
}
.title-tools{
    display: flex;
    position: absolute;
    right: 0px;
    top: 0px;
    bottom: 0px;
}
</style>
