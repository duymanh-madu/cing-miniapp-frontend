import {Camera,Images,Hand,PersonStanding,LockKeyhole,Square} from 'lucide-react';
import PlazaLoadingV11 from '../pages/PlazaLoadingV11.jsx';
import {savePlazaPhotoV11} from '../runtime/plazaPhotosV11.js';
import {joystickLockArmedV11,lockedDirectionV11} from './plazaJoystickV11.js';
import React, { useEffect, useRef, useState } from 'react';
import { inputVector } from './plazaMotionV1.js';
import { joystickVector } from './plazaRefinementsV2.js';
import './PlazaSceneV1.css';
import definitions from './plazaTablesV3.json';
import PlazaChessPanelV3 from './PlazaChessPanelV3.jsx';
import {createPlazaChessAudioV4} from './plazaChessAudioV4.js';

const KEY = {
  ArrowUp: 'forward', KeyW: 'forward', ArrowDown: 'back', KeyS: 'back',
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
};

export default function PlazaSceneV1({ diagnostics = false, initialCharacter = 'girl', realtimeClient = null, members = [], selfId = null, correction = null, tables=[], roomId=null, messages=[], identity=null, interactionPaused=false, onReadyChange=()=>{}, onAlbum=()=>{} }) {
  const chessAudio=useRef(null);
  useEffect(()=>{chessAudio.current=createPlazaChessAudioV4();function visibility(){if(document.hidden)chessAudio.current?.suspend();else chessAudio.current?.resumeExisting();}document.addEventListener('visibilitychange',visibility);return()=>{document.removeEventListener('visibilitychange',visibility);chessAudio.current?.dispose();chessAudio.current=null;};},[]);
  const [nearSeat,setNearSeat]=useState(null),[tableError,setTableError]=useState(''),[tableBusy,setTableBusy]=useState(false);
  const tablesRef=useRef(tables);tablesRef.current=tables;
  const nearbyRef=useRef(null),actionLock=useRef(false);
  const ownTable=tables.find(t=>t.seats.some(s=>s.memberId===selfId));
  useEffect(()=>{api.current?.setTables(tables);},[tables]);
  function position(value){let best=null,distance=1.4;for(const t of definitions){const state=tablesRef.current.find(x=>x.tableId===t.tableId);for(const seat of t.seats){if(state?.seats.some(s=>s.seatId===seat.seatId))continue;if(Math.abs(value.y-(seat.y-.6))>.9)continue;const d=Math.hypot(value.x-seat.x,value.z-seat.z);if(d<distance){best={tableId:t.tableId,seatId:seat.seatId};distance=d;}}}const id=best?.seatId||null;if(id!==nearbyRef.current){nearbyRef.current=id;setNearSeat(best);}}
  async function tableAction(payload){chessAudio.current?.unlockFromGesture();if(actionLock.current)return;actionLock.current=true;setTableBusy(true);setTableError('');clearInput();try{await clientRef.current?.tableAction(payload);}catch(e){setTableError(({PLAZA_SEAT_TAKEN:'Ghế vừa có người ngồi.',PLAZA_SEAT_TOO_FAR:'Hãy đến gần ghế hơn.',PLAZA_CHESS_PERSIST_FAILED:'Chưa lưu được trận đấu. Hãy thử lại.',PLAZA_OUTCOME_UNKNOWN:'Chưa nhận được xác nhận. Hãy kiểm tra trạng thái bàn.'})[e.code]||'Chưa hoàn tất thao tác. Hãy thử lại.');}finally{actionLock.current=false;setTableBusy(false);}}
  const host = useRef(null), api = useRef(null), wrapper = useRef(null);
  useEffect(()=>{api.current?.correct(correction);},[correction]);
  const labelsRef=useRef({roomId,messages,identity,selfId});labelsRef.current={roomId,messages,identity,selfId};
  useEffect(()=>{api.current?.setIdentity(labelsRef.current);},[roomId,messages,identity,selfId]);
  const presenceRef=useRef({members,selfId});presenceRef.current={members,selfId};
  const clientRef=useRef(realtimeClient);clientRef.current=realtimeClient;
  useEffect(()=>{api.current?.setMembers(members,selfId);},[members,selfId]);
  const keyboard = useRef(new Set()), pointers = useRef(new Map());
  const [epoch, setEpoch] = useState(0);
  const [character, setCharacter] = useState(initialCharacter === 'boy' ? 'boy' : 'girl');
  useEffect(()=>setCharacter(initialCharacter === 'boy' ? 'boy' : 'girl'),[initialCharacter]);
  const review = diagnostics && import.meta.env.DEV;
  const [progress, setProgress] = useState({ text: 'Đang mở không gian…', percent: 0 });
  const [motion, setMotion] = useState('idle'), [stats, setStats] = useState({});
  const [knob, setKnob] = useState({ x: 0, z: 0 });
  const [notice, setNotice] = useState('');
  const [locked,setLocked]=useState(false),[lockArmed,setLockArmed]=useState(false),[photoBusy,setPhotoBusy]=useState(false),[photoNote,setPhotoNote]=useState('');
  const lockedRef=useRef(false),armedRef=useRef(false);
  const stick = useRef({ x: 0, z: 0 }), stickPointer = useRef(null), taps = useRef(new Map());
  function syncInput() {
    const keys = new Set([...keyboard.current].map(code => KEY[code]));
    const k = inputVector(keys);
    api.current?.setInput(keys.size ? k : stick.current);
  }
  function clearInput() {
    lockedRef.current=false;armedRef.current=false;setLocked(false);setLockArmed(false);
    keyboard.current.clear(); pointers.current.clear();
    stickPointer.current = null; stick.current = { x: 0, z: 0 }; setKnob(stick.current);
    taps.current.clear(); api.current?.stop();
  }

  useEffect(() => {
    let cancelled = false, instance = null;
    setProgress({ text: 'Đang mở không gian…', percent: 0 });
    setStats({}); setMotion('idle');
    import('./createPlazaSceneV1.js').then(({ createPlazaSceneV1 }) => {
      if (cancelled) return;
      instance = createPlazaSceneV1(host.current, {
        character,
        onLocalState:value=>clientRef.current?.sendState(value),
        onPosition:position,
        onProgress: value => { if (!cancelled) setProgress(value); },
        onState: value => { if (!cancelled) setMotion(value); },
        onStats: value => { if (!cancelled) setStats(value); },
        onNotice: value => { if (!cancelled) setNotice(value); },
      });
      api.current = instance;
      instance.setMembers(presenceRef.current.members,presenceRef.current.selfId);
      instance.setTables(tablesRef.current);
      instance.setIdentity(labelsRef.current);
      return instance.ready;
    }).catch(error => {
      if (!cancelled && error.name !== 'AbortError') {
        setProgress({ error: error.message || 'Chưa mở được không gian 3D.' });
      }
    });
    function keyDown(event) {
      if (!KEY[event.code] || !wrapper.current?.contains(document.activeElement) ||
          event.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      event.preventDefault(); keyboard.current.add(event.code); syncInput();
    }
    function keyUp(event) {
      if (!keyboard.current.has(event.code)) return;
      keyboard.current.delete(event.code); syncInput();
    }
    function visibility() { if (document.hidden) clearInput(); }
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    window.addEventListener('blur', clearInput);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      cancelled = true;
      keyboard.current.clear(); pointers.current.clear();
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      window.removeEventListener('blur', clearInput);
      document.removeEventListener('visibilitychange', visibility);
      instance?.dispose();
      if (api.current === instance) api.current = null;
    };
  }, [epoch, character]);

  const ready = progress.ready === true;
  useEffect(()=>{onReadyChange(ready);},[ready,onReadyChange]);
  useEffect(()=>{api.current?.setInteractionPaused(interactionPaused);if(interactionPaused||ownTable||!ready){clearInput();api.current?.cancelGestures();}},[interactionPaused,Boolean(ownTable),ready]);
  useEffect(()=>{if(!photoNote)return;const timer=setTimeout(()=>setPhotoNote(''),4000);return()=>clearTimeout(timer);},[photoNote]);
  async function takePhoto(){if(photoBusy)return;setPhotoBusy(true);clearInput();try{const blob=await api.current?.capture();await savePlazaPhotoV11(identity?.memberId||selfId,blob);setPhotoNote('Đã lưu vào kho ảnh chụp.');}catch(error){console.warn('[Cing Plaza] Photo failed:',error?.message);setPhotoNote('Chưa lưu được ảnh. Hãy kiểm tra kho ảnh và dung lượng thiết bị.');}finally{setPhotoBusy(false);}}
  return (
    <section className="cing-plaza-scene" ref={wrapper} tabIndex={0} aria-label="Khám phá Cing Plaza">
      {review && <div className="cing-plaza-scene__title">
        <div><span>KINH BẮC • CING PLAZA</span><h2>Hẹn nhau giữa sân đình</h2></div>
        {ready && review && <button type="button" onClick={() => { clearInput(); api.current?.reset(); }}>Về điểm đầu</button>}
      </div>}
      {review && <div className="cing-plaza-scene__avatar-choice" aria-label="Chọn nhân vật">
        <span>Nhân vật</span>
        {['girl','boy'].map(value => <button key={value} type="button" aria-pressed={character === value} onClick={() => { if (value !== character) { clearInput(); setCharacter(value); } }}>{value === 'girl' ? 'Girl' : 'Boy'}</button>)}
      </div>}
      <div className="cing-plaza-scene__viewport" onPointerDown={() => wrapper.current?.focus({ preventScroll: true })}>
        <div className="cing-plaza-scene__canvas" ref={host}
          onPointerDown={e => {
            if (e.button !== 0) return;
            if (taps.current.size) for (const p of taps.current.values()) p.cancelled = true;
            taps.current.set(e.pointerId, { x: e.clientX, y: e.clientY, time: performance.now(), cancelled: taps.current.size > 0 });
          }}
          onPointerMove={e => {
            const p = taps.current.get(e.pointerId);
            if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 7) p.cancelled = true;
          }}
          onPointerCancel={e => taps.current.delete(e.pointerId)}
          onPointerUp={e => {
            const p = taps.current.get(e.pointerId); taps.current.delete(e.pointerId);
            if (p && !p.cancelled && performance.now() - p.time < 500) {clearInput();api.current?.tap(e.clientX, e.clientY);}
          }} />
        {ready && realtimeClient && !ownTable && nearSeat && <button className="cing-plaza-scene__seat-button" disabled={tableBusy} onClick={()=>tableAction({action:'sit',...nearSeat})}>Ngồi vào bàn</button>}
        {ready && ownTable && <PlazaChessPanelV3 key={ownTable.tableId} table={ownTable} selfId={selfId} client={realtimeClient} audio={chessAudio.current} onStand={()=>tableAction({action:'stand'})}/>}
        {tableError && <p className="cing-plaza-scene__seat-button" role="alert" onClick={()=>setTableError('')}>{tableError}</p>}
        {!ready && <div className="cing-plaza-scene__loading" role={progress.error ? 'alert' : 'status'}>
          <PlazaLoadingV11 error={Boolean(progress.error)} percent={progress.percent} onRetry={()=>setEpoch(v=>v+1)}/>
        </div>}
        {ready && review && <div className="cing-plaza-scene__view-buttons" aria-label="Góc nhìn">
          <button type="button" onClick={() => api.current?.cameraPreset('follow')}>Theo nhân vật</button>
          <button type="button" onClick={() => api.current?.cameraPreset('close')}>Cận cảnh</button>
          <button type="button" onClick={() => api.current?.cameraPreset('overview')}>Toàn cảnh</button>
          <button type="button" onClick={() => { clearInput(); api.current?.checkin('cafe'); }}>Check-in quán</button>
          <button type="button" onClick={() => { clearInput(); api.current?.checkin('dinh'); }}>Check-in đình</button>
          <button type="button" onClick={takePhoto}>Chụp ảnh</button>
        </div>}
      </div>
      {ready&&!interactionPaused&&<div className="cing-plaza-scene__controls">
        <button type="button" className="cing-plaza-scene__joystick" disabled={!ready || Boolean(ownTable)}
          aria-label="Di chuyển: kéo theo hướng muốn đi; kéo qua vòng ngoài và thả để khóa hướng"
          data-locked={locked} data-armed={lockArmed}
          onPointerDown={event => {
            if (stickPointer.current !== null) return;
            event.preventDefault(); wrapper.current?.focus({ preventScroll: true });
            clearInput();
            stickPointer.current = event.pointerId; event.currentTarget.setPointerCapture(event.pointerId);
            stick.current = joystickVector(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect());
            setKnob(stick.current); syncInput();
          }}
          onPointerMove={event => {
            if (stickPointer.current !== event.pointerId) return;
            stick.current = joystickVector(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect());
            armedRef.current=joystickLockArmedV11(event.clientX,event.clientY,event.currentTarget.getBoundingClientRect());setLockArmed(armedRef.current);
            setKnob(stick.current); syncInput();
          }}
          onPointerUp={event => {
            if (stickPointer.current !== event.pointerId) return;
            stickPointer.current = null;
            const vector=armedRef.current&&lockedDirectionV11(stick.current);armedRef.current=false;setLockArmed(false);
            if(vector){lockedRef.current=true;setLocked(true);stick.current=vector;setKnob(vector);api.current?.lockMovement(vector);}else clearInput();
          }}
          onPointerCancel={() => clearInput()}
          onLostPointerCapture={() => {
            if(stickPointer.current!==null&&!lockedRef.current)clearInput();
          }}>
          <span className="cing-plaza-scene__stick-arrows" aria-hidden="true">{lockArmed||locked?<LockKeyhole size={20}/>:null}</span>
          {lockArmed&&<span className="plaza-v11-lock-hint">Thả để khóa hướng</span>}
          <span className="cing-plaza-scene__stick-knob" aria-hidden="true" style={{ transform: `translate(${knob.x * 38}px, ${-knob.z * 38}px)` }} />
        </button>
        {review && <div className="cing-plaza-scene__help"><strong>{motion === 'walk' ? 'Đang dạo bước' : motion === 'checkin' ? 'Tạo dáng một chút' : motion === 'wave' ? 'Chào Cing iu!' : 'Thư thả một chút'}</strong>
          <p>Kéo cần theo bất kỳ hướng nào, thả để dừng. Chạm mặt sân để đi tới đó; kéo cảnh để xoay góc nhìn.</p>
          <small>Trên máy tính: bấm vào cảnh, dùng WASD hoặc phím mũi tên.</small>
        </div>}
        {(review||locked)&&<button type="button" className="plaza-v11-hud-icon" aria-label="Dừng di chuyển" onClick={clearInput}><Square size={20}/></button>}
        <button className="plaza-v11-hud-icon" aria-label="Chụp ảnh" disabled={photoBusy} onClick={takePhoto}><Camera size={22}/></button>
        <button className="plaza-v11-hud-icon" aria-label="Kho ảnh chụp" onClick={onAlbum}><Images size={22}/></button>
        <button type="button" className="cing-plaza-scene__wave plaza-v11-hud-icon" aria-label="Vẫy tay" disabled={!ready || Boolean(ownTable) || motion === 'wave'}
          onClick={() => { clearInput(); api.current?.wave(); }}><Hand size={22}/></button>
        <button type="button" className="plaza-v11-hud-icon" aria-label="Tạo dáng" disabled={!ready || Boolean(ownTable) || motion === 'checkin'} onClick={() => { clearInput(); api.current?.pose(); }}><PersonStanding size={22}/></button>
      </div>}
      {photoNote&&<button className="plaza-v11-photo-toast" onClick={onAlbum} role="status">{photoNote}</button>}
      {ready && review && <p className="cing-plaza-scene__notice" role="status">{stats.timeOfDay || ''} · Giờ Việt Nam{notice ? ` — ${notice}` : ''}</p>}
      {!review && notice && <span className="cing-plaza-scene__sr-status" role="status">{notice}</span>}
      {review && <details className="cing-plaza-scene__diagnostics" open>
        <summary>Kiểm tra trên thiết bị này</summary>
        <p>FPS: {stats.fps ?? '…'} · Lượt vẽ: {stats.calls ?? '…'} · Trạng thái: {motion}</p>
        <p>Map: {stats.mapDrawsBefore ?? '…'} → {stats.mapDrawsAfter ?? '…'} nhóm vẽ · Tam giác đang vẽ: {stats.triangles?.toLocaleString('vi-VN') ?? '…'}</p>
        <p>Vị trí: {stats.x?.toFixed(2) ?? '…'}, {stats.z?.toFixed(2) ?? '…'} · Mặt sân: {stats.groundY?.toFixed(3) ?? '…'} m</p>
      </details>}
    </section>
  );
}
