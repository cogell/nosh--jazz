import { useAccount } from 'jazz-tools/react';
import { Account } from '../../schema';
import { H1, H2, InlineCode, P } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import Tag from '@/components/tag';

function TagsPage() {
  const { me } = useAccount(Account, {
    resolve: {
      root: { tags: true },
    },
  });
  return (
    <div className="flex flex-col gap-8 w-full">
      <H1>Tags</H1>

      <div className="flex flex-col gap-2">
        <H2>Tag Instructions</H2>
        <InlineCode className="mt-0 whitespace-pre-wrap">
          {me?.root?.tags?.instructions}
        </InlineCode>
      </div>

      <div className="flex flex-col gap-2">
        <H2>Tags</H2>
        <div className="flex flex-wrap gap-2">
          {me?.root?.tags?.possibleTags.map((tag) => (
            <Tag key={tag} tag={tag} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default TagsPage;
