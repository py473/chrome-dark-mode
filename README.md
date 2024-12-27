# 关灯 - Chrome浏览器暗黑模式插件

一个简单的 Chrome 浏览器插件，可以一键切换网页的暗黑模式。

## 项目地址

https://github.com/py473/chrome-dark-mode

## 主要功能

- 一键切换网页暗黑模式
- 自动保存每个网站的暗黑模式状态
- 完全本地运行，无需联网
- 支持图片和视频反色处理
- 支持大部分网站

## 安装方法

1. 下载插件文件夹
2. 打开 Chrome 浏览器，在地址栏输入：`chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择插件文件夹
6. 安装完成后，浏览器右上角工具栏会出现插件图标

## 使用方法

1. 点击浏览器右上角的插件图标（月亮/太阳图标）即可切换暗黑模式
2. 插件会自动记住每个网站的暗黑模式状态
3. 下次访问同一网站时会自动应用上次的设置

## 匹配规则

- 按照域名匹配相同页面
- 不包含具体路径
- 不同二级域名视为不同网站
- 例如：
  - `www.example.com` 和 `www.example.com/page` 视为同一网站
  - `www.example.com` 和 `blog.example.com` 视为不同网站

## 注意事项

- 在 chrome:// 开头的页面上无法使用
- 某些网站可能不支持暗黑模式
- 如遇到显示异常，可以再次点击图标切换回正常模式

## 隐私说明

- 所有设置都保存在本地
- 不会收集任何用户数据
- 不会与任何服务器通信

## 技术支持

如果遇到问题或需要帮助，可以：
1. 在 GitHub 上提交 Issue
2. 检查浏览器控制台是否有错误信息
3. 尝试重新安装插件

## 开源协议

MIT License 

## 安全说明

- 本插件完全开源，源代码可在 GitHub 查看
- 仅在本地运行，不会连接任何服务器
- 不会收集任何用户数据
- 所有设置都保存在本地浏览器中
- 权限说明：
  - storage: 保存设置
  - activeTab: 修改当前页面样式
  - scripting: 注入暗黑模式样式
  - tabs: 检测页面切换
  - notifications: 显示操作提示 