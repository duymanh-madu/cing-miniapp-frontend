import httpClient from "@/api/client/httpClient";

export async function recoverPayment({

  transactionId,

}) {

  const response =
    await httpClient.get(

      `/payments/recover/${transactionId}`

    );

  return response.data;

}