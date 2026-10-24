import { unifiedRpg } from './rpg/unified-store.js';
export const growth = Math.pow(Math.PI / Math.E, 1.618) * Math.E * 0.75;
export function xpRange(level, multiplier = global.multiplier || 1) {
	if (unifiedRpg()) { const min = Math.max(0, Math.floor(level) - 1) * 10000; return { min, max: min + 10000, xp: 10000 }; }
	if (level < 0) throw new TypeError('level cannot be negative value');
	level = Math.floor(level);
	let min = level === 0 ? 0 : Math.round(Math.pow(level, growth) * multiplier) + 1;
	let max = Math.round(Math.pow(++level, growth) * multiplier);
	return {
		min,
		max,
		xp: max - min,
	};
}
export function findLevel(xp, multiplier = global.multiplier || 1) {
	if (unifiedRpg()) return Number.isSafeInteger(xp) && xp >= 0 ? Math.floor(xp / 10000) + 1 : NaN;
	if (xp === Infinity) return Infinity;
	if (isNaN(xp)) return NaN;
	if (xp <= 0) return -1;
	let level = 0;
	do level++;
	while (xpRange(level, multiplier).min <= xp);
	return --level;
}
export function canLevelUp(level, xp, multiplier = global.multiplier || 1) {
	if (unifiedRpg()) return Number.isSafeInteger(xp) && level < findLevel(xp);
	if (level < 0) return false;
	if (xp === Infinity) return true;
	if (isNaN(xp)) return false;
	if (xp <= 0) return false;
	return level < findLevel(xp, multiplier);
}
