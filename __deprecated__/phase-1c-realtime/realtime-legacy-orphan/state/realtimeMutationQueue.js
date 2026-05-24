/**
 * =====================================================
 * REALTIME MUTATION QUEUE
 * =====================================================
 */

const mutationQueue =
  [];

export function enqueueMutation(

  mutation

) {

  mutationQueue.push(
    mutation
  );

}

export function dequeueMutation() {

  return mutationQueue.shift();

}

export function getMutationQueue() {

  return mutationQueue;

}