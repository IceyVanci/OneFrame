// OneFrame 首页缩略图选择器
// 负责根据 Sample/{imageId}-TypeX-sample_compressed.jpeg 规则随机选择不重复 ID 的缩略图

/**
 * styleId（如 'type-l'）转换为 Type 名称（如 'TypeL'）。
 * @param {string} styleId
 * @returns {string}
 */
function styleIdToTypeName(styleId) {
  const match = styleId.match(/^type-(.)(.*)$/);
  if (!match) {
    return styleId.charAt(0).toUpperCase() + styleId.slice(1);
  }
  return 'Type' + match[1].toUpperCase() + match[2];
}

/**
 * 生成默认 ID 探测列表，例如 '001' 到 maxNumericId 的 3 位零填充字符串。
 * @param {number} maxNumericId
 * @returns {string[]}
 */
function getDefaultImageIdList(maxNumericId = 99) {
  const ids = [];
  for (let i = 1; i <= maxNumericId; i++) {
    ids.push(String(i).padStart(3, '0'));
  }
  return ids;
}

/**
 * 构建候选缩略图相对路径。
 * @param {string} imageId - 3 位 ID 字符串，如 '001'
 * @param {string} typeName - 如 'TypeL'
 * @param {object} [options]
 * @param {string} [options.sampleBasePath='Sample/']
 * @param {string} [options.extension='.jpeg']
 * @returns {string} 相对 URL，如 'Sample/001-TypeL-sample_compressed.jpeg'
 */
function buildCandidatePath(imageId, typeName, options = {}) {
  const { sampleBasePath = 'Sample/', extension = '.jpeg' } = options;
  return `${sampleBasePath}${imageId}-${typeName}-sample_compressed${extension}`;
}

/**
 * 验证文件名是否符合 {imageId}-TypeX-sample_compressed.{ext} 格式。
 * @param {string} filename
 * @returns {boolean}
 */
function isValidSampleFilename(filename) {
  return /^\d{3}-Type[A-Z]-sample_compressed\.(jpeg|jpg|png|webp)$/.test(filename);
}

/**
 * Fisher-Yates 洗牌算法（原地打乱）。
 * @param {Array} array
 * @returns {Array}
 */
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 检测候选缩略图文件是否存在。
 * 使用 Image 对象加载探测，兼容 file:// 协议（Electron 环境）。
 * @param {string} url - 相对 URL，如 'Sample/001-TypeA-sample_compressed.jpeg'
 * @returns {Promise<boolean>}
 */
async function checkFileExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      img.src = '';
      resolve(false);
    }, 2000);
    img.onload = () => {
      clearTimeout(timeout);
      resolve(true);
    };
    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };
    img.src = url;
  });
}

/**
 * 从单个 .style-card 解析样式缩略图元信息。
 * @param {HTMLElement} card
 * @returns {{ styleId: string, typeName: string, basePath: string } | null}
 */
function buildStyleThumbnailMeta(card) {
  const styleId = card.dataset.style;
  if (!styleId) return null;

  const img = card.querySelector('.preview-image');
  let basePath = '';
  let typeName = '';

  if (img) {
    const src = img.getAttribute('src') || '';
    if (src) {
      // 保留完整相对路径作为回退路径（含 Sample/ 前缀）
      basePath = src;
      // 从完整路径中提取 Type 名称（如 TypeA）
      const typeMatch = src.match(/(Type[A-Z])-/);
      if (typeMatch) {
        typeName = typeMatch[1];
      }
    }
  }

  if (!typeName) {
    typeName = styleIdToTypeName(styleId);
  }

  if (!basePath) {
    basePath = `Sample/${typeName}-sample_compressed.jpeg`;
  }

  return { styleId, typeName, basePath };
}

/**
 * 从已知文件列表中为单个样式筛选候选（高效模式，无需逐个探测）。
 * @param {{ styleId: string, typeName: string, basePath: string }} meta
 * @param {string[]} fileList - Sample 目录中的文件名列表，如 ['022-TypeA-sample_compressed.jpeg', ...]
 * @param {string} sampleBasePath - 候选路径前缀，如 'Sample/'
 * @returns {Array<{ imageId: string, styleId: string, typeName: string, filename: string, path: string }>}
 */
function collectCandidatesFromFileList(meta, fileList, sampleBasePath) {
  const candidates = [];
  const prefix = `-${meta.typeName}-sample_compressed`;
  for (const filename of fileList) {
    if (!isValidSampleFilename(filename)) continue;
    if (!filename.includes(prefix)) continue;
    const imageId = filename.substring(0, 3);
    candidates.push({
      imageId,
      styleId: meta.styleId,
      typeName: meta.typeName,
      filename,
      path: `${sampleBasePath}${filename}`
    });
  }
  return candidates;
}

/**
 * 为单个样式收集实际存在的 ID 前缀缩略图候选（回退模式，逐个探测）。
 * @param {{ styleId: string, typeName: string, basePath: string }} meta
 * @param {string[]} imageIdList
 * @param {object} [options]
 * @returns {Promise<Array<{ imageId: string, styleId: string, typeName: string, filename: string, path: string }>>}
 */
async function collectCandidatesForStyle(meta, imageIdList, options = {}) {
  const candidates = [];
  for (const imageId of imageIdList) {
    const path = buildCandidatePath(imageId, meta.typeName, options);
    const filename = path.split('/').pop() || '';
    if (!isValidSampleFilename(filename)) continue;
    const exists = await checkFileExists(path);
    if (exists) {
      candidates.push({
        imageId,
        styleId: meta.styleId,
        typeName: meta.typeName,
        filename,
        path
      });
    }
  }
  return candidates;
}

/**
 * 从所有样式候选中全局分配缩略图，保证不同样式不重复使用 imageId。
 * @param {Map<string, Array<{ imageId: string, path: string }>>} styleCandidatesMap
 * @param {Map<string, string>} fallbackMap - styleId → 回退基础图路径
 * @returns {Map<string, string>} styleId → 最终缩略图路径
 */
function assignUniqueIdThumbnails(styleCandidatesMap, fallbackMap) {
  const usedImageIds = new Set();
  const assignments = new Map();
  const styleIds = shuffle([...styleCandidatesMap.keys()]);

  for (const styleId of styleIds) {
    const candidates = styleCandidatesMap.get(styleId) || [];
    const shuffled = shuffle(candidates);
    let assigned = false;
    for (const candidate of shuffled) {
      if (!usedImageIds.has(candidate.imageId)) {
        usedImageIds.add(candidate.imageId);
        assignments.set(styleId, candidate.path);
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      assignments.set(styleId, fallbackMap.get(styleId) || '');
    }
  }

  return assignments;
}

/**
 * 首页缩略图初始化入口。
 * 遍历样式卡片，收集候选，全局分配不重复 ID 的缩略图，并写回 <img> src。
 * @param {NodeList|HTMLElement[]} styleCards - .style-card 元素集合
 * @param {object} [options]
 * @param {string} [options.sampleBasePath='Sample/']
 * @param {string[]} [options.imageIdList] - 显式 ID 列表
 * @param {number} [options.maxNumericId=99] - 默认 ID 范围上限
 * @param {string} [options.extension='.jpeg']
 * @returns {Promise<Map<string, string>>} styleId → 最终缩略图路径
 */
export async function initHomepageThumbnails(styleCards, options = {}) {
  const {
    sampleBasePath = 'Sample/',
    imageIdList: explicitIdList = null,
    maxNumericId = 99,
    extension = '.jpeg'
  } = options;

  // 优先使用 Electron 主进程提供的文件列表（高效，无逐个探测）
  let fileList = null;
  if (window.electronAPI?.getSampleFiles) {
    try {
      fileList = await window.electronAPI.getSampleFiles();
    } catch (_) { /* ignore, fallback to Image probing */ }
  }

  const imageIdList = explicitIdList || getDefaultImageIdList(maxNumericId);
  const selectorOptions = { sampleBasePath, extension };

  const metas = [];
  const fallbackMap = new Map();
  for (const card of styleCards) {
    const meta = buildStyleThumbnailMeta(card);
    if (meta) {
      metas.push(meta);
      fallbackMap.set(meta.styleId, meta.basePath);
    }
  }

  let results;
  if (fileList && fileList.length > 0) {
    // 高效模式：从文件列表直接筛选候选
    results = metas.map(meta => ({
      styleId: meta.styleId,
      candidates: collectCandidatesFromFileList(meta, fileList, sampleBasePath)
    }));
  } else {
    // 回退模式：逐个探测（浏览器环境）
    const candidatePromises = metas.map(meta =>
      collectCandidatesForStyle(meta, imageIdList, selectorOptions)
        .then(candidates => ({ styleId: meta.styleId, candidates }))
    );
    results = await Promise.all(candidatePromises);
  }

  const styleCandidatesMap = new Map();
  for (const { styleId, candidates } of results) {
    styleCandidatesMap.set(styleId, candidates);
  }

  const assignments = assignUniqueIdThumbnails(styleCandidatesMap, fallbackMap);

  for (const card of styleCards) {
    const styleId = card.dataset.style;
    if (!styleId) continue;
    const path = assignments.get(styleId);
    if (!path) continue;
    const img = card.querySelector('.preview-image');
    if (img) {
      img.src = path;
    }
  }

  return assignments;
}