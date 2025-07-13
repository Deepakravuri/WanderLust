import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Listings from "./pages/Listings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Listings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
