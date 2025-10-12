<script>
    // Mock data - in real app this would come from a database
    let crops = [
        { 
            id: 1, 
            name: 'Wheat', 
            variety: 'Winter Wheat', 
            fields: ['North Field'], 
            totalArea: 12.5,
            unit: 'ha',
            status: 'Growing', 
            plantedDate: '2024-03-15', 
            expectedHarvest: '2024-07-20',
            health: 'Excellent',
            stage: 'Flowering'
        },
        { 
            id: 2, 
            name: 'Corn', 
            variety: 'Sweet Corn', 
            fields: ['South Field'], 
            totalArea: 8.3,
            unit: 'ha',
            status: 'Planted', 
            plantedDate: '2024-04-01', 
            expectedHarvest: '2024-08-15',
            health: 'Good',
            stage: 'Germination'
        },
        { 
            id: 3, 
            name: 'Soybeans', 
            variety: 'Organic Soy', 
            fields: ['East Meadow'], 
            totalArea: 15.0,
            unit: 'ha',
            status: 'Growing', 
            plantedDate: '2024-03-20', 
            expectedHarvest: '2024-08-01',
            health: 'Excellent',
            stage: 'Vegetative'
        },
        { 
            id: 4, 
            name: 'Tomatoes', 
            variety: 'Heirloom Mix', 
            fields: ['Home Garden'], 
            totalArea: 250,
            unit: 'm²',
            status: 'Growing', 
            plantedDate: '2024-04-10', 
            expectedHarvest: '2024-06-15',
            health: 'Good',
            stage: 'Fruiting'
        },
        { 
            id: 5, 
            name: 'Peppers', 
            variety: 'Bell Peppers', 
            fields: ['Greenhouse Plot'], 
            totalArea: 180,
            unit: 'm²',
            status: 'Planted', 
            plantedDate: '2024-04-05', 
            expectedHarvest: '2024-07-01',
            health: 'Excellent',
            stage: 'Vegetative'
        },
        { 
            id: 6, 
            name: 'Barley', 
            variety: 'Spring Barley', 
            fields: ['West Plot'], 
            totalArea: 6.2,
            unit: 'ha',
            status: 'Harvested', 
            plantedDate: '2024-02-01', 
            expectedHarvest: '2024-06-10',
            health: 'Good',
            stage: 'Harvested'
        }
    ];

    // Calculate statistics
    $: activeCrops = crops.filter(c => c.status !== 'Harvested');
    $: harvestedCrops = crops.filter(c => c.status === 'Harvested');
    $: totalAreaHa = crops.filter(c => c.unit === 'ha').reduce((sum, c) => sum + c.totalArea, 0);
    $: totalAreaM2 = crops.filter(c => c.unit === 'm²').reduce((sum, c) => sum + c.totalArea, 0);

    // Get health status color
    function getHealthColor(health) {
        switch(health) {
            case 'Excellent': return 'text-[#2e7d32] bg-[#e8f5e9]';
            case 'Good': return 'text-[#558b2f] bg-[#f1f8e9]';
            case 'Fair': return 'text-[#f57c00] bg-[#fff8e1]';
            case 'Poor': return 'text-[#d32f2f] bg-[#ffebee]';
            default: return 'text-[#555] bg-[#f5f5f5]';
        }
    }
</script>

<div class="max-w-6xl">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-4xl font-bold pencil-text text-[#2e7d32] sketch-underline inline-block">My Crops</h2>
        <button class="sketch-button bg-[#a5d6a7] text-[#1b5e20] px-6 py-3 font-bold hover:bg-[#81c784]">
            + Add New Crop
        </button>
    </div>
    
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="sketch-box p-5 bg-[#e8f5e9]">
            <p class="text-sm text-[#555] mb-1">Total Crops</p>
            <p class="font-bold text-[#2e7d32] text-3xl pencil-text">{crops.length}</p>
        </div>
        <div class="sketch-box p-5 bg-[#fff8e1]">
            <p class="text-sm text-[#555] mb-1">Active Crops</p>
            <p class="font-bold text-[#f57c00] text-3xl pencil-text">{activeCrops.length}</p>
        </div>
        <div class="sketch-box p-5 bg-[#e1f5fe]">
            <p class="text-sm text-[#555] mb-1">Total Area (Fields)</p>
            <p class="font-bold text-[#0277bd] text-2xl pencil-text">{totalAreaHa.toFixed(1)} ha</p>
        </div>
        <div class="sketch-box p-5 bg-[#f3e5f5]">
            <p class="text-sm text-[#555] mb-1">Total Area (Gardens)</p>
            <p class="font-bold text-[#7b1fa2] text-2xl pencil-text">{totalAreaM2} m²</p>
        </div>
    </div>

    <!-- Crops Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {#each crops as crop}
            <div class="sketch-box p-6 bg-white hover:bg-[#f1f8e9] transition-colors">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <h3 class="text-2xl font-bold pencil-text text-[#2e7d32]">{crop.name}</h3>
                        <p class="text-sm text-[#666] mt-1">{crop.variety}</p>
                    </div>
                    <div class="flex flex-col gap-2 items-end">
                        <span class="sketch-button bg-[#e8f5e9] text-[#2e7d32] px-3 py-1 text-sm">
                            {crop.status}
                        </span>
                        <span class="px-3 py-1 text-xs rounded {getHealthColor(crop.health)}">
                            {crop.health}
                        </span>
                    </div>
                </div>

                <div class="space-y-2 mb-4">
                    <div class="flex justify-between text-sm">
                        <span class="text-[#555]">Growth Stage:</span>
                        <span class="font-semibold text-[#333]">{crop.stage}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-[#555]">Total Area:</span>
                        <span class="font-semibold text-[#333]">{crop.totalArea} {crop.unit}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-[#555]">Fields:</span>
                        <span class="font-semibold text-[#333]">{crop.fields.join(', ')}</span>
                    </div>
                </div>

                <div class="sketch-box p-3 bg-[#faf9f6] mb-4">
                    <div class="grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <p class="text-[#666]">Planted</p>
                            <p class="font-semibold text-[#333]">{crop.plantedDate}</p>
                        </div>
                        <div>
                            <p class="text-[#666]">Expected Harvest</p>
                            <p class="font-semibold text-[#333]">{crop.expectedHarvest}</p>
                        </div>
                    </div>
                </div>

                <div class="flex gap-2">
                    <button class="sketch-button bg-[#e8f5e9] text-[#2e7d32] px-4 py-2 text-sm flex-1 hover:bg-[#c8e6c9]">
                        View Details
                    </button>
                    <button class="sketch-button bg-white text-[#333] px-4 py-2 text-sm hover:bg-[#f5f5f5]">
                        Manage
                    </button>
                </div>
            </div>
        {/each}
    </div>

    <!-- Quick Stats -->
    <div class="mt-8 sketch-box p-6 bg-[#fff8e1]">
        <h3 class="text-2xl font-bold pencil-text text-[#f57c00] mb-4">📊 Crop Statistics</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <p class="text-sm text-[#555] mb-2">By Status</p>
                <div class="space-y-1 text-sm">
                    <p><strong>Growing:</strong> {crops.filter(c => c.status === 'Growing').length} crops</p>
                    <p><strong>Planted:</strong> {crops.filter(c => c.status === 'Planted').length} crops</p>
                    <p><strong>Harvested:</strong> {harvestedCrops.length} crops</p>
                </div>
            </div>
            <div>
                <p class="text-sm text-[#555] mb-2">By Health</p>
                <div class="space-y-1 text-sm">
                    <p><strong>Excellent:</strong> {crops.filter(c => c.health === 'Excellent').length} crops</p>
                    <p><strong>Good:</strong> {crops.filter(c => c.health === 'Good').length} crops</p>
                    <p><strong>Fair:</strong> {crops.filter(c => c.health === 'Fair').length} crops</p>
                </div>
            </div>
            <div>
                <p class="text-sm text-[#555] mb-2">Upcoming Harvests</p>
                <div class="space-y-1 text-sm">
                    {#each activeCrops.slice(0, 3) as crop}
                        <p><strong>{crop.name}:</strong> {crop.expectedHarvest}</p>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>
