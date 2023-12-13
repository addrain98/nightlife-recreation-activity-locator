const BAR_KEY = 'fsq3kiOZiK5hbZtwsuW3JhMb0Pjgh6UrHtN1Dt9yu+PLD1o='

async function findBars(searchTerms, lat, lng, radius = 10000) {

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
            Authorization: BAR_KEY
          }
    });
    return response.data;
}