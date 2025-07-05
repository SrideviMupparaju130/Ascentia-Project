import { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Chatbot from './components/Chatbot'; // Import Chatbot
import Navbar from './components/Navbar';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import Friend from './pages/Friend';
import Login from './pages/Login';
import Pomodoro from './pages/Pomodoro';
import Quest from './pages/Quest';
import SignUp from './pages/SignUp';
import Task from './pages/Task';

function App() {
  const [userId, setUserId] = useState(null); 
  const [userName, setUserName] = useState(null);

  return (
    <div>
      <BrowserRouter>
        <Navbar userName={userName} setUserName={setUserName} />
        <Routes>
          <Route path='/' element={<About />} />
          <Route path="/login" element={<Login setUserName={setUserName} setUserId={setUserId} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/task" element={<Task />} />
          <Route path="/friend" element={<Friend />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quest" element={<Quest userId={userId} />} /> 
        </Routes>
        <Chatbot /> {/* Add Chatbot component here to be globally available */}
      </BrowserRouter>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

export default App;