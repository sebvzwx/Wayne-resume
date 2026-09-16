# Wayne - Web3 运营简历

这是 Wayne 的 HTML 在线简历项目，面向 Web3 产品运营 / 活动运营岗位。

## 简历预览

- **在线预览（GitHub Pages）**：<https://sebvzwx.github.io/Wayne----HTML/>
- **PDF 版本**：[Wayne - Web3运营.pdf](./Wayne%20-%20Web3运营.pdf)
- **本地预览**：下载项目后直接打开 `index.html`，或在项目目录启动任意静态文件服务器访问。

> 如果在线预览暂时无法打开，请在 GitHub 仓库的 **Settings → Pages** 中将部署来源设置为 `main` 分支的根目录（`/(root)`）。

## 项目特点

- 结构化数据驱动简历内容，主要内容集中在 `resume-data.js`
- 支持网页实时编辑，修改内容会保存到浏览器本地
- 支持打印 / 导出 PDF
- 支持复制 Markdown 和 JSON
- 响应式布局，适配桌面端与移动端

## 文件说明

| 文件 | 说明 |
| --- | --- |
| `index.html` | 简历页面结构与操作入口 |
| `styles.css` | 页面样式与打印样式 |
| `script.js` | 渲染、编辑、复制和导出交互逻辑 |
| `resume-data.js` | 简历结构化数据 |
| `Wayne - Web3运营.pdf` | PDF 简历版本 |

## 本地运行

无需安装依赖。可以直接打开 `index.html`，也可以使用 Python 启动本地静态服务器：

```bash
python3 -m http.server 8000
```

然后访问 <http://localhost:8000>。
