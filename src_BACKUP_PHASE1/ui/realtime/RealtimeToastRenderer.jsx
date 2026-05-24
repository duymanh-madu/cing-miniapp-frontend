import XPToast from "./XPToast";
import ComboToast from "./ComboToast";
import RewardToast from "./RewardToast";
import LevelToast from "./LevelToast";
import MissionToast from "./MissionToast";
import StreakToast from "./StreakToast";

export default function RealtimeToastRenderer({

  toast,

}) {

  switch (toast.type) {

    case "xp":

      return (
        <XPToast toast={toast} />
      );

    case "combo":

      return (
        <ComboToast toast={toast} />
      );

    case "reward":

      return (
        <RewardToast toast={toast} />
      );

    case "level":

      return (
        <LevelToast toast={toast} />
      );

    case "mission":

      return (
        <MissionToast toast={toast} />
      );

    case "streak":

      return (
        <StreakToast toast={toast} />
      );

    default:

      return null;

  }

}