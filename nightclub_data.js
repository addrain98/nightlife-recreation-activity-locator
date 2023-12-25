const NIGHTCLUB_KEY = 'fsq3oup5rBr57qce1vJYCdwbnp2lm1aZ6kWu4DL93TyuG+E='
const categoryIDs = ["10032", "10034", "10040", "10052"]

async function findNightclubs(searchTerms, lat, lng, radius = 10000, categoryIDs) {

    const response = await axios.get("https://api.foursquare.com/v3/places/search",{
       
        params: {
            query: searchTerms, 
            ll: lat+","+lng, 
            radius: radius,
            limit: 50,
            category: categoryIDs
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