
import { useEffect, useRef } from 'react';
import p5 from 'p5';

const BackgroundEffect = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      const particles: { x: number; y: number; speed: number }[] = [];
      const particleCount = 50;

      p.setup = () => {
        const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
        canvas.position(0, 0);
        canvas.style('z-index', '-1');

        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
          particles.push({
            x: p.random(p.width),
            y: p.random(p.height),
            speed: p.random(0.5, 2)
          });
        }
      };

      p.draw = () => {
        p.clear();
        
        // Draw and update particles
        particles.forEach((particle, i) => {
          // Particle color based on position
          const alpha = p.map(particle.y, 0, p.height, 50, 150);
          p.stroke(155, 92, 246, alpha); // Using the vibrant purple color
          p.strokeWeight(2);
          
          // Draw particle
          p.point(particle.x, particle.y);
          
          // Connect nearby particles
          particles.slice(i + 1).forEach(other => {
            const d = p.dist(particle.x, particle.y, other.x, other.y);
            if (d < 100) {
              const alpha = p.map(d, 0, 100, 50, 0);
              p.stroke(155, 92, 246, alpha);
              p.line(particle.x, particle.y, other.x, other.y);
            }
          });
          
          // Move particle
          particle.y -= particle.speed;
          
          // Reset particle position when it goes off screen
          if (particle.y < 0) {
            particle.y = p.height;
            particle.x = p.random(p.width);
          }
        });
      };

      p.windowResized = () => {
        p.resizeCanvas(window.innerWidth, window.innerHeight);
      };
    };

    const p5Instance = new p5(sketch, containerRef.current);

    return () => {
      p5Instance.remove();
    };
  }, []);

  return <div ref={containerRef} className="fixed top-0 left-0 w-full h-full pointer-events-none" />;
};

export default BackgroundEffect;
