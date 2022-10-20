import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PrivateRoutes from './components/routes/PrivateRoutes';
import PublicRoutes from './components/routes/PublicRoutes';
import useAuthHook from './hooks/useAuthHook';
import Conversation from './pages/Conversation';
import Inbox from './pages/Inbox';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
    const authChecked = useAuthHook();
    return !authChecked ? (
        <div>Checking Authentication...</div>
    ) : (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <PublicRoutes>
                            <Login />
                        </PublicRoutes>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <PublicRoutes>
                            <Register />
                        </PublicRoutes>
                    }
                />
                <Route
                    path="/inbox"
                    element={
                        <PrivateRoutes>
                            <Conversation />
                        </PrivateRoutes>
                    }
                />
                <Route
                    path="/inbox/:id"
                    element={
                        <PrivateRoutes>
                            <Inbox />
                        </PrivateRoutes>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
