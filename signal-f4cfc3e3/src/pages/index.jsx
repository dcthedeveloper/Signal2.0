import Layout from "./Layout.jsx";

import Home from "./Home";

import Portfolio from "./Portfolio";

import Analysis from "./Analysis";

import Assistant from "./Assistant";

import WhatIf from "./WhatIf";

import Calendar from "./Calendar";

import Alerts from "./Alerts";

import Settings from "./Settings";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Portfolio: Portfolio,
    
    Analysis: Analysis,
    
    Assistant: Assistant,
    
    WhatIf: WhatIf,
    
    Calendar: Calendar,
    
    Alerts: Alerts,
    
    Settings: Settings,
    
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
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Portfolio" element={<Portfolio />} />
                
                <Route path="/Analysis" element={<Analysis />} />
                
                <Route path="/Assistant" element={<Assistant />} />
                
                <Route path="/WhatIf" element={<WhatIf />} />
                
                <Route path="/Calendar" element={<Calendar />} />
                
                <Route path="/Alerts" element={<Alerts />} />
                
                <Route path="/Settings" element={<Settings />} />
                
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