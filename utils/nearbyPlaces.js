const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function getNearbyAttractions(lat, lon) {
  const radius = 2000;
  const query = `
  [out:json];
  (
    node["tourism"~"attraction|museum|viewpoint|zoo|artwork|theme_park|gallery|aquarium|information|picnic_site"]
(around:${radius},${lat},${lon});
    way["tourism"~"attraction|museum|viewpoint|zoo|artwork|theme_park|gallery|aquarium|information|picnic_site"]
(around:${radius},${lat},${lon});
  );
  out center;
`;


  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  const data = await response.json();

  return data.elements
  .filter(e => e.tags && e.tags.name)
  .map(e => ({
    name: e.tags.name,
    type: e.tags.tourism,
    lat: e.lat || e.center?.lat,
    lon: e.lon || e.center?.lon
  }))
  .slice(0, 5);
}

module.exports = getNearbyAttractions;
