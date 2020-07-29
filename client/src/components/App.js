import './App.css';
import React from 'react';
import GoogleBtn from './googleLogin';

function App() {
  return (
    <div className="App" style={{ position: 'absolute', top: '50%', left: '48%' }}>
      <GoogleBtn/>
    </div>
  );
}

export default App;