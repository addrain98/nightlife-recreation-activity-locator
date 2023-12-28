
async function getRouteData(startLat, startLng, endLat, endLng) {
    try{
        const apiURL = 'https://api.tripgo.com/v1/routing.json';
        const API_KEY = '4f477c672248e4173a9c883a01afd1c1';
        const response = await axios.get(apiURL, {
            params: {
                from: `${startLat},${startLng}`,
                to: `${endLat},${endLng}`,
            },

            headers: {
                'X-TripGo-Key': API_KEY
            }
    
        });
        

        return response.data;
        
    } catch(error) {
        console.error('Error fetching route data:', error);
        // Check if error response has additional details
        if (error.response) {
            console.error('Server responded with:', error.response.status, error.response.data);
        }
        return null;
    }
    
} 


    
