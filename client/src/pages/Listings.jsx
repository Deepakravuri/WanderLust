import React, { useEffect, useState } from "react";
import axios from "axios";

function Listings() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/listings/api")
      .then(res => setListings(res.data))
      .catch(err => console.error("Error fetching listings:", err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>All Listings</h2>
      {listings.map(listing => (
        <div key={listing._id} style={{ marginBottom: 20, border: '1px solid #ccc', padding: 10 }}>
          <h3>{listing.title}</h3>
          <img src={listing.image.url} alt={listing.title} style={{ width: "200px" }} />
          <p>{listing.description}</p>
          <strong>₹ {listing.price}</strong>
        </div>
      ))}
    </div>
  );
}

export default Listings;
