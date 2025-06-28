import Layout from "./Layout.jsx";

import Studio from "./Studio";

import Projects from "./Projects";

import Workspace from "./Workspace";

import Settings from "./Settings";

import AdminPanel from "./AdminPanel";

import Landing from "./Landing";

import Pricing from "./Pricing";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Studio: Studio,
    
    Projects: Projects,
    
    Workspace: Workspace,
    
    Settings: Settings,
    
    AdminPanel: AdminPanel,
    
    Landing: Landing,
    
    Pricing: Pricing,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Studio />} />
                
                
                <Route path="/Studio" element={<Studio />} />
                
                <Route path="/Projects" element={<Projects />} />
                
                <Route path="/Workspace" element={<Workspace />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/AdminPanel" element={<AdminPanel />} />
                
                <Route path="/Landing" element={<Landing />} />
                
                <Route path="/Pricing" element={<Pricing />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}