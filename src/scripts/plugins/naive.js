import * as NaiveUI from 'naive-ui';

const naive = NaiveUI.create({
    components: [
        // NaiveUI.NConfigProvider,
        // NaiveUI.NLayout,
        // NaiveUI.NLayoutHeader,
        // NaiveUI.NLayoutSider,
        // NaiveUI.NLayoutContent,
        // NaiveUI.NLayoutFooter,
        // NaiveUI.NMenu,
        // NaiveUI.NSpace,
        // NaiveUI.NIcon,
        // NaiveUI.NSwitch,
        // NaiveUI.NTag,
        // NaiveUI.NForm,
        // NaiveUI.NFormItem,
        // NaiveUI.NInput,
        // NaiveUI.NButton

        NaiveUI.NMessageProvider,
        NaiveUI.NDialogProvider,
        NaiveUI.NConfigProvider,
        NaiveUI.NInput,
        NaiveUI.NButton,
        NaiveUI.NForm,
        NaiveUI.NFormItem,
        NaiveUI.NFormItemGi,
        NaiveUI.NCheckboxGroup,
        NaiveUI.NCheckbox,
        NaiveUI.NIcon,
        NaiveUI.NLayout,
        NaiveUI.NLayoutHeader,
        NaiveUI.NLayoutContent,
        NaiveUI.NLayoutFooter,
        NaiveUI.NLayoutSider,
        NaiveUI.NMenu,
        NaiveUI.NBreadcrumb,
        NaiveUI.NBreadcrumbItem,
        NaiveUI.NDropdown,
        NaiveUI.NSpace,
        NaiveUI.NTooltip,
        NaiveUI.NAvatar,
        NaiveUI.NTabs,
        NaiveUI.NTabPane,
        NaiveUI.NCard,
        NaiveUI.NRow,
        NaiveUI.NCol,
        NaiveUI.NDrawer,
        NaiveUI.NDrawerContent,
        NaiveUI.NDivider,
        NaiveUI.NSwitch,
        NaiveUI.NBadge,
        NaiveUI.NAlert,
        NaiveUI.NElement,
        NaiveUI.NTag,
        NaiveUI.NNotificationProvider,
        NaiveUI.NProgress,
        NaiveUI.NDatePicker,
        NaiveUI.NGrid,
        NaiveUI.NGridItem,
        NaiveUI.NList,
        NaiveUI.NListItem,
        NaiveUI.NThing,
        NaiveUI.NDataTable,
        NaiveUI.NPopover,
        NaiveUI.NPagination,
        NaiveUI.NSelect,
        NaiveUI.NRadioGroup,
        NaiveUI.NRadio,
        NaiveUI.NRadioButton,
        NaiveUI.NSteps,
        NaiveUI.NStep,
        NaiveUI.NInputGroup,
        NaiveUI.NResult,
        NaiveUI.NDescriptions,
        NaiveUI.NDescriptionsItem,
        NaiveUI.NTable,
        NaiveUI.NInputNumber,
        NaiveUI.NLoadingBarProvider,
        NaiveUI.NModal,
        NaiveUI.NUpload,
        NaiveUI.NUploadDragger,
        NaiveUI.NTree,
        NaiveUI.NTreeSelect,
        NaiveUI.NSpin,
        NaiveUI.NTimePicker,
        NaiveUI.NBackTop,
        NaiveUI.NSkeleton,
        NaiveUI.NImage,
        NaiveUI.NImageGroup,
    ]
});

export function setupNaive(app) {
    app.use(naive)
}
