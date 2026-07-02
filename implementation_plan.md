# OneFrame Manifest 清单优化计划

**版本**: v1.1.4  
**日期**: 2026-07-02  
**状态**: 待实施

---

## 一、背景

### 当前实现

`thumbnail-selector.js`（287 行）采用两种策略为首页 13 个样式卡片选取随机缩略图：

| 策略 | 条件 | 请求次数 | 适用环境 |
|------|------|---------|---------|
| IPC 高效模式 | `window.electronAPI.getSampleFiles` 可用 | 1 次 IPC + 内存筛选 | Electron |
| Image 探测回退模式 | IPC 不可用 | 最多 99×2×13 = 2,574 次 | 浏览器 |

### 问题

1. **首页闪烁**：HTML `<img src>` 直接指向 `Sample/` 下的默认图片，浏览器先加载默认图，随机化完成后再次替换，导致图片闪烁两次。
2. **回退模式性能差**：虽然 Electron 环境下走 IPC 高效模式，但如果 IPC 失败回退到 Image 探测，2,574 次加载请求会导致严重卡顿。
3. **代码冗余**：`getDefaultImageIdList()`、`collectCandidatesForStyle()`、`checkFileExists()` 等函数仅用于回退模式，维护成本高。

### 优化目标

用 **manifest 清单法** 替代暴力探测，同时引入透明占位符消除闪烁。

---

## 二、性能分析（Electron 环境）

### Electron 环境下的实际影响

当前 Electron 模式已通过 IPC `getSampleFiles`（`fs.readdirSync`）获取文件列表，性能已经不错。Manifest 优化对 Electron 的主要收益：

| 维度 | 优化前（IPC） | 优化后（manifest） | 收益 |
|------|-------------|-------------------|------|
| IPC 调用 | 1 次 `getSampleFiles`（读目录） | 1 次 `getSampleManifest`（读 JSON） | **微乎其微**（两者都是单次 fs 操作） |
| 回退路径 | Image 探测（2,574 次） | 用 `data-fallback-src` 直接回退 | **消除极端回退风险** |
| 首页闪烁 | 有（先显示默认图，再替换） | **无**（透明占位 → 一次性写入） | **用户体验明显提升** |
| 代码行数 | 287 行 | ~160 行 | **维护性提升** |

### 结论

**对 Electron 纯桌面环境，manifest 的性能提升有限**（IPC 模式已经高效），主要价值是：
1. ✅ **消除首页闪烁**（透明 GIF 占位符）
2. ✅ **简化代码**（移除 ~130 行回退探测逻辑）
3. ✅ **消除极端回退风险**（不再有 2,574 次 Image 加载的可能性）

**对 Web/NAS 部署环境，manifest 的性能提升显著**（从最多 2,574 次请求降到 1 次 fetch）。

---

## 三、改动范围

### 3.1 新建文件

#### `src/renderer/Sample/sample-manifest.json`

静态 JSON 清单，列出所有实际存在的样本文件按样式分组：

```json
{
  "version": 1,
  "generated": "2026-07-02",
  "samples": {
    "TypeA": ["001", "022", "032"],
    "TypeB": ["002", "017", "028"],
    "TypeC": ["003", "020", "027"],
    "TypeD": ["005", "018"],
    "TypeE": ["006", "024"],
    "TypeF": ["007", "026", "029"],
    "TypeG": ["008"],
    "TypeH": ["009", "011", "031"],
    "TypeI": ["010", "023"],
    "TypeJ": ["011", "012", "016"],
    "TypeK": ["006", "014", "030"],
    "TypeL": ["015", "030"],
    "TypeM": ["013", "016", "022", "029"]
  }
}
```

共 34 个样本文件，覆盖全部 13 种样式。

### 3.2 修改文件

#### `src/main/main.js`

新增 IPC handler `get-sample-manifest`：

```javascript
ipcMain.handle('get-sample-manifest', async () => {
  try {
    const manifestPath = path.join(__dirname, '..', 'renderer', 'Sample', 'sample-manifest.json');
    const content = fs.readFileSync(manifestPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
});
```

保留现有 `get-sample-files` handler 作为兼容回退。

#### `src/main/preload.js`

新增 API 方法：

```javascript
getSampleManifest: () => ipcRenderer.invoke('get-sample-manifest'),
```

#### `src/renderer/index.html`

将 13 个样式卡片的 `<img>` 从实际图片路径改为透明 GIF 占位符 + `data-fallback-src`：

```html
<!-- 之前 -->
<img src="Sample/022-TypeA-sample_compressed.jpeg" alt="示例图片" class="preview-image">

<!-- 之后 -->
<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" 
     data-fallback-src="Sample/022-TypeA-sample_compressed.jpeg"
     alt="示例图片" class="preview-image">
```

同时更新 About 对话框版本号为 v1.1.4。

#### `src/renderer/js/thumbnail-selector.js`（重写，287 行 → ~160 行）

**新增函数：**

- `fetchManifest()` — 通过 IPC 获取 manifest，失败时尝试 `fetch`（Web 兼容），返回解析后的 JSON 或 null
- `selectRandomFromManifest(manifest, metaList)` — 从清单中为每个样式随机选取缩略图，Fisher-Yates 洗牌 + 全局 imageId 去重

**移除函数：**

- `getDefaultImageIdList()` — 不再需要遍历 99 个 ID
- `collectCandidatesForStyle()` — 不再需要逐个 Image 探测
- `checkFileExists()` — 不再作为主要探测手段

**保留函数：**

- `styleIdToTypeName()` — styleId 到 TypeName 转换
- `buildCandidatePath()` — 构建候选路径
- `isValidSampleFilename()` — 文件名校验
- `shuffle()` — Fisher-Yates 洗牌
- `collectCandidatesFromFileList()` — 保留作为回退（IPC 文件列表模式）
- `assignUniqueIdThumbnails()` — 全局去重分配
- `buildStyleThumbnailMeta()` — 增加 `data-fallback-src` 优先读取逻辑

**主入口 `initHomepageThumbnails()` 新流程：**

```
1. 获取 manifest（IPC 优先，fetch 回退）
2. 成功 → selectRandomFromManifest() 内存随机选取
3. 失败 → 回退到 getSampleFiles（现有 IPC 文件列表）
4. 再失败 → 使用 data-fallback-src 回退图片
```

---

## 四、版本更新

| 文件 | 变更 |
|------|------|
| `package.json` | version → 1.1.4 |
| `src/renderer/index.html` | About 对话框版本号 → v1.1.4 |
| `doc/CHANGELOG.md` | 新增 v1.1.4 条目 |
| `doc/V1.14_CHANGES.md` | 新建，详细变更记录 |
| `doc/RELEASE.md` | 新增 v1.1.4 发布说明 |
| `README.md` | 版本号更新，添加 manifest 特性说明 |

---

## 五、实施步骤

1. 基于 Sample/ 目录现有 34 个文件生成 `sample-manifest.json`
2. 在 `main.js` 添加 `get-sample-manifest` IPC handler
3. 在 `preload.js` 添加 `getSampleManifest` API
4. 重写 `thumbnail-selector.js` 使用 manifest 优先策略
5. 修改 `index.html` 使用透明 GIF 占位符 + data-fallback-src
6. 更新版本号和文档
7. 构建并测试

---

## 六、维护说明

当添加或删除 Sample 目录中的样本图片后，需要更新 `sample-manifest.json`。可用以下命令自动生成：

```powershell
$files = Get-ChildItem src/renderer/Sample/*_compressed.jpeg -Name
$samples = @{}
foreach ($f in $files) {
  if ($f -match '^(\d+)-Type([A-Z])-sample_compressed\.jpeg$') {
    $id = $matches[1]; $type = "Type$($matches[2])"
    if (-not $samples[$type]) { $samples[$type] = @() }
    $samples[$type] += $id
  }
}
@{ version = 1; generated = (Get-Date -Format 'yyyy-MM-dd'); samples = $samples } |
  ConvertTo-Json -Depth 3 | Set-Content src/renderer/Sample/sample-manifest.json -Encoding UTF8