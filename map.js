function initMap() {
    const singapore = [1.35, 103.81]
    const map = L.map("map", {
        zoomControl : false
    });
    
    map.setView(singapore, 12)

    L.control.zoom({
        position: "bottomright"
    }).addTo(map);

    L.tileLayer('https://{s}.tile.jawg.io/jawg-matrix/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
        attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: 0,
        maxZoom: 22,
        subdomains: 'abcd',
        accessToken: 'kpWYzvRLkzuDJkOjWV34GNVHiyA9wKZOgt8r5LzmMIVfgqFGVsPJnjJTjKqrvEGV',
        position: "bottomright"
    }).addTo(map);
    
    return map;
}