import React from "react";
// import { Routes, Route } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

export const serverUrl = "http://localhost:5000"

function App() {
  return (
    <div>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/" element={<Register />}></Route>
        {/* <Route Path="/" element={<Dashboard />}></Route> */}
      </Routes>
    </div>
  );
}

export default App;
