
import { Character } from "../Character";
import { AttackParticle } from "../AttackParticle";

interface BattleCharactersProps {
  leftIsDamaged: boolean;
  rightIsDamaged: boolean;
  leftIsAttacking: boolean;
  rightIsAttacking: boolean;
}

export const BattleCharacters = ({
  leftIsDamaged,
  rightIsDamaged,
  leftIsAttacking,
  rightIsAttacking
}: BattleCharactersProps) => {
  return (
    <div className="flex-1 flex justify-between items-center px-4 md:px-8">
      <div className="relative flex flex-col items-center gap-2">
        <Character 
          isLeft={true} 
          isDamaged={leftIsDamaged} 
          modelUrl="/models/battlearena.glb"
        />
        {leftIsAttacking && <AttackParticle isLeft={true} />}
      </div>
      <div className="relative flex items-center">
        <Character 
          isLeft={false} 
          isDamaged={rightIsDamaged}
          modelUrl="/models/battlearena.glb"
        />
        {rightIsAttacking && <AttackParticle isLeft={false} />}
      </div>
    </div>
  );
};
