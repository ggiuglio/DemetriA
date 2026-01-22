<script>
    import { onMount } from 'svelte';
    import { env } from '$env/dynamic/public';
    
    export let latitude = 0;
    export let longitude = 0;
    export let zoom = 15;
    export let fieldName = 'Field';
    
    let mapContainer;
    let map;
    let marker;
    
    onMount(() => {
        // Load Google Maps script
        if (!window.google) {
            const script = document.createElement('script');
            const apiKey = env.PUBLIC_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
            script.async = true;
            script.defer = true;
            script.onload = initMap;
            document.head.appendChild(script);
        } else {
            initMap();
        }
    });
    
    // Update map position when latitude or longitude changes
    $: if (map && marker && (latitude || longitude)) {
        const newPosition = { lat: latitude, lng: longitude };
        map.setCenter(newPosition);
        marker.setPosition(newPosition);
    }
    
    function initMap() {
        if (!mapContainer) return;
        
        const position = { lat: latitude, lng: longitude };
        
        map = new google.maps.Map(mapContainer, {
            center: position,
            zoom: zoom,
            mapTypeId: 'satellite',
            styles: [
                {
                    featureType: 'all',
                    elementType: 'labels',
                    stylers: [{ visibility: 'on' }]
                }
            ]
        });
        
        marker = new google.maps.Marker({
            position: position,
            map: map,
            title: fieldName,
            animation: google.maps.Animation.DROP
        });
        
        const infoWindow = new google.maps.InfoWindow({
            content: `<div style="font-family: 'Kalam', cursive; padding: 8px;">
                        <strong style="color: #2e7d32; font-size: 16px;">${fieldName}</strong>
                      </div>`
        });
        
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
    }
</script>

<div bind:this={mapContainer} class="w-full h-full rounded-lg sketch-border overflow-hidden"></div>

<style>
    div {
        min-height: 300px;
    }
</style>
