import notificationStore from "@/features/notification/store/notificationStore";

class NotificationEngine {

  push(notification) {

    notificationStore
      .getState()
      .push(notification);

  }

  remove(id) {

    notificationStore
      .getState()
      .remove(id);

  }

}

const notificationEngine =
  new NotificationEngine();

export default
  notificationEngine;