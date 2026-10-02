import { LeaderboardAvatarTitleIcons } from "@/features/leaderboard/components/LeaderboardBadgeChips";
import royalHallBg from "@/features/leaderboard/assets/royal-hall/royal-hall-bg.webp";
import "@/features/leaderboard/components/royal/V8RoyalGameLeaderboard.css";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import { useNavigate } from "react-router-dom";
import LeaderboardBadgeChips from "@/features/leaderboard/components/LeaderboardBadgeChips";

function getPhone() {
  const sources = [
    useRuntimeCustomerIdentityStore.getState().identity?.phone,
    useAuthStore.getState().profile?.phone,
  ];
  for (const src of sources) {
    if (!src || src === "pending") continue;
    const n = src.replace(/\D/g,"").replace(/^84/,"0");
    if (n.length >= 9) return n;
  }
  return "";
}

const MEDAL = ["🥇","🥈","🥉"];

export default function ChessLeaderboard({ onClose }) {
  const [tab,     setTab]     = useState("wins");
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [privateRanks, setPrivateRanks] = useState(null);
  const runtimePhone = useRuntimeCustomerIdentityStore(s => s.identity?.phone);
  const profilePhone = useAuthStore(s => s.profile?.phone);
  const navigate = useNavigate();

  const myPhone = (() => {
    for (const src of [runtimePhone, profilePhone]) {
      if (!src || src === "pending") continue;
      const n = src.replace(/\D/g,"").replace(/^84/,"0");
      if (n.length >= 9) return n;
    }
    return "";
  })();

  const goProfile = (uid) => {
    if (uid) { onClose(); setTimeout(() => navigate(`/profile/${uid}`), 150); }
  };

  const fetchData = ({ background = false } = {}) => {
    if (!background) {
      setLoading(true);
    }

    const publicRequest =
      apiClient
        .get("/game/chess/leaderboard")
        .then(r => {
          setData(r.data?.data);
        })
        .catch(() => {});

    const privateRequest =
      myPhone
        ? apiClient
            .get(
              `/game/chess/leaderboard/user-rank/${myPhone}`
            )
            .then(r => {
              setPrivateRanks(
                r.data?.data || null
              );
            })
            .catch(() => {})
        : Promise.resolve();

    return Promise
      .all([
        publicRequest,
        privateRequest,
      ])
      .finally(() => {
        if (!background) {
          setLoading(false);
        }
      });
  };

  useEffect(() => {
    fetchData();

    const GAME_SERVER =
      import.meta.env.VITE_GAME_SERVER_URL ||
      "https://cing-backend-production.up.railway.app";

    const socket = io(
      `${GAME_SERVER}/chess`,
      { transports:["websocket"] }
    );

    let refreshTimer = null;

    const refreshInBackground = () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      refreshTimer = setTimeout(() => {
        fetchData({ background:true });
      }, 180);
    };

    socket.on(
      "chess:leaderboard_updated",
      refreshInBackground
    );

    const handleFocus = () =>
      refreshInBackground();

    const handleVisibility = () => {
      if (!document.hidden) {
        refreshInBackground();
      }
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      socket.off(
        "chess:leaderboard_updated",
        refreshInBackground
      );

      socket.disconnect();

      window.removeEventListener(
        "focus",
        handleFocus
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [myPhone]);

  const list = (
    tab === "wins"
      ? (data?.topWins || [])
      : (data?.topStreak || [])
  ).slice(0, 10);

  const top3 = list.slice(0,3);
  const rest = list.slice(3);
  const myEntry = list.find(
    e => String(e.user_id) === String(myPhone)
  );

  const privateRank =
    tab === "wins"
      ? privateRanks?.wins
      : privateRanks?.streak;

  const showPrivateRank =
    Boolean(privateRank?.rank) &&
    Number(privateRank.rank) > 10;

  return (
    <div
      className="v8-royal-root cing-chess-royal"
      data-cing-chess-royal="R08C"
    >
      <div
        className="v8-royal-bg"
        style={{ backgroundImage:`url(${royalHallBg})` }}
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
          <small>CING HU TANG KINH BẮC</small>
          <span>HALL OF FAME</span>
          <h1>♟ Kỳ thủ cờ vua</h1>
          <p>
            {tab === "wins"
              ? "Vinh danh 10 kỳ thủ thắng nhiều nhất"
              : "Vinh danh 10 kỳ thủ có chuỗi thắng dài nhất"}
          </p>
        </div>
      </header>

      <div
        className="cing-chess-royal__tabs"
        role="tablist"
        aria-label="Chế độ bảng xếp hạng cờ vua"
      >
        {[
          {key:"wins",label:"🏆 Thắng nhiều nhất"},
          {key:"streak",label:"🔥 Chuỗi thắng"},
        ].map(item => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            className={
              tab === item.key ? "is-active" : ""
            }
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <main className="v8-royal-scroll cing-chess-royal__scroll">
        {loading ? (
          <div className="v8-royal-state">
            Đang tải bảng xếp hạng...
          </div>
        ) : list.length === 0 ? (
          <div className="v8-royal-state">
            <strong>Chưa có dữ liệu cờ vua</strong>
            <span>
              Hãy tham gia thi đấu để ghi tên lên bảng danh vọng!
            </span>
          </div>
        ) : (
          <>
            <section className="v8-royal-podium-scene">
              <div className="v8-royal-podium-shade" />

              {[1,0,2].map(index => {
                const entry = top3[index];
                const rank = index + 1;

                if (!entry) {
                  return (
                    <div
                      key={rank}
                      className={
                        `v8-royal-champion v8-royal-champion--${rank} v8-royal-champion--empty`
                      }
                    />
                  );
                }

                const name =
                  entry.player_name || entry.name || "Cing iu";
                const score = tab === "wins"
                  ? Number(entry.wins || 0)
                  : Number(entry.best_streak || 0);

                return (
                  <article
                    key={entry.user_id || rank}
                    className={
                      `v8-royal-champion v8-royal-champion--${rank}`
                    }
                    onClick={() => goProfile(entry.user_id)}
                  >
                    <div className="v8-royal-champion__medallion">
                      <div
                        className={
                          `v8-royal-avatar v8-royal-avatar--${rank}`
                        }
                      >
                        {entry.avatar ? (
                          <img src={entry.avatar} alt="" />
                        ) : (
                          <span>{name[0]?.toUpperCase() || "?"}</span>
                        )}
                      </div>

                      <LeaderboardAvatarTitleIcons entry={entry} />

                      <span className="v8-royal-champion__rank-seal">
                        {rank}
                      </span>
                    </div>

                    <h3
                      className="v8-royal-champion__name"
                      title={name}
                    >
                      {name}
                    </h3>

                    <div className="v8-royal-champion__badges">
                      <LeaderboardBadgeChips
                        entry={entry}
                        align="center"
                      />
                    </div>

                    <div
                      className="v8-royal-champion__score"
                      aria-label={
                        tab === "wins"
                          ? `${score} trận thắng`
                          : `Chuỗi thắng ${score}`
                      }
                    >
                      {score.toLocaleString("vi-VN")}
                    </div>
                  </article>
                );
              })}
            </section>

            {rest.length > 0 && (
              <section className="v8-royal-top10">
                {rest.map((entry,index) => {
                  const name =
                    entry.player_name || entry.name || "Cing iu";
                  const rank = index + 4;
                  const score = tab === "wins"
                    ? Number(entry.wins || 0)
                    : Number(entry.best_streak || 0);
                  const isMe =
                    Boolean(myPhone) &&
                    String(entry.user_id) === String(myPhone);

                  return (
                    <button
                      type="button"
                      key={entry.user_id || rank}
                      className={
                        isMe
                          ? "v8-royal-row v8-royal-row--me"
                          : "v8-royal-row"
                      }
                      onClick={() => goProfile(entry.user_id)}
                    >
                      <span className="v8-royal-row__rank">
                        {rank}
                      </span>

                      <div className="v8-royal-row-avatar">
                        {entry.avatar ? (
                          <img src={entry.avatar} alt="" />
                        ) : (
                          <span>
                            {name[0]?.toUpperCase() || "?"}
                          </span>
                        )}
                      </div>

                      <span className="v8-royal-row__main">
                        <strong className="v8-royal-row__name">
                          {name}{isMe ? " (bạn)" : ""}
                        </strong>

                        <span className="v8-royal-row__badges">
                          <LeaderboardBadgeChips
                            entry={entry}
                            align="start"
                          />
                        </span>
                      </span>

                      <strong className="v8-royal-row__score">
                        {score.toLocaleString("vi-VN")}
                      </strong>

                      <span className="v8-royal-row__arrow">
                        ›
                      </span>
                    </button>
                  );
                })}
              </section>
            )}

            {showPrivateRank && (
              <section className="v8-royal-self">
                <div className="v8-royal-self__crest">♟</div>

                <div className="v8-royal-self__main">
                  <small>THÀNH TÍCH CỦA BẠN</small>
                  <strong>
                    {tab === "wins"
                      ? "Số trận thắng"
                      : "Chuỗi thắng dài nhất"}
                  </strong>
                </div>

                <div className="v8-royal-self__rank">
                  <b>#{privateRank.rank}</b>
                  <span>{privateRank.score}</span>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <style>{`
        .cing-chess-royal__tabs {
          position: relative;
          z-index: 5;
          display: grid;
          grid-template-columns: minmax(0,1fr) minmax(0,1fr);
          flex-shrink: 0;
          gap: 8px;
          padding: 10px 16px 14px;
          background: rgba(8,4,16,0.91);
          border-bottom: 1px solid rgba(232,201,139,0.25);
        }

        .cing-chess-royal__tabs button {
          min-width: 0;
          min-height: 44px;
          padding: 9px 5px;
          border-radius: 12px;
          border: 1px solid rgba(232,201,139,0.24);
          color: #f6e7c8;
          background: rgba(16,9,26,0.85);
          font-size: 12px;
          font-weight: 700;
        }

        .cing-chess-royal__tabs button.is-active {
          color: #160b05;
          border-color: #e8c98b;
          background: linear-gradient(135deg,#f5db9a,#c58c4d);
          font-weight: 900;
        }

        .cing-chess-royal__scroll {
          min-height: 0;
          -webkit-overflow-scrolling: touch;
        }

        .cing-chess-royal .v8-royal-champion {
          min-width: 0;
        }

        .cing-chess-royal .v8-royal-champion__name {
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cing-chess-royal .v8-royal-champion__badges {
          min-width: 0;
          max-width: 100%;
        }

        .cing-chess-royal .v8-royal-row__main {
          min-width: 0;
        }

        @media (max-width: 390px) {
          .cing-chess-royal__tabs {
            padding-left: 10px;
            padding-right: 10px;
            gap: 6px;
          }

          .cing-chess-royal__tabs button {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}
