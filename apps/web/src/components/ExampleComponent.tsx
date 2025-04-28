import React from 'react';
import { Button } from '@ui/Button';
import { HolobotStats } from '@shared/holobot-types';

interface ExampleComponentProps {
  title: string;
  holobot?: HolobotStats;
}

export const ExampleComponent: React.FC<ExampleComponentProps> = ({ 
  title, 
  holobot 
}: ExampleComponentProps) => {
  const [isLoading, setIsLoading] = React.useState(false);
  
  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };
  
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      
      {holobot && (
        <div className="mb-4">
          <p>Holobot: {holobot.name}</p>
          <p>Level: {holobot.level}</p>
        </div>
      )}
      
      <div className="flex gap-2">
        <Button 
          variant="primary" 
          onClick={handleClick}
          isLoading={isLoading}
        >
          Primary Action
        </Button>
        
        <Button 
          variant="secondary"
        >
          Secondary Action
        </Button>
      </div>
    </div>
  );
}; 