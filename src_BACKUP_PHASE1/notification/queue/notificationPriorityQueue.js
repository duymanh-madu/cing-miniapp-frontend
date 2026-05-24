const priorityQueue =
  [];

export function enqueuePriorityNotification(

  notification

) {

  priorityQueue.push(
    notification
  );

}

export function dequeuePriorityNotification() {

  return priorityQueue.shift();

}