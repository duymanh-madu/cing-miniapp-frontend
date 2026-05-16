import{a as c,j as n}from"./index-DHLNFilL.js";import{r as a}from"./router-Cg2xJ2ar.js";import"./realtime-BcxXcwBL.js";class o{async getMyVouchers(){try{const s=localStorage.getItem("miniapp_jwt");return(await c.get("https://cing-backend-production.up.railway.app/api/vouchers/my",{headers:{Authorization:`Bearer ${s}`}})).data}catch(s){return console.error("load vouchers failed",s),[]}}}const i=new o;function p(){const[t,s]=a.useState([]);return a.useEffect(()=>{async function e(){const r=await i.getMyVouchers();s(r)}e()},[]),n.jsxs("div",{className:`
        min-h-screen
        bg-black
        p-5
        text-white
      `,children:[n.jsx("div",{className:`
          mb-6
          text-4xl
          font-black
        `,children:"Voucher Wallet"}),n.jsx("div",{className:`
          grid
          gap-4
        `,children:t.map(e=>n.jsxs("div",{className:`
                  rounded-3xl
                  bg-zinc-900
                  p-5
                `,children:[n.jsx("div",{className:`
                    text-xl
                    font-bold
                  `,children:e.name}),n.jsx("div",{className:`
                    mt-2
                    text-sm
                    opacity-70
                  `,children:e.description})]},e.id))})]})}export{p as default};
