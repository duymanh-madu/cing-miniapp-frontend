import LeaderboardBadgeChips from
  "@/features/leaderboard/components/LeaderboardBadgeChips";

import {
  LeaderboardAvatarTitleIcons,
} from "@/features/leaderboard/components/LeaderboardBadgeChips";

import hallArt from
  "@/features/leaderboard/assets/royal-hall/royal-hall-bg.webp";

import "./V8RoyalSpendingHall.css";

const money = (value) =>
  new Intl.NumberFormat("vi-VN").format(Number(value) || 0) + "đ";

const amount = (entry) =>
  entry?.total_spent ?? entry?.total_spent_all_time ?? 0;

const displayName = (entry) =>
  entry?.player_name || entry?.name || "Ẩn danh";

function HallAvatar({ entry, rank, small = false }) {
  const name = displayName(entry);

  return (
    <span className={`v8h-avatar v8h-avatar--${rank}${small ? " v8h-avatar--small" : ""}`}>
      {entry?.avatar ? (
        <img src={entry.avatar} alt="" loading="lazy" />
      ) : (
        <span className="v8h-avatar__initial">
          {name.charAt(0).toUpperCase()}
        </span>
      )}

      {!small && (
        <>
          <span className="v8h-avatar__rank">{rank}</span>
          <LeaderboardAvatarTitleIcons entry={entry} />
        </>
      )}
    </span>
  );
}

function HallChampion({ entry, rank, onProfile }) {
  if (!entry) return <div className="v8h-champion-placeholder" />;

  return (
    <div className={`v8h-champion v8h-champion--${rank}`}>
      <button
        type="button"
        className="v8h-champion__profile"
        onClick={() => onProfile(entry.user_id)}
      >
        <HallAvatar entry={entry} rank={rank} />

        <strong className="v8h-champion__name">
          {displayName(entry)}
        </strong>
      </button>

      <div className="v8h-champion__tier">
        <LeaderboardBadgeChips entry={entry} align="center" />
      </div>

      <strong className="v8h-champion__amount">
        {money(amount(entry))}
      </strong>
    </div>
  );
}

function HallRewards({ config }) {
  if (!config?.enabled || !Array.isArray(config.rewards) ||
      config.rewards.length === 0) {
    return null;
  }

  return (
    <section className="v8h-rewards" aria-label="Phần thưởng kỳ này">
      {config.rewards.slice(0, 3).map((reward, index) => (
        <div className="v8h-reward" key={index}>
          <span className={`v8h-reward__rank v8h-reward__rank--${index + 1}`}>
            {index + 1}
          </span>

          <span className="v8h-reward__copy">
            <strong>
              {new Intl.NumberFormat("vi-VN").format(reward.points || 0)} điểm
            </strong>
            <small>{reward.label || `Hạng ${index + 1}`}</small>
          </span>
        </div>
      ))}
    </section>
  );
}

function HallRows({ rows, validPhone, profile, onProfile }) {
  return (
    <section className="v8h-list" aria-label="Danh sách xếp hạng">
      {rows.map((entry, i) => {
        const rank = i + 4;
        const isMe = validPhone
          ? String(entry.user_id) === validPhone
          : String(entry.user_id) === String(profile?.id);

        return (
          <button
            type="button"
            key={entry.user_id || rank}
            className={`v8h-row${isMe ? " v8h-row--self" : ""}`}
            onClick={() => !isMe && onProfile(entry.user_id)}
          >
            <span className="v8h-row__rank">{rank}</span>

            <HallAvatar entry={entry} rank={rank} small />

            <span className="v8h-row__main">
              <strong className="v8h-row__name">
                {displayName(entry)}{isMe ? " (bạn)" : ""}
              </strong>

              <span className="v8h-row__tier">
                <LeaderboardBadgeChips entry={entry} align="start" />
              </span>
            </span>

            <strong className="v8h-row__amount">
              {money(amount(entry))}
            </strong>

            <span className="v8h-row__chevron" aria-hidden="true">›</span>
          </button>
        );
      })}
    </section>
  );
}

function HallSelf({ myRank, profile }) {
  if (!myRank?.rank || Number(myRank.rank) <= 10) return null;

  return (
    <section className="v8h-self">
      <div className="v8h-self__identity">
        <HallAvatar
          entry={{
            ...myRank,
            avatar: myRank.avatar || profile?.avatar,
            player_name: profile?.name || "Bạn",
          }}
          rank={myRank.rank}
          small
        />

        <span className="v8h-self__main">
          <small>Hạng của bạn</small>
          <strong>{profile?.name || "Bạn"}</strong>
          <LeaderboardBadgeChips entry={myRank} align="start" />
        </span>
      </div>

      <div className="v8h-self__score">
        <strong>#{myRank.rank}</strong>
        <span>{money(amount(myRank))}</span>
      </div>
    </section>
  );
}

export default function V8RoyalSpendingHall({
  tabs,
  tab,
  onTab,
  navigateBack,
  showCustom,
  customRange,
  rewardsConfig,
  loading,
  data,
  myRank,
  profile,
  validPhone,
  onProfile,
  notificationNode,
  resetNotification,
}) {
  const publicRows = Array.isArray(data) ? data.slice(0, 10) : [];
  const [first, second, third] = publicRows;

  return (
    <div className="v8h-root">
      <div
        className="v8h-background"
        style={{ backgroundImage: `url(${hallArt})` }}
        aria-hidden="true"
      />

      {resetNotification && (
        <div className="v8h-toast" role="status">
          <strong>BXH tuần mới!</strong>
          <p>{resetNotification}</p>
        </div>
      )}
      {notificationNode}

      <header className="v8h-header">
        <button
          type="button"
          className="v8h-back"
          onClick={navigateBack}
          aria-label="Quay lại"
        >
          ←
        </button>

        <div className="v8h-heading">
          <small>CING HU TANG KINH BẮC</small>
          <span>HALL OF FAME</span>
          <h1>Đại sảnh danh vọng</h1>
          <p>Vinh danh những Cing iu có "Sức hút" nhất</p>
        </div>

        <nav className="v8h-tabs" aria-label="Kỳ xếp hạng">
          {tabs.map((item) => (
            <button
              type="button"
              key={item.id}
              className={tab === item.id ? "v8h-tab v8h-tab--active" : "v8h-tab"}
              aria-pressed={tab === item.id}
              onClick={() => onTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {showCustom && customRange.from && (
          <p className="v8h-custom-range">
            {new Date(customRange.from).toLocaleDateString("vi-VN")}
            {" — "}
            {customRange.to
              ? new Date(customRange.to).toLocaleDateString("vi-VN")
              : "nay"}
          </p>
        )}
      </header>

      <div className="v8h-scroll">
        <HallRewards config={rewardsConfig[tab]} />

        {loading ? (
          <div className="v8h-state">Đang tải bảng xếp hạng...</div>
        ) : publicRows.length === 0 ? (
          <div className="v8h-state">
            Chưa có dữ liệu cho kỳ này.
          </div>
        ) : (
          <>
            <section className="v8h-stage" aria-label="Ba vị trí dẫn đầu">
              <HallChampion entry={second} rank={2} onProfile={onProfile} />
              <HallChampion entry={first} rank={1} onProfile={onProfile} />
              <HallChampion entry={third} rank={3} onProfile={onProfile} />
            </section>

            <HallSelf myRank={myRank} profile={profile} />

            <HallRows
              rows={publicRows.slice(3)}
              validPhone={validPhone}
              profile={profile}
              onProfile={onProfile}
            />
          </>
        )}
      </div>
    </div>
  );
}
