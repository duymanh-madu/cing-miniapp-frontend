import notificationService from "./notificationService";

import useNotificationStore from "./adminNotificationStore";

class NotificationBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const store =
      useNotificationStore
        .getState();

    try {

      store.setLoading(
        true
      );

      const [

        notifications,

        deliveryMetrics,

      ] = await Promise.all([

        notificationService
          .getNotifications(),

        notificationService
          .getDeliveryMetrics(),

      ]);

      store.setNotifications(
        notifications
      );

      store.setDeliveryMetrics(
        deliveryMetrics
      );

    } finally {

      store.setLoading(
        false
      );

      this.initialized =
        true;

    }

  }

}

const notificationBootstrap =
  new NotificationBootstrap();

export default
  notificationBootstrap;