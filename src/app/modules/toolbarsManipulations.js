import interact from 'interactjs'






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
function closeToolbar(el){
  console.log(el)
}

export { moveToolbars, closeToolbar }

