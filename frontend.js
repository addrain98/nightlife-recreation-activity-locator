const singapore = [1.3521, 103.8198]

document.addEventListener("DOMContentLoaded", async function(){
    const map = initMap();

    const searchResultLayer = L.layerGroup();
    searchResultLayer.addTo(map);

    setupEventHandlers();

    function setupEventHandlers(){
        document.querySelector("#search-btn").addEventListener('click', async function(){
            const searchTerms = document.querySelector("#search-terms").value;
            const centerOfMap = map.getBounds().getCenter();
            const results = await find(searchTerms, centerOfMap.lat, centerOfMap.lng, 10000);
            displaySearchResults(results);
        })
    }

   

    function displaySearchResults(results) {
        
        for (let r of results.results) {
            const lat = r.geocodes.main.latitude;
            const lng = r.geocodes.main.longitude;
            const coordinate = [lat, lng];
            const marker = L.marker(coordinate);
            const isUnderNightClubCategory = r.categories.some(category => category.id === 10032);
            if (isUnderNightClubCategory && isInSG(lat, lng)) {
                marker.addTo(searchResultLayer);
            }
            marker.bindPopup(`<h1>${r.name}<\h1>`)
            marker.addEventListener('click', function(){
                map.flyTo(coordinate, 16);
            })
        }
    } 

    function isInSG(lat, lng) {
        const latMin = 1.22;
        const latMax = 1.47;
        const lngMin = 103.6;
        const lngMax = 104.0;
    
        return lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax;
    }

});