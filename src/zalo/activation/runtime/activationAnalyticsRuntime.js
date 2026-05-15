class ActivationAnalyticsRuntime {

  track(event, payload) {

    console.log(
      "activation_event",
      event,
      payload
    );

  }

}

const activationAnalyticsRuntime =
  new ActivationAnalyticsRuntime();

export default
  activationAnalyticsRuntime;