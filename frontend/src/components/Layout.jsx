import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import ChatbotWidget from './ChatbotWidget';

function Layout() {
  return (
    <div>
      <Header />
      <main style={{ padding: '2rem' }}>
        <Outlet />
      </main>
      <ChatbotWidget />
    </div>
  );
}

export default Layout;