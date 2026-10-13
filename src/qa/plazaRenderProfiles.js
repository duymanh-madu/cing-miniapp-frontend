export const PLAZA_RENDER_PROFILES=Object.freeze({
 control:Object.freeze({combineSkeletons:true,combineMorphs:true,updateWorldOnce:true,singlePass:false}),
 skeleton:Object.freeze({combineSkeletons:false,combineMorphs:true,updateWorldOnce:true,singlePass:false}),
 morph:Object.freeze({combineSkeletons:true,combineMorphs:false,updateWorldOnce:true,singlePass:false}),
 matrices:Object.freeze({combineSkeletons:true,combineMorphs:true,updateWorldOnce:false,singlePass:false}),
 layers:Object.freeze({combineSkeletons:true,combineMorphs:true,updateWorldOnce:true,singlePass:true}),
});
export function plazaRenderProfile(id){return PLAZA_RENDER_PROFILES[id]||PLAZA_RENDER_PROFILES.control;}
