import { calculate, dateKind, fillOpen, formatClock, formatDuration, gaps, inputTime, newDay, parseTime, shiftDate, sortedBlocks, validateDay } from './core.mjs';
import { emptyStore, loadStore, parseBackup, saveStore, validateStore } from './storage.mjs';

const $ = id => document.getElementById(id);
let storage;
const todayKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
let store;
let dateKey = todayKey();
let zoom = 1;
let editingId = null;
let undoStore = null;
let noticeTimer;

function notice(message) {
  $('notice').textContent = message;
  $('notice').hidden = false;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { $('notice').hidden = true; }, 6500);
}

function save(next, message) {
  const problem = validateStore(next);
  if (problem) { notice(problem); return false; }
  try { saveStore(storage, next); }
  catch { $('saveStatus').textContent = 'Could not save'; notice('This browser could not save your plan. Export a backup before leaving.'); return false; }
  undoStore = structuredClone(store);
  store = next;
  $('saveStatus').textContent = 'Saved on this device';
  render();
  if (message) notice(message);
  return true;
}

function day() { return store.days[dateKey]; }

function openDate(nextDate) {
  if (nextDate !== dateKey) undoStore = null;
  dateKey = nextDate;
  if (!store.days[dateKey]) {
    const next = structuredClone(store);
    next.days[dateKey] = newDay(dateKey, next.settings.wake, next.settings.bed);
    try { saveStore(storage, next); store = next; }
    catch { store = next; $('saveStatus').textContent = 'Could not save'; notice('This browser could not save the new day. Export a backup before leaving.'); }
  }
  render();
}

function category(block) {
  if (block.owner !== 'free') return block.owner;
  if (block.label === 'Nap') return 'nap';
  if (block.label === 'School / free') return 'school';
  return 'free';
}

function labelFor(type) {
  return { jeff: 'Jeff', john: 'John', school: 'School / free', nap: 'Nap', free: 'Free time' }[type];
}

function editBlock(id = null, suggested = null) {
  const block = id ? day().blocks.find(item => item.id === id) : null;
  editingId = block?.id || null;
  const open = suggested || gaps(day())[0];
  $('dialogTitle').textContent = block ? 'Edit time' : 'Add time';
  $('blockType').value = block ? category(block) : 'jeff';
  $('blockStart').value = inputTime(block?.start ?? open?.start ?? day().wake);
  $('blockEnd').value = inputTime(block?.end ?? Math.min((open?.start ?? day().wake) + 60, open?.end ?? day().bed));
  $('deleteBlock').hidden = !block;
  $('blockError').hidden = true;
  $('blockDialog').showModal();
  $('blockType').focus();
}

function closeEditor() { $('blockDialog').close(); }

function renderSummary(info) {
  $('openTime').textContent = formatDuration(info.open);
  $('openContext').textContent = `${formatDuration(info.available)} parent time · ${formatDuration(info.unavailable)} unavailable`;
  for (const owner of ['jeff', 'john']) {
    const percent = info[`${owner}Percent`];
    $(owner + 'Percent').textContent = `${percent}%`;
    $(owner + 'Scheduled').textContent = formatDuration(info[owner]);
    $(owner + 'Remaining').textContent = formatDuration(info[`${owner}Remaining`]);
    $(owner + 'Bar').style.width = `${Math.min(100, percent)}%`;
    $(owner + 'Meter').setAttribute('aria-valuenow', String(Math.min(100, percent)));
    $(owner + 'Meter').setAttribute('aria-valuetext', `${percent}% of target scheduled`);
    const over = $(owner + 'Over');
    over.hidden = !info[`${owner}Over`];
    over.textContent = info[`${owner}Over`] ? `${formatDuration(info[`${owner}Over`])} over target` : '';
  }
  $('undoButton').hidden = !undoStore;
}

function renderList(current) {
  const list = $('blockList');
  list.replaceChildren();
  const blocks = sortedBlocks(current);
  let cursor = current.wake;
  const addRow = (block, start, end) => {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = `schedule-row ${block ? `owner-${block.owner}` : 'gap-row'}`;
    row.setAttribute('aria-label', block ? `Edit ${block.label}, ${formatClock(start)} to ${formatClock(end)}` : `Add time in open gap, ${formatClock(start)} to ${formatClock(end)}`);
    const time = document.createElement('span');
    time.className = 'row-time';
    time.textContent = `${formatClock(start).replace(' ', '')}\n${formatClock(end).replace(' ', '')}`;
    time.style.whiteSpace = 'pre-line';
    const main = document.createElement('span');
    main.className = 'row-main';
    const mark = document.createElement('span');
    mark.className = 'row-marker';
    mark.setAttribute('aria-hidden', 'true');
    const name = document.createElement('strong');
    name.textContent = block ? block.label : 'Open time';
    main.append(mark, name);
    const duration = document.createElement('span');
    duration.className = 'row-duration';
    duration.textContent = formatDuration(end - start);
    row.append(time, main, duration);
    row.addEventListener('click', () => editBlock(block?.id || null, block ? null : { start, end }));
    list.append(row);
  };
  for (const block of blocks) {
    if (block.start > cursor) addRow(null, cursor, block.start);
    addRow(block, block.start, block.end);
    cursor = Math.max(cursor, block.end);
  }
  if (cursor < current.bed) addRow(null, cursor, current.bed);
  if (!list.children.length) {
    const empty = document.createElement('p');
    empty.className = 'timeline-help';
    empty.textContent = 'No time blocks yet. Add one to start planning.';
    list.append(empty);
  }
}

function renderTimeline(current) {
  const timeline = $('timeline');
  timeline.replaceChildren();
  const pixelsPerMinute = .49 * zoom;
  timeline.style.height = `${Math.max(200, (current.bed - current.wake) * pixelsPerMinute + 16)}px`;
  let minute = Math.ceil(current.wake / 60) * 60;
  while (minute < current.bed) {
    const line = document.createElement('div');
    line.className = 'timeline-hour';
    line.style.top = `${(minute - current.wake) * pixelsPerMinute}px`;
    const label = document.createElement('span');
    label.textContent = formatClock(minute).replace(':00 ', ' ');
    line.append(label);
    timeline.append(line);
    minute += 60;
  }
  for (const block of sortedBlocks(current)) {
    const button = document.createElement('div');
    const short = block.end - block.start < 45;
    button.className = `timeline-block owner-${block.owner}${short ? ' short' : ''}`;
    button.style.top = `${(block.start - current.wake) * pixelsPerMinute}px`;
    button.style.height = `${Math.max(10, (block.end - block.start) * pixelsPerMinute - 2)}px`;
    button.title = `${block.label}: ${formatClock(block.start)} to ${formatClock(block.end)}`;
    const label = document.createElement('strong');
    label.textContent = block.label;
    button.append(label);
    if (block.end - block.start >= 50) {
      const times = document.createElement('span');
      times.textContent = `  ${formatClock(block.start)}–${formatClock(block.end)}`;
      button.append(times);
    }
    timeline.append(button);
  }
  $('zoomLabel').textContent = `${zoom}×`;
  $('zoomOut').disabled = zoom === 1;
  $('zoomIn').disabled = zoom === 2;
}

function render() {
  const current = day();
  if (!current) return;
  const info = calculate(current, store.settings.johnLead);
  const date = new Date(`${dateKey}T12:00:00`);
  const longDate = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(date);
  $('pageTitle').textContent = longDate;
  $('dayType').textContent = `${dateKind(dateKey)} plan`;
  $('planDate').value = dateKey;
  $('daySpan').textContent = `Wake ${formatClock(current.wake)} · Bed ${formatClock(current.bed)}`;
  $('wakeInput').value = inputTime(current.wake);
  $('bedInput').value = inputTime(current.bed);
  $('leadInput').value = String(store.settings.johnLead);
  $('legacyNote').hidden = !store.legacySnapshot;
  $('addBlock').disabled = !info.open;
  $('fillOpen').disabled = !info.open || !(info.jeffRemaining || info.johnRemaining);
  renderSummary(info);
  renderList(current);
  renderTimeline(current);
}

function bindEvents() {
  $('previousDay').addEventListener('click', () => openDate(shiftDate(dateKey, -1)));
  $('nextDay').addEventListener('click', () => openDate(shiftDate(dateKey, 1)));
  $('todayButton').addEventListener('click', () => openDate(todayKey()));
  $('planDate').addEventListener('change', event => { if (event.target.value) openDate(event.target.value); });
  $('addBlock').addEventListener('click', () => editBlock());
  $('closeDialog').addEventListener('click', closeEditor);
  $('cancelBlock').addEventListener('click', closeEditor);
  $('blockDialog').addEventListener('click', event => { if (event.target === $('blockDialog')) closeEditor(); });
  $('blockForm').addEventListener('submit', event => {
    event.preventDefault();
    const start = parseTime($('blockStart').value);
    const end = parseTime($('blockEnd').value);
    const type = $('blockType').value;
    const next = structuredClone(store);
    const blocks = next.days[dateKey].blocks;
    const block = { id: editingId || crypto.randomUUID(), owner: ['jeff', 'john'].includes(type) ? type : 'free', label: labelFor(type), start, end };
    if (editingId) blocks.splice(blocks.findIndex(item => item.id === editingId), 1, block);
    else blocks.push(block);
    const problem = validateDay(next.days[dateKey]);
    if (problem) { $('blockError').textContent = problem; $('blockError').hidden = false; return; }
    next.days[dateKey].updatedAt = Date.now();
    if (save(next, editingId ? 'Block updated.' : 'Block added.')) closeEditor();
  });
  $('deleteBlock').addEventListener('click', () => {
    if (!editingId) return;
    const next = structuredClone(store);
    next.days[dateKey].blocks = next.days[dateKey].blocks.filter(block => block.id !== editingId);
    next.days[dateKey].updatedAt = Date.now();
    if (save(next, 'Block deleted. Use Undo to restore it.')) closeEditor();
  });
  $('undoButton').addEventListener('click', () => {
    if (!undoStore) return;
    const previous = undoStore;
    try { saveStore(storage, previous); store = previous; undoStore = null; render(); notice('Last change undone.'); }
    catch { notice('Could not undo because this browser could not save.'); }
  });
  $('fillOpen').addEventListener('click', () => {
    const next = structuredClone(store);
    next.days[dateKey] = fillOpen(day(), store.settings.johnLead);
    if (next.days[dateKey].blocks.length === day().blocks.length) { notice('No target time is left to fill.'); return; }
    save(next, 'Open time assigned. Use Undo if you want to revise it.');
  });
  $('zoomOut').addEventListener('click', () => { zoom = Math.max(1, zoom - .5); renderTimeline(day()); });
  $('zoomIn').addEventListener('click', () => { zoom = Math.min(2, zoom + .5); renderTimeline(day()); });
  $('settingsForm').addEventListener('submit', event => {
    event.preventDefault();
    const wake = parseTime($('wakeInput').value);
    const bed = parseTime($('bedInput').value);
    const lead = $('leadInput').value === '' ? NaN : Number($('leadInput').value);
    const next = structuredClone(store);
    next.days[dateKey].wake = wake;
    next.days[dateKey].bed = bed;
    next.settings.wake = wake;
    next.settings.bed = bed;
    next.settings.johnLead = lead;
    const problem = validateStore(next);
    if (problem) { $('settingsError').textContent = `${problem} Move blocks inside the new day bounds first.`; $('settingsError').hidden = false; return; }
    $('settingsError').hidden = true;
    save(next, 'Day settings saved.');
  });
  $('resetDay').addEventListener('click', () => {
    if (!confirm('Replace this day with its usual weekday or weekend plan?')) return;
    const next = structuredClone(store);
    next.days[dateKey] = newDay(dateKey, next.settings.wake, next.settings.bed);
    save(next, 'Day reset to its usual plan.');
  });
  $('exportButton').addEventListener('click', () => {
    const file = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = `care-planner-backup-${todayKey()}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notice('Backup downloaded.');
  });
  $('importButton').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const raw = await file.text();
      let next;
      try { next = parseBackup(raw); }
      catch (error) {
        const legacy = JSON.parse(raw);
        const oldPlan = Array.isArray(legacy.items) ? legacy : legacy.data;
        if (!oldPlan || !Array.isArray(oldPlan.items)) throw error;
        next = structuredClone(store);
        next.legacySnapshot = JSON.stringify(oldPlan);
      }
      if (!confirm('Import this backup? It will replace the current saved plan.')) return;
      save(next, next.legacySnapshot ? 'Backup imported. Its older undated plan is preserved in exports.' : 'Backup imported.');
    } catch (error) { notice(error.message || 'Could not import this file.'); }
    finally { event.target.value = ''; }
  });
}

function start() {
  try { storage = window.localStorage; store = loadStore(storage); }
  catch (error) {
    const shell = document.querySelector('.shell');
    shell.replaceChildren();
    let raw;
    try { raw = storage?.getItem('care_planner_v2'); } catch { /* Storage is unavailable. */ }
    const message = document.createElement('p');
    message.className = 'notice';
    message.textContent = raw ? `${error.message} Download the saved data before changing this browser.` : error.message;
    shell.append(message);
    if (raw) {
      const backup = document.createElement('button');
      backup.type = 'button';
      backup.className = 'secondary-button';
      backup.textContent = 'Download saved data';
      backup.addEventListener('click', () => {
        const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `care-planner-recovery-${todayKey()}.json`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      });
      shell.append(backup);
    }
    return;
  }
  bindEvents();
  openDate(dateKey);
  if (store.legacySnapshot) notice('An older undated plan was found. It is preserved in exported backups.');
}

start();
