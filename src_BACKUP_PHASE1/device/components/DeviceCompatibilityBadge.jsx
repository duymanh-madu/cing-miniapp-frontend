import {
  memo,
} from "react";

import {
  getDeviceInfo,
} from "../services/deviceInfoService";

function DeviceCompatibilityBadge() {

  const info =
    getDeviceInfo();

  return (

    <div
      className="

        inline-flex
        items-center

        rounded-full

        bg-neutral-100

        px-3
        py-1

        text-xs

      "
    >

      {info.memory}GB Device

    </div>

  );

}

export default memo(
  DeviceCompatibilityBadge
);