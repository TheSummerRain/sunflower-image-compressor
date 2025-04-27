const fs = require('fs');
const path = require('path');

class ConfigManager {
  constructor() {
    this.configPath = path.join(__dirname, 'app-config.json');
    this.config = this.loadConfig();
  }

  // 加载配置文件
  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf8');
        return JSON.parse(configData);
      } else {
        // 如果配置文件不存在，创建默认配置
        const defaultConfig = {
          apiKey: '',
          usageCount: 0,
          lastResetMonth: new Date().getMonth(),
          inputDirectory: '',
          outputDirectory: '',
          lastOpenedDirectory: ''
        };
        this.saveConfig(defaultConfig);
        return defaultConfig;
      }
    } catch (error) {
      console.error('加载配置文件失败:', error);
      return {
        apiKey: '',
        usageCount: 0,
        lastResetMonth: new Date().getMonth(),
        inputDirectory: '',
        outputDirectory: '',
        lastOpenedDirectory: ''
      };
    }
  }

  // 保存配置文件
  saveConfig(configData = null) {
    try {
      const dataToSave = configData || this.config;
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