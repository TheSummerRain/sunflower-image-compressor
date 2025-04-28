const fs = require('fs');
const path = require('path');
let electron;

// 尝试加载electron模块
try {
  electron = require('electron');
  console.log('成功加载electron模块');
} catch (e) {
  console.warn('无法加载electron模块，可能不在Electron环境中运行:', e);
}

class ConfigManager {
  constructor() {
    // 获取用户数据目录作为配置文件存储位置
    this.configDir = this.getUserDataPath();
    this.configPath = path.join(this.configDir, 'app-config.json');
    console.log('配置文件路径:', this.configPath);
    
    // 确保配置目录存在
    this.ensureConfigDirExists();
    
    // 加载配置
    this.config = this.loadConfig();
  }

  // 获取用户数据目录
  getUserDataPath() {
    try {
      // 主进程中
      if (electron && electron.app) {
        return electron.app.getPath('userData');
      }
      // 渲染进程中
      else if (electron && electron.ipcRenderer) {
        // Electron 9+中，需要使用contextBridge或preload脚本
        // 这里假设已经通过IPC或其他方式获取了userData路径
        if (electron.remote && electron.remote.app) {
          return electron.remote.app.getPath('userData');
        }
      }
    } catch (error) {
      console.warn('获取用户数据目录失败:', error);
    }
    
    // 如果无法获取userData路径，使用临时目录
    // 注意：在打包应用中，__dirname指向asar内部，不可写入
    // 因此使用系统临时目录作为备选
    try {
      const os = require('os');
      return path.join(os.tmpdir(), 'sunflower-img-config');
    } catch (e) {
      // 最后的备选方案
      return path.join(process.cwd(), 'config');
    }
  }

  // 确保配置目录存在
  ensureConfigDirExists() {
    try {
      if (!fs.existsSync(this.configDir)) {
        fs.mkdirSync(this.configDir, { recursive: true });
        console.log('创建配置目录:', this.configDir);
      }
    } catch (error) {
      console.error('创建配置目录失败:', error);
    }
  }

  // 加载配置文件
  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf8');
        try {
          return JSON.parse(configData);
        } catch (parseError) {
          console.error('解析配置文件失败:', parseError);
          return this.getDefaultConfig();
        }
      } else {
        // 如果配置文件不存在，创建默认配置
        const defaultConfig = this.getDefaultConfig();
        this.saveConfig(defaultConfig);
        return defaultConfig;
      }
    } catch (error) {
      console.error('加载配置文件失败:', error);
      return this.getDefaultConfig();
    }
  }
  
  // 获取默认配置
  getDefaultConfig() {
    return {
      apiKey: '',
      usageCount: 0,
      lastResetMonth: new Date().getMonth(),
      inputDirectory: '',
      outputDirectory: '',
      lastOpenedDirectory: ''
    };
  }

  // 保存配置文件
  saveConfig(configData = null) {
    try {
      const dataToSave = configData || this.config;
      
      // 直接写入配置文件
      fs.writeFileSync(this.configPath, JSON.stringify(dataToSave, null, 2), 'utf8');
      this.config = dataToSave;
      return true;
    } catch (error) {
      console.error('保存配置文件失败:', error);
      return false;
    }
  }

  // 获取API密钥
  getApiKey() {
    return this.config.apiKey || '';
  }

  // 设置API密钥
  setApiKey(apiKey) {
    this.config.apiKey = apiKey;
    return this.saveConfig();
  }

  // 获取使用次数
  getUsageCount() {
    // 检查是否需要重置计数器（新的月份）
    const currentMonth = new Date().getMonth();
    if (currentMonth !== this.config.lastResetMonth) {
      this.config.usageCount = 0;
      this.config.lastResetMonth = currentMonth;
      this.saveConfig();
    }
    return this.config.usageCount;
  }

  // 增加使用次数
  incrementUsageCount(count = 1) {
    this.config.usageCount += count;
    return this.saveConfig();
  }

  // 设置使用次数
  setUsageCount(count) {
    this.config.usageCount = count;
    return this.saveConfig();
  }

  // 获取输入目录
  getInputDirectory() {
    return this.config.inputDirectory || '';
  }

  // 设置输入目录
  setInputDirectory(directory) {
    this.config.inputDirectory = directory;
    return this.saveConfig();
  }

  // 获取输出目录
  getOutputDirectory() {
    return this.config.outputDirectory || '';
  }

  // 设置输出目录
  setOutputDirectory(directory) {
    this.config.outputDirectory = directory;
    return this.saveConfig();
  }

  // 获取最后打开的目录
  getLastOpenedDirectory() {
    return this.config.lastOpenedDirectory || '';
  }

  // 设置最后打开的目录
  setLastOpenedDirectory(directory) {
    this.config.lastOpenedDirectory = directory;
    return this.saveConfig();
  }
}

module.exports = new ConfigManager();