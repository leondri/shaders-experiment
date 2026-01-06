import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Scene } from "./App";
import { Scene2 } from "./Scene2";
import { Scene3 } from "./Scene3";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Scene />} />
        <Route path="/scene2" element={<Scene2 />} />
        <Route path="/scene3" element={<Scene3 />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;

