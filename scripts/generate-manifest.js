#!/usr/bin/env node
/**
 * 自动生成 Sample manifest 清单
 * 
 * 扫描 src/renderer/Sample/ 目录，生成按样式分组的 JSON 清单。
 * 如果内容无变化则跳过写入（避免无意义的 git diff）。
 * 
 * 用法: node scripts/generate-manifest.js
 * 或:   pnpm run generate-manifest
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_DIR = path.join(__dirname, '..', 'src', 'renderer', 'Sample');
const MANIFEST_PATH = path.join(SAMPLE_DIR, 'sample-manifest.json');

// 匹配 {3位ID}-Type{大写字母}-sample_compressed.{jpeg|jpg|png|webp}
const FILE_PATTERN = /^(\d{3})-Type([A-Z])-sample_compressed\.(jpeg|jpg|png|webp)$/;

function generateManifest() {
  let files;
  try {
    files = fs.readdirSync(SAMPLE_DIR);
  } catch (err) {
    console.error(`[generate-manifest] 无法读取目录: ${SAMPLE_DIR}`);
    console.error(err.message);
    process.exit(1);
  }

  const samples = {};
  let matchedCount = 0;

  for (const file of files) {
    const match = file.match(FILE_PATTERN);
    if (!match) continue;

    const [, id, typeLetter] = match;
    const typeName = `Type${typeLetter}`;

    if (!samples[typeName]) {
      samples[typeName] = [];
    }
    samples[typeName].push(id);
    matchedCount++;
  }

  // 每个样式内排序 ID
  for (const type of Object.keys(samples)) {
    samples[type].sort();
  }

  const manifest = {
    version: 1,
    generated: new Date().toISOString().split('T')[0],
    samples
  };

  const newContent = JSON.stringify(manifest, null, 2) + '\n';

  // 检查是否有变化
  let existingContent = null;
  try {
    existingContent = fs.readFileSync(MANIFEST_PATH, 'utf-8');
  } catch (_) {
    // 文件不存在，需要创建
  }

  if (existingContent === newContent) {
    console.log(`[generate-manifest] manifest 无变化，跳过写入 (${matchedCount} 个样本, ${Object.keys(samples).length} 种样式)`);
    return;
  }

  fs.writeFileSync(MANIFEST_PATH, newContent, 'utf-8');
  console.log(`[generate-manifest] 已更新 manifest: ${matchedCount} 个样本, ${Object.keys(samples).length} 种样式`);
}

generateManifest();