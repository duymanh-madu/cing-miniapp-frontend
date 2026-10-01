import LeaderboardBadgeChips, { LeaderboardAvatarTitleIcons } from "@/features/leaderboard/components/LeaderboardBadgeChips";

import royalHallBg from "@/features/leaderboard/assets/royal-hall/royal-hall-bg.webp";

import "./V8RoyalGameLeaderboard.css";

function nameOf(entry) {
  return (
    entry?.player_name ||
    entry?.name ||
    "Ẩn danh"
  );
}

function scoreOf(entry) {
  return Number(
    entry?.score ??
    entry?.value ??
    0
  ).toLocaleString("vi-VN");
}

function Avatar({
  entry,
  rank,
}) {
  const name = nameOf(entry);

  return (
    <div
      className={
        `v8-royal-avatar v8-royal-avatar--${rank}`
      }
    >
      {entry?.avatar ? (
        <img
          src={entry.avatar}
          alt=""
        />
      ) : (
        <span>
          {name[0]?.toUpperCase() || "?"}
        </span>
      )}
    </div>
  );
}



function Champion({
  entry,
  rank,
  phone,
  animatedIds,
  onProfile,
}) {
  if (!entry) {
    return (
      <div
        className={
          `v8-royal-champion v8-royal-champion--${rank} v8-royal-champion--empty`
        }
      />
    );
  }

  const id =
    String(entry.user_id || "");

  const isMe =
    phone &&
    id === String(phone);

  const hot =
    animatedIds?.has?.(id);

  return (
    <article
      className={
        `v8-royal-champion v8-royal-champion--${rank} ${
          hot
            ? "v8-royal-champion--hot"
            : ""
        }`
      }
      onClick={() => {
        if (
          !isMe &&
          entry.user_id
        ) {
          onProfile?.(
            entry.user_id
          );
        }
      }}
    >
      <div className="v8-royal-champion__medallion">
        <Avatar
          entry={entry}
          rank={rank}
        />

        <LeaderboardAvatarTitleIcons
          entry={entry}
        />

        <span className="v8-royal-champion__rank-seal">
          {rank}
        </span>
      </div>

      <h3 className="v8-royal-champion__name">
        {nameOf(entry)}
      </h3>

      <div className="v8-royal-champion__badges">
        <LeaderboardBadgeChips
          entry={entry}
          align="center"
        />
      </div>

      <div className="v8-royal-champion__score">
        {scoreOf(entry)}
      </div>
    </article>
  );
}

function RewardStrip({
  rewards,
}) {
  if (!rewards?.length) {
    return null;
  }

  return (
    <div className="v8-royal-rewards">
      {rewards
        .slice(0, 3)
        .map((reward, index) => (
          <div
            key={index}
            className={
              `v8-royal-reward v8-royal-reward--${index + 1}`
            }
          >
            <span className="v8-royal-reward__rank">
              {index + 1}
            </span>

            <div className="v8-royal-reward__copy">
              <strong>
                {reward.points} điểm
              </strong>

              <small>
                {reward.label}
              </small>
            </div>
          </div>
        ))}
    </div>
  );
}

function RowAvatar({
  entry,
}) {
  const name =
    nameOf(entry);

  return (
    <div className="v8-royal-row-avatar">
      {entry?.avatar ? (
        <img
          src={entry.avatar}
          alt=""
        />
      ) : (
        <span>
          {name[0]?.toUpperCase() || "?"}
        </span>
      )}
    </div>
  );
}

function TopTen({
  entries,
  phone,
  animatedIds,
  onProfile,
}) {
  return (
    <>

      <section className="v8-royal-top10">
        {entries.map(
          (entry, index) => {
            const rank =
              index + 4;

            const id =
              String(
                entry.user_id ||
                `rank-${rank}`
              );

            const isMe =
              phone &&
              id === String(phone);

            const hot =
              animatedIds?.has?.(id);

            return (
              <button
                type="button"
                key={id}
                className={
                  `v8-royal-row ${
                    isMe
                      ? "v8-royal-row--me"
                      : ""
                  } ${
                    hot
                      ? "v8-royal-row--hot"
                      : ""
                  }`
                }
                onClick={() => {
                  if (
                    !isMe &&
                    entry.user_id
                  ) {
                    onProfile?.(
                      entry.user_id
                    );
                  }
                }}
              >
                <span className="v8-royal-row__rank">
                  {rank}
                </span>

                <RowAvatar
                  entry={entry}
                />

                <span className="v8-royal-row__main">
                  <strong className="v8-royal-row__name">
                    {nameOf(entry)}
                    {isMe
                      ? " (bạn)"
                      : ""}
                  </strong>

                  <span className="v8-royal-row__badges">
                    <LeaderboardBadgeChips
                      entry={entry}
                      align="start"
                    />
                  </span>
                </span>

                <strong className="v8-royal-row__score">
                  {scoreOf(entry)}
                </strong>

                <span className="v8-royal-row__arrow">
                  ›
                </span>
              </button>
            );
          }
        )}
      </section>
    </>
  );
}

function SelfCard({
  myRank,
}) {
  if (
    !myRank?.rank ||
    Number(myRank.rank) <= 10
  ) {
    return null;
  }

  return (
    <section className="v8-royal-self">
      <div className="v8-royal-self__crest">
        C
      </div>

      <div className="v8-royal-self__main">
        <small>
          THÀNH TÍCH CỦA BẠN
        </small>

        <strong>
          {myRank.player_name ||
            myRank.name ||
            "Bạn"}
        </strong>

        <div className="v8-royal-self__badges">
          <LeaderboardBadgeChips
            entry={myRank}
            align="start"
          />
        </div>
      </div>

      <div className="v8-royal-self__rank">
        <b>
          #{myRank.rank}
        </b>

        <span>
          {scoreOf(myRank)}
        </span>
      </div>
    </section>
  );
}

export default function V8RoyalGameLeaderboardView({
  gameTitle,
  gameIcon,
  rewards,
  loading,
  loadError,
  onRetry,
  data,
  top3,
  rest,
  myRank,
  phone,
  animatedIds,
  onClose,
  onProfile,
}) {
  return (
    <div className="v8-royal-root">
      <div
        className="v8-royal-bg"
        style={{
          backgroundImage:
            `url(${royalHallBg})`,
        }}
      />

      <header className="v8-royal-header">
        <button
          type="button"
          className="v8-royal-back"
          onClick={onClose}
          aria-label="Quay lại"
        >
          ←
        </button>

        <div className="v8-royal-heading">
          <small>
            CING HU TANG KINH BẮC
          </small>

          <span>
            HALL OF FAME
          </span>

          <h1>
            {gameTitle}
          </h1>

          <p>
            Vinh danh top 10 bảng xếp hạng tuần
          </p>
        </div>
      </header>

      <RewardStrip
        rewards={rewards}
      />

      <main className="v8-royal-scroll">
        {loading ? (
          <div className="v8-royal-state">
            Đang tải bảng xếp hạng...
          </div>
        ) : loadError && data.length === 0 ? (
          <div className="v8-royal-state">
            {gameIcon ? (
              <img
                src={gameIcon}
                alt=""
              />
            ) : null}

            <strong>
              Chưa tải được bảng xếp hạng
            </strong>

            <span>
              Kết nối chưa ổn định. Hãy thử tải lại.
            </span>

            <button
              type="button"
              className="v8-royal-state__retry"
              onClick={onRetry}
            >
              Thử lại
            </button>
          </div>
        ) : data.length === 0 ? (
          <div className="v8-royal-state">
            {gameIcon ? (
              <img
                src={gameIcon}
                alt=""
              />
            ) : null}

            <strong>
              Chưa có dữ liệu bảng xếp hạng tuần
            </strong>

            <span>
              Kết quả sẽ xuất hiện khi có người chơi đạt điểm.
            </span>
          </div>
        ) : (
          <>
            <section className="v8-royal-podium-scene">
              <div className="v8-royal-podium-shade" />

              <Champion
                entry={top3[1]}
                rank={2}
                phone={phone}
                animatedIds={animatedIds}
                onProfile={onProfile}
              />

              <Champion
                entry={top3[0]}
                rank={1}
                phone={phone}
                animatedIds={animatedIds}
                onProfile={onProfile}
              />

              <Champion
                entry={top3[2]}
                rank={3}
                phone={phone}
                animatedIds={animatedIds}
                onProfile={onProfile}
              />
            </section>

            <TopTen
              entries={rest}
              phone={phone}
              animatedIds={animatedIds}
              onProfile={onProfile}
            />

            <SelfCard
              myRank={myRank}
            />
          </>
        )}
      </main>
    </div>
  );
}
