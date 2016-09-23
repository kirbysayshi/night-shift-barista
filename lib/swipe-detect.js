export default function swiper (root,
  onUp, onRight, onDown, onLeft,
  onTap, onHoldStart, onHoldEnd,
  tapEpsilon
) {
  
  tapEpsilon = tapEpsilon || 5;
  
  let holdRef = null;
  let hasFiredHold = false;
  const touches = [];
  root.addEventListener('touchstart', stash, false);
  root.addEventListener('touchmove', stash, false);
  root.addEventListener('touchcancel', reset, false);
  root.addEventListener('touchend', compute, false);

  // same order at dots below
  const cbs = [onUp, onRight, onDown, onLeft];

  function compute (e) {
    e.preventDefault();
    const vec = dir({ x: 0, y: 0 }, touches);
    
    if (hasFiredHold) {
      reset();
      return onHoldEnd();
    }
    
    if (touches.length === 1 || totalDistance(touches) < tapEpsilon) {
      reset();
      return onTap(); 
    }
    
    const dots = [
      // "up", -1 because +y in screen coords is downward
      dot(vec.x, vec.y, 0, -1),
      // right
      dot(vec.x, vec.y, 1, 0),
      // "down", 1 because -y in screen coords is upward
      dot(vec.x, vec.y, 0, 1),
      // left
      dot(vec.x, vec.y, -1, 0),
    ];

    const max = Math.max.apply(null, dots);
    const idx = dots.indexOf(max);
    cbs[idx]();
    reset();
  }

  function dir (out, touches) {
    const originX = touches[0].x;
    const originY = touches[0].y;
    out.x = 0;
    out.y = 0;
    for (var i = 0; i < touches.length; i++) {
      out.x += touches[i].x - originX;
      out.y += touches[i].y - originY;
    }
    out.x = out.x / touches.length;
    out.y = out.y / touches.length;
    return out;
  }
  
  function totalDistance (touches) {
    const originX = touches[0].x;
    const originY = touches[0].y;
    var x = 0;
    var y = 0;
    for (var i = 0; i < touches.length; i++) {
      x -= touches[i].x - originX;
      y -= touches[i].y - originY;
    }
    return Math.sqrt(x*x + y*y);
  }

  function stash (e) {
    e.preventDefault();
    e.stopPropagation();
    const changed = e.changedTouches;
    for (var i = 0; i < changed.length; i++) {
      const touch = changed[i];
      touches.push({
        x: touch.pageX,
        y: touch.pageY,
      });
    }
    checkHold();
  }

  function checkHold () {
    if (holdRef) clearTimeout(holdRef);
    holdRef = setTimeout(function checkHold () {
      if (!hasFiredHold /*&& totalDistance(touches) < tapEpsilon*/) {
        hasFiredHold = true;
        onHoldStart();
      }
    }, 200);
  }
  
  function reset (e) {
    touches.length = 0;
    hasFiredHold = false;
    clearTimeout(holdRef);
    holdRef = null;
  }

  function dot (x1, y1, x2, y2) {
    return x1 * x2 + y1 * y2;
  }
}

//swiper(document,
//  function () { document.body.innerHTML += '<br>up' },
//  function () { document.body.innerHTML += '<br>right' },
//  function () { document.body.innerHTML += '<br>down' },
//  function () { document.body.innerHTML += '<br>left' },
//  function () { document.body.innerHTML += '<br>tap' },
//  function () { document.body.innerHTML += '<br>holdStart' },
//  function () { document.body.innerHTML += '<br>holdEnd' }
//);