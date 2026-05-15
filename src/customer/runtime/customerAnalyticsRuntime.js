class CustomerAnalyticsRuntime {

  track(
    event,
    payload = {}
  ) {

    console.log(
      "customer_event",
      event,
      payload
    );

  }

}

const customerAnalyticsRuntime =
  new CustomerAnalyticsRuntime();

export default
  customerAnalyticsRuntime;