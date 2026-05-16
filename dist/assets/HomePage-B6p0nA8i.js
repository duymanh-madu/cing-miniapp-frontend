import{c as l,a as o,j as n,r as c}from"./index-DHLNFilL.js";import{r}from"./router-Cg2xJ2ar.js";import{l as d}from"./realtime-BcxXcwBL.js";const i=l(t=>({profile:null,points:0,tier:null,vouchers:[],wallet:null,spending:0,rank:null,setProfile:e=>t({profile:e}),setPoints:e=>t({points:e}),setTier:e=>t({tier:e}),setVouchers:e=>t({vouchers:e}),setWallet:e=>t({wallet:e}),setSpending:e=>t({spending:e}),setRank:e=>t({rank:e})})),m="https://cing-backend-production.up.railway.app/api";class u{async getMyProfile(){try{const e=localStorage.getItem("miniapp_jwt");return(await o.get(`${m}/customer/me`,{headers:{Authorization:`Bearer ${e}`}})).data}catch(e){return console.error("get profile failed",e),null}}}const p=new u;class x{initialized=!1;async initialize(){if(!this.initialized)try{const e=await p.getMyProfile();e&&i.getState().setProfile(e),this.initialized=!0}catch(e){console.error("customer identity initialize failed",e)}}}const g=new x;class h{socket=null;initialize(){this.socket||(this.socket=d("https://cing-backend-production.up.railway.app",{transports:["websocket"]}),this.registerEvents())}registerEvents(){this.socket.on("customer:points",e=>{i.getState().setPoints(e.points)}),this.socket.on("customer:tier",e=>{i.getState().setTier(e.tier)}),this.socket.on("customer:vouchers",e=>{i.getState().setVouchers(e.vouchers)})}}const f=new h;class v{STORAGE_KEY="customer_hydration";hydrate(){try{const e=localStorage.getItem(this.STORAGE_KEY);if(!e)return;const s=JSON.parse(e);i.setState(s)}catch(e){console.error("customer hydration failed",e)}}persist(){const e=i.getState();localStorage.setItem(this.STORAGE_KEY,JSON.stringify({profile:e.profile,points:e.points,tier:e.tier,vouchers:e.vouchers,spending:e.spending,rank:e.rank}))}}const b=new v;function j(){return r.useEffect(()=>{b.hydrate(),g.initialize(),f.initialize()},[]),null}function y(){const t=i(e=>e.tier);return n.jsx("div",{className:`
        inline-flex
        items-center
        rounded-full
        bg-yellow-500
        px-4
        py-2
        text-xs
        font-bold
        text-black
      `,children:t||"Member"})}class N{getHomepageBanner(){return c.get("homepage_banner",null)}}const w=new N;function k(){const t=w.getHomepageBanner();return t?n.jsxs("div",{className:`
        rounded-3xl
        bg-gradient-to-r
        from-pink-500
        to-orange-500
        p-6
        text-white
      `,children:[n.jsx("div",{className:`
          text-2xl
          font-black
        `,children:t.title}),n.jsx("div",{className:`
          mt-2
          text-sm
          opacity-80
        `,children:t.description})]}):null}function R({sections:t=[]}){return n.jsx("div",{className:`
        grid
        gap-5
      `,children:t.map(e=>n.jsx("div",{children:e.type==="hero"&&n.jsxs("div",{className:`
                      rounded-3xl
                      bg-zinc-900
                      p-6
                      text-white
                    `,children:[n.jsx("div",{className:`
                        text-3xl
                        font-black
                      `,children:e.title}),n.jsx("div",{className:`
                        mt-2
                        text-sm
                        opacity-70
                      `,children:e.description})]})},e.id))})}function S(){const t=i(e=>e.profile);return n.jsxs("div",{className:`
        flex
        items-center
        gap-4
        rounded-3xl
        bg-zinc-900
        p-5
        text-white
      `,children:[n.jsx("div",{className:`
          h-16
          w-16
          overflow-hidden
          rounded-full
          bg-zinc-800
        `,children:t?.avatar&&n.jsx("img",{src:t.avatar,alt:"avatar",className:`
                h-full
                w-full
                object-cover
              `})}),n.jsxs("div",{children:[n.jsx("div",{className:`
            text-xl
            font-bold
          `,children:t?.name||"Customer"}),n.jsx("div",{className:`
            mt-1
            text-xs
            opacity-60
          `,children:"Real-time loyalty member"})]})]})}function C(){const t=i(s=>s.points),e=i(s=>s.tier);return n.jsxs("div",{className:`
        rounded-3xl
        bg-zinc-900
        p-5
        text-white
      `,children:[n.jsx("div",{className:`
          mb-2
          text-sm
          opacity-70
        `,children:"Loyalty Wallet"}),n.jsx("div",{className:`
          text-3xl
          font-black
        `,children:t}),n.jsxs("div",{className:`
          mt-2
          text-xs
          opacity-60
        `,children:["Tier:"," ",e||"Member"]})]})}function P(){const t=i(e=>e.rank);return n.jsxs("div",{className:`
        rounded-3xl
        bg-gradient-to-br
        from-yellow-500
        to-orange-600
        p-5
        text-white
      `,children:[n.jsx("div",{className:`
          mb-2
          text-sm
          opacity-80
        `,children:"Your Rank"}),n.jsxs("div",{className:`
          text-4xl
          font-black
        `,children:["#",t||"--"]})]})}function z(){const t=i(e=>e.points);return n.jsxs("div",{className:`
        rounded-3xl
        bg-gradient-to-br
        from-green-500
        to-emerald-700
        p-5
        text-white
      `,children:[n.jsx("div",{className:`
          mb-2
          text-sm
          opacity-80
        `,children:"Live Points"}),n.jsx("div",{className:`
          text-4xl
          font-black
        `,children:t})]})}function E(){const t=i(e=>e.spending);return n.jsxs("div",{className:`
        rounded-3xl
        bg-zinc-900
        p-5
        text-white
      `,children:[n.jsx("div",{className:`
          mb-2
          text-sm
          opacity-70
        `,children:"Total Spending"}),n.jsxs("div",{className:`
          text-3xl
          font-black
        `,children:[t.toLocaleString(),"đ"]})]})}function H(){const t=i(e=>e.vouchers);return n.jsxs("div",{className:`
        rounded-3xl
        bg-zinc-900
        p-5
        text-white
      `,children:[n.jsx("div",{className:`
          mb-4
          text-lg
          font-bold
        `,children:"Voucher Wallet"}),n.jsx("div",{className:`
          grid
          gap-3
        `,children:t.map(e=>n.jsx("div",{className:`
                  rounded-2xl
                  bg-zinc-800
                  p-4
                `,children:e.name},e.id))})]})}function A(){const[t,e]=r.useState([]);return r.useEffect(()=>{async function s(){try{const a=await o.get("https://cing-backend-production.up.railway.app/api/leaderboard/top-spending");e(a.data||[])}catch(a){console.error("load leaderboard failed",a)}}s()},[]),n.jsxs("div",{className:`
        rounded-3xl
        bg-zinc-900
        p-5
        text-white
      `,children:[n.jsx("div",{className:`
          mb-5
          text-xl
          font-black
        `,children:"Top Spending"}),n.jsx("div",{className:`
          grid
          gap-3
        `,children:t.map((s,a)=>n.jsxs("div",{className:`
                  flex
                  items-center
                  justify-between
                  rounded-2xl
                  bg-zinc-800
                  p-4
                `,children:[n.jsxs("div",{className:`
                    flex
                    items-center
                    gap-4
                  `,children:[n.jsxs("div",{className:`
                      text-lg
                      font-black
                      text-yellow-400
                    `,children:["#",a+1]}),n.jsx("div",{children:s.name})]}),n.jsxs("div",{className:`
                    text-sm
                    opacity-70
                  `,children:[s.spending?.toLocaleString?.(),"đ"]})]},s.id))})]})}const T={profile:S,wallet:C,rank:P,points:z,spending:E,vouchers:H,leaderboard:A};function _({sections:t=[]}){return n.jsx("div",{className:`
        grid
        gap-5
      `,children:t.map(e=>{const s=T[e.component];return s?n.jsx(s,{},e.id):null})})}const B="https://cing-backend-production.up.railway.app/api";class L{async fetchPage(e){try{return(await o.get(`${B}/cms/pages/${e}`)).data}catch(s){return console.error("fetch page failed",s),null}}}const I=new L;class ${pages=new Map;async loadPage(e){try{if(this.pages.has(e))return this.pages.get(e);const s=await I.fetchPage(e);return this.pages.set(e,s),s}catch(s){return console.error("load page failed",s),null}}}const M=new $;class O{async loadHomepage(){return M.loadPage("homepage")}}const D=new O;function V(){const[t,e]=r.useState(null);return r.useEffect(()=>{async function s(){const a=await D.loadHomepage();e(a)}s()},[]),t}class W{getSections(){return c.get("homepage_layout",[])}}const Y=new W;function U(){const t=V(),e=Y.getSections();return r.useEffect(()=>{c.initialize()},[]),n.jsxs("div",{className:`
        min-h-screen
        bg-black
        p-5
        text-white
      `,children:[n.jsx(j,{}),n.jsxs("div",{className:`
          mb-6
          flex
          items-center
          justify-between
        `,children:[n.jsx("div",{className:`
            text-4xl
            font-black
          `,children:"Cing Hu Tang"}),n.jsx(y,{})]}),n.jsx("div",{className:`
          mb-5
        `,children:n.jsx(k,{})}),n.jsx("div",{className:`
          mb-5
        `,children:n.jsx(_,{sections:e})}),n.jsx("div",{className:`
          mb-5
        `,children:n.jsx(R,{sections:t?.sections||[]})})]})}export{U as default};
