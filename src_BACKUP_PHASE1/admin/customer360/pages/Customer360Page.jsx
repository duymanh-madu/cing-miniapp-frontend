import {
  useEffect,
} from "react";

import customer360Bootstrap from "../customer360Bootstrap";

import customer360RealtimeSocket from "../customer360RealtimeSocket";

import customer360Service from "../customer360Service";

import useCustomer360Store from "../customer360Store";

import CustomerProfileCard from "../components/CustomerProfileCard";

import CustomerTimeline from "../components/CustomerTimeline";

import CustomerInsightsPanel from "../components/CustomerInsightsPanel";

function Customer360Page() {

  const {

    profiles,

    selectedProfile,

    customerTimeline,

    customerInsights,

    setSelectedProfile,

    setCustomerTimeline,

    setCustomerInsights,

  } = useCustomer360Store();

  useEffect(() => {

    customer360Bootstrap
      .bootstrap();

    customer360RealtimeSocket
      .initialize();

  }, []);

  async function handleSelect(
    profile
  ) {

    setSelectedProfile(
      profile
    );

    const [

      timeline,

      insights,

    ] = await Promise.all([

      customer360Service
        .getTimeline(
          profile.id
        ),

      customer360Service
        .getInsights(
          profile.id
        ),

    ]);

    setCustomerTimeline(
      timeline
    );

    setCustomerInsights(
      insights
    );

  }

  return (

    <div
      className="
        grid
        grid-cols-1
        gap-6
        xl:grid-cols-[400px_1fr]
      "
    >

      <div
        className="
          space-y-4
        "
      >

        {

          profiles.map(
            (
              profile
            ) => (

              <CustomerProfileCard

                key={
                  profile.id
                }

                profile={
                  profile
                }

                onSelect={
                  handleSelect
                }

              />

            )
          )

        }

      </div>

      <div
        className="
          space-y-6
        "
      >

        {

          selectedProfile && (

            <CustomerInsightsPanel
              insights={
                customerInsights
              }
            />

          )

        }

        <CustomerTimeline
          timeline={
            customerTimeline
          }
        />

      </div>

    </div>

  );

}

export default
  Customer360Page;