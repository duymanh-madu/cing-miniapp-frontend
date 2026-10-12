/* Pure zoom limits shared by preview gestures and UI buttons. */
export const PLAZA_PREVIEW_MIN_ZOOM_V19=1;
export const PLAZA_PREVIEW_MAX_ZOOM_V19=2.8;
export const PLAZA_PREVIEW_INITIAL_ZOOM_V19=1;
export function clampPlazaPreviewZoomV19(value){
 const n=Number(value);
 return Number.isFinite(n)?Math.max(PLAZA_PREVIEW_MIN_ZOOM_V19,Math.min(PLAZA_PREVIEW_MAX_ZOOM_V19,n)):PLAZA_PREVIEW_INITIAL_ZOOM_V19;
}
export function pinchPlazaPreviewZoomV19(zoom,previousDistance,currentDistance){
 if(!Number.isFinite(previousDistance)||!Number.isFinite(currentDistance)||previousDistance<=2||currentDistance<=2)return clampPlazaPreviewZoomV19(zoom);
 return clampPlazaPreviewZoomV19(zoom*currentDistance/previousDistance);
}

// Pan is a translation of the look-at target; it never pitches or rolls the camera.
// A small fit margin avoids revealing empty space at maximum zoom-out.
export function clampPlazaPreviewVerticalPanV19(value,fitHeight,visibleHeight){
 const height=Number(fitHeight),view=Number(visibleHeight),pan=Number(value);
 if(!Number.isFinite(pan)||!Number.isFinite(height)||!Number.isFinite(view)||height<=0||view<=0)return 0;
 const limit=Math.max(0,(height-view)/2)+height*.035;
 return Math.max(-limit,Math.min(limit,pan));
}
export function dragPlazaPreviewVerticalPanV19(pan,deltaY,fitHeight,visibleHeight,canvasHeight){
 if(!Number.isFinite(deltaY)||!Number.isFinite(canvasHeight)||canvasHeight<=0)return clampPlazaPreviewVerticalPanV19(pan,fitHeight,visibleHeight);
 return clampPlazaPreviewVerticalPanV19(pan+deltaY*visibleHeight/canvasHeight,fitHeight,visibleHeight);
}
