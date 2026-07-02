# Implementation Plan

[Overview]
为首页样式卡片实现基于 `src/renderer/Sample/` 目录中 ID 前缀缩略图的随机选择机制，并确保同一次首页展示中不同样式不会使用相同图片 ID。

本计划只覆盖软件代码实现，不包含预览图文件重命名、图片生成、图片压缩或资源制作工作；用户已手动制作所需缩略图资源并放置在 `F:\OneFrame\src\renderer\Sample`。当前首页样式卡片在 `src/renderer/index.html` 中仍使用固定基础缩略图路径，例如 `TypeA-sample_compressed.jpeg`、`TypeL-sample_compressed.jpeg`、`TypeM-sample_compressed.jpeg`，这些基础图继续作为回退资源，不需要修改 HTML 中的默认 `src`。

新的缩略图资源位于渲染端静态资源目录 `src/renderer/Sample/`，浏览器/Electron 渲染进程中应通过相对 URL `Sample/{imageId}-TypeX-sample_compressed.jpeg` 访问。文件命名规则为 `{imageId}-TypeX-sample_compressed.jpeg`，其中 `{imageId}` 是原始图片 ID 号码（保持字符串，保留前导零），`TypeX` 是样式名，例如 `Sample/001-TypeA-sample_compressed.jpeg`、`Sample/030-TypeL-sample_compressed.jpeg`。首页每个样式应随机选择一个该样式可用的 ID 缩略图，同时全局避免不同样式使用相同 `imageId`。如果某个样式没有可用 ID 缩略图，或所有可用 ID 都已被其他样式占用，则回退到原始基础缩略图 `TypeX-sample_compressed.jpeg`，以保证首页永远可正常显示。

已检查 `src/renderer/Sample/` 中的测试文件。目录中存在同一 ID 被多个样式共享的情况（如 `006-TypeE-sample_compressed.jpeg` 与 `006-TypeK-sample_compressed.jpeg`、`016-TypeJ-sample_compressed.jpeg` 与 `016-TypeM-sample_compressed.jpeg`），因此实现不能逐样式独立随机，而必须在首页初始化时进行一次全局分配，使用 `Set<string>` 跟踪已使用 ID，确保同屏缩略图 ID 不重复。目录中还包含一个不符合命名规则的文件 `011-TypeH-sampl_compressed.jpeg`（`sample` 拼写错误），实现应通过正则验证严格过滤此类异常文件名。

[Types]
新增缩略图候选、分配结果和选择配置等逻辑数据结构，不引入 TypeScript，仅使用 JavaScript 对象约定。

```javascript
/**
 * 样式 ID 与 Type 文件名前缀的映射。
 * styleId 来自 .style-card 的 data-style，例如 type-l。
 * typeName 用于拼接文件名，例如 TypeL。
 * basePath 是 HTML 中原有基础回退图，例如 TypeL-sample_compressed.jpeg。
 */
type StyleThumbnailMeta = {
  styleId: string,
  typeName: string,
  basePath: string
};

/**
 * 一个实际存在的 Sample 目录 ID 前缀缩略图候选。
 */
type ThumbnailCandidate = {
  imageId: string,
  styleId: string,
  typeName: string,
  filename: string,
  path: string
};

/**
 * 首页一次缩略图分配的全局状态。
 */
type ThumbnailAssignmentState = {
  usedImageIds: Set<string>,
  assignments: Map<string, string>
};

/**
 * 缩略图选择配置。
 */
type ThumbnailSelectorConfig = {
  sampleBasePath: string,
  imageIdList: string[],
  maxNumericId: number,
  extension: string
};
```

字段约束：

- `imageId` 必须保持字符串处理，不能转为数字，以保留前导零，例如 `001`、`007`、`030`。
- `typeName` 必须与资源文件中的大小写一致，例如 `TypeA`、`TypeL`、`TypeM`。
- `basePath` 是当前 HTML 中已有的基础缩略图路径，例如 `TypeL-sample_compressed.jpeg`，用于候选缺失时回退。
- `filename` 是 Sample 目录下的文件名，例如 `030-TypeL-sample_compressed.jpeg`。
- `path` 是最终可用于 `<img src>` 的相对 URL，例如 `Sample/030-TypeL-sample_compressed.jpeg`。
- `sampleBasePath` 默认为 `Sample/`，注意包含尾部 `/`。
- `usedImageIds` 用于保证一次首页渲染中不同样式不会重复使用同一个原始图片 ID。
- `imageIdList` 是软件侧可探测的 ID 范围或显式 ID 列表，不负责创建图片文件。

[Files]
新增一个缩略图选择工具模块，修改首页初始化入口接入该模块，不改动图片资源文件和 HTML 默认回退路径。

新建文件：

- `src/renderer/js/thumbnail-selector.js`
  - 首页缩略图选择器工具模块。
  - 负责根据 `Sample/{imageId}-TypeX-sample_compressed.jpeg` 规则生成候选路径、检测文件是否存在、随机选择不重复 ID 的缩略图。
  - 不负责创建、复制、重命名、压缩任何图片资源。
  - 不修改 `src/renderer/Sample/` 目录内容。

修改文件：

- `src/renderer/js/app.js`
  - 在模块顶部导入缩略图选择器：`import { initHomepageThumbnails } from './thumbnail-selector.js';`
  - 在 `DOMContentLoaded` 初始化流程中调用首页缩略图初始化函数。
  - 保持现有样式卡片点击选择图片逻辑不变。

不修改文件：

- `src/renderer/index.html`
  - 保留当前基础 `<img src="TypeX-sample_compressed.jpeg">` 作为回退图。
  - 不需要手动把 HTML 中的缩略图路径改成 `Sample/...` 路径。

- `src/renderer/Sample/` 下的图片文件
  - 本计划不包含图片文件重命名或生成。
  - 用户手动制作的 `{imageId}-TypeX-sample_compressed.jpeg` 文件由选择器自动探测使用。
  - 不符合命名规则的文件（如 `011-TypeH-sampl_compressed.jpeg`）不在选择范围内。

[Functions]
新增缩略图选择相关函数，并在 `app.js` 中增加首页初始化调用。

新函数：

- `initHomepageThumbnails(styleCards, options = {})`
  - 文件：`src/renderer/js/thumbnail-selector.js`
  - 签名：`export async function initHomepageThumbnails(styleCards, options = {})`
  - 参数：
    - `styleCards`: `NodeList | HTMLElement[]`，首页样式卡片集合。
    - `options.sampleBasePath`: 可选字符串，默认 `'Sample/'`。
    - `options.imageIdList`: 可选字符串数组，用于指定可探测 ID，例如 `['001', '002', '003']`。
    - `options.maxNumericId`: 可选数字，用于生成默认 ID 范围，例如 `1..99`。
    - `options.extension`: 可选扩展名，默认 `.jpeg`。
  - 逻辑：
    1. 遍历 `.style-card`。
    2. 读取 `data-style`，例如 `type-l`。
    3. 找到卡片内 `.preview-image`。
    4. 从当前 `img.src` 或 `src` 属性中提取基础文件名，例如 `TypeL-sample_compressed.jpeg`。
    5. 解析或推导 `typeName`，例如 `TypeL`。
    6. 基于 `sampleBasePath` 构建该样式的候选路径：`Sample/{imageId}-TypeL-sample_compressed.jpeg`。
    7. 调用候选收集函数探测实际存在的 Sample 文件。
    8. 调用全局分配算法为所有样式分配缩略图，保证 `imageId` 不重复。
    9. 将成功分配的路径写回对应 `<img>` 的 `src`。
    10. 未成功分配的样式保留原始基础图。
  - 返回：`Promise<Map<string, string>>`，key 为 `styleId`，value 为最终缩略图路径。

- `buildStyleThumbnailMeta(card)`
  - 文件：`src/renderer/js/thumbnail-selector.js`
  - 签名：`function buildStyleThumbnailMeta(card)`
  - 目的：从单个 `.style-card` 解析 `styleId`、`typeName`、`basePath`。
  - 规则：优先从当前图片 `src` 中提取 `TypeX-sample_compressed.jpeg`；如果提取失败，则从 `data-style="type-l"` 转换出 `TypeL`。

- `styleIdToTypeName(styleId)`
  - 文件：`src/renderer/js/thumbnail-selector.js`
  - 签名：`function styleIdToTypeName(styleId)`
  - 示例：
    - `type-a` → `TypeA`
    - `type-l` → `TypeL`
    - `type-m` → `TypeM`
  - 目的：将 DOM 中的样式 ID 转换为缩略图文件名中的 Type 名称。

- `getDefaultImageIdList(maxNumericId = 99)`
  - 文件：`src/renderer/js/thumbnail-selector.js`
  - 签名：`function getDefaultImageIdList(maxNumericId = 99)`
  - 目的：生成默认 ID 探测列表，例如 `001` 到 `099`。
  - 注意：该函数只生成要探测的 ID，不表示文件一定存在。

- `buildCandidatePath(imageId, typeName, options = {})`
  - 文件：`src/renderer/js/thumbnail-selector.js`
  - 签名：`function buildCandidatePath(imageId, typeName, options = {})`
  - 默认配置：`sampleBasePath = 'Sample/'`，`extension = '.jpeg'`。
  - 返回示例：`Sample/001-TypeL-sample_compressed.jpeg`。

- `isValidSampleFilename(filename)`
  - 文件：`src/renderer/js/thumbnail-selector.js`
  - 签名：`function isValidSampleFilename(filename)`
  - 目的：验证文件名是否符合 `{imageId}-TypeX-sample_compressed.jpeg` 格式。
  - 正则规则：`/^\d{3}-Type[A-Z]-sample_compressed\.(jpeg|jpg|png|webp)$/`。
  - 作用：过滤掉如 `011-TypeH-sampl_compressed.jpeg`（缺少 `e`）等不符合命名规则的异常文件。

- `checkFileExists(url)`
  - 文件：`src/renderer/js/thumbnail-selector.js`
  - 签名：`async function checkFileExists(url)`
  - 目的：检测候选缩略图文件是否存在。
  - 实现要求：
    - 优先使用 `fetch(url, { method: 'HEAD' })`。
    - 如果本地文件协议或 Electron 环境对 HEAD 不稳定，可回退到 `GET`，但不解析图片内容。
    - 返回 `boolean`。
  - 注意：URL 应为 `Sample/001-TypeA-sample_compressed.jpeg` 格式的相对路径。

- `collectCandidatesForStyle(meta, imageIdList, options = {})`
  - 文件：`src/renderer/js/thumbnail-selector.js`
  - 签名：`async function collectCandidatesForStyle(meta, imageIdList, options = {})`
  - 目的：为单个样式收集实际存在的 ID 前缀缩略图候选。
  - 逻辑：
    1. 遍历 `imageIdList`。
    2. 对每个 `imageId` 调用 `buildCandidatePath()` 生成候选 URL。
    3. 对每个候选 URL 调用 `isValidSampleFilename()` 验证文件名格式。
    4. 对通过格式验证的候选调用 `checkFileExists()` 探测文件存在。
    5. 仅当文件存在时加入候选列表。
  - 返回：`Promise<ThumbnailCandidate[]>`。

- `assignUniqueIdThumbnails(styleCandidatesMap, fallbackMap)`
  - 文件：`src/renderer/js/thumbnail-selector.js`
  - 签名：`function assignUniqueIdThumbnails(styleCandidatesMap, fallbackMap)`
  - 目的：从所有样式候选中随机分配缩略图，并确保不同样式不重复使用 `imageId`。
  - 选择规则：
    1. 样式卡片顺序先随机打乱，避免总是前面的样式优先占用热门 ID。
    2. 每个样式的候选列表内部随机打乱。
    3. 为当前样式选择第一个 `imageId` 未被使用的候选。
    4. 成功选择后将 `imageId` 加入 `usedImageIds`。
    5. 如果该样式没有未占用候选，则使用基础图 `TypeX-sample_compressed.jpeg`，且不占用任何 `imageId`。
  - 返回：`Map<string, string>`，key 为 `styleId`，value 为最终缩略图路径。

- `shuffle(array)`
  - 文件：`src/renderer/js/thumbnail-selector.js`
  - 签名：`function shuffle(array)`
  - 目的：Fisher-Yates 洗牌，保证随机选择候选。

修改函数：

- `DOMContentLoaded` 回调
  - 文件：`src/renderer/js/app.js`
  - 当前位置：主初始化逻辑中已存在：
    ```javascript
    const styleCards = document.querySelectorAll('.style-card:not(.disabled)');
    ```
  - 修改要求：在 `styleCards` 获取后或 `initLogoGrid()` 前后调用：
    ```javascript
    initHomepageThumbnails(styleCards).catch(console.warn);
    ```
  - 目的：页面加载时动态更新首页样式卡片缩略图。

移除函数：

- 不移除现有函数。

[Classes]
无类变更。

本功能使用函数式工具模块实现，不新增类，不修改现有 `HomeView`、`EditorView` 或样式预览/导出类结构。

[Dependencies]
无依赖变更。

本功能只使用浏览器原生能力：

- DOM 查询；
- `fetch`；
- `Promise`；
- `Map` / `Set`；
- `String.prototype.match()` 进行文件名格式验证；
- 原生数组随机洗牌。

不新增 npm 包，不修改 `package.json`、`package-lock.json` 或 `pnpm-lock.yaml`。

[Testing]
测试重点是验证首页随机缩略图选择、跨样式 ID 去重、缺失资源回退、异常文件名过滤和现有样式选择流程不受影响。

资源准备由用户手动完成，测试不包含图片文件重命名或生成。

测试场景：

1. 单 ID 多样式去重测试
   - 准备：`Sample/001-TypeA-sample_compressed.jpeg`、`Sample/001-TypeB-sample_compressed.jpeg`、`Sample/002-TypeB-sample_compressed.jpeg`。
   - 期望：如果 Type A 使用 `001`，Type B 应优先使用 `002` 或回退基础图，而不是继续使用 `001`。

2. 多 ID 随机测试
   - 准备多个 ID，例如 `001`、`002`、`003`，覆盖多个样式。
   - 刷新首页多次。
   - 期望：首页缩略图会随机变化，但同一次页面加载中不同样式不会使用重复 `imageId`。

3. 样式资源缺失回退测试
   - 某个样式没有任何 `Sample/{imageId}-TypeX-sample_compressed.jpeg` 文件。
   - 期望：该样式继续显示 HTML 中原有基础图 `TypeX-sample_compressed.jpeg`。

4. ID 数量不足测试
   - 可用唯一 ID 数量少于样式卡片数量。
   - 期望：能分配的样式使用不重复 ID；剩余样式回退基础图，不强行重复 ID。

5. 异常文件名过滤测试
   - Sample 目录中存在 `011-TypeH-sampl_compressed.jpeg` 等不符合命名规则的文件。
   - 期望：`isValidSampleFilename()` 返回 `false`，该文件不被纳入候选列表。

6. 跨样式共享 ID 去重测试
   - 存在 `Sample/006-TypeE-sample_compressed.jpeg` 和 `Sample/006-TypeK-sample_compressed.jpeg`。
   - 期望：如果 Type E 分配了 `006`，Type K 不会分配 `006`，而是选择其他 ID 或回退。

7. 首页交互回归测试
   - 点击任意样式卡片。
   - 期望：仍能正常选择用户图片并进入编辑器；缩略图随机机制不影响 `data-style` 和原有样式选择逻辑。

8. 非 Electron / Electron 环境测试
   - 在 Electron 应用内测试首页缩略图。
   - 如支持浏览器直接打开，也测试普通浏览器路径。
   - 期望：`fetch` 探测失败时不会导致页面报错，基础图仍可正常显示。

[Implementation Order]
实施顺序应先实现独立选择器，再接入首页，最后验证随机去重、文件名过滤和回退行为。

1. 新建 `src/renderer/js/thumbnail-selector.js`。
2. 在选择器中实现 `styleIdToTypeName()`、`getDefaultImageIdList()`、`buildCandidatePath()`、`isValidSampleFilename()` 和 `shuffle()`。
3. 实现 `checkFileExists()`，支持通过 `Sample/` 相对 URL 进行本地资源存在性探测，并保证失败时返回 `false` 而不是抛出到页面。
4. 实现 `buildStyleThumbnailMeta()` 和 `collectCandidatesForStyle()`。
5. 实现 `assignUniqueIdThumbnails()`，保证同一次首页初始化中不同样式不重复使用 `imageId`。
6. 实现导出函数 `initHomepageThumbnails(styleCards, options = {})`。
7. 修改 `src/renderer/js/app.js`，导入并调用 `initHomepageThumbnails(styleCards).catch(console.warn)`。
8. 验证存在异常文件名时能被 `isValidSampleFilename()` 正确过滤。
9. 验证无 ID 前缀资源时首页仍使用基础图。
10. 验证存在多个 `Sample/{imageId}-TypeX-sample_compressed.jpeg` 文件时，首页随机选择且同屏 ID 不重复。
11. 验证点击样式卡片进入编辑器的原有流程不受影响。

---

## 完成进度核对（基于实际代码）

> **核对时间**：2026-07-02  
> **核对依据**：实际代码文件 `src/renderer/js/thumbnail-selector.js`、`src/renderer/js/app.js`、`src/renderer/index.html`

### 实施步骤完成状态

| 步骤 | 计划要求 | 状态 | 说明 |
|------|----------|------|------|
| 1. 新建 `thumbnail-selector.js` | 创建文件 | ✅ 已完成 | 文件存在，238 行 |
| 2. 工具函数（styleIdToTypeName 等 5 个） | 实现 | ✅ 已完成 | 全部正确实现 |
| 3. `checkFileExists()` | fetch HEAD/GET 探测 | ⚠️ 已实现但有缺陷 | 代码已实现，但在 Electron `file://` 协议下 `fetch()` 不支持本地文件 URL，所有候选被判定为不存在 |
| 4. `buildStyleThumbnailMeta()` + `collectCandidatesForStyle()` | 实现 | ⚠️ 已实现但有缺陷 | `basePath` 从 HTML src 提取时丢失 `Sample/` 前缀；回退路径指向不存在的根目录文件 |
| 5. `assignUniqueIdThumbnails()` | Fisher-Yates + 全局去重 | ✅ 已完成 | 算法正确 |
| 6. `initHomepageThumbnails()` 导出 | export 函数 | ✅ 已完成 | 正确导出并实现完整流程 |
| 7. `app.js` 导入调用 | import + call | ✅ 已完成 | 第 14 行导入，第 922 行调用 |
| 8. 异常文件名过滤 | `isValidSampleFilename()` | ✅ 已完成 | 正则 `/^\d{3}-Type[A-Z]-sample_compressed\.(jpeg\|jpg\|png\|webp)$/` 正确 |
| 9. 无资源时回退基础图 | 回退到 `TypeX-sample_compressed.jpeg` | ❌ 失败 | 回退路径指向根目录不存在的文件（根目录文件已被移入 `Sample/`），同时 HTML 中 `<img src>` 也指向不存在的根目录文件 |
| 10. 随机选择 + ID 不重复 | file:// 下正常工作 | ❌ 失败 | `checkFileExists()` 使用 `fetch()` 在 `file://` 协议下必然失败，所有候选路径被判定为不存在，全局分配结果为空 |
| 11. 原有流程不受影响 | 回归 | ✅ 已完成 | 样式卡片点击、编辑器进入、EXIF 读取等逻辑未被改动 |

### 发现的遗留问题

**问题 1：`index.html` 中 `<img src>` 指向不存在的根目录文件**

所有 13 个样式卡片的 `<img src>` 写死为 `TypeX-sample_compressed.jpeg`（如 `TypeA-sample_compressed.jpeg`），这些文件在根目录下不存在，已被移入 `Sample/` 子目录。导致：
- 页面加载时所有样式卡片图片 404；
- `buildStyleThumbnailMeta()` 从 src 解析的 `basePath` 也不含 `Sample/` 前缀，回退路径同样无效。

**问题 2：`checkFileExists()` 使用 `fetch()` 在 `file://` 协议下失败**

Electron 渲染进程从 `file://` 协议加载页面时，`fetch(url, { method: 'HEAD' })` 不支持本地文件 URL，所有请求抛出网络错误，候选路径全部被判定为不存在。导致：
- `collectCandidatesForStyle()` 对所有样式返回空数组；
- `assignUniqueIdThumbnails()` 无候选可分配，所有样式回退到 `basePath`（问题 1 中的无效路径）。

**问题 3：`Sample/` 目录中部分文件 ID 位数不一致**

实际文件命名中存在 2 位数字 ID 的文件（如 `01-TypeA-sample_compressed.jpeg`），但 `isValidSampleFilename()` 正则只匹配 3 位数字。不过用户已确认文件命名规则统一为 3 位数字，且不存在 `01-TypeA` 格式的文件，因此正则无需修改。

### 下一步修复计划

详见 `implementation_plan.md`（缩略图修复方案），核心修复：
1. 修改 `index.html` 中所有 `<img src>` 为 `Sample/{NNN}-TypeX-sample_compressed.jpeg` 格式（指向实际存在的文件）。
2. 修改 `checkFileExists()` 为 `Image` 对象加载探测（兼容 `file://` 协议）。
3. 修改 `buildStyleThumbnailMeta()` 保留完整相对路径作为 `basePath`（含 `Sample/` 前缀）。