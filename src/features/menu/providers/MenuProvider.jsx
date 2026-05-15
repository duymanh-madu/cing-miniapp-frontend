import useMenuBootstrap
  from "../hooks/useMenuBootstrap";

import useRegisterMenuRealtime
  from "../hooks/useRegisterMenuRealtime";

function MenuProvider({
  children,
}) {

  useMenuBootstrap();

  useRegisterMenuRealtime();

  return children;

}

export default
  MenuProvider;