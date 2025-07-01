import { Router, Route } from 'wouter';
import Home from './pages/home/home-page';
import Recipe from './pages/recipes/:id/recipe-page';
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
