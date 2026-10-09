// Only an intentional drag beyond the outer ring arms continuous movement.
export function joystickLockArmedV11(x,y,rect){return Math.hypot(x-rect.left-rect.width/2,y-rect.top-rect.height/2)>rect.width*.85;}
export function lockedDirectionV11(vector){const n=Math.hypot(vector.x,vector.z);return n>.1?{x:vector.x/n,z:vector.z/n}:null;}
