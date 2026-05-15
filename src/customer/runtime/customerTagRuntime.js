class CustomerTagRuntime {

  generateTags(
    customer
  ) {

    const tags =
      [];

    if (
      customer.spending >
      5000000
    ) {

      tags.push(
        "vip"
      );

    }

    if (
      customer.orders >
      50
    ) {

      tags.push(
        "loyal"
      );

    }

    return tags;

  }

}

const customerTagRuntime =
  new CustomerTagRuntime();

export default
  customerTagRuntime;