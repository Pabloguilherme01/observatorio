import { PublicDataPulse } from './PublicDataPulse';
import { InstagramSyncHub } from '../InstagramSyncHub';

export default function DeferredPublicDataGroup() {
  return (
    <>
      <PublicDataPulse />
      <InstagramSyncHub />
    </>
  );
}
