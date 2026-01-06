import React, { StrictMode } from "react";
import { createRoot } from 'react-dom/client';
import "./styles.css";
import "./center.css";

import Router from "./Router";

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <StrictMode>
    <Router />
  </StrictMode>
);
