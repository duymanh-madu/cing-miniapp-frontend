import * as THREE from 'three';
export async function addCafeRoofLogoV11(map,assetRoot,signal){
 const response=await fetch(new URL('v11/cing-roof-logo.png',assetRoot),{signal});if(!response.ok)throw new Error('ROOF_LOGO_UNAVAILABLE');
 const bitmap=await createImageBitmap(await response.blob(),{imageOrientation:'flipY'});if(signal.aborted){bitmap.close();throw new DOMException('Aborted','AbortError');}
 const texture=new THREE.Texture(bitmap);texture.flipY=false;texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;texture.needsUpdate=true;
 const bounds=new THREE.Box3();map.updateMatrixWorld(true);map.traverse(o=>{if(o.isMesh&&/^Cafe_Roof|^V15_Cafe_Roof_Stone_Pavers/.test(o.name)){bounds.union(new THREE.Box3().setFromObject(o));}}); if(bounds.isEmpty()){texture.dispose();bitmap.close();throw new Error('CAFE_ROOF_NOT_FOUND');}
 const centre=bounds.getCenter(new THREE.Vector3());
 // The building's long axis is Z. A vertical double-sided crest follows that ridge.
 const width=Math.min(5.3,(bounds.max.z-bounds.min.z)*.55),height=width*bitmap.height/bitmap.width;
 const material=new THREE.MeshStandardMaterial({map:texture,transparent:true,alphaTest:.12,roughness:.65,metalness:.1,side:THREE.FrontSide,alphaToCoverage:true,emissive:'#ffffff',emissiveMap:texture,emissiveIntensity:.3});
 const logo=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);logo.name='V11_Cing_Roof_Logo';logo.rotation.y=Math.PI/2;logo.position.set(centre.x,bounds.max.y+height/2+.08,centre.z);logo.userData.plazaCollision=false;logo.position.x+=.012;map.add(logo);
 const logoBack=new THREE.Mesh(logo.geometry,material);logoBack.name='V11_Cing_Roof_Logo_Back';logoBack.rotation.y=-Math.PI/2;logoBack.position.copy(logo.position);logoBack.position.x-=.024;logoBack.userData.plazaCollision=false;map.add(logoBack);
 // Solid walls and roofs keep their original materials and depth behaviour.
 // The logo is the only alpha-cutout addition; camera occlusion must not fade masonry.
 const preserved=new Set([logo,logoBack]);
 return {preserved,update(){},logo};
}
