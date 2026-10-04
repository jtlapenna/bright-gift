import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, changeDayHours, fillOpen, gaps, newDay, unionLength, validateDay } from '../public/care-calculator/core.mjs';
import { loadStore, parseBackup, saveStore } from '../public/care-calculator/storage.mjs';

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), values };
}

test('weekday plan uses school and the agreed parent shifts', () => {
  const day = newDay('2026-09-28');
  assert.deepEqual(day.blocks.map(({ label, start, end }) => [label, start, end]), [
    ['Jeff', 470, 500], ['School / free', 500, 1050], ['John', 1050, 1160],
  ]);
  assert.equal(validateDay(day), null);
  assert.deepEqual((({ available, jeff, john, open }) => ({ available, jeff, john, open }))(calculate(day)), { available: 205, jeff: 30, john: 110, open: 65 });
});

test('weekend plan uses one nap and leaves later time open', () => {
  const day = newDay('2026-10-03');
  assert.deepEqual(day.blocks.map(({ label, start, end }) => [label, start, end]), [
    ['Jeff', 470, 630], ['John', 630, 720], ['Nap', 720, 840],
  ]);
  assert.equal(validateDay(day), null);
  assert.deepEqual((({ available, jeff, john, open }) => ({ available, jeff, john, open }))(calculate(day)), { available: 635, jeff: 160, john: 90, open: 385 });
});

test('unavailable intervals count once and overlapping edits fail', () => {
  assert.equal(unionLength([{ start: 500, end: 1050 }, { start: 720, end: 840 }], 435, 1190), 550);
  const day = newDay('2026-09-28');
  day.blocks.push({ id: 'overlap', owner: 'free', label: 'Nap', start: 720, end: 840 });
  assert.equal(validateDay(day), 'Blocks cannot overlap.');
});

test('editing and removing defaults does not restore them', () => {
  const day = newDay('2026-10-03');
  day.blocks = day.blocks.filter(block => block.label !== 'Nap');
  assert.equal(validateDay(day), null);
  assert.equal(calculate(day).unavailable, 0);
});

test('changing day hours clips boundary blocks without mutating the source day', () => {
  const monday = newDay('2026-09-28');
  const changed = changeDayHours(monday, 8 * 60, 19 * 60);
  assert.equal(validateDay(changed), null);
  assert.deepEqual(changed.blocks.map(({ label, start, end }) => [label, start, end]), [
    ['Jeff', 480, 500], ['School / free', 500, 1050], ['John', 1050, 1140],
  ]);
  assert.equal(monday.wake, 435);
  assert.equal(monday.bed, 1190);
  assert.equal(monday.blocks[0].start, 470);
  assert.equal(monday.blocks[2].end, 1160);
});

test('fill open time assigns target minutes without overlaps', () => {
  const day = newDay('2026-09-28');
  const filled = fillOpen(day);
  const totals = calculate(filled);
  assert.equal(validateDay(filled), null);
  assert.equal(totals.open, 0);
  assert.equal(totals.jeffRemaining + totals.johnRemaining, 0);
  assert.equal(gaps(filled).length, 0);
});

test('overages stay visible while remaining target stops at zero', () => {
  const day = newDay('2026-09-28');
  day.blocks = [{ id: 'long-john', owner: 'john', label: 'John', start: 435, end: 500 }, ...day.blocks.filter(block => block.id !== 'weekday-jeff')];
  const totals = calculate(day);
  assert.ok(totals.johnOver > 0);
  assert.equal(totals.johnRemaining, 0);
});

test('storage keeps legacy data without applying it to today', () => {
  const old = JSON.stringify({ items: [{ id: 'nap1', startMin: 590, endMin: 660 }] });
  const storage = memoryStorage({ bcc_v1_state: old });
  const store = loadStore(storage);
  assert.equal(store.legacySnapshot, old);
  assert.deepEqual(store.days, {});
  store.days['2026-09-28'] = newDay('2026-09-28');
  saveStore(storage, store);
  assert.deepEqual(parseBackup(storage.getItem('care_planner_v2')).days['2026-09-28'].blocks, store.days['2026-09-28'].blocks);
});

test('malformed backup cannot discard dated plans on save', () => {
  const storage = memoryStorage();
  const store = loadStore(storage);
  assert.throws(() => parseBackup(JSON.stringify({ ...store, days: [] })), /unknown format/);
  const invalidDate = newDay('2026-09-28');
  invalidDate.date = '2026-02-31';
  assert.equal(validateDay(invalidDate), 'Invalid date.');
  const invalidLabel = newDay('2026-09-28');
  invalidLabel.blocks[0].label = null;
  assert.equal(validateDay(invalidLabel), 'Schedule has an invalid label.');
});

test('stale tab cannot overwrite a plan saved by another tab', () => {
  const storage = memoryStorage();
  const firstTab = loadStore(storage);
  const secondTab = loadStore(storage);
  firstTab.days['2026-09-28'] = newDay('2026-09-28');
  saveStore(storage, firstTab, null);
  secondTab.days['2026-09-29'] = newDay('2026-09-29');
  assert.throws(() => saveStore(storage, secondTab, null), /changed in another tab/);
  assert.ok(loadStore(storage).days['2026-09-28']);
  assert.equal(loadStore(storage).days['2026-09-29'], undefined);
});
