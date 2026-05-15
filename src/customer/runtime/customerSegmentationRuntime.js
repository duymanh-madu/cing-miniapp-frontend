class CustomerSegmentationRuntime {

  segment(
    customer
  ) {

    if (
      customer.spending >
      10000000
    ) {

      return "high_value";

    }

    if (
      customer.orders >
      20
    ) {

      return "returning";

    }

    return "new_customer";

  }

}

const customerSegmentationRuntime =
  new CustomerSegmentationRuntime();

export default
  customerSegmentationRuntime;