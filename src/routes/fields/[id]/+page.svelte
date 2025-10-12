<script>
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import GoogleMap from '$lib/GoogleMap.svelte';
    
    // Mock data - in real app this would come from a database
    const allFields = [
        { id: 1, type: 'agriculture', name: 'North Field', size: 12.5, unit: 'ha', crop: 'Wheat', status: 'Growing', plantedDate: '2024-03-15', expectedHarvest: '2024-07-20', soilType: 'Loamy', pH: 6.8, stoniness: 'Low', drainage: 'Good', irrigation: 'Sprinkler', notes: 'Good drainage, needs regular monitoring for pests.', lat: 41.9028, lng: 12.4964, address: 'Via Appia Antica, 00179 Roma RM, Italy' },
        { id: 2, type: 'agriculture', name: 'South Field', size: 8.3, unit: 'ha', crop: 'Corn', status: 'Planted', plantedDate: '2024-04-01', expectedHarvest: '2024-08-15', soilType: 'Clay', pH: 7.2, stoniness: 'Medium', drainage: 'Moderate', irrigation: 'Drip', notes: 'Recently fertilized.', lat: 41.8902, lng: 12.4922, address: 'Via di Tor Carbone, 00179 Roma RM, Italy' },
        { id: 3, type: 'agriculture', name: 'East Meadow', size: 15.0, unit: 'ha', crop: 'Soybeans', status: 'Growing', plantedDate: '2024-03-20', expectedHarvest: '2024-08-01', soilType: 'Sandy Loam', pH: 6.5, stoniness: 'Low', drainage: 'Excellent', irrigation: 'Rain-fed', notes: 'Organic certification pending.', lat: 41.9045, lng: 12.5100, address: 'Via Tuscolana, 00181 Roma RM, Italy' },
        { id: 4, type: 'garden', name: 'Home Garden', size: 250, unit: 'm²', crop: 'Tomatoes', status: 'Growing', plantedDate: '2024-04-10', expectedHarvest: '2024-06-15', soilType: 'Rich Loam', pH: 6.9, stoniness: 'Very Low', drainage: 'Good', irrigation: 'Manual', notes: 'Heirloom varieties, needs daily watering.', lat: 41.9000, lng: 12.5000, address: 'Via Casilina, 00182 Roma RM, Italy' },
        { id: 5, type: 'garden', name: 'Greenhouse Plot', size: 180, unit: 'm²', crop: 'Peppers', status: 'Planted', plantedDate: '2024-04-05', expectedHarvest: '2024-07-01', soilType: 'Potting Mix', pH: 6.3, stoniness: 'None', drainage: 'Excellent', irrigation: 'Automated Drip', notes: 'Climate controlled environment.', lat: 41.8980, lng: 12.4980, address: 'Via Ardeatina, 00154 Roma RM, Italy' },
        { id: 6, type: 'agriculture', name: 'West Plot', size: 6.2, unit: 'ha', crop: 'Barley', status: 'Harvested', plantedDate: '2024-02-01', expectedHarvest: '2024-06-10', soilType: 'Silty', pH: 7.0, stoniness: 'High', drainage: 'Poor', irrigation: 'Rain-fed', notes: 'Harvest completed successfully.', lat: 41.8950, lng: 12.4850, address: 'Via Laurentina, 00142 Roma RM, Italy' }
    ];
    
    $: fieldId = parseInt($page.params.id);
    $: field = allFields.find(f => f.id === fieldId);
    
    // Weather data - in real app this would come from weather API
    const weatherData = {
        precipitation: {
            lastWeek: 12.5,    // mm
            lastMonth: 45.2,   // mm
            lastYear: 687.3    // mm
        },
        solarRadiation: {
            lastWeek: 156.8,   // MJ/m²
            lastMonth: 642.5,  // MJ/m²
            lastYear: 7845.2   // MJ/m²
        }
    };
    
    let selectedWeatherPeriod = 'week';
    
    // Mock activity log
    const activities = [
        { date: '2024-05-01', type: 'Fertilization', description: 'Applied organic fertilizer', user: 'John' },
        { date: '2024-04-20', type: 'Irrigation', description: 'Adjusted irrigation schedule', user: 'Sarah' },
        { date: '2024-04-15', type: 'Inspection', description: 'Pest inspection - all clear', user: 'Mike' },
        { date: '2024-04-01', type: 'Planting', description: 'Seeds planted', user: 'John' }
    ];
</script>

{#if !field}
    <div class="max-w-4xl">
        <div class="sketch-box p-8 bg-white text-center">
            <h2 class="text-3xl font-bold pencil-text text-[#d32f2f] mb-4">Field Not Found</h2>
            <p class="text-[#555] mb-6">The field you're looking for doesn't exist.</p>
            <button 
                on:click={() => goto('/fields')}
                class="sketch-button bg-[#a5d6a7] text-[#1b5e20] px-6 py-3 font-bold hover:bg-[#81c784]"
            >
                ← Back to Fields
            </button>
        </div>
    </div>
{:else}
    <div class="max-w-6xl">
        <!-- Header -->
        <div class="flex justify-between items-start mb-6">
            <div>
                <button 
                    on:click={() => goto('/fields')}
                    class="text-[#2e7d32] hover:underline mb-2 flex items-center gap-2"
                >
                    ← Back to Fields
                </button>
                <h2 class="text-4xl font-bold pencil-text text-[#2e7d32] sketch-underline inline-block">
                    {field.name}
                </h2>
                <div class="flex gap-2 mt-3">
                    <span class="sketch-button bg-{field.type === 'agriculture' ? '[#fff8e1]' : '[#e1f5fe]'} text-{field.type === 'agriculture' ? '[#f57c00]' : '[#0277bd]'} px-3 py-1 text-sm">
                        {field.type === 'agriculture' ? '🌾 Agriculture' : '🥕 Garden'}
                    </span>
                    <span class="sketch-button bg-[#e8f5e9] text-[#2e7d32] px-3 py-1 text-sm">
                        {field.status}
                    </span>
                </div>
            </div>
            <div class="flex gap-2">
                <button class="sketch-button bg-[#fff8e1] text-[#333] px-5 py-3 font-semibold hover:bg-[#ffecb3]">
                    Edit Field
                </button>
                <button class="sketch-button bg-[#ffebee] text-[#c62828] px-5 py-3 font-semibold hover:bg-[#ffcdd2]">
                    Delete
                </button>
            </div>
        </div>

        <!-- Main Info Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="sketch-box p-5 bg-white">
                <p class="text-sm text-[#555] mb-1">Size</p>
                <p class="font-bold text-[#2e7d32] text-3xl pencil-text">{field.size} {field.unit}</p>
            </div>
            <div class="sketch-box p-5 bg-white">
                <p class="text-sm text-[#555] mb-1">Current Crop</p>
                <p class="font-bold text-[#2e7d32] text-3xl pencil-text">{field.crop}</p>
            </div>
            <div class="sketch-box p-5 bg-white">
                <p class="text-sm text-[#555] mb-1">Soil Type</p>
                <p class="font-bold text-[#2e7d32] text-3xl pencil-text">{field.soilType}</p>
            </div>
        </div>

        <!-- Soil Details Section -->
        <div class="sketch-box p-6 bg-[#fff8e1] mb-6">
            <h3 class="text-2xl font-bold pencil-text text-[#f57c00] mb-4">🌱 Soil Details</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                    <p class="text-sm text-[#555] mb-1">Soil Type</p>
                    <p class="font-bold text-[#333] text-xl">{field.soilType}</p>
                </div>
                <div>
                    <p class="text-sm text-[#555] mb-1">pH Level</p>
                    <p class="font-bold text-[#333] text-xl">{field.pH}</p>
                    <p class="text-xs text-[#666] mt-1">
                        {#if field.pH < 6.0}
                            Acidic
                        {:else if field.pH > 7.5}
                            Alkaline
                        {:else}
                            Neutral
                        {/if}
                    </p>
                </div>
                <div>
                    <p class="text-sm text-[#555] mb-1">Stoniness</p>
                    <p class="font-bold text-[#333] text-xl">{field.stoniness}</p>
                </div>
                <div>
                    <p class="text-sm text-[#555] mb-1">Drainage</p>
                    <p class="font-bold text-[#333] text-xl">{field.drainage}</p>
                </div>
            </div>
        </div>

        <!-- Map Section -->
        <div class="sketch-box p-6 bg-white mb-6">
            <h3 class="text-2xl font-bold pencil-text text-[#2e7d32] mb-4">📍 Field Location</h3>
            <div class="h-[400px]">
                <GoogleMap 
                    latitude={field.lat} 
                    longitude={field.lng} 
                    zoom={15}
                    fieldName={field.name}
                />
            </div>
            <div class="mt-4 space-y-2">
                <div class="flex items-start gap-2">
                    <span class="font-semibold text-[#555] text-sm">Address:</span>
                    <span class="text-[#333] text-sm flex-1">{field.address}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="font-semibold text-[#555] text-sm">Coordinates:</span>
                    <span class="text-[#333] text-sm">{field.lat.toFixed(4)}°N, {field.lng.toFixed(4)}°E</span>
                </div>
                <div class="mt-3">
                    <a 
                        href="https://www.google.com/maps/search/?api=1&query={field.lat},{field.lng}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="sketch-button bg-[#e8f5e9] text-[#2e7d32] px-4 py-2 text-sm inline-flex items-center gap-2 hover:bg-[#c8e6c9]"
                    >
                        🗺️ Open in Google Maps
                    </a>
                </div>
            </div>
        </div>

        <!-- Weather Data Section -->
        <div class="sketch-box p-6 bg-[#e1f5fe] mb-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-2xl font-bold pencil-text text-[#0277bd]">🌤️ Weather Data</h3>
                <div class="flex gap-2">
                    <button 
                        on:click={() => selectedWeatherPeriod = 'week'}
                        class="sketch-button px-3 py-1 text-sm {selectedWeatherPeriod === 'week' ? 'bg-[#0277bd] text-white' : 'bg-white text-[#333]'}"
                    >
                        Week
                    </button>
                    <button 
                        on:click={() => selectedWeatherPeriod = 'month'}
                        class="sketch-button px-3 py-1 text-sm {selectedWeatherPeriod === 'month' ? 'bg-[#0277bd] text-white' : 'bg-white text-[#333]'}"
                    >
                        Month
                    </button>
                    <button 
                        on:click={() => selectedWeatherPeriod = 'year'}
                        class="sketch-button px-3 py-1 text-sm {selectedWeatherPeriod === 'year' ? 'bg-[#0277bd] text-white' : 'bg-white text-[#333]'}"
                    >
                        Year
                    </button>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Precipitation -->
                <div class="sketch-box p-5 bg-white">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">💧</span>
                        <h4 class="text-xl font-bold text-[#0277bd]">Precipitation</h4>
                    </div>
                    <div class="text-center">
                        {#if selectedWeatherPeriod === 'week'}
                            <p class="text-4xl font-bold pencil-text text-[#333]">{weatherData.precipitation.lastWeek}</p>
                            <p class="text-sm text-[#555] mt-1">mm in last 7 days</p>
                        {:else if selectedWeatherPeriod === 'month'}
                            <p class="text-4xl font-bold pencil-text text-[#333]">{weatherData.precipitation.lastMonth}</p>
                            <p class="text-sm text-[#555] mt-1">mm in last 30 days</p>
                        {:else}
                            <p class="text-4xl font-bold pencil-text text-[#333]">{weatherData.precipitation.lastYear}</p>
                            <p class="text-sm text-[#555] mt-1">mm in last 365 days</p>
                        {/if}
                    </div>
                    <div class="mt-4 pt-4 border-t-2 border-[#333] opacity-20"></div>
                    <div class="mt-3 text-xs text-[#666]">
                        <p><strong>Status:</strong> 
                            {#if selectedWeatherPeriod === 'week' && weatherData.precipitation.lastWeek < 10}
                                Low - Consider irrigation
                            {:else if selectedWeatherPeriod === 'week' && weatherData.precipitation.lastWeek > 30}
                                High - Monitor drainage
                            {:else}
                                Normal
                            {/if}
                        </p>
                    </div>
                </div>
                
                <!-- Solar Radiation -->
                <div class="sketch-box p-5 bg-white">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">☀️</span>
                        <h4 class="text-xl font-bold text-[#f57c00]">Solar Radiation</h4>
                    </div>
                    <div class="text-center">
                        {#if selectedWeatherPeriod === 'week'}
                            <p class="text-4xl font-bold pencil-text text-[#333]">{weatherData.solarRadiation.lastWeek}</p>
                            <p class="text-sm text-[#555] mt-1">MJ/m² in last 7 days</p>
                        {:else if selectedWeatherPeriod === 'month'}
                            <p class="text-4xl font-bold pencil-text text-[#333]">{weatherData.solarRadiation.lastMonth}</p>
                            <p class="text-sm text-[#555] mt-1">MJ/m² in last 30 days</p>
                        {:else}
                            <p class="text-4xl font-bold pencil-text text-[#333]">{weatherData.solarRadiation.lastYear}</p>
                            <p class="text-sm text-[#555] mt-1">MJ/m² in last 365 days</p>
                        {/if}
                    </div>
                    <div class="mt-4 pt-4 border-t-2 border-[#333] opacity-20"></div>
                    <div class="mt-3 text-xs text-[#666]">
                        <p><strong>Average:</strong> 
                            {#if selectedWeatherPeriod === 'week'}
                                {(weatherData.solarRadiation.lastWeek / 7).toFixed(1)} MJ/m²/day
                            {:else if selectedWeatherPeriod === 'month'}
                                {(weatherData.solarRadiation.lastMonth / 30).toFixed(1)} MJ/m²/day
                            {:else}
                                {(weatherData.solarRadiation.lastYear / 365).toFixed(1)} MJ/m²/day
                            {/if}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Details Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Field Information -->
            <div class="sketch-box p-6 bg-[#e8f5e9]">
                <h3 class="text-2xl font-bold pencil-text text-[#2e7d32] mb-4">Field Information</h3>
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span class="font-semibold text-[#555]">Planted Date:</span>
                        <span class="text-[#333]">{field.plantedDate}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-semibold text-[#555]">Expected Harvest:</span>
                        <span class="text-[#333]">{field.expectedHarvest}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-semibold text-[#555]">Irrigation System:</span>
                        <span class="text-[#333]">{field.irrigation}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-semibold text-[#555]">Status:</span>
                        <span class="text-[#333] font-bold">{field.status}</span>
                    </div>
                </div>
            </div>

            <!-- Notes -->
            <div class="sketch-box p-6 bg-[#fff8e1]">
                <h3 class="text-2xl font-bold pencil-text text-[#f57c00] mb-4">Notes</h3>
                <p class="text-[#555] leading-relaxed">{field.notes}</p>
                <button class="mt-4 sketch-button bg-white text-[#333] px-4 py-2 text-sm hover:bg-[#f5f5f5]">
                    Edit Notes
                </button>
            </div>
        </div>

        <!-- Activity Log -->
        <div class="sketch-box p-6 bg-white">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-2xl font-bold pencil-text text-[#2e7d32]">Activity Log</h3>
                <button class="sketch-button bg-[#a5d6a7] text-[#1b5e20] px-4 py-2 text-sm font-bold hover:bg-[#81c784]">
                    + Add Activity
                </button>
            </div>
            <div class="space-y-3">
                {#each activities as activity}
                    <div class="sketch-box p-4 bg-[#faf9f6] hover:bg-[#f1f8e9] transition-colors">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <div class="flex items-center gap-3 mb-1">
                                    <span class="font-bold text-[#2e7d32]">{activity.type}</span>
                                    <span class="text-xs text-[#666]">{activity.date}</span>
                                </div>
                                <p class="text-[#555]">{activity.description}</p>
                            </div>
                            <span class="text-xs text-[#666] ml-4">by {activity.user}</span>
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <button class="sketch-box p-4 bg-[#e8f5e9] hover:bg-[#c8e6c9] transition-colors text-center">
                <div class="text-2xl mb-2">📊</div>
                <div class="font-semibold text-[#2e7d32]">View Stats</div>
            </button>
            <button class="sketch-box p-4 bg-[#fff8e1] hover:bg-[#ffecb3] transition-colors text-center">
                <div class="text-2xl mb-2">💧</div>
                <div class="font-semibold text-[#f57c00]">Irrigation</div>
            </button>
            <button class="sketch-box p-4 bg-[#e1f5fe] hover:bg-[#b3e5fc] transition-colors text-center">
                <div class="text-2xl mb-2">🌡️</div>
                <div class="font-semibold text-[#0277bd]">Weather</div>
            </button>
            <button class="sketch-box p-4 bg-[#f3e5f5] hover:bg-[#e1bee7] transition-colors text-center">
                <div class="text-2xl mb-2">📷</div>
                <div class="font-semibold text-[#7b1fa2]">Photos</div>
            </button>
        </div>
    </div>
{/if}
