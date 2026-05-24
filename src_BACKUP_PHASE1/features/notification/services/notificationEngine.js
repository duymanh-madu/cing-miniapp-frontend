import notificationFeatureStore from "@/features/notification/store/notificationFeatureStore";

class NotificationEngine {

  push(notification) {

    notificationFeatureStore
      .getState()
      .push(notification);

  }

  remove(id) {

    notificationFeatureStore
      .getState()
      .remove(id);

  }

}

const notificationEngine =
  new NotificationEngine();

export default
  notificationEngine;