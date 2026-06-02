/**
 * Inject tier badge CSS animations vào document
 * Gọi 1 lần ở app root
 */

const CSS = `
@keyframes royalBorder {
  0%   { background-position: 0% 50% }
  50%  { background-position: 100% 50% }
  100% { background-position: 0% 50% }
}
@keyframes diamondGlowBadge {
  0%,100% { box-shadow: 0 0 10px 3px rgba(50,140,255,.5),  0 0 28px 8px rgba(50,140,255,.22) }
  50%     { box-shadow: 0 0 22px 8px rgba(50,140,255,.85), 0 0 60px 20px rgba(50,140,255,.45) }
}
@keyframes partnerGlowBadge {
  0%,100% { box-shadow: 0 0 10px 3px rgba(212,83,126,.5),  0 0 28px 8px rgba(180,80,255,.22) }
  50%     { box-shadow: 0 0 22px 8px rgba(212,83,126,.85), 0 0 60px 20px rgba(180,80,255,.45) }
}
@keyframes ktGlow {
  0%,100% { box-shadow: 0 0 10px 3px rgba(186,117,23,.5),  0 0 28px 8px rgba(255,180,0,.22) }
  50%     { box-shadow: 0 0 22px 8px rgba(186,117,23,.85), 0 0 60px 20px rgba(255,180,0,.45) }
}
@keyframes dGlowSm {
  0%,100% { box-shadow: 0 0 5px 2px rgba(50,140,255,.5)  }
  50%     { box-shadow: 0 0 10px 4px rgba(50,140,255,.85) }
}
@keyframes pGlowSm {
  0%,100% { box-shadow: 0 0 5px 2px rgba(212,83,126,.5)  }
  50%     { box-shadow: 0 0 10px 4px rgba(212,83,126,.85) }
}
@keyframes ktGlowSm {
  0%,100% { box-shadow: 0 0 5px 2px rgba(186,117,23,.5)  }
  50%     { box-shadow: 0 0 10px 4px rgba(186,117,23,.85) }
}
@keyframes liveFlash {
  0%,100% { opacity: 1 }
  50%     { opacity: .35 }
}
`;

let injected = false;
export function injectTierBadgeStyles() {
  if (injected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.id    = "tier-badge-styles";
  style.textContent = CSS;
  document.head.appendChild(style);
  injected = true;
}

export default injectTierBadgeStyles;
