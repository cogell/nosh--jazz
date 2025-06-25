import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { JazzReactProvider } from 'jazz-tools/react';
import './index.css';
import App from './App.tsx';
import { Account } from './schema.ts';
import { JazzInspector } from 'jazz-tools/inspector';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <JazzReactProvider
      AccountSchema={Account}
      sync={{
        // WARNING: careful of this, this is hitting prod right now
        // TODO: have this be a variable in the env?
        peer: 'wss://cloud.jazz.tools/?key=cedric.cogell@gmail.com',
        when: 'always', // WHY: this is so server workers can sync to anon users data too
      }}
      // guestMode={true}
      // https://jazz.tools/docs/react/authentication/authentication-states#migrating-data-from-anonymous-to-authenticated-account
      // implement if you want anon users who forgot to login to not loose their data
      // onAnonymousAccountDiscarded={migrateAnonData}
    >
      <App />
      <JazzInspector />
    </JazzReactProvider>
  </StrictMode>,
);
