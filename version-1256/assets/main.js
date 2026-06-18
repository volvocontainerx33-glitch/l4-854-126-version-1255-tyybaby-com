(function(){
  var toggle=document.querySelector('[data-menu-toggle]');
  var mobile=document.querySelector('[data-mobile-nav]');
  if(toggle&&mobile){toggle.addEventListener('click',function(){mobile.classList.toggle('open');});}
  var slides=[].slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots=[].slice.call(document.querySelectorAll('[data-hero-dot]'));
  if(slides.length){
    var current=0;
    function show(i){current=(i+slides.length)%slides.length;slides.forEach(function(s,n){s.classList.toggle('active',n===current);});dots.forEach(function(d,n){d.classList.toggle('active',n===current);});}
    dots.forEach(function(d,n){d.addEventListener('click',function(){show(n);});});
    setInterval(function(){show(current+1);},4800);
  }
  var grid=document.querySelector('[data-filter-grid]');
  if(grid){
    var cards=[].slice.call(grid.querySelectorAll('[data-card]'));
    var search=document.querySelector('[data-category-search]');
    var sort=document.querySelector('[data-category-sort]');
    var viewBtns=[].slice.call(document.querySelectorAll('[data-view]'));
    function apply(){
      var q=(search&&search.value||'').trim().toLowerCase();
      var visible=[];
      cards.forEach(function(card){
        var hay=(card.dataset.title+' '+card.dataset.region+' '+card.dataset.type+' '+card.dataset.tags).toLowerCase();
        var ok=!q||hay.indexOf(q)>-1;
        card.classList.toggle('hidden-card',!ok);
        if(ok) visible.push(card);
      });
      var mode=sort&&sort.value;
      visible.sort(function(a,b){
        if(mode==='year-desc') return Number(b.dataset.year)-Number(a.dataset.year);
        if(mode==='year-asc') return Number(a.dataset.year)-Number(b.dataset.year);
        if(mode==='title') return a.dataset.title.localeCompare(b.dataset.title,'zh-CN');
        return 0;
      });
      visible.forEach(function(card){grid.appendChild(card);});
    }
    if(search) search.addEventListener('input',apply);
    if(sort) sort.addEventListener('change',apply);
    viewBtns.forEach(function(btn){btn.addEventListener('click',function(){viewBtns.forEach(function(b){b.classList.remove('active');});btn.classList.add('active');grid.classList.toggle('list-view',btn.dataset.view==='list');});});
  }
  var results=document.querySelector('[data-search-results]');
  if(results&&window.SEARCH_DATA){
    var params=new URLSearchParams(location.search);
    var q=params.get('q')||'';
    var input=document.querySelector('[data-search-input]');
    if(input) input.value=q;
    function card(item){return '<a class="movie-card" href="'+item.url+'"><span class="poster"><img src="'+item.cover+'" alt="'+escapeHtml(item.title)+'" loading="lazy"></span><span class="card-body"><span class="card-top"><span class="chip chip-main">'+escapeHtml(item.category)+'</span><span class="year">'+escapeHtml(item.year)+'</span></span><strong>'+escapeHtml(item.title)+'</strong><em>'+escapeHtml(item.oneLine)+'</em><span class="card-meta"><span>'+escapeHtml(item.type)+'</span><span>'+escapeHtml(item.region)+'</span></span></span></a>';}
    function escapeHtml(s){return String(s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
    function render(term){
      term=(term||'').trim().toLowerCase();
      var data=window.SEARCH_DATA.filter(function(item){return term&&(item.title+' '+item.region+' '+item.type+' '+item.tags+' '+item.oneLine).toLowerCase().indexOf(term)>-1;}).slice(0,80);
      if(!term){results.innerHTML='<div class="empty-state">输入关键词浏览片库内容</div>';return;}
      if(!data.length){results.innerHTML='<div class="empty-state">没有找到相关影片</div>';return;}
      results.innerHTML='<div class="movie-grid">'+data.map(card).join('')+'</div>';
    }
    render(q);
    var form=document.querySelector('[data-search-form]');
    if(form){form.addEventListener('submit',function(e){e.preventDefault();var term=input?input.value:'';history.replaceState(null,'','?q='+encodeURIComponent(term));render(term);});}
  }
})();