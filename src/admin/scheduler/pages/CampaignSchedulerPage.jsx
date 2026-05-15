import {
  useEffect,
} from "react";

import campaignSchedulerBootstrap from "../campaignSchedulerBootstrap";

import useCampaignSchedulerStore from "../campaignSchedulerStore";

import CampaignSchedulerForm from "../components/CampaignSchedulerForm";

import CampaignScheduleCard from "../components/CampaignScheduleCard";

function CampaignSchedulerPage() {

  const schedules =
    useCampaignSchedulerStore(
      (
        state
      ) => state.schedules
    );

  useEffect(() => {

    campaignSchedulerBootstrap
      .bootstrap();

  }, []);

  return (

    <div
      className="
        space-y-6
      "
    >

      <div
        className="
          text-3xl
          font-black
        "
      >
        Campaign Scheduler
      </div>

      <CampaignSchedulerForm />

      <div
        className="
          space-y-4
        "
      >

        {

          schedules.map(
            (
              schedule
            ) => (

              <CampaignScheduleCard
                key={
                  schedule.id
                }

                schedule={
                  schedule
                }
              />

            )
          )

        }

      </div>

    </div>

  );

}

export default
  CampaignSchedulerPage;