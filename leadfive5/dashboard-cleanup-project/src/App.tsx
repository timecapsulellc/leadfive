import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import './styles/globals.css';

const App: React.FC = () => {
    return (
        <Router>
            <div className="app">
                <Header />
                <Sidebar />
                <main>
                    <Switch>
                        <Route path="/" exact component={Dashboard} />
                        <Route path="/reports" component={Reports} />
                        <Route path="/settings" component={Settings} />
                    </Switch>
                </main>
                <Footer />
            </div>
        </Router>
    );
};

export default App;