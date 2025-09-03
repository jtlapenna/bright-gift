// BABY CARE CALCULATOR - CONSOLIDATED SCRIPT
// V1 Daily Planner with Mobile Support

// Global state
let state = {
    schedule: {}
};

// Mobile Detection
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768 ||
           ('ontouchstart' in window) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
}

function isTouchDevice() {
    return ('ontouchstart' in window) || 
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
           (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 0);
}

// NOTIFICATION SYSTEM
function showNotification(type, title, message, duration = 5000) {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    const icon = document.createElement('div');
    icon.className = `notification-icon ${type}`;
    icon.innerHTML = type === 'error' ? '⚠️' : '✓';
    
    const content = document.createElement('div');
    content.className = 'notification-content';
    
    const titleEl = document.createElement('h4');
    titleEl.className = 'notification-title';
    titleEl.textContent = title;
    
    const messageEl = document.createElement('p');
    messageEl.className = 'notification-message';
    messageEl.textContent = message;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '×';
    closeBtn.addEventListener('click', () => {
        hideNotification(notification);
    });
    
    content.appendChild(titleEl);
    content.appendChild(messageEl);
    
    notification.appendChild(icon);
    notification.appendChild(content);
    notification.appendChild(closeBtn);
    
    container.appendChild(notification);
    
    // Trigger animation
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });
    
    // Auto-hide after duration
    if (duration > 0) {
        setTimeout(() => {
            hideNotification(notification);
        }, duration);
    }
    
    return notification;
}

function hideNotification(notification) {
    notification.classList.add('hide');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// UTILITY FUNCTIONS
function getCurrentSchedule() {
    return {
        wakeTime: '07:15',
        firstNapStart: '10:00',
        firstNapEnd: '11:00',
        afternoonNapStart: '15:00',
        afternoonNapEnd: '16:00',
        bedTime: '19:50'
    };
}

function fromMinutes(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours < 12 ? 'AM' : 'PM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

function timeToMinutes(timeString) {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

function timeStringToMinutes(timeString) {
    // Convert "HH:MM" format to minutes since midnight
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    return `${displayHours}:${mins.toString().padStart(2, '0')}${ampm}`;
}

// MAIN V1 DAILY PLANNER FUNCTIONS
function renderTimeline() {
    const container = document.querySelector('#daily-module .widget-content.v1-daily');
    if (!container) return;

    // Ensure child containers exist
    let yAxis = document.getElementById('yAxis');
    if (!yAxis) {
        yAxis = document.createElement('div');
        yAxis.className = 'y-axis';
        yAxis.id = 'yAxis';
        container.appendChild(yAxis);
    }
    let surface = document.getElementById('timelineSurface');
    if (!surface) {
        surface = document.createElement('div');
        surface.className = 'timeline-surface';
        surface.id = 'timelineSurface';
        container.appendChild(surface);
    }

    // Clear containers
    yAxis.innerHTML = '';
    surface.innerHTML = '';

    const rectS = surface.getBoundingClientRect();
const csS = getComputedStyle(surface);
const topPad = parseFloat(csS.paddingTop)||8;
const bottomPad = parseFloat(csS.paddingBottom)||12;
const innerHeight = rectS.height - topPad - bottomPad;
const startMin = 5*60, endMin = 22*60, totalMin = endMin - startMin; // 5AM-10PM
    
    const snap = (px) => { 
        const r = window.devicePixelRatio||1; 
        return Math.round(px*r)/r; 
    };
    
    const minutesToY = (min) => topPad + ((min-startMin)/totalMin)*innerHeight;
    const hourText = (h) => { 
        const ampm = h<12 ? 'AM':'PM'; 
        const h12 = h%12===0?12:h%12; 
        return `${h12}${ampm}`; 
    };
    
    const fmt = (mins) => { 
        const h=Math.floor(mins/60)%24, m=mins%60, am=h<12?'AM':'PM', h12=h%12||12; 
        return m===0?`${h12}${am}`:`${h12}:${String(m).padStart(2,'0')}${am}`; 
    };

    // Render Y-axis hours
    for (let h=5; h<=22; h++) {
        const m = h*60;
        const y = snap(minutesToY(m));
        const lbl = document.createElement('div');
        lbl.className = 'y-hour';
        lbl.style.top = `${y}px`;
        lbl.textContent = hourText(h);
        yAxis.appendChild(lbl);
    }

    // Calendar-style blocks store
    if (!window.v1Items) window.v1Items = [];
    const items = window.v1Items;
    
    // Seed defaults once
    if (!items._seeded) {
        items.push({ id:'wake', title:'Wake time',  kind:'point', owner:'free', isDefault:true, startMin: 7*60 + 15, endMin: 7*60 + 15 });
        items.push({ id:'nap1', title:'First nap',  kind:'range', owner:'free', isDefault:true, startMin: 9*60 + 50, endMin: 11*60 });
        items.push({ id:'nap2', title:'Second nap', kind:'range', owner:'free', isDefault:true, startMin: 14*60 + 50, endMin: 16*60 + 20 });
        items.push({ id:'bed',  title:'Bed time',   kind:'point', owner:'free', isDefault:true, startMin: 19*60 + 50, endMin: 19*60 + 50 });
        items._seeded = true;
    }
    
    // Clean up any existing blocks that violate wake/bed boundaries
    validateAndFixExistingBlocks();

    // Render hour grid lines
    for (let h=5; h<=22; h++) {
        const y = snap(minutesToY(h*60));
        const line = document.createElement('div');
        line.className = 'hour-line';
        line.style.top = `${y}px`;
        surface.appendChild(line);
    }

    // Render blocks
    const renderItem = (it) => {
        const top = snap(minutesToY(it.startMin));
        const bottom = snap(minutesToY(it.endMin));
        let height = Math.max(12, bottom - top || 12);
        let adjustedTop = top;
        
        // For point items, position so the bottom edge represents the time
        if (it.kind === 'point') {
            adjustedTop = top - height; // Move up by height so bottom edge is at the time
        }
        
        const el = document.createElement('div');
        el.className = `block owner-${it.owner||'free'}${it.kind==='point'?' point':''}`;
        el.style.top = `${adjustedTop}px`;
        el.style.height = `${height}px`;
        
        // Label inside (white overlay)
        const lbl = document.createElement('div');
        lbl.className = 'block-label';
        if (it.kind === 'range') {
            lbl.textContent = `${it.title || 'Free'}: ${fmt(it.startMin)} - ${fmt(it.endMin)}`;
        } else {
            lbl.textContent = '';
        }
        el.appendChild(lbl);
        
        // Prevent surface click creation when interacting with block
        el.addEventListener('click', (e)=> e.stopPropagation());
        
        // Add resize handles for range items
        let ht, hb;
        if (it.kind !== 'point') {
            ht = document.createElement('div'); 
            ht.className = 'handle top'; 
            el.appendChild(ht);
            
            hb = document.createElement('div'); 
            hb.className = 'handle bottom'; 
            el.appendChild(hb);
        }
        
        // Bind drag/resize handlers
        bindDrag(el, it, minutesToY, snap, topPad, innerHeight, startMin, endMin, lbl, null, fmt);
        if (it.kind !== 'point') {
            bindResize(ht, hb, el, it, minutesToY, snap, topPad, innerHeight, startMin, endMin, lbl, null, fmt);
        }
        
        surface.appendChild(el);
        
        // For point items (wake/bed), show time label above
        if (it.kind === 'point') {
            const time = document.createElement('div');
            time.className = 'time-tag';
            time.textContent = `${it.title || ''}: ${fmt(it.startMin)}`;
            el.appendChild(time);
            // Wire updates for points
            bindDrag(el, it, minutesToY, snap, topPad, innerHeight, startMin, endMin, null, time, fmt);
        }
        
        // On select show ownership toolbar (pointer-based, range only)
        const TAP_DIST = 4;
        let downX=0, downY=0, moved=false;
        el.addEventListener('pointerdown', (e)=>{ downX=e.clientX||0; downY=e.clientY||0; moved=false; });
        el.addEventListener('pointermove', (e)=>{ const dx=(e.clientX||0)-downX, dy=(e.clientY||0)-downY; if (Math.abs(dx)>TAP_DIST||Math.abs(dy)>TAP_DIST) moved=true; });
        el.addEventListener('pointerup', (e)=>{
            if (moved) return;
            if (it.kind!=='range') return; // do not open for wake/bed
            e.stopPropagation();
            e.preventDefault();
            showOwnerToolbar(el, it);
        });
    };

    
    items.forEach(renderItem);

    // Simple reliable click-to-create on empty surface (pointer, bound once)
    if (!surface._boundCreate) {
        surface._boundCreate = true;
        let downY=0, moved=false, lastCreate=0;
        const TAP_DIST=4;

        surface.addEventListener('pointerdown', (e)=>{
            if (e.target.closest && e.target.closest('.block')) return;
            downY = e.clientY||0; moved=false;
        });
        surface.addEventListener('pointermove', (e)=>{
            const dy=(e.clientY||0)-downY; if (Math.abs(dy)>TAP_DIST) moved=true;
        });
        surface.addEventListener('pointerup', (e)=>{
            if (moved) return;
            if (e.target.closest && e.target.closest('.block')) return;
            const now=Date.now();         surface.addEventListener('pointercancel', (e)=>{
            moved = true; // cancel creation if the OS turns this into a scroll/gesture
        });
if (now-lastCreate<200) return; lastCreate=now;

            const rectS = surface.getBoundingClientRect();
            const cs = getComputedStyle(surface);
            const padTop = parseFloat(cs.paddingTop)||8;
            const padBottom = parseFloat(cs.paddingBottom)||12;
            const usableH = rectS.height - padTop - padBottom;

            let yLocal = e.clientY - rectS.top;
            yLocal = Math.max(padTop, Math.min(padTop+usableH, yLocal));

            let minAt = startMin + ((yLocal - padTop)/usableH)*totalMin;
            minAt = Math.round(minAt/5)*5;

            // Wake/Bed boundaries
            const wake = window.v1Items.find(i=>i.id==='wake')?.startMin ?? startMin;
            const bed  = window.v1Items.find(i=>i.id==='bed')?.startMin  ?? endMin;
            if (minAt < wake || minAt > bed) return;

            // Find free gap around minAt
            const ranges = window.v1Items
              .filter(i => i.kind === 'range')
              .map(i => ({ s: i.startMin, e: i.endMin }))
              .filter(iv => iv.e > wake && iv.s < bed)
              .map(iv => ({ s: Math.max(iv.s, wake), e: Math.min(iv.e, bed) }))
              .sort((a, b) => a.s - b.s);

            // merge overlaps
            const merged = [];
            for (const iv of ranges) {
                if (!merged.length || iv.s > merged[merged.length - 1].e) {
                    merged.push({ s: iv.s, e: iv.e });
                } else {
                    merged[merged.length - 1].e = Math.max(merged[merged.length - 1].e, iv.e);
                }
            }

            // compute gaps
            const gaps = [];
            let c = wake;
            for (const iv of merged) {
                if (iv.s > c) gaps.push({ s: c, e: iv.s });
                c = Math.max(c, iv.e);
            }
            if (c < bed) gaps.push({ s: c, e: bed });

            const gap = gaps.find(g => g.s <= minAt && minAt <= g.e);
            const dur=60;
            if (!gap || gap.e-gap.s<5) return;

            const usable = Math.min(dur, gap.e-gap.s);
            let start = Math.max(gap.s, Math.min(minAt - Math.floor(usable/2), gap.e - usable));
            start = Math.round(start/5)*5;

            if (checkForOverlaps(null, start, start+usable)) return;

            window.v1Items.push({ id:'item-'+Date.now(), title:'Free', kind:'range', owner:'free', isDefault:false, startMin:start, endMin:start+usable });
            renderTimeline();
            showNotification('success','Block Created','Click the block to assign it to Jeff or John.');
        });
    }

    // Update progress display after timeline changes

    updateProgressDisplay();
}

// OWNERSHIP TOOLBAR LOGIC
function showOwnerToolbar(hostEl, item) {
    // Check if this block already has a toolbar
    if (hostEl.querySelector('.owner-toolbar')) {
        return;
    }
    
    // Remove any existing toolbars from other blocks
    const existingToolbars = document.querySelectorAll('.owner-toolbar');
    existingToolbars.forEach(t => t.remove());
    
    const bar = document.createElement('div');
    bar.className = 'owner-toolbar';
    
    const makeChip = (key, label) => {
        const btn = document.createElement('button');
        btn.className = `owner-chip chip-${key}`;
        
        const dot = document.createElement('span'); 
        dot.className = 'owner-dot';
        
        const txt = document.createElement('span'); 
        txt.textContent = label;
        
        btn.appendChild(dot); 
        btn.appendChild(txt);
        
        if (item.id==='wake' || item.id==='bed') btn.disabled = true;
        if (item.owner === key || (key==='free' && !item.owner)) btn.classList.add('active');
        
        // Use appropriate event handler based on device type
        const handleInteraction = (e) => {
            e.stopPropagation(); 
            e.preventDefault();
            
            if (btn.disabled) return;
            
            const oldOwner = item.owner;
            item.owner = key; 
            
            
            // keep title/label in sync with owner
            if (item && item.id !== 'wake' && item.id !== 'bed') {
                if (key === 'jeff') item.title = 'Jeff shift';
                else if (key === 'john') item.title = 'John shift';
                else item.title = 'Free';
            }
// Update progress tracker
            updateProgressTracker(item, oldOwner, key);
            
            // Re-render to show color changes
            renderTimeline(); 
            
            // Mobile haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
            
            showNotification('success', 'Assignment Updated', `Block assigned to ${label}.`);
        };
        
        if (isTouchDevice()) {
            btn.addEventListener('touchend', handleInteraction, { passive: false });
        } else {
            btn.addEventListener('mousedown', handleInteraction);
        }
        
        return btn;
    };
    
    bar.appendChild(makeChip('free','Free'));
    if (item.id !== 'wake' && item.id !== 'bed') {
        bar.appendChild(makeChip('jeff','Jeff'));
        bar.appendChild(makeChip('john','John'));
    }
    
    // Add delete button for naps and custom blocks (but not wake/bed)
    if (item.id !== 'wake' && item.id !== 'bed') {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = 'Delete this block';
        
        const handleDelete = (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            // Remove the item from the timeline
            const itemIndex = window.v1Items.findIndex(i => i.id === item.id);
            if (itemIndex !== -1) {
                // Update progress tracker if the item had logged time
                if (item.owner === 'jeff' || item.owner === 'john') {
                    const duration = item.endMin - item.startMin;
                    if (item.owner === 'jeff') {
                        window.jeffLoggedMinutes = Math.max(0, (window.jeffLoggedMinutes || 0) - duration);
                    } else if (item.owner === 'john') {
                        window.johnLoggedMinutes = Math.max(0, (window.johnLoggedMinutes || 0) - duration);
                    }
                }
                
                // Remove the item
                window.v1Items.splice(itemIndex, 1);
                
                // Re-render timeline and update progress
                renderTimeline();
                updateProgressDisplay();
                
                // Mobile feedback
                if (navigator.vibrate) {
                    navigator.vibrate([50, 50, 50]);
                }
                
                showNotification('success', 'Block Deleted', 'The time block has been removed.');
            }
            
            // Remove the toolbar
            bar.remove();
        };
        
        if (isTouchDevice()) {
            deleteBtn.addEventListener('touchend', handleDelete, { passive: false });
        } else {
            deleteBtn.addEventListener('mousedown', handleDelete);
        }
        
        bar.appendChild(deleteBtn);
    }
    
    hostEl.appendChild(bar);
    
    // Dismiss on outside click/touch
    const onDoc = (e) => { 
        if (!bar.contains(e.target)) { 
            bar.remove(); 
            document.removeEventListener('pointerdown', onDoc); 
            if (isTouchDevice()) {
                document.removeEventListener('touchstart', onDoc);
            }
        } 
    };
    setTimeout(() => {
        document.addEventListener('pointerdown', onDoc);
        if (isTouchDevice()) {
            document.addEventListener('touchstart', onDoc);
        }
    }, 0);
}

// UPDATE PROGRESS TRACKER
function updateProgressTracker(item, oldOwner, newOwner) {
    // Prevent duplicate calls for the same operation
    const operationKey = `${item.id}-${oldOwner}-${newOwner}`;
    if (window._lastOperation === operationKey) {
        return;
    }
    window._lastOperation = operationKey;
    
    const duration = item.endMin - item.startMin;
    
    // Update the global logged time tracking
    if (oldOwner === 'jeff') {
        window.jeffLoggedMinutes = Math.max(0, (window.jeffLoggedMinutes || 0) - duration);
    } else if (oldOwner === 'john') {
        window.johnLoggedMinutes = Math.max(0, (window.johnLoggedMinutes || 0) - duration);
    }
    
    if (newOwner === 'jeff') {
        window.jeffLoggedMinutes = Math.max(0, (window.jeffLoggedMinutes || 0) + duration);
    } else if (newOwner === 'john') {
        window.johnLoggedMinutes = Math.max(0, (window.johnLoggedMinutes || 0) + duration);
    }
    
    // Update the progress display
    updateProgressDisplay();
}

// DRAG/RESIZE HANDLERS
function bindDrag(el, item, minutesToY, snap, topPad, innerHeight, startMin, endMin, rangeLabelEl, pointTimeEl, fmt) {
    let startY, startStart, startEnd, moving = false, isTouching = false;
    const totalMin = endMin - startMin;
    const toMinDelta = dy => (dy/innerHeight)*totalMin;
    
    const onMouseDown = e => { 
        if (isTouching) return; // Prevent mouse events if touch is active
        moving = true; 
        startY = e.clientY; 
        startStart = item.startMin; 
        startEnd = item.endMin; 
        item._originalDuration = item.endMin - item.startMin;
        
        if (item.owner !== 'free') {
            window._lastDrag = `${item.id}-${item._originalDuration}-pending`;
        }
        
        el.setPointerCapture?.(e.pointerId); 
    };
    
    const onTouchStart = e => {
        e.preventDefault(); // Prevent scrolling while dragging
        isTouching = true;
        moving = true;
        
        const touch = e.touches[0];
        startY = touch.clientY;
        startStart = item.startMin;
        startEnd = item.endMin;
        item._originalDuration = item.endMin - item.startMin;
        
        if (item.owner !== 'free') {
            window._lastDrag = `${item.id}-${item._originalDuration}-pending`;
        }
        
        // Add visual feedback for touch
        el.style.transform = 'scale(1.02)';
        el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
        el.style.zIndex = '30';
    };
    
    const onMove = e => {
        if (!moving) return;
        
        let clientY;
        if (e.touches) {
            clientY = e.touches[0].clientY;
            e.preventDefault(); // Prevent scrolling
        } else {
            if (isTouching) return; // Don't process mouse events during touch
            clientY = e.clientY;
        }
        
        const d = toMinDelta(clientY - startY);
        
        // Calculate proposed new position
        let newStartMin = Math.max(startMin, Math.min(startStart + d, endMin));
        let newEndMin = Math.max(startMin, Math.min(startEnd + d, endMin));
        if (newEndMin - newStartMin < 5) newEndMin = newStartMin + 5;
        
        // Clamp to wake/bed first, then round to 5
        const wakeWindow = getWakeWindowBoundaries(item);
        newStartMin = Math.max(wakeWindow.start, Math.min(newStartMin, wakeWindow.end));
        newEndMin   = Math.max(wakeWindow.start, Math.min(newEndMin,   wakeWindow.end));
        // Now round to the 5-minute grid
        newStartMin = Math.round(newStartMin/5)*5;
        newEndMin   = Math.round(newEndMin/5)*5;
        
        // Check for overlaps with other blocks (excluding this item)
        const hasOverlap = checkForOverlaps(item.id, newStartMin, newEndMin);
        
        if (!hasOverlap) {
            // Update the item if no overlap
            item.startMin = newStartMin;
            item.endMin = newEndMin;
            
            el.style.top = snap(minutesToY(item.startMin))+'px';
            el.style.height = Math.max(12, snap(minutesToY(item.endMin)) - snap(minutesToY(item.startMin)))+'px';
            
            if (rangeLabelEl && item.kind==='range') {
                rangeLabelEl.textContent = `${item.title || 'Free'}: ${fmt(item.startMin)} - ${fmt(item.endMin)}`;
            }
            if (pointTimeEl && item.kind==='point') {
                pointTimeEl.textContent = `${item.title || ''}: ${fmt(item.startMin)}`;
            }
        }
    };
    
    const onUp = () => { 
        if (!moving) return;
        moving = false; 
        isTouching = false;
        
        // Remove visual feedback
        el.style.transform = '';
        el.style.boxShadow = '';
        el.style.zIndex = '';
        
        // Check if duration changed and update progress tracker if needed
        const newDuration = item.endMin - item.startMin;
        if (item._originalDuration !== newDuration && item.owner !== 'free') {
            // Check if we already processed this drag operation
            const pendingKey = `${item.id}-${item._originalDuration}-pending`;
            if (window._lastDrag === pendingKey) {
                // Update the key to the final state to prevent future duplicates
                const finalKey = `${item.id}-${item._originalDuration}-${newDuration}`;
                window._lastDrag = finalKey;
                
                // Update the logged time for this owner
                if (item.owner === 'jeff') {
                    const oldTotal = window.jeffLoggedMinutes || 0;
                    window.jeffLoggedMinutes = Math.max(0, oldTotal - item._originalDuration + newDuration);
                } else if (item.owner === 'john') {
                    const oldTotal = window.johnLoggedMinutes || 0;
                    window.johnLoggedMinutes = Math.max(0, oldTotal - item._originalDuration + newDuration);
                }
            }
        }
        
        // Update progress tracker after move operations
        updateProgressDisplay();
    };
    
    // Bind events based on device capability
    if (isTouchDevice()) {
        el.addEventListener('touchstart', onTouchStart, { passive: false });
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onUp);
        window.addEventListener('touchcancel', onUp);
    } else {
        el.addEventListener('pointerdown', onMouseDown);
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    }
}

function bindResize(ht, hb, el, item, minutesToY, snap, topPad, innerHeight, startMin, endMin, rangeLabelEl, pointTimeEl, fmt) {
    const totalMin = endMin - startMin;
    const toMinDelta = dy => (dy/innerHeight)*totalMin;
    let mode = null, startY, startStart, startEnd, isTouching = false;
    
    const onMouseDown = which => e => { 
        if (isTouching) return;
        mode = which; 
        startY = e.clientY; 
        startStart = item.startMin; 
        startEnd = item.endMin; 
        item._originalDuration = item.endMin - item.startMin;
        
        if (item.owner !== 'free') {
            window._lastResize = `${item.id}-${item._originalDuration}-pending`;
        }
        
        e.stopPropagation(); 
    };
    
    const onTouchStart = which => e => {
        e.preventDefault();
        e.stopPropagation();
        isTouching = true;
        mode = which;
        
        const touch = e.touches[0];
        startY = touch.clientY;
        startStart = item.startMin;
        startEnd = item.endMin;
        item._originalDuration = item.endMin - item.startMin;
        
        if (item.owner !== 'free') {
            window._lastResize = `${item.id}-${item._originalDuration}-pending`;
        }
        
        // Visual feedback
        el.style.transform = 'scale(1.02)';
        el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
    };
    
    const onMove = e => {
        if (!mode) return;
        
        let clientY;
        if (e.touches) {
            clientY = e.touches[0].clientY;
            e.preventDefault();
        } else {
            if (isTouching) return;
            clientY = e.clientY;
        }
        
        const d = toMinDelta(clientY - startY);
        
        let newStartMin, newEndMin;
        
        if (mode === 'top') {
            newStartMin = Math.max(startMin, Math.min(startStart + d, item.endMin - 5));
            // Clamp to wake/bed bounds before rounding
            const bounds = getWakeWindowBoundaries(item);
            newStartMin = Math.max(bounds.start, Math.min(newStartMin, bounds.end - 5));
            // Snap after clamp
            newStartMin = Math.round(newStartMin/5)*5;
            newEndMin = item.endMin;
        } else {
            newEndMin = Math.max(item.startMin + 5, Math.min(startEnd + d, endMin));
            // Clamp to wake/bed bounds before rounding
            const bounds = getWakeWindowBoundaries(item);
            newEndMin = Math.max(bounds.start + 5, Math.min(newEndMin, bounds.end));
            // Snap after clamp
            newEndMin = Math.round(newEndMin/5)*5;
            // If within half step of bed, snap exactly to bed
            if (Math.abs(bounds.end - newEndMin) <= 2.5) newEndMin = bounds.end;
            newStartMin = item.startMin;
        }
        // Check for overlaps with other blocks (excluding this item)
        const hasOverlap = checkForOverlaps(item.id, newStartMin, newEndMin);
        
        if (!hasOverlap) {
            // Update the item if no overlap
            item.startMin = newStartMin;
            item.endMin = newEndMin;
            
            el.style.top = snap(minutesToY(item.startMin))+'px';
            el.style.height = Math.max(12, snap(minutesToY(item.endMin)) - snap(minutesToY(item.startMin)))+'px';
            
            if (rangeLabelEl && item.kind==='range') {
                rangeLabelEl.textContent = `${item.title || 'Free'}: ${fmt(item.startMin)} - ${fmt(item.endMin)}`;
            }
            if (pointTimeEl && item.kind==='point') {
                pointTimeEl.textContent = `${item.title || ''}: ${fmt(item.startMin)}`;
            }
        }
    };
    
    const onUp = () => { 
        if (!mode) return;
        mode = null; 
        isTouching = false;
        
        // Remove visual feedback
        el.style.transform = '';
        el.style.boxShadow = '';
        
        // Check if duration changed and update progress tracker if needed
        const newDuration = item.endMin - item.startMin;
        if (item._originalDuration !== newDuration && item.owner !== 'free') {
            const pendingKey = `${item.id}-${item._originalDuration}-pending`;
            if (window._lastResize === pendingKey) {
                const finalKey = `${item.id}-${item._originalDuration}-${newDuration}`;
                window._lastResize = finalKey;
                
                if (item.owner === 'jeff') {
                    window.jeffLoggedMinutes = Math.max(0, (window.jeffLoggedMinutes || 0) - item._originalDuration + newDuration);
                } else if (item.owner === 'john') {
                    window.johnLoggedMinutes = Math.max(0, (window.johnLoggedMinutes || 0) - item._originalDuration + newDuration);
                }
            }
        }
        
        updateProgressDisplay();
    };
    
    // Bind events based on device capability
    if (isTouchDevice()) {
        // Make handles larger for touch
        ht.style.height = '24px';
        ht.style.top = '-12px';
        hb.style.height = '24px'; 
        hb.style.bottom = '-12px';
        
        ht.addEventListener('touchstart', onTouchStart('top'), { passive: false });
        hb.addEventListener('touchstart', onTouchStart('bottom'), { passive: false });
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onUp);
        window.addEventListener('touchcancel', onUp);
    } else {
        ht.addEventListener('pointerdown', onMouseDown('top'));
        hb.addEventListener('pointerdown', onMouseDown('bottom'));
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    }
}

// WAKE WINDOW BOUNDARY FUNCTION
function getWakeWindowBoundaries(item) {
    // Inclusive wake/bed boundaries; prevent crossing bed and pre-wake
    const wake = (window.v1Items || []).find(i => i.id === 'wake');
    const bed  = (window.v1Items || []).find(i => i.id === 'bed');
    const start = wake ? wake.startMin : 5*60;
    const end   = bed  ? bed.startMin  : 22*60;
    return { start, end };
}
// OVERLAP DETECTION
function checkForOverlaps(excludeId, startMin, endMin) {
    const otherBlocks = window.v1Items?.filter(item => item.id !== excludeId) || [];
    
    for (const block of otherBlocks) {
        if (block.kind === 'point') {
            if (block.id === 'wake') {
                if (startMin < block.startMin) {
                    return true; // Overlap detected - trying to place block before wake time
                }
            } else if (block.id === 'bed') {
                if (endMin > block.startMin) {
                    return true; // Overlap detected - trying to place block at or after bed time
                }
            }
            else if (startMin < block.endMin && endMin > block.startMin) {
                return true; // Overlap detected
            }
        } else {
            if (startMin < block.endMin && endMin > block.startMin) {
                return true; // Overlap detected
            }
        }
    }
    
    return false; // No overlap
}

// VALIDATE AND FIX EXISTING BLOCKS
function validateAndFixExistingBlocks() {
    if (!window.v1Items) return;
    
    const wakeTime = window.v1Items.find(item => item.id === 'wake');
    const bedTime = window.v1Items.find(item => item.id === 'bed');
    
    if (!wakeTime || !bedTime) return;
    
    const blocksToFix = [];
    window.v1Items.forEach(item => {
        if (!item.isDefault && item.kind !== 'point') {
            let needsFix = false;
            let newStartMin = item.startMin;
            let newEndMin = item.endMin;
            
            if (item.startMin < wakeTime.startMin) {
                newStartMin = wakeTime.startMin;
                needsFix = true;
            }
            
            if (item.endMin > bedTime.startMin) {
                newEndMin = bedTime.startMin;
                needsFix = true;
            }
            
            if (newStartMin >= newEndMin) {
                blocksToFix.push({ item, action: 'remove' });
            } else if (needsFix) {
                blocksToFix.push({ item, action: 'fix', newStartMin, newEndMin });
            }
        }
    });
    
    blocksToFix.forEach(({ item, action, newStartMin, newEndMin }) => {
        if (action === 'remove') {
            const index = window.v1Items.indexOf(item);
            if (index > -1) {
                window.v1Items.splice(index, 1);
            }
        } else if (action === 'fix') {
            item.startMin = newStartMin;
            item.endMin = newEndMin;
        }
    });
}

// RESET ALL DATA
function resetAllData() {
    if (!confirm('Are you sure you want to reset all data? This will restore all defaults and clear any custom blocks.')) {
        return;
    }
    
    // Reset progress tracking
    window.jeffLoggedMinutes = 0;
    window.johnLoggedMinutes = 0;
    
    // Reset settings to defaults
    document.getElementById('jeffExtra').value = 0;
    document.getElementById('johnExtra').value = 25;
    
    // Reset day mode to Full
    const fullBtn = document.querySelector('.toggle-btn[data-mode="full"]');
    const partialBtn = document.querySelector('.toggle-btn[data-mode="partial"]');
    if (fullBtn && partialBtn) {
        fullBtn.classList.add('active');
        partialBtn.classList.remove('active');
    }
    
    // Remove any partial day free block
    const partialDayBlock = window.v1Items?.find(item => item.id === 'partial-day-free');
    if (partialDayBlock) {
        const index = window.v1Items.indexOf(partialDayBlock);
        if (index > -1) {
            window.v1Items.splice(index, 1);
        }
    }
    
    // Clear ALL existing items first
    window.v1Items = [];
    
    // Add default items
    window.v1Items.push(
        {
            id: 'wake',
            title: 'Wake',
            kind: 'point',
            owner: 'free',
            startMin: 7 * 60 + 15, // 7:15 AM
            endMin: 7 * 60 + 15,
            isDefault: true
        }
        ,
        {
            id: 'def-jeff-1',
            title: 'Jeff shift',
            kind: 'range',
            owner: 'jeff',
            startMin: 7 * 60 + 15,
            endMin: 9 * 60 + 25,
            isDefault: true
        },
        {
            id: 'def-john-1',
            title: 'John shift',
            kind: 'range',
            owner: 'john',
            startMin: 9 * 60 + 25,
            endMin: 9 * 60 + 50,
            isDefault: true
        }
,
        {
            id: 'nap1',
            title: 'First nap',
            kind: 'range',
            owner: 'free',
            startMin: 9 * 60 + 50, // 9:50 AM
            endMin: 11 * 60,       // 11:00 AM
            isDefault: true
        },
        {
            id: 'nap2',
            title: 'Second nap',
            kind: 'range',
            owner: 'free',
            startMin: 14 * 60 + 50, // 2:50 PM
            endMin: 16 * 60 + 20,   // 4:20 PM
            isDefault: true
        },
        {
            id: 'bed',
            title: 'Bed',
            kind: 'point',
            owner: 'free',
            startMin: 19 * 60 + 50, // 7:50 PM
            endMin: 19 * 60 + 50,
            isDefault: true
        }
    );
    
    // Mark as seeded to prevent renderTimeline from adding duplicates
    window.v1Items._seeded = true;
    
    // Reset shift log dropdowns to defaults
    const jeffStart = document.getElementById('jeffCustomStart');
    const jeffEnd = document.getElementById('jeffCustomEnd');
    const johnStart = document.getElementById('johnCustomStart');
    const johnEnd = document.getElementById('johnCustomEnd');
    const freeStart = document.getElementById('freeCustomStart');
    const freeEnd = document.getElementById('freeCustomEnd');
    
    if (jeffStart && jeffEnd) {
        jeffStart.value = '07:15';
        jeffEnd.value = '09:50';
    }
    if (johnStart && johnEnd) {
        johnStart.value = '11:00';
        johnEnd.value = '13:00';
    }
    if (freeStart && freeEnd) {
        freeStart.value = '11:00';
        freeEnd.value = '14:50';
    }
    
    // Re-render timeline and update progress
    renderTimeline();
    updateProgressDisplay();
    
    const jeEl = document.getElementById('jeffExtra'); 
    const joEl = document.getElementById('johnExtra');
    if (jeEl) jeEl.value = '-25';
    if (joEl) joEl.value = '25';
    updateProgressDisplay();
    showNotification('success', 'Reset Complete', 'All data has been reset to defaults.');
}

// PROGRESS TRACKING CALCULATIONS
function calculateProjectedWakeTime() {
    const wakeItem = window.v1Items?.find(item => item.isDefault && item.id === 'wake');
    const bedItem = window.v1Items?.find(item => item.isDefault && item.id === 'bed');
    
    if (wakeItem && bedItem) {
        return bedItem.startMin - wakeItem.startMin;
    }
    
    // Fallback
    return 12 * 60 + 35; // 12 hours 35 minutes default
}

function calculateProjectedNapTime() {
    const allUnavailableItems = window.v1Items?.filter(item => {
        if (item.id === 'wake' || item.id === 'bed') return false;
        if (item.id === 'nap1' || item.id === 'nap2' || item.title?.toLowerCase().includes('nap')) return true;
        if (item.owner === 'free') return true;
        if (item.owner !== 'jeff' && item.owner !== 'john') return true;
        return false;
    }) || [];
    
    return allUnavailableItems.reduce((total, item) => total + (item.endMin - item.startMin), 0);
}

function calculateTargetTime() {
    const totalWakeTime = calculateProjectedWakeTime();
    const totalUnavailableTime = calculateProjectedNapTime();
    const availableTime = totalWakeTime - totalUnavailableTime;

    const jeffExtraEl = document.getElementById('jeffExtra');
    const johnExtraEl = document.getElementById('johnExtra');
    const jeffExtra = parseInt(jeffExtraEl?.value || '0') || 0;
    const johnExtra = parseInt(johnExtraEl?.value || '0') || 0;

    // Zero-sum: one parent's extra is subtracted from the other
    // We treat 'johnExtra' as the canonical shift and expect jeffExtra === -johnExtra via listeners
    const shift = johnExtra;

    const baseTime = availableTime / 2;
    const jeffTarget = Math.max(0, baseTime - shift);
    const johnTarget = Math.max(0, baseTime + shift);

    return { jeffTarget, johnTarget, availableTime, totalWakeTime, totalUnavailableTime };
}

function recalculateLoggedTimeFromTimeline() {
    window.jeffLoggedMinutes = 0;
    window.johnLoggedMinutes = 0;
    
    const jeffBlocks = window.v1Items?.filter(item => item.owner === 'jeff') || [];
    const johnBlocks = window.v1Items?.filter(item => item.owner === 'john') || [];
    
    jeffBlocks.forEach(block => {
        window.jeffLoggedMinutes += block.endMin - block.startMin;
    });
    
    johnBlocks.forEach(block => {
        window.johnLoggedMinutes += block.endMin - block.startMin;
    });
    
    window.jeffLoggedMinutes = Math.max(0, window.jeffLoggedMinutes);
    window.johnLoggedMinutes = Math.max(0, window.johnLoggedMinutes);
}

function updateProgressDisplay() {
    recalculateLoggedTimeFromTimeline();
    
    const { jeffTarget, johnTarget, availableTime, totalWakeTime, totalUnavailableTime } = calculateTargetTime();
    
    const jeffLogged = window.jeffLoggedMinutes || 0;
    const johnLogged = window.johnLoggedMinutes || 0;
    
    const jeffRemaining = Math.max(0, jeffTarget - jeffLogged);
    const johnRemaining = Math.max(0, johnTarget - johnLogged);
    
    const jeffProgress = jeffTarget > 0 ? Math.max(0, (jeffLogged / jeffTarget) * 100) : 0;
    const johnProgress = johnTarget > 0 ? Math.max(0, (johnLogged / johnTarget) * 100) : 0;
    
    const totalLoggedTime = jeffLogged + johnLogged;
    const remainingProjectedWakeTime = Math.max(0, availableTime - totalLoggedTime);
    
    updateProgressElement('totalProjectedWakeTime', availableTime);
    updateProgressElement('remainingProjectedWakeTime', remainingProjectedWakeTime);
    updateProgressElement('jeffLogged', jeffLogged);
    updateProgressElement('jeffRemaining', jeffRemaining);
    updateProgressElement('jeffProgressText', `${Math.round(jeffProgress)}%`);
    updateProgressElement('johnLogged', johnLogged);
    updateProgressElement('johnRemaining', johnRemaining);
    updateProgressElement('johnProgressText', `${Math.round(johnProgress)}%`);
    
    const jeffProgressBar = document.querySelector('.jeff-progress');
    const johnProgressBar = document.querySelector('.john-progress');
    
    if (jeffProgressBar) {
        jeffProgressBar.style.width = `${jeffProgress}%`;
    }
    
    if (johnProgressBar) {
        johnProgressBar.style.width = `${johnProgress}%`;
    }
}

function updateProgressElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        let displayText;
        if (id.includes('Progress')) {
            displayText = value;
        } else if (value >= 60) {
            const hours = Math.floor(value / 60);
            const minutes = value % 60;
            if (minutes === 0) {
                displayText = `${hours}h`;
            } else {
                displayText = `${hours}h ${minutes}m`;
            }
        } else {
            displayText = `${value}m`;
        }
        
        element.textContent = displayText;
    }
}

// SHIFT LOG FUNCTIONS
function addCustom(person) {
    let startSelect, endSelect;
    let owner;
    
    if (person === 'Jeff') {
        startSelect = document.getElementById('jeffCustomStart');
        endSelect = document.getElementById('jeffCustomEnd');
        owner = 'jeff';
    } else if (person === 'John') {
        startSelect = document.getElementById('johnCustomStart');
        endSelect = document.getElementById('johnCustomEnd');
        owner = 'john';
    } else if (person === 'Free') {
        startSelect = document.getElementById('freeCustomStart');
        endSelect = document.getElementById('freeCustomEnd');
        owner = 'free';
    } else {
        return;
    }
    
    if (!startSelect || !endSelect) {
        showNotification('error', 'System Error', 'Unable to find time selection elements. Please refresh the page and try again.');
        return;
    }
    
    const startTime = startSelect.value;
    const endTime = endSelect.value;
    
    if (!startTime || !endTime) {
        showNotification('error', 'Time Not Selected', 'Please select both start and end times for the shift.');
        return;
    }
    
    const startMin = timeStringToMinutes(startTime);
    const endMin = timeStringToMinutes(endTime);
    
    if (startMin >= endMin) {
        showNotification('error', 'Invalid Time Range', 'Start time must be before end time. Please adjust your selection.');
        return;
    }
    
    const hasOverlap = checkForOverlaps(null, startMin, endMin);
    if (hasOverlap) {
        showNotification('error', 'Cannot Add Shift', 'There is an existing block in this time window. Please choose a different time or remove the conflicting block.');
        return;
    }
    
    const newShift = {
        id: 'item-' + Date.now(),
        title: `${person}'s Shift`,
        kind: 'range',
        owner: owner,
        startMin: startMin,
        endMin: endMin,
        isDefault: false
    };
    
    window.v1Items.push(newShift);
    
    if (owner === 'jeff' || owner === 'john') {
        const duration = endMin - startMin;
        if (owner === 'jeff') {
            window.jeffLoggedMinutes = (window.jeffLoggedMinutes || 0) + duration;
        } else if (owner === 'john') {
            window.johnLoggedMinutes = (window.johnLoggedMinutes || 0) + duration;
        }
    }
    
    renderTimeline();
    updateProgressDisplay();
    
    showNotification('success', 'Shift Added', `${person}'s shift has been added to the timeline.`);
}

function addPreset(person, startTime, endTime) {
    let owner;
    
    if (person === 'Jeff') {
        owner = 'jeff';
    } else if (person === 'John') {
        owner = 'john';
    } else if (person === 'Free') {
        owner = 'free';
    } else {
        return;
    }
    
    const startMin = timeStringToMinutes(startTime);
    const endMin = timeStringToMinutes(endTime);
    
    if (startMin >= endMin) {
        showNotification('error', 'Invalid Time Range', 'Start time must be before end time. Please adjust your selection.');
        return;
    }
    
    const hasOverlap = checkForOverlaps(null, startMin, endMin);
    if (hasOverlap) {
        showNotification('error', 'Cannot Add Shift', 'There is an existing block in this time window. Please choose a different time or remove the conflicting block.');
        return;
    }
    
    const newShift = {
        id: 'item-' + Date.now(),
        title: `${person}'s Shift`,
        kind: 'range',
        owner: owner,
        startMin: startMin,
        endMin: endMin,
        isDefault: false
    };
    
    window.v1Items.push(newShift);
    
    if (owner === 'jeff' || owner === 'john') {
        const duration = endMin - startMin;
        if (owner === 'jeff') {
            window.jeffLoggedMinutes = (window.jeffLoggedMinutes || 0) + duration;
        } else if (owner === 'john') {
            window.johnLoggedMinutes = (window.johnLoggedMinutes || 0) + duration;
        }
    }
    
    renderTimeline();
    updateProgressDisplay();
    
    showNotification('success', 'Shift Added', `${person}'s shift has been added to the timeline.`);
}

// DAY MODE TOGGLE FUNCTIONALITY
function initializeDayModeToggle() {
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const mode = this.getAttribute('data-mode');
            
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            handleDayModeChange(mode);
        });
    });
}

function handleDayModeChange(mode) {
    if (mode === 'partial') {
        createPartialDayFreeBlock();
    } else {
        removePartialDayFreeBlock();
    }
}

function createPartialDayFreeBlock() {
    const existingBlock = window.v1Items?.find(item => item.id === 'partial-day-free');
    if (existingBlock) return;
    
    const startMin = 11 * 60; // 11:00 AM
    const endMin = 14 * 60 + 50; // 2:50 PM
    
    const freeBlock = {
        id: 'partial-day-free',
        title: 'Free (Partial Day)',
        kind: 'range',
        owner: 'free',
        startMin: startMin,
        endMin: endMin,
        isDefault: false
    };
    
    
    // Prevent overlap when toggling to partial
    if (typeof checkForOverlaps === 'function' && checkForOverlaps(null, freeBlock.startMin, freeBlock.endMin)) {
        showNotification('error','Overlap','Cannot add Partial Day block: it overlaps an existing block.');
        return;
    }
window.v1Items.push(freeBlock);
    
    renderTimeline();
    updateProgressDisplay();
}

function removePartialDayFreeBlock() {
    const blockIndex = window.v1Items?.findIndex(item => item.id === 'partial-day-free');
    if (blockIndex !== -1) {
        window.v1Items.splice(blockIndex, 1);
        
        renderTimeline();
        updateProgressDisplay();
    }
}

// INITIALIZATION
window.onload = function() {
    state.schedule = getCurrentSchedule();
    
    // Populate 5-min dropdowns
    function fillSelect(id, startMin, endMin) {
        const sel = document.getElementById(id);
        if (!sel) return;
        sel.innerHTML = '';
        for (let t=startMin; t<=endMin; t+=5) {
            const h = Math.floor(t/60), m = t%60;
            const v = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
            const opt = document.createElement('option');
            opt.value = v;
            opt.textContent = fromMinutes(t);
            sel.appendChild(opt);
        }
    }
    
    // Minutes constants
    const m = x => x*60;
    fillSelect('wakeTime', m(6), m(9)); // 6AM-9AM
    fillSelect('firstNapStart', m(9), m(13)); // 9AM-1PM
    fillSelect('firstNapEnd', m(9), m(13));
    fillSelect('secondNapStart', m(13), m(17)); // 1PM-5PM
    fillSelect('secondNapEnd', m(13), m(17));
    fillSelect('bedTime', m(18), m(21)+30); // 6PM-9:30PM
    
    // Populate shift log dropdowns (full day range 6AM-9PM)
    fillSelect('jeffCustomStart', m(6), m(21)); // 6AM-9PM
    fillSelect('jeffCustomEnd', m(6), m(21));
    fillSelect('johnCustomStart', m(6), m(21)); // 6AM-9PM
    fillSelect('johnCustomEnd', m(6), m(21));
    fillSelect('freeCustomStart', m(6), m(21)); // 6AM-9PM
    fillSelect('freeCustomEnd', m(6), m(21));
    
    // Set extras minutes
    if (document.getElementById('jeffExtra')) document.getElementById('jeffExtra').value = 0;
    if (document.getElementById('johnExtra')) document.getElementById('johnExtra').value = 25;
    
    // Initialize day mode toggle
    initializeDayModeToggle();
    
    // Initialize progress tracking variables
    window.jeffLoggedMinutes = 0;
    window.johnLoggedMinutes = 0;
    
    // Initialize progress bars with default widths
    const jeffBar = document.querySelector('.jeff-progress');
    const johnBar = document.querySelector('.john-progress');
    if (jeffBar) {
        jeffBar.style.width = '0%';
    }
    if (johnBar) {
        johnBar.style.width = '0%';
    }

    // Render V1 timeline
    renderTimeline();
    
    // Initialize progress tracking system
    updateProgressDisplay();
    
    // Re-render on resize for pixel-perfect alignment
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(renderTimeline, 100);
    });
    
    // ResizeObserver for container changes
    const daily = document.querySelector('#daily-module .widget-content.v1-daily');
    if (window.ResizeObserver && daily) {
        const ro = new ResizeObserver(() => renderTimeline());
        ro.observe(daily);
    }
};

/* ============================
   PERSISTENCE MODULE (LOCAL v4)
   Goal:
   - Keep items + extras + dayMode across refresh
   - Restore AFTER app init, without being clobbered by first render
   - Only Reset button clears storage and seeds defaults (incl. Jeff/John)
   - Extras are zero-sum and update remaining times
   ============================ */
(function(){
  const KEY = "bcc_v1_state";
  // If a state already exists, prevent initial renders from saving over it
  let suppressBootSaves = false;
  try { suppressBootSaves = !!localStorage.getItem(KEY); } catch {}

  function getDayMode(){
    const active = document.querySelector('.toggle-btn.active');
    return active?.getAttribute('data-mode') || 'full';
  }
  function setDayMode(mode){
    const buttons = document.querySelectorAll('.toggle-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    const target = document.querySelector(`.toggle-btn[data-mode="${mode}"]`);
    if (target) target.classList.add('active');
    if (typeof handleDayModeChange === 'function') {
      try { handleDayModeChange(mode); } catch {}
    }
  }

  function collectState(){
    const je = document.getElementById('jeffExtra');
    const jo = document.getElementById('johnExtra');
    const extras = {
      jeff: parseInt(je?.value || '-25') || -25,
      john: parseInt(jo?.value || '25') || 25
    };
    const items = Array.isArray(window.v1Items) ? window.v1Items : [];
    const dayMode = getDayMode();
    return { items, extras, dayMode };
  }

  function applyState(s){
    if (!s) return;
    if (Array.isArray(s.items)) {
      window.v1Items = s.items;
      try { window.v1Items._seeded = true; } catch{}
    }
    const je = document.getElementById('jeffExtra');
    const jo = document.getElementById('johnExtra');
    if (je && typeof s.extras?.jeff === 'number') je.value = String(s.extras.jeff);
    if (jo && typeof s.extras?.john === 'number') jo.value = String(s.extras.john);
    if (s.dayMode) setDayMode(s.dayMode);
    if (typeof renderTimeline === 'function') renderTimeline();
    if (typeof updateProgressDisplay === 'function') updateProgressDisplay();
  }

  function saveState(){
    if (suppressBootSaves) return;
    try {
      const s = collectState();
      localStorage.setItem(KEY, JSON.stringify(s));
      // Notify autosync if present (avoid while importing)
      if (!(window.__sync && window.__sync.isImporting)) {
        window.dispatchEvent(new CustomEvent('bcc:stateChanged'));
      }
    } catch(e){ console.warn('[persist] save failed', e); }
  }

  function restoreState(){
    try{
      const raw = localStorage.getItem(KEY);
      if (!raw) return false;
      const s = JSON.parse(raw);
      // Mark importing so we don't trigger auto-push
      window.__sync = window.__sync || {};
      window.__sync.isImporting = true;
      try { applyState(s); } finally { window.__sync.isImporting = false; }
      suppressBootSaves = false;
      return true;
    }catch(e){ console.warn('[persist] restore failed', e); suppressBootSaves = false; return false; }
  }

  function clearState(){ try{ localStorage.removeItem(KEY); }catch{} }

  // Wire extras: zero-sum + live update
  function wireExtras(){
    const je = document.getElementById('jeffExtra');
    const jo = document.getElementById('johnExtra');
    if (!je || !jo) return;
    const clamp = v => Math.max(-180, Math.min(120, (parseInt(v)||0)));
    je.addEventListener('input', () => {
      const v = clamp(je.value);
      jo.value = String(-v);
      if (typeof updateProgressDisplay === 'function') updateProgressDisplay();
      saveState();
    });
    jo.addEventListener('input', () => {
      const v = clamp(jo.value);
      je.value = String(-v);
      if (typeof updateProgressDisplay === 'function') updateProgressDisplay();
      saveState();
    });
  }

  // Wire day-mode toggles
  function wireDayMode(){
    document.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (typeof updateProgressDisplay === 'function') updateProgressDisplay();
        saveState();
      });
    });
  }

  // Patch render to save after renders (but not during boot suppression)
  const __rt = window.renderTimeline;
  if (typeof __rt === 'function'){
    window.renderTimeline = function(){
      const out = __rt.apply(this, arguments);
      saveState();
      return out;
    };
  }
  // Patch addPreset/addCustom if present
  ['addPreset','addCustom'].forEach(fn => {
    const orig = window[fn];
    if (typeof orig === 'function'){
      window[fn] = function(){
        const out = orig.apply(this, arguments);
        saveState();
        return out;
      };
    }
  });

  // Reset integration: clear storage, then save new seeded defaults (incl. Jeff/John)
  const __reset = window.resetAllData;
  if (typeof __reset === 'function'){
    window.resetAllData = function(){
      const out = __reset.apply(this, arguments);
      clearState();
      // After reset, ensure extras default and Jeff/John defaults exist
      try {
        const je = document.getElementById('jeffExtra'); if (je) je.value = '-25';
        const jo = document.getElementById('johnExtra'); if (jo) jo.value = '25';
        // Seed defaults if missing (IDs must match to avoid dupes)
        const items = Array.isArray(window.v1Items) ? window.v1Items : (window.v1Items = []);
        const hasJeff = items.some(it => it.id === 'def-jeff-1');
        const hasJohn = items.some(it => it.id === 'def-john-1');
        if (!hasJeff) items.push({ id:'def-jeff-1', title:'Jeff shift', kind:'range', owner:'jeff', isDefault:true, startMin: 7*60+15, endMin: 9*60+25 });
        if (!hasJohn) items.push({ id:'def-john-1', title:'John shift', kind:'range', owner:'john', isDefault:true, startMin: 9*60+25, endMin: 9*60+50 });
        if (typeof renderTimeline === 'function') renderTimeline();
        if (typeof updateProgressDisplay === 'function') updateProgressDisplay();
      } catch {}
      saveState();
      return out;
    };
  }

  // Ensure imports persist locally
  (function(){
    const __origImport = window.importState;
    if (typeof __origImport === 'function'){
      window.importState = function(data){
        const out = __origImport.apply(this, arguments);
        saveState();
        return out;
      };
    }
  })();

  window.addEventListener('DOMContentLoaded', () => {
    wireExtras();
    wireDayMode();
  });

  // Run restore AFTER the app's own onload init
  const prevOnload = window.onload;
  window.onload = function(evt){
    if (typeof prevOnload === 'function') prevOnload.call(this, evt);
    const restored = restoreState();
    if (!restored) {
      // First visit: ensure defaults are saved so refresh keeps them
      try {
        // Ensure Jeff/John defaults exist on first seed (avoid dupes)
        const items = Array.isArray(window.v1Items) ? window.v1Items : (window.v1Items = []);
        const hasJeff = items.some(it => it.id === 'def-jeff-1');
        const hasJohn = items.some(it => it.id === 'def-john-1');
        if (!hasJeff) items.push({ id:'def-jeff-1', title:'Jeff shift', kind:'range', owner:'jeff', isDefault:true, startMin: 7*60+15, endMin: 9*60+25 });
        if (!hasJohn) items.push({ id:'def-john-1', title:'John shift', kind:'range', owner:'john', isDefault:true, startMin: 9*60+25, endMin: 9*60+50 });
        const je = document.getElementById('jeffExtra'); if (je) je.value = '-25';
        const jo = document.getElementById('johnExtra'); if (jo) jo.value = '25';
        if (typeof renderTimeline === 'function') renderTimeline();
        if (typeof updateProgressDisplay === 'function') updateProgressDisplay();
      } catch {}
      suppressBootSaves = false;
      saveState();
    }
  };

  // Debug helpers
  window.__persist = { saveState, restoreState, clearState };
  // Build stamp
  window.__careCalcBuild = 'PERSIST-v4-2025-09-02';
})();

