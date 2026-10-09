import * as THREE from 'three';
export async function addCafeRoofLogoV11(map,assetRoot,signal){
 const response=await fetch(new URL('v11/cing-roof-logo.png',assetRoot),{signal});if(!response.ok)throw new Error('ROOF_LOGO_UNAVAILABLE');
 const bitmap=await createImageBitmap(await response.blob(),{imageOrientation:'flipY'});if(signal.aborted){bitmap.close();throw new DOMException('Aborted','AbortError');}
 const texture=new THREE.Texture(bitmap);texture.flipY=false;texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;texture.needsUpdate=true;
 const roofs=[],walls=[];const bounds=new THREE.Box3();map.updateMatrixWorld(true);map.traverse(o=>{if(o.isMesh&&/^Cafe_Roof|^V15_Cafe_Roof_Stone_Pavers/.test(o.name)){roofs.push(o);bounds.union(new THREE.Box3().setFromObject(o));}else if(o.isMesh&&/^Cafe_(?:Side_Wall|Orange_Side)|^V15_Facade_With_Continuous_Inset_Arch$|^V3_Rear_V15_Facade_With_Continuous_Inset_Arch$/.test(o.name))walls.push(o);});
 if(bounds.isEmpty()){texture.dispose();bitmap.close();throw new Error('CAFE_ROOF_NOT_FOUND');}
 const centre=bounds.getCenter(new THREE.Vector3());
 // The building's long axis is Z. A vertical double-sided crest follows that ridge.
 const width=Math.min(5.3,(bounds.max.z-bounds.min.z)*.55),height=width*bitmap.height/bitmap.width;
 const material=new THREE.MeshStandardMaterial({map:texture,transparent:true,alphaTest:.12,roughness:.65,metalness:.1,side:THREE.FrontSide,alphaToCoverage:true,emissive:'#ffffff',emissiveMap:texture,emissiveIntensity:.3});
 const logo=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);logo.name='V11_Cing_Roof_Logo';logo.rotation.y=Math.PI/2;logo.position.set(centre.x,bounds.max.y+height/2+.08,centre.z);logo.userData.plazaCollision=false;logo.position.x+=.012;map.add(logo);
 const logoBack=new THREE.Mesh(logo.geometry,material);logoBack.name='V11_Cing_Roof_Logo_Back';logoBack.rotation.y=-Math.PI/2;logoBack.position.copy(logo.position);logoBack.position.x-=.024;logoBack.userData.plazaCollision=false;map.add(logoBack);
 const occluders=[...roofs,...walls];const preserved=new Set([...occluders,logo,logoBack]);
 // Fade only the cafe envelope that blocks the camera-to-avatar ray, keeping the approved orbit intact.
 const ray=new THREE.Raycaster(),direction=new THREE.Vector3();const roofMaterials=[];
 for(const roof of occluders){const list=(Array.isArray(roof.material)?roof.material:[roof.material]).map(m=>{const v=m.clone();v.transparent=true;v.depthWrite=true;roofMaterials.push(v);return v;});roof.material=Array.isArray(roof.material)?list:list[0];}
 function update(camera,avatar,dt){direction.copy(avatar.position).add(new THREE.Vector3(0,1,0)).sub(camera.position);ray.set(camera.position,direction.clone().normalize());ray.far=direction.length();const blocked=new Set(ray.intersectObjects(occluders,false).map(h=>h.object));for(const roof of occluders){const target=blocked.has(roof)?.10:1;for(const m of (Array.isArray(roof.material)?roof.material:[roof.material])){m.opacity=THREE.MathUtils.damp(m.opacity,target,14,dt);m.depthWrite=m.opacity>.98;}} }
 return {preserved,update,logo};
}
