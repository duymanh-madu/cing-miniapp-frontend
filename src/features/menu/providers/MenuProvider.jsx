import useMenuBootstrap
  from "../shared/hooks/useMenuBootstrap";

import useRegisterMenuRealtime
  from "../shared/hooks/useRegisterMenuRealtime";

function MenuProvider({
  children,
}) {

  useMenuBootstrap();

  useRegisterMenuRealtime();

  return children;

}

export default
  MenuProvider;