import NotificationCenter from "./NotificationCenter";

import {
  useNotificationRealtime,
} from "../shared/hooks/useNotificationRealtime";

function RealtimeNotificationLayer() {

  useNotificationRealtime();

  return (

    <NotificationCenter />

  );

}

export default RealtimeNotificationLayer;