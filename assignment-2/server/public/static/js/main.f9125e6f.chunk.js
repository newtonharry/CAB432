(this.webpackJsonpclient=this.webpackJsonpclient||[]).push([[0],{57:function(e,t,a){e.exports=a(83)},83:function(e,t,a){"use strict";a.r(t);var n=a(0),r=a.n(n),o=a(8),c=a.n(o),i=a(10),l=a.n(i),s=a(15),u=a(13),m=a(34),p=a(46),d=a.n(p),f=a(137),h=a(135),b=a(136),E=a(129),g=a(132),v=a(126),j=a(134),w=a(131),y=a(133),O=Object(v.a)((function(e){return{main:{marginTop:e.spacing(8),display:"flex",flexDirection:"column",alignItems:"center"},form:{width:"100%",marginTop:e.spacing(1)},submit:{margin:e.spacing(3,0,2)},root:{width:"600"}}}));var S=function(){var e=O(),t=Object(m.b)({mode:"onSubmit",reValidateMode:"onChange",defaultValues:{}}),a=t.control,o=(t.register,t.handleSubmit),c=(t.reset,Object(n.useState)([])),i=Object(u.a)(c,2),p=i[0],v=i[1],S=Object(n.useState)({}),x=Object(u.a)(S,2),N=x[0],k=x[1],W=Object(n.useState)([]),C=Object(u.a)(W,2),T=C[0],V=C[1],q=function(){var e=Object(s.a)(l.a.mark((function e(t){return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:d()({method:"post",url:"http://localhost:4000/clarity",data:t,headers:{"Content-Type":"application/json"}}).then((function(e){console.log(e),v(e.data.analysis)})).catch((function(e){console.log(e),e.response&&k(e.response.data)}));case 1:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}();return Object(n.useEffect)((function(){V(p.filter((function(e){return e.related})).map((function(t){return r.a.createElement(E.a,{className:e.root},r.a.createElement(w.a,null,r.a.createElement(g.a,{variant:"h5",component:"h2"},t.title),r.a.createElement(g.a,{className:e.pos,color:"textSecondary"},t.author)),r.a.createElement(y.a,null,r.a.createElement(f.a,{size:"small",href:t.url},t.publication)))})))}),[p]),Object(n.useEffect)((function(){v([])}),[N]),r.a.createElement("div",{className:"App"},r.a.createElement(j.a,{component:"App",maxWidth:"xs"},r.a.createElement(h.a,null),r.a.createElement("div",{className:e.main},r.a.createElement(g.a,{component:"h1",variant:"h5"},"Clarity"),r.a.createElement("form",{onSubmit:o(q),className:e.form,noValidate:!0},r.a.createElement(m.a,{as:r.a.createElement(b.a,{variant:"outlined",margin:"normal",fullWidth:!0,label:"Enter a URL...",required:!0,autoFocus:!0}),required:!0,control:a,id:"input",name:"url"}),r.a.createElement(f.a,{type:"submit",fullWidth:!0,variant:"contained",color:"primary",className:e.submit},"Submit")),T)))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));c.a.render(r.a.createElement(r.a.StrictMode,null,r.a.createElement(S,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[57,1,2]]]);
//# sourceMappingURL=main.f9125e6f.chunk.js.map