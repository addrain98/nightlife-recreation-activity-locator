async function find(searchTerms, lat, lng) {

    const response = await axios.get("https://api.foursquare.com/v3/places/search",{
       // check the FourSquare documentation (the Places API)
        params: {
            query: searchTerms, 
            ll: lat+","+lng, 
            limit: 50
        },
        headers: {
            accept: 'application/json',
            Authorization: 'fsq3oup5rBr57qce1vJYCdwbnp2lm1aZ6kWu4DL93TyuG+E='
          }
    });
    return response.data;
}