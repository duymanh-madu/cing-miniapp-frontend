const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/AdminLoginPage-l4Khg_hQ.js","assets/index-DHLNFilL.js","assets/router-Cg2xJ2ar.js","assets/realtime-BcxXcwBL.js","assets/index-BkOR9bfR.css","assets/AdminDashboardPage-B3sVKp2x.js"])))=>i.map(i=>d[i]);
import{j as e,c as l,_ as o}from"./index-DHLNFilL.js";import{r as a,N as r,b as c,c as s}from"./router-Cg2xJ2ar.js";function d({children:t}){return e.jsx(a.Suspense,{fallback:e.jsx("div",{className:`
            flex
            min-h-screen
            items-center
            justify-center
            bg-zinc-950
            text-white
          `,children:"Admin Loading..."}),children:t})}const u=l(t=>({admin:null,accessToken:null,authenticated:!1,setAdminAuth:({admin:i,accessToken:n})=>{localStorage.setItem("admin_access_token",n),t({admin:i,accessToken:n,authenticated:!0})},logout:()=>{localStorage.removeItem("admin_access_token"),t({admin:null,accessToken:null,authenticated:!1})}}));function m({children:t}){return u(n=>n.authenticated)?t:e.jsx(r,{to:"/admin/login",replace:!0})}const h=a.lazy(()=>o(()=>import("./AdminLoginPage-l4Khg_hQ.js"),__vite__mapDeps([0,1,2,3,4]))),p=a.lazy(()=>o(()=>import("./AdminDashboardPage-B3sVKp2x.js"),__vite__mapDeps([5,1,2,3,4])));function _(){return e.jsx(d,{children:e.jsx(a.Suspense,{fallback:null,children:e.jsxs(c,{children:[e.jsx(s,{path:"/login",element:e.jsx(h,{})}),e.jsx(s,{path:"/dashboard",element:e.jsx(m,{children:e.jsx(p,{})})}),e.jsx(s,{path:"*",element:e.jsx(r,{to:"/admin/dashboard",replace:!0})})]})})})}const A=Object.freeze(Object.defineProperty({__proto__:null,default:_},Symbol.toStringTag,{value:"Module"}));export{A,u};
