/* CalcSphere Pro — client-side calculation engine */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const app=$("#app"), toast=$("#toast");
let installPrompt=null;
let historyData=JSON.parse(localStorage.getItem("calcsphere_history")||"[]");
let settings=JSON.parse(localStorage.getItem("calcsphere_settings")||'{"theme":"light"}');
document.documentElement.dataset.theme=settings.theme;
function save(){localStorage.setItem("calcsphere_history",JSON.stringify(historyData))}
function notify(m){toast.textContent=m;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),1800)}
function record(category,expression,result){historyData.unshift({category,expression,result,time:new Date().toLocaleString()});historyData=historyData.slice(0,200);save()}
function val(id){return Number($(id).value)}
function fmt(n){if(!Number.isFinite(n))return "Undefined";return Number(n.toPrecision(12)).toLocaleString(undefined,{maximumFractionDigits:10})}
function safeEval(expr){
  let e=expr.replace(/π/g,"Math.PI").replace(/√/g,"Math.sqrt").replace(/\^/g,"**");
  e=e.replace(/sin\(/g,"Math.sin(").replace(/cos\(/g,"Math.cos(").replace(/tan\(/g,"Math.tan(").replace(/log\(/g,"Math.log10(").replace(/ln\(/g,"Math.log(");
  if(!/^[0-9+\-*/%().,\sA-Za-z_]+$/.test(e)||/constructor|prototype|window|document|Function/.test(e))throw Error("Invalid expression");
  return Function("return ("+e+")")();
}
function shell(title,sub,body){return `<div class="page-head"><div><h1>${title}</h1><div class="muted">${sub}</div></div></div>${body}`}
const pages={};

pages.dashboard=()=>shell("Calculator Dashboard","A professional toolkit for science, mathematics and everyday calculations.",`
<div class="hero"><h1>Calculate with confidence.</h1><p>One organized workspace for scientific calculations, advanced mathematics, physics, chemistry, conversions, statistics, finance and visual graphs.</p></div>
<div class="grid grid-4 cards">
${[['Scientific','Evaluate expressions with trigonometry, logs and powers.','scientific'],['Mathematics','Algebra, geometry, calculus and number theory.','mathematics'],['Physics','Motion, forces, energy, electricity and waves.','physics'],['Chemistry','Moles, solutions, gases and formula explanations.','chemistry']].map(x=>`<button class="card chip" data-go="${x[2]}"><strong>${x[0]}</strong><span class="muted">${x[1]}</span></button>`).join("")}
</div>
<div class="grid grid-3 cards">
<div class="card"><span class="tag">Calculations</span><div class="metric">${historyData.length}</div><div class="muted">Saved history entries</div></div>
<div class="card"><span class="tag">Tools</span><div class="metric">12+</div><div class="muted">Dedicated calculator areas</div></div>
<div class="card"><span class="tag">Storage</span><div class="metric">Local</div><div class="muted">History stays in this browser</div></div>
</div>`);

pages.scientific=()=>shell("Scientific Calculator","Evaluate standard and scientific expressions.",`
<div class="grid grid-2"><div class="card calc"><div class="display"><div id="sciExpr" class="expression"></div><div id="sciAns" class="answer">0</div></div><div class="keys" id="sciKeys">
${["7","8","9","/","4","5","6","*","1","2","3","-","0",".","π","+","sin(","cos(","tan(","√(","log(","ln(","^","(",")","%","C","⌫","="].map(k=>`<button class="key ${["/","*","-","+","^","%"].includes(k)?"op":k==="="?"equal":""}" data-key="${k}">${k}</button>`).join("")}</div></div>
<div class="card"><h3>Expression tips</h3><p class="muted">Use <b>π</b>, powers with <b>^</b>, square root with <b>√(</b>, and common trigonometric functions. Trigonometric functions use radians.</p><div class="formula">sin(x), cos(x), tan(x), log(x), ln(x), √(x)</div><div class="info">Results are saved to History after you press =.</div></div></div>`);

pages.mathematics=()=>shell("Mathematics","From school-level formulas to university-style numerical tools.",`
<div class="grid grid-2">
<div class="card"><h3>Quadratic equation</h3><p class="muted">Solve ax² + bx + c = 0.</p><div class="form-grid"><div class="field"><label>a</label><input id="qa" type="number" value="1"></div><div class="field"><label>b</label><input id="qb" type="number" value="-5"></div><div class="field"><label>c</label><input id="qc" type="number" value="6"></div></div><button class="btn" id="quadBtn">Solve</button><div id="quadOut" class="result">Enter coefficients.</div></div>
<div class="card"><h3>Derivative (polynomial)</h3><p class="muted">Enter coefficients highest power first. Example: 3, 0, -2, 5 means 3x³ − 2x + 5.</p><div class="field"><label>Coefficients</label><input id="poly" value="3,0,-2,5"></div><button class="btn" id="derivBtn">Differentiate</button><div id="derivOut" class="result">Ready.</div></div>
<div class="card"><h3>Triangle solver</h3><div class="form-grid"><div class="field"><label>Base</label><input id="tb" type="number" value="10"></div><div class="field"><label>Height</label><input id="th" type="number" value="6"></div></div><button class="btn" id="triBtn">Calculate area</button><div id="triOut" class="result">Area = —</div></div>
<div class="card"><h3>Circle</h3><div class="field"><label>Radius</label><input id="cr" type="number" value="5"></div><button class="btn" id="circleBtn">Calculate</button><div id="circleOut" class="result">Area = —<br>Circumference = —</div></div>
</div>`);

pages.physics=()=>shell("Physics Lab","Formula-driven physics calculators with units and explanations.",`
<div class="grid grid-2">
<div class="card"><h3>Speed / distance / time</h3><div class="form-grid"><div class="field"><label>Distance (m)</label><input id="pd" type="number" value="100"></div><div class="field"><label>Time (s)</label><input id="pt" type="number" value="10"></div></div><button class="btn" id="speedBtn">Calculate speed</button><div id="speedOut" class="result">v = — m/s</div><div class="formula">v = d / t</div></div>
<div class="card"><h3>Newton's second law</h3><div class="form-grid"><div class="field"><label>Mass (kg)</label><input id="pm" type="number" value="5"></div><div class="field"><label>Acceleration (m/s²)</label><input id="pa" type="number" value="2"></div></div><button class="btn" id="forceBtn">Calculate force</button><div id="forceOut" class="result">F = — N</div><div class="formula">F = ma</div></div>
<div class="card"><h3>Kinetic energy</h3><div class="form-grid"><div class="field"><label>Mass (kg)</label><input id="kem" type="number" value="2"></div><div class="field"><label>Speed (m/s)</label><input id="kev" type="number" value="10"></div></div><button class="btn" id="keBtn">Calculate</button><div id="keOut" class="result">KE = — J</div><div class="formula">KE = ½mv²</div></div>
<div class="card"><h3>Ohm's law</h3><div class="form-grid"><div class="field"><label>Voltage (V)</label><input id="ov" type="number" value="12"></div><div class="field"><label>Resistance (Ω)</label><input id="or" type="number" value="4"></div></div><button class="btn" id="ohmBtn">Calculate current</button><div id="ohmOut" class="result">I = — A</div><div class="formula">V = IR</div></div>
<div class="card"><h3>Wave equation</h3><div class="form-grid"><div class="field"><label>Frequency (Hz)</label><input id="wf" type="number" value="50"></div><div class="field"><label>Wavelength (m)</label><input id="wl" type="number" value="2"></div></div><button class="btn" id="waveBtn">Calculate</button><div id="waveOut" class="result">v = — m/s</div><div class="formula">v = fλ</div></div>
<div class="card"><h3>Gravitational potential energy</h3><div class="form-grid"><div class="field"><label>Mass (kg)</label><input id="gpm" type="number" value="2"></div><div class="field"><label>Height (m)</label><input id="gph" type="number" value="10"></div><div class="field"><label>g (m/s²)</label><input id="gpg" type="number" value="9.81"></div></div><button class="btn" id="gpeBtn">Calculate</button><div id="gpeOut" class="result">GPE = — J</div></div>
</div>`);

const chemInfo={
"moles-mass":{title:"Moles from mass",formula:"n = m / M",explain:"The amount of substance n in moles equals sample mass m divided by molar mass M. Keep mass and molar-mass units compatible.",calc:(m,M)=>m/M},
"molarity":{title:"Molarity",formula:"C = n / V",explain:"Molarity is the number of moles of solute per litre of solution. Convert volume to litres before using the formula.",calc:(n,V)=>n/V},
"density":{title:"Density",formula:"ρ = m / V",explain:"Density measures mass per unit volume. It is useful for comparing substances and converting between mass and volume when the density is known.",calc:(m,V)=>m/V},
"ideal-gas":{title:"Ideal gas law",formula:"PV = nRT",explain:"For an ideal gas, pressure, volume, amount and absolute temperature are related. Use Kelvin for temperature and match pressure/volume units with the gas constant.",calc:(P,V,n,T,R)=>P*V-n*R*T}
};
pages.chemistry=()=>shell("Chemistry Lab","Formula cards include plain-language explanations.",`
<div class="grid grid-2">
<div class="card"><h3>${chemInfo["moles-mass"].title}</h3><div class="formula">${chemInfo["moles-mass"].formula}</div><p class="muted">${chemInfo["moles-mass"].explain}</p><div class="form-grid"><div class="field"><label>Mass (g)</label><input id="cm" type="number" value="18"></div><div class="field"><label>Molar mass (g/mol)</label><input id="cM" type="number" value="18"></div></div><button class="btn" id="molesBtn">Calculate</button><div id="molesOut" class="result">n = — mol</div></div>
<div class="card"><h3>${chemInfo.molarity.title}</h3><div class="formula">${chemInfo.molarity.formula}</div><p class="muted">${chemInfo.molarity.explain}</p><div class="form-grid"><div class="field"><label>Moles</label><input id="cn" type="number" value="0.5"></div><div class="field"><label>Volume (L)</label><input id="cv" type="number" value="2"></div></div><button class="btn" id="molarBtn">Calculate</button><div id="molarOut" class="result">C = — mol/L</div></div>
<div class="card"><h3>${chemInfo.density.title}</h3><div class="formula">${chemInfo.density.formula}</div><p class="muted">${chemInfo.density.explain}</p><div class="form-grid"><div class="field"><label>Mass</label><input id="dm" type="number" value="100"></div><div class="field"><label>Volume</label><input id="dv" type="number" value="20"></div></div><button class="btn" id="densityBtn">Calculate</button><div id="densityOut" class="result">ρ = —</div></div>
<div class="card"><h3>${chemInfo["ideal-gas"].title}</h3><div class="formula">${chemInfo["ideal-gas"].formula}</div><p class="muted">${chemInfo["ideal-gas"].explain}</p><div class="form-grid"><div class="field"><label>P (kPa)</label><input id="igp" type="number" value="101.325"></div><div class="field"><label>V (L)</label><input id="igv" type="number" value="24.465"></div><div class="field"><label>n (mol)</label><input id="ign" type="number" value="1"></div><div class="field"><label>T (K)</label><input id="igt" type="number" value="298.15"></div></div><button class="btn" id="gasBtn">Check PV = nRT</button><div id="gasOut" class="result">Ready.</div></div>
</div>`);

const units={length:{m:1,km:1000,cm:.01,mm:.001,mi:1609.344,yd:.9144,ft:.3048,in:.0254},mass:{g:.001,kg:1,mg:1e-6,lb:.45359237,oz:.0283495231},time:{s:1,min:60,h:3600,day:86400},temperature:null,volume:{L:.001,mL:1e-6,m3:1,cm3:1e-6}};
pages.conversions=()=>shell("Unit Conversions","Convert common scientific and everyday units.",`
<div class="card"><div class="form-grid"><div class="field"><label>Category</label><select id="ucat"><option value="length">Length</option><option value="mass">Mass</option><option value="time">Time</option><option value="volume">Volume</option><option value="temperature">Temperature</option></select></div><div class="field"><label>Value</label><input id="uval" type="number" value="1"></div><div class="field"><label>From</label><select id="ufrom"></select></div><div class="field"><label>To</label><select id="uto"></select></div></div><button class="btn" id="convertBtn">Convert</button><div id="convertOut" class="result">Result = —</div></div>`);

pages.graphs=()=>shell("Graphs & Charts","Plot a function y = f(x) using the same expression syntax as the scientific calculator.",`
<div class="card"><div class="form-grid"><div class="field"><label>Function of x</label><input id="gx" value="sin(x)"></div><div class="field"><label>Minimum x</label><input id="gmin" type="number" value="-10"></div><div class="field"><label>Maximum x</label><input id="gmax" type="number" value="10"></div></div><div class="actions"><button class="btn" id="plotBtn">Plot graph</button><button class="btn secondary" id="clearGraph">Clear</button></div><canvas id="graphCanvas" width="1000" height="420"></canvas><p class="muted small">Supported examples: x^2, sin(x), cos(x), tan(x), log(x), √(x). The plot is rendered locally without external chart libraries.</p></div>`);

pages.statistics=()=>shell("Statistics","Descriptive statistics for a numeric dataset.",`
<div class="grid grid-2"><div class="card"><h3>Dataset</h3><div class="field"><label>Comma-separated numbers</label><textarea id="statsData" rows="6">12,15,18,18,20,22,25</textarea></div><button class="btn" id="statsBtn">Analyze</button></div><div class="card"><h3>Results</h3><div id="statsOut" class="result">Enter data and analyze.</div></div></div>`);

pages.finance=()=>shell("Finance","General-purpose mathematical finance formulas. Not financial advice.",`
<div class="grid grid-2"><div class="card"><h3>Simple interest</h3><div class="form-grid"><div class="field"><label>Principal</label><input id="sip" type="number" value="100000"></div><div class="field"><label>Annual rate (%)</label><input id="sir" type="number" value="5"></div><div class="field"><label>Time (years)</label><input id="sit" type="number" value="2"></div></div><button class="btn" id="siBtn">Calculate</button><div id="siOut" class="result">Ready.</div><div class="formula">I = Prt; A = P + I</div></div>
<div class="card"><h3>Compound interest</h3><div class="form-grid"><div class="field"><label>Principal</label><input id="cip" type="number" value="100000"></div><div class="field"><label>Annual rate (%)</label><input id="cir" type="number" value="8"></div><div class="field"><label>Years</label><input id="cit" type="number" value="5"></div><div class="field"><label>Compounds/year</label><input id="cin" type="number" value="12"></div></div><button class="btn" id="ciBtn">Calculate</button><div id="ciOut" class="result">Ready.</div><div class="formula">A = P(1 + r/n)^(nt)</div></div></div>`);

pages.history=()=>shell("Calculation History","Your latest calculations are stored in browser local storage.",`
<div class="card"><div class="actions"><button class="btn danger" id="pageClear">Clear all</button><button class="btn secondary" id="exportHistory">Export JSON</button></div><div id="historyList" style="margin-top:12px"></div></div>`);

pages.ai=()=>shell("AI Assistant","A local educational assistant. Connect your own AI API endpoint to make it internet-powered.",`
<div class="grid grid-2"><div class="card"><h3>Ask a question</h3><div class="field"><label>Your question</label><textarea id="aiQuestion" rows="7" placeholder="Example: Explain why the ideal gas law uses Kelvin."></textarea></div><div class="actions"><button class="btn" id="askAi">Answer</button></div><p class="muted small">This demo intentionally runs locally. For a real AI service, use a secure server-side API rather than placing a secret API key in browser JavaScript.</p></div><div class="card"><h3>Response</h3><div id="aiOut" class="result">Ask a science, maths or calculator question.</div></div></div>`);

pages.about=()=>shell("About CalcSphere","A modular front-end calculator project.",`
<div class="card"><h2>Built for learning and calculation</h2><p class="muted">CalcSphere Pro separates structure, styling and application logic into index.html, style.css and script.js. It includes responsive navigation, local history, scientific evaluation, science formulas, conversions, statistics, finance and a canvas graphing engine.</p><div class="info"><b>Accuracy note:</b> This is an educational calculator. For high-stakes engineering, medical, laboratory or financial work, verify results with an appropriate validated tool and source.</div></div>`);

function bind(id,event,fn){const e=$("#"+id);if(e)e.addEventListener(event,fn)}
function setup(){
bind("quadBtn","click",()=>{let a=val("#qa"),b=val("#qb"),c=val("#qc"),d=b*b-4*a*c;if(a===0)return $("#quadOut").textContent=`x = ${fmt(-c/b)}`;if(d<0)$("#quadOut").textContent=`Complex roots: (${fmt(-b/(2*a))} ± ${fmt(Math.sqrt(-d)/(2*a))}i)`;else $("#quadOut").textContent=`x₁ = ${fmt((-b+Math.sqrt(d))/(2*a))}, x₂ = ${fmt((-b-Math.sqrt(d))/(2*a))}`;record("Mathematics",`Quadratic ${a}x² + ${b}x + ${c}`,$("#quadOut").textContent)});
bind("derivBtn","click",()=>{let a=$("#poly").value.split(",").map(Number).filter(Number.isFinite),n=a.length-1;let out=a.slice(0,-1).map((c,i)=>`${fmt(c*(n-i))}x^${n-i-1}`).join(" + ").replace(/\+\s-/g,"- ");$("#derivOut").textContent=out||"0";record("Mathematics","Derivative of "+$("#poly").value,out)});
bind("triBtn","click",()=>{$("#triOut").textContent=`Area = ${fmt(val("#tb")*val("#th")/2)} square units`});
bind("circleBtn","click",()=>{$("#circleOut").innerHTML=`Area = ${fmt(Math.PI*val("#cr")**2)}<br>Circumference = ${fmt(2*Math.PI*val("#cr"))}`});
bind("speedBtn","click",()=>{$("#speedOut").textContent=`v = ${fmt(val("#pd")/val("#pt"))} m/s`;record("Physics","v=d/t",$("#speedOut").textContent)});
bind("forceBtn","click",()=>{$("#forceOut").textContent=`F = ${fmt(val("#pm")*val("#pa"))} N`;record("Physics","F=ma",$("#forceOut").textContent)});
bind("keBtn","click",()=>{$("#keOut").textContent=`KE = ${fmt(.5*val("#kem")*val("#kev")**2)} J`});
bind("ohmBtn","click",()=>{$("#ohmOut").textContent=`I = ${fmt(val("#ov")/val("#or"))} A`});
bind("waveBtn","click",()=>{$("#waveOut").textContent=`v = ${fmt(val("#wf")*val("#wl"))} m/s`});
bind("gpeBtn","click",()=>{$("#gpeOut").textContent=`GPE = ${fmt(val("#gpm")*val("#gpg")*val("#gph"))} J`});
bind("molesBtn","click",()=>{$("#molesOut").textContent=`n = ${fmt(val("#cm")/val("#cM"))} mol`});
bind("molarBtn","click",()=>{$("#molarOut").textContent=`C = ${fmt(val("#cn")/val("#cv"))} mol/L`});
bind("densityBtn","click",()=>{$("#densityOut").textContent=`ρ = ${fmt(val("#dm")/val("#dv"))}`});
bind("gasBtn","click",()=>{let lhs=val("#igp")*val("#igv"),rhs=val("#ign")*8.314*val("#igt");$("#gasOut").textContent=`PV = ${fmt(lhs)}; nRT ≈ ${fmt(rhs)} (kPa·L)`});
bind("siBtn","click",()=>{let I=val("#sip")*(val("#sir")/100)*val("#sit"),A=val("#sip")+I;$("#siOut").textContent=`Interest = ${fmt(I)}; Amount = ${fmt(A)}`});
bind("ciBtn","click",()=>{let A=val("#cip")*(1+val("#cir")/100/val("#cin"))**(val("#cin")*val("#cit"));$("#ciOut").textContent=`Amount = ${fmt(A)}; Interest = ${fmt(A-val("#cip"))}`});
bind("statsBtn","click",()=>{let a=$("#statsData").value.split(",").map(Number).filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return;let mean=a.reduce((x,y)=>x+y,0)/a.length,med=a.length%2?a[(a.length-1)/2]:(a[a.length/2-1]+a[a.length/2])/2,varx=a.reduce((s,x)=>s+(x-mean)**2,0)/a.length;$("#statsOut").innerHTML=`Count: ${a.length}<br>Mean: ${fmt(mean)}<br>Median: ${fmt(med)}<br>Minimum: ${fmt(a[0])}<br>Maximum: ${fmt(a.at(-1))}<br>Population variance: ${fmt(varx)}<br>Population SD: ${fmt(Math.sqrt(varx))}`});
bind("convertBtn","click",convertUnits);bind("ucat","change",populateUnits);
bind("plotBtn","click",plot);bind("clearGraph","click",()=>{let c=$("#graphCanvas");if(c)c.getContext("2d").clearRect(0,0,c.width,c.height)});
bind("pageClear","click",()=>{if(confirm("Clear all saved calculations?")){historyData=[];save();render()}});
bind("exportHistory","click",()=>{let blob=new Blob([JSON.stringify(historyData,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="calcsphere-history.json";a.click();URL.revokeObjectURL(a.href)});
bind("askAi","click",localAnswer);renderHistory();populateUnits();
}

function renderHistory(){const box=$("#historyList");if(!box)return;box.innerHTML=historyData.length?historyData.map((h,i)=>`<div class="history-row"><div class="grow"><b>${h.result}</b><div class="muted small">${h.category} · ${h.expression} · ${h.time}</div></div><button class="btn secondary" data-remove="${i}">Remove</button></div>`).join(""):`<div class="empty">No calculations saved yet.</div>`;$$("[data-remove]").forEach(b=>b.onclick=()=>{historyData.splice(+b.dataset.remove,1);save();render()})}
function populateUnits(){let cat=$("#ucat");if(!cat)return;let c=cat.value, names=c==="temperature"?["C","F","K"]:Object.keys(units[c]);["#ufrom","#uto"].forEach(sel=>$(sel).innerHTML=names.map(n=>`<option>${n}</option>`).join(""))}
function convertUnits(){let c=$("#ucat").value,x=val("#uval"),f=$("#ufrom").value,t=$("#uto").value,r;if(c==="temperature"){let k=f==="C"?x+273.15:f==="F"?(x-32)*5/9+273.15:x; r=t==="C"?k-273.15:t==="F"?(k-273.15)*9/5+32:k}else r=x*units[c][f]/units[c][t];$("#convertOut").textContent=`${fmt(r)} ${t}`;record("Conversion",`${x} ${f} → ${t}`,fmt(r))}
function plot(){let c=$("#graphCanvas");if(!c)return;let ctx=c.getContext("2d"),W=c.width=c.clientWidth*devicePixelRatio,H=c.height=420*devicePixelRatio;ctx.scale(devicePixelRatio,devicePixelRatio);W=c.clientWidth;H=420;ctx.clearRect(0,0,W,H);let min=Number($("#gmin").value),max=Number($("#gmax").value),fn=$("#gx").value,xs=[],ys=[];for(let i=0;i<900;i++){let x=min+(max-min)*i/899;try{let y=safeEval(fn.replace(/x/g,`(${x})`));xs.push(x);ys.push(y)}catch{xs.push(x);ys.push(NaN)}}let finite=ys.filter(Number.isFinite);if(!finite.length)return;let ymin=Math.min(...finite),ymax=Math.max(...finite);if(ymin===ymax){ymin--;ymax++}const X=x=>40+(x-min)/(max-min)*(W-60),Y=y=>20+(ymax-y)/(ymax-ymin)*(H-50);ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue("--border");ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(40,Y(0));ctx.lineTo(W-20,Y(0));ctx.moveTo(X(0),20);ctx.lineTo(X(0),H-30);ctx.stroke();ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue("--primary");ctx.lineWidth=2;ctx.beginPath();xs.forEach((x,i)=>{let y=ys[i];if(!Number.isFinite(y)){ctx.stroke();ctx.beginPath();return}i?ctx.lineTo(X(x),Y(y)):ctx.moveTo(X(x),Y(y))});ctx.stroke()}
function localAnswer(){let q=$("#aiQuestion").value.toLowerCase(),ans="I can explain calculator topics locally. Try asking about a formula, unit conversion, or basic science concept.";if(q.includes("ideal gas"))ans="The ideal gas law is PV = nRT. P is pressure, V is volume, n is moles, R is the gas constant, and T is absolute temperature in kelvin. It models gases approximately under many ordinary conditions.";else if(q.includes("newton"))ans="Newton’s second law states F = ma: net force equals mass multiplied by acceleration. If mass is in kg and acceleration in m/s², force is in newtons.";else if(q.includes("mole"))ans="A mole is an amount of substance. For a sample with known mass and molar mass, n = m/M.";else if(q.includes("quadratic"))ans="For ax² + bx + c = 0, the roots are x = (−b ± √(b²−4ac))/(2a). The discriminant determines whether roots are real or complex.";else if(q.includes("derivative"))ans="A derivative describes instantaneous rate of change. For a power x^n, the derivative is n·x^(n−1).";else if(q.includes("convert"))ans="Choose Conversions from the menu, select a category, enter a value and choose the source and target units.";$("#aiOut").textContent=ans}
function render(){let key=location.hash.slice(1)||"dashboard";if(!pages[key])key="dashboard";app.innerHTML=pages[key]();$$(".nav-link").forEach(a=>a.classList.toggle("active",a.dataset.page===key));$("#breadcrumb").textContent=key[0].toUpperCase()+key.slice(1);$("#exitBtn").hidden=key==="dashboard";setup();if(key==="history")renderHistory();$$("[data-go]").forEach(b=>b.onclick=()=>location.hash=b.dataset.go);if(window.innerWidth<=760)$("#sidebar").classList.remove("open")}
function toggleTheme(){settings.theme=settings.theme==="dark"?"light":"dark";localStorage.setItem("calcsphere_settings",JSON.stringify(settings));document.documentElement.dataset.theme=settings.theme}
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;$("#installBtn").hidden=false});
window.addEventListener("appinstalled",()=>{installPrompt=null;$("#installBtn").hidden=true;notify("CalcSphere installed")});
$("#installBtn").onclick=async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$("#installBtn").hidden=true};
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
$("#themeBtn").onclick=toggleTheme;$("#topThemeBtn").onclick=toggleTheme;$("#clearAllBtn").onclick=()=>{historyData=[];save();notify("History cleared")};$("#menuBtn").onclick=()=>$("#sidebar").classList.toggle("open");window.addEventListener("hashchange",render);
$("#exitBtn").onclick=()=>{location.hash="dashboard";window.scrollTo({top:0,behavior:"smooth"})};
setInterval(()=>$("#clock").textContent=new Date().toLocaleTimeString(),1000);render();

document.addEventListener("click",e=>{
 const b=e.target.closest("[data-key]"); if(!b)return;
 const key=b.dataset.key,expr=$("#sciExpr"),ans=$("#sciAns"); if(!expr||!ans)return;
 if(key==="C"){expr.textContent="";ans.textContent="0";return}
 if(key==="⌫"){expr.textContent=expr.textContent.slice(0,-1);return}
 if(key==="="){try{let r=safeEval(expr.textContent);ans.textContent=fmt(r);record("Scientific",expr.textContent,fmt(r));}catch{ans.textContent="Error"}return}
 expr.textContent+=key;
});
document.addEventListener("keydown",e=>{
 if(!location.hash.includes("scientific"))return;
 if(/[0-9.+\-*/()%]/.test(e.key)){const k=document.querySelector(`[data-key="${CSS.escape(e.key)}"]`);if(k)k.click()}
 if(e.key==="Enter")document.querySelector('[data-key="="]')?.click();
 if(e.key==="Backspace")document.querySelector('[data-key="⌫"]')?.click();
});
