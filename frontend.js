async function loadRecreation(){
    const response = await axios.get();
}
document.addEventListener("DOMContentLoaded", async function(){
    const mapObject = L.map("map");
    mapObject.setView([1.3521, 103.8198], 13)
    L.tileLayer('https://{s}.tile.jawg.io/jawg-matrix/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
        attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: 0,
        maxZoom: 22,
        subdomains: 'abcd',
        accessToken: 'kpWYzvRLkzuDJkOjWV34GNVHiyA9wKZOgt8r5LzmMIVfgqFGVsPJnjJTjKqrvEGV'
    }).addTo(mapObject);

    const recreation = await loadRecreation();
    const recreationLayer = L.marker()
    recreationLayer.addTo(mapObject);

    

});