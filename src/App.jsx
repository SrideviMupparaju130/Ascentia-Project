import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Friend from './pages/Friend';
import Login from './pages/Login';
import Pomodoro from './pages/Pomodoro';
import Quest from './pages/Quest';
import SignUp from './pages/SignUp';
import Task from './pages/Task';

function App() {
  const [userId, setUserId] = useState(null); // State to hold user ID
  const [userName, setUserName] = useState(null); // State to hold user name

  return (
    <div>
      <BrowserRouter>
        <Navbar userName={userName} setUserName={setUserName} />
        <Routes>
          <Route path="/login" element={<Login setUserName={setUserName} setUserId={setUserId} />} /> {/* Pass setUserId to Login */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/task" element={<Task />} />
          <Route path="/friend" element={<Friend />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quest" element={<Quest userId={userId} />} /> {/* Pass userId to Quest */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />); // Render the App component

export default App;