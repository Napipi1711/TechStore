import React from 'react';
// import { render, screen } from '@testing-library/react';


const Footer = () => {
    return (
        <div className="bg-app-card border-t border-app-border py-4 px-6">
            <p className="text-sm text-center text-app-text-secondary">
                &copy; {new Date().getFullYear()} TechStore. All rights reserved.
            </p>
        </div>
    );
};
export default Footer;