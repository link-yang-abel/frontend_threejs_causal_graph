import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navbar } from '@/components/Navbar';
import { HomePage } from '@/pages/HomePage';
import { CausalGraphPage } from '@/pages/CausalGraphPage';
import { BubblePage } from '@/pages/BubblePage';
import { ReactFlowPage } from '@/pages/ReactFlowPage';

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/causal-graph" element={<CausalGraphPage />} />
              <Route path="/bubble" element={<BubblePage />} />
              <Route path="/react-flow" element={<ReactFlowPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App; 