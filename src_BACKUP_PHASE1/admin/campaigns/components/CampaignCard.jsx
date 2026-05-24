function CampaignCard({
  campaign,
}) {

  return (

    <div
      className="
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-5
      "
    >

      <div
        className="
          flex
          items-center
          justify-between
        "
      >

        <div>

          <div
            className="
              text-xl
              font-black
            "
          >
            {campaign.name}
          </div>

          <div
            className="
              mt-2
              text-sm
              text-white/60
            "
          >
            {campaign.description}
          </div>

        </div>

        <div
          className="
            rounded-full
            bg-black/40
            px-3
            py-1
            text-xs
          "
        >
          {campaign.status}
        </div>

      </div>

    </div>

  );

}

export default
  CampaignCard;