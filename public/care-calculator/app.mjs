import { calculate, dateKind, fillOpen, formatClock, formatDuration, gaps, inputTime, newDay, parseTime, shiftDate, sortedBlocks, STORAGE_KEY, validateDay } from './core.mjs';
import { emptyStore, loadStore, parseBackup, saveStore, validateStore } from './storage.mjs';

const $ = id => document.getElementById(id);
let storage;
const todayKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
let store;
let savedRaw;
let dateKey = todayKey();
let zoom = 1.5;
let activeDrag = null;
let pinchStart = null;
let suppressTimelineClick = false;
let editingId = null;
let undoStore = null;
let noticeTimer;

function notice(message) {
  $('notice').textContent = message;
  $('notice').hidden = false;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { $('notice').hidden = true; }, 6500);
}

function saveFailure(error) {
  if (error.code === 'STALE_STORE') {
    $('saveStatus').textContent = 'Changed in another tab';
    notice('This plan changed in another tab. Reload before making more changes.');
  } else {
    $('saveStatus').textContent = 'Could not save';
    notice('Your edit was not saved. Free browser storage and try again.');
  }
}

function save(next, message) {
  const problem = validateStore(next);
  if (problem) { notice(problem); return false; }
  try { savedRaw = saveStore(storage, next, savedRaw); }
  catch (error) { saveFailure(error); return false; }
  undoStore = structuredClone(store);
  store = next;
  $('saveStatus').textContent = 'Saved on this device';
  render();
  if (message) notice(message);
  return true;
}

function day() { return store.days[dateKey]; }

function openDate(nextDate) {
  const previousDate = dateKey;
  if (nextDate !== dateKey) undoStore = null;
  dateKey = nextDate;
  if (!store.days[dateKey]) {
    const next = structuredClone(store);
    next.days[dateKey] = newDay(dateKey, next.settings.wake, next.settings.bed);
    try { savedRaw = saveStore(storage, next, savedRaw); store = next; }
    catch (error) {
      if (error.code === 'STALE_STORE') {
        try {
          savedRaw = storage.getItem(STORAGE_KEY);
          store = loadStore(storage);
          if (!store.days[dateKey]) {
            const updated = structuredClone(store);
            updated.days[dateKey] = newDay(dateKey, updated.settings.wake, updated.settings.bed);
            savedRaw = saveStore(storage, updated, savedRaw);
            store = updated;
          }
          $('saveStatus').textContent = 'Saved on this device';
          notice('Plan refreshed from another tab.');
        } catch (retryError) { dateKey = previousDate; saveFailure(retryError); render(); return; }
      } else {
        store = next;
        $('saveStatus').textContent = 'Could not save';
        notice('This new day is only in this tab. Export a backup before leaving.');
      }
    }
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
    line.dataset.minute = String(minute);
    line.style.top = `${(minute - current.wake) * pixelsPerMinute}px`;
    const label = document.createElement('span');
    label.textContent = formatClock(minute).replace(':00 ', ' ');
    line.append(label);
    timeline.append(line);
    minute += 60;
  }
  for (const block of sortedBlocks(current)) {
    const button = document.createElement('button');
    button.type = 'button';
    const short = block.end - block.start < 45;
    const blockHeight = Math.max(10, (block.end - block.start) * pixelsPerMinute - 2);
    button.className = `timeline-block owner-${block.owner}${short ? ' short' : ''}`;
    button.classList.toggle('has-resize', blockHeight >= 42);
    button.dataset.blockId = block.id;
    button.dataset.start = String(block.start);
    button.dataset.end = String(block.end);
    button.style.top = `${(block.start - current.wake) * pixelsPerMinute}px`;
    button.style.height = `${blockHeight}px`;
    button.title = `${block.label}: ${formatClock(block.start)} to ${formatClock(block.end)}`;
    button.setAttribute('aria-label', `Edit or drag ${block.label}, ${formatClock(block.start)} to ${formatClock(block.end)}`);
    const content = document.createElement('span');
    content.className = 'block-content';
    const label = document.createElement('strong');
    label.textContent = block.label;
    content.append(label);
    if (block.end - block.start >= 50) {
      const times = document.createElement('span');
      times.className = 'block-times';
      times.textContent = `  ${formatClock(block.start)}–${formatClock(block.end)}`;
      content.append(times);
    }
    button.append(content);
    if (blockHeight >= 42) {
      for (const edge of ['start', 'end']) {
        const handle = document.createElement('span');
        handle.className = `resize-handle resize-${edge}`;
        handle.dataset.resize = edge;
        handle.setAttribute('aria-hidden', 'true');
        button.append(handle);
      }
    }
    timeline.append(button);
  }
  $('zoomLabel').textContent = `${zoom}×`;
  $('zoomOut').disabled = zoom === 1;
  $('zoomIn').disabled = zoom === 3;
}

function layoutTimeline(current) {
  const timeline = $('timeline');
  const pixelsPerMinute = .49 * zoom;
  timeline.style.height = `${Math.max(200, (current.bed - current.wake) * pixelsPerMinute + 16)}px`;
  for (const line of timeline.querySelectorAll('.timeline-hour')) {
    line.style.top = `${(Number(line.dataset.minute) - current.wake) * pixelsPerMinute}px`;
  }
  for (const element of timeline.querySelectorAll('.timeline-block')) {
    const start = Number(element.dataset.start);
    const end = Number(element.dataset.end);
    const height = Math.max(10, (end - start) * pixelsPerMinute - 2);
    element.classList.toggle('has-resize', height >= 42);
    element.style.top = `${(start - current.wake) * pixelsPerMinute}px`;
    element.style.height = `${height}px`;
    if (height >= 42 && !element.querySelector('.resize-handle')) {
      for (const edge of ['start', 'end']) {
        const handle = document.createElement('span');
        handle.className = `resize-handle resize-${edge}`;
        handle.dataset.resize = edge;
        handle.setAttribute('aria-hidden', 'true');
        element.append(handle);
      }
    } else if (height < 42) element.querySelectorAll('.resize-handle').forEach(handle => handle.remove());
  }
  $('zoomLabel').textContent = `${zoom}×`;
  $('zoomOut').disabled = zoom === 1;
  $('zoomIn').disabled = zoom === 3;
}

function setZoom(value, anchor = null) {
  const next = Math.max(1, Math.min(3, Math.round(value * 4) / 4));
  if (next === zoom) return;
  const viewport = $('timelineViewport');
  let minute;
  let viewportY;
  if (anchor != null) {
    minute = day().wake + (anchor - $('timeline').getBoundingClientRect().top) / (.49 * zoom);
    viewportY = anchor - viewport.getBoundingClientRect().top;
  }
  zoom = next;
  if (pinchStart) layoutTimeline(day());
  else renderTimeline(day());
  if (minute != null) viewport.scrollTop = Math.max(0, (minute - day().wake) * .49 * zoom + 15 - viewportY);
}

function timelineMinute(clientY) {
  return day().wake + (clientY - $('timeline').getBoundingClientRect().top) / (.49 * zoom);
}

function bindTimelineGestures() {
  const timeline = $('timeline');
  const viewport = $('timelineViewport');
  timeline.addEventListener('pointerdown', event => {
    const element = event.target.closest('.timeline-block');
    if (!element || event.button !== 0 || pinchStart || activeDrag) return;
    const ordered = sortedBlocks(day());
    const index = ordered.findIndex(block => block.id === element.dataset.blockId);
    if (index < 0) return;
    const block = ordered[index];
    const resizeEdge = event.target.closest('[data-resize]')?.dataset.resize;
    const waitForHold = event.pointerType === 'touch' && !resizeEdge;
    activeDrag = {
      element, id: block.id, pointerId: event.pointerId, mode: resizeEdge || (waitForHold ? 'pending' : 'move'),
      startY: event.clientY, lastY: event.clientY, start: block.start, end: block.end,
      lower: index ? ordered[index - 1].end : day().wake,
      upper: index + 1 < ordered.length ? ordered[index + 1].start : day().bed,
      nextStart: block.start, nextEnd: block.end, moved: false, holdTimer: null,
    };
    if (waitForHold) {
      const drag = activeDrag;
      drag.holdTimer = setTimeout(() => {
        if (activeDrag === drag && !pinchStart) drag.mode = 'move';
      }, 240);
    }
    element.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  timeline.addEventListener('pointermove', event => {
    const drag = activeDrag;
    if (!drag || drag.pointerId !== event.pointerId || pinchStart) return;
    if (drag.mode === 'pending' && Math.abs(event.clientY - drag.startY) >= 6) {
      clearTimeout(drag.holdTimer);
      drag.mode = 'pan';
    }
    if (drag.mode === 'pan') {
      const change = event.clientY - drag.lastY;
      const before = viewport.scrollTop;
      viewport.scrollTop -= change;
      window.scrollBy(0, -change - (viewport.scrollTop - before));
      drag.lastY = event.clientY;
      return;
    }
    if (drag.mode === 'pending') return;
    if (Math.abs(event.clientY - drag.startY) < 5 && !drag.moved) return;
    drag.moved = true;
    const delta = Math.round((event.clientY - drag.startY) / (.49 * zoom * 5)) * 5;
    if (drag.mode === 'start') {
      drag.nextStart = Math.max(drag.lower, Math.min(drag.start + delta, drag.end - 5));
    } else if (drag.mode === 'end') {
      drag.nextEnd = Math.max(drag.start + 5, Math.min(drag.end + delta, drag.upper));
    } else {
      const duration = drag.end - drag.start;
      drag.nextStart = Math.max(drag.lower, Math.min(drag.start + delta, drag.upper - duration));
      drag.nextEnd = drag.nextStart + duration;
    }
    drag.element.style.top = `${(drag.nextStart - day().wake) * .49 * zoom}px`;
    drag.element.style.height = `${Math.max(10, (drag.nextEnd - drag.nextStart) * .49 * zoom - 2)}px`;
    drag.element.classList.add('dragging');
    drag.element.title = `${formatClock(drag.nextStart)} to ${formatClock(drag.nextEnd)}`;
    const times = drag.element.querySelector('.block-times');
    if (times) times.textContent = `  ${formatClock(drag.nextStart)}–${formatClock(drag.nextEnd)}`;
  });
  const finishDrag = (event, canceled = false) => {
    const drag = activeDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    clearTimeout(drag.holdTimer);
    activeDrag = null;
    suppressTimelineClick = true;
    setTimeout(() => { suppressTimelineClick = false; }, 400);
    if (canceled) { renderTimeline(day()); return; }
    if (drag.mode === 'pan') return;
    if (!drag.moved) { editBlock(drag.id); return; }
    if (drag.nextStart === drag.start && drag.nextEnd === drag.end) { renderTimeline(day()); notice('This block cannot move past another block.'); return; }
    const next = structuredClone(store);
    const block = next.days[dateKey].blocks.find(item => item.id === drag.id);
    block.start = drag.nextStart;
    block.end = drag.nextEnd;
    next.days[dateKey].updatedAt = Date.now();
    if (!save(next, 'Time updated. Use Undo to restore it.')) renderTimeline(day());
  };
  timeline.addEventListener('pointerup', event => finishDrag(event));
  timeline.addEventListener('pointercancel', event => finishDrag(event, true));
  timeline.addEventListener('click', event => {
    if (suppressTimelineClick) { event.preventDefault(); return; }
    const element = event.target.closest('.timeline-block');
    if (element) { editBlock(element.dataset.blockId); return; }
    const minute = Math.round(timelineMinute(event.clientY) / 5) * 5;
    const gap = gaps(day()).find(item => minute >= item.start && minute < item.end);
    if (!gap) { notice('Tap an open part of the timeline to add time.'); return; }
    const start = Math.max(gap.start, Math.min(minute, gap.end - 5));
    editBlock(null, { start, end: Math.min(start + 60, gap.end) });
  });
  const touchDistance = touches => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
  viewport.addEventListener('touchstart', event => {
    if (event.touches.length !== 2) return;
    if (activeDrag) {
      const drag = activeDrag;
      clearTimeout(drag.holdTimer);
      activeDrag = null;
      drag.element.classList.remove('dragging');
      drag.element.style.top = `${(drag.start - day().wake) * .49 * zoom}px`;
      drag.element.style.height = `${Math.max(10, (drag.end - drag.start) * .49 * zoom - 2)}px`;
      drag.element.title = `${formatClock(drag.start)} to ${formatClock(drag.end)}`;
      const times = drag.element.querySelector('.block-times');
      if (times) times.textContent = `  ${formatClock(drag.start)}–${formatClock(drag.end)}`;
    }
    pinchStart = { distance: touchDistance(event.touches), zoom };
    event.preventDefault();
  }, { passive: false });
  viewport.addEventListener('touchmove', event => {
    if (!pinchStart || event.touches.length !== 2) return;
    event.preventDefault();
    const centerY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
    setZoom(pinchStart.zoom * touchDistance(event.touches) / pinchStart.distance, centerY);
  }, { passive: false });
  viewport.addEventListener('touchend', event => {
    if (pinchStart && event.touches.length < 2) {
      pinchStart = null;
      suppressTimelineClick = true;
      setTimeout(() => { suppressTimelineClick = false; }, 400);
    }
  });
  viewport.addEventListener('touchcancel', () => { pinchStart = null; });
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
  bindTimelineGestures();
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
    try { savedRaw = saveStore(storage, previous, savedRaw); store = previous; undoStore = null; render(); notice('Last change undone.'); }
    catch (error) { saveFailure(error); }
  });
  $('fillOpen').addEventListener('click', () => {
    const next = structuredClone(store);
    next.days[dateKey] = fillOpen(day(), store.settings.johnLead);
    if (next.days[dateKey].blocks.length === day().blocks.length) { notice('No target time is left to fill.'); return; }
    save(next, 'Open time assigned. Use Undo if you want to revise it.');
  });
  $('zoomOut').addEventListener('click', () => setZoom(zoom - .5));
  $('zoomIn').addEventListener('click', () => setZoom(zoom + .5));
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
      if (!next.days[dateKey]) next.days[dateKey] = newDay(dateKey, next.settings.wake, next.settings.bed);
      save(next, next.legacySnapshot ? 'Backup imported. Its older undated plan is preserved in exports.' : 'Backup imported.');
    } catch (error) { notice(error.message || 'Could not import this file.'); }
    finally { event.target.value = ''; }
  });
}

function start() {
  try { storage = window.localStorage; savedRaw = storage.getItem(STORAGE_KEY); store = loadStore(storage); }
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
  const room = new URLSearchParams(window.location.search);
  if (room.has('room') || savedRaw === null) {
    $('legacyRoomLink').href = `/care-calculator/legacy/?room=${encodeURIComponent(room.get('room') || 'default')}`;
    $('roomNotice').hidden = false;
  }
  window.addEventListener('storage', event => {
    if (event.key === STORAGE_KEY && event.newValue !== savedRaw) {
      $('saveStatus').textContent = 'Changed in another tab';
      notice('This plan changed in another tab. Reload before making more changes.');
    }
  });
  openDate(dateKey);
  if (store.legacySnapshot) notice('An older undated plan was found. It is preserved in exported backups.');
}

start();
