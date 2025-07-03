import { H1, Lead } from '@/components/ui/typography';
import { useAccount } from 'jazz-tools/react';
import { Account } from '@/schema';
import { DeleteAccountButton } from '../home/home-page';

function AccountPage() {
  const { me } = useAccount(Account, {
    resolve: {
      profile: true,
    },
  });

  return (
    <div className="flex flex-col gap-4 w-full">
      <H1>Account</H1>
      <div className="flex flex-col gap-2">
        <Lead>Name: {me?.profile?.name}</Lead>
      </div>
      <div className="flex flex-col gap-2">
        <DeleteAccountButton />
      </div>
    </div>
  );
}

export default AccountPage;
