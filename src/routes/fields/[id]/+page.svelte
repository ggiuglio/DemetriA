<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { onDestroy } from 'svelte';
    import GoogleMap from '$lib/GoogleMap.svelte';
    import { fieldsService, type Field } from '$lib/services/fieldsService';
    
    let field: Field | null = null;
    let loading = true;
    let unsubscribe: (() => void) | null = null;
    let expectedPrimaryYield
    
    $: fieldId = $page.params.id;
    
    // Reactive subscription that updates when fieldId changes
    $: if (fieldId) {
        loading = true;
        field = null;
        
        // Unsubscribe from previous subscription
        if (unsubscribe) {
            unsubscribe();
        }
        
        // Subscribe to real-time Firestore updates for this field
        unsubscribe = fieldsService.subscribeToField(fieldId, (updatedField) => {
            field = updatedField;
            loading = false;
        });
    }
    
    onDestroy(() => {
        if (unsubscribe) {
            unsubscribe();
        }
    });
    
    // Calculate area from length and width
    $: calculatedArea = field ? (field.type === 'agriculture' ? (field.length * field.width / 10000) : (field.length * field.width)) : 0;
    
    // Active tab
    let activeTab = 'overview'; // 'overview', 'planner', 'activities'
    
    // Edit mode
    let isEditMode = false;
    let saving = false;
    
    // Editable field details
    let editableLength = 0;
    let editableWidth = 0;
    let editableLat = 0;
    let editableLng = 0;
    let editableName = '';
    let editableStatus = '';
    let editableCrop = '';
    let editableNotes = '';
    
    // Store original values for cancel
    let originalValues = {
        length: 0,
        width: 0,
        lat: 0,
        lng: 0,
        name: '',
        status: '',
        crop: '',
        notes: ''
    };
    
    // Initialize editable values when field loads
    $: if (field && !isEditMode) {
        editableLength = field.length || 0;
        editableWidth = field.width || 0;
        editableLat = field.lat || 0;
        editableLng = field.lng || 0;
        editableName = field.name || '';
        editableStatus = field.status || '';
        editableCrop = field.crop || '';
        editableNotes = field.notes || '';
        
        // Store original values
        originalValues = {
            length: field.length || 0,
            width: field.width || 0,
            lat: field.lat || 0,
            lng: field.lng || 0,
            name: field.name || '',
            status: field.status || '',
            crop: field.crop || '',
            notes: field.notes || ''
        };
    }
    
    function enterEditMode() {
        isEditMode = true;
    }
    
    function cancelEdit() {
        // Revert to original values
        editableLength = originalValues.length;
        editableWidth = originalValues.width;
        editableLat = originalValues.lat;
        editableLng = originalValues.lng;
        editableName = originalValues.name;
        editableStatus = originalValues.status;
        editableCrop = originalValues.crop;
        editableNotes = originalValues.notes;
        isEditMode = false;
    }
    
    async function saveChanges() {
        if (!field) return;
        
        saving = true;
        try {
            // Only update field size and position
            const updates: any = {
                length: editableLength,
                width: editableWidth
            };
            
            // Only include lat/lng if they have values
            if (editableLat) updates.lat = editableLat;
            if (editableLng) updates.lng = editableLng;
            
            await fieldsService.updateField(field.id, updates);
            isEditMode = false;
        } catch (error) {
            console.error('Error saving field:', error);
        } finally {
            saving = false;
        }
    }
    
    async function deleteField() {
        if (!field) return;
        
        if (!confirm(`Are you sure you want to delete "${field.name}"? This action cannot be undone.`)) {
            return;
        }
        
        try {
            await fieldsService.deleteField(field.id);
            goto('/fields');
        } catch (error) {
            console.error('Error deleting field:', error);
        }
    }
    
    // Recalculate area when dimensions change
    $: editableArea = field ? (field.type === 'agriculture' ? (editableLength * editableWidth / 10000) : (editableLength * editableWidth)) : 0;
    
    // Activity log - empty, will be populated from DB
    const activities = [];
    
    // Planting configuration - will use field data from DB
    let primaryCrop = '';
    let useIntercropping = false;
    let secondaryCrop = '';
    let intercroppingStrategy; 
    let numberOfRows = 0;
    let spacingBetweenCrops = 0; // meters
    let rowSpacing = 0; // meters between rows
    
    // Initialize from field data when available
    $: if (field) {
        primaryCrop = field.crop || '';
    }

    let totalPrimaryPlants = 0;
    let totalSecondaryPlants = 0;
    
</script>

{#if loading}
    <div class="max-w-4xl">
        <div class="sketch-box p-8 bg-white text-center">
            <p class="text-[#555]">Loading field...</p>
        </div>
    </div>
{:else if !field}
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
            <div>
                <button 
                    on:click={deleteField}
                    class="sketch-button bg-[#ffebee] text-[#c62828] px-5 py-3 font-semibold hover:bg-[#ffcdd2]"
                >
                    🗑️ Delete Field
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
                    {#if editableLat && editableLng}
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
                    {/if}
                </div>
            </div>

            <!-- Field Details -->
            <div class="space-y-6">
                <!-- Field Details -->
                <div class="sketch-box p-5 bg-white">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="text-lg font-bold text-[#2e7d32]">📏 Field Details</h4>
                        <div class="flex gap-2">
                            {#if isEditMode}
                                <button 
                                    on:click={saveChanges}
                                    disabled={saving}
                                    class="sketch-button bg-[#a5d6a7] text-[#1b5e20] px-3 py-1 text-sm font-semibold hover:bg-[#81c784] disabled:opacity-50"
                                >
                                    {saving ? '� Saving...' : '💾 Save'}
                                </button>
                                <button 
                                    on:click={cancelEdit}
                                    disabled={saving}
                                    class="sketch-button bg-[#ffebee] text-[#c62828] px-3 py-1 text-sm font-semibold hover:bg-[#ffcdd2] disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            {:else}
                                <button 
                                    on:click={enterEditMode}
                                    class="sketch-button bg-[#fff8e1] text-[#333] px-3 py-1 text-sm font-semibold hover:bg-[#ffecb3]"
                                >
                                    ✏️ Edit
                                </button>
                            {/if}
                        </div>
                    </div>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-xs text-[#555] mb-1">Length (m)</label>
                            <input 
                                type="number" 
                                bind:value={editableLength}
                                readonly={!isEditMode}
                                class="sketch-box w-full px-3 py-2 bg-[#faf9f6] text-[#333] font-semibold focus:outline-none focus:ring-2 focus:ring-[#a5d6a7] {!isEditMode ? 'cursor-not-allowed opacity-75' : ''}"
                                placeholder="Length in meters"
                                min="1"
                            />
                        </div>
                        <div>
                            <label class="block text-xs text-[#555] mb-1">Width (m)</label>
                            <input 
                                type="number" 
                                bind:value={editableWidth}
                                readonly={!isEditMode}
                                class="sketch-box w-full px-3 py-2 bg-[#faf9f6] text-[#333] font-semibold focus:outline-none focus:ring-2 focus:ring-[#a5d6a7] {!isEditMode ? 'cursor-not-allowed opacity-75' : ''}"
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
                                readonly={!isEditMode}
                                step="0.0001"
                                class="sketch-box w-full px-3 py-2 bg-[#faf9f6] text-[#333] font-semibold focus:outline-none focus:ring-2 focus:ring-[#a5d6a7] {!isEditMode ? 'cursor-not-allowed opacity-75' : ''}"
                                placeholder="Latitude"
                            />
                        </div>
                        <div>
                            <label class="block text-xs text-[#555] mb-1">Longitude</label>
                            <input 
                                type="number" 
                                bind:value={editableLng}
                                readonly={!isEditMode}
                                step="0.0001"
                                class="sketch-box w-full px-3 py-2 bg-[#faf9f6] text-[#333] font-semibold focus:outline-none focus:ring-2 focus:ring-[#a5d6a7] {!isEditMode ? 'cursor-not-allowed opacity-75' : ''}"
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
                            <p class="font-bold text-[#2e7d32] text-2xl">{primaryCrop || 'Not set'}</p>
                        </div>
                        {#if useIntercropping}
                        <div class="pt-3 border-t border-[#333] opacity-20"></div>
                        <div>
                            <p class="text-sm text-[#555] mb-1">Secondary Crop (Intercropping)</p>
                            <p class="font-bold text-[#f57c00] text-xl">{secondaryCrop || 'Not set'}</p>
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
