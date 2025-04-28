
import { useEffect, useRef } from 'react';
import p5 from 'p5';

const BackgroundEffect = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      const particles: { x: number; y: number; speed: number }[] = [];
      const particleCount = 50;
      const mouseInfluenceRadius = 200; // Radius of mouse influence
      const maxSpeed = 2;
      let mouseX = p.windowWidth / 2;
      let mouseY = p.windowHeight / 2;

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
        
        // Update mouse position
        mouseX = p.mouseX;
        mouseY = p.mouseY;
        
        // Draw and update particles
        particles.forEach((particle, i) => {
          // Calculate distance to mouse
          const dx = mouseX - particle.x;
          const dy = mouseY - particle.y;
          const distance = p.sqrt(dx * dx + dy * dy);
          
          // Particle color based on distance to mouse
          const alpha = p.map(distance, 0, mouseInfluenceRadius, 150, 50);
          p.stroke(155, 92, 246, alpha);
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
          
          // Move particle towards mouse if within influence radius
          if (distance < mouseInfluenceRadius) {
            const angle = p.atan2(dy, dx);
            const influenceFactor = p.map(distance, 0, mouseInfluenceRadius, 1, 0);
            particle.x += p.cos(angle) * particle.speed * influenceFactor;
            particle.y += p.sin(angle) * particle.speed * influenceFactor;
          } else {
            // Default upward movement when not influenced by mouse
            particle.y -= particle.speed * 0.5;
          }
          
          // Wrap particles around screen
          if (particle.y < 0) particle.y = p.height;
          if (particle.y > p.height) particle.y = 0;
          if (particle.x < 0) particle.x = p.width;
          if (particle.x > p.width) particle.x = 0;
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
