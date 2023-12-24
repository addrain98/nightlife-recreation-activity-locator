const NIGHTCLUB_KEY = 'fsq3oup5rBr57qce1vJYCdwbnp2lm1aZ6kWu4DL93TyuG+E='

async function findNightclubs(searchTerms, lat, lng, radius = 10000) {

    const response = await axios.get("https://api.foursquare.com/v3/places/search",{
       
        params: {
            query: searchTerms, 
            ll: lat+","+lng, 
            limit: 50,
            radius: radius
        },
        headers: {
            accept: 'application/json',
            Authorization: NIGHTCLUB_KEY
          }
    });
    return response.data;
}

async function loadNightclubPhoto(fsq_id) {
    const response = await axios.get(`https://api.foursquare.com/v3/places/${fsq_id}/photos`, {
        headers: {
            accept: 'application/json',
            Authorization: NIGHTCLUB_KEY
          }
    });

    return response.data;
}