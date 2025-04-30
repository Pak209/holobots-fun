
import { useEffect, useRef } from 'react';
import p5 from 'p5';

interface BackgroundEffectProps {
  width?: number;
  height?: number;
  particleCount?: number;
  particleSize?: number;
  particleColor?: string;
  backgroundColor?: string;
  particleSpeedMultiplier?: number;
}

export const BackgroundEffect = ({
  width = window.innerWidth,
  height = window.innerHeight,
  particleCount = 100,
  particleSize = 2,
  particleColor = '#ffffff',
  backgroundColor = '#000000',
  particleSpeedMultiplier = 1
}: BackgroundEffectProps) => {
  const sketchRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Only create the sketch when the container is available
    if (!sketchRef.current) return;
    
    // Create a new p5 instance
    const sketch = new p5((p) => {
      // Array to hold particles
      let particles: { x: number; y: number; vx: number; vy: number }[] = [];
      
      // Setup function runs once when the sketch starts
      p.setup = () => {
        p.createCanvas(width, height);
        p.frameRate(30);
        
        // Create initial particles
        for (let i = 0; i < particleCount; i++) {
          particles.push({
            x: p.random(width),
            y: p.random(height),
            vx: p.random(-1, 1) * particleSpeedMultiplier,
            vy: p.random(-1, 1) * particleSpeedMultiplier
          });
        }
      };
      
      // Draw function runs continuously
      p.draw = () => {
        p.background(backgroundColor);
        
        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
          let particle = particles[i];
          
          // Move particle
          particle.x += particle.vx;
          particle.y += particle.vy;
          
          // Bounce off edges
          if (particle.x < 0 || particle.x > width) particle.vx *= -1;
          if (particle.y < 0 || particle.y > height) particle.vy *= -1;
          
          // Draw particle
          p.fill(particleColor);
          p.noStroke();
          p.ellipse(particle.x, particle.y, particleSize);
          
          // Draw connections between close particles
          for (let j = i + 1; j < particles.length; j++) {
            let other = particles[j];
            let d = p.dist(particle.x, particle.y, other.x, other.y);
            
            if (d < 100) {
              p.stroke(particleColor);
              p.strokeWeight(0.5);
              p.line(particle.x, particle.y, other.x, other.y);
            }
          }
        }
      };
      
      // Window resize handler
      p.windowResized = () => {
        p.resizeCanvas(width, height);
      };
    }, sketchRef.current);
    
    // Clean up function
    return () => {
      sketch.remove();
    };
  }, [width, height, particleCount, particleSize, particleColor, backgroundColor, particleSpeedMultiplier]);
  
  return <div ref={sketchRef} className="absolute inset-0 -z-10" />;
};
