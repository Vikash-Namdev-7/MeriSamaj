import { useRef, useEffect } from 'react';

export const useDraggableScroll = () => {
  const ref = useRef(null);

  useEffect(() => {
    const ele = ref.current;
    if (!ele) return;

    let pos = { top: 0, left: 0, x: 0, y: 0 };
    let isDragging = false;

    const mouseDownHandler = function (e) {
      isDragging = true;
      ele.style.cursor = 'grabbing';
      ele.style.userSelect = 'none';

      pos = {
        left: ele.scrollLeft,
        top: ele.scrollTop,
        x: e.clientX,
        y: e.clientY,
      };

      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    };

    const mouseMoveHandler = function (e) {
      if (!isDragging) return;
      const dx = e.clientX - pos.x;
      const dy = e.clientY - pos.y;
      ele.scrollTop = pos.top - dy;
      ele.scrollLeft = pos.left - dx;
    };

    const mouseUpHandler = function () {
      isDragging = false;
      ele.style.cursor = 'grab';
      ele.style.userSelect = '';

      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };

    ele.addEventListener('mousedown', mouseDownHandler);
    ele.style.cursor = 'grab';

    return () => {
      ele.removeEventListener('mousedown', mouseDownHandler);
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };
  }, []);

  return ref;
};
