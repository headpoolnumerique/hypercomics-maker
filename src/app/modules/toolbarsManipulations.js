import interact from 'interactjs'


function toggleToolbars() {
  document.querySelector('#homeButtonsList').addEventListener('click', function(event) {
  switch (event.target.id) {
    case 'showLayers':
      console.log(event.target.id)
      toggleToolbar(document.querySelector('#layer-space'))
      break
    case 'showSequence':
      console.log(event.target.id)
      toggleToolbar(document.querySelector('#sequence'))
      break
    case 'showContextual':
      console.log(event.target.id)
      toggleToolbar(document.querySelector('#contextualUI'))
      break
    case 'showAssets':
      console.log(event.target.id)
      toggleToolbar(document.querySelector('#assets'))
      break
    case 'showMontage':
      console.log(event.target.id)
      toggleToolbar(document.querySelector('#banc-montage'))
      break
    case 'showPelure':
      console.log(event.target.id)
      if(document.querySelector('.oldShow')) {
        document.querySelector('.oldshown')?.classList.remove('.oldshown')
      }
      document.querySelector('main').classList.toggle('showPrevious')
      document.querySelector('.shown').previousElementSibling?.classList.add('oldshown')
      break
    default:
      console.log(event.target.id)
      console.log('not there yet')
  }
  })
}

function toggleToolbar(toolbarElement) {
  toolbarElement.classList.toggle('hide');
}


function moveToolbars() {
   interact('.moveable').draggable({
        inertia: false,
        onmove: function (event) {
          var target = event.target,
              // keep the dragged position in the data-x/data-y attributes
              x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
              y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
    
          // translate the element
          target.style.webkitTransform =
          target.style.transform =
            'translate(' + x + 'px, ' + y + 'px)';
    
          // update the position attributes
          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);
        },
        onend: function(event) {
            console.log(event);
        }
    }).allowFrom('h2');
}

export { moveToolbars, toggleToolbars }

