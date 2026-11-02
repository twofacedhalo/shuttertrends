(() => {
  'use strict';
  const container=document.querySelector('[data-st-vertical-gallery]');
  if(!container)return;
  const category=container.dataset.stVerticalGallery;
  if(!['graduations','weddings'].includes(category))return;
  // Manifest collection order, then photograph order; no randomization or cycling.
  const photos=(window.shutterTrendsPortfolio||[]).filter(c=>c.category===category).flatMap(c=>c.photos);
  const seen=new Set();
  const dialog=document.createElement('dialog');dialog.className='st-single-photo';dialog.setAttribute('aria-label','Photograph viewer');
  const full=document.createElement('img');full.decoding='async';
  const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','Close photograph');
  const status=document.createElement('p');status.setAttribute('role','status');
  dialog.append(full,close,status);document.body.append(dialog);
  let returnFocus=null,overflow='';
  close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{document.body.style.overflow=overflow;full.removeAttribute('src');returnFocus?.focus({preventScroll:true});document.dispatchEvent(new CustomEvent('st-lightbox-close'));});
  full.onload=()=>{status.textContent='';};
  full.onerror=()=>{status.textContent='This photograph could not load. Please close the viewer and try again.';};
  photos.forEach((photo,index)=>{
    if(seen.has(photo.id||photo.src))return;seen.add(photo.id||photo.src);
    const figure=document.createElement('figure');figure.dataset.photoId=photo.id;
    const link=document.createElement('a');link.href=photo.fullSrc||photo.src;link.setAttribute('aria-label','View photograph: '+photo.alt);link.setAttribute('aria-haspopup','dialog');
    const image=document.createElement('img');image.alt=photo.alt;image.width=photo.width;image.height=photo.height;image.loading=index===0?'eager':'lazy';image.decoding='async';
    image.src=photo.src;if(photo.srcset){image.srcset=photo.srcset;image.sizes='(max-width: 1008px) calc(100vw - 48px), 960px';}
    link.append(image);figure.append(link);
    const caption=[photo.title,photo.caption,photo.location].filter(Boolean).join(' · ');
    if(caption){const text=document.createElement('figcaption');text.textContent=caption;figure.append(text);}
    link.addEventListener('click',event=>{
      if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
      event.preventDefault();returnFocus=link;overflow=document.body.style.overflow;document.body.style.overflow='hidden';full.alt=photo.alt;status.textContent='Loading photograph…';full.src=photo.fullSrc||photo.src;dialog.showModal();close.focus();document.dispatchEvent(new CustomEvent('st-lightbox-open'));
    });
    container.append(figure);
  });
  if(!seen.size){const empty=document.createElement('p');empty.textContent='Photographs will appear here as they become available.';container.append(empty);}
})();
