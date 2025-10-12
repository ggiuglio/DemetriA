<script>
    import { onMount } from 'svelte';
    
    // Current date state
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let selectedDate = null;
    
    // Mock events data
    const events = [
        { date: '2025-10-15', title: 'Wheat Fertilization', type: 'fertilization', field: 'North Field', time: '09:00' },
        { date: '2025-10-18', title: 'Corn Inspection', type: 'inspection', field: 'South Field', time: '14:00' },
        { date: '2025-10-20', title: 'Irrigation Schedule', type: 'irrigation', field: 'East Meadow', time: '06:00' },
        { date: '2025-10-22', title: 'Pest Control', type: 'pest-control', field: 'Home Garden', time: '10:00' },
        { date: '2025-10-25', title: 'Soil Testing', type: 'testing', field: 'West Plot', time: '11:00' },
        { date: '2025-10-28', title: 'Field Preparation', type: 'fertilization', field: 'North Field', time: '08:00' },
        { date: '2025-11-10', title: 'Barley Harvest', type: 'harvest', field: 'West Plot', time: '07:00' },
        { date: '2025-11-15', title: 'Tomato Harvest', type: 'harvest', field: 'Home Garden', time: '08:00' },
        { date: '2025-12-01', title: 'Pepper Harvest', type: 'harvest', field: 'Greenhouse Plot', time: '08:00' },
        { date: '2026-01-20', title: 'Wheat Harvest', type: 'harvest', field: 'North Field', time: '06:00' },
        { date: '2026-02-01', title: 'Soybean Harvest', type: 'harvest', field: 'East Meadow', time: '07:00' },
        { date: '2026-03-15', title: 'Corn Harvest', type: 'harvest', field: 'South Field', time: '07:00' }
    ];
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Get event type styling
    function getEventTypeStyle(type) {
        switch(type) {
            case 'harvest': return 'bg-[#f57c00] text-white';
            case 'fertilization': return 'bg-[#2e7d32] text-white';
            case 'irrigation': return 'bg-[#0277bd] text-white';
            case 'inspection': return 'bg-[#7b1fa2] text-white';
            case 'pest-control': return 'bg-[#d32f2f] text-white';
            case 'testing': return 'bg-[#558b2f] text-white';
            default: return 'bg-[#666] text-white';
        }
    }
    
    // Get events for a specific date
    function getEventsForDate(year, month, day) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(e => e.date === dateStr);
    }
    
    // Generate calendar days
    function generateCalendar(year, month) {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        let days = [];
        
        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({
                day: daysInPrevMonth - i,
                isCurrentMonth: false,
                month: month - 1,
                year: month === 0 ? year - 1 : year
            });
        }
        
        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                day: i,
                isCurrentMonth: true,
                month: month,
                year: year
            });
        }
        
        // Next month days
        const remainingDays = 42 - days.length; // 6 rows * 7 days
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                day: i,
                isCurrentMonth: false,
                month: month + 1,
                year: month === 11 ? year + 1 : year
            });
        }
        
        return days;
    }
    
    $: calendarDays = generateCalendar(currentYear, currentMonth);
    $: upcomingEvents = events
        .filter(e => new Date(e.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);
    
    function previousMonth() {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }
    }
    
    function nextMonth() {
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
        } else {
            currentMonth++;
        }
    }
    
    function goToToday() {
        const today = new Date();
        currentMonth = today.getMonth();
        currentYear = today.getFullYear();
    }
    
    function isToday(year, month, day) {
        const today = new Date();
        return year === today.getFullYear() && 
               month === today.getMonth() && 
               day === today.getDate();
    }
</script>

<div class="max-w-7xl">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-4xl font-bold pencil-text text-[#2e7d32] sketch-underline inline-block">Calendar</h2>
        <button class="sketch-button bg-[#a5d6a7] text-[#1b5e20] px-6 py-3 font-bold hover:bg-[#81c784]">
            + Add Event
        </button>
    </div>

    <!-- Calendar -->
    <div>
            <div class="sketch-box p-6 bg-white">
                <!-- Calendar Header -->
                <div class="flex justify-between items-center mb-6">
                    <button 
                        on:click={previousMonth}
                        class="sketch-button bg-[#f5f5f5] text-[#333] px-4 py-2 hover:bg-[#e0e0e0]"
                    >
                        ← Prev
                    </button>
                    <div class="text-center">
                        <h3 class="text-2xl font-bold pencil-text text-[#2e7d32]">
                            {monthNames[currentMonth]} {currentYear}
                        </h3>
                        <button 
                            on:click={goToToday}
                            class="text-sm text-[#0277bd] hover:underline mt-1"
                        >
                            Today
                        </button>
                    </div>
                    <button 
                        on:click={nextMonth}
                        class="sketch-button bg-[#f5f5f5] text-[#333] px-4 py-2 hover:bg-[#e0e0e0]"
                    >
                        Next →
                    </button>
                </div>

                <!-- Day Names -->
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 12px; margin-bottom: 8px;">
                    {#each dayNames as dayName}
                        <div class="text-center font-bold text-[#555] text-sm py-2">
                            {dayName}
                        </div>
                    {/each}
                </div>

                <!-- Calendar Grid -->
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 12px;">
                    {#each calendarDays as dayInfo}
                        {@const dayEvents = getEventsForDate(dayInfo.year, dayInfo.month, dayInfo.day)}
                        {@const isTodayDate = isToday(dayInfo.year, dayInfo.month, dayInfo.day)}
                        <div 
                            class="sketch-box p-2 hover:bg-[#f1f8e9] transition-colors cursor-pointer {isTodayDate ? 'ring-2 ring-[#2e7d32] bg-[#e8f5e9]' : ''} {dayInfo.isCurrentMonth ? (isTodayDate ? '' : 'bg-white') : 'bg-[#f5f5f5]'}"
                            style="aspect-ratio: 1; display: flex; flex-direction: column; min-height: 100px;"
                        >
                            <div class="text-sm font-semibold mb-1 {isTodayDate ? 'text-[#2e7d32] font-bold' : (dayInfo.isCurrentMonth ? 'text-[#333]' : 'text-[#999]')}">
                                {dayInfo.day}
                            </div>
                            <div class="flex-1 space-y-1 overflow-hidden">
                                {#if dayEvents.length > 0}
                                    {#each dayEvents.slice(0, 2) as event}
                                        <div class="text-[10px] px-1.5 py-1 rounded {getEventTypeStyle(event.type)} truncate leading-tight font-medium">
                                            {event.title}
                                        </div>
                                    {/each}
                                    {#if dayEvents.length > 2}
                                        <div class="text-[10px] text-[#666] font-medium">
                                            +{dayEvents.length - 2} more
                                        </div>
                                    {/if}
                                {:else}
                                    <!-- Debug: Show if no events -->
                                    <!-- <div class="text-[8px] text-gray-400">No events</div> -->
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>

                <!-- Legend -->
                <div class="mt-6 pt-4 border-t-2 border-[#333] opacity-20"></div>
                <div class="mt-4">
                    <p class="text-sm font-semibold text-[#555] mb-2">Event Types:</p>
                    <div class="flex flex-wrap gap-2">
                        <span class="text-xs px-2 py-1 rounded {getEventTypeStyle('harvest')}">Harvest</span>
                        <span class="text-xs px-2 py-1 rounded {getEventTypeStyle('fertilization')}">Fertilization</span>
                        <span class="text-xs px-2 py-1 rounded {getEventTypeStyle('irrigation')}">Irrigation</span>
                        <span class="text-xs px-2 py-1 rounded {getEventTypeStyle('inspection')}">Inspection</span>
                        <span class="text-xs px-2 py-1 rounded {getEventTypeStyle('pest-control')}">Pest Control</span>
                        <span class="text-xs px-2 py-1 rounded {getEventTypeStyle('testing')}">Testing</span>
                    </div>
                </div>
            </div>
    </div>

    <!-- Upcoming Events and Stats Below Calendar -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <!-- Upcoming Events -->
        <div>
            <div class="sketch-box p-6 bg-[#fff8e1]">
                <h3 class="text-2xl font-bold pencil-text text-[#f57c00] mb-4">📅 Upcoming Events</h3>
                <div class="space-y-3">
                    {#each upcomingEvents as event}
                        <div class="sketch-box p-4 bg-white hover:bg-[#f1f8e9] transition-colors">
                            <div class="flex items-start gap-2 mb-2">
                                <span class="text-xs px-2 py-1 rounded {getEventTypeStyle(event.type)}">
                                    {event.type.replace('-', ' ')}
                                </span>
                            </div>
                            <h4 class="font-bold text-[#333] mb-1">{event.title}</h4>
                            <p class="text-sm text-[#666] mb-1">{event.field}</p>
                            <div class="flex justify-between text-xs text-[#999]">
                                <span>📅 {event.date}</span>
                                <span>🕐 {event.time}</span>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Quick Stats -->
            <div class="sketch-box p-6 bg-[#e8f5e9] mt-6">
                <h3 class="text-xl font-bold pencil-text text-[#2e7d32] mb-4">📊 This Month</h3>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-[#555]">Total Events:</span>
                        <span class="font-bold text-[#333]">
                            {events.filter(e => {
                                const d = new Date(e.date);
                                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                            }).length}
                        </span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-[#555]">Harvests:</span>
                        <span class="font-bold text-[#f57c00]">
                            {events.filter(e => {
                                const d = new Date(e.date);
                                return e.type === 'harvest' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                            }).length}
                        </span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-[#555]">Maintenance:</span>
                        <span class="font-bold text-[#2e7d32]">
                            {events.filter(e => {
                                const d = new Date(e.date);
                                return ['fertilization', 'irrigation', 'pest-control'].includes(e.type) && 
                                       d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                            }).length}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
