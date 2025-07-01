function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center py-4 px-4 min-h-screen h-full mx-auto max-w-2xl">
      {children}
    </div>
  );
}

export default Layout;
