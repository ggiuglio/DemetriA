<script>
    // Today's date
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    // Mock weather data for fields
    const fieldWeather = [
        { field: 'North Field', temp: 22, condition: 'Sunny', humidity: 65, wind: 12, rain: 0 },
        { field: 'South Field', temp: 21, condition: 'Partly Cloudy', humidity: 70, wind: 10, rain: 5 },
        { field: 'East Meadow', temp: 23, condition: 'Clear', humidity: 60, wind: 8, rain: 0 },
        { field: 'Home Garden', temp: 22, condition: 'Sunny', humidity: 68, wind: 11, rain: 0 }
    ];
    
    // Mock upcoming events
    const upcomingEvents = [
        { date: '2025-10-15', title: 'Wheat Fertilization', type: 'fertilization', field: 'North Field', time: '09:00', daysUntil: 2 },
        { date: '2025-10-18', title: 'Corn Inspection', type: 'inspection', field: 'South Field', time: '14:00', daysUntil: 5 },
        { date: '2025-10-20', title: 'Irrigation Schedule', type: 'irrigation', field: 'East Meadow', time: '06:00', daysUntil: 7 },
        { date: '2025-10-22', title: 'Pest Control', type: 'pest-control', field: 'Home Garden', time: '10:00', daysUntil: 9 },
        { date: '2025-10-25', title: 'Soil Testing', type: 'testing', field: 'West Plot', time: '11:00', daysUntil: 12 }
    ];
    
    function getWeatherIcon(condition) {
        switch(condition) {
            case 'Sunny': case 'Clear': return '☀️';
            case 'Partly Cloudy': return '⛅';
            case 'Cloudy': return '☁️';
            case 'Rainy': return '🌧️';
            default: return '🌤️';
        }
    }
    
    function getEventTypeColor(type) {
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
</script>

<div class="max-w-7xl">
    <div class="mb-6">
        <h2 class="text-4xl font-bold pencil-text text-[#2e7d32] sketch-underline inline-block">Today</h2>
        <p class="text-lg text-[#666] mt-2">{dateStr}</p>
    </div>
    
    <!-- Weather Forecast Section -->
    <div class="mb-8">
        <h3 class="text-2xl font-bold pencil-text text-[#0277bd] mb-4">🌤️ Weather Forecast by Field</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {#each fieldWeather as weather}
                <div class="sketch-box p-5 bg-white hover:bg-[#e1f5fe] transition-colors">
                    <h4 class="font-bold text-[#333] mb-3">{weather.field}</h4>
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-4xl">{getWeatherIcon(weather.condition)}</span>
                        <span class="text-3xl font-bold pencil-text text-[#0277bd]">{weather.temp}°C</span>
                    </div>
                    <p class="text-sm text-[#555] mb-3">{weather.condition}</p>
                    <div class="space-y-1 text-xs text-[#666]">
                        <div class="flex justify-between">
                            <span>💧 Humidity:</span>
                            <span class="font-semibold">{weather.humidity}%</span>
                        </div>
                        <div class="flex justify-between">
                            <span>💨 Wind:</span>
                            <span class="font-semibold">{weather.wind} km/h</span>
                        </div>
                        <div class="flex justify-between">
                            <span>🌧️ Rain:</span>
                            <span class="font-semibold">{weather.rain}%</span>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <!-- Upcoming Events Section -->
    <div>
        <h3 class="text-2xl font-bold pencil-text text-[#f57c00] mb-4">📅 Upcoming Events</h3>
        <div class="sketch-box p-6 bg-[#fff8e1]">
            <div class="space-y-3">
                {#each upcomingEvents as event}
                    <div class="sketch-box p-4 bg-white hover:bg-[#f1f8e9] transition-colors">
                        <div class="flex items-start justify-between gap-4">
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="text-xs px-2 py-1 rounded {getEventTypeColor(event.type)}">
                                        {event.type.replace('-', ' ')}
                                    </span>
                                    <span class="text-xs text-[#666]">in {event.daysUntil} days</span>
                                </div>
                                <h4 class="font-bold text-[#333] mb-1">{event.title}</h4>
                                <p class="text-sm text-[#666]">{event.field}</p>
                            </div>
                            <div class="text-right text-sm">
                                <p class="text-[#666]">{event.date}</p>
                                <p class="text-[#999] text-xs">{event.time}</p>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>
