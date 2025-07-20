import { App, Plugin, PluginSettingTab, Setting, TFolder, Notice, TFile, Modal, TAbstractFile } from 'obsidian';
import imageCompression from 'browser-image-compression';

// 语言类型
type Language = 'en' | 'zh';

// 国际化文本接口
interface I18nTexts {
	// Commands
	compressImages: string;
	compressImagesInFolder: string;
	
	// Modal titles
	selectFilesAndFolders: string;
	imageCompression: string;
	compressionProgress: string;
	compressionResults: string;
	
	// Filter settings
	filterSettings: string;
	minWidth: string;
	minHeight: string;
	minFileSize: string;
	minWidthDesc: string;
	minHeightDesc: string;
	minFileSizeDesc: string;
	
	// Compression settings
	compressionSettings: string;
	resolutionScale: string;
	resolutionScaleDesc: string;
	targetQuality: string;
	targetFileSize: string;
	targetQualityDesc: string;
	targetFileSizeDesc: string;
	
	// UI elements
	selectAll: string;
	hidePreviews: string;
	showPreviews: string;
	compressButtonText: string;
	scanning: string;
	noFilesSelected: string;
	foundImages: string;
	imagesMatchFilters: string;
	noImagesFound: string;
	
	// Progress and results
	preparing: string;
	compressing: string;
	completed: string;
	skipped: string;
	skippedGif: string;
	overallStatistics: string;
	detailedResults: string;
	totalFiles: string;
	compressed: string;
	failed: string;
	originalSize: string;
	finalSize: string;
	spaceSaved: string;
	resultSavings: string;
	compressionFailed: string;
	skippedReason: string;
	skippedGifReason: string;
	close: string;
	
	// Settings tab
	settingsImageFiltering: string;
	settingsCompressionSettings: string;
	settingsMinWidthName: string;
	settingsMinHeightName: string;
	settingsMinFileSizeName: string;
	settingsMinWidthDesc: string;
	settingsMinHeightDesc: string;
	settingsMinFileSizeDesc: string;
	settingsTargetType: string;
	settingsTargetTypeDesc: string;
	settingsTargetQualityName: string;
	settingsTargetQualityDesc: string;
	settingsTargetFileSizeName: string;
	settingsTargetFileSizeDesc: string;
	settingsResolutionScaleName: string;
	settingsResolutionScaleDesc: string;
	settingsEnableTargetLimitName: string;
	settingsEnableTargetLimitDesc: string;
	settingsShowResultsName: string;
	settingsShowResultsDesc: string;
	
	// Options
	targetQualityOption: string;
	targetFileSizeOption: string;
	
	// Notifications
	successNotification: string;
	
	// Additional UI texts
	selectFilesOrFoldersToScanForImages: string;
	noImagesFoundMatchingTheCurrentFilters: string;
}

// 中文文本
const zhTexts: I18nTexts = {
	// Commands
	compressImages: '压缩图片',
	compressImagesInFolder: '压缩文件夹中的图片',
	
	// Modal titles
	selectFilesAndFolders: '选择文件和文件夹',
	imageCompression: '图片压缩',
	compressionProgress: '压缩进度',
	compressionResults: '压缩结果',
	
	// Filter settings
	filterSettings: '过滤设置',
	minWidth: '最小宽度 (px)',
	minHeight: '最小高度 (px)',
	minFileSize: '最小文件大小 (MB)',
	minWidthDesc: '仅处理宽度大于此值的图片（像素）',
	minHeightDesc: '仅处理高度大于此值的图片（像素）',
	minFileSizeDesc: '仅处理大于此大小的图片（兆字节）',
	
	// Compression settings
	compressionSettings: '压缩设置',
	resolutionScale: '分辨率缩放 (%)',
	resolutionScaleDesc: '缩放图片分辨率：100% = 原始尺寸，50% = 一半尺寸。（范围：10-100）',
	targetQuality: '目标质量 (%)',
	targetFileSize: '目标文件大小 (MB)',
	targetQualityDesc: '目标质量百分比',
	targetFileSizeDesc: '目标文件大小（兆字节）',
	
	// UI elements
	selectAll: '全选',
	hidePreviews: '隐藏预览',
	showPreviews: '显示预览',
	compressButtonText: '压缩 {0} 张图片',
	scanning: '扫描中...',
	noFilesSelected: '未选择文件',
	foundImages: '发现 {0} 张图片',
	imagesMatchFilters: '{0} / {1} 张图片符合过滤条件',
	noImagesFound: '未找到符合过滤条件的图片。',
	
	// Progress and results
	preparing: '准备压缩...',
	compressing: '压缩中: {0}',
	completed: '完成: {0}',
	skipped: '跳过（无大小减少）: {0}',
	skippedGif: '跳过（GIF动画）: {0}',
	overallStatistics: '总体统计',
	detailedResults: '详细结果',
	totalFiles: '总文件数: {0}',
	compressed: '已压缩: {0}',
	failed: '失败: {0}',
	originalSize: '原始大小: {0} MB',
	finalSize: '最终大小: {0} MB',
	spaceSaved: '节省空间: {0} MB',
	resultSavings: '节省 {0} MB',
	compressionFailed: '压缩失败',
	skippedReason: '跳过 - 压缩会增加文件大小',
	skippedGifReason: '跳过 - 保护GIF动画',
	close: '关闭',
	
	// Settings tab
	settingsImageFiltering: '图片过滤条件',
	settingsCompressionSettings: '压缩设置',
	settingsMinWidthName: '最小图片宽度 (px)',
	settingsMinHeightName: '最小图片高度 (px)',
	settingsMinFileSizeName: '最小文件大小 (MB)',
	settingsMinWidthDesc: '仅压缩宽度大于此值的图片。设置为0以禁用。',
	settingsMinHeightDesc: '仅压缩高度大于此值的图片。设置为0以禁用。',
	settingsMinFileSizeDesc: '仅压缩大于此大小的文件（兆字节）。设置为0以禁用。',
	settingsTargetType: '压缩目标',
	settingsTargetTypeDesc: '选择以特定质量或目标文件大小为目标。',
	settingsTargetQualityName: '目标压缩质量 (%)',
	settingsTargetQualityDesc: '设置目标压缩质量百分比（0-100）。较低的值 = 较小的文件。',
	settingsTargetFileSizeName: '目标文件大小 (MB)',
	settingsTargetFileSizeDesc: '设置压缩图片的目标文件大小。',
	settingsResolutionScaleName: '分辨率缩放 (%)',
	settingsResolutionScaleDesc: '缩小图片分辨率。100%表示原始大小，50%是一半大小。（范围：10-100）',
	settingsEnableTargetLimitName: '启用压缩目标',
	settingsEnableTargetLimitDesc: '启用后，将按设定的质量或文件大小目标进行压缩。禁用时使用默认压缩设置。',
	settingsShowResultsName: '显示压缩结果',
	settingsShowResultsDesc: '完成后显示详细的压缩统计信息。禁用时仅显示简单通知。',
	
	// Options
	targetQualityOption: '质量 (%)',
	targetFileSizeOption: '文件大小',
	
	// Notifications
	successNotification: '成功处理 {0}/{1} 张图片（{2} 张已压缩，{3} 张跳过），节省了 {4} MB',
	
	// Additional UI texts
	selectFilesOrFoldersToScanForImages: '选择文件或文件夹以扫描图片',
	noImagesFoundMatchingTheCurrentFilters: '未找到符合当前过滤条件的图片'
};

// 英文文本
const enTexts: I18nTexts = {
	// Commands
	compressImages: 'Compress Images',
	compressImagesInFolder: 'Compress images in folder',
	
	// Modal titles
	selectFilesAndFolders: 'Select Files & Folders',
	imageCompression: 'Image Compression',
	compressionProgress: 'Compression Progress',
	compressionResults: 'Compression Results',
	
	// Filter settings
	filterSettings: 'Filter Settings',
	minWidth: 'Min Width (px)',
	minHeight: 'Min Height (px)',
	minFileSize: 'Min File Size (MB)',
	minWidthDesc: 'Only process images wider than this (pixels)',
	minHeightDesc: 'Only process images taller than this (pixels)',
	minFileSizeDesc: 'Only process images larger than this (megabytes)',
	
	// Compression settings
	compressionSettings: 'Compression Settings',
	resolutionScale: 'Resolution Scale (%)',
	resolutionScaleDesc: 'Scale image resolution: 100% = original, 50% = half size. (Range: 10-100)',
	targetQuality: 'Target Quality (%)',
	targetFileSize: 'Target File Size (MB)',
	targetQualityDesc: 'Target quality percentage',
	targetFileSizeDesc: 'Target file size in megabytes',
	
	// UI elements
	selectAll: 'Select All',
	hidePreviews: 'Hide Previews',
	showPreviews: 'Show Previews',
	compressButtonText: 'Compress {0} Images',
	scanning: 'Scanning...',
	noFilesSelected: 'No files selected',
	foundImages: 'Found {0} images',
	imagesMatchFilters: '{0} of {1} images match filters',
	noImagesFound: 'No images found matching the filter criteria.',
	
	// Progress and results
	preparing: 'Preparing to compress...',
	compressing: 'Compressing: {0}',
	completed: 'Completed: {0}',
	skipped: 'Skipped (no size reduction): {0}',
	skippedGif: 'Skipped (GIF animation): {0}',
	overallStatistics: 'Overall Statistics',
	detailedResults: 'Detailed Results',
	totalFiles: 'Total Files: {0}',
	compressed: 'Compressed: {0}',
	failed: 'Failed: {0}',
	originalSize: 'Original Size: {0} MB',
	finalSize: 'Final Size: {0} MB',
	spaceSaved: 'Space Saved: {0} MB',
	resultSavings: 'Saved {0} MB',
	compressionFailed: 'Compression failed',
	skippedReason: 'Skipped - compression would increase file size',
	skippedGifReason: 'Skipped - preserving GIF animation',
	close: 'Close',
	
	// Settings tab
	settingsImageFiltering: 'Image Filtering Conditions',
	settingsCompressionSettings: 'Compression Settings',
	settingsMinWidthName: 'Min image width (px)',
	settingsMinHeightName: 'Min image height (px)',
	settingsMinFileSizeName: 'Min file size (MB)',
	settingsMinWidthDesc: 'Compress only if width is greater than this value. Set to 0 to disable.',
	settingsMinHeightDesc: 'Compress only if height is greater than this value. Set to 0 to disable.',
	settingsMinFileSizeDesc: 'Compress only if file size is greater than this value (in megabytes). Set to 0 to disable.',
	settingsTargetType: 'Compression Target',
	settingsTargetTypeDesc: 'Choose whether to target a specific quality or a target file size.',
	settingsTargetQualityName: 'Target compression quality (%)',
	settingsTargetQualityDesc: 'Set the target compression quality as a percentage (0-100). Lower values = smaller files.',
	settingsTargetFileSizeName: 'Target file size (MB)',
	settingsTargetFileSizeDesc: 'Set the target file size for the compressed image.',
	settingsResolutionScaleName: 'Resolution Scale (%)',
	settingsResolutionScaleDesc: 'Scale down the image resolution. 100% means original size, 50% is half size. (Range: 10-100)',
	settingsEnableTargetLimitName: 'Enable Compression Target',
	settingsEnableTargetLimitDesc: 'When enabled, compress images according to quality or file size targets. When disabled, use default compression settings.',
	settingsShowResultsName: 'Show compression results',
	settingsShowResultsDesc: 'Display detailed compression statistics after completion. When disabled, only shows a simple notification.',
	
	// Options
	targetQualityOption: 'Quality (%)',
	targetFileSizeOption: 'File Size',
	
	// Notifications
	successNotification: 'Successfully processed {0}/{1} images ({2} compressed, {3} skipped), saved {4} MB',
	
	// Additional UI texts
	selectFilesOrFoldersToScanForImages: 'Select files or folders to scan for images',
	noImagesFoundMatchingTheCurrentFilters: 'No images found matching the current filters'
};

// 国际化类
class I18n {
	private static language: Language = 'en';
	private static texts: I18nTexts = enTexts;
	
	static init() {
		// 检测系统语言
		const locale = navigator.language || 'en';
		this.language = locale.startsWith('zh') ? 'zh' : 'en';
		this.texts = this.language === 'zh' ? zhTexts : enTexts;
	}
	
	static t(key: keyof I18nTexts, ...args: (string | number)[]): string {
		let text = this.texts[key] || key as string;
		// 简单的字符串替换，支持 {0}, {1} 等占位符
		args.forEach((arg, index) => {
			text = text.replace(`{${index}}`, String(arg));
		});
		return text;
	}
	
	static getLanguage(): Language {
		return this.language;
	}
}

// 压缩结果接口
interface CompressionResult {
	file: TFile;
	originalSize: number; // MB
	compressedSize: number; // MB
	savedSize: number; // MB
	compressionRatio: number; // 压缩比例 (0-1)
	success: boolean;
	error?: string;
}

// 更新设置接口
interface ImageCompressorSettings {
	minWidth: number;
	minHeight: number;
	minFileSize: number; // 以MB为单位
	targetType: 'quality' | 'size';
	targetQuality: number; // 目标质量百分比 (0-100)
	targetFileSize: number; // 目标文件大小 (MB)
	resolutionScale: number; // 分辨率缩放百分比 (10-100)
	enableTargetLimit: boolean; // 是否启用质量限制
	showCompressionResults: boolean; // 是否显示压缩结果
}

const DEFAULT_SETTINGS: ImageCompressorSettings = {
	minWidth: -1, // -1表示未设置
	minHeight: -1, // -1表示未设置
	minFileSize: -1, // -1表示未设置
	targetType: 'quality',
	targetQuality: 70, // 默认质量70%
	targetFileSize: 0.5, // 默认目标大小0.5MB
	resolutionScale: 100, // 默认100%分辨率
	enableTargetLimit: true, // 默认启用质量限制
	showCompressionResults: true, // 默认显示压缩结果
}

export default class ImageCompressorPlugin extends Plugin {
	settings: ImageCompressorSettings;

	async onload() {
		// 初始化国际化
		I18n.init();
		
		await this.loadSettings();

		this.addCommand({
			id: 'compress-images',
			name: I18n.t('compressImages'),
			callback: () => {
				new DualModalManager(this.app, this).open();
			},
		});

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (file instanceof TFolder) {
					menu.addItem((item) => {
						item
							.setTitle(I18n.t('compressImagesInFolder'))
							.setIcon("image-file")
							.onClick(() => {
								new DualModalManager(this.app, this, file).open();
							});
					});
				}
			})
		);

		this.addSettingTab(new ImageCompressorSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

interface FoundImage {
	file: TFile;
	width: number;
	height: number;
	size: number; // in KB
	ratio: number; // size / (width * height)
}

class ImageScanner {
	app: App;

	constructor(app: App) {
		this.app = app;
	}

	async scanFiles(files: TAbstractFile[]): Promise<FoundImage[]> {
		const images: FoundImage[] = [];
		for (const file of files) {
			if (file instanceof TFolder) {
				images.push(...await this.scanFolder(file));
			} else if (file instanceof TFile && file.extension === 'md') {
				images.push(...await this.parseMarkdownFile(file));
			}
		}
		const uniqueImages = Array.from(new Map(images.map(i => [i.file.path, i])).values());
        return uniqueImages;
	}

	async scanFolder(folder: TFolder): Promise<FoundImage[]> {
		let images: FoundImage[] = [];
		for (const child of folder.children) {
			if (child instanceof TFolder) {
				images.push(...await this.scanFolder(child));
			} else if (child instanceof TFile && child.extension === 'md') {
				images.push(...await this.parseMarkdownFile(child));
			}
		}
		return images;
	}

	async parseMarkdownFile(file: TFile): Promise<FoundImage[]> {
		const foundImages: FoundImage[] = [];
		const content = await this.app.vault.read(file);
		const imageRegex = /!\[\[([^\]]+)\]\]|!\[.*\]\((.*)\)/g;
		let match;

		while ((match = imageRegex.exec(content)) !== null) {
			const imageName = match[1] || match[2];
			if (imageName) {
				const imageFile = this.app.metadataCache.getFirstLinkpathDest(imageName, file.path);
				if (imageFile instanceof TFile && ['jpeg', 'jpg', 'png', 'gif', 'webp'].includes(imageFile.extension.toLowerCase())) {
					const image = await this.getImageDetails(imageFile);
					if (image) {
						foundImages.push(image);
					}
				}
			}
		}
		return foundImages;
	}

	async getImageDetails(file: TFile): Promise<FoundImage | null> {
		const stats = file.stat;
		const size = stats.size; // in Bytes

		const url = this.app.vault.getResourcePath(file);
		const img = new Image();
		img.src = url;

		return new Promise((resolve) => {
			img.onload = () => {
				const sizeInMB = size / (1024 * 1024); // Convert to MB
				const totalPixels = img.width * img.height;
				// 改用每百万像素的KB数作为压缩比指标，更直观
				const compressionRatio = (size / 1024) / (totalPixels / 1000000); // KB per megapixel
				
				resolve({
					file: file,
					width: img.width,
					height: img.height,
					size: sizeInMB, // 现在以MB为单位
					ratio: compressionRatio // KB per megapixel - 更直观的压缩比指标
				});
			};
			img.onerror = () => resolve(null);
		});
	}
}

class DualModalManager {
    app: App;
    plugin: ImageCompressorPlugin;
    initialFolder: TFolder | null;
    
    fileSelector: FileSelectorModal;
    previewPanel: PreviewPanelModal;
    container: HTMLElement;
    handleKeyDown: (e: KeyboardEvent) => void;

    constructor(app: App, plugin: ImageCompressorPlugin, initialFolder: TFolder | null = null) {
        this.app = app;
        this.plugin = plugin;
        this.initialFolder = initialFolder;
    }

    open() {
        // Create container for both modals
        this.container = document.body.createDiv({ cls: 'image-compressor-dual-modal' });
        
        // Create both modals
        this.fileSelector = new FileSelectorModal(this.app, this.plugin, this.initialFolder);
        this.previewPanel = new PreviewPanelModal(this.app, this.plugin);
        
        // Set up communication between modals
        this.fileSelector.onSelectionChange = (selectedFiles) => {
            this.previewPanel.updateSelection(selectedFiles);
        };
        
        // Render both modals
        this.fileSelector.render(this.container);
        this.previewPanel.render(this.container);
        
        // Set up close handlers
        this.fileSelector.onClose = () => this.close();
        this.previewPanel.onClose = () => this.close();
        
        // Add ESC key support
        this.handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                this.close();
            }
        };
        document.addEventListener('keydown', this.handleKeyDown);
        
        // Initial scan if folder is selected
        if (this.initialFolder) {
            this.fileSelector.selectFolder(this.initialFolder);
        }
    }

    close() {
        if (this.container) {
            this.container.remove();
        }
        // Remove ESC key listener
        if (this.handleKeyDown) {
            document.removeEventListener('keydown', this.handleKeyDown);
        }
    }
}

class FileSelectorModal {
    app: App;
    plugin: ImageCompressorPlugin;
    initialFolder: TFolder | null;
    fileTree: FileTree;
    onSelectionChange: (files: TAbstractFile[]) => void = () => {};
    onClose: () => void = () => {};

    constructor(app: App, plugin: ImageCompressorPlugin, initialFolder: TFolder | null) {
        this.app = app;
        this.plugin = plugin;
        this.initialFolder = initialFolder;
        this.fileTree = new FileTree(this.app, this.app.vault.getRoot(), initialFolder);
    }

    render(container: HTMLElement) {
        const modal = container.createDiv({ cls: 'image-compressor-file-selector' });
        
        // Header - 移除关闭按钮
        const header = modal.createDiv({ cls: 'modal-header' });
        header.createEl('h2', { text: I18n.t('selectFilesAndFolders') });
        
        // Body
        const body = modal.createDiv({ cls: 'modal-body' });
        const treeContainer = body.createDiv({ cls: 'file-tree-container' });
        
        this.fileTree.render(treeContainer, () => {
            const selection = this.fileTree.getSelection();
            this.onSelectionChange(selection);
        });
    }
    
    selectFolder(folder: TFolder) {
        this.fileTree.toggleNodeSelection(folder, true, true);
    }
}

class PreviewPanelModal {
    app: App;
    plugin: ImageCompressorPlugin;
    tempSettings: ImageCompressorSettings;
    
    allScannedImages: FoundImage[] = [];
    filteredImages: FoundImage[] = [];
    selectedImages: Set<TFile> = new Set();
    showPreviews = true;
    
    // UI Elements
    filtersContainer: HTMLElement;
    previewGrid: HTMLElement;
    compressButton: HTMLElement; // Changed to HTMLElement to allow dynamic content
    statusText: HTMLElement;
    updateSelectAllCheckbox: () => void; // 添加类型声明
    
    onClose: () => void = () => {};

    constructor(app: App, plugin: ImageCompressorPlugin) {
        this.app = app;
        this.plugin = plugin;
        
        // Initialize temp settings from plugin settings，但过滤器使用0作为默认值（在UI中显示为空）
        this.tempSettings = {
            ...this.plugin.settings,
            minWidth: this.plugin.settings.minWidth === -1 ? 0 : this.plugin.settings.minWidth,
            minHeight: this.plugin.settings.minHeight === -1 ? 0 : this.plugin.settings.minHeight,
            minFileSize: this.plugin.settings.minFileSize === -1 ? 0 : this.plugin.settings.minFileSize,
            targetType: this.plugin.settings.targetType,
            targetQuality: this.plugin.settings.targetQuality,
            targetFileSize: this.plugin.settings.targetFileSize,
            resolutionScale: this.plugin.settings.resolutionScale,
            enableTargetLimit: this.plugin.settings.enableTargetLimit,
        };
    }

    render(container: HTMLElement) {
        const modal = container.createDiv({ cls: 'image-compressor-preview-panel' });
        
        // Header - 移除关闭按钮
        const header = modal.createDiv({ cls: 'modal-header' });
        header.createEl('h2', { text: I18n.t('imageCompression') });
        
        // Controls
        const controls = modal.createDiv({ cls: 'preview-panel-controls' });
        this.createFilterControls(controls);
        
        // Toolbar
        const toolbar = modal.createDiv({ cls: 'preview-toolbar' });
        this.createToolbar(toolbar);
        
        // Preview Grid
        this.previewGrid = modal.createDiv({ cls: 'preview-grid' });
        
        // Footer
        const footer = modal.createDiv({ cls: 'modal-footer' });
        this.compressButton = footer.createEl('button', { 
            cls: 'compress-button',
            text: I18n.t('compressButtonText', String(this.selectedImages.size)) 
        });
        this.compressButton.onclick = () => this.compressImages();
        
        this.renderInitialState();
    }
    
    createFilterControls(container: HTMLElement) {
        // 添加Filter标题
        const filtersSection = container.createDiv({ cls: 'filters-section' });
        filtersSection.createEl('h4', { text: I18n.t('filterSettings'), cls: "settings-header" });
        
        const filtersGrid = filtersSection.createDiv({ cls: 'preview-panel-filters' });
        
        // Create filter inputs with better descriptions
        this.createFilterInput(
            filtersGrid, 
            I18n.t('minWidth'), 
            'px', 
            'minWidth',
            I18n.t('minWidthDesc')
        );
        this.createFilterInput(
            filtersGrid, 
            I18n.t('minHeight'), 
            'px', 
            'minHeight',
            I18n.t('minHeightDesc')
        );
        this.createFilterInput(
            filtersGrid, 
            I18n.t('minFileSize'), 
            'MB', 
            'minFileSize',
            I18n.t('minFileSizeDesc')
        );
        
        // Compression target section
        const targetSection = container.createDiv({ cls: 'compression-target-section' });
        targetSection.createEl('h4', { text: I18n.t('compressionSettings'), cls: "settings-header" });
        
        // 先添加分辨率缩放控件
        const resolutionControls = targetSection.createDiv({ cls: 'resolution-controls' });
        resolutionControls.createEl('label', { text: I18n.t('resolutionScale') });
        
        const resolutionInput = resolutionControls.createEl('input', { type: 'number' });
        resolutionInput.min = '10';
        resolutionInput.max = '100';
        resolutionInput.step = '5';
        resolutionInput.value = String(this.tempSettings.resolutionScale);
        resolutionInput.placeholder = 'e.g., 80';
        resolutionInput.title = I18n.t('resolutionScaleDesc');
        
        resolutionInput.oninput = () => {
            // During typing, just update the model without clamping
            this.tempSettings.resolutionScale = Number(resolutionInput.value);
        };

        resolutionInput.onblur = () => {
            // After typing (on blur), clamp the value and update the view
            const clampedValue = Math.max(10, Math.min(100, this.tempSettings.resolutionScale || 100));
            this.tempSettings.resolutionScale = clampedValue;
            resolutionInput.value = String(clampedValue);
        };

        // 然后添加目标质量控件
        const targetControls = targetSection.createDiv({ cls: 'compression-controls' });

        const limitCheckbox = targetControls.createEl('input', { type: 'checkbox' });
        limitCheckbox.checked = this.tempSettings.enableTargetLimit;
        limitCheckbox.title = '启用或禁用压缩目标设置';
        
        const targetSelect = targetControls.createEl('select');
        targetSelect.createEl('option', { value: 'quality', text: I18n.t('targetQualityOption') });
        targetSelect.createEl('option', { value: 'size', text: I18n.t('targetFileSizeOption') });
        targetSelect.value = this.tempSettings.targetType;

        const targetInput = targetControls.createEl('input', { type: 'number' });
        targetInput.value = this.tempSettings.targetType === 'quality' 
            ? String(this.tempSettings.targetQuality)
            : String(this.tempSettings.targetFileSize);

        const updateDisabledState = () => {
            const isEnabled = limitCheckbox.checked;
            targetSelect.disabled = !isEnabled;
            targetInput.disabled = !isEnabled;

            const opacity = isEnabled ? '1' : '0.5';
            targetSelect.style.opacity = opacity;
            targetInput.style.opacity = opacity;
        };

        limitCheckbox.onchange = () => {
            this.tempSettings.enableTargetLimit = limitCheckbox.checked;
            updateDisabledState();
        };

        targetSelect.onchange = () => {
            this.tempSettings.targetType = targetSelect.value as 'quality' | 'size';
            this.updateTargetInput(targetInput);
        };

        targetInput.oninput = () => {
            if (this.tempSettings.targetType === 'quality') {
                this.tempSettings.targetQuality = Number(targetInput.value) || 70;
            } else {
                this.tempSettings.targetFileSize = Number(targetInput.value) || 0.5;
            }
        };

        this.updateTargetInput(targetInput);
        updateDisabledState();
    }
    
    createFilterInput(
        container: HTMLElement, 
        label: string, 
        placeholder: string, 
        key: 'minWidth' | 'minHeight' | 'minFileSize',
        tooltip: string
    ) {
        const group = container.createDiv({ cls: 'filter-input-group' });
        
        const labelEl = group.createEl('label', { text: label });
        const input = group.createEl('input', { type: 'number' });
        
        input.placeholder = placeholder;
        input.title = tooltip;
        input.value = String(this.tempSettings[key] || '');
        
        input.oninput = () => {
            this.tempSettings[key] = Number(input.value) || 0;
            this.filterAndRender();
        };
    }
    
    updateTargetInput(input: HTMLInputElement) {
        if (this.tempSettings.targetType === 'quality') {
            input.placeholder = 'e.g., 70';
            input.title = I18n.t('targetQualityDesc');
            input.value = String(this.tempSettings.targetQuality);
            input.min = '0';
            input.max = '100'; // Increased max for percentage
        } else {
            input.placeholder = 'e.g., 0.5';
            input.title = I18n.t('targetFileSizeDesc');
            input.value = String(this.tempSettings.targetFileSize);
            input.min = '0.01';
            input.max = '';
        }
    }
    
    createToolbar(container: HTMLElement) {
        const left = container.createDiv({ cls: 'preview-toolbar-left' });
        this.statusText = left.createEl('span', { text: I18n.t('noFilesSelected') });
        
        const right = container.createDiv({ cls: 'preview-toolbar-right' });
        
        // Toggle preview button (text only)
        const toggleBtn = right.createEl('button', { 
            cls: 'toolbar-button',
            text: this.showPreviews ? I18n.t('hidePreviews') : I18n.t('showPreviews')
        });
        toggleBtn.onclick = () => {
            this.showPreviews = !this.showPreviews;
            toggleBtn.textContent = this.showPreviews ? I18n.t('hidePreviews') : I18n.t('showPreviews');
            this.renderPreview();
        };
        
        // Select all/none checkbox
        const selectContainer = right.createDiv({ cls: 'select-checkbox-container' });
        const selectAllCheckbox = selectContainer.createEl('input', { 
            type: 'checkbox',
            cls: 'select-all-checkbox'
        });
        const selectAllLabel = selectContainer.createEl('label', { 
            text: I18n.t('selectAll'),
            cls: 'select-all-label'
        });
        
        selectAllCheckbox.onclick = () => {
            if (selectAllCheckbox.checked) {
                this.filteredImages.forEach(img => this.selectedImages.add(img.file));
            } else {
                this.selectedImages.clear();
            }
            this.renderPreview();
            this.updateCompressButton();
        };
        
        // Update checkbox state when selection changes
        this.updateSelectAllCheckbox = () => {
            const hasSelection = this.selectedImages.size > 0;
            const hasAllSelected = this.selectedImages.size === this.filteredImages.length;
            selectAllCheckbox.checked = hasAllSelected;
            selectAllCheckbox.indeterminate = hasSelection && !hasAllSelected;
        };
    }
    
    renderInitialState() {
        this.previewGrid.empty();
        const emptyState = this.previewGrid.createDiv({ cls: 'preview-empty-state' });
        emptyState.createEl('p', { text: I18n.t('selectFilesOrFoldersToScanForImages') });
    }

    renderNoImagesState() {
        this.previewGrid.empty();
        const emptyState = this.previewGrid.createDiv({ cls: 'preview-empty-state' });
        emptyState.createEl('p', { text: I18n.t('noImagesFoundMatchingTheCurrentFilters') });
    }
    
    async updateSelection(selectedFiles: TAbstractFile[]) {
        if (selectedFiles.length === 0) {
            this.allScannedImages = [];
            this.statusText.textContent = I18n.t('noFilesSelected');
        } else {
            this.statusText.textContent = I18n.t('scanning');
            const scanner = new ImageScanner(this.app);
            this.allScannedImages = await scanner.scanFiles(selectedFiles);
            this.statusText.textContent = I18n.t('foundImages', String(this.allScannedImages.length));
        }
        this.filterAndRender();
    }
    
    filterAndRender() {
        this.filteredImages = this.allScannedImages.filter(image => {
            const { minWidth, minHeight, minFileSize } = this.tempSettings;
            if (minWidth > 0 && image.width < minWidth) return false;
            if (minHeight > 0 && image.height < minHeight) return false;
            if (minFileSize > 0 && image.size < minFileSize) return false;
            return true;
        });
        
        // Update selected images set
        this.selectedImages.clear();
        this.filteredImages.forEach(img => this.selectedImages.add(img.file));
        
        this.renderPreview();
        this.updateCompressButton();
        this.updateStatus();
    }
    
    updateStatus() {
        if (this.allScannedImages.length === 0) {
            this.statusText.textContent = I18n.t('noFilesSelected');
        } else if (this.filteredImages.length === 0) {
            this.statusText.textContent = I18n.t('foundImages', String(this.allScannedImages.length)) + ', ' + I18n.t('noImagesFound');
        } else {
            this.statusText.textContent = I18n.t('imagesMatchFilters', String(this.filteredImages.length), String(this.allScannedImages.length));
        }
    }
    
    renderPreview() {
        this.previewGrid.empty();
        
        if (this.filteredImages.length === 0) {
            // 当没有找到图片时显示提示信息
            const emptyMessage = this.previewGrid.createDiv({ cls: 'preview-empty-message' });
            emptyMessage.textContent = I18n.t('noImagesFound');
            return;
        }
        
        this.filteredImages.forEach(image => {
            const card = this.previewGrid.createDiv({ cls: 'image-card' });
            
            const header = card.createDiv({ cls: 'image-card-header' });
            const checkbox = header.createEl('input', { type: 'checkbox' });
            checkbox.checked = this.selectedImages.has(image.file);
            checkbox.onchange = () => {
                if (checkbox.checked) {
                    this.selectedImages.add(image.file);
                } else {
                    this.selectedImages.delete(image.file);
                }
                this.updateCompressButton();
            };
            
            header.createEl('span', { text: image.file.name, cls: 'image-card-filename' });
            
            if (this.showPreviews) {
                const preview = card.createEl('img', { cls: 'image-card-preview' });
                preview.src = this.app.vault.getResourcePath(image.file);
                preview.onerror = () => {
                    preview.style.display = 'none';
                };
            }
            
            const info = card.createDiv({ cls: 'image-card-info' });
            info.createDiv({ text: `${image.size.toFixed(2)} MB`, cls: 'image-card-info-item' });
            info.createDiv({ text: `${image.width}×${image.height}`, cls: 'image-card-info-item' });
        });
        
        // Update select all checkbox state
        if (this.updateSelectAllCheckbox) {
            this.updateSelectAllCheckbox();
        }
    }
    
    updateCompressButton() {
        const count = this.selectedImages.size;
        // 清空按钮内容并重新创建
        this.compressButton.empty();
        this.compressButton.createSpan({ cls: 'icon-compress' });
        this.compressButton.createSpan({ text: I18n.t('compressButtonText', String(count)) });
        (this.compressButton as HTMLButtonElement).disabled = count === 0;
        
        // Update select all checkbox state
        if (this.updateSelectAllCheckbox) {
            this.updateSelectAllCheckbox();
        }
    }
    
    async compressImages() {
        if (this.selectedImages.size === 0) return;
        
        const totalImages = this.selectedImages.size;
        const results: CompressionResult[] = [];
        
        // 创建进度模态框
        const progressModal = new ProgressModal(this.app, totalImages);
        progressModal.open();
        
        let processedCount = 0;
        
        for (const file of this.selectedImages) {
            try {
                // 获取原始文件大小
                const originalSize = file.stat.size / (1024 * 1024); // Convert to MB
                
                progressModal.updateProgress(processedCount, I18n.t('compressing', file.name));
                
                // 跳过 GIF 文件，因为压缩会破坏动画
                if (file.extension.toLowerCase() === 'gif') {
                    results.push({
                        file,
                        originalSize,
                        compressedSize: originalSize,
                        savedSize: 0,
                        compressionRatio: 1,
                        success: true // 标记为成功但未压缩
                    });
                    processedCount++;
                    progressModal.updateProgress(processedCount, I18n.t('skippedGif', file.name));
                    continue;
                }
                
                const data = await this.app.vault.readBinary(file);
                const blob = new Blob([data], { type: `image/${file.extension}` });
                const imageFile = new File([blob], file.name, { type: blob.type });

                // 获取图片实际尺寸用于分辨率缩放
                let maxWidthOrHeight: number | undefined = undefined;
                if (this.tempSettings.resolutionScale < 100) {
                    const url = this.app.vault.getResourcePath(file);
                    const img = new Image();
                    img.src = url;
                    await new Promise((resolve) => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    });
                    if (img.width > 0 && img.height > 0) {
                        const maxDimension = Math.max(img.width, img.height);
                        maxWidthOrHeight = Math.round(maxDimension * this.tempSettings.resolutionScale / 100);
                    }
                }

                const options = {
                    maxSizeMB: this.tempSettings.enableTargetLimit && this.tempSettings.targetType === 'size' ? this.tempSettings.targetFileSize : undefined,
                    quality: this.tempSettings.enableTargetLimit && this.tempSettings.targetType === 'quality' ? 
                        Number(this.tempSettings.targetQuality) / 100 : undefined,
                    useWebWorker: true,
                    maxWidthOrHeight: maxWidthOrHeight,
                    initialQuality: this.tempSettings.enableTargetLimit && this.tempSettings.targetType === 'quality' ? 
                        Number(this.tempSettings.targetQuality) / 100 : 0.8,
                };

                const compressedFile = await imageCompression(imageFile, options);
                
                // 检查压缩后是否变大，如果变大则跳过
                const compressedSize = compressedFile.size / (1024 * 1024);
                if (compressedSize >= originalSize) {
                    results.push({
                        file,
                        originalSize,
                        compressedSize: originalSize,
                        savedSize: 0,
                        compressionRatio: 1,
                        success: true // 标记为成功但未压缩
                    });
                    processedCount++;
                    progressModal.updateProgress(processedCount, I18n.t('skipped', file.name));
                    continue;
                }
                
                const compressedData = await compressedFile.arrayBuffer();
                await this.app.vault.modifyBinary(file, compressedData);
                
                // 计算压缩结果
                const savedSize = originalSize - compressedSize;
                const compressionRatio = compressedSize / originalSize;
                
                results.push({
                    file,
                    originalSize,
                    compressedSize,
                    savedSize,
                    compressionRatio,
                    success: true
                });
                
            } catch (error) {
                console.error(`Failed to compress ${file.name}:`, error);
                results.push({
                    file,
                    originalSize: file.stat.size / (1024 * 1024),
                    compressedSize: file.stat.size / (1024 * 1024),
                    savedSize: 0,
                    compressionRatio: 1,
                    success: false,
                    error: error.message
                });
            }
            
            processedCount++;
            progressModal.updateProgress(processedCount, I18n.t('completed', file.name));
        }
        
        progressModal.close();
        
        // 显示结果
        const successCount = results.filter(r => r.success).length;
        const actuallyCompressed = results.filter(r => r.success && r.savedSize > 0).length;
        const skippedCount = results.filter(r => r.success && r.savedSize === 0).length;
        const totalSaved = results.reduce((sum, r) => sum + r.savedSize, 0);
        
        if (this.plugin.settings.showCompressionResults) {
            const resultModal = new CompressionResultModal(this.app, results);
            resultModal.open();
        } else {
            new Notice(I18n.t('successNotification', successCount, totalImages, actuallyCompressed, skippedCount, totalSaved.toFixed(2)));
        }
        
        this.onClose();
    }
}

class FileTree {
    app: App;
    root: TFolder;
    selection: Set<TAbstractFile>;
    onChange: () => void;
    
    // A map to quickly access checkbox elements for state updates
    checkboxes: Map<string, HTMLInputElement> = new Map();
    // Track which folders are expanded
    expanded: Set<string> = new Set();

    constructor(app: App, root: TFolder, initialSelection: TFolder | null) {
        this.app = app;
        this.root = root;
        this.onChange = () => {};
        this.selection = new Set();
        
        // Root is always expanded
        this.expanded.add(this.root.path);
        
        if (initialSelection) {
            this.toggleNodeSelection(initialSelection, true, false);
        }
    }

    getSelection(): TAbstractFile[] {
        return Array.from(this.selection);
    }

    render(container: HTMLElement, onChange: () => void) {
        this.onChange = onChange;
        this.checkboxes.clear();
        container.empty();
        const treeRoot = container.createEl('ul', { cls: 'file-tree' });
        this.renderNode(this.root, treeRoot);
        this.updateAllCheckboxStates();
    }

    renderNode(node: TFolder, container: HTMLElement): HTMLLIElement | null {
        const hasMdChildren = node.children.some(c => c instanceof TFile && c.extension === 'md');
        const hasSubfolders = node.children.some(c => c instanceof TFolder);

        if (!hasMdChildren && !hasSubfolders && node !== this.root) return null;

        const li = container.createEl('li', { cls: 'file-tree-item' });
        const selfDiv = li.createEl('div', { cls: 'file-tree-item-self' });

        // Add expand/collapse icon for folders with children
        const hasChildren = hasSubfolders || hasMdChildren;
        if (hasChildren) {
            const expandIcon = selfDiv.createEl('span', { 
                cls: 'file-tree-expand-icon',
                text: this.expanded.has(node.path) ? '▼' : '▶'
            });
            expandIcon.onclick = (e) => {
                e.stopPropagation();
                this.toggleExpanded(node.path);
                // Re-render just this node's children
                const childrenUl = li.querySelector('.file-tree-children') as HTMLElement;
                if (childrenUl) {
                    childrenUl.style.display = this.expanded.has(node.path) ? 'block' : 'none';
                    expandIcon.textContent = this.expanded.has(node.path) ? '▼' : '▶';
                }
            };
        } else {
            selfDiv.createEl('span', { cls: 'file-tree-expand-spacer' });
        }

        const checkbox = selfDiv.createEl('input', { type: 'checkbox' });
        this.checkboxes.set(node.path, checkbox);
        
        checkbox.onchange = () => {
            this.toggleNodeSelection(node, checkbox.checked, true);
        };

        selfDiv.createEl('span', { text: node.name || 'Vault Root' });

        // Render children
        const childrenUl = li.createEl('ul', { cls: 'file-tree-children' });
        childrenUl.style.display = this.expanded.has(node.path) ? 'block' : 'none';
        
        node.children.forEach(child => {
            if (child instanceof TFolder) {
                this.renderNode(child, childrenUl);
            } else if (child instanceof TFile && child.extension === 'md') {
                this.renderLeaf(child, childrenUl);
            }
        });

        return li;
    }

    renderLeaf(leaf: TFile, container: HTMLElement) {
        const li = container.createEl('li', { cls: 'file-tree-item' });
        const selfDiv = li.createEl('div', { cls: 'file-tree-item-self' });
        
        // Add spacer for alignment
        selfDiv.createEl('span', { cls: 'file-tree-expand-spacer' });
        
        const checkbox = selfDiv.createEl('input', { type: 'checkbox' });
        this.checkboxes.set(leaf.path, checkbox);
        
        checkbox.onchange = () => {
            this.toggleNodeSelection(leaf, checkbox.checked, true);
        };
        
        selfDiv.createEl('span', { text: leaf.name });
    }

    toggleExpanded(path: string) {
        if (this.expanded.has(path)) {
            this.expanded.delete(path);
        } else {
            this.expanded.add(path);
        }
    }

    toggleNodeSelection(node: TAbstractFile, selected: boolean, triggerChange = true) {
        if (selected) {
            this.selection.add(node);
        } else {
            this.selection.delete(node);
        }

        // Propagate selection down to all descendants
        if (node instanceof TFolder) {
            this.propagateSelectionDown(node, selected);
        }
        
        // Update parent states up the tree - but avoid infinite loops
        // Skip parent update for root node to prevent issues
        if (node.parent && triggerChange && node !== this.root) {
            this.updateParentStatesUp(node.parent);
        }

        if (triggerChange) {
            this.updateAllCheckboxStates();
            this.onChange();
        }
    }

    propagateSelectionDown(folder: TFolder, selected: boolean) {
        
        folder.children.forEach(child => {
            if (selected) {
                this.selection.add(child);
            } else {
                this.selection.delete(child);
            }
            
            if (child instanceof TFolder) {
                this.propagateSelectionDown(child, selected);
            }
        });
    }

    updateParentStatesUp(folder: TFolder) {
        // Check the selection state of this folder's children
        const children = folder.children;
        const selectedChildren = children.filter(child => this.selection.has(child));
        
        
        if (selectedChildren.length === 0) {
            // No children selected - deselect parent
            this.selection.delete(folder);
        } else if (selectedChildren.length === children.length) {
            // All children selected - select parent
            this.selection.add(folder);
        } else {
            // Some children selected - deselect parent but keep indeterminate state
            this.selection.delete(folder);
        }

        // Continue up the tree - but avoid infinite loops
        if (folder.parent && folder.parent !== this.root) {
            this.updateParentStatesUp(folder.parent);
        }
    }

    updateAllCheckboxStates() {
        
        this.checkboxes.forEach((checkbox, path) => {
            const file = this.app.vault.getAbstractFileByPath(path);
            if (!file) return;

            const isSelected = this.selection.has(file);
            checkbox.checked = isSelected;

            // Set indeterminate state for folders
            if (file instanceof TFolder) {
                const children = file.children;
                const selectedChildren = children.filter(child => this.selection.has(child));
                const hasSelectedChildren = selectedChildren.length > 0;
                const allChildrenSelected = selectedChildren.length === children.length;
                
                checkbox.indeterminate = hasSelectedChildren && !allChildrenSelected;
            } else {
                checkbox.indeterminate = false;
            }
        });
    }
}

class ImageCompressorSettingTab extends PluginSettingTab {
	plugin: ImageCompressorPlugin;

	constructor(app: App, plugin: ImageCompressorPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: I18n.t('settingsImageFiltering')});

		new Setting(containerEl)
			.setName(I18n.t('settingsMinWidthName'))
			.setDesc(I18n.t('settingsMinWidthDesc'))
			.addText(text => text
				.setPlaceholder('e.g., 1920')
				.setValue(String(this.plugin.settings.minWidth))
				.onChange(async (value) => {
					this.plugin.settings.minWidth = Number(value);
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(I18n.t('settingsMinHeightName'))
			.setDesc(I18n.t('settingsMinHeightDesc'))
			.addText(text => text
				.setPlaceholder('e.g., 1080')
				.setValue(String(this.plugin.settings.minHeight))
				.onChange(async (value) => {
					this.plugin.settings.minHeight = Number(value);
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(I18n.t('settingsMinFileSizeName'))
			.setDesc(I18n.t('settingsMinFileSizeDesc'))
			.addText(text => text
				.setPlaceholder('e.g., 0.5')
				.setValue(String(this.plugin.settings.minFileSize))
				.onChange(async (value) => {
					this.plugin.settings.minFileSize = Number(value);
					await this.plugin.saveSettings();
				}));
		
		containerEl.createEl('h2', {text: I18n.t('settingsCompressionSettings')});

		new Setting(containerEl)
			.setName(I18n.t('settingsTargetType'))
			.setDesc(I18n.t('settingsTargetTypeDesc'))
			.addDropdown(dropdown => dropdown
				.addOption(I18n.t('targetQualityOption'), I18n.t('targetQualityOption'))
				.addOption(I18n.t('targetFileSizeOption'), I18n.t('targetFileSizeOption'))
				.setValue(this.plugin.settings.targetType)
				.onChange(async (value: 'quality' | 'size') => {
					this.plugin.settings.targetType = value;
					await this.plugin.saveSettings();
					this.display(); // Re-render the settings tab
				}));
		
		if (this.plugin.settings.targetType === 'quality') {
			new Setting(containerEl)
				.setName(I18n.t('settingsTargetQualityName'))
				.setDesc(I18n.t('settingsTargetQualityDesc'))
				.addText(text => text
					.setPlaceholder('e.g., 70')
					.setValue(String(this.plugin.settings.targetQuality))
					.onChange(async (value) => {
						this.plugin.settings.targetQuality = Number(value);
						await this.plugin.saveSettings();
					}));
		} else {
			new Setting(containerEl)
				.setName(I18n.t('settingsTargetFileSizeName'))
				.setDesc(I18n.t('settingsTargetFileSizeDesc'))
				.addText(text => text
					.setPlaceholder('e.g., 0.5')
					.setValue(String(this.plugin.settings.targetFileSize))
					.onChange(async (value) => {
						this.plugin.settings.targetFileSize = Number(value);
						await this.plugin.saveSettings();
					}));
		}
		
		new Setting(containerEl)
			.setName(I18n.t('settingsResolutionScaleName'))
			.setDesc(I18n.t('settingsResolutionScaleDesc'))
			.addText(text => {
				text.inputEl.type = 'number';
				text.inputEl.min = '10';
				text.inputEl.max = '100';
				text.setPlaceholder('e.g., 80')
					.setValue(String(this.plugin.settings.resolutionScale))
					.onChange(async (value) => {
						// During typing, just save the raw value.
						// Clamping is handled by the 'blur' event.
						this.plugin.settings.resolutionScale = Number(value);
						await this.plugin.saveSettings();
					});
				
				text.inputEl.addEventListener('blur', () => {
					// After typing (on blur), clamp the value.
					// This will re-trigger onChange to save the clamped value.
					const numValue = Math.max(10, Math.min(100, Number(text.inputEl.value) || 100));
					if (String(numValue) !== text.inputEl.value) {
						text.setValue(String(numValue));
					}
				});
			});

		new Setting(containerEl)
			.setName(I18n.t('settingsEnableTargetLimitName'))
			.setDesc(I18n.t('settingsEnableTargetLimitDesc'))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableTargetLimit)
				.onChange(async (value) => {
					this.plugin.settings.enableTargetLimit = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(I18n.t('settingsShowResultsName'))
			.setDesc(I18n.t('settingsShowResultsDesc'))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showCompressionResults)
				.onChange(async (value) => {
					this.plugin.settings.showCompressionResults = value;
					await this.plugin.saveSettings();
				}));
	}
} 

// 进度模态框类
class ProgressModal extends Modal {
    private totalItems: number;
    private progressBar: HTMLElement;
    private progressText: HTMLElement;
    private statusText: HTMLElement;

    constructor(app: App, totalItems: number) {
        super(app);
        this.totalItems = totalItems;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        
        // 确保模态框在最前面
        this.modalEl.style.zIndex = '999999';
        
        contentEl.createEl('h2', { text: I18n.t('compressionProgress') });
        
        // Progress container
        const progressContainer = contentEl.createDiv({ cls: 'progress-container' });
        
        // Progress bar
        const progressBarContainer = progressContainer.createDiv({ cls: 'progress-bar-container' });
        this.progressBar = progressBarContainer.createDiv({ cls: 'progress-bar' });
        
        // Progress text
        this.progressText = progressContainer.createEl('p', { 
            cls: 'progress-text', 
            text: '0 / ' + this.totalItems 
        });
        
        // Status text
        this.statusText = progressContainer.createEl('p', { 
            cls: 'status-text', 
            text: I18n.t('preparing') 
        });
    }

    updateProgress(completed: number, status: string) {
        const percentage = (completed / this.totalItems) * 100;
        this.progressBar.style.width = `${percentage}%`;
        this.progressText.textContent = `${completed} / ${this.totalItems}`;
        this.statusText.textContent = status;
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

// 压缩结果模态框类
class CompressionResultModal extends Modal {
    private results: CompressionResult[];

    constructor(app: App, results: CompressionResult[]) {
        super(app);
        this.results = results;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        
        contentEl.createEl('h2', { text: I18n.t('compressionResults') });
        
        // 总体统计
        const totalOriginal = this.results.reduce((sum, r) => sum + r.originalSize, 0);
        const totalCompressed = this.results.reduce((sum, r) => sum + r.compressedSize, 0);
        const totalSaved = this.results.reduce((sum, r) => sum + r.savedSize, 0);
        const successCount = this.results.filter(r => r.success).length;
        const actuallyCompressed = this.results.filter(r => r.success && r.savedSize > 0).length;
        const skippedCount = this.results.filter(r => r.success && r.savedSize === 0).length;
        const failedCount = this.results.filter(r => !r.success).length;
        
        const summaryContainer = contentEl.createDiv({ cls: 'compression-summary' });
        summaryContainer.createEl('h3', { text: I18n.t('overallStatistics') });
        
        const summaryGrid = summaryContainer.createDiv({ cls: 'summary-grid' });
        summaryGrid.createDiv({ text: I18n.t('totalFiles', this.results.length) });
        summaryGrid.createDiv({ text: I18n.t('compressed', actuallyCompressed) });
        summaryGrid.createDiv({ text: I18n.t('skipped', skippedCount) });
        summaryGrid.createDiv({ text: I18n.t('failed', failedCount) });
        summaryGrid.createDiv({ text: I18n.t('originalSize', totalOriginal.toFixed(2)) });
        summaryGrid.createDiv({ text: I18n.t('finalSize', totalCompressed.toFixed(2)) });
        summaryGrid.createDiv({ text: I18n.t('spaceSaved', totalSaved.toFixed(2)) });
        summaryGrid.createDiv({ text: I18n.t('spaceSaved', totalOriginal > 0 ? ((totalSaved / totalOriginal) * 100).toFixed(1) : 0) + '%' });
        
        // 详细结果列表
        const detailsContainer = contentEl.createDiv({ cls: 'compression-details' });
        detailsContainer.createEl('h3', { text: I18n.t('detailedResults') });
        
        const resultsList = detailsContainer.createDiv({ cls: 'results-list' });
        
        this.results.forEach(result => {
            const resultItem = resultsList.createDiv({ cls: 'result-item' });
            
            const fileName = resultItem.createDiv({ cls: 'result-filename' });
            fileName.textContent = result.file.name;
            
            const resultStats = resultItem.createDiv({ cls: 'result-stats' });
            
            if (result.success) {
                if (result.savedSize > 0) {
                    // 实际压缩的文件
                    resultStats.createSpan({ text: I18n.t('originalSize', result.originalSize.toFixed(2)) + ' → ' + I18n.t('finalSize', result.compressedSize.toFixed(2)) });
                    resultStats.createSpan({ 
                        text: I18n.t('resultSavings', result.savedSize.toFixed(2)) + ' (' + ((1 - result.compressionRatio) * 100).toFixed(1) + '%)',
                        cls: 'result-savings' 
                    });
                } else {
                    // 跳过的文件（压缩后会变大）
                    resultStats.createSpan({ text: I18n.t('originalSize', result.originalSize.toFixed(2)) + ' (' + I18n.t('skippedReason') + ')' });
                    resultStats.createSpan({ 
                        text: I18n.t('skippedReason'),
                        cls: 'result-skipped' 
                    });
                }
            } else {
                resultStats.createSpan({ text: I18n.t('compressionFailed'), cls: 'result-error' });
                if (result.error) {
                    resultStats.createSpan({ text: result.error, cls: 'result-error-details' });
                }
            }
        });
        
        // 关闭按钮
        const buttonContainer = contentEl.createDiv({ cls: 'result-buttons' });
        const closeButton = buttonContainer.createEl('button', { text: I18n.t('close') });
        closeButton.onclick = () => this.close();
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
} 