import React, { useRef, useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Trash } from 'lucide-react';
const Whiteboard = ({ roomId }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#6366f1');
  const [width, setWidth] = useState(5);
  const { socket } = useSocket();
  const colorRef = useRef(color);
  const widthRef = useRef(width);

  useEffect(() => {
    colorRef.current = color;
    widthRef.current = width;
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = width;
    }
  }, [color, width]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const context = canvas.getContext('2d');
    contextRef.current = context;

    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      const height = isMobile ? 350 : 500;
      const parentWidth = canvas.parentElement.offsetWidth;

      // Save current content if canvas has been initialized
      let tempCanvas = null;
      if (canvas.width > 0 && canvas.height > 0) {
        tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, 0);
      }

      canvas.width = parentWidth * 2;
      canvas.height = height * 2;
      canvas.style.width = '100%';
      canvas.style.height = `${height}px`;

      // Reset context properties as changing canvas width/height resets them
      context.scale(2, 2);
      context.lineCap = 'round';
      context.strokeStyle = colorRef.current;
      context.lineWidth = widthRef.current;

      // Restore content
      if (tempCanvas) {
        context.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, parentWidth, height);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    if (!socket) return;
    const handleStrokeReceived = (stroke) => {
      drawStroke(stroke.x0, stroke.y0, stroke.x1, stroke.y1, stroke.color, stroke.width);
    };
    const handleClearReceived = () => {
      clearLocalCanvas();
    };
    socket.on('stroke', handleStrokeReceived);
    socket.on('clear-board', handleClearReceived);
    return () => {
      socket.off('stroke', handleStrokeReceived);
      socket.off('clear-board', handleClearReceived);
    };
  }, [socket]);
  const drawStroke = (x0, y0, x1, y1, strokeColor, strokeWidth) => {
    if (!contextRef.current) return;
    const ctx = contextRef.current;
    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();
  };
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    return { x, y };
  };
 const startDrawing = (e) => {
    const { x, y } = getCoordinates(e);
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
    canvasRef.current.lastX = x;
    canvasRef.current.lastY = y;
  };
  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const lastX = canvasRef.current.lastX;
    const lastY = canvasRef.current.lastY;
    drawStroke(lastX, lastY, x, y, color, width);
    if (socket) {
      socket.emit('draw', {
        roomId,
        x0: lastX,
        y0: lastY,
        x1: x,
        y1: y,
        color,
        width,
      });
    }
    canvasRef.current.lastX = x;
    canvasRef.current.lastY = y;
  };
  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };
  const clearLocalCanvas = () => {
    const canvas = canvasRef.current;
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
  };
  const handleClear = () => {
    clearLocalCanvas();
    if (socket) {
      socket.emit('clear', { roomId });
    }
  };
  return (
    <div className="whiteboard-component">
      <div className="whiteboard-controls">
        <div className="control-group">
          <label>Color:</label>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </div>
        <div className="control-group">
          <label>Brush Size:</label>
          <input
            type="range"
            min="2"
            max="20"
            value={width}
            onChange={(e) => setWidth(parseInt(e.target.value))}
          />
          <span>{width}px</span>
        </div>
        <button className="btn btn-danger" onClick={handleClear}>
          <Trash size={16} /> Clear Board
        </button>
      </div>
      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onTouchCancel={stopDrawing}
          style={{ touchAction: 'none' }}
        />
      </div>
    </div>
  );
};

export default Whiteboard;
