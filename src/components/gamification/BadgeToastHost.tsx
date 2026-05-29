/*
 * Mounts BadgeToast at the app root and feeds it from useProgressStore.pendingBadges.
 */
import { BadgeToast } from './BadgeToast';
import { useProgressStore } from '../../store/useProgressStore';

export function BadgeToastHost() {
  const pending = useProgressStore((s) => s.pendingBadges);
  const clear = useProgressStore((s) => s.clearPendingBadges);
  return <BadgeToast badgeIds={pending} onDismiss={clear} />;
}
