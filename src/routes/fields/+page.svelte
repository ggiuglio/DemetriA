<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount, onDestroy } from 'svelte';
    import { fieldsService, type Field } from '$lib/services/fieldsService';
    
    let fields: Field[] = [];
    let loading = true;
    let unsubscribe: (() => void) | null = null;
    let showModal = false;
    let saving = false;
    
    // Form data
    let newField = {
        type: 'agriculture' as 'agriculture' | 'garden',
        name: '',
        length: 0,
        width: 0,
        unit: 'ha' as 'ha' | 'm²',
        crop: 'Not specified',
        status: 'Empty'
    };
    
    onMount(() => {
        // Subscribe to real-time Firestore updates
        unsubscribe = fieldsService.subscribeToFields((updatedFields) => {
            fields = updatedFields;
            loading = false;
        });
    });
    
    onDestroy(() => {
        if (unsubscribe) {
            unsubscribe();
        }
    });
    
    function openModal() {
        showModal = true;
        // Reset form
        newField = {
            type: 'agriculture',
            name: '',
            length: 0,
            width: 0,
            unit: 'ha',
            crop: 'Not specified',
            status: 'Empty'
        };
    }
    
    function closeModal() {
        showModal = false;
    }
    
    async function createField() {
        if (!newField.name || newField.length <= 0 || newField.width <= 0) {
            alert('Please fill in all required fields');
            return;
        }
        
        saving = true;
        try {
            await fieldsService.createField(newField);
            closeModal();
        } catch (error) {
            console.error('Error creating field:', error);
            alert('Failed to create field');
        } finally {
            saving = false;
        }
    }
    
    async function deleteField(fieldId: string, fieldName: string) {
        if (!confirm(`Are you sure you want to delete "${fieldName}"?`)) {
            return;
        }
        
        try {
            await fieldsService.deleteField(fieldId);
        } catch (error) {
            console.error('Error deleting field:', error);
            alert('Failed to delete field');
        }
    }
    
    // Calculate area for each field
    function calculateArea(field: Field) {
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
        <button 
            on:click={openModal}
            class="sketch-button bg-[#a5d6a7] text-[#1b5e20] px-6 py-3 font-bold hover:bg-[#81c784]"
        >
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
                            <button 
                                on:click={() => deleteField(field.id, field.name)}
                                class="sketch-button bg-[#ffebee] text-[#c62828] px-4 py-2 text-sm hover:bg-[#ffcdd2]"
                            >
                                Delete
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
                            <button 
                                on:click={() => deleteField(field.id, field.name)}
                                class="sketch-button bg-[#ffebee] text-[#c62828] px-4 py-2 text-sm hover:bg-[#ffcdd2]"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>

<!-- Modal for creating new field -->
{#if showModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" on:click={closeModal}>
        <div class="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 sketch-box" on:click|stopPropagation>
            <h3 class="text-3xl font-bold pencil-text text-[#2e7d32] mb-6">Add New Field</h3>
            
            <form on:submit|preventDefault={createField} class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-[#555] mb-2">Field Type</label>
                        <select bind:value={newField.type} class="w-full p-2 border-2 border-[#333] rounded">
                            <option value="agriculture">Agriculture</option>
                            <option value="garden">Garden</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-[#555] mb-2">Unit</label>
                        <select bind:value={newField.unit} class="w-full p-2 border-2 border-[#333] rounded">
                            <option value="ha">Hectares (ha)</option>
                            <option value="m²">Square Meters (m²)</option>
                        </select>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-semibold text-[#555] mb-2">Field Name *</label>
                    <input 
                        type="text" 
                        bind:value={newField.name}
                        placeholder="e.g., North Field"
                        class="w-full p-2 border-2 border-[#333] rounded"
                        required
                    />
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-[#555] mb-2">Length (meters) *</label>
                        <input 
                            type="number" 
                            bind:value={newField.length}
                            min="1"
                            placeholder="500"
                            class="w-full p-2 border-2 border-[#333] rounded"
                            required
                        />
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-[#555] mb-2">Width (meters) *</label>
                        <input 
                            type="number" 
                            bind:value={newField.width}
                            min="1"
                            placeholder="250"
                            class="w-full p-2 border-2 border-[#333] rounded"
                            required
                        />
                    </div>
                </div>
                
                <div class="flex gap-4 mt-6">
                    <button 
                        type="submit"
                        disabled={saving}
                        class="sketch-button bg-[#a5d6a7] text-[#1b5e20] px-6 py-3 font-bold hover:bg-[#81c784] flex-1 disabled:opacity-50"
                    >
                        {saving ? 'Creating...' : 'Create Field'}
                    </button>
                    <button 
                        type="button"
                        on:click={closeModal}
                        class="sketch-button bg-white text-[#333] px-6 py-3 hover:bg-[#f5f5f5]"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
