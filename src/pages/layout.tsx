import { Link } from 'wouter';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center py-4 px-4 min-h-screen h-full mx-auto max-w-2xl">
      <div className="flex flex-row gap-4 w-full justify-between items-center mb-4">
        <Link to="/" className="text-2xl font-bold">
          🥗
        </Link>
        <Link to="/account" className="text-2xl font-bold">
          👨🏻‍🍳
        </Link>
      </div>
      {children}
    </div>
  );
}

export default Layout;
