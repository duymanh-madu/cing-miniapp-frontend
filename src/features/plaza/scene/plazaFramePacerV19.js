// Bound redundant redraw on 120/144Hz displays; retain elapsed-time movement.
export function createPlazaFramePacerV19(fps=60){const interval=1000/fps;let next=null;
 return {shouldRender(now){if(next===null||now-next>=interval*4){next=now+interval;return true;}if(now+.1<next)return false;next+=interval;return true;},reset(){next=null;}};
}
