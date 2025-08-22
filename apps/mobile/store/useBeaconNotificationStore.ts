import { createPaginatedStore } from '@/store/createPaginatedStore';
import { BeaconNotificationDTO, JournalEntryDTO } from '@beacon/types';
import {
  getSingleBeaconNotificationsRequest,
  getUserBeaconNotificationsRequest,
} from '@/api/beaconApi';

export const useBeaconNotificationStore =
  createPaginatedStore<BeaconNotificationDTO>(
    getUserBeaconNotificationsRequest,
    getSingleBeaconNotificationsRequest,
    10,
  );
