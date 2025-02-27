import { useRef, useEffect } from 'react';
// import { Brain, Cpu, Database, Network } from 'lucide-react';

interface Bubble {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  iconType: string;
  score?: number;
  color: string;
  borderWidth: number;
}

interface BubbleCanvasProps {
  showIcons: boolean;
  showScores: boolean;
}

export function BubbleCanvas({ showIcons, showScores }: BubbleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubbles = useRef<Bubble[]>([]);
  const animationRef = useRef<number>();

  const icons = [
    { type: 'Brain', color: '#ff6b6b' },
    { type: 'Cpu', color: '#4ecdc4' },
    { type: 'Database', color: '#45b7d1' },
    { type: 'Network', color: '#96ceb4' },
  ];

  const renderIcon = (ctx: CanvasRenderingContext2D, type: string, x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = 'currentColor';
    ctx.lineWidth = 2;

    switch (type) {
      case 'Brain':
        // 简化的大脑图标
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'Cpu':
        // 简化的CPU图标
        ctx.strokeRect(-8, -8, 16, 16);
        ctx.strokeRect(-4, -4, 8, 8);
        break;
      case 'Database':
        // 简化的数据库图标
        ctx.beginPath();
        ctx.ellipse(0, -6, 8, 4, 0, 0, Math.PI * 2);
        ctx.moveTo(-8, -6);
        ctx.lineTo(-8, 6);
        ctx.ellipse(0, 6, 8, 4, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'Network':
        // 简化的网络图标
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.moveTo(0, -8);
        ctx.lineTo(8, 8);
        ctx.lineTo(-8, 8);
        ctx.closePath();
        ctx.stroke();
        break;
    }
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布大小
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 100; // 减去导航栏高度
    };
    resize();
    window.addEventListener('resize', resize);

    // 初始化气泡
    bubbles.current = Array.from({ length: 16 }, () => {
      const radius = Math.random() * 30 + 40;
      const randomIcon = icons[Math.floor(Math.random() * icons.length)];
      return {
        x: Math.random() * (canvas.width - radius * 2) + radius,
        y: Math.random() * (canvas.height - radius * 2) + radius,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius,
        iconType: randomIcon.type,
        score: Math.random() > 0.5 ? Math.floor(Math.random() * 100) : undefined,
        color: randomIcon.color,
        borderWidth: 16, // 1rem = 16px
      };
    });

    // 修改绘制气泡的部分
    const drawBubble = (ctx: CanvasRenderingContext2D, bubble: Bubble) => {
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      
      // 设置透明填充，增加亮度
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fill();
      
      // 添加内部光晕
      const innerGlow = ctx.createRadialGradient(
        bubble.x, bubble.y, 0,
        bubble.x, bubble.y, bubble.radius
      );
      innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
      innerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = innerGlow;
      ctx.fill();
      
      // 设置边框渐变，增加亮度
      const gradient = ctx.createRadialGradient(
        bubble.x, bubble.y, bubble.radius - bubble.borderWidth,
        bubble.x, bubble.y, bubble.radius
      );
      
      // 修改渐变色停点，增加亮度
      const color = bubble.color;
      const brighterColor = increaseBrightness(color, 30); // 增加30%的亮度
      gradient.addColorStop(0, brighterColor); // 内侧更亮
      gradient.addColorStop(0.5, color); // 中间原色
      gradient.addColorStop(1, color + 'AA'); // 外侧半透明
      
      // 应用渐变边框
      ctx.lineWidth = bubble.borderWidth;
      ctx.strokeStyle = gradient;
      ctx.stroke();
    };

    // 辅助函数：增加颜色亮度
    const increaseBrightness = (hex: string, percent: number) => {
      // 移除 # 号
      hex = hex.replace(/^#/, '');
      
      // 转换为RGB
      let r = parseInt(hex.slice(0, 2), 16);
      let g = parseInt(hex.slice(2, 4), 16);
      let b = parseInt(hex.slice(4, 6), 16);
      
      // 增加亮度
      r = Math.min(255, Math.floor(r * (1 + percent / 100)));
      g = Math.min(255, Math.floor(g * (1 + percent / 100)));
      b = Math.min(255, Math.floor(b * (1 + percent / 100)));
      
      // 转回十六进制
      const toHex = (n: number) => {
        const hex = n.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 更新和绘制每个气泡
      bubbles.current.forEach((bubble, i) => {
        // 碰撞检测和移动
        bubble.x += bubble.vx;
        bubble.y += bubble.vy;

        // 边界碰撞
        if (bubble.x <= bubble.radius || bubble.x >= canvas.width - bubble.radius) bubble.vx *= -1;
        if (bubble.y <= bubble.radius || bubble.y >= canvas.height - bubble.radius) bubble.vy *= -1;

        // 气泡间碰撞
        for (let j = i + 1; j < bubbles.current.length; j++) {
          const other = bubbles.current[j];
          const dx = other.x - bubble.x;
          const dy = other.y - bubble.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // 使用实际半径作为碰撞距离
          const minDistance = bubble.radius + other.radius;

          if (distance < minDistance) {
            // 计算重叠量
            const overlap = minDistance - distance;
            
            // 计算单位向量
            const nx = dx / distance;
            const ny = dy / distance;
            
            // 分离气泡
            const separationX = (overlap / 2) * nx;
            const separationY = (overlap / 2) * ny;
            
            bubble.x -= separationX;
            bubble.y -= separationY;
            other.x += separationX;
            other.y += separationY;

            // 碰撞响应
            const angle = Math.atan2(dy, dx);
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);

            // 旋转速度
            const vx1 = bubble.vx * cos + bubble.vy * sin;
            const vy1 = bubble.vy * cos - bubble.vx * sin;
            const vx2 = other.vx * cos + other.vy * sin;
            const vy2 = other.vy * cos - other.vx * sin;

            // 交换速度
            bubble.vx = vx2 * cos - vy1 * sin;
            bubble.vy = vy1 * cos + vx2 * sin;
            other.vx = vx1 * cos - vy2 * sin;
            other.vy = vy2 * cos + vx1 * sin;
          }
        }

        // 使用新的绘制函数
        drawBubble(ctx, bubble);

        // 根据开关状态决定是否渲染图标
        if (showIcons) {
          ctx.strokeStyle = bubble.color;
          renderIcon(ctx, bubble.iconType, bubble.x, bubble.y);
        }

        // 根据开关状态决定是否渲染分数
        if (showScores && bubble.score !== undefined) {
          ctx.font = '16px Arial';
          ctx.fillStyle = bubble.color;
          ctx.textAlign = 'center';
          ctx.fillText(`${bubble.score}%`, bubble.x, bubble.y + 30);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showIcons, showScores]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[calc(100vh-64px)]"
    />
  );
} 