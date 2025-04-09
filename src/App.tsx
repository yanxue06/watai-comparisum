import React from "react";
import Homepage from "./components/homepage";
import ReviewPage from "./components/reviewpage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/reviewpage" element={<ReviewPage />} />
      </Routes>
    </Router>
  );
};

export default App;
