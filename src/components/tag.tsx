import { Badge } from './ui/badge';

function Tag({ tag }: { tag: string }) {
  return <Badge variant="secondary">{tag}</Badge>;
}

export default Tag;
