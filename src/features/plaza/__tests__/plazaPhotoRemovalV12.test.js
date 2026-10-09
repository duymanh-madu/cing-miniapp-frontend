import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {removeLegacyPlazaPhotosV12} from '../runtime/removeLegacyPlazaPhotosV12.js';

test('retired album cleanup deletes only its own database without opening storage',async()=>{
  const names=[];const request={};
  const done=removeLegacyPlazaPhotosV12({deleteDatabase(name){names.push(name);return request;},open(){throw Error('must not open');}});
  request.onsuccess();assert.equal(await done,true);assert.deepEqual(names,['cing-plaza-photos-v11']);
});
test('unavailable, blocked or failed local storage cannot block Plaza entry',async()=>{
  assert.equal(await removeLegacyPlazaPhotosV12({}),false);
  assert.equal(await removeLegacyPlazaPhotosV12({deleteDatabase(){throw Error('denied');}}),false);
  for(const event of ['onblocked','onerror']){const request={};const done=removeLegacyPlazaPhotosV12({deleteDatabase(){return request;}});request[event]();assert.equal(await done,false);}
});
test('production and review entry points contain no photo controls, album or capture API',async()=>{
  for(const path of ['pages/PlazaPageV1.jsx','pages/PlazaLobbyV7.jsx','scene/PlazaSceneV1.jsx','scene/createPlazaSceneV1.js']){
    const source=await readFile(new URL('../'+path,import.meta.url),'utf8');
    assert.doesNotMatch(source,/PlazaPhotoAlbum|onAlbum|takePhoto|savePlazaPhoto|albumOpen|photoBusy|capture:\s*\(|Chụp ảnh|Kho ảnh chụp|\.toBlob\(/);
  }
  for(const path of ['pages/PlazaPhotoAlbumV11.jsx','runtime/plazaPhotosV11.js'])await assert.rejects(access(new URL('../'+path,import.meta.url)),{code:'ENOENT'});
});
