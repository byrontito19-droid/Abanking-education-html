// Каталог инструментов и интерактивные элементы учебной страницы.
'use strict';
const tools = [
  {id:'figma',name:'FIGMA',price:'Free',category:'design',url:'https://www.figma.com/'},
  {id:'sketch',name:'Sketch',price:'Trial & Paid',category:'design',url:'https://www.sketch.com/'},
  {id:'vscode',name:'Visual Studio Code',price:'Free',category:'development',url:'https://code.visualstudio.com/'},
  {id:'notion',name:'Notion',price:'Free & Paid',category:'productivity',url:'https://www.notion.so/'},
  {id:'slack',name:'Slack',price:'Free & Paid',category:'productivity',url:'https://slack.com/'},
  {id:'invision',name:'Invision',price:'Free & Paid',category:'design',url:'https://www.invisionapp.com/'},
  {id:'github',name:'GitHub',price:'Free & Paid',category:'development',url:'https://github.com/'},
  {id:'trello',name:'Trello',price:'Free & Paid',category:'productivity',url:'https://trello.com/'},
  {id:'penpot',name:'Penpot',price:'Free & Paid',category:'design',url:'https://penpot.app/'}
];
const read = (key, fallback) => {try {return JSON.parse(localStorage.getItem(key)) ?? fallback;}catch{return fallback;}};
const write = (key, value) => {try {localStorage.setItem(key, JSON.stringify(value));}catch{/* Страница работает и без localStorage. */}};
const readIds = key => {const value=read(key,[]);return new Set(Array.isArray(value)?value.filter(id=>tools.some(tool=>tool.id===id)):[]);};
const liked=readIds('antools-likes');
const saved=readIds('antools-collection');
let category='all';
let limit=6;
let query='';
const grid=document.querySelector('.tools__grid');
const more=document.querySelector('.tools__more');
const filter=document.querySelector('.tools__filter');
const categoryToggle=document.querySelector('.header__category-toggle');
const categoryMenu=document.querySelector('.header__dropdown');
let toastTimer;

function notify(message){const toast=document.querySelector('.toast');toast.textContent=message;toast.classList.add('toast_visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('toast_visible'),2600);}
function render(){
  const matches=tools.filter(tool=>(category==='all'||tool.category===category)&&tool.name.toLowerCase().includes(query));
  grid.innerHTML=matches.slice(0,limit).map(tool=>`<article class="tool-card${tool.id==='sketch'?' tool-card_featured':''}">
    <div class="tool-card__header"><img class="tool-card__icon" src="assets/${tool.id}.svg" width="64" height="64" alt=""><div><h3 class="tool-card__name">${tool.name}</h3><p class="tool-card__price">${tool.price}</p></div></div>
    <p class="tool-card__description">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    <div class="tool-card__footer"><button class="tool-card__action" type="button" data-like="${tool.id}" aria-label="Like ${tool.name}" aria-pressed="${liked.has(tool.id)}"><svg aria-hidden="true"><use href="assets/icons.svg#heart"></use></svg></button><button class="tool-card__action tool-card__action_saved" type="button" data-save="${tool.id}" aria-label="Save ${tool.name} to collection" aria-pressed="${saved.has(tool.id)}"><svg aria-hidden="true"><use href="assets/icons.svg#folder"></use></svg></button><a class="tool-card__visit" href="${tool.url}" target="_blank" rel="noopener noreferrer">Visit<span class="visually-hidden"> ${tool.name}</span></a></div>
  </article>`).join('');
  more.hidden=matches.length<=limit;
  document.querySelector('.tools__empty').hidden=matches.length>0;
  filter.hidden=category==='all'&&!query;
  document.querySelector('.tools__filter-label').textContent=`${matches.length} tools${category!=='all'?' · '+category:''}${query?' · “'+query+'”':''}`;
}

grid.addEventListener('click',event=>{
  const button=event.target.closest('button[data-like],button[data-save]');if(!button)return;
  const isSave=button.hasAttribute('data-save');const id=isSave?button.dataset.save:button.dataset.like;
  const selected=isSave?saved:liked;
  if(selected.has(id))selected.delete(id);else selected.add(id);
  write(isSave?'antools-collection':'antools-likes',[...selected]);
  button.setAttribute('aria-pressed',String(selected.has(id)));
  if(isSave)notify(selected.has(id)?'Added to your collection':'Removed from your collection');
});

document.querySelector('.search').addEventListener('submit',event=>{event.preventDefault();query=document.querySelector('.search__input').value.trim().toLowerCase();limit=tools.length;render();document.querySelector('#tools').scrollIntoView({block:'start'});});
document.querySelector('.search__input').addEventListener('input',event=>{if(!event.target.value){query='';render();}});
more.addEventListener('click',()=>{const previous=grid.children.length;limit=tools.length;render();const next=grid.children[previous]?.querySelector('button');if(next)next.focus({preventScroll:true});notify('More tools loaded');});
categoryToggle.addEventListener('click',()=>{categoryMenu.hidden=!categoryMenu.hidden;categoryToggle.setAttribute('aria-expanded',String(!categoryMenu.hidden));});
document.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.category;limit=tools.length;categoryMenu.hidden=true;categoryToggle.setAttribute('aria-expanded','false');render();document.querySelector('#tools').scrollIntoView({block:'start'});}));
document.querySelector('.tools__reset').addEventListener('click',()=>{category='all';query='';limit=6;document.querySelector('.search__input').value='';render();});
document.addEventListener('click',event=>{if(!event.target.closest('.header__category')){categoryMenu.hidden=true;categoryToggle.setAttribute('aria-expanded','false');}});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){if(!categoryMenu.hidden)categoryToggle.focus();categoryMenu.hidden=true;categoryToggle.setAttribute('aria-expanded','false');document.querySelector('.header__nav').classList.remove('header__nav_open');document.querySelector('.header__menu').setAttribute('aria-expanded','false');}});
const menu=document.querySelector('.header__menu');menu.addEventListener('click',()=>{const open=document.querySelector('.header__nav').classList.toggle('header__nav_open');menu.setAttribute('aria-expanded',String(open));});
document.querySelector('.header__nav').addEventListener('click',event=>{if(event.target.closest('a,[data-category],[data-open-collection]')){document.querySelector('.header__nav').classList.remove('header__nav_open');menu.setAttribute('aria-expanded','false');}});

// Диалог коллекции: ссылки ведут на настоящие сайты инструментов.
const collection=document.querySelector('#collection-dialog');
function renderCollection(){const list=document.querySelector('.dialog__collection');list.replaceChildren();const selected=tools.filter(tool=>saved.has(tool.id));if(!selected.length){list.textContent='Your collection is empty. Use the folder button on a tool to save it.';return;}for(const tool of selected){const row=document.createElement('div');row.className='dialog__item';const link=document.createElement('a');link.href=tool.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=tool.name;const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','Remove '+tool.name);remove.addEventListener('click',()=>{saved.delete(tool.id);write('antools-collection',[...saved]);renderCollection();render();});row.append(link,remove);list.append(row);}}
document.querySelector('[data-open-collection]').addEventListener('click',()=>{renderCollection();collection.showModal();});
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}}));

// Персонализация учебной страницы: пароль и сервер не используются.
const profileDialog=document.querySelector('#profile-dialog');
const storedName=read('antools-name','');
if(typeof storedName==='string'&&storedName.trim())document.querySelector('.header__login').textContent=storedName;
document.querySelectorAll('[data-profile]').forEach(button=>button.addEventListener('click',()=>{document.querySelector('#profile-title').textContent=button.dataset.profile==='signup'?'Join the community':'Welcome back';const value=read('antools-name','');document.querySelector('#profile-name').value=typeof value==='string'?value:'';profileDialog.showModal();}));
document.querySelector('.profile').addEventListener('submit',event=>{event.preventDefault();const input=document.querySelector('#profile-name');const name=input.value.trim();if(!name){input.setCustomValidity('Please enter your name.');input.reportValidity();return;}input.setCustomValidity('');write('antools-name',name);document.querySelector('.header__login').textContent=name;profileDialog.close();notify('Welcome, '+name+'!');});
document.querySelector('#profile-name').addEventListener('input',event=>event.target.setCustomValidity(''));
render();
