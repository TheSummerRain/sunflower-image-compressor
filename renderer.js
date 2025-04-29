const { ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');
const tinify = require('tinify');
const configManager = require('./config-manager');

// 图片压缩相关变量
let selectedFiles = [];
let outputDirectory = configManager.getOutputDirectory();
let inputDirectory = configManager.getInputDirectory();
let lastOpenedDirectory = configManager.getLastOpenedDirectory();

// DOM元素
const dropArea = document.getElementById('dropArea');
const browseBtn = document.getElementById('browseBtn');
const fileInput = document.getElementById('fileInput');

const formatSelect = document.getElementById('format');
const outputDirBtn = document.getElementById('outputDirBtn');
const compressBtn = document.getElementById('compressBtn');
const openOutputDirBtn = document.getElementById('openOutputDirBtn');
const previewContainer = document.getElementById('previewContainer');
const apiKeyInput = document.getElementById('apiKey');
// 获取HTML中已定义的使用次数显示元素
const usageCountDisplay = document.getElementById('usageCountDisplay');




// 拖放区域事件
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
  dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight() {
  dropArea.classList.add('active');
}

function unhighlight() {
  dropArea.classList.remove('active');
}

// 处理文件拖放
dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles(files);
}

// 处理文件选择 - 简化逻辑，只使用一种方式打开文件选择对话框
browseBtn.addEventListener('click', async () => {
  try {
    // 使用保存的输入目录作为默认目录
    const options = {};
    if (inputDirectory) {
      options.defaultPath = inputDirectory;
    }
    
    // 直接调用系统文件选择对话框
    const filePaths = await ipcRenderer.invoke('select-files', options);
    
    if (filePaths && filePaths.length > 0) {
      // 保存选择的目录
      inputDirectory = path.dirname(filePaths[0]);
      configManager.setInputDirectory(inputDirectory);
      
      // 将文件路径转换为文件对象
      const files = filePaths.map(filePath => {
        const name = path.basename(filePath);
        const size = fs.statSync(filePath).size;
        return {
          path: filePath,
          name: name,
          size: size,
          type: 'image/' + path.extname(filePath).substring(1)
        };
      });
      selectedFiles = files;
      displayFilePreview(files);
    }
  } catch (error) {
    console.error('选择文件失败:', error);
  }
});

// 保留HTML文件输入框的变更事件，用于拖放文件到浏览器时使用
fileInput.addEventListener('change', () => {
  handleFiles(fileInput.files);
});

// 处理文件
function handleFiles(files) {
  if (files.length === 0) return;
  
  // 将FileList转换为数组并存储
  selectedFiles = Array.from(files);
  displayFilePreview(selectedFiles);
}

// 显示文件预览
function displayFilePreview(files) {
  // 清空预览区域
  previewContainer.innerHTML = '';
  
  // 更新状态栏
  updateStatus(`已选择 ${files.length} 个文件`, '准备压缩');
  
  // 为每个文件创建预览
  files.forEach(file => {
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';
    
    // 添加删除按钮
    const deleteBtn = document.createElement('div');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(previewItem.dataset.index);
      // 从数组中移除
      selectedFiles.splice(index, 1);
      // 重新显示预览
      displayFilePreview(selectedFiles);
    });
    
    const img = document.createElement('img');
    
    // 如果是文件对象，使用FileReader
    if (file instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      // 如果是自定义对象（从Electron获取的文件路径）
      img.src = `file://${file.path}`;
    }
    
    const info = document.createElement('div');
    info.className = 'preview-info';
    
    const name = document.createElement('p');
    name.textContent = file.name;
    
    const sizeInfo = document.createElement('div');
    sizeInfo.className = 'size-info';
    
    const originalSize = document.createElement('span');
    originalSize.className = 'original';
    originalSize.textContent = formatSize(file.size);
    
    const compressedSize = document.createElement('span');
    compressedSize.className = 'compressed';
    compressedSize.textContent = '待压缩';
    compressedSize.dataset.originalSize = file.size;
    
    sizeInfo.appendChild(originalSize);
    sizeInfo.appendChild(compressedSize);
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    
    const progress = document.createElement('div');
    progress.className = 'progress';
    progressBar.appendChild(progress);
    
    info.appendChild(name);
    info.appendChild(sizeInfo);
    info.appendChild(progressBar);
    
    previewItem.appendChild(deleteBtn);
    previewItem.appendChild(img);
    previewItem.appendChild(info);
    previewItem.dataset.index = files.indexOf(file);
    
    previewContainer.appendChild(previewItem);
  });
}

// 格式化文件大小
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 更新状态栏
function updateStatus(status, info) {
  const statusElement = document.querySelector('.status span');
  const infoElement = document.querySelector('.info');
  
  statusElement.textContent = status;
  infoElement.textContent = info;
}

// 选择输出目录
outputDirBtn.addEventListener('click', async () => {
  try {
    // 使用保存的输出目录作为默认目录
    const options = {};
    if (outputDirectory) {
      options.defaultPath = outputDirectory;
    }
    
    const dir = await ipcRenderer.invoke('select-output-directory', options);
    
    if (dir) {
      // 直接处理选择结果，不使用遮罩层
      outputDirectory = dir;
      configManager.setOutputDirectory(dir);
      updateStatus('已选择输出目录', dir);
      // 如果已经选择了输出目录，启用打开输出文件夹按钮
      openOutputDirBtn.disabled = false;
    }
  } catch (error) {
    console.error('选择输出目录失败:', error);
    alert('选择输出目录失败: ' + error.message);
  }
});

// 打开输出文件夹
openOutputDirBtn.addEventListener('click', async () => {
  if (outputDirectory) {
    // 保存最后打开的目录
    configManager.setLastOpenedDirectory(outputDirectory);
    // 使用IPC通信请求主进程打开文件夹
    await ipcRenderer.invoke('open-directory', outputDirectory);
  }
});

// 开始压缩
compressBtn.addEventListener('click', async () => {
  const previewItems = document.querySelectorAll('.preview-item');
  const apiKey = apiKeyInput.value.trim();
  
  if (selectedFiles.length === 0 || previewItems.length === 0) {
    alert('请先选择图片');
    return;
  }
  
  if (!outputDirectory) {
    alert('请先选择输出目录');
    // 自动触发输出目录选择
    outputDirBtn.click();
    return;
  }
  
  if (!apiKey) {
    alert('请输入TinyPNG API密钥');
    apiKeyInput.focus();
    return;
  }
  
  // 保存API密钥到配置文件
  configManager.setApiKey(apiKey);
  
  // 设置TinyPNG API密钥
  tinify.key = apiKey;
  
  updateStatus('压缩中', `正在处理 ${previewItems.length} 个文件,速度主要取决于API网络速度`);
  
  // 获取压缩设置
  const settings = {
    // TinyPNG API 不支持自定义压缩质量
    format: formatSelect.value
  };
  
  try {
    // 验证API密钥
    await tinify.validate();
    
    // 获取并显示本月已使用的压缩次数
    const compressionsThisMonth = tinify.compressionCount;
    
    // 更新配置文件中的使用次数
    configManager.setUsageCount(compressionsThisMonth);
    
    // 更新UI显示
    updateUsageCount(compressionsThisMonth);
    
    // 检查是否接近或超过限制
    checkUsageLimit(compressionsThisMonth);
    
    // 处理每个文件
    for (let i = 0; i < previewItems.length; i++) {
      const item = previewItems[i];
      const progress = item.querySelector('.progress');
      const compressedSize = item.querySelector('.compressed');
      const originalSize = parseInt(compressedSize.dataset.originalSize);
      const file = selectedFiles[i];
      
      // 更新进度
      updateItemProgress(progress, 10);
      
      try {
        // 获取文件路径或文件对象
        let source;
        let outputFilePath;
        let fileName;
        
        if (file instanceof File) {
          // 如果是File对象，需要先读取文件内容
          const buffer = await readFileAsBuffer(file);
          source = tinify.fromBuffer(buffer);
          fileName = file.name;
        } else {
          // 如果是自定义对象（从Electron获取的文件路径）
          source = tinify.fromFile(file.path);
          fileName = file.name;
        }
        
        // 更新进度
        updateItemProgress(progress, 30);
        
        // 根据设置处理格式转换
        if (settings.format !== 'original') {
          source = source.convert({ type: [`image/${settings.format}`] });
        }
        
        // 更新进度
        updateItemProgress(progress, 60);
        
        // 确定输出文件路径
        outputFilePath = path.join(outputDirectory, fileName);
        
        // 如果设置了特定格式且不是保持原格式，修改文件扩展名
        if (settings.format !== 'original') {
          const fileNameWithoutExt = path.parse(fileName).name;
          outputFilePath = path.join(outputDirectory, `${fileNameWithoutExt}.${settings.format}`);
        }
        
        // 保存压缩后的文件
        await source.toFile(outputFilePath);
        
        // 获取压缩后的文件大小
        const compressedFileSize = fs.statSync(outputFilePath).size;
        
        // 更新压缩后的大小显示
        compressedSize.textContent = formatSize(compressedFileSize);
        
        // 更新进度
        updateItemProgress(progress, 100);
        
      } catch (error) {
        console.error(`压缩文件 ${file.name} 失败:`, error);
        compressedSize.textContent = '压缩失败';
        updateItemProgress(progress, 100);
      }
      
      // 如果是最后一个文件，更新状态
      if (i === previewItems.length - 1) {
        updateStatus('压缩完成', '所有文件已处理完毕');
        // 启用打开输出文件夹按钮
        openOutputDirBtn.disabled = false;
        
        // 更新使用次数
        const newCompressionCount = tinify.compressionCount;
        configManager.setUsageCount(newCompressionCount);
        updateUsageCount(newCompressionCount);
        checkUsageLimit(newCompressionCount);
      }
    }
  } catch (error) {
    console.error('TinyPNG API错误:', error);
    if (error.status === 401) {
      alert('API密钥无效，请检查您的密钥是否正确');
    } else {
      alert(`压缩过程中发生错误: ${error.message}`);
    }
    updateStatus('压缩失败', error.message);
  }
});

// 更新单个项目的进度条
function updateItemProgress(progressElement, percent) {
  progressElement.style.width = `${percent}%`;
}

// 从File对象读取为Buffer
function readFileAsBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(Buffer.from(reader.result));
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// 更新单个项目的进度条
function updateItemProgress(progressElement, percent) {
  progressElement.style.width = `${percent}%`;
}

// 更新使用次数显示
function updateUsageCount(count) {
  const usageCountSpan = usageCountDisplay.querySelector('span');
  usageCountSpan.textContent = count;
  
  // 根据使用次数更新显示样式
  if (count > 450) {
    usageCountSpan.classList.add('warning');
  } else {
    usageCountSpan.classList.remove('warning');
  }
}

// 检查使用限制
function checkUsageLimit(count) {
  if (count >= 500) {
    alert('警告：您本月的免费使用次数已用完！请考虑更换新的API密钥。');
  } else if (count >= 450) {
    alert(`警告：您本月已使用 ${count} 次，接近500次的免费限制。`);
  }
}

// 页面加载时初始化UI和加载配置
document.addEventListener('DOMContentLoaded', () => {
  // 加载保存的API密钥
  const savedApiKey = configManager.getApiKey();
  if (savedApiKey) {
    apiKeyInput.value = savedApiKey;
    // 如果有保存的API密钥，自动设置tinify.key
    tinify.key = savedApiKey;
    
    // 尝试获取使用次数
    try {
      // 异步验证API密钥并获取使用次数
      tinify.validate().then(() => {
        const count = tinify.compressionCount;
        updateUsageCount(count);
        configManager.setUsageCount(count);
      }).catch(err => {
        console.error('验证API密钥失败:', err);
      });
    } catch (error) {
      console.error('获取使用次数失败:', error);
    }
  }
  
  // 显示保存的使用次数
  const usageCount = configManager.getUsageCount();
  updateUsageCount(usageCount);
  
  // 如果有保存的输出目录，启用打开输出文件夹按钮
  if (outputDirectory) {
    openOutputDirBtn.disabled = false;
  } else {
    openOutputDirBtn.disabled = true;
  }
});

// 当API密钥输入框失去焦点时保存API密钥
apiKeyInput.addEventListener('blur', (e) => {
  const apiKey = e.target.value.trim();
  
  // 无论是否有API密钥，都保存到配置文件
  configManager.setApiKey(apiKey);
  
  if (apiKey) {
    // 如果有API密钥，设置tinify.key并验证
    tinify.key = apiKey;
    
    // 尝试验证新的API密钥
    try {
      tinify.validate().then(() => {
        const count = tinify.compressionCount;
        updateUsageCount(count);
        configManager.setUsageCount(count);
      }).catch(err => {
        console.error('验证API密钥失败:', err);
      });
    } catch (error) {
      console.error('验证API密钥失败:', error);
    }
  } else {
    // 如果API密钥为空，重置使用次数显示
    updateUsageCount(0);
    configManager.setUsageCount(0);
  }
});

// 添加CSS样式
const style = document.createElement('style');
style.textContent = `
  .usage-count {
    margin-top: 5px;
    font-size: 0.9em;
    color: #666;
  }
  .usage-count span.warning {
    color: #ff5722;
    font-weight: bold;
  }
`;
document.head.appendChild(style);

document.addEventListener('click', (e) => {
  const target = e.target.closest('a');
  if (target && target.getAttribute('href') && target.getAttribute('target') === '_blank') {
    e.preventDefault();
    ipcRenderer.invoke('open-external-link', target.getAttribute('href'));
  }
});