import { useState } from 'react'
import './App.css'
import Background from './components/Background';
import TopBar from './components/TopBar';
import SearchBar from './components/SearchBar';
import LinkGrid from './components/LinkGrid';
import Clock from './components/Clock';
import Weather from './components/Weather';
import { useAppStore } from './store'; // Initialize store

function App() {
  // We can access global settings here if needed in the future
  // const theme = useAppStore(state => state.settings.theme);

  return (
    <>
      <Background />

      <div className="dashboard-container">
        <TopBar />

        <div className="main-content">
          <Clock />
          <Weather />

          <div className="glass-panel" style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '1000px',
            flex: '0 1 auto',
            maxHeight: '70vh',
            minHeight: '200px',
            marginTop: 'auto',
            marginBottom: 'auto',
          }}>
            <SearchBar />
            <LinkGrid />
          </div>
        </div>
      </div>
    </>
  )
}

export default App
