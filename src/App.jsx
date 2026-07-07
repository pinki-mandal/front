import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./component/register";
import Dashboard from "./component/dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
