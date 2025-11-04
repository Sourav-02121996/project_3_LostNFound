import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import PostScreen from "./screens/PostScreen";
import LostItemsScreen from "./screens/LostItemsScreen";
import ItemScreen from "./screens/ItemScreen";

const App = () => {
  return (
    <div className="app-container">
      <Header />
      <main className="py-3 main-content">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/items" element={<LostItemsScreen />} />
          <Route path="/item/:id" element={<ItemScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/post" element={<PostScreen />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;

