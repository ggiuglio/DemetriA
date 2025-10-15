<script>
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import GoogleMap from '$lib/GoogleMap.svelte';
    
    // Mock data - in real app this would come from a database
    const allFields = [
        { id: 1, type: 'agriculture', name: 'North Field', length: 500, width: 250, unit: 'ha', crop: 'Wheat', status: 'Growing', plantedDate: '2024-03-15', expectedHarvest: '2024-07-20', soilType: 'Loamy', pH: 6.8, stoniness: 'Low', drainage: 'Good', irrigation: 'Sprinkler', notes: 'Good drainage, needs regular monitoring for pests.', lat: 41.9028, lng: 12.4964, address: 'Via Appia Antica, 00179 Roma RM, Italy' },
        { id: 2, type: 'agriculture', name: 'South Field', length: 415, width: 200, unit: 'ha', crop: 'Corn', status: 'Planted', plantedDate: '2024-04-01', expectedHarvest: '2024-08-15', soilType: 'Clay', pH: 7.2, stoniness: 'Medium', drainage: 'Moderate', irrigation: 'Drip', notes: 'Recently fertilized.', lat: 41.8902, lng: 12.4922, address: 'Via di Tor Carbone, 00179 Roma RM, Italy' },
        { id: 3, type: 'agriculture', name: 'East Meadow', length: 600, width: 250, unit: 'ha', crop: 'Soybeans', status: 'Growing', plantedDate: '2024-03-20', expectedHarvest: '2024-08-01', soilType: 'Sandy Loam', pH: 6.5, stoniness: 'Low', drainage: 'Excellent', irrigation: 'Rain-fed', notes: 'Organic certification pending.', lat: 41.9045, lng: 12.5100, address: 'Via Tuscolana, 00181 Roma RM, Italy' },
        { id: 4, type: 'garden', name: 'Home Garden', length: 25, width: 10, unit: 'm²', crop: 'Tomatoes', status: 'Growing', plantedDate: '2024-04-10', expectedHarvest: '2024-06-15', soilType: 'Rich Loam', pH: 6.9, stoniness: 'Very Low', drainage: 'Good', irrigation: 'Manual', notes: 'Heirloom varieties, needs daily watering.', lat: 41.9000, lng: 12.5000, address: 'Via Casilina, 00182 Roma RM, Italy' },
        { id: 5, type: 'garden', name: 'Greenhouse Plot', length: 18, width: 10, unit: 'm²', crop: 'Peppers', status: 'Planted', plantedDate: '2024-04-05', expectedHarvest: '2024-07-01', soilType: 'Potting Mix', pH: 6.3, stoniness: 'None', drainage: 'Excellent', irrigation: 'Automated Drip', notes: 'Climate controlled environment.', lat: 41.8980, lng: 12.4980, address: 'Via Ardeatina, 00154 Roma RM, Italy' },
        { id: 6, type: 'agriculture', name: 'West Plot', length: 310, width: 200, unit: 'ha', crop: 'Barley', status: 'Harvested', plantedDate: '2024-02-01', expectedHarvest: '2024-06-10', soilType: 'Silty', pH: 7.0, stoniness: 'High', drainage: 'Poor', irrigation: 'Rain-fed', notes: 'Harvest completed successfully.', lat: 41.8950, lng: 12.4850, address: 'Via Laurentina, 00142 Roma RM, Italy' }
    ];
    
    $: fieldId = parseInt($page.params.id);
    $: field = allFields.find(f => f.id === fieldId);
    
    // Calculate area from length and width
    $: calculatedArea = field ? (field.type === 'agriculture' ? (field.length * field.width / 10000) : (field.length * field.width)) : 0;
    
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
    
    // Active tab
    let activeTab = 'overview'; // 'overview', 'planner', 'activities'
    
    // Editable field details
    let editableLength = 0;
    let editableWidth = 0;
    let editableLat = 0;
    let editableLng = 0;
    
    // Initialize editable values when field loads
    $: if (field) {
        editableLength = field.length;
        editableWidth = field.width;
        editableLat = field.lat;
        editableLng = field.lng;
    }
    
    // Recalculate area when dimensions change
    $: editableArea = field ? (field.type === 'agriculture' ? (editableLength * editableWidth / 10000) : (editableLength * editableWidth)) : 0;
    
    // Mock activity log
    const activities = [
        { date: '2024-05-01', type: 'Fertilization', description: 'Applied organic fertilizer', user: 'John' },
        { date: '2024-04-20', type: 'Irrigation', description: 'Adjusted irrigation schedule', user: 'Sarah' },
        { date: '2024-04-15', type: 'Inspection', description: 'Pest inspection - all clear', user: 'Mike' },
        { date: '2024-04-01', type: 'Planting', description: 'Seeds planted', user: 'John' }
    ];
    
    // Planting configuration
    let primaryCrop = 'Wheat';
    let useIntercropping = false;
    let secondaryCrop = 'Beans';
    let intercroppingStrategy = 'alternate_rows'; // 'alternate_rows' or 'same_row'
    let numberOfRows = 20;
    let spacingBetweenCrops = 0.3; // meters
    let rowSpacing = 0.75; // meters between rows
    
    // AI recommendation logic
    function getAIRecommendations(soilType, fieldType, fieldWidth) {
        let recommendations = {
            primaryCrop: 'Wheat',
            useIntercropping: false,
            secondaryCrop: null,
            intercroppingStrategy: 'alternate_rows',
            numberOfRows: Math.floor(fieldWidth / 0.75),
            spacingBetweenCrops: 0.3,
            reasoning: ''
        };
        
        // Determine primary crop based on soil type
        if (soilType === 'Loamy') {
            recommendations.primaryCrop = 'Wheat';
            recommendations.useIntercropping = true;
            recommendations.secondaryCrop = 'Soybeans';
            recommendations.intercroppingStrategy = 'alternate_rows';
            recommendations.reasoning = 'Loamy soil is ideal for wheat with soybean intercropping to enhance nitrogen fixation.';
        } else if (soilType === 'Clay') {
            recommendations.primaryCrop = 'Rice';
            recommendations.useIntercropping = true;
            recommendations.secondaryCrop = 'Azolla';
            recommendations.intercroppingStrategy = 'same_row';
            recommendations.reasoning = 'Clay soil retains water well, perfect for rice with azolla to improve nitrogen.';
        } else if (soilType === 'Sandy Loam') {
            recommendations.primaryCrop = 'Carrots';
            recommendations.useIntercropping = true;
            recommendations.secondaryCrop = 'Onions';
            recommendations.intercroppingStrategy = 'alternate_rows';
            recommendations.reasoning = 'Sandy loam drains well, ideal for root vegetables with companion planting.';
        } else if (soilType === 'Rich Loam') {
            recommendations.primaryCrop = 'Tomatoes';
            recommendations.useIntercropping = true;
            recommendations.secondaryCrop = 'Basil';
            recommendations.intercroppingStrategy = 'same_row';
            recommendations.reasoning = 'Rich loam supports tomatoes excellently with basil as a pest deterrent.';
        } else {
            recommendations.primaryCrop = 'Barley';
            recommendations.useIntercropping = false;
            recommendations.reasoning = 'General purpose crop suitable for various soil types.';
        }
        
        // Adjust spacing based on field type
        if (fieldType === 'agriculture') {
            recommendations.numberOfRows = Math.floor(fieldWidth / 0.75);
            recommendations.spacingBetweenCrops = 0.3;
        } else {
            recommendations.numberOfRows = Math.floor(fieldWidth / 0.5);
            recommendations.spacingBetweenCrops = 0.2;
        }
        
        return recommendations;
    }
    
    // Get companion crop recommendations based on primary crop
    function getCompanionCrop(crop) {
        const companions = {
            'Wheat': { crop: 'Soybeans', strategy: 'alternate_rows', reason: 'Soybeans fix nitrogen, benefiting wheat growth' },
            'Corn': { crop: 'Beans', strategy: 'same_row', reason: 'Classic "Three Sisters" companion planting' },
            'Tomatoes': { crop: 'Basil', strategy: 'same_row', reason: 'Basil repels pests and enhances tomato flavor' },
            'Rice': { crop: 'Azolla', strategy: 'same_row', reason: 'Azolla provides natural nitrogen fertilization' },
            'Carrots': { crop: 'Onions', strategy: 'alternate_rows', reason: 'Onions deter carrot flies' },
            'Potatoes': { crop: 'Beans', strategy: 'alternate_rows', reason: 'Beans add nitrogen to soil' },
            'Cabbage': { crop: 'Dill', strategy: 'same_row', reason: 'Dill attracts beneficial insects' },
            'Broccoli': { crop: 'Lettuce', strategy: 'alternate_rows', reason: 'Lettuce uses space efficiently' },
            'Peppers': { crop: 'Basil', strategy: 'same_row', reason: 'Basil improves pepper growth' },
            'Barley': { crop: 'Peas', strategy: 'alternate_rows', reason: 'Peas enrich soil with nitrogen' },
            'Peanuts': { crop: 'Corn', strategy: 'alternate_rows', reason: 'Corn provides shade for peanuts' }
        };
        
        return companions[crop] || { crop: 'Beans', strategy: 'alternate_rows', reason: 'Beans are versatile nitrogen fixers' };
    }
    
    // Reactive: Recalculate recommendations when primary crop changes
    $: if (primaryCrop && field) {
        const companion = getCompanionCrop(primaryCrop);
        secondaryCrop = companion.crop;
        intercroppingStrategy = companion.strategy;
        
        // Determine if intercropping is recommended
        useIntercropping = companion.crop !== null;
    }
    
    // Reactive: Recalculate spacing when intercropping settings change
    $: if (field && (useIntercropping !== undefined || intercroppingStrategy || secondaryCrop)) {
        // Adjust spacing based on intercropping strategy
        if (useIntercropping && intercroppingStrategy === 'same_row') {
            // Same row intercropping needs more space
            spacingBetweenCrops = field.type === 'agriculture' ? 0.4 : 0.25;
        } else if (useIntercropping && intercroppingStrategy === 'alternate_rows') {
            // Alternate rows can use standard spacing
            spacingBetweenCrops = field.type === 'agriculture' ? 0.3 : 0.2;
        } else {
            // No intercropping - standard spacing
            spacingBetweenCrops = field.type === 'agriculture' ? 0.3 : 0.2;
        }
        
        // Recalculate number of rows based on intercropping
        if (useIntercropping && intercroppingStrategy === 'alternate_rows') {
            // Need even number of rows for alternating
            const calculatedRows = Math.floor(editableWidth / (field.type === 'agriculture' ? 0.75 : 0.5));
            numberOfRows = calculatedRows % 2 === 0 ? calculatedRows : calculatedRows - 1;
        } else {
            numberOfRows = Math.floor(editableWidth / (field.type === 'agriculture' ? 0.75 : 0.5));
        }
    }
    
    // Initialize with AI recommendations
    let initialized = false;
    $: if (field && !initialized) {
        const aiRec = getAIRecommendations(field.soilType, field.type, editableWidth);
        primaryCrop = aiRec.primaryCrop;
        useIntercropping = aiRec.useIntercropping;
        secondaryCrop = aiRec.secondaryCrop;
        intercroppingStrategy = aiRec.intercroppingStrategy;
        numberOfRows = aiRec.numberOfRows;
        spacingBetweenCrops = aiRec.spacingBetweenCrops;
        initialized = true;
    }
    
    // Calculate number of plants
    let totalPrimaryPlants = 0;
    let totalSecondaryPlants = 0;
    
    $: if (field) {
        const fieldLength = editableLength;
        const plantsPerRow = Math.floor(fieldLength / spacingBetweenCrops);
        
        if (useIntercropping && intercroppingStrategy === 'alternate_rows') {
            // Alternate rows strategy
            const primaryRows = Math.ceil(numberOfRows / 2);
            const secondaryRows = Math.floor(numberOfRows / 2);
            
            totalPrimaryPlants = primaryRows * plantsPerRow;
            totalSecondaryPlants = secondaryRows * plantsPerRow;
        } else if (useIntercropping && intercroppingStrategy === 'same_row') {
            // Same row alternating strategy
            const primaryPlantsPerRow = Math.ceil(plantsPerRow / 2);
            const secondaryPlantsPerRow = Math.floor(plantsPerRow / 2);
            
            totalPrimaryPlants = numberOfRows * primaryPlantsPerRow;
            totalSecondaryPlants = numberOfRows * secondaryPlantsPerRow;
        } else {
            // No intercropping
            totalPrimaryPlants = numberOfRows * plantsPerRow;
            totalSecondaryPlants = 0;
        }
    }
    
    // Calculate expected production in kg
    function calculateExpectedYield(crop, plantCount) {
        // Average yield per plant in kg (approximate values)
        const yieldPerPlant = {
            'Wheat': 0.025,      // 25g per plant
            'Corn': 0.2,         // 200g per plant
            'Rice': 0.03,        // 30g per plant
            'Soybeans': 0.05,    // 50g per plant
            'Tomatoes': 4,       // 4kg per plant
            'Peppers': 1.5,      // 1.5kg per plant
            'Carrots': 0.15,     // 150g per plant
            'Potatoes': 0.5,     // 500g per plant
            'Cabbage': 1.2,      // 1.2kg per plant
            'Broccoli': 0.5,     // 500g per plant
            'Lettuce': 0.3,      // 300g per plant
            'Barley': 0.03,      // 30g per plant
            'Zucchini': 3,       // 3kg per plant
            'Cucumbers': 2,      // 2kg per plant
            'Beans': 0.2,        // 200g per plant
            'Peas': 0.15,        // 150g per plant
            'Onions': 0.2,       // 200g per plant
            'Basil': 0.05,       // 50g per plant
            'Azolla': 0.01,      // 10g per plant
            'Dill': 0.03         // 30g per plant
        };
        
        const yield_per_plant = yieldPerPlant[crop] || 0.1;
        return (plantCount * yield_per_plant).toFixed(1);
    }
    
    // Calculate yields
    $: expectedPrimaryYield = field ? calculateExpectedYield(primaryCrop, totalPrimaryPlants) : 0;
    $: expectedSecondaryYield = field && useIntercropping ? calculateExpectedYield(secondaryCrop, totalSecondaryPlants) : 0;
    
    // Activity Planning AI
    function getActivityRecommendations(crop, secondaryCrop, useIntercropping, fieldType) {
        const today = new Date();
        const activities = [];
        
        // Helper to add days to date
        const addDays = (date, days) => {
            const result = new Date(date);
            result.setDate(result.getDate() + days);
            return result.toISOString().split('T')[0];
        };
        
        // Determine if crop is transplanted or sown
        const transplantCrops = ['Tomatoes', 'Peppers', 'Cabbage', 'Broccoli', 'Lettuce'];
        const isTransplant = transplantCrops.includes(crop);
        
        // Base activities timeline
        activities.push({
            id: 1,
            activity: 'Land Clearing',
            description: 'Remove weeds, debris, and previous crop residues',
            suggestedDate: addDays(today, 0),
            duration: '1-2 days',
            priority: 'High',
            status: 'pending'
        });
        
        activities.push({
            id: 2,
            activity: 'Plowing',
            description: 'Deep tillage to break up soil and improve aeration',
            suggestedDate: addDays(today, 3),
            duration: '1 day',
            priority: 'High',
            status: 'pending'
        });
        
        activities.push({
            id: 3,
            activity: 'Ridge Formation',
            description: 'Create raised beds or ridges for proper drainage',
            suggestedDate: addDays(today, 5),
            duration: '1 day',
            priority: 'Medium',
            status: 'pending'
        });
        
        // Sowing or Transplanting
        if (isTransplant) {
            activities.push({
                id: 4,
                activity: 'Transplanting',
                description: `Transplant ${crop} seedlings at proper spacing`,
                suggestedDate: addDays(today, 7),
                duration: '1-2 days',
                priority: 'High',
                status: 'pending'
            });
        } else {
            activities.push({
                id: 4,
                activity: 'Sowing',
                description: `Direct sowing of ${crop} seeds`,
                suggestedDate: addDays(today, 7),
                duration: '1 day',
                priority: 'High',
                status: 'pending'
            });
        }
        
        // Base Fertilization
        activities.push({
            id: 5,
            activity: 'Base Fertilization',
            description: 'Apply organic or chemical fertilizer before planting',
            suggestedDate: addDays(today, 6),
            duration: '1 day',
            priority: 'High',
            status: 'pending'
        });
        
        // First Irrigation
        activities.push({
            id: 6,
            activity: 'First Irrigation',
            description: 'Initial watering after planting',
            suggestedDate: addDays(today, 8),
            duration: '1 day',
            priority: 'High',
            status: 'pending'
        });
        
        // Weeding
        activities.push({
            id: 7,
            activity: 'First Weeding',
            description: 'Remove weeds competing with crops',
            suggestedDate: addDays(today, 21),
            duration: '1-2 days',
            priority: 'Medium',
            status: 'pending'
        });
        
        // Top Dressing
        activities.push({
            id: 8,
            activity: 'Top Dressing Fertilization',
            description: 'Apply additional nutrients during growth phase',
            suggestedDate: addDays(today, 30),
            duration: '1 day',
            priority: 'Medium',
            status: 'pending'
        });
        
        // Pest Inspection
        activities.push({
            id: 9,
            activity: 'Pest & Disease Inspection',
            description: 'Check for pests, diseases, and nutrient deficiencies',
            suggestedDate: addDays(today, 25),
            duration: '1 day',
            priority: 'High',
            status: 'pending'
        });
        
        // Thinning (for crops that need it)
        const thinningCrops = ['Carrots', 'Lettuce', 'Beets', 'Radishes', 'Spinach'];
        if (thinningCrops.includes(crop)) {
            activities.push({
                id: 10,
                activity: 'Thinning',
                description: `Thin ${crop} seedlings to proper spacing for optimal growth`,
                suggestedDate: addDays(today, 18),
                duration: '1 day',
                priority: 'Medium',
                status: 'pending'
            });
        }
        
        // Pruning (for crops that need it)
        const pruningCrops = ['Tomatoes', 'Peppers', 'Cucumbers', 'Melons', 'Grapes'];
        if (pruningCrops.includes(crop)) {
            activities.push({
                id: 11,
                activity: 'Pruning',
                description: `Prune ${crop} plants to remove suckers and improve air circulation`,
                suggestedDate: addDays(today, 35),
                duration: '1-2 days',
                priority: 'Medium',
                status: 'pending'
            });
        }
        
        // Intercropping activities
        if (useIntercropping && secondaryCrop) {
            const isSecondaryTransplant = transplantCrops.includes(secondaryCrop);
            activities.push({
                id: 12,
                activity: isSecondaryTransplant ? `Transplanting ${secondaryCrop}` : `Sowing ${secondaryCrop}`,
                description: `Plant companion crop ${secondaryCrop} for intercropping`,
                suggestedDate: addDays(today, 10),
                duration: '1 day',
                priority: 'Medium',
                status: 'pending'
            });
        }
        
        // Harvest estimation (varies by crop)
        const harvestDays = {
            'Wheat': 120, 'Corn': 90, 'Rice': 120, 'Soybeans': 100,
            'Tomatoes': 75, 'Peppers': 70, 'Carrots': 70, 'Potatoes': 90,
            'Cabbage': 80, 'Broccoli': 65, 'Lettuce': 45, 'Barley': 110,
            'Zucchini': 50, 'Cucumbers': 55, 'Beans': 60, 'Peas': 60
        };
        
        // Crops that produce continuously over a long period
        const continuousHarvestCrops = ['Tomatoes', 'Peppers', 'Zucchini', 'Cucumbers', 'Beans', 'Peas', 'Lettuce'];
        const isContinuousHarvest = continuousHarvestCrops.includes(crop);
        
        const daysToHarvest = harvestDays[crop] || 90;
        activities.push({
            id: 13,
            activity: isContinuousHarvest ? 'Start Harvesting' : 'Harvest',
            description: isContinuousHarvest 
                ? `Begin continuous harvest of ${crop} - pick regularly for extended production`
                : `Estimated harvest time for ${crop}`,
            suggestedDate: addDays(today, 7 + daysToHarvest),
            duration: isContinuousHarvest ? 'Ongoing (4-8 weeks)' : '2-5 days',
            priority: 'High',
            status: 'pending'
        });
        
        return activities.sort((a, b) => new Date(a.suggestedDate) - new Date(b.suggestedDate));
    }
    
    // Generate activity recommendations
    $: activityRecommendations = field ? getActivityRecommendations(
        primaryCrop, 
        secondaryCrop, 
        useIntercropping, 
        field.type
    ) : [];
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

        <!-- Tabs Navigation -->
        <div class="mb-6">
            <div class="flex gap-2 border-b-2 border-[#333] pb-2">
                <button 
                    on:click={() => activeTab = 'overview'}
                    class="sketch-button px-6 py-3 font-semibold {activeTab === 'overview' ? 'bg-[#a5d6a7] text-[#1b5e20]' : 'bg-white text-[#555] hover:bg-[#f5f5f5]'}"
                >
                    📊 Overview
                </button>
                <button 
                    on:click={() => activeTab = 'planner'}
                    class="sketch-button px-6 py-3 font-semibold {activeTab === 'planner' ? 'bg-[#a5d6a7] text-[#1b5e20]' : 'bg-white text-[#555] hover:bg-[#f5f5f5]'}"
                >
                    🌱 Field Planner
                </button>
                <button 
                    on:click={() => activeTab = 'activities'}
                    class="sketch-button px-6 py-3 font-semibold {activeTab === 'activities' ? 'bg-[#a5d6a7] text-[#1b5e20]' : 'bg-white text-[#555] hover:bg-[#f5f5f5]'}"
                >
                    📋 Activity Planner
                </button>
            </div>
        </div>

        {#if activeTab === 'overview'}
        <!-- Map and Details Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Map -->
            <div class="sketch-box p-6 bg-white">
                <h3 class="text-2xl font-bold pencil-text text-[#2e7d32] mb-4">📍 Field Location</h3>
                <div class="h-[400px]">
                    <GoogleMap 
                        latitude={editableLat} 
                        longitude={editableLng} 
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
                        <span class="text-[#333] text-sm">{editableLat.toFixed(4)}°N, {editableLng.toFixed(4)}°E</span>
                    </div>
                    <div class="mt-3">
                        <a 
                            href="https://www.google.com/maps/search/?api=1&query={editableLat},{editableLng}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="sketch-button bg-[#e8f5e9] text-[#2e7d32] px-4 py-2 text-sm inline-flex items-center gap-2 hover:bg-[#c8e6c9]"
                        >
                            🗺️ Open in Google Maps
                        </a>
                    </div>
                </div>
            </div>

            <!-- Field Details -->
            <div class="space-y-6">
                <!-- Field Details -->
                <div class="sketch-box p-5 bg-white">
                    <h4 class="text-lg font-bold text-[#2e7d32] mb-4">📏 Field Details</h4>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-xs text-[#555] mb-1">Length (m)</label>
                            <input 
                                type="number" 
                                bind:value={editableLength}
                                class="sketch-box w-full px-3 py-2 bg-[#faf9f6] text-[#333] font-semibold focus:outline-none focus:ring-2 focus:ring-[#a5d6a7]"
                                placeholder="Length in meters"
                                min="1"
                            />
                        </div>
                        <div>
                            <label class="block text-xs text-[#555] mb-1">Width (m)</label>
                            <input 
                                type="number" 
                                bind:value={editableWidth}
                                class="sketch-box w-full px-3 py-2 bg-[#faf9f6] text-[#333] font-semibold focus:outline-none focus:ring-2 focus:ring-[#a5d6a7]"
                                placeholder="Width in meters"
                                min="1"
                            />
                        </div>
                        <div class="pt-2 border-t border-[#333] opacity-20"></div>
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-[#555]">Total Area:</span>
                            <span class="font-bold text-[#2e7d32] text-xl">{editableArea.toFixed(2)} {field.unit}</span>
                        </div>
                        <div class="pt-2 border-t border-[#333] opacity-20"></div>
                        <div>
                            <label class="block text-xs text-[#555] mb-1">Latitude</label>
                            <input 
                                type="number" 
                                bind:value={editableLat}
                                step="0.0001"
                                class="sketch-box w-full px-3 py-2 bg-[#faf9f6] text-[#333] font-semibold focus:outline-none focus:ring-2 focus:ring-[#a5d6a7]"
                                placeholder="Latitude"
                            />
                        </div>
                        <div>
                            <label class="block text-xs text-[#555] mb-1">Longitude</label>
                            <input 
                                type="number" 
                                bind:value={editableLng}
                                step="0.0001"
                                class="sketch-box w-full px-3 py-2 bg-[#faf9f6] text-[#333] font-semibold focus:outline-none focus:ring-2 focus:ring-[#a5d6a7]"
                                placeholder="Longitude"
                            />
                        </div>
                    </div>
                </div>

                <!-- Soil Details -->
                <div class="sketch-box p-5 bg-[#fff8e1]">
                    <h4 class="text-lg font-bold text-[#f57c00] mb-3">🌱 Soil Details</h4>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-sm text-[#555]">Soil Type:</span>
                            <span class="font-bold text-[#333]">{field.soilType}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-[#555]">pH Level:</span>
                            <span class="font-bold text-[#333]">{field.pH} 
                                <span class="text-xs text-[#666]">
                                    ({#if field.pH < 6.0}Acidic{:else if field.pH > 7.5}Alkaline{:else}Neutral{/if})
                                </span>
                            </span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-[#555]">Stoniness:</span>
                            <span class="font-bold text-[#333]">{field.stoniness}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-[#555]">Drainage:</span>
                            <span class="font-bold text-[#333]">{field.drainage}</span>
                        </div>
                    </div>
                </div>

                <!-- Weather Summary -->
                <div class="sketch-box p-5 bg-[#e1f5fe]">
                    <h4 class="text-lg font-bold text-[#0277bd] mb-3">🌤️ Weather Summary</h4>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-sm text-[#555]">Annual Rainfall:</span>
                            <span class="font-bold text-[#333]">{weatherData.precipitation.lastYear} mm</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-[#555]">Last Month:</span>
                            <span class="font-bold text-[#333]">{weatherData.precipitation.lastMonth} mm</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-[#555]">Solar Radiation (Year):</span>
                            <span class="font-bold text-[#333]">{weatherData.solarRadiation.lastYear} MJ/m²</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Field Configuration -->
        <div class="sketch-box p-6 bg-[#e8f5e9] mb-6">
            <h3 class="text-2xl font-bold pencil-text text-[#2e7d32] mb-4">🌱 Current Planting Configuration</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Crop Information -->
                <div class="sketch-box p-5 bg-white">
                    <h4 class="text-lg font-bold text-[#2e7d32] mb-3">Crops</h4>
                    <div class="space-y-3">
                        <div>
                            <p class="text-sm text-[#555] mb-1">Primary Crop</p>
                            <p class="font-bold text-[#2e7d32] text-2xl">{primaryCrop}</p>
                        </div>
                        {#if useIntercropping}
                        <div class="pt-3 border-t border-[#333] opacity-20"></div>
                        <div>
                            <p class="text-sm text-[#555] mb-1">Secondary Crop (Intercropping)</p>
                            <p class="font-bold text-[#f57c00] text-xl">{secondaryCrop}</p>
                            <p class="text-xs text-[#666] mt-1">
                                Strategy: {intercroppingStrategy === 'alternate_rows' ? 'Alternate Rows' : 'Alternate in Same Row'}
                            </p>
                        </div>
                        {:else}
                        <div class="pt-3 border-t border-[#333] opacity-20"></div>
                        <p class="text-sm text-[#666]">No intercropping configured</p>
                        {/if}
                    </div>
                </div>

                <!-- Spacing & Plant Count -->
                <div class="sketch-box p-5 bg-white">
                    <h4 class="text-lg font-bold text-[#2e7d32] mb-3">Layout & Density</h4>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-sm text-[#555]">Number of Rows:</span>
                            <span class="font-bold text-[#333]">{numberOfRows}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-[#555]">Plant Spacing:</span>
                            <span class="font-bold text-[#333]">{spacingBetweenCrops}m</span>
                        </div>
                        <div class="pt-3 border-t border-[#333] opacity-20"></div>
                        <div class="flex justify-between">
                            <span class="text-sm text-[#555]">Total {primaryCrop} Plants:</span>
                            <span class="font-bold text-[#2e7d32] text-xl">{totalPrimaryPlants}</span>
                        </div>
                        {#if useIntercropping}
                        <div class="flex justify-between">
                            <span class="text-sm text-[#555]">Total {secondaryCrop} Plants:</span>
                            <span class="font-bold text-[#f57c00] text-xl">{totalSecondaryPlants}</span>
                        </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>

        <!-- Expected Outcome -->
        {#if field}
        {@const harvestDays = {
            'Wheat': 120, 'Corn': 90, 'Rice': 120, 'Soybeans': 100,
            'Tomatoes': 75, 'Peppers': 70, 'Carrots': 70, 'Potatoes': 90,
            'Cabbage': 80, 'Broccoli': 65, 'Lettuce': 45, 'Barley': 110,
            'Zucchini': 50, 'Cucumbers': 55, 'Beans': 60, 'Peas': 60
        }}
        {@const daysToHarvest = harvestDays[primaryCrop] || 90}
        {@const continuousHarvestCrops = ['Tomatoes', 'Peppers', 'Zucchini', 'Cucumbers', 'Beans', 'Peas', 'Lettuce']}
        {@const isContinuous = continuousHarvestCrops.includes(primaryCrop)}
        {@const plantingDate = new Date()}
        {@const productionStart = new Date(plantingDate)}
        {@const harvestDate = new Date(plantingDate)}
        {productionStart.setDate(productionStart.getDate() + 7)}
        {harvestDate.setDate(harvestDate.getDate() + 7 + daysToHarvest)}
        <div class="sketch-box p-6 bg-[#fff8e1] mb-6">
            <h3 class="text-2xl font-bold pencil-text text-[#f57c00] mb-4">📈 Expected Outcome</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Production Start OR Harvest Date -->
                {#if isContinuous}
                <div class="sketch-box p-5 bg-white">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-2xl">🌱</span>
                        <h4 class="text-lg font-bold text-[#2e7d32]">Production Start</h4>
                    </div>
                    <p class="text-sm text-[#666] mb-2">Begin continuous harvest</p>
                    <p class="font-bold text-[#333] text-xl">{harvestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p class="text-xs text-[#666] mt-2">~{daysToHarvest} days from planting</p>
                </div>
                {:else}
                <div class="sketch-box p-5 bg-white">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-2xl">🌾</span>
                        <h4 class="text-lg font-bold text-[#f57c00]">Harvest Date</h4>
                    </div>
                    <p class="text-sm text-[#666] mb-2">Estimated harvest time</p>
                    <p class="font-bold text-[#333] text-xl">{harvestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p class="text-xs text-[#666] mt-2">~{daysToHarvest} days from planting</p>
                </div>
                {/if}

                <!-- Expected Production -->
                <div class="sketch-box p-5 bg-white">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-2xl">📦</span>
                        <h4 class="text-lg font-bold text-[#0277bd]">Expected Production</h4>
                    </div>
                    <p class="text-sm text-[#666] mb-2">Estimated yield</p>
                    <div class="space-y-2">
                        <div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-[#555]">{primaryCrop}:</span>
                                <span class="font-bold text-[#2e7d32] text-2xl">{expectedPrimaryYield} kg</span>
                            </div>
                            <p class="text-xs text-[#666] text-right">{totalPrimaryPlants} plants</p>
                        </div>
                        {#if useIntercropping}
                        <div class="pt-2 border-t border-[#333] opacity-20"></div>
                        <div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-[#555]">{secondaryCrop}:</span>
                                <span class="font-bold text-[#f57c00] text-2xl">{expectedSecondaryYield} kg</span>
                            </div>
                            <p class="text-xs text-[#666] text-right">{totalSecondaryPlants} plants</p>
                        </div>
                        {/if}
                    </div>
                </div>
            </div>

            {#if isContinuous}
            <div class="mt-4 sketch-box p-3 bg-white">
                <p class="text-sm text-[#666]">
                    <strong>Note:</strong> {primaryCrop} produces continuously. Regular harvesting over 4-8 weeks will maximize yield.
                </p>
            </div>
            {/if}
        </div>
        {/if}

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
        {:else if activeTab === 'planner'}
        <!-- Field Planner Tab -->
        <div class="space-y-6">
            <!-- Planner Header -->
            <div class="sketch-box p-6 bg-[#e8f5e9]">
                <h3 class="text-2xl font-bold pencil-text text-[#2e7d32] mb-2">📅 Field Planner</h3>
                <p class="text-[#555]">Plan and schedule activities for {field.name}</p>
            </div>

            <!-- AI Assistant -->
            <div class="sketch-box p-6 bg-gradient-to-br from-[#e1f5fe] to-[#f3e5f5]">
                <div class="flex items-start gap-4 mb-4">
                    <div class="text-4xl">🤖</div>
                    <div class="flex-1">
                        <h4 class="text-xl font-bold text-[#0277bd] mb-2">AI Planting Assistant</h4>
                        <p class="text-sm text-[#555] mb-4">Get personalized recommendations based on your field's soil type and weather conditions</p>
                    </div>
                </div>

                <!-- Field Analysis -->
                <div class="sketch-box p-4 bg-white mb-4">
                    <h5 class="font-bold text-[#333] mb-3">📊 Field Analysis</h5>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                            <p class="text-[#666]">Soil Type</p>
                            <p class="font-bold text-[#2e7d32]">{field.soilType}</p>
                        </div>
                        <div>
                            <p class="text-[#666]">pH Level</p>
                            <p class="font-bold text-[#2e7d32]">{field.pH}</p>
                        </div>
                        <div>
                            <p class="text-[#666]">Drainage</p>
                            <p class="font-bold text-[#2e7d32]">{field.drainage}</p>
                        </div>
                        <div>
                            <p class="text-[#666]">Annual Rainfall</p>
                            <p class="font-bold text-[#2e7d32]">{weatherData.precipitation.lastYear} mm</p>
                        </div>
                    </div>
                </div>

                <!-- AI Recommendations -->
                {#if field}
                {@const aiRec = getAIRecommendations(field.soilType, field.type, editableWidth)}
                {@const companionInfo = getCompanionCrop(primaryCrop)}
                <div class="sketch-box p-5 bg-[#fff8e1]">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-xl">💡</span>
                        <h5 class="font-bold text-[#f57c00]">AI Recommended Configuration</h5>
                    </div>
                    
                    <div class="space-y-4">
                        <!-- AI Reasoning -->
                        <div class="sketch-box p-3 bg-white">
                            <p class="text-sm text-[#555] italic">"{aiRec.reasoning}"</p>
                        </div>

                        <!-- Primary Crop Recommendation -->
                        <div>
                            <p class="text-sm font-semibold text-[#555] mb-2">🌾 Primary Crop</p>
                            <div class="sketch-box p-4 bg-white">
                                <div class="space-y-2">
                                    <div class="flex items-center gap-2">
                                        <span class="text-sm text-[#666]">AI Suggests:</span>
                                        <span class="font-bold text-[#2e7d32]">{aiRec.primaryCrop}</span>
                                        <span class="text-xs text-[#666]">(optimal for {field.soilType} soil)</span>
                                    </div>
                                    <div>
                                        <label class="block text-xs text-[#666] mb-1">Edit to recalculate companion crop:</label>
                                        <input 
                                            type="text" 
                                            bind:value={primaryCrop}
                                            class="sketch-box w-full px-3 py-2 bg-[#faf9f6] text-[#333] font-semibold focus:outline-none focus:ring-2 focus:ring-[#a5d6a7]"
                                            placeholder="Enter crop name"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Intercropping Recommendation -->
                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <p class="text-sm font-semibold text-[#555]">🌿 Intercropping</p>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        bind:checked={useIntercropping}
                                        class="w-4 h-4 text-[#2e7d32] focus:ring-[#a5d6a7] rounded"
                                    />
                                    <span class="text-xs text-[#666]">Enable</span>
                                </label>
                            </div>
                            <div class="sketch-box p-4 bg-white">
                                {#if useIntercropping}
                                <div class="space-y-3">
                                    <div class="flex items-center gap-2">
                                        <span class="text-xs text-[#666]">AI Suggests:</span>
                                        <span class="font-bold text-[#f57c00]">{companionInfo.crop}</span>
                                        <div class="sketch-button bg-[#e8f5e9] text-[#2e7d32] px-2 py-0.5 text-xs">
                                            {companionInfo.strategy === 'alternate_rows' ? 'Alternate Rows' : 'Same Row'}
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-xs text-[#666] mb-1">Secondary Crop:</label>
                                        <input 
                                            type="text" 
                                            bind:value={secondaryCrop}
                                            class="sketch-box w-full px-3 py-2 bg-[#faf9f6] text-[#333] font-semibold focus:outline-none focus:ring-2 focus:ring-[#f57c00]"
                                            placeholder="Enter companion crop"
                                        />
                                    </div>
                                    <div>
                                        <label class="block text-xs text-[#666] mb-2">Strategy:</label>
                                        <div class="flex gap-2">
                                            <label class="flex-1 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    bind:group={intercroppingStrategy}
                                                    value="alternate_rows"
                                                    class="hidden peer"
                                                />
                                                <div class="sketch-button bg-white peer-checked:bg-[#e8f5e9] peer-checked:text-[#2e7d32] text-[#666] px-3 py-2 text-xs text-center">
                                                    Alternate Rows
                                                </div>
                                            </label>
                                            <label class="flex-1 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    bind:group={intercroppingStrategy}
                                                    value="same_row"
                                                    class="hidden peer"
                                                />
                                                <div class="sketch-button bg-white peer-checked:bg-[#e8f5e9] peer-checked:text-[#2e7d32] text-[#666] px-3 py-2 text-xs text-center">
                                                    Same Row
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                    <div class="pt-2 border-t border-[#333] opacity-20"></div>
                                    <p class="text-xs text-[#666] italic">💡 {companionInfo.reason}</p>
                                </div>
                                {:else}
                                <p class="text-sm text-[#666]">Intercropping disabled. Enable to add a companion crop.</p>
                                {/if}
                            </div>
                        </div>

                        <!-- Spacing Configuration -->
                        <div>
                            <p class="text-sm font-semibold text-[#555] mb-2">📏 Spacing Configuration</p>
                            <div class="grid grid-cols-2 gap-3">
                                <div class="sketch-box p-4 bg-white">
                                    <div class="space-y-2">
                                        <div class="flex items-center gap-2">
                                            <span class="text-xs text-[#666]">AI Suggests:</span>
                                            <span class="font-bold text-[#2e7d32]">{aiRec.numberOfRows}</span>
                                        </div>
                                        <div>
                                            <label class="block text-xs text-[#666] mb-1">Number of Rows:</label>
                                            <input 
                                                type="number" 
                                                bind:value={numberOfRows}
                                                min="1"
                                                class="sketch-box w-full px-3 py-2 bg-[#faf9f6] text-[#333] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#a5d6a7]"
                                            />
                                        </div>
                                        <p class="text-xs text-[#666] italic">
                                            {#if useIntercropping && intercroppingStrategy === 'alternate_rows'}
                                                💡 Even number recommended for alternating
                                            {:else}
                                                💡 Based on {editableWidth}m width
                                            {/if}
                                        </p>
                                    </div>
                                </div>
                                <div class="sketch-box p-4 bg-white">
                                    <div class="space-y-2">
                                        <div class="flex items-center gap-2">
                                            <span class="text-xs text-[#666]">AI Suggests:</span>
                                            <span class="font-bold text-[#2e7d32]">{aiRec.spacingBetweenCrops}m</span>
                                        </div>
                                        <div>
                                            <label class="block text-xs text-[#666] mb-1">Plant Spacing (m):</label>
                                            <input 
                                                type="number" 
                                                bind:value={spacingBetweenCrops}
                                                min="0.1"
                                                step="0.05"
                                                class="sketch-box w-full px-3 py-2 bg-[#faf9f6] text-[#333] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#a5d6a7]"
                                            />
                                        </div>
                                        <p class="text-xs text-[#666] italic">
                                            {#if useIntercropping && intercroppingStrategy === 'same_row'}
                                                💡 Wider spacing for same-row
                                            {:else}
                                                💡 Standard spacing
                                            {/if}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Calculated Plant Count -->
                        <div>
                            <p class="text-sm font-semibold text-[#555] mb-2">📊 Calculated Plant Count</p>
                            <div class="sketch-box p-5 bg-[#e8f5e9]">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <p class="text-sm text-[#555] mb-1">{primaryCrop}</p>
                                        <p class="font-bold text-[#2e7d32] text-3xl pencil-text">{totalPrimaryPlants || 0}</p>
                                        <p class="text-xs text-[#666] mt-1">plants</p>
                                    </div>
                                    {#if useIntercropping}
                                    <div>
                                        <p class="text-sm text-[#555] mb-1">{secondaryCrop}</p>
                                        <p class="font-bold text-[#f57c00] text-3xl pencil-text">{totalSecondaryPlants || 0}</p>
                                        <p class="text-xs text-[#666] mt-1">plants</p>
                                    </div>
                                    {/if}
                                </div>
                                <div class="pt-3 border-t-2 border-[#2e7d32] opacity-20"></div>
                                <div class="mt-3 text-xs text-[#666]">
                                    <p><strong>Field dimensions:</strong> {editableLength}m × {editableWidth}m</p>
                                    <p><strong>Plants per row:</strong> {Math.floor(editableLength / spacingBetweenCrops)}</p>
                                    {#if useIntercropping && intercroppingStrategy === 'alternate_rows'}
                                    <p><strong>Strategy:</strong> {Math.ceil(numberOfRows / 2)} rows of {primaryCrop}, {Math.floor(numberOfRows / 2)} rows of {secondaryCrop}</p>
                                    {:else if useIntercropping && intercroppingStrategy === 'same_row'}
                                    <p><strong>Strategy:</strong> Alternating {primaryCrop} and {secondaryCrop} in each row</p>
                                    {/if}
                                </div>
                            </div>
                        </div>

                        <!-- Save Button -->
                        <button class="sketch-button bg-[#a5d6a7] text-[#1b5e20] px-6 py-3 font-bold hover:bg-[#81c784] w-full">
                            💾 Save Planting Configuration
                        </button>
                    </div>
                </div>
                {/if}

                <p class="text-xs text-[#666] mt-3 text-center">
                    💡 Recommendations are based on soil analysis and historical weather data
                </p>
            </div>
        </div>
        {:else if activeTab === 'activities'}
        <!-- Activity Planner Tab -->
        <div class="space-y-6">
            <!-- AI Assistant Header -->
            <div class="sketch-box p-6 bg-[#e1f5fe]">
                <div class="flex items-start gap-4">
                    <div class="text-4xl">🤖</div>
                    <div class="flex-1">
                        <h3 class="text-2xl font-bold pencil-text text-[#0277bd] mb-2">AI Activity Assistant</h3>
                        <p class="text-[#555] mb-3">
                            Based on your planting configuration for <strong>{primaryCrop}</strong>
                            {#if useIntercropping}
                                and <strong>{secondaryCrop}</strong>
                            {/if}, here's a recommended activity schedule:
                        </p>
                        <div class="sketch-box p-3 bg-white">
                            <p class="text-sm text-[#666] italic">
                                💡 Activities are automatically scheduled based on crop type, growth cycle, and best agricultural practices
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Activity Timeline -->
            <div class="sketch-box p-6 bg-white">
                <h4 class="text-xl font-bold text-[#2e7d32] mb-6">📅 Recommended Activity Schedule</h4>

                <div class="space-y-3">
                    {#each activityRecommendations as activity, index}
                    <div class="sketch-box p-5 bg-[#faf9f6] hover:bg-[#f1f8e9] transition-colors">
                        <div class="flex items-start gap-4">
                            <div class="flex-shrink-0 w-12 h-12 rounded-full bg-[#e8f5e9] flex items-center justify-center font-bold text-[#2e7d32]">
                                {index + 1}
                            </div>
                            <div class="flex-1">
                                <div class="flex justify-between items-start mb-2">
                                    <div>
                                        <h5 class="font-bold text-[#2e7d32] text-lg">{activity.activity}</h5>
                                        <p class="text-sm text-[#666] mt-1">{activity.description}</p>
                                    </div>
                                    <div class="flex gap-2">
                                        <span class="sketch-button px-3 py-1 text-xs {
                                            activity.priority === 'High' ? 'bg-[#ffebee] text-[#c62828]' :
                                            activity.priority === 'Medium' ? 'bg-[#fff8e1] text-[#f57c00]' :
                                            'bg-[#e8f5e9] text-[#2e7d32]'
                                        }">
                                            {activity.priority} Priority
                                        </span>
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 gap-4 mt-3">
                                    <div>
                                        <p class="text-xs text-[#555] mb-1">📅 Suggested Date</p>
                                        <p class="font-semibold text-[#333]">{activity.suggestedDate}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-[#555] mb-1">⏱️ Duration</p>
                                        <p class="font-semibold text-[#333]">{activity.duration}</p>
                                    </div>
                                </div>
                                <div class="mt-3 flex gap-2">
                                    <button class="sketch-button bg-white text-[#555] px-3 py-1 text-sm hover:bg-[#f5f5f5]">
                                        ✏️ Edit Date
                                    </button>
                                    <button class="sketch-button bg-white text-[#555] px-3 py-1 text-sm hover:bg-[#f5f5f5]">
                                        📝 Add Notes
                                    </button>
                                    <button class="sketch-button bg-[#ffebee] text-[#c62828] px-3 py-1 text-sm hover:bg-[#ffcdd2]">
                                        🗑️ Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/each}
                </div>

                <!-- Save Button -->
                <button class="sketch-button bg-[#a5d6a7] text-[#1b5e20] px-6 py-3 font-bold hover:bg-[#81c784] w-full mt-6">
                    💾 Save Activities
                </button>
            </div>

            <!-- Summary Card -->
            <div class="sketch-box p-6 bg-[#fff8e1]">
                <h4 class="text-lg font-bold text-[#f57c00] mb-3">📊 Schedule Summary</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p class="text-sm text-[#555] mb-1">Total Activities</p>
                        <p class="font-bold text-[#333] text-2xl">{activityRecommendations.length}</p>
                    </div>
                    <div>
                        <p class="text-sm text-[#555] mb-1">High Priority</p>
                        <p class="font-bold text-[#c62828] text-2xl">
                            {activityRecommendations.filter(a => a.priority === 'High').length}
                        </p>
                    </div>
                    <div>
                        <p class="text-sm text-[#555] mb-1">First Activity</p>
                        <p class="font-bold text-[#333] text-lg">{activityRecommendations[0]?.suggestedDate}</p>
                    </div>
                    <div>
                        <p class="text-sm text-[#555] mb-1">Harvest Date</p>
                        <p class="font-bold text-[#2e7d32] text-lg">
                            {activityRecommendations[activityRecommendations.length - 1]?.suggestedDate}
                        </p>
                    </div>
                </div>
            </div>
        </div>
        {/if}
    </div>
{/if}
