const singapore = [1.3521, 103.8198]
let coordinate;

document.addEventListener("DOMContentLoaded", async function(){
    const map = initMap();
    const nightclubLayer = L.layerGroup().addTo(map);
    const barLayer = L.layerGroup().addTo(map);

    setupEventHandlers();

    function setupEventHandlers(){
        document.querySelector("#search-btn").addEventListener('click', async function(){
            const searchTerms = document.querySelector("#search-terms").value;
            const centerOfMap = map.getBounds().getCenter();
            const nightclubResults = await findNightclubs(searchTerms, centerOfMap.lat, centerOfMap.lng, 10000);
            displaySearchResults(nightclubResults, nightclubLayer, 'nightclub');
            const barResults =await findBars(searchTerms, centerOfMap.lat, centerOfMap.lng, 10000);
            displaySearchResults(barResults, barLayer, 'bar');
        })
    }
    

   

    function displaySearchResults(results, layerGroup, type) {
        layerGroup.clearLayers();
        for (let r of results.results) {
            const marker = addMarkerToMap(map,r,type);
            marker.addTo(layerGroup);

            
                const searchResultDiv = document.querySelector("#search-results");
                const resultElement = document.createElement(`div`);
                const lat = r.geocodes.main.latitude;
                const lng = r.geocodes.main.longitude;
                const location = [lat, lng];
                resultElement.innerHTML = r.name;
                searchResultDiv.appendChild(resultElement);
                resultElement.classList.add("result-item");
                resultElement.addEventListener("click", function(){
                    map.flyTo(location, 16);
                    marker.openPopup();
                });

            
        }

    }

    function addMarkerToMap(map,r){
        const lat = r.geocodes.main.latitude;
        const lng = r.geocodes.main.longitude;
        coordinate = [lat, lng];
        const marker = L.marker(coordinate);
    
    
        if (isNightClubCategory(r.categories) && isInSG(lat, lng)) {
            marker.addTo(nightclubLayer);
        }
        else if (isBarCategory(r.categories)&& isInSG(lat, lng)) {
            marker.addTo(barLayer);
        }

        marker.bindPopup(function(){
            const element = document.createElement('div');
            element.innerHTML = `<h1>${r.name}</h1>`
            return element;
        });

        marker.addEventListener('click', function(){
            map.flyTo(coordinate, 16);
        });

        return marker;    
    }

    function isNightClubCategory(categories) {
        for (let i = 0; i < categories.length; i++) {
            if (categories[i].id === 10032) {
                return true; 
            }
        }
        return false; 
    }

    function isBarCategory(categories) {
        for (let i = 0; i < categories.length; i++) {
            if (categories[i].id === 13003) {
                return true; 
            }
        }
        return false; 
    }

    function isInSG(lat, lng) {
        const latMin = 1.22;
        const latMax = 1.45;
        const lngMin = 103.6;
        const lngMax = 104.0;
    
        return lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax;
    }

});