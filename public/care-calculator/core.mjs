export const STORAGE_KEY = 'care_planner_v2';
export const LEGACY_KEY = 'bcc_v1_state';
export const VERSION = 2;
export const DEFAULT_WAKE = 7 * 60 + 15;
export const DEFAULT_BED = 19 * 60 + 50;
export const DEFAULT_LEAD = 50;

export function parseTime(value) {
  if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) return NaN;
  const [hours, minutes] = value.split(':').map(Number);
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : NaN;
}

export function inputTime(minutes) {
  const value = Math.max(0, Math.min(1439, Math.round(minutes)));
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

export function formatClock(minutes) {
  const hour = Math.floor(minutes / 60);
  return `${hour % 12 || 12}:${String(minutes % 60).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
}

export function formatDuration(minutes) {
  const value = Math.max(0, Math.round(minutes));
  const hours = Math.floor(value / 60);
  const rest = value % 60;
  if (!hours) return `${rest}m`;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export function dateKind(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid date.');
  return [0, 6].includes(date.getDay()) ? 'weekend' : 'weekday';
}

export function shiftDate(dateKey, days) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function newDay(dateKey, wake = DEFAULT_WAKE, bed = DEFAULT_BED) {
  const kind = dateKind(dateKey);
  const blocks = kind === 'weekday'
    ? [
        { id: 'weekday-jeff', owner: 'jeff', label: 'Jeff', start: 470, end: 500 },
        { id: 'weekday-school', owner: 'free', label: 'School / free', start: 500, end: 1050 },
        { id: 'weekday-john', owner: 'john', label: 'John', start: 1050, end: 1160 },
      ]
    : [
        { id: 'weekend-jeff', owner: 'jeff', label: 'Jeff', start: 470, end: 630 },
        { id: 'weekend-john', owner: 'john', label: 'John', start: 630, end: 720 },
        { id: 'weekend-nap', owner: 'free', label: 'Nap', start: 720, end: 840 },
      ];
  const fitted = blocks
    .map(block => ({ ...block, start: Math.max(wake, block.start), end: Math.min(bed, block.end) }))
    .filter(block => block.end > block.start);
  return { date: dateKey, kind, wake, bed, blocks: fitted, updatedAt: Date.now() };
}

export function sortedBlocks(day) {
  return [...day.blocks].sort((a, b) => a.start - b.start || a.end - b.end);
}

export function validateDay(day) {
  if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day.date || '')) return 'Invalid date.';
  if (shiftDate(day.date, 0) !== day.date) return 'Invalid date.';
  if (!Number.isInteger(day.wake) || !Number.isInteger(day.bed) || day.wake < 0 || day.bed > 1439 || day.wake >= day.bed) return 'Wake time must be before bed time.';
  if (!Array.isArray(day.blocks)) return 'Schedule is missing.';
  const ids = new Set();
  let previousEnd = day.wake;
  for (const block of sortedBlocks(day)) {
    if (!block || typeof block.id !== 'string' || ids.has(block.id)) return 'Schedule has duplicate blocks.';
    ids.add(block.id);
    if (!['jeff', 'john', 'free'].includes(block.owner)) return 'Schedule has an unknown assignee.';
    if (typeof block.label !== 'string' || !block.label.trim()) return 'Schedule has an invalid label.';
    if (!Number.isInteger(block.start) || !Number.isInteger(block.end) || block.start < day.wake || block.end > day.bed || block.start >= block.end) return 'Blocks must stay between wake and bed time.';
    if (block.start < previousEnd) return 'Blocks cannot overlap.';
    previousEnd = block.end;
  }
  return null;
}

export function unionLength(intervals, lower, upper) {
  let covered = 0;
  let end = lower;
  const clipped = intervals
    .map(({ start, end: finish }) => ({ start: Math.max(lower, start), end: Math.min(upper, finish) }))
    .filter(({ start, end: finish }) => finish > start)
    .sort((a, b) => a.start - b.start);
  for (const range of clipped) {
    covered += Math.max(0, range.end - Math.max(end, range.start));
    end = Math.max(end, range.end);
  }
  return covered;
}

export function calculate(day, johnLead = DEFAULT_LEAD) {
  const span = Math.max(0, day.bed - day.wake);
  const unavailable = unionLength(day.blocks.filter(block => block.owner === 'free'), day.wake, day.bed);
  const available = Math.max(0, span - unavailable);
  const lead = Number.isFinite(johnLead) ? Math.max(0, Math.round(johnLead)) : DEFAULT_LEAD;
  const jeffTarget = Math.max(0, Math.floor((available - lead) / 2));
  const johnTarget = available - jeffTarget;
  const jeff = day.blocks.filter(block => block.owner === 'jeff').reduce((sum, block) => sum + Math.max(0, Math.min(day.bed, block.end) - Math.max(day.wake, block.start)), 0);
  const john = day.blocks.filter(block => block.owner === 'john').reduce((sum, block) => sum + Math.max(0, Math.min(day.bed, block.end) - Math.max(day.wake, block.start)), 0);
  return {
    span, unavailable, available, jeffTarget, johnTarget, jeff, john,
    jeffRemaining: Math.max(0, jeffTarget - jeff),
    johnRemaining: Math.max(0, johnTarget - john),
    jeffOver: Math.max(0, jeff - jeffTarget),
    johnOver: Math.max(0, john - johnTarget),
    open: Math.max(0, available - jeff - john),
    jeffPercent: jeffTarget ? Math.round((jeff / jeffTarget) * 100) : (jeff ? 100 : 0),
    johnPercent: johnTarget ? Math.round((john / johnTarget) * 100) : (john ? 100 : 0),
  };
}

export function gaps(day) {
  const gaps = [];
  let cursor = day.wake;
  for (const block of sortedBlocks(day)) {
    if (block.start > cursor) gaps.push({ start: cursor, end: block.start });
    cursor = Math.max(cursor, block.end);
  }
  if (cursor < day.bed) gaps.push({ start: cursor, end: day.bed });
  return gaps;
}

export function fillOpen(day, johnLead = DEFAULT_LEAD) {
  const result = structuredClone(day);
  let { jeffRemaining, johnRemaining } = calculate(result, johnLead);
  let count = 0;
  for (const gap of gaps(result)) {
    let cursor = gap.start;
    while (cursor < gap.end && (jeffRemaining > 0 || johnRemaining > 0)) {
      const owner = johnRemaining >= jeffRemaining ? 'john' : 'jeff';
      const need = owner === 'john' ? johnRemaining : jeffRemaining;
      const take = Math.min(need, gap.end - cursor);
      if (take <= 0) break;
      result.blocks.push({ id: `filled-${Date.now()}-${count++}`, owner, label: owner === 'john' ? 'John' : 'Jeff', start: cursor, end: cursor + take });
      cursor += take;
      if (owner === 'john') johnRemaining -= take;
      else jeffRemaining -= take;
    }
  }
  result.updatedAt = Date.now();
  return result;
}
