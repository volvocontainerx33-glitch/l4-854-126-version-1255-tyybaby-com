(function(){
  function ready(fn){if(document.readyState!=='loading')fn();else document.addEventListener('DOMContentLoaded',fn);}
  ready(function(){
    var box=document.querySelector('[data-player-box]');
    if(!box) return;
    var video=box.querySelector('video');
    var overlay=box.querySelector('[data-play-overlay]');
    if(!video) return;
    var src=video.getAttribute('data-video');
    var started=false;
    function attach(){
      if(started) return;
      started=true;
      if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=src;}
      else if(window.Hls&&window.Hls.isSupported()){var hls=new window.Hls({lowLatencyMode:true});hls.loadSource(src);hls.attachMedia(video);}
      else{video.src=src;}
    }
    function play(){attach();if(overlay) overlay.classList.add('hidden');var p=video.play();if(p&&p.catch)p.catch(function(){});}
    if(overlay) overlay.addEventListener('click',play);
    video.addEventListener('click',function(){if(!started) play();});
    video.addEventListener('play',function(){if(overlay) overlay.classList.add('hidden');});
  });
})();