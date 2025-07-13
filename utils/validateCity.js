const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function isValidCity(city) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&city=${encodeURIComponent(city)}`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'WanderLustApp/1.0 (your-email@example.com)' // required by Nominatim
    }
  });

  const data = await response.json();
  return data.length > 0;
}

module.exports = isValidCity;
