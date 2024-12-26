// SVG 转换和下载功能
class SVGConverter {
    constructor() {
        this.svgInput = document.getElementById('svgInput');
        this.preview = document.getElementById('preview');
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.addExampleButton();
    }

    setupEventListeners() {
        this.svgInput.addEventListener('input', () => this.updatePreview());
        // 添加粘贴事件监听
        this.svgInput.addEventListener('paste', (e) => {
            setTimeout(() => this.updatePreview(), 0);
        });
    }

    updatePreview() {
        const svgCode = this.svgInput.value;
        if (svgCode.trim()) {
            try {
                // 检查是否是有效的 SVG 代码
                if (svgCode.includes('<svg') && svgCode.includes('</svg>')) {
                    this.preview.innerHTML = svgCode;
                    this.showError('');
                } else {
                    this.showError('无效的 SVG 代码');
                }
            } catch (error) {
                this.showError('SVG 代码格式错误');
            }
        } else {
            this.preview.innerHTML = '<p>预览区域</p>';
        }
    }

    async svgToImage(svgElement, width, height, format = 'png') {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            // 将 SVG 转换为 base64
            const svgBlob = new Blob([svgElement.outerHTML], {type: 'image/svg+xml'});
            const url = URL.createObjectURL(svgBlob);
            
            img.onload = () => {
                canvas.width = width;
                canvas.height = height;
                
                // 绘制白色背景（针对 JPG）
                if (format === 'jpg') {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, width, height);
                }
                
                ctx.drawImage(img, 0, 0, width, height);
                URL.revokeObjectURL(url);
                
                resolve(canvas.toDataURL(`image/${format}`));
            };
            
            img.onerror = reject;
            img.src = url;
        });
    }

    async exportImage(width, height, format) {
        const svgElement = this.preview.querySelector('svg');
        if (!svgElement) {
            alert('请先输入有效的 SVG 代码！');
            return;
        }

        try {
            const dataUrl = await this.svgToImage(svgElement, width, height, format);
            const link = document.createElement('a');
            link.download = `${width}x${height}.${format}`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('导出失败:', error);
            alert('导出失败，请检查 SVG 代码是否正确。');
        }
    }

    async downloadIconSet() {
        const sizes = [16, 48, 128];
        const svgElement = this.preview.querySelector('svg');
        
        if (!svgElement) {
            alert('请先输入有效的 SVG 代码！');
            return;
        }

        try {
            for (const size of sizes) {
                const dataUrl = await this.svgToImage(svgElement, size, size, 'png');
                const link = document.createElement('a');
                link.download = `${size}x${size}.png`;
                link.href = dataUrl;
                link.click();
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } catch (error) {
            console.error('导出图标失败:', error);
            alert('导出失败，请检查 SVG 代码是否正确。');
        }
    }

    setupDragAndDrop() {
        const dropZone = this.svgInput;
        const preview = this.preview;
        
        // 防止浏览器默认行为
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        // 拖拽效果
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.style.borderColor = '#4CAF50';
                dropZone.style.backgroundColor = '#f0fff0';
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.style.borderColor = '#ddd';
                dropZone.style.backgroundColor = '#fff';
            });
        });

        // 处理文件拖放
        dropZone.addEventListener('drop', (e) => {
            const file = e.dataTransfer.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const content = event.target.result;
                    if (content.includes('<svg')) {
                        this.svgInput.value = content;
                        this.updatePreview();
                    } else {
                        this.showError('请拖放有效的 SVG 文件');
                    }
                };
                reader.readAsText(file);
            }
        });

        function preventDefaults (e) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    async optimizeSVG(svgCode) {
        // 基础优化
        return svgCode
            .replace(/>\s+</g, '><') // 移除标签间的空白
            .replace(/\s+/g, ' ') // 合并空白
            .replace(/\s*([{:};\(\)])\s*/g, '$1') // 移除特定字符周围的空白
            .replace(/([\d\.]+)px/g, '$1'); // 移除 px 单位
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        if (message) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        } else {
            errorDiv.style.display = 'none';
        }
    }

    addExampleButton() {
        const exampleButton = document.createElement('button');
        exampleButton.textContent = '插入示例SVG';
        exampleButton.onclick = () => this.insertExample();
        document.querySelector('.control-group').appendChild(exampleButton);
    }

    insertExample() {
        const exampleSVG = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" stroke="#4CAF50" stroke-width="3" fill="#fff"/>
            <path d="M30 50l15 15l25-25" stroke="#4CAF50" stroke-width="3" fill="none"/>
        </svg>`;
        this.svgInput.value = exampleSVG;
        this.updatePreview();
    }

    async downloadAllFormats() {
        const svgElement = this.preview.querySelector('svg');
        if (!svgElement) {
            alert('请先输入有效的 SVG 代码！');
            return;
        }

        const formats = [
            { width: 200, height: 200, type: 'png' },
            { width: 200, height: 200, type: 'jpg' },
            ...this.getIconSizes().map(size => ({ width: size, height: size, type: 'png' }))
        ];

        try {
            for (const format of formats) {
                const dataUrl = await this.svgToImage(svgElement, format.width, format.height, format.type);
                const link = document.createElement('a');
                link.download = `${format.width}x${format.height}.${format.type}`;
                link.href = dataUrl;
                link.click();
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } catch (error) {
            console.error('批量导出失败:', error);
            alert('批量导出失败，请检查 SVG 代码是否正确。');
        }
    }

    getIconSizes() {
        return [16, 48, 128];
    }
}

// 初始化转换器
const converter = new SVGConverter();

// 导出自定义尺寸图片
function exportCustomSize(format) {
    const width = parseInt(document.getElementById('width').value) || 200;
    const height = parseInt(document.getElementById('height').value) || 200;
    converter.exportImage(width, height, format);
}

// 下载图标套装
function downloadIconSet() {
    converter.downloadIconSet();
} 