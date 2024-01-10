const singapore = [1.3521, 103.8198]
let coordinate;

document.addEventListener("DOMContentLoaded", async function(){
    const map = initMap();
    const nightclubLayer = L.layerGroup().addTo(map);
    const barLayer = L.layerGroup().addTo(map);
    const searchContainer = document.getElementById('search-container');
    const mapContainer = document.getElementById('map-container');
    const recentSearchContainer = document.getElementById('recent-search-container')
    const savedSearchContainer = document.getElementById('saved-search-container')



    let currentUserLocation = { lat: null, lng: null };
    const userIcon = L.icon({
        iconUrl: 'icon-image/marker.png', 
        iconSize: [80, 80], 
        iconAnchor: [40, 80], 
        popupAnchor: [0, -80]
    });
    const nightclubIcon = L.icon({
        iconUrl: 'icon-image/nightclub-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [0, -41]
    });
    
    const barIcon = L.icon({
        iconUrl: 'icon-image/bar-icon.png', 
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [0, -41]
    });


    function getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            console.error("Geolocation is not supported by this browser.")
        }
    }

    function showPosition(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        map.setView([latitude, longitude], 13);
        currentUserLocation = { lat: latitude, lng: longitude };
        const userLocationMarker = L.marker([latitude, longitude], { icon: userIcon });
        userLocationMarker.addTo(map);
    }

    function showError(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                console.error("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                console.error("Location information is unavailable.");
                break;
            case error.TIMEOUT:
                console.error("The request to get user location timed out.");
                break;
            case error.UNKNOWN_ERROR:
                console.error("An unknown error occurred.");
                break;
        }
    }

    const locateMeButton = document.getElementById('locate-me');
    locateMeButton.addEventListener('click', function() {
        getUserLocation();
    });

    setupEventHandlers();

    function setupEventHandlers(){
        document.querySelector("#search-icon").addEventListener('click', async function(){
            searchContainer.classList.replace('hidden', 'visible');
            mapContainer.classList.replace('full', 'shrink');
            recentSearchContainer.classList.replace('visible', 'hidden')
            map.invalidateSize();

            const searchTerms = document.querySelector("#search-terms").value;
            const centerOfMap = map.getBounds().getCenter();
            const nightclubResults = await findNightclubs(searchTerms, centerOfMap.lat, centerOfMap.lng, 10000, categoryIDs);
            displaySearchResults(nightclubResults, nightclubLayer, 'nightclub');
            const barResults =await findBars(searchTerms, centerOfMap.lat, centerOfMap.lng, 10000, categoryString);
            displaySearchResults(barResults, barLayer, 'bar');
        })

        document.querySelector("#close-btn").addEventListener('click',function(){
            searchContainer.classList.replace('visible','hidden');
            mapContainer.classList.replace('shrink', 'full');
            map.invalidateSize();
            document.querySelector("#search-terms").value = '';
            nightclubLayer.clearLayers();
            barLayer.clearLayers();
        })

        document.querySelector("#recent-icon").addEventListener('click', function(){
            searchContainer.classList.replace('visible', 'hidden');
            savedSearchContainer.classList.replace('visible', 'hidden');
            recentSearchContainer.classList.replace('hidden', 'visible');
        })

        document.querySelector("#saved-icon").addEventListener('click', function(){
            searchContainer.classList.replace('visible', 'hidden');
            recentSearchContainer.classList.replace('visible', 'hidden');
            savedSearchContainer.classList.replace('hidden', 'visible');
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

            const imageContainer = document.createElement('div');
            imageContainer.classList.add('result-image');
            resultElement.appendChild(imageContainer);

            updateImageContainer(imageContainer, r);
            
            const nameElement = document.createElement('div');
            nameElement.textContent = r.name;
            nameElement.classList.add("result-name");
            resultElement.appendChild(nameElement);
            
            const saveButton = document.createElement('i');
            saveButton.classList.add("fas", "fa-save", "save-icon");
            saveButton.addEventListener('click', function(event){
                event.stopPropagation();
                saveSearchResult(r);
                displaySavedSearches();
            })

            const directionIcon = document.createElement('i');
            directionIcon.classList.add('fas', 'fa-directions', 'direction-icon');
            directionIcon.addEventListener('click', function(event){
                event.stopPropagation();
                window.location.href = `https://www.google.com/maps/dir/Current+Location/${r.geocodes.main.latitude},${r.geocodes.main.longitude}`;
            });

            resultElement.appendChild(directionIcon);
            resultElement.appendChild(saveButton);
            searchResultDiv.appendChild(resultElement);
            resultElement.classList.add("result-item");
            resultElement.addEventListener("click", function(){
                map.flyTo(location, 16);
                marker.openPopup();

                saveToRecentSearches(r);
                displayRecentSearches();
            }); 
        }
    }

    function saveSearchResult(result) {
        let savedResults = JSON.parse(localStorage.getItem('savedSearches')) || [];
        savedResults.push(result);
        localStorage.setItem('savedSearches', JSON.stringify(savedResults));
    }

    function displaySavedSearches() {
        console.log("Displaying saved searches");
        let savedResults = JSON.parse(localStorage.getItem('savedSearches')) || [];
        console.log("Saved Results: ", savedResults); 
        savedSearchContainer.innerHTML = '';

        savedResults.forEach((savedItem) => {
            console.log("Creating item for: ", savedItem); 
            const savedDiv = document.createElement('div');
            savedDiv.className = 'saved-search-item';

            const savedImage = document.createElement('div');
            savedImage.classList.add('saved-item-image');
            savedItemImage(savedImage, savedItem)

            const savedName = document.createElement('div');
            savedName.className = 'saved-item-name';
            savedName.textContent = savedItem.name;
            
            const exitButton = document.createElement('button');
            exitButton.id = 'close-saved-btn';
            exitButton.className = 'saved-search-close';
            exitButton.innerHTML = '&times;';
            exitButton.onclick = function() {
                savedSearchContainer.classList.replace('visible', 'hidden');
                map.invalidateSize();
            }
            savedSearchContainer.appendChild(exitButton);
            savedSearchContainer.appendChild(savedDiv);
            savedDiv.appendChild(savedImage);
            savedDiv.appendChild(savedName);

            savedDiv.addEventListener('click', () => {
                if (savedItem.geocodes && savedItem.geocodes.main) {
                    const lat = savedItem.geocodes.main.latitude;
                    const lng = savedItem.geocodes.main.longitude;
                    const location = L.latLng(lat, lng);
                    map.flyTo(location, 16);

                    if(savedItem.marker){
                        savedItem.marker.openPopup(); 
                    }
                    
                }
                else{
                    console.error('Invalid location data for search item:', savedItem);
                }
            })
        })
    }


    function saveToRecentSearches(result) {
        let recentSearches = JSON.parse(sessionStorage.getItem('recentSearches')) || [];
        recentSearches.push(result);
        sessionStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }

    function displayRecentSearches() {
        let recentSearches = JSON.parse(sessionStorage.getItem('recentSearches')) || [];
        recentSearchContainer.innerHTML = '';

        recentSearches.forEach((searchItem) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'recent-search-item';

            const itemImage = document.createElement('div');
            itemImage.classList.add('recent-item-image');
            updateItemImage(itemImage, searchItem);

            const itemName = document.createElement('div');
            itemName.className = 'recent-search-name';
            itemName.textContent = searchItem.name;

            const saveButton = document.createElement('i');
            saveButton.classList.add("fas", "fa-save", "save-icon");
            saveButton.addEventListener('click', function(event){
                event.stopPropagation();
                saveSearchResult(r);
                displaySavedSearches();
            })

            const closeButton = document.createElement('button');
            closeButton.id = 'close-recent-btn'
            closeButton.className = 'recent-search-close';
            closeButton.innerHTML = '&times;';
            closeButton.onclick = function() {
                const index = recentSearches.findIndex(item => item === searchItem);
                if (index !== -1) {
                    recentSearches.splice(index, 1);
                    sessionStorage.setItem('recentSearches', JSON.stringify(recentSearches));
                    itemDiv.remove();
                    recentSearchContainer.classList.replace('visible', 'hidden');
                    map.invalidateSize();
                }
            };
        
            recentSearchContainer.appendChild(closeButton);

            itemDiv.appendChild(itemImage);
            itemDiv.appendChild(itemName);

            recentSearchContainer.appendChild(itemDiv);

            itemDiv.addEventListener('click', () => {
                if (searchItem.geocodes && searchItem.geocodes.main) {
                    const lat = searchItem.geocodes.main.latitude;
                    const lng = searchItem.geocodes.main.longitude;
                    const location = L.latLng(lat, lng);
                    map.flyTo(location, 16);

                    if(searchItem.marker){
                        searchItem.marker.openPopup(); 
                    }
                    
                }
                else{
                    console.error('Invalid location data for search item:', searchItem);
                }
            })
        })

    }

    async function updateImageContainer(imageContainer, r) {
        let photo = [];
        if (isNightClubCategory(r.categories)) {
            photo = await loadNightclubPhoto(r.fsq_id);
        } else if (isBarCategory(r.categories)) {
            photo = await loadBarPhoto(r.fsq_id);
        }
        if (photo.length > 0) {
            const firstPhoto = photo[0];
            const img = document.createElement('img');
            img.src = `${firstPhoto.prefix}100x100${firstPhoto.suffix}`;
            img.alt = 'Photo';
            img.classList.add('result-image');
            imageContainer.appendChild(img);
        }
        else {
            console.log('No photos available for ' +r.name+ r.fsq_id);
        }
    }

    async function savedItemImage(savedImage, savedItem) {
        if (!savedItem || !savedItem.fsq_id || !savedItem.name) {
            console.error('Invalid search item:', savedItem);
            return;
        }
    
        try {
            let photo = [];
            if (isNightClubCategory(savedItem.categories)) {
                photo = await loadNightclubPhoto(savedItem.fsq_id);
            } else if (isBarCategory(savedItem.categories)) {
                photo = await loadBarPhoto(savedItem.fsq_id);
            }
    
            if (photo.length > 0) {
                const firstPhoto = photo[0];
                const imageUrl = `${firstPhoto.prefix}100x100${firstPhoto.suffix}`;
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = 'Photo of ' + savedItem.name; // Improved alt text
                img.classList.add('saved-item-image'); // Assuming 'saved-item-image' is a defined class
                savedImage.appendChild(img);
            } else {
                console.log('No photos available for ' + savedItem.name + ' (' + savedItem.fsq_id + ')');
            }
        } catch (error) {
            console.error('Error loading image for saved item:', savedItem, error);
        }
    }

    async function updateItemImage(itemImage, searchItem) {
    
        if (!searchItem || !searchItem.fsq_id || !searchItem.name) {
            console.error('Invalid search item:', searchItem);
            return; // Exit the function if the search item is not valid
        }

        let photo = [];
        if (isNightClubCategory(searchItem.categories)) {
            photo = await loadNightclubPhoto(searchItem.fsq_id);
        } else if (isBarCategory(searchItem.categories)) {
            photo = await loadBarPhoto(searchItem.fsq_id);
        }
        if (photo.length > 0) {
            const firstPhoto = photo[0];
            const img = document.createElement('img');
            img.src = `${firstPhoto.prefix}100x100${firstPhoto.suffix}`;
            img.alt = 'Photo';
            img.classList.add('recent-item-image');
            itemImage.appendChild(img);
        }
        else {
            console.log('No photos available for ' +searchItem.name+ searchItem.fsq_id);
        }
    }

    function addMarkerToMap(map,r){
        const lat = r.geocodes.main.latitude;
        const lng = r.geocodes.main.longitude;
        const coordinate = [lat, lng];
      

        const marker = L.marker(coordinate, L.icon({icon: {iconUrl: './icon-image/bar-icon.png', 
                                                     iconSize: [26,26] }}));
    
        if (isNightClubCategory(r.categories) && isInSG(lat, lng)) {
            marker.addTo(nightclubLayer);
        }
        else if (isBarCategory(r.categories)&& isInSG(lat, lng)) {
            marker.addTo(barLayer);  
        }

        function createCarouselElement(r) {

            const carousel = document.createElement('div');
            carousel.id = `carousel${r.fsq_id}`
            carousel.classList.add('carousel', 'slide');

            const carouselInner = document.createElement('div');
            carouselInner.classList.add('carousel-inner');
            carousel.appendChild(carouselInner);

            const prevControl = document.createElement('a');
            prevControl.classList.add('carousel-control-prev');
            prevControl.href = `#carousel${r.fsq_id}`;
            prevControl.setAttribute('role', 'button');
            prevControl.setAttribute('data-bs-slide', 'prev'); 
            prevControl.innerHTML = '<span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Previous</span>';
            carousel.appendChild(prevControl);

            
            const nextControl = document.createElement('a');
            nextControl.classList.add('carousel-control-next');
            nextControl.href = `#carousel${r.fsq_id}`;
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
        
                carouselItem.appendChild(img);
                carousel.querySelector('.carousel-inner').appendChild(carouselItem);
            };
            
            if (isNightClubCategory(r.categories) && isInSG(lat, lng)) {
                
                let responses = await loadNightclubPhoto(r.fsq_id);
                
               if (responses.length == 0) {
                    const noPhotosItem = document.createElement('div');
                    noPhotosItem.classList.add('carousel-item', 'active');
                    const noPhotosText = document.createElement('p');
                    noPhotosText.textContent = 'Photos unavailable';
                    noPhotosText.classList.add('no-photos-message'); 
                    noPhotosItem.appendChild(noPhotosText);
                    carousel.querySelector('.carousel-inner').appendChild(noPhotosItem);
                }
                else {
                    responses.forEach(photo => {
                        console.log("Processing photo:", photo);
                        const photoUrl = `${photo.prefix}400x400${photo.suffix}`;
                        addPhotoToCarousel(photoUrl, 'NightClub Photo', 'The Title of NightClub Photo');
                    });
                }
                  
            }
            if (isBarCategory(r.categories) && isInSG(lat, lng)) {
                let responses = await loadBarPhoto(r.fsq_id);
                if (responses.length == 0) {
                    const noPhotosItem = document.createElement('div');
                    noPhotosItem.classList.add('carousel-item', 'active');
                    const noPhotosText = document.createElement('p');
                    noPhotosText.textContent = 'Photos unavailable';
                    noPhotosText.classList.add('no-photos-message'); 
                    noPhotosItem.appendChild(noPhotosText);
                    carousel.querySelector('.carousel-inner').appendChild(noPhotosItem);
                }
                else{
                    responses.forEach(photo => {
                        console.log("Processing photo:", photo);
                        const photoUrl = `${photo.prefix}400x400${photo.suffix}`;
                        addPhotoToCarousel(photoUrl, 'Bar Photo', 'The Title of Bar Photo');
                    });
                }
            }
        return carousel;
    
        }


        marker.bindPopup(function() {
            const element = document.createElement('div');
            element.classList.add('carousel-container');
            const carousel = createCarouselElement(r);
            console.log(carousel);
            element.appendChild(carousel); 


            const title = document.createElement('h5');
            title.textContent = r.name;
            title.classList.add('carousel-title'); 
            element.appendChild(title);

            const location = document.createElement('p');
            location.textContent = r.location.formatted_address;
            location.classList.add('carousel-location'); 
            element.appendChild(location);

            const openingHours = document.createElement('p');
            openingHours.textContent = r.closed_bucket;
            openingHours.classList.add('carousel-opening-hours'); 
            element.appendChild(openingHours);

            loadPlacesPhoto(carousel, r).then(()=>{
                let myCarouselElement = element.querySelector(`#carousel${r.fsq_id}`);
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
            map.flyTo(coordinate, 13);
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
            if (categories[i].id >= 13003 && categories[i].id <= 13025) {
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