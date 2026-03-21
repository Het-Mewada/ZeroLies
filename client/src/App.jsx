import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Today from './pages/Today';
import Study from './pages/Study';
import DayDetail from './pages/DayDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/today" element={<Today />} />
          <Route path="/study" element={<Study />} />
          <Route path="/day/:date" element={<DayDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
