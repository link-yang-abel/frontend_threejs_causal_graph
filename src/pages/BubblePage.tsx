import { BubbleCanvas } from '@/components/BubbleCanvas';

export function BubblePage() {
  return (
    <div className="relative w-full h-full">
      <BubbleCanvas showIcons={true} showScores={true} />
    </div>
  );
} 