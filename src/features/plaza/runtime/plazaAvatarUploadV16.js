export async function compressPlazaAvatarV16(file){
 if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024)throw Object.assign(new Error('Invalid avatar'),{code:'PLAZA_INVALID_AVATAR'});
 const url=URL.createObjectURL(file);try{
  const image=new Image();image.src=url;await image.decode();if(image.naturalWidth*image.naturalHeight>40000000)throw new Error('Image too large');
  const scale=Math.min(1,512/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
  const ctx=canvas.getContext('2d');ctx.fillStyle='#f4eee3';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
  let blob;for(const q of [.86,.72,.58]){blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',q));if(blob&&blob.size<=262144)break;}
  canvas.width=canvas.height=1;if(!blob||blob.size>262144)throw new Error('Image too large');return blob;
 }catch{throw Object.assign(new Error('Invalid avatar'),{code:'PLAZA_INVALID_AVATAR'});}finally{URL.revokeObjectURL(url);}
}
