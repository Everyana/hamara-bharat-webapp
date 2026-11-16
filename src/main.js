import stories from '../data/stories.json';
import './style.css';
const app=document.querySelector('#app');
let language=location.pathname.startsWith('/hi')?'hi':'en', active=0, topic='', jurisdiction='', query='';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const states=['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];
const uts=['Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'];
const names={'Central Government':'केंद्र सरकार','All India':'सम्पूर्ण भारत','All topics':'सभी विषय','All jurisdictions':'सभी क्षेत्र','Search public updates':'सार्वजनिक अपडेट खोजें'};
const tr=(en,hi)=>language==='hi'?hi:en;
const category=s=>s.category?.[language]||s.category?.en||'Public updates';
const getJurisdiction=s=>s.jurisdiction?.en||s.jurisdiction||s.state||s.region||'Central Government';
const allTopics=()=>[...new Set(stories.map(s=>s.category?.en).filter(Boolean))].sort();
const filtered=()=>stories.filter(s=>(!topic||s.category?.en===topic)&&(!jurisdiction||getJurisdiction(s)===jurisdiction)&&( !query||[s.en?.title,s.en?.summary,s.hi?.title,s.hi?.summary,s.category?.en,s.category?.hi,getJurisdiction(s),s.department,s.source].join(' ').toLowerCase().includes(query.toLowerCase())));
function render(){
 document.documentElement.lang=language;
 const items=filtered();active=Math.min(active,Math.max(0,items.length-1));
 const options=(arr,value)=>arr.map(v=>'<option value="'+esc(v)+'" '+(value===v?'selected':'')+'>'+esc(names[v]&&language==='hi'?names[v]:v)+'</option>').join('');
 app.innerHTML='<header class="top"><button class="brand" id="home" aria-label="'+tr('Return to first story','पहली खबर पर जाएं')+'"><span class="brand-mark" aria-hidden="true">☸</span><span class="brand-name">SWIPES<small>'+tr('BHARAT EDITION · PUBLIC INFORMATION','भारत संस्करण · सार्वजनिक जानकारी')+'</small></span></button><nav><button id="en" aria-pressed="'+(language==='en')+'">English</button><button id="hi" aria-pressed="'+(language==='hi')+'">हिन्दी</button></nav></header>'+
 '<section class="filters" aria-label="'+tr('Filter stories','खबरें छाँटें')+'"><input id="search" type="search" placeholder="'+tr('Search public updates','सार्वजनिक अपडेट खोजें')+'" value="'+esc(query)+'" aria-label="'+tr('Search public updates','सार्वजनिक अपडेट खोजें')+'"><select id="topic" aria-label="'+tr('Topic','विषय')+'">'+options(['All topics',...allTopics()],topic||'All topics')+'</select><select id="jurisdiction" aria-label="'+tr('Jurisdiction','क्षेत्र')+'">'+options(['All jurisdictions','Central Government',...states,...uts],jurisdiction||'All jurisdictions')+'</select><button id="clear" type="button">'+tr('Clear','हटाएं')+'</button></section>'+
 '<main id="feed" aria-label="'+tr('Swipe stories','स्वाइप समाचार')+'">'+(items.length?items.map((s,i)=>'<article class="story" id="story-'+esc(s.id||i)+'" tabindex="0"><div class="story-inner"><div class="meta">'+esc(category(s))+' · '+esc(new Intl.DateTimeFormat(language==='hi'?'hi-IN':'en-IN',{dateStyle:'medium',timeZone:'UTC'}).format(new Date(s.date+'T00:00:00Z')))+'</div><h1>'+esc(s[language]?.title||s.en?.title)+'</h1><p>'+esc(s[language]?.summary||s.en?.summary)+'</p><div class="source"><span>'+tr('Official source','आधिकारिक स्रोत')+'</span><strong>'+esc(s.source||s.department||getJurisdiction(s))+'</strong></div><div class="links"><a href="'+esc(s.sourceUrl)+'" target="_blank" rel="noopener noreferrer">'+tr('Read original notice ↗','मूल सूचना पढ़ें ↗')+'</a><button class="share" data-id="'+esc(s.id||i)+'">'+tr('Share','शेयर')+'</button></div><div class="count">'+(i+1)+' / '+items.length+'</div></div></article>').join(''):'<div class="empty"><h2>'+tr('No stories match these filters','इन फ़िल्टरों से कोई समाचार नहीं मिला')+'</h2><p>'+tr('Try another topic or jurisdiction.','दूसरा विषय या क्षेत्र चुनें।')+'</p><button id="empty-clear">'+tr('Clear filters','फ़िल्टर हटाएं')+'</button></div>')+'</main><footer class="bottom"><button id="prev" aria-label="Previous story">↑</button><span>'+items.length+' '+tr('official updates','आधिकारिक अपडेट')+'</span><button id="next" aria-label="Next story">↓</button></footer>';
 document.querySelector('#home').onclick=()=>{query='';topic='';jurisdiction='';active=0;history.replaceState({},'',language==='hi'?'/hi/':'/');render()};
 document.querySelector('#en').onclick=()=>change('en');document.querySelector('#hi').onclick=()=>change('hi');
 document.querySelector('#search').oninput=e=>{query=e.target.value;active=0;updateFeed()};
 document.querySelector('#topic').onchange=e=>{topic=e.target.value==='All topics'?'':e.target.value;active=0;render()};
 document.querySelector('#jurisdiction').onchange=e=>{jurisdiction=e.target.value==='All jurisdictions'?'':e.target.value;active=0;render()};
 document.querySelector('#clear').onclick=clear;
 document.querySelector('#empty-clear')?.addEventListener('click',clear);
 document.querySelector('#next').onclick=()=>go(1);document.querySelector('#prev').onclick=()=>go(-1);
 const feed=document.querySelector('#feed');feed.addEventListener('scroll',()=>{active=Math.max(0,Math.min(items.length-1,Math.round(feed.scrollTop/feed.clientHeight)))},{passive:true});feed.scrollTop=active*feed.clientHeight;
 document.querySelectorAll('.share').forEach(b=>b.onclick=()=>{const url=new URL(location.href);url.hash='story-'+b.dataset.id;navigator.share?navigator.share({url:url.href}).catch(()=>{}):navigator.clipboard?.writeText(url.href)});
}
function updateFeed(){const input=document.querySelector('#search');const start=input.selectionStart;render();const next=document.querySelector('#search');next.focus();next.setSelectionRange(start,start)}
function clear(){query='';topic='';jurisdiction='';active=0;render()}
function change(lang){language=lang;history.replaceState({},'',lang==='hi'?'/hi/':'/');render()}
function go(d){const feed=document.querySelector('#feed');active=Math.max(0,Math.min(filtered().length-1,active+d));feed.scrollTo({top:active*feed.clientHeight,behavior:'smooth'})}
window.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp'].includes(e.key)&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();go(e.key==='ArrowDown'?1:-1)}});
render();if(location.hash.startsWith('#story-')){const node=document.getElementById(location.hash.slice(1));node?.scrollIntoView()}
