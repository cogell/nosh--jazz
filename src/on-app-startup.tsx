import { useEffect } from 'react';
import { Account } from './schema';
import { useAccount } from 'jazz-tools/react';
import { co, Group } from 'jazz-tools';

function OnAppStartup() {
  const { me } = useAccount(Account, {
    // rea
  });

  useEffect(() => {
    // THIS DIDN'T WORK
    const addServerWorkerToOwnerGroup = async () => {
      console.log('addServerWorkerToOwnerGroup');
      if (me) {
        console.log('me', !!me);
        const serverWorker = await co
          .account()
          .load(import.meta.env.VITE_JAZZ_WORKER_ACCOUNT);
        // console.log('serverWorker', serverWorker);
        console.log('me', !!me);
        const ownerGroup = me.root?.tags?._owner.castAs(Group);
        console.log('ownerGroup', !!ownerGroup);
        if (ownerGroup && serverWorker) {
          console.log('adding server worker to owner group');
          ownerGroup.addMember(serverWorker, 'reader');
        }
      }
    };
    // addServerWorkerToOwnerGroup();
  }, [me]);
  return null;
}

export default OnAppStartup;
