import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Workout from './pages/Workout';
import Nutrition from './pages/Nutrition';
import History from './pages/History';


import HealthExam from './pages/HealthExam';
import Settings from './pages/Settings';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="workout" element={<Workout />} />
                    <Route path="nutrition" element={<Nutrition />} />
                    <Route path="health" element={<HealthExam />} /> {/* New Route */}
                    <Route path="history" element={<History />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;

