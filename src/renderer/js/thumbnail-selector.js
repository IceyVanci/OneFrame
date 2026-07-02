// OneFrame 首页缩略图选择器
// 使用 manifest 清单法为首页 13 个样式卡片选取随机不重复 ID 的缩略图
// 回退链：manifest（1次请求）→ IPC 文件列表 → data-fallback-src

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
 * 构建候选缩略图相对路径。
 * @param {string} imageId - 3 位 ID 字符串，如 '001'
 * @param {string} typeName - 如 'TypeL'
 * @param {string} [sampleBasePath='Sample/']
 * @returns {string} 相对 URL，如 'Sample/001-TypeL-sample_compressed.jpeg'
 */
function buildCandidatePath(imageId, typeName, sampleBasePath = 'Sample/') {
  return `${sampleBasePath}${imageId}-${typeName}-sample_compressed.jpeg`;
}

/**
 * Fisher-Yates 洗牌算法（返回新数组）。
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
 * 从单个 .style-card 解析样式缩略图元信息。
 * 优先读取 data-fallback-src 属性，再读取 src。
 * @param {HTMLElement} card
 * @returns {{ styleId: string, typeName: string, fallbackSrc: string } | null}
 */
function buildStyleThumbnailMeta(card) {
  const styleId = card.dataset.style;
  if (!styleId) return null;

  const img = card.querySelector('.preview-image');
  if (!img) return null;

  const fallbackSrc = img.getAttribute('data-fallback-src') || '';
  const src = fallbackSrc || img.getAttribute('src') || '';
  let typeName = '';

  if (src) {
    const typeMatch = src.match(/(Type[A-Z])-/);
    if (typeMatch) {
      typeName = typeMatch[1];
    }
  }

  if (!typeName) {
    typeName = styleIdToTypeName(styleId);
  }

  return { styleId, typeName, fallbackSrc };
}

/**
 * 获取 manifest 清单。
 * 优先通过 Electron IPC，失败时尝试 fetch（Web 兼容）。
 * @returns {Promise<object|null>} manifest 对象或 null
 */
async function fetchManifest() {
  // 优先：Electron IPC
  if (window.electronAPI?.getSampleManifest) {
    try {
      const manifest = await window.electronAPI.getSampleManifest();
      if (manifest && manifest.samples) return manifest;
    } catch (_) { /* ignore, try fetch */ }
  }

  // 回退：fetch（Web/NAS 环境）
  try {
    const resp = await fetch('Sample/sample-manifest.json');
    if (resp.ok) {
      const manifest = await resp.json();
      if (manifest && manifest.samples) return manifest;
    }
  } catch (_) { /* ignore */ }

  return null;
}

/**
 * 从 manifest 清单中为每个样式随机选取缩略图。
 * Fisher-Yates 洗牌 + 全局 imageId 去重（不同样式尽量不重复使用同一张图片）。
 * @param {object} manifest - { samples: { TypeA: ["001", "022", ...], ... } }
 * @param {Array<{ styleId: string, typeName: string, fallbackSrc: string }>} metaList
 * @param {string} sampleBasePath
 * @returns {Map<string, string>} styleId → 最终缩略图路径
 */
function selectRandomFromManifest(manifest, metaList, sampleBasePath) {
  const usedImageIds = new Set();
  const assignments = new Map();
  const shuffledMetas = shuffle(metaList);

  for (const meta of shuffledMetas) {
    const ids = manifest.samples[meta.typeName];
    if (!ids || ids.length === 0) {
      assignments.set(meta.styleId, meta.fallbackSrc);
      continue;
    }

    const shuffledIds = shuffle(ids);
    let assigned = false;
    for (const imageId of shuffledIds) {
      if (!usedImageIds.has(imageId)) {
        usedImageIds.add(imageId);
        assignments.set(meta.styleId, buildCandidatePath(imageId, meta.typeName, sampleBasePath));
        assigned = true;
        break;
      }
    }

    if (!assigned) {
      // 所有候选 ID 都被占用，回退到 fallback
      assignments.set(meta.styleId, meta.fallbackSrc);
    }
  }

  return assignments;
}

/**
 * 从已知文件列表中为单个样式筛选候选（IPC 文件列表回退模式）。
 * @param {{ styleId: string, typeName: string, fallbackSrc: string }} meta
 * @param {string[]} fileList - Sample 目录中的文件名列表
 * @param {string} sampleBasePath
 * @returns {Array<{ imageId: string, path: string }>}
 */
function collectCandidatesFromFileList(meta, fileList, sampleBasePath) {
  const candidates = [];
  const prefix = `-${meta.typeName}-sample_compressed`;
  for (const filename of fileList) {
    if (!/^\d{3}-Type[A-Z]-sample_compressed\.(jpeg|jpg|png|webp)$/.test(filename)) continue;
    if (!filename.includes(prefix)) continue;
    const imageId = filename.substring(0, 3);
    candidates.push({
      imageId,
      path: `${sampleBasePath}${filename}`
    });
  }
  return candidates;
}

/**
 * 从所有样式候选中全局分配缩略图，保证不同样式不重复使用 imageId。
 * @param {Map<string, Array<{ imageId: string, path: string }>>} styleCandidatesMap
 * @param {Map<string, string>} fallbackMap - styleId → 回退路径
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
 * 流程：manifest 清单（1次请求）→ IPC 文件列表回退 → data-fallback-src
 * @param {NodeList|HTMLElement[]} styleCards - .style-card 元素集合
 * @param {object} [options]
 * @param {string} [options.sampleBasePath='Sample/']
 * @returns {Promise<Map<string, string>>} styleId → 最终缩略图路径
 */
export async function initHomepageThumbnails(styleCards, options = {}) {
  const { sampleBasePath = 'Sample/' } = options;

  const metas = [];
  const fallbackMap = new Map();
  for (const card of styleCards) {
    const meta = buildStyleThumbnailMeta(card);
    if (meta) {
      metas.push(meta);
      fallbackMap.set(meta.styleId, meta.fallbackSrc);
    }
  }

  if (metas.length === 0) return new Map();

  let assignments;

  // 策略 1：manifest 清单法（最优，1 次请求）
  const manifest = await fetchManifest();
  if (manifest) {
    assignments = selectRandomFromManifest(manifest, metas, sampleBasePath);
  } else {
    // 策略 2：IPC 文件列表回退
    let fileList = null;
    if (window.electronAPI?.getSampleFiles) {
      try {
        fileList = await window.electronAPI.getSampleFiles();
      } catch (_) { /* ignore */ }
    }

    if (fileList && fileList.length > 0) {
      const styleCandidatesMap = new Map();
      for (const meta of metas) {
        const candidates = collectCandidatesFromFileList(meta, fileList, sampleBasePath);
        styleCandidatesMap.set(meta.styleId, candidates);
      }
      assignments = assignUniqueIdThumbnails(styleCandidatesMap, fallbackMap);
    } else {
      // 策略 3：全部使用 fallback 图片
      assignments = new Map();
      for (const meta of metas) {
        assignments.set(meta.styleId, meta.fallbackSrc);
      }
    }
  }

  // 写入 img.src
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