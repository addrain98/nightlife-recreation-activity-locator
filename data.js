const API_KEY = {
    'fsq3oup5rBr57qce1vJYCdwbnp2lm1aZ6kWu4DL93TyuG+E=':['nightclub', 'club'],
    'fsq3kiOZiK5hbZtwsuW3JhMb0Pjgh6UrHtN1Dt9yu+PLD1o=':['supper', 'restuarant', 'food']
}
function getApiKeyFromSearchTerm(searchTerms) {
    for (const [apiKey, terms] of Object.entries(API_KEY)){
        if (terms.includes(searchTerms)){
            return apiKey
        }
    }

}
async function find(searchTerms, lat, lng, radius = 10000) {

    const apiKey = getApiKeyFromSearchTerm(searchTerms)

    const response = await axios.get("https://api.foursquare.com/v3/places/search",{
       // check the FourSquare documentation (the Places API)
        params: {
            query: searchTerms, 
            ll: lat+","+lng, 
            limit: 50,
            radius: radius
        },
        headers: {
            accept: 'application/json',
            Authorization: apiKey
          }
    });
    return response.data;
}

/*async function loadPhoto(fsq_id) {
    const response = await axios.get(`https://api.foursquare.com/v3/places/${fsq_id}/photos`, {
        headers: {
            accept: 'application/json',
            Authorization: API_KEY
          }
    });

    return response.data;
}*/