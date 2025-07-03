import { Router, Route } from 'wouter';
import Home from './pages/home/home-page';
import Recipe from './pages/recipes/:id/recipe-page';
import Layout from './pages/layout';
import OnAppStartup from './on-app-startup';
import TagsPage from './pages/tags/tags-page';
import AccountPage from './pages/account/account-page';

function App() {
  return (
    <Router>
      <Layout>
        <OnAppStartup />
        <Route path="/" component={Home} />
        <Route path="/recipes/:id" component={Recipe} />
        <Route path="/tags" component={TagsPage} />
        <Route path="/account" component={AccountPage} />
      </Layout>
    </Router>
  );
}

export default App;
