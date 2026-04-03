export type Locale = 'zh' | 'en';

const translations = {
  zh: {
    // Header
    open: '打开',
    folder: '文件夹',
    save: '保存',
    closeTab: '关闭标签',
    confirmCloseUnsavedTab: '该标签有未保存修改，确定关闭吗？',
    refresh: '刷新',
    edit: '编辑',
    split: '分栏',
    preview: '预览',
    decreaseFontSize: '减小字体',
    increaseFontSize: '增大字体',

    // Sidebar
    files: '文件',
    recent: '最近',

    // TOC
    toc: '目录',
    noHeadings: '未找到标题',
    expandAll: '全部展开',
    collapseAll: '全部收起',

    // Recent files
    noRecentFiles: '暂无历史记录',
    clearHistory: '清空历史',
    pin: '置顶',
    unpin: '取消置顶',
    pinned: '已置顶',

    // File tree
    noFolderOpened: '尚未打开文件夹。',
    openFolderHint: '使用文件 > 文件夹来开始。',
    emptyFolder: '此文件夹为空。',

    // Empty state
    appTitle: 'MD Reader',
    openFileToStart: '打开文件或文件夹以开始',
    openFile: '打开文件',
    openFileButton: '打开文件',

    // Tooltips
    toggleSidebar: '切换侧边栏',
    toggleTOC: '切换目录',
    theme: '主题',
    language: '语言',

    // Update
    checkForUpdates: '检查更新',
    updateChecking: '检查中...',
    updateCancel: '取消',
    updateUpToDate: '已是最新版',
    updateAvailable: '可用',
    updateNow: '立即更新',
    updateDownloading: '下载中...',
    updateReady: '已就绪',
    updateRestart: '立即重启',
    updateFailed: '更新失败',

    // AI
    aiSummary: 'AI 总结',
    aiSettings: 'AI 设置',
    aiBaseUrl: '接口地址',
    aiApiKey: 'API 密钥',
    aiModel: '模型',
    aiTestConnection: '测试连接',
    aiTestSuccess: '连接成功',
    aiTestFailed: '连接失败',
    aiSave: '保存',
    aiCancel: '取消',
    aiSummarizing: '正在总结...',
    aiNoContent: '请先打开一个文档',
    aiNotConfigured: '请先配置 AI 设置',
    aiCollapse: '收起',
    aiExpand: '展开',
    aiClose: '关闭',
    aiRetry: '重试',
  },
  en: {
    // Header
    open: 'Open',
    folder: 'Folder',
    save: 'Save',
    closeTab: 'Close Tab',
    confirmCloseUnsavedTab: 'This tab has unsaved changes. Close it anyway?',
    refresh: 'Refresh',
    edit: 'Edit',
    split: 'Split',
    preview: 'Preview',
    decreaseFontSize: 'Decrease Font Size',
    increaseFontSize: 'Increase Font Size',

    // Sidebar
    files: 'Files',
    recent: 'Recent',

    // TOC
    toc: 'Table of Contents',
    noHeadings: 'No headings found',
    expandAll: 'Expand All',
    collapseAll: 'Collapse All',

    // Recent files
    noRecentFiles: 'No recent files',
    clearHistory: 'Clear History',
    pin: 'Pin',
    unpin: 'Unpin',
    pinned: 'Pinned',

    // File tree
    noFolderOpened: 'No folder opened.',
    openFolderHint: 'Use File > Folder to get started.',
    emptyFolder: 'This folder is empty.',

    // Empty state
    appTitle: 'MD Reader',
    openFileToStart: 'Open a file or folder to get started',
    openFile: 'Open file',
    openFileButton: 'Open File',

    // Tooltips
    toggleSidebar: 'Toggle Sidebar',
    toggleTOC: 'Toggle Table of Contents',
    theme: 'Theme',
    language: 'Language',

    // Update
    checkForUpdates: 'Check for Updates',
    updateChecking: 'Checking...',
    updateCancel: 'Cancel',
    updateUpToDate: 'Up to date',
    updateAvailable: 'available',
    updateNow: 'Update Now',
    updateDownloading: 'Downloading...',
    updateReady: 'Ready',
    updateRestart: 'Restart Now',
    updateFailed: 'Update failed',

    // AI
    aiSummary: 'AI Summary',
    aiSettings: 'AI Settings',
    aiBaseUrl: 'Base URL',
    aiApiKey: 'API Key',
    aiModel: 'Model',
    aiTestConnection: 'Test Connection',
    aiTestSuccess: 'Connection Successful',
    aiTestFailed: 'Connection Failed',
    aiSave: 'Save',
    aiCancel: 'Cancel',
    aiSummarizing: 'Summarizing...',
    aiNoContent: 'Please open a document first',
    aiNotConfigured: 'Please configure AI settings first',
    aiCollapse: 'Collapse',
    aiExpand: 'Expand',
    aiClose: 'Close',
    aiRetry: 'Retry',
  },
} as const;

export type TranslationKey = keyof typeof translations.zh;

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key];
}
