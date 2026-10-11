/* Pure zoom limits shared by preview gestures and UI buttons. */
export const PLAZA_PREVIEW_MIN_ZOOM_V19=1;
export const PLAZA_PREVIEW_MAX_ZOOM_V19=2.8;
export const PLAZA_PREVIEW_INITIAL_ZOOM_V19=1.52;
export function clampPlazaPreviewZoomV19(value){
 const n=Number(value);
 return Number.isFinite(n)?Math.max(PLAZA_PREVIEW_MIN_ZOOM_V19,Math.min(PLAZA_PREVIEW_MAX_ZOOM_V19,n)):PLAZA_PREVIEW_INITIAL_ZOOM_V19;
}
export function pinchPlazaPreviewZoomV19(zoom,previousDistance,currentDistance){
 if(!Number.isFinite(previousDistance)||!Number.isFinite(currentDistance)||previousDistance<=2||currentDistance<=2)return clampPlazaPreviewZoomV19(zoom);
 return clampPlazaPreviewZoomV19(zoom*currentDistance/previousDistance);
}
