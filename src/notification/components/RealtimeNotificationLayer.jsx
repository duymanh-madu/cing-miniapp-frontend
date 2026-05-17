import NotificationCenter from "./NotificationCenter";

import {
  useNotificationRealtime,
} from "../hooks/useNotificationRealtime";

function RealtimeNotificationLayer() {

  useNotificationRealtime();

  return (

    <NotificationCenter />

  );

}

export default RealtimeNotificationLayer;