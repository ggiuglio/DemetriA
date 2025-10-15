<script>
    import { goto } from '$app/navigation';
    
    let fields = [
        { id: 1, type: 'agriculture', name: 'North Field', length: 500, width: 250, unit: 'ha', crop: 'Wheat', status: 'Growing' },
        { id: 2, type: 'agriculture', name: 'South Field', length: 415, width: 200, unit: 'ha', crop: 'Corn', status: 'Planted' },
        { id: 3, type: 'agriculture', name: 'East Meadow', length: 600, width: 250, unit: 'ha', crop: 'Soybeans', status: 'Growing' },
        { id: 4, type: 'garden', name: 'Home Garden', length: 25, width: 10, unit: 'm²', crop: 'Tomatoes', status: 'Growing' },
        { id: 5, type: 'garden', name: 'Greenhouse Plot', length: 18, width: 10, unit: 'm²', crop: 'Peppers', status: 'Planted' },
        { id: 6, type: 'agriculture', name: 'West Plot', length: 310, width: 200, unit: 'ha', crop: 'Barley', status: 'Harvested' }
    ];
    
    // Calculate area for each field
    function calculateArea(field) {
        if (field.type === 'agriculture') {
            // For agriculture fields, length and width are in meters, convert to hectares
            return (field.length * field.width) / 10000;
        } else {
            // For gardens, length and width are in meters, result in m²
            return field.length * field.width;
        }
    }
    
    $: agricultureFields = fields.filter(f => f.type === 'agriculture');
    $: gardenFields = fields.filter(f => f.type === 'garden');
    $: totalAgricultureArea = agricultureFields.reduce((sum, f) => sum + calculateArea(f), 0);
    $: totalGardenArea = gardenFields.reduce((sum, f) => sum + calculateArea(f), 0);
</script>

<div class="max-w-6xl">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-4xl font-bold pencil-text text-[#2e7d32] sketch-underline inline-block">My Fields</h2>
        <button class="sketch-button bg-[#a5d6a7] text-[#1b5e20] px-6 py-3 font-bold hover:bg-[#81c784]">
            + Add New Field
        </button>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="sketch-box p-5 bg-[#e8f5e9]">
            <p class="text-sm text-[#555] mb-1">Total Fields</p>
            <p class="font-bold text-[#2e7d32] text-3xl pencil-text">{fields.length}</p>
        </div>
        <div class="sketch-box p-5 bg-[#fff8e1]">
            <p class="text-sm text-[#555] mb-1">Agriculture Fields</p>
            <p class="font-bold text-[#f57c00] text-3xl pencil-text">{agricultureFields.length}</p>
            <p class="text-xs text-[#666] mt-1">{totalAgricultureArea.toFixed(1)} ha total</p>
        </div>
        <div class="sketch-box p-5 bg-[#e1f5fe]">
            <p class="text-sm text-[#555] mb-1">Vegetable Gardens</p>
            <p class="font-bold text-[#0277bd] text-3xl pencil-text">{gardenFields.length}</p>
            <p class="text-xs text-[#666] mt-1">{totalGardenArea} m² total</p>
        </div>
    </div>

    <!-- Agriculture Fields Section -->
    {#if agricultureFields.length > 0}
        <div class="mb-8">
            <h3 class="text-3xl font-bold pencil-text text-[#f57c00] mb-4 sketch-underline inline-block">
                Agriculture Fields
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                {#each agricultureFields as field}
                    <div class="sketch-box p-6 bg-white hover:bg-[#fff8e1] transition-colors cursor-pointer">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <h4 class="text-2xl font-bold pencil-text text-[#2e7d32]">{field.name}</h4>
                                <span class="inline-block mt-1 px-2 py-1 bg-[#fff8e1] text-[#f57c00] text-xs rounded">
                                    🌾 Agriculture
                                </span>
                            </div>
                            <span class="sketch-button bg-[#e8f5e9] text-[#2e7d32] px-3 py-1 text-sm">
                                {field.status}
                            </span>
                        </div>
                        
                        <div class="space-y-2 text-[#555]">
                            <div class="flex justify-between">
                                <span class="font-semibold">Dimensions:</span>
                                <span>{field.length}m × {field.width}m</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="font-semibold">Area:</span>
                                <span>{calculateArea(field).toFixed(2)} {field.unit}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="font-semibold">Current Crop:</span>
                                <span>{field.crop}</span>
                            </div>
                        </div>
                        
                        <div class="mt-4 pt-4 border-t-2 border-[#333] opacity-20"></div>
                        
                        <div class="mt-4 flex gap-2">
                            <button 
                                on:click={() => goto(`/fields/${field.id}`)}
                                class="sketch-button bg-[#fff8e1] text-[#333] px-4 py-2 text-sm flex-1 hover:bg-[#ffecb3]"
                            >
                                View Details
                            </button>
                            <button class="sketch-button bg-white text-[#333] px-4 py-2 text-sm hover:bg-[#f5f5f5]">
                                Edit
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Vegetable Gardens Section -->
    {#if gardenFields.length > 0}
        <div>
            <h3 class="text-3xl font-bold pencil-text text-[#0277bd] mb-4 sketch-underline inline-block">
                Vegetable Gardens
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                {#each gardenFields as field}
                    <div class="sketch-box p-6 bg-white hover:bg-[#e1f5fe] transition-colors cursor-pointer">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <h4 class="text-2xl font-bold pencil-text text-[#2e7d32]">{field.name}</h4>
                                <span class="inline-block mt-1 px-2 py-1 bg-[#e1f5fe] text-[#0277bd] text-xs rounded">
                                    🥕 Garden
                                </span>
                            </div>
                            <span class="sketch-button bg-[#e8f5e9] text-[#2e7d32] px-3 py-1 text-sm">
                                {field.status}
                            </span>
                        </div>
                        
                        <div class="space-y-2 text-[#555]">
                            <div class="flex justify-between">
                                <span class="font-semibold">Dimensions:</span>
                                <span>{field.length}m × {field.width}m</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="font-semibold">Area:</span>
                                <span>{calculateArea(field).toFixed(2)} {field.unit}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="font-semibold">Current Crop:</span>
                                <span>{field.crop}</span>
                            </div>
                        </div>
                        
                        <div class="mt-4 pt-4 border-t-2 border-[#333] opacity-20"></div>
                        
                        <div class="mt-4 flex gap-2">
                            <button 
                                on:click={() => goto(`/fields/${field.id}`)}
                                class="sketch-button bg-[#e1f5fe] text-[#333] px-4 py-2 text-sm flex-1 hover:bg-[#b3e5fc]"
                            >
                                View Details
                            </button>
                            <button class="sketch-button bg-white text-[#333] px-4 py-2 text-sm hover:bg-[#f5f5f5]">
                                Edit
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>
