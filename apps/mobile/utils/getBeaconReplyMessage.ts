import replyMessages from '@/constants/beaconReplyMessages';

export function getBeaconReplyMessage(
  replyTextKey: keyof typeof replyMessages,
  replyTextId: number,
): string {
  const category = replyMessages[replyTextKey];
  if (!category) return 'Message not found';

  const message = category[replyTextId as keyof typeof category];
  return message ?? 'Message not found';
}
