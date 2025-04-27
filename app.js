// 导入renderer.js中的功能
// 这个文件负责处理UI交互，而实际的压缩逻辑在renderer.js中

document.addEventListener('DOMContentLoaded', () => {
  // 获取DOM元素
  const dropArea = document.getElementById('dropArea');
  const browseBtn = document.getElementById('browseBtn');
  const fileInput = document.getElementById('fileInput');

  const outputDirBtn = document.getElementById('outputDirBtn');
  const compressBtn = document.getElementById('compressBtn');
  const previewContainer = document.getElementById('previewContainer');
  
  // 获取弹窗相关元素
  const coffeeModal = document.getElementById('coffeeModal');
  const coffeeBtn = document.querySelector('.coffee-btn');
  const closeBtn = document.querySelector('.close');
  
  // 点击Buy Me a Coffee按钮显示弹窗
  coffeeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    coffeeModal.style.display = 'block';
  });
  
  // 点击关闭按钮隐藏弹窗
  closeBtn.addEventListener('click', () => {
    coffeeModal.style.display = 'none';
  });
  
  // 点击弹窗外部区域关闭弹窗
  window.addEventListener('click', (e) => {
    if (e.target === coffeeModal) {
      coffeeModal.style.display = 'none';
    }
  });
  

  
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
  
  // 文件选择逻辑已移至renderer.js中处理
  // 不在此处添加事件监听，避免重复触发
});