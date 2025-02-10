import { BrowserRouter as Router, Routes, Route,} from 'react-router-dom';
import { Suspense, lazy } from 'react';
import './App.css';


// Lazy load components
const Signup = lazy(() => import('./pages/Signup'));
const Signin = lazy(() => import('./pages/Signin'));
const Blog = lazy(() => import('./pages/Blog'));
const Quotes = lazy(() => import('./pages/Quotes'));
const MyBlogs = lazy(() => import('./pages/MyBlogs'));

// Loading fallback component
const LoadingFallback = () => <div>Loading...</div>;

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/myblogs" element={<MyBlogs />} />
         
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
