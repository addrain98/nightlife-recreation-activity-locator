const BAR_KEY = 'fsq3kiOZiK5hbZtwsuW3JhMb0Pjgh6UrHtN1Dt9yu+PLD1o='

function generateCategoryIDs(start, end) {
    const ids = [];
    for(let i = start; i<= end; i++) {
        ids.push(i.toString());
    }
    return ids
}

const categoryIds = generateCategoryIDs(13003, 13025);
const categoryString = categoryIds.join(',');

async function findBars(searchTerms, lat, lng, radius = 10000, categoryString) {

    const response = await axios.get("https://api.foursquare.com/v3/places/search",{
       
        params: {
            query: searchTerms, 
            ll: lat+","+lng, 
            radius: radius,
            limit: 50,
            categories: categoryString
        },
        headers: {
            accept: 'application/json',
            Authorization: BAR_KEY
          }
    });
    return response.data;
}

async function loadBarPhoto(fsq_id) {
    const response = await axios.get(`https://api.foursquare.com/v3/places/${fsq_id}/photos`, {
        headers: {
            accept: 'application/json',
            Authorization: BAR_KEY
          }
    });

    return response.data;
}