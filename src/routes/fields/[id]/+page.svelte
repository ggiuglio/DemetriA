<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { onDestroy } from 'svelte';
    import GoogleMap from '$lib/GoogleMap.svelte';
    import { fieldsService, type Field } from '$lib/services/fieldsService';
    import { sendPromptToGemini } from '$lib/gemini';
    
    let field: Field | null = null;
    let loading = true;
    let unsubscribe: (() => void) | null = null;
    
    // AI-generated harvest predictions
    let harvestPrediction: {
        harvestStartDate: string;
        expectedYieldPrimary: number;
        expectedYieldSecondary?: number;
        notes: string;
    } | null = null;
    let loadingPrediction = false;
    let predictionError: string | null = null;
    
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
    let isSoilEditMode = false;
    let savingSoil = false;
    let isPlantingEditMode = false;
    let savingPlanting = false;
    
    // Editable field details
    let editableLength = 0;
    let editableWidth = 0;
    let editableLat = 0;
    let editableLng = 0;
    let editableName = '';
    let editableStatus = '';
    let editableCrop = '';
    let editableNotes = '';
    let editableSoilType = '';
    let editablePH = 0;
    let editableStoniness = '';
    let editableDrainage = '';
    let editableIrrigation = '';
    let editablePlantedDate = '';
    let editableExpectedHarvest = '';
    
    // Editable address fields
    let editableStreet = '';
    let editableCity = '';
    let editableState = '';
    let editablePostalCode = '';
    let editableCountry = '';
    
    // Location edit mode
    let isLocationEditMode = false;
    let savingLocation = false;
    
    // Store original values for cancel
    let originalValues = {
        length: 0,
        width: 0,
        lat: 0,
        lng: 0,
        name: '',
        status: '',
        crop: '',
        notes: '',
        soilType: '',
        pH: 0,
        stoniness: '',
        drainage: '',
        irrigation: '',
        plantedDate: '',
        expectedHarvest: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
    };
    
    // Initialize editable values when field loads
    $: if (field && !isEditMode && !isLocationEditMode) {
        editableLength = field.length || 0;
        editableWidth = field.width || 0;
        editableLat = field.lat || 0;
        editableLng = field.lng || 0;
        editableName = field.name || '';
        editableStatus = field.status || '';
        editableCrop = field.crop || '';
        editableNotes = field.notes || '';
        editableSoilType = field.soilType || '';
        editablePH = field.pH || 0;
        editableStoniness = field.stoniness || '';
        editableDrainage = field.drainage || '';
        editableIrrigation = field.irrigation || '';
        editablePlantedDate = field.plantedDate || '';
        editableExpectedHarvest = field.expectedHarvest || '';
        editableStreet = field.street || '';
        editableCity = field.city || '';
        editableState = field.state || '';
        editablePostalCode = field.postalCode || '';
        editableCountry = field.country || '';
        
        // Store original values
        originalValues = {
            length: field.length || 0,
            width: field.width || 0,
            lat: field.lat || 0,
            lng: field.lng || 0,
            name: field.name || '',
            status: field.status || '',
            crop: field.crop || '',
            notes: field.notes || '',
            soilType: field.soilType || '',
            pH: field.pH || 0,
            stoniness: field.stoniness || '',
            drainage: field.drainage || '',
            irrigation: field.irrigation || '',
            plantedDate: field.plantedDate || '',
            expectedHarvest: field.expectedHarvest || '',
            street: field.street || '',
            city: field.city || '',
            state: field.state || '',
            postalCode: field.postalCode || '',
            country: field.country || ''
        };
    }
    
    function enterEditMode() {
        isEditMode = true;
    }
    
    function enterSoilEditMode() {
        isSoilEditMode = true;
    }
    
    function enterPlantingEditMode() {
        isPlantingEditMode = true;
    }
    
    function enterLocationEditMode() {
        isLocationEditMode = true;
    }
    
    function cancelLocationEdit() {
        // Revert location values
        editableStreet = originalValues.street;
        editableCity = originalValues.city;
        editableState = originalValues.state;
        editablePostalCode = originalValues.postalCode;
        editableCountry = originalValues.country;
        editableLat = originalValues.lat;
        editableLng = originalValues.lng;
        isLocationEditMode = false;
    }
    
    async function saveLocationChanges() {
        if (!field) return;
        
        savingLocation = true;
        try {
            // Build full address for geocoding
            const addressParts = [
                editableStreet,
                editableCity,
                editableState,
                editablePostalCode,
                editableCountry
            ].filter(part => part.trim() !== '');
            
            const fullAddress = addressParts.join(', ');
            console.log('Geocoding address:', fullAddress);
            
            // Geocode address to get lat/lng
            let lat = editableLat;
            let lng = editableLng;
            
            if (fullAddress) {
                try {
                    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
                    const geocodeResponse = await fetch(geocodeUrl);
                    const geocodeData = await geocodeResponse.json();
                    
                    console.log('Geocoding response:', geocodeData);
                    
                    if (geocodeData.status === 'OK' && geocodeData.results && geocodeData.results.length > 0) {
                        lat = geocodeData.results[0].geometry.location.lat;
                        lng = geocodeData.results[0].geometry.location.lng;
                        
                        console.log('Geocoded coordinates:', { lat, lng });
                        
                        // Update editable values with geocoded coordinates
                        editableLat = lat;
                        editableLng = lng;
                    } else {
                        console.warn('Geocoding failed:', geocodeData.status, geocodeData.error_message);
                        alert(`Could not find location for address: ${fullAddress}\n${geocodeData.error_message || 'Please check the address and try again.'}`);
                    }
                } catch (geocodeError) {
                    console.error('Geocoding error:', geocodeError);
                    alert('Error geocoding address. Please check your internet connection and try again.');
                    // Continue with manual lat/lng if geocoding fails
                }
            }
            
            const updates: any = {
                street: editableStreet,
                city: editableCity,
                state: editableState,
                postalCode: editablePostalCode,
                country: editableCountry,
                address: fullAddress,
                lat,
                lng
            };
            
            console.log('Saving location updates:', updates);
            
            await fieldsService.updateField(field.id, updates);
            isLocationEditMode = false;
        } catch (error) {
            console.error('Error saving location:', error);
            alert('Error saving location. Please try again.');
        } finally {
            savingLocation = false;
        }
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
        editablePlantedDate = originalValues.plantedDate;
        editableExpectedHarvest = originalValues.expectedHarvest;
        isEditMode = false;
    }
    
    function cancelSoilEdit() {
        // Revert soil values
        editableSoilType = originalValues.soilType;
        editablePH = originalValues.pH;
        editableStoniness = originalValues.stoniness;
        editableDrainage = originalValues.drainage;
        editableIrrigation = originalValues.irrigation;
        isSoilEditMode = false;
    }
    
    function cancelPlantingEdit() {
        // Revert planting values
        editablePrimaryCrop = originalPlantingValues.primaryCrop;
        editableUseIntercropping = originalPlantingValues.useIntercropping;
        editableSecondaryCrop = originalPlantingValues.secondaryCrop;
        editableIntercroppingStrategy = originalPlantingValues.intercroppingStrategy;
        editableNumberOfRows = originalPlantingValues.numberOfRows;
        editableSpacingBetweenCrops = originalPlantingValues.spacingBetweenCrops;
        editableRowSpacing = originalPlantingValues.rowSpacing;
        editablePlantingMethod = originalPlantingValues.plantingMethod;
        editableSeedingDate = originalPlantingValues.seedingDate;
        editableTransplantDate = originalPlantingValues.transplantDate;
        isPlantingEditMode = false;
    }
    
    async function saveChanges() {
        if (!field) return;
        
        saving = true;
        try {
            const updates: any = {
                length: editableLength,
                width: editableWidth,
                name: editableName,
                status: editableStatus,
                crop: editableCrop,
                notes: editableNotes
            };
            
            // Only include lat/lng if they have values
            if (editableLat) updates.lat = editableLat;
            if (editableLng) updates.lng = editableLng;
            if (editablePlantedDate) updates.plantedDate = editablePlantedDate;
            if (editableExpectedHarvest) updates.expectedHarvest = editableExpectedHarvest;
            
            await fieldsService.updateField(field.id, updates);
            isEditMode = false;
        } catch (error) {
            console.error('Error saving field:', error);
        } finally {
            saving = false;
        }
    }
    
    async function saveSoilChanges() {
        if (!field) return;
        
        savingSoil = true;
        try {
            const updates: any = {
                soilType: editableSoilType,
                pH: editablePH,
                stoniness: editableStoniness,
                drainage: editableDrainage,
                irrigation: editableIrrigation
            };
            
            await fieldsService.updateField(field.id, updates);
            isSoilEditMode = false;
        } catch (error) {
            console.error('Error saving soil details:', error);
        } finally {
            savingSoil = false;
        }
    }
    
    async function savePlantingChanges() {
        if (!field) return;
        
        savingPlanting = true;
        try {
            const updates: any = {
                crop: editablePrimaryCrop,
                useIntercropping: editableUseIntercropping,
                secondaryCrop: editableSecondaryCrop,
                intercroppingStrategy: editableIntercroppingStrategy,
                numberOfRows: editableNumberOfRows,
                spacingBetweenCrops: editableSpacingBetweenCrops,
                rowSpacing: editableRowSpacing,
                plantingMethod: editablePlantingMethod,
                seedingDate: editableSeedingDate,
                transplantDate: editableTransplantDate
            };
            
            await fieldsService.updateField(field.id, updates);
            isPlantingEditMode = false;
        } catch (error) {
            console.error('Error saving planting configuration:', error);
        } finally {
            savingPlanting = false;
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
    
    // Generate harvest predictions using Gemini AI
    async function generateHarvestPrediction() {
        if (!field || !editablePrimaryCrop) return;
        
        loadingPrediction = true;
        predictionError = null;
        
        try {
            // Build comprehensive prompt with all field data
            const plantingDateStr = editablePlantingMethod === 'seeding' && editableSeedingDate 
                ? `seeded on ${new Date(editableSeedingDate).toLocaleDateString()}`
                : editablePlantingMethod === 'transplant' && editableTransplantDate
                ? `transplanted on ${new Date(editableTransplantDate).toLocaleDateString()}`
                : 'planting date not set';
            
            // Build location string
            const locationParts = [editableCity, editableState, editableCountry].filter(p => p);
            const locationStr = locationParts.length > 0 ? locationParts.join(', ') : 'not specified';
            const coordsStr = editableLat && editableLng ? `${editableLat.toFixed(4)}°, ${editableLng.toFixed(4)}°` : 'not specified';
            
            const prompt = `You are an agricultural expert. Based on the following field and crop information, provide realistic harvest predictions.

Field Location:
- Address: ${locationStr}
- Coordinates: ${coordsStr}
- Climate Zone: Use the location to determine the appropriate climate zone and growing season
- Consider local weather patterns, frost dates, and seasonal variations for this location

Field Information:
- Field Size: ${editableLength}m × ${editableWidth}m (${editableArea.toFixed(2)} ${field.type === 'agriculture' ? 'hectares' : 'm²'})
- Soil Type: ${field.soilType || 'not specified'}
- pH Level: ${field.pH || 'not specified'}
- Drainage: ${field.drainage || 'not specified'}
- Stoniness: ${field.stoniness || 'not specified'}
- Irrigation: ${field.irrigation || 'not specified'}

Crop Configuration:
- Primary Crop: ${editablePrimaryCrop}
- Planting Method: ${editablePlantingMethod === 'seeding' ? 'Direct Seeding' : 'Transplant'}
- Planting Date: ${plantingDateStr}
- Number of Rows: ${editableNumberOfRows}
- Plant Spacing: ${editableSpacingBetweenCrops}m
- Row Spacing: ${editableRowSpacing}m
- Total Plants: ${totalPrimaryPlants}
${editableUseIntercropping ? `
Intercropping:
- Secondary Crop: ${editableSecondaryCrop}
- Strategy: ${editableIntercroppingStrategy === 'alternate_rows' ? 'Alternate Rows' : 'Same Row'}
- Total Secondary Plants: ${totalSecondaryPlants}
` : ''}

IMPORTANT: Calculate realistic yields based on:
1. Use these typical yield ranges per plant for reference:
   - Tomatoes (all varieties): 4-10 kg per plant per season
   - Peppers: 1-3 kg per plant
   - Lettuce: 0.3-0.5 kg per head
   - Zucchini/Cucumbers: 3-5 kg per plant
   - Beans/Peas: 0.5-1 kg per plant
   - Cabbage/Broccoli: 0.5-1.5 kg per head
   - Carrots: 0.1-0.2 kg per plant
   - Potatoes: 0.5-1 kg per plant
2. Adjust yields based on:
   - Soil quality (${field.soilType || 'not specified'}, pH ${field.pH || 'not specified'})
   - Spacing (${editableSpacingBetweenCrops}m between plants - closer spacing may reduce yield by 10-20%)
   - Drainage and irrigation (${field.drainage || 'not specified'}, ${field.irrigation || 'not specified'})
3. Calculate TOTAL yield: (yield per plant) × (${totalPrimaryPlants} plants)
4. For ${editablePrimaryCrop}, use the appropriate yield range from above and adjust for field conditions

Please provide:
1. Expected harvest start date (in format YYYY-MM-DD) - calculate from planting date and typical growing period for ${editablePrimaryCrop}
2. Total expected yield for ${editablePrimaryCrop} in kilograms (for all ${totalPrimaryPlants} plants)
${editableUseIntercropping ? `3. Total expected yield for ${editableSecondaryCrop} in kilograms (for all ${totalSecondaryPlants} plants)` : ''}
${editableUseIntercropping ? '4.' : '3.'} Brief notes about the harvest, including factors affecting yield (2-3 sentences)

Format your response as JSON only, no other text:
{
  "harvestStartDate": "YYYY-MM-DD",
  "expectedYieldPrimary": number,
  ${editableUseIntercropping ? '"expectedYieldSecondary": number,' : ''}
  "notes": "your notes here"
}`;

            const response = await sendPromptToGemini(prompt);
            
            // Parse JSON response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                harvestPrediction = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Could not parse AI response');
            }
        } catch (error) {
            console.error('Error generating harvest prediction:', error);
            predictionError = 'Failed to generate prediction. Please try again.';
        } finally {
            loadingPrediction = false;
        }
    }
    
    // Automatically generate prediction when planting configuration changes
    $: if (field && editablePrimaryCrop && (editableSeedingDate || editableTransplantDate) && totalPrimaryPlants > 0) {
        generateHarvestPrediction();
    }
    
    // Recalculate area when dimensions change
    $: editableArea = field ? (field.type === 'agriculture' ? (editableLength * editableWidth / 10000) : (editableLength * editableWidth)) : 0;
    
    // Calculate total plants based on field size and spacing
    $: {
        if (editableNumberOfRows > 0 && editableSpacingBetweenCrops > 0 && editableLength > 0) {
            // Calculate plants per row based on field length and plant spacing
            const plantsPerRow = Math.floor(editableLength / editableSpacingBetweenCrops);
            
            if (editableUseIntercropping) {
                if (editableIntercroppingStrategy === 'alternate_rows') {
                    // Alternate rows: split rows between primary and secondary
                    const primaryRows = Math.ceil(editableNumberOfRows / 2);
                    const secondaryRows = Math.floor(editableNumberOfRows / 2);
                    totalPrimaryPlants = primaryRows * plantsPerRow;
                    totalSecondaryPlants = secondaryRows * plantsPerRow;
                } else if (editableIntercroppingStrategy === 'same_row') {
                    // Same row: alternate plants in each row
                    const plantsPerRowPerCrop = Math.floor(plantsPerRow / 2);
                    totalPrimaryPlants = editableNumberOfRows * plantsPerRowPerCrop;
                    totalSecondaryPlants = editableNumberOfRows * plantsPerRowPerCrop;
                }
            } else {
                // No intercropping: all rows are primary crop
                totalPrimaryPlants = editableNumberOfRows * plantsPerRow;
                totalSecondaryPlants = 0;
            }
        } else {
            totalPrimaryPlants = 0;
            totalSecondaryPlants = 0;
        }
    }
    
    // Activity log - empty, will be populated from DB
    const activities = [];
    
    // Planting configuration - will use field data from DB
    let primaryCrop = '';
    let useIntercropping = false;
    let secondaryCrop = '';
    let intercroppingStrategy = 'alternate_rows'; 
    let numberOfRows = 0;
    let spacingBetweenCrops = 0; // meters
    let rowSpacing = 0; // meters between rows
    let totalPrimaryPlants = 0;
    let totalSecondaryPlants = 0;
    let plantingMethod = 'seeding'; // 'seeding' or 'transplant'
    let seedingDate = '';
    let transplantDate = '';
    
    // Editable planting configuration
    let editablePrimaryCrop = '';
    let editableUseIntercropping = false;
    let editableSecondaryCrop = '';
    let editableIntercroppingStrategy = 'alternate_rows';
    let editableNumberOfRows = 0;
    let editableSpacingBetweenCrops = 0;
    let editableRowSpacing = 0;
    let editablePlantingMethod = 'seeding';
    let editableSeedingDate = '';
    let editableTransplantDate = '';
    
    // Store original planting values
    let originalPlantingValues = {
        primaryCrop: '',
        useIntercropping: false,
        secondaryCrop: '',
        intercroppingStrategy: 'alternate_rows',
        numberOfRows: 0,
        spacingBetweenCrops: 0,
        rowSpacing: 0,
        plantingMethod: 'seeding',
        seedingDate: '',
        transplantDate: ''
    };
    
    // Initialize from field data when available
    $: if (field && !isPlantingEditMode) {
        primaryCrop = field.crop || '';
        useIntercropping = field.useIntercropping || false;
        secondaryCrop = field.secondaryCrop || '';
        intercroppingStrategy = field.intercroppingStrategy || 'alternate_rows';
        numberOfRows = field.numberOfRows || 0;
        spacingBetweenCrops = field.spacingBetweenCrops || 0;
        rowSpacing = field.rowSpacing || 0;
        plantingMethod = field.plantingMethod || 'seeding';
        seedingDate = field.seedingDate || '';
        transplantDate = field.transplantDate || '';
        
        // Initialize editable values
        editablePrimaryCrop = primaryCrop;
        editableUseIntercropping = useIntercropping;
        editableSecondaryCrop = secondaryCrop;
        editableIntercroppingStrategy = intercroppingStrategy;
        editableNumberOfRows = numberOfRows;
        editableSpacingBetweenCrops = spacingBetweenCrops;
        editableRowSpacing = rowSpacing;
        editablePlantingMethod = plantingMethod;
        editableSeedingDate = seedingDate;
        editableTransplantDate = transplantDate;
        
        // Store original values
        originalPlantingValues = {
            primaryCrop,
            useIntercropping,
            secondaryCrop,
            intercroppingStrategy,
            numberOfRows,
            spacingBetweenCrops,
            rowSpacing,
            plantingMethod,
            seedingDate,
            transplantDate
        };
    }
    
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
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-2xl font-bold pencil-text text-[#2e7d32]">📍 Field Location</h3>
                    {#if !isLocationEditMode}
                    <button 
                        on:click={enterLocationEditMode}
                        class="sketch-button bg-[#a5d6a7] text-[#1b5e20] px-3 py-1 text-sm font-bold hover:bg-[#81c784]"
                    >
                        ✏️ Edit
                    </button>
                    {:else}
                    <div class="flex gap-2">
                        <button 
                            on:click={cancelLocationEdit}
                            class="sketch-button bg-[#e0e0e0] text-[#333] px-3 py-1 text-sm font-bold hover:bg-[#bdbdbd]"
                        >
                            Cancel
                        </button>
                        <button 
                            on:click={saveLocationChanges}
                            disabled={savingLocation}
                            class="sketch-button bg-[#2e7d32] text-white px-3 py-1 text-sm font-bold hover:bg-[#1b5e20] disabled:opacity-50"
                        >
                            {savingLocation ? 'Saving...' : '💾 Save'}
                        </button>
                    </div>
                    {/if}
                </div>
                
                <div class="h-[400px] mb-4 relative">
                    <GoogleMap 
                        latitude={editableLat || 41.9028} 
                        longitude={editableLng || 12.4964} 
                        zoom={editableLat && editableLng ? 15 : 5}
                        fieldName={field.name}
                    />
                    {#if !editableLat || !editableLng}
                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div class="sketch-box p-4 bg-[#fff8e1] border-2 border-[#f57c00] pointer-events-auto">
                            <p class="text-sm font-bold text-[#f57c00] mb-1">📍 Location Not Set</p>
                            <p class="text-xs text-[#666]">Enter an address below to set the field location</p>
                        </div>
                    </div>
                    {/if}
                </div>
                
                <!-- Address Form -->
                <div class="space-y-3">
                    <div>
                        <label class="block text-sm text-[#555] mb-1">Street Address</label>
                        {#if isLocationEditMode}
                        <input 
                            type="text" 
                            bind:value={editableStreet}
                            placeholder="123 Farm Road"
                            class="sketch-box w-full px-3 py-2 bg-[#faf9f6] text-[#333] font-semibold focus:outline-none focus:ring-2 focus:ring-[#a5d6a7]"
                        />
                        {:else}
                        <p class="font-bold text-[#333] px-3 py-2">{editableStreet || 'Not set'}</p>
                        {/if}
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm text-[#555] mb-1">City</label>
                            {#if isLocationEditMode}
                            <input 
                                type="text" 
                                bind:value={editableCity}
                                placeholder="City"
                                class="sketch-box w-full px-3 py-2 bg-[#faf9f6] text-[#333] font-semibold focus:outline-none focus:ring-2 focus:ring-[#a5d6a7]"
                            />
                            {:else}
                            <p class="font-bold text-[#333] px-3 py-2">{editableCity || 'Not set'}</p>
                            {/if}
                        </div>
                        
                        <div>
                            <label class="block text-sm text-[#555] mb-1">State/Province</label>
                            {#if isLocationEditMode}
                            <input 
                                type="text" 
                                bind:value={editableState}
                                placeholder="State"
                                class="sketch-box w-full px-3 py-2 bg-[#faf9f6] text-[#333] font-semibold focus:outline-none focus:ring-2 focus:ring-[#a5d6a7]"
                            />
                            {:else}
                            <p class="font-bold text-[#333] px-3 py-2">{editableState || 'Not set'}</p>
                            {/if}
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm text-[#555] mb-1">Postal Code</label>
                            {#if isLocationEditMode}
                            <input 
                                type="text" 
                                bind:value={editablePostalCode}
                                placeholder="12345"
                                class="sketch-box w-full px-3 py-2 bg-[#faf9f6] text-[#333] font-semibold focus:outline-none focus:ring-2 focus:ring-[#a5d6a7]"
                            />
                            {:else}
                            <p class="font-bold text-[#333] px-3 py-2">{editablePostalCode || 'Not set'}</p>
                            {/if}
                        </div>
                        
                        <div>
                            <label class="block text-sm text-[#555] mb-1">Country</label>
                            {#if isLocationEditMode}
                            <input 
                                type="text" 
                                bind:value={editableCountry}
                                placeholder="Country"
                                class="sketch-box w-full px-3 py-2 bg-[#faf9f6] text-[#333] font-semibold focus:outline-none focus:ring-2 focus:ring-[#a5d6a7]"
                            />
                            {:else}
                            <p class="font-bold text-[#333] px-3 py-2">{editableCountry || 'Not set'}</p>
                            {/if}
                        </div>
                    </div>
                    
                    {#if editableLat && editableLng}
                    <div class="pt-3 border-t border-[#e0e0e0]">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="font-semibold text-[#555] text-sm">Coordinates:</span>
                            <span class="text-[#333] text-sm">{editableLat.toFixed(6)}°, {editableLng.toFixed(6)}°</span>
                        </div>
                        <a 
                            href="https://www.google.com/maps/search/?api=1&query={editableLat},{editableLng}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="sketch-button bg-[#e3f2fd] text-[#0277bd] px-3 py-1 text-sm inline-block hover:bg-[#bbdefb]"
                        >
                            🗺️ Open in Google Maps
                        </a>
                    </div>
                    {/if}
                    
                    {#if isLocationEditMode}
                    <div class="sketch-box p-3 bg-[#fff8e1] text-xs text-[#666]">
                        💡 <strong>Tip:</strong> When you save, the address will be automatically geocoded to update the map location.
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
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="text-lg font-bold text-[#f57c00]">🌱 Soil Details</h4>
                        <div class="flex gap-2">
                            {#if isSoilEditMode}
                                <button 
                                    on:click={saveSoilChanges}
                                    disabled={savingSoil}
                                    class="sketch-button bg-[#a5d6a7] text-[#1b5e20] px-3 py-1 text-sm font-semibold hover:bg-[#81c784] disabled:opacity-50"
                                >
                                    {savingSoil ? '💾 Saving...' : '💾 Save'}
                                </button>
                                <button 
                                    on:click={cancelSoilEdit}
                                    disabled={savingSoil}
                                    class="sketch-button bg-[#ffebee] text-[#c62828] px-3 py-1 text-sm font-semibold hover:bg-[#ffcdd2] disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            {:else}
                                <button 
                                    on:click={enterSoilEditMode}
                                    class="sketch-button bg-[#fff8e1] text-[#333] px-3 py-1 text-sm font-semibold hover:bg-[#ffecb3]"
                                >
                                    ✏️ Edit
                                </button>
                            {/if}
                        </div>
                    </div>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-xs text-[#555] mb-1">Soil Type</label>
                            {#if isSoilEditMode}
                                <select 
                                    bind:value={editableSoilType}
                                    class="sketch-box w-full px-3 py-2 bg-white text-[#333] font-semibold focus:outline-none focus:ring-2 focus:ring-[#f57c00]"
                                >
                                    <option value="Clay">Clay</option>
                                    <option value="Sandy">Sandy</option>
                                    <option value="Loamy">Loamy</option>
                                    <option value="Silty">Silty</option>
                                    <option value="Peaty">Peaty</option>
                                    <option value="Chalky">Chalky</option>
                                </select>
                            {:else}
                                <div class="px-3 py-2">
                                    <span class="font-bold text-[#333]">{editableSoilType || 'Not set'}</span>
                                </div>
                            {/if}
                        </div>
                        <div>
                            <label class="block text-xs text-[#555] mb-1">pH Level</label>
                            {#if isSoilEditMode}
                                <input 
                                    type="number" 
                                    bind:value={editablePH}
                                    step="0.1"
                                    min="0"
                                    max="14"
                                    class="sketch-box w-full px-3 py-2 bg-white text-[#333] font-semibold focus:outline-none focus:ring-2 focus:ring-[#f57c00]"
                                    placeholder="pH (0-14)"
                                />
                            {:else}
                                <div class="px-3 py-2">
                                    <span class="font-bold text-[#333]">{editablePH || 'Not set'}</span>
                                    {#if editablePH}
                                        <span class="text-xs text-[#666] ml-2">
                                            ({#if editablePH < 6.0}Acidic{:else if editablePH > 7.5}Alkaline{:else}Neutral{/if})
                                        </span>
                                    {/if}
                                </div>
                            {/if}
                        </div>
                        <div>
                            <label class="block text-xs text-[#555] mb-1">Stoniness</label>
                            {#if isSoilEditMode}
                                <select 
                                    bind:value={editableStoniness}
                                    class="sketch-box w-full px-3 py-2 bg-white text-[#333] font-semibold focus:outline-none focus:ring-2 focus:ring-[#f57c00]"
                                >
                                    <option value="None">None</option>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            {:else}
                                <div class="px-3 py-2">
                                    <span class="font-bold text-[#333]">{editableStoniness || 'Not set'}</span>
                                </div>
                            {/if}
                        </div>
                        <div>
                            <label class="block text-xs text-[#555] mb-1">Drainage</label>
                            {#if isSoilEditMode}
                                <select 
                                    bind:value={editableDrainage}
                                    class="sketch-box w-full px-3 py-2 bg-white text-[#333] font-semibold focus:outline-none focus:ring-2 focus:ring-[#f57c00]"
                                >
                                    <option value="Poor">Poor</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Good">Good</option>
                                    <option value="Excellent">Excellent</option>
                                </select>
                            {:else}
                                <div class="px-3 py-2">
                                    <span class="font-bold text-[#333]">{editableDrainage || 'Not set'}</span>
                                </div>
                            {/if}
                        </div>
                        <div>
                            <label class="block text-xs text-[#555] mb-1">Irrigation</label>
                            {#if isSoilEditMode}
                                <select 
                                    bind:value={editableIrrigation}
                                    class="sketch-box w-full px-3 py-2 bg-white text-[#333] font-semibold focus:outline-none focus:ring-2 focus:ring-[#f57c00]"
                                >
                                    <option value="None">None</option>
                                    <option value="Manual">Manual</option>
                                    <option value="Drip">Drip</option>
                                    <option value="Sprinkler">Sprinkler</option>
                                    <option value="Flood">Flood</option>
                                </select>
                            {:else}
                                <div class="px-3 py-2">
                                    <span class="font-bold text-[#333]">{editableIrrigation || 'Not set'}</span>
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Field Configuration -->
        <div class="sketch-box p-6 bg-[#e8f5e9] mb-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-2xl font-bold pencil-text text-[#2e7d32]">🌱 Current Planting Configuration</h3>
                <div class="flex gap-2">
                    {#if isPlantingEditMode}
                        <button 
                            on:click={savePlantingChanges}
                            disabled={savingPlanting}
                            class="sketch-button bg-[#a5d6a7] text-[#1b5e20] px-4 py-2 text-sm font-semibold hover:bg-[#81c784] disabled:opacity-50"
                        >
                            {savingPlanting ? '💾 Saving...' : '💾 Save'}
                        </button>
                        <button 
                            on:click={cancelPlantingEdit}
                            disabled={savingPlanting}
                            class="sketch-button bg-[#ffebee] text-[#c62828] px-4 py-2 text-sm font-semibold hover:bg-[#ffcdd2] disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    {:else}
                        <button 
                            on:click={enterPlantingEditMode}
                            class="sketch-button bg-[#fff8e1] text-[#333] px-4 py-2 text-sm font-semibold hover:bg-[#ffecb3]"
                        >
                            ✏️ Edit
                        </button>
                    {/if}
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Crop Information -->
                <div class="sketch-box p-5 bg-white">
                    <h4 class="text-lg font-bold text-[#2e7d32] mb-3">Crops</h4>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-sm text-[#555] mb-1">Primary Crop</label>
                            {#if isPlantingEditMode}
                                <input 
                                    type="text" 
                                    bind:value={editablePrimaryCrop}
                                    class="sketch-box w-full px-3 py-2 bg-[#faf9f6] text-[#2e7d32] font-bold text-xl focus:outline-none focus:ring-2 focus:ring-[#a5d6a7]"
                                    placeholder="Enter crop name"
                                />
                            {:else}
                                <p class="font-bold text-[#2e7d32] text-2xl px-3 py-2">{editablePrimaryCrop || 'Not set'}</p>
                            {/if}
                        </div>
                        <div class="pt-3 border-t border-[#333] opacity-20"></div>
                        <div>
                            <label class="flex items-center gap-2 cursor-pointer mb-2">
                                {#if isPlantingEditMode}
                                    <input 
                                        type="checkbox" 
                                        bind:checked={editableUseIntercropping}
                                        class="w-4 h-4 text-[#2e7d32] focus:ring-[#a5d6a7] rounded"
                                    />
                                    <span class="text-sm font-semibold text-[#555]">Enable Intercropping</span>
                                {:else}
                                    <span class="text-sm text-[#555]">{editableUseIntercropping ? '✓ Intercropping Enabled' : 'No intercropping configured'}</span>
                                {/if}
                            </label>
                            {#if editableUseIntercropping}
                                <div class="space-y-3 mt-3">
                                    <div>
                                        <label class="block text-sm text-[#555] mb-1">Secondary Crop</label>
                                        {#if isPlantingEditMode}
                                            <input 
                                                type="text" 
                                                bind:value={editableSecondaryCrop}
                                                class="sketch-box w-full px-3 py-2 bg-[#faf9f6] text-[#f57c00] font-bold focus:outline-none focus:ring-2 focus:ring-[#f57c00]"
                                                placeholder="Enter secondary crop"
                                            />
                                        {:else}
                                            <p class="font-bold text-[#f57c00] text-xl px-3 py-2">{editableSecondaryCrop || 'Not set'}</p>
                                        {/if}
                                    </div>
                                    <div>
                                        <label class="block text-sm text-[#555] mb-1">Strategy</label>
                                        {#if isPlantingEditMode}
                                            <select 
                                                bind:value={editableIntercroppingStrategy}
                                                class="sketch-box w-full px-3 py-2 bg-[#faf9f6] text-[#333] font-semibold focus:outline-none focus:ring-2 focus:ring-[#a5d6a7]"
                                            >
                                                <option value="alternate_rows">Alternate Rows</option>
                                                <option value="same_row">Alternate in Same Row</option>
                                            </select>
                                        {:else}
                                            <p class="text-xs text-[#666] px-3 py-2">
                                                {editableIntercroppingStrategy === 'alternate_rows' ? 'Alternate Rows' : 'Alternate in Same Row'}
                                            </p>
                                        {/if}
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>

                <!-- Spacing & Plant Count -->
                <div class="sketch-box p-5 bg-white">
                    <h4 class="text-lg font-bold text-[#2e7d32] mb-3">Layout & Density</h4>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-sm text-[#555] mb-1">Number of Rows</label>
                            {#if isPlantingEditMode}
                                <input 
                                    type="number" 
                                    bind:value={editableNumberOfRows}
                                    min="0"
                                    class="sketch-box w-full px-3 py-2 bg-[#faf9f6] text-[#333] font-bold focus:outline-none focus:ring-2 focus:ring-[#a5d6a7]"
                                    placeholder="Number of rows"
                                />
                            {:else}
                                <p class="font-bold text-[#333] px-3 py-2">{editableNumberOfRows || 0}</p>
                            {/if}
                        </div>
                        <div>
                            <label class="block text-sm text-[#555] mb-1">Plant Spacing (m)</label>
                            {#if isPlantingEditMode}
                                <input 
                                    type="number" 
                                    bind:value={editableSpacingBetweenCrops}
                                    min="0"
                                    step="0.1"
                                    class="sketch-box w-full px-3 py-2 bg-[#faf9f6] text-[#333] font-bold focus:outline-none focus:ring-2 focus:ring-[#a5d6a7]"
                                    placeholder="Spacing in meters"
                                />
                            {:else}
                                <p class="font-bold text-[#333] px-3 py-2">{editableSpacingBetweenCrops || 0}m</p>
                            {/if}
                        </div>
                        <div>
                            <label class="block text-sm text-[#555] mb-1">Row Spacing (m)</label>
                            {#if isPlantingEditMode}
                                <input 
                                    type="number" 
                                    bind:value={editableRowSpacing}
                                    min="0"
                                    step="0.1"
                                    class="sketch-box w-full px-3 py-2 bg-[#faf9f6] text-[#333] font-bold focus:outline-none focus:ring-2 focus:ring-[#a5d6a7]"
                                    placeholder="Row spacing in meters"
                                />
                            {:else}
                                <p class="font-bold text-[#333] px-3 py-2">{editableRowSpacing || 0}m</p>
                            {/if}
                        </div>
                        <div class="pt-3 border-t border-[#333] opacity-20"></div>
                        <div class="flex justify-between">
                            <span class="text-sm text-[#555]">Total {editablePrimaryCrop || 'Primary'} Plants:</span>
                            <span class="font-bold text-[#2e7d32] text-xl">{totalPrimaryPlants}</span>
                        </div>
                        {#if editableUseIntercropping}
                        <div class="flex justify-between">
                            <span class="text-sm text-[#555]">Total {editableSecondaryCrop || 'Secondary'} Plants:</span>
                            <span class="font-bold text-[#f57c00] text-xl">{totalSecondaryPlants}</span>
                        </div>
                        {/if}
                    </div>
                </div>
            </div>
            
            <!-- Planting Dates Section -->
            <div class="sketch-box p-5 bg-white mt-6">
                <h4 class="text-lg font-bold text-[#2e7d32] mb-4">📅 Planting Dates</h4>
                <div class="space-y-4">
                    <!-- Planting Method Toggle -->
                    <div>
                        <label class="block text-sm text-[#555] mb-2">Planting Method</label>
                        {#if isPlantingEditMode}
                            <div class="flex gap-4">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        bind:group={editablePlantingMethod}
                                        value="seeding"
                                        class="w-4 h-4 text-[#2e7d32] focus:ring-[#a5d6a7]"
                                    />
                                    <span class="text-sm font-semibold text-[#333]">Direct Seeding</span>
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        bind:group={editablePlantingMethod}
                                        value="transplant"
                                        class="w-4 h-4 text-[#2e7d32] focus:ring-[#a5d6a7]"
                                    />
                                    <span class="text-sm font-semibold text-[#333]">Transplant</span>
                                </label>
                            </div>
                        {:else}
                            <p class="font-bold text-[#333] px-3 py-2">
                                {editablePlantingMethod === 'seeding' ? '🌱 Direct Seeding' : '🌿 Transplant'}
                            </p>
                        {/if}
                    </div>
                    
                    <!-- Date Input based on method -->
                    {#if editablePlantingMethod === 'seeding'}
                        <div>
                            <label class="block text-sm text-[#555] mb-1">Seeding Date</label>
                            {#if isPlantingEditMode}
                                <input 
                                    type="date" 
                                    bind:value={editableSeedingDate}
                                    class="sketch-box w-full px-3 py-2 bg-[#faf9f6] text-[#333] font-semibold focus:outline-none focus:ring-2 focus:ring-[#a5d6a7]"
                                />
                            {:else}
                                <p class="font-bold text-[#333] px-3 py-2">
                                    {editableSeedingDate ? new Date(editableSeedingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
                                </p>
                            {/if}
                        </div>
                    {:else}
                        <div>
                            <label class="block text-sm text-[#555] mb-1">Transplant Date</label>
                            {#if isPlantingEditMode}
                                <input 
                                    type="date" 
                                    bind:value={editableTransplantDate}
                                    class="sketch-box w-full px-3 py-2 bg-[#faf9f6] text-[#333] font-semibold focus:outline-none focus:ring-2 focus:ring-[#a5d6a7]"
                                />
                            {:else}
                                <p class="font-bold text-[#333] px-3 py-2">
                                    {editableTransplantDate ? new Date(editableTransplantDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
                                </p>
                            {/if}
                        </div>
                    {/if}
                </div>
            </div>
        </div>

        <!-- Expected Outcome -->
        {#if field && editablePrimaryCrop}
        <div class="sketch-box p-6 bg-[#fff8e1] mb-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-2xl font-bold pencil-text text-[#f57c00]">📈 Expected Outcome</h3>
                <button 
                    on:click={generateHarvestPrediction}
                    disabled={loadingPrediction}
                    class="sketch-button bg-[#f57c00] text-white px-3 py-1 text-sm font-bold hover:bg-[#e64a19] disabled:opacity-50"
                >
                    {loadingPrediction ? '🔄 Calculating...' : '🤖 Recalculate'}
                </button>
            </div>
            
            {#if loadingPrediction}
            <div class="sketch-box p-8 bg-white text-center">
                <div class="text-4xl mb-3">🤖</div>
                <p class="text-[#666] mb-2">AI is analyzing your field data...</p>
                <p class="text-xs text-[#999]">This may take a few seconds</p>
            </div>
            {:else if predictionError}
            <div class="sketch-box p-5 bg-[#ffebee]">
                <p class="text-[#c62828] mb-2">⚠️ {predictionError}</p>
                <button 
                    on:click={generateHarvestPrediction}
                    class="sketch-button bg-[#c62828] text-white px-3 py-1 text-sm"
                >
                    Try Again
                </button>
            </div>
            {:else if harvestPrediction}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Harvest Date -->
                <div class="sketch-box p-5 bg-white">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-2xl">🌾</span>
                        <h4 class="text-lg font-bold text-[#f57c00]">Expected Harvest Start</h4>
                    </div>
                    <p class="text-sm text-[#666] mb-2">AI-predicted date</p>
                    <p class="font-bold text-[#333] text-xl">
                        {new Date(harvestPrediction.harvestStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p class="text-xs text-[#666] mt-2">
                        {Math.ceil((new Date(harvestPrediction.harvestStartDate).getTime() - (editableSeedingDate ? new Date(editableSeedingDate).getTime() : editableTransplantDate ? new Date(editableTransplantDate).getTime() : Date.now())) / (1000 * 60 * 60 * 24))} days from planting
                    </p>
                </div>

                <!-- Expected Production -->
                <div class="sketch-box p-5 bg-white">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-2xl">📦</span>
                        <h4 class="text-lg font-bold text-[#0277bd]">Expected Production</h4>
                    </div>
                    <p class="text-sm text-[#666] mb-2">AI-estimated yield</p>
                    <div class="space-y-2">
                        <div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-[#555]">{editablePrimaryCrop}:</span>
                                <span class="font-bold text-[#2e7d32] text-2xl">{harvestPrediction.expectedYieldPrimary} kg</span>
                            </div>
                            <p class="text-xs text-[#666] text-right">{totalPrimaryPlants} plants</p>
                        </div>
                        {#if editableUseIntercropping && harvestPrediction.expectedYieldSecondary}
                        <div class="pt-2 border-t border-[#333] opacity-20"></div>
                        <div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-[#555]">{editableSecondaryCrop}:</span>
                                <span class="font-bold text-[#f57c00] text-2xl">{harvestPrediction.expectedYieldSecondary} kg</span>
                            </div>
                            <p class="text-xs text-[#666] text-right">{totalSecondaryPlants} plants</p>
                        </div>
                        {/if}
                    </div>
                </div>
            </div>

            <!-- AI Notes -->
            {#if harvestPrediction.notes}
            <div class="mt-4 sketch-box p-4 bg-white">
                <div class="flex items-start gap-2">
                    <span class="text-xl">💡</span>
                    <div>
                        <p class="font-semibold text-[#333] mb-1">AI Insights</p>
                        <p class="text-sm text-[#666]">{harvestPrediction.notes}</p>
                    </div>
                </div>
            </div>
            {/if}

            <p class="text-xs text-[#999] mt-3 text-center">
                🤖 Predictions generated by AI based on field conditions and crop data
            </p>
            {:else}
            <div class="sketch-box p-5 bg-white text-center">
                <p class="text-[#666] mb-3">Set planting date and configuration to generate predictions</p>
                <button 
                    on:click={generateHarvestPrediction}
                    class="sketch-button bg-[#a5d6a7] text-[#1b5e20] px-4 py-2 text-sm font-bold"
                >
                    Generate Prediction
                </button>
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
                        <p class="text-sm text-[#555] mb-4">Get personalized recommendations based on your field's soil type and conditions</p>
                    </div>
                </div>

                <!-- Field Analysis -->
                <div class="sketch-box p-4 bg-white mb-4">
                    <h5 class="font-bold text-[#333] mb-3">📊 Field Analysis</h5>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>
                            <p class="text-[#666]">Soil Type</p>
                            <p class="font-bold text-[#2e7d32]">{field.soilType || 'Not set'}</p>
                        </div>
                        <div>
                            <p class="text-[#666]">pH Level</p>
                            <p class="font-bold text-[#2e7d32]">{field.pH || 'Not set'}</p>
                        </div>
                        <div>
                            <p class="text-[#666]">Drainage</p>
                            <p class="font-bold text-[#2e7d32]">{field.drainage || 'Not set'}</p>
                        </div>
                    </div>
                </div>

                <!-- Planting Configuration -->
                <div class="sketch-box p-5 bg-[#fff8e1]">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-xl">💡</span>
                        <h5 class="font-bold text-[#f57c00]">Planting Configuration</h5>
                    </div>
                    <p class="text-sm text-[#666] mb-4">Configure your planting setup based on field dimensions and crop requirements</p>
                    
                    <div class="space-y-4">
                        <!-- Field Dimensions Summary -->
                        <div class="sketch-box p-3 bg-white">
                            <p class="text-sm text-[#555]">
                                <strong>Field Size:</strong> {editableLength}m × {editableWidth}m ({editableArea.toFixed(2)} {field.type === 'agriculture' ? 'ha' : 'm²'})
                            </p>
                        </div>

                        <!-- Calculated Plant Count -->
                        {#if totalPrimaryPlants > 0}
                        <div>
                            <p class="text-sm font-semibold text-[#555] mb-2">📊 Calculated Plant Count</p>
                            <div class="sketch-box p-5 bg-[#e8f5e9]">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <p class="text-sm text-[#555] mb-1">{editablePrimaryCrop || 'Primary Crop'}</p>
                                        <p class="font-bold text-[#2e7d32] text-3xl pencil-text">{totalPrimaryPlants || 0}</p>
                                        <p class="text-xs text-[#666] mt-1">plants</p>
                                    </div>
                                    {#if editableUseIntercropping}
                                    <div>
                                        <p class="text-sm text-[#555] mb-1">{editableSecondaryCrop || 'Secondary Crop'}</p>
                                        <p class="font-bold text-[#f57c00] text-3xl pencil-text">{totalSecondaryPlants || 0}</p>
                                        <p class="text-xs text-[#666] mt-1">plants</p>
                                    </div>
                                    {/if}
                                </div>
                                <div class="pt-3 border-t-2 border-[#2e7d32] opacity-20"></div>
                                <div class="mt-3 text-xs text-[#666]">
                                    <p><strong>Plants per row:</strong> {editableSpacingBetweenCrops > 0 ? Math.floor(editableLength / editableSpacingBetweenCrops) : 0}</p>
                                    {#if editableUseIntercropping && editableIntercroppingStrategy === 'alternate_rows'}
                                    <p><strong>Strategy:</strong> {Math.ceil(editableNumberOfRows / 2)} rows of {editablePrimaryCrop}, {Math.floor(editableNumberOfRows / 2)} rows of {editableSecondaryCrop}</p>
                                    {:else if editableUseIntercropping && editableIntercroppingStrategy === 'same_row'}
                                    <p><strong>Strategy:</strong> Alternating {editablePrimaryCrop} and {editableSecondaryCrop} in each row</p>
                                    {/if}
                                </div>
                            </div>
                        </div>
                        {/if}

                        <p class="text-xs text-[#666] text-center italic">
                            💡 Edit planting configuration in the Overview tab to update calculations
                        </p>
                    </div>
                </div>

                <p class="text-xs text-[#666] mt-3 text-center">
                    💡 Recommendations are based on soil analysis and field conditions
                </p>
            </div>
        </div>
        {:else if activeTab === 'activities'}
        <!-- Activity Planner Tab -->
        <div class="space-y-6">
            <div class="sketch-box p-6 bg-[#e1f5fe]">
                <h3 class="text-2xl font-bold pencil-text text-[#0277bd] mb-2">📋 Activity Planner</h3>
                <p class="text-[#555]">Coming soon - Track and manage field activities</p>
            </div>
        </div>
        {/if}
    </div>
{/if}
