import{j as e}from"./index-DHLNFilL.js";import{u as d,r as s}from"./router-Cg2xJ2ar.js";import{u}from"./AdminApp-B4XLk6-B.js";import"./realtime-BcxXcwBL.js";function f(){const a=d(),o=u(n=>n.setAdminAuth),[t,r]=s.useState(""),[i,l]=s.useState("");async function m(n){n.preventDefault(),o({admin:{username:t},accessToken:"temporary-admin-token"}),a("/admin/dashboard")}return e.jsx("div",{className:`
        flex
        min-h-screen
        items-center
        justify-center
        bg-black
        text-white
      `,children:e.jsxs("form",{onSubmit:m,className:`
          w-full
          max-w-md
          rounded-3xl
          bg-zinc-900
          p-8
        `,children:[e.jsx("div",{className:`
            mb-6
            text-3xl
            font-black
          `,children:"Admin Login"}),e.jsx("input",{value:t,onChange:n=>r(n.target.value),placeholder:"Username",className:`
            mb-4
            w-full
            rounded-xl
            bg-zinc-800
            p-4
          `}),e.jsx("input",{type:"password",value:i,onChange:n=>l(n.target.value),placeholder:"Password",className:`
            mb-6
            w-full
            rounded-xl
            bg-zinc-800
            p-4
          `}),e.jsx("button",{type:"submit",className:`
            w-full
            rounded-xl
            bg-white
            p-4
            font-bold
            text-black
          `,children:"Login"})]})})}export{f as default};
