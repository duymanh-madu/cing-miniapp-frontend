import{c as x,a as u,j as t}from"./index-DHLNFilL.js";import{r as l}from"./router-Cg2xJ2ar.js";import{l as f}from"./realtime-BcxXcwBL.js";const a=x(n=>({gameRunning:!1,score:0,bestScore:0,combo:0,tick:0,leaderboard:[],obstacles:[],setGameRunning:e=>n({gameRunning:e}),setScore:e=>n({score:e}),setBestScore:e=>n({bestScore:e}),setCombo:e=>n({combo:e}),setLeaderboard:e=>n({leaderboard:e}),setObstacles:e=>n({obstacles:e}),increaseTick:()=>n(e=>({tick:e.tick+1}))}));class v{gravity=.45;jumpForce=-8;velocity=0;playerY=200;jump(){this.velocity=this.jumpForce}update(){this.velocity+=this.gravity,this.playerY+=this.velocity,a.getState().setScore(Math.floor(a.getState().tick/10))}}const o=new v;class w{initialize(){window.addEventListener("click",()=>{o.jump()}),window.addEventListener("touchstart",()=>{o.jump()})}}const j=new w;class y{obstacles=[];speed=3;initialize(){this.obstacles=[]}generate(){this.obstacles.push({id:crypto.randomUUID(),x:window.innerWidth,gapY:Math.floor(Math.random()*220)+80,width:70,gapHeight:170})}update(){this.obstacles=this.obstacles.map(e=>({...e,x:e.x-this.speed})),this.obstacles=this.obstacles.filter(e=>e.x>-100),a.getState().setObstacles(this.obstacles)}}const c=new y;class k{check(){const e=o.playerY,s=a.getState().obstacles;for(const i of s){const b=i.x<100&&i.x>20,h=e<i.gapY,g=e>i.gapY+i.gapHeight;if(b&&(h||g))return!0}return!1}}const R=new k;class S{async submitScore(e){try{const s=localStorage.getItem("miniapp_jwt");await u.post("https://cing-backend-production.up.railway.app/api/game/submit-score",{score:e},{headers:{Authorization:`Bearer ${s}`}})}catch(s){console.error("submit score failed",s)}}}const N=new S;class G{combo=0;increase(){this.combo++,a.getState().setCombo(this.combo)}reset(){this.combo=0,a.getState().setCombo(0)}}const m=new G;class z{sounds=new Map;preload(){const e=new Audio("/audio/jump.mp3"),s=new Audio("/audio/hit.mp3"),i=new Audio("/audio/score.mp3");this.sounds.set("jump",e),this.sounds.set("hit",s),this.sounds.set("score",i)}play(e){const s=this.sounds.get(e);s&&(s.currentTime=0,s.play())}}const r=new z;class C{tap(){navigator.vibrate&&navigator.vibrate(10)}collision(){navigator.vibrate&&navigator.vibrate([50,30,50])}}const L=new C;class Y{offset=0;update(){this.offset-=1}}const p=new Y;class B{interval=null;frame=0;start(){this.stop(),c.initialize(),this.interval=setInterval(()=>{this.frame++,o.update(),c.update(),p.update(),this.frame%90===0&&(c.generate(),m.increase(),r.play("score")),R.check()&&this.gameOver()},16)}async gameOver(){this.stop(),m.reset(),r.play("hit"),L.collision();const e=a.getState();e.score>e.bestScore&&e.setBestScore(e.score),await N.submitScore(e.score)}stop(){clearInterval(this.interval)}}const d=new B;function E(){const n=a(e=>e.obstacles);return t.jsx(t.Fragment,{children:n.map(e=>t.jsxs("div",{children:[t.jsx("div",{className:`
                  absolute
                  w-[70px]
                  bg-green-500
                `,style:{left:e.x,top:0,height:e.gapY}}),t.jsx("div",{className:`
                  absolute
                  w-[70px]
                  bg-green-500
                `,style:{left:e.x,top:e.gapY+e.gapHeight,bottom:0}})]},e.id))})}function I(){const n=a(s=>s.score),e=a(s=>s.bestScore);return t.jsxs("div",{className:`
        absolute
        left-5
        right-5
        top-5
        z-30
        flex
        items-center
        justify-between
        text-white
      `,children:[t.jsx("div",{className:`
          text-3xl
          font-black
        `,children:n}),t.jsxs("div",{className:`
          rounded-full
          bg-white/10
          px-4
          py-2
          text-xs
          font-bold
        `,children:["BEST:"," ",e]})]})}function O(){return t.jsx("div",{className:`
        absolute
        inset-0
        opacity-20
      `,style:{backgroundImage:"url('/images/game-bg.png')",backgroundRepeat:"repeat-x",backgroundPositionX:`${p.offset}px`}})}function T(){const n=a(e=>e.combo);return n<=1?null:t.jsxs("div",{className:`
        absolute
        right-5
        top-24
        z-30
        rounded-full
        bg-pink-500
        px-4
        py-2
        text-sm
        font-black
        text-white
        shadow-2xl
      `,children:["x",n,"Combo"]})}function A(){return l.useEffect(()=>(r.preload(),j.initialize(),d.start(),()=>{d.stop()}),[]),t.jsxs("div",{className:`
        relative
        h-[600px]
        overflow-hidden
        rounded-3xl
        bg-gradient-to-b
        from-sky-400
        to-sky-700
      `,children:[t.jsx(O,{}),t.jsx(I,{}),t.jsx(T,{}),t.jsx(E,{}),t.jsx("div",{className:`
          absolute
          left-16
          z-20
          h-14
          w-14
          rounded-full
          bg-yellow-400
          shadow-2xl
        `,style:{top:o.playerY}})]})}class H{async loadTop100(){try{const e=await u.get("https://cing-backend-production.up.railway.app/api/game/leaderboard");a.getState().setLeaderboard(e.data||[])}catch(e){console.error("load game leaderboard failed",e)}}}const M=new H;function P(){const n=a(e=>e.leaderboard);return l.useEffect(()=>{M.loadTop100()},[]),t.jsxs("div",{className:`
        rounded-3xl
        bg-zinc-900
        p-5
        text-white
      `,children:[t.jsx("div",{className:`
          mb-5
          text-2xl
          font-black
        `,children:"Top 100 Players"}),t.jsx("div",{className:`
          grid
          gap-3
        `,children:n.map((e,s)=>t.jsxs("div",{className:`
                  flex
                  items-center
                  justify-between
                  rounded-2xl
                  bg-zinc-800
                  p-4
                `,children:[t.jsxs("div",{className:`
                    flex
                    items-center
                    gap-4
                  `,children:[t.jsxs("div",{className:`
                      text-lg
                      font-black
                      text-yellow-400
                    `,children:["#",s+1]}),t.jsx("div",{children:e.name})]}),t.jsx("div",{className:`
                    text-sm
                    opacity-70
                  `,children:e.score})]},e.id))})]})}function $(){const n=a(e=>e.bestScore);return t.jsxs("div",{className:`
        rounded-3xl
        bg-zinc-900
        p-5
        text-white
      `,children:[t.jsx("div",{className:`
          mb-2
          text-sm
          opacity-70
        `,children:"Your Best Score"}),t.jsx("div",{className:`
          text-4xl
          font-black
        `,children:n})]})}class F{socket=null;initialize(){this.socket||(this.socket=f("https://cing-backend-production.up.railway.app",{transports:["websocket"]}),this.socket.on("game:leaderboard",e=>{a.getState().setLeaderboard(e)}))}}const U=new F;function _(){return l.useEffect(()=>{U.initialize()},[]),t.jsxs("div",{className:`
        min-h-screen
        bg-black
        p-5
        text-white
      `,children:[t.jsx("div",{className:`
          mb-6
          text-4xl
          font-black
        `,children:"Cing Bird"}),t.jsx("div",{className:`
          mb-5
        `,children:t.jsx($,{})}),t.jsx("div",{className:`
          mb-6
        `,children:t.jsx(A,{})}),t.jsx(P,{})]})}export{_ as default};
