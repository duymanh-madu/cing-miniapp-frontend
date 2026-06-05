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
@keyframes hofGlow1 {
  0%,100%{box-shadow:0 0 20px 6px rgba(255,0,80,.65),0 0 50px 18px rgba(200,0,60,.35)}
  50%{box-shadow:0 0 45px 15px rgba(255,20,90,.95),0 0 100px 35px rgba(220,0,70,.6)}
}
@keyframes hofGlow2 {
  0%,100%{box-shadow:0 0 16px 5px rgba(40,80,255,.55),0 0 40px 14px rgba(40,80,220,.28)}
  50%{box-shadow:0 0 32px 11px rgba(80,130,255,.8),0 0 75px 26px rgba(40,80,220,.48)}
}
@keyframes hofGlow3 {
  0%,100%{box-shadow:0 0 15px 5px rgba(20,180,80,.55),0 0 38px 13px rgba(20,180,80,.28)}
  50%{box-shadow:0 0 30px 10px rgba(50,220,120,.8),0 0 70px 24px rgba(20,180,80,.45)}
}
@keyframes hofGlowSm {
  0%,100%{box-shadow:0 0 6px 2px rgba(255,0,80,.5)}
  50%{box-shadow:0 0 12px 4px rgba(255,20,90,.85)}
}
@keyframes hofCard1Glow {
  0%,100%{box-shadow:0 0 30px 10px rgba(255,0,80,.7),0 0 70px 24px rgba(200,0,60,.4),inset 0 0 30px rgba(255,150,180,.3)}
  50%{box-shadow:0 0 60px 20px rgba(255,20,90,1),0 0 130px 45px rgba(220,0,70,.65),inset 0 0 55px rgba(255,200,220,.5)}
}
@keyframes hofCard2Glow {
  0%,100%{box-shadow:0 0 22px 7px rgba(40,80,255,.6),0 0 55px 18px rgba(40,80,220,.32),inset 0 0 22px rgba(180,210,255,.22)}
  50%{box-shadow:0 0 42px 14px rgba(80,130,255,.88),0 0 95px 32px rgba(40,80,220,.52),inset 0 0 38px rgba(200,220,255,.4)}
}
@keyframes hofCard3Glow {
  0%,100%{box-shadow:0 0 20px 6px rgba(20,180,80,.58),0 0 50px 16px rgba(20,180,80,.28),inset 0 0 18px rgba(150,255,190,.2)}
  50%{box-shadow:0 0 38px 13px rgba(50,220,120,.82),0 0 85px 28px rgba(20,180,80,.48),inset 0 0 34px rgba(180,255,210,.38)}
}
@keyframes hofScan {
  0%{left:-80%} 100%{left:120%}
}
@keyframes hofBorder {
  0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%}
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
