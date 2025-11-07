import regionsMetadata from '@/config/regions-metadata.json';
import type { RegionMetadata } from '@/types';

/**
 * 获取所有启用的地区
 */
export function getAllRegions(): RegionMetadata[] {
  return regionsMetadata.regions
    .filter(r => r.enabled)
    .sort((a, b) => a.order - b.order);
}

/**
 * 根据ID获取地区信息
 */
export function getRegionById(id: string): RegionMetadata | undefined {
  return regionsMetadata.regions.find(r => r.id === id && r.enabled);
}

/**
 * 获取地区显示名称（支持国际化）
 */
export function getRegionDisplayName(
  id: string,
  lang: 'en' | 'zh' = 'en'
): string {
  const region = getRegionById(id);
  if (!region) return id;
  return lang === 'zh' ? region.nameZh : region.nameEn;
}

/**
 * 获取地区旗帜emoji
 */
export function getRegionFlag(id: string): string {
  const region = getRegionById(id);
  return region?.flag || '🌐';
}

/**
 * 验证地区ID是否有效
 */
export function isValidRegion(regionId: string): boolean {
  if (regionId === 'all') return true;
  return regionsMetadata.regions.some(
    r => r.id === regionId && r.enabled
  );
}

/**
 * 获取地区支持的语言列表
 */
export function getRegionLanguages(id: string): string[] {
  const region = getRegionById(id);
  return region?.languages || ['en'];
}

/**
 * 按语言分组地区
 */
export function groupRegionsByLanguage(): Record<string, RegionMetadata[]> {
  const regions = getAllRegions();
  const grouped: Record<string, RegionMetadata[]> = {};

  regions.forEach(region => {
    region.languages.forEach(lang => {
      if (!grouped[lang]) {
        grouped[lang] = [];
      }
      grouped[lang].push(region);
    });
  });

  return grouped;
}
