# Alpha Workbench React Rebuild

基于既有 Alpha HTML 视觉基线重建的 React/Vite 交互 Demo。本目录是全新工程，不依赖旧的 `alpha-workbench-wiki-demo`。

## 在线体验

[打开 Alpha Demo](https://elevenoooooo.github.io/Alpha/)

## 启动

```bash
pnpm install
pnpm dev
```

默认访问 `http://127.0.0.1:3100/`：

```bash
pnpm dev
```

## 演示路径

1. 首页点击「功能导览」。
2. 确认计划后等待生成分析文档与产品卡。
3. 点击「使用方案」，进入「我的产品」发起询报价，并体验通过/失败状态。
4. 进入「资产中心」，上传演示文件，完成 Wiki 加工、Diff、提交、审核与版本回滚。
5. 切换「审核员」可分别查看「我的提交」和「待我审核」；自己提交的变更不会出现在自己的待审列表。

Raw 资料采用目录树点击阅读，不提供反向关联入口；Wiki Page 中的 Raw 标签可点击并跳转到对应原文。

当前是纯前端 Demo：文件解析、内容哈希、审批消息、持久化和真实询报价接口均为演示状态，不代表已接入生产系统。

## 发布

源码保存在 `main` 分支，在线版本发布在 `gh-pages` 分支。
