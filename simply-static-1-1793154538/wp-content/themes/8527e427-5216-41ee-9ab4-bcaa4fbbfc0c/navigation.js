(function navigationRuntime(document          ) {
  const win = document.defaultView ;
  let frame = 0;
  let disposed = false;
  const opened = new WeakSet         ();
  const setOpen = (menu         , open         ) => {
    if (open) opened.add(menu);
    else opened.delete(menu);
    menu.classList.toggle('studio-menu-open', open);
    menu.querySelector('button')?.setAttribute('aria-expanded', String(open));
  };
  const fit = () => {
    frame = 0;
    for (const nav of document.querySelectorAll             (
      '[data-dsl-element="navigation"],nav.wp-block-navigation',
    )) {
      const menu = nav.querySelector('.studio-navigation');
      // Keep navigation actions inside the menu list.
      const list = menu?.querySelector('ul');
      const parent = nav.parentElement;
      if (
        list &&
        parent &&
        parent.querySelectorAll(':scope > [data-dsl-element="navigation"]')
          .length === 1
      ) {
        for (const actions of parent.querySelectorAll(
          ':scope > [data-dsl-element="buttons"]',
        )) {
          const item = document.createElement('li');
          item.append(actions);
          list.append(item);
        }
      }
      if (menu) setOpen(menu, opened.has(menu));
      if (nav.querySelector('.is-menu-open,.studio-menu-open')) continue;
      nav.classList.remove('studio-menu-collapsed');
      const row = nav.parentElement;
      if (
        row &&
        (row.scrollWidth > row.clientWidth + 1 ||
          nav.scrollWidth > nav.clientWidth + 1)
      )
        nav.classList.add('studio-menu-collapsed');
    }
  };
  const schedule = () => {
    if (!disposed && !frame) frame = win.requestAnimationFrame(fit);
  };
  const observer = new win.MutationObserver(schedule);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  const interact = (event       ) => {
    const target = event.target                  ;
    const menu = target?.closest?.('.studio-navigation');
    if (event.type === 'keydown' && (event                 ).key === 'Escape') {
      for (const open of document.querySelectorAll(
        '.studio-navigation.studio-menu-open',
      )) {
        setOpen(open, false);
        open.querySelector             ('button')?.focus();
      }
    } else if (event.type === 'click') {
      if (menu && target?.closest('button')) setOpen(menu, !opened.has(menu));
      else if (menu && target?.closest('a')) setOpen(menu, false);
      else if (!menu)
        for (const open of document.querySelectorAll(
          '.studio-navigation.studio-menu-open',
        ))
          setOpen(open, false);
    }
  };
  document.addEventListener('click', interact);
  document.addEventListener('keydown', interact);
  win.addEventListener('resize', schedule);
  document.fonts?.ready.then(schedule);
  fit();
  return () => {
    disposed = true;
    observer.disconnect();
    win.removeEventListener('resize', schedule);
    document.removeEventListener('click', interact);
    document.removeEventListener('keydown', interact);
    if (frame) win.cancelAnimationFrame(frame);
  };
})(document);
