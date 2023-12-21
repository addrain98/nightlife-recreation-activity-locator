const singapore = [1.3521, 103.8198]
let coordinate;

document.addEventListener("DOMContentLoaded", async function(){
    const map = initMap();
    const nightclubLayer = L.layerGroup().addTo(map);
    const barLayer = L.layerGroup().addTo(map);
    const searchContainer = document.getElementById('search-container');
    const mapContainer = document.getElementById('map-container');


    setupEventHandlers();

    function setupEventHandlers(){
        document.querySelector("#search-icon").addEventListener('click', async function(){
            searchContainer.classList.replace('hidden', 'visible');
            mapContainer.classList.replace('full', 'shrink');
            map.invalidateSize();

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
        const searchResultDiv = document.querySelector("#search-results");
        searchResultDiv.innerHTML = '';
        for (let r of results.results) {
            const marker = addMarkerToMap(map,r,type);
            marker.addTo(layerGroup);   
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
        const coordinate = [lat, lng];
        const marker = L.marker(coordinate);
    
    
        if (isNightClubCategory(r.categories) && isInSG(lat, lng)) {
            marker.addTo(nightclubLayer);
        }
        else if (isBarCategory(r.categories)&& isInSG(lat, lng)) {
            marker.addTo(barLayer);  
        }

        function createCarouselElement(r) {
            const carousel = document.createElement('div');
            carousel.id = `carousel${r.id}`
            carousel.classList.add('carousel', 'slide');

            const carouselInner = document.createElement('div');
            carouselInner.classList.add('carousel-inner');
            carousel.appendChild(carouselInner);

            const prevControl = document.createElement('a');
            prevControl.classList.add('carousel-control-prev');
            prevControl.href = `#carousel${r.id}`;
            prevControl.setAttribute('role', 'button');
            prevControl.setAttribute('data-bs-slide', 'prev'); 
            prevControl.innerHTML = '<span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Previous</span>';
            carousel.appendChild(prevControl);

            
            const nextControl = document.createElement('a');
            nextControl.classList.add('carousel-control-next');
            nextControl.href = `#carousel${r.id}`;
            nextControl.setAttribute('role', 'button');
            nextControl.setAttribute('data-bs-slide', 'next'); 
            nextControl.innerHTML = '<span class="carousel-control-next-icon" aria-hidden="true"></span><span class="visually-hidden">Next</span>';
            carousel.appendChild(nextControl);

            return carousel;
        }

        async function loadPlacesPhoto(carousel, r) {
            let isFirstItem = true;
        
            const addPhotoToCarousel = (photoUrl, altText) => {
                const carouselItem = document.createElement('div');
                carouselItem.classList.add('carousel-item');
                if (isFirstItem) {
                    carouselItem.classList.add('active');
                    isFirstItem = false;
                }
        
                const img = document.createElement('img');
                img.classList.add('d-block', 'w-100');
                img.src = photoUrl;
                img.alt = altText;
        
                const captionDiv = document.createElement('div');
                captionDiv.classList.add('carousel-caption');
                captionDiv.classList.add('d-md-block'); 

                const title = document.createElement('h5');
                title.textContent = r.name; 
                console.log('Title set for:', r.name);
                captionDiv.appendChild(title);

                carouselItem.appendChild(img);
                carouselItem.appendChild(captionDiv);

                carousel.querySelector('.carousel-inner').appendChild(carouselItem);
            };
        
            if (isNightClubCategory(r.categories) && isInSG(lat, lng)) {
                let responses = await loadNightclubPhoto(r.fsq_id);
                responses.forEach(photo => {
                    const photoUrl = `${photo.prefix}400x400${photo.suffix}`;
                    addPhotoToCarousel(photoUrl, 'NightClub Photo', 'The Title of NightClub Photo');
                });
            }
            if (isBarCategory(r.categories) && isInSG(lat, lng)) {
                let responses = await loadBarPhoto(r.fsq_id);
                console.log(responses);
                responses.forEach(photo => {
                    const photoUrl = `${photo.prefix}400x400${photo.suffix}`;
                    addPhotoToCarousel(photoUrl, 'Bar Photo', 'The Title of Bar Photo');
                });
            }
        return carousel;
    
        }


        marker.bindPopup(function() {
            const element = document.createElement('div');
            element.classList.add('carousel-container');
            element.style.width = '200px'; 
            element.style.minHeight = '100px';
            const carousel = createCarouselElement(r);
            element.appendChild(carousel); 
            loadPlacesPhoto(carousel, r).then(()=>{
                let myCarouselElement = document.querySelector(`#carousel${r.id}`);
                if (myCarouselElement) {
                    let carouselInstance = new bootstrap.Carousel(myCarouselElement);
                    carouselInstance.cycle();
                } else {
                    console.error('Carousel element not found');
                }
            }).catch(error => {
                    console.error('Error loading photos:', error); 
            })
        
            return element;
        });
        
        marker.addEventListener('click', function() {
            map.flyTo(coordinate, 15);
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
        const latMax = 1.47;
        const lngMin = 103.6;
        const lngMax = 104.0;
    
        return lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax;
    }

});