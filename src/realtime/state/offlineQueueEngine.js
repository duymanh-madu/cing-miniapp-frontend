/**
 * =====================================================
 * OFFLINE QUEUE ENGINE
 * =====================================================
 */

const offlineQueue =
  [];

export function enqueueOfflineMutation(

  mutation

) {

  offlineQueue.push(
    mutation
  );

}

export function dequeueOfflineMutation() {

  return offlineQueue.shift();

}

export function getOfflineQueue() {

  return offlineQueue;

}