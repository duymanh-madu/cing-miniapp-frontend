import{a as c,c as l,j as s}from"./index-DHLNFilL.js";import{r as o}from"./router-Cg2xJ2ar.js";import{l as d}from"./realtime-BcxXcwBL.js";const r=c.create({baseURL:"https://cing-backend-production.up.railway.app/api",timeout:3e4});r.interceptors.request.use(t=>{const e=localStorage.getItem("access_token");return e&&(t.headers.Authorization=`Bearer ${e}`),t});class m{async getDashboardMetrics(){return(await r.get("/admin/analytics/dashboard")).data}async getRealtimeFeed(){return(await r.get("/admin/analytics/feed")).data}}const u=new m,n=l(t=>({metrics:{},realtimeFeed:[],initialized:!1,loading:!1,setMetrics:e=>{t({metrics:e,initialized:!0})},appendFeed:e=>{t(i=>({realtimeFeed:[e,...i.realtimeFeed].slice(0,100)}))},setLoading:e=>{t({loading:e})}}));class p{initialized=!1;async bootstrap(){if(this.initialized)return;const e=n.getState();try{e.setLoading(!0);const i=await u.getDashboardMetrics();e.setMetrics(i)}finally{e.setLoading(!1),this.initialized=!0}}}const h=new p;class g{socket=null;connect({token:e}){return this.socket?this.socket:(this.socket=d("https://cing-backend-production.up.railway.app",{transports:["websocket"],auth:{token:e}}),this.socket)}disconnect(){this.socket&&(this.socket.disconnect(),this.socket=null)}}const x=new g;class b{initialized=!1;initialize(){if(this.initialized)return;const e=x.connect({token:localStorage.getItem("admin_access_token")});e.on("admin:metrics:update",i=>{n.getState().setMetrics(i)}),e.on("admin:event",i=>{n.getState().appendFeed(i)}),this.initialized=!0}}const f=new b;function a({label:t,value:e}){return s.jsxs("div",{className:`
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-5
      `,children:[s.jsx("div",{className:`
          text-sm
          text-white/60
        `,children:t}),s.jsx("div",{className:`
          mt-3
          text-3xl
          font-black
        `,children:e})]})}function v(){const t=n(e=>e.realtimeFeed);return s.jsxs("div",{className:`
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-5
      `,children:[s.jsx("div",{className:`
          mb-4
          text-lg
          font-bold
        `,children:"Live Event Feed"}),s.jsx("div",{className:`
          space-y-3
        `,children:t.map((e,i)=>s.jsx("div",{className:`
                  rounded-2xl
                  bg-black/30
                  p-3
                  text-sm
                `,children:JSON.stringify(e)},i))})]})}function w(){const t=n(e=>e.metrics);return o.useEffect(()=>{h.bootstrap(),f.initialize()},[]),s.jsxs("div",{className:`
        space-y-6
      `,children:[s.jsxs("div",{className:`
          grid
          grid-cols-1
          gap-4
          md:grid-cols-2
          xl:grid-cols-4
        `,children:[s.jsx(a,{label:"Revenue",value:t.revenueToday}),s.jsx(a,{label:"Orders",value:t.ordersToday}),s.jsx(a,{label:"Realtime Users",value:t.activeUsers}),s.jsx(a,{label:"Campaigns",value:t.activeCampaigns})]}),s.jsx(v,{})]})}export{w as default};
