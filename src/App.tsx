import { Router, Route } from 'wouter';
import Home from './pages/home';
import Recipe from './pages/recipes/:id';

function App() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/recipes/:id" component={Recipe} />
    </Router>
  );
}

export default App;
