import LeaderboardBadgeChips from
  "@/features/leaderboard/components/LeaderboardBadgeChips";

import { LeaderboardAvatarTitleIcons } from
  "@/features/leaderboard/components/LeaderboardBadgeChips";

import { getGame } from "@/games/registry/gameRegistry";

import hallArt from
  "@/features/leaderboard/assets/royal-hall/royal-hall-bg.webp";

import "./V8RoyalAlltimeView.css";

const formatScore = value =>
  new Intl.NumberFormat("vi-VN").format(Number(value) || 0);

const playerName = entry =>
  entry?.player_name || entry?.name || "Ẩn danh";

function Avatar({ entry, rank, small = false }) {
  return (
    <span className={`v8a-avatar v8a-avatar--${rank} ${small ? "v8a-avatar--small" : ""}`}>
      {entry?.avatar ? (
        <img src={entry.avatar} alt="" loading="lazy" />
      ) : (
        <span className="v8a-avatar__initial">
          {playerName(entry).charAt(0).toUpperCase()}
        </span>
      )}

      {!small && (
        <>
          <span className="v8a-avatar__rank">{rank}</span>
          <LeaderboardAvatarTitleIcons entry={entry} />
        </>
      )}
    </span>
  );
}

function Champion({ entry, rank, scoreLabel, onProfile }) {
  if (!entry) return <div className="v8a-champion" />;

  return (
    <div className={`v8a-champion v8a-champion--${rank}`}>
      <button
        type="button"
        className="v8a-champion__profile"
        onClick={() => onProfile(entry.user_id)}
      >
        <Avatar entry={entry} rank={rank} />

        <strong className="v8a-champion__name">
          {playerName(entry)}
        </strong>
      </button>

      <div className="v8a-champion__tier">
        <LeaderboardBadgeChips entry={entry} align="center" />
      </div>

      <strong className="v8a-champion__score">
        {formatScore(entry.score)} {scoreLabel}
      </strong>
    </div>
  );
}

function GameIcon({ game }) {
  const registered = getGame(game.game_key);

  return registered?.iconUrl ? (
    <img src={registered.iconUrl} alt="" width="22" height="22" />
  ) : (
    <span aria-hidden="true">{game.icon || "🎮"}</span>
  );
}

export default function V8RoyalAlltimeView({
  games,
  activeGame,
  onSelectGame,
  onClose,
  onProfile,
  loading,
  currentGame,
  publicRows,
  myRank,
  privateOutsideTop10,
  scoreLabel,
  myId,
}) {
  const top3 = publicRows.slice(0, 3);
  const rest = publicRows.slice(3);

  return (
    <div className="v8a-root">
      <div
        className="v8a-background"
        style={{ backgroundImage: `url(${hallArt})` }}
        aria-hidden="true"
      />

      <header className="v8a-header">
        <button
          className="v8a-back"
          type="button"
          onClick={onClose}
          aria-label="Quay lại"
        >
          ←
        </button>

        <div className="v8a-heading">
          <small>CING HU TANG KINH BẮC</small>
          <span>HALL OF FAME</span>
          <h1>Đại sảnh danh vọng</h1>
          <p>Kỷ lục mọi thời đại</p>
        </div>

        <nav className="v8a-tabs" aria-label="Chọn bảng xếp hạng game">
          {games.map(game => (
            <button
              key={game.game_key}
              type="button"
              className={
                activeGame === game.game_key
                  ? "v8a-tab v8a-tab--active"
                  : "v8a-tab"
              }
              aria-pressed={activeGame === game.game_key}
              onClick={() => onSelectGame(game.game_key)}
            >
              <GameIcon game={game} />
              <span>{game.display_name}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="v8a-scroll">
        {loading ? (
          <p className="v8a-state">Đang tải bảng xếp hạng...</p>
        ) : !currentGame || publicRows.length === 0 ? (
          <p className="v8a-state">
            Chưa có dữ liệu xếp hạng cho game này.
          </p>
        ) : (
          <>
            <section className="v8a-stage" aria-label="Ba vị trí dẫn đầu">
              <Champion
                entry={top3[1]}
                rank={2}
                scoreLabel={scoreLabel}
                onProfile={onProfile}
              />
              <Champion
                entry={top3[0]}
                rank={1}
                scoreLabel={scoreLabel}
                onProfile={onProfile}
              />
              <Champion
                entry={top3[2]}
                rank={3}
                scoreLabel={scoreLabel}
                onProfile={onProfile}
              />
            </section>

            {privateOutsideTop10 && (
              <div className="v8a-self">
                <span>Hạng của bạn</span>
                <strong>
                  #{myRank.rank} · {formatScore(myRank.score)} {scoreLabel}
                </strong>
              </div>
            )}

            <section className="v8a-list" aria-label="Top 10 mọi thời đại">
              {rest.map((entry, index) => {
                const rank = index + 4;
                const isMe = String(entry.user_id) === String(myId);

                return (
                  <button
                    type="button"
                    key={entry.user_id || rank}
                    className={`v8a-row ${isMe ? "v8a-row--self" : ""}`}
                    onClick={() => !isMe && onProfile(entry.user_id)}
                  >
                    <span className="v8a-row__rank">{rank}</span>

                    <Avatar entry={entry} rank={rank} small />

                    <span className="v8a-row__main">
                      <strong className="v8a-row__name">
                        {playerName(entry)}{isMe ? " (bạn)" : ""}
                      </strong>

                      <span className="v8a-row__tier">
                        <LeaderboardBadgeChips
                          entry={entry}
                          align="start"
                        />
                      </span>
                    </span>

                    <strong className="v8a-row__score">
                      {formatScore(entry.score)}
                    </strong>

                    <span className="v8a-row__arrow" aria-hidden="true">
                      ›
                    </span>
                  </button>
                );
              })}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
