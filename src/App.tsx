import { Router, Route } from 'wouter';
import Home from './pages/home';
import Recipe from './pages/recipes/:id';
import Layout from './pages/layout';

function App() {
  return (
    <Router>
      <Layout>
        <Route path="/" component={Home} />
        <Route path="/recipes/:id" component={Recipe} />
      </Layout>
    </Router>
  );
}

export default App;
