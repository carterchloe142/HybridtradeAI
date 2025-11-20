module.exports=[32827,(e,n,t)=>{n.exports=e.x("ioredis",()=>require("ioredis"))},57729,e=>{"use strict";var n=e.i(32827);let t=function(e=process.env.REDIS_URL||"redis://localhost:6379"){let t=e.startsWith("rediss://")?{tls:{rejectUnauthorized:!1}}:{},r=new n.default(e,t);return r.on("error",()=>{}),r.on("connect",()=>{}),r.on("ready",()=>{}),r.on("end",()=>{}),r}();function r(e){let n=e.duplicate();return n.on("error",()=>{}),n.on("connect",()=>{}),n.on("ready",()=>{}),n.on("end",()=>{}),n}let s=r(t),o=r(t);async function i(e,n){let t=JSON.stringify(n);await s.publish(e,t)}function c(e,n,t=o){t.subscribe(e);let r=(t,r)=>{if(t===e)try{n(JSON.parse(r))}catch{n(r)}};return t.on("message",r),()=>{t.off("message",r),t.unsubscribe(e)}}function u(e,n,t){let r="string"==typeof e?e:JSON.stringify(e),s=n?`id: ${n}
`:"",o=t?`event: ${t}
`:"";return new TextEncoder().encode(`${s}${o}data: ${r}

`)}e.s(["HEARTBEAT_MS",0,25e3,"encodeSSE",()=>u,"publish",()=>i,"subscribe",()=>c],57729)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__39ab9f14._.js.map