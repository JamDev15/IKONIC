import { useEffect, useRef } from 'react';

const IMG_SRC  = '/ikonic background banner.png';
const IMG_W    = 80;   // width of each falling image tile (px)
const COLS     = 10;   // number of columns across the screen
const SPEED_MIN = 0.4;
const SPEED_MAX = 1.2;

export default function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const img = new Image();
    img.src = IMG_SRC;

    let animationId: number;

    img.onload = () => {
      const aspect = img.naturalHeight / img.naturalWidth;
      const imgH   = Math.round(IMG_W * aspect);
      const colGap = canvas.width / COLS;

      type Drop = { x: number; y: number; speed: number; opacity: number };

      const drops: Drop[] = Array.from({ length: COLS }, (_, i) => ({
        x:       i * colGap + (colGap - IMG_W) / 2,
        y:       Math.random() * -canvas.height,
        speed:   SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN),
        opacity: 0.06 + Math.random() * 0.14,
      }));

      const draw = () => {
        // Fade trail — dark overlay each frame
        ctx.fillStyle = 'rgba(10, 14, 26, 0.18)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (const d of drops) {
          ctx.save();
          ctx.globalAlpha = d.opacity;
          ctx.drawImage(img, d.x, d.y, IMG_W, imgH);
          ctx.restore();

          d.y += d.speed;

          // Reset when fully off screen
          if (d.y > canvas.height + imgH) {
            d.y       = -imgH - Math.random() * canvas.height * 0.5;
            d.speed   = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
            d.opacity = 0.06 + Math.random() * 0.14;
          }
        }

        animationId = requestAnimationFrame(draw);
      };

      draw();
    };

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, background: 'transparent' }}
    />
  );
}
