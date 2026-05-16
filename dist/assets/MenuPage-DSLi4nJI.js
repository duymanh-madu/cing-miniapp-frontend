import{a as c,j as n}from"./index-DHLNFilL.js";import{r as t}from"./router-Cg2xJ2ar.js";import"./realtime-BcxXcwBL.js";class i{async getMenu(){try{return(await c.get("https://cing-backend-production.up.railway.app/api/menu")).data}catch(s){return console.error("load menu failed",s),[]}}}const o=new i;function m(){const[a,s]=t.useState([]);return t.useEffect(()=>{async function e(){const r=await o.getMenu();s(r)}e()},[]),n.jsxs("div",{className:`
        min-h-screen
        bg-black
        p-5
        text-white
      `,children:[n.jsx("div",{className:`
          mb-6
          text-4xl
          font-black
        `,children:"Menu"}),n.jsx("div",{className:`
          grid
          gap-4
        `,children:a.map(e=>n.jsxs("div",{className:`
                  rounded-3xl
                  bg-zinc-900
                  p-5
                `,children:[n.jsx("div",{className:`
                    text-xl
                    font-bold
                  `,children:e.name}),n.jsxs("div",{className:`
                    mt-2
                    text-sm
                    opacity-70
                  `,children:[e.price?.toLocaleString?.(),"đ"]})]},e.id))})]})}export{m as default};
