import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Page0 from './pages/audit';
import Page1 from './pages/audit/_id';
import Page2 from './pages/carrier/bids';
import Page3 from './pages/carrier';
import Page4 from './pages/carrier/tender/_id';
import Page5 from './pages/Home';
import Page6 from './pages/shipper/dashboard';
import Page7 from './pages/shipper/new';
import Page8 from './pages/shipper';
import Page9 from './pages/shipper/tender/new';
import Page10 from './pages/shipper/tender/_id';
import DeployPage from './pages/deploy';

function App() {
  return (
    
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/audit" element={<Page0 />} />
              <Route path="/audit/:id" element={<Page1 />} />
              <Route path="/carrier/bids" element={<Page2 />} />
              <Route path="/carrier" element={<Page3 />} />
              <Route path="/carrier/tender/:id" element={<Page4 />} />
              <Route path="/" element={<Page5 />} />
              <Route path="/shipper/dashboard" element={<Page6 />} />
              <Route path="/shipper/new" element={<Page7 />} />
              <Route path="/shipper" element={<Page8 />} />
              <Route path="/shipper/tender/new" element={<Page9 />} />
              <Route path="/shipper/tender/:id" element={<Page10 />} />
              <Route path="/deploy" element={<DeployPage />} />
            </Routes>
            <Footer />
          </main>
        </div>
      </BrowserRouter>
    
  );
}
export default App;
