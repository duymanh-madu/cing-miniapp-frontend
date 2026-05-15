import queryClient from "./queryClient";

export function setQueryData({
  queryKey,
  updater,
}) {

  queryClient.setQueryData(
    queryKey,
    updater
  );

}