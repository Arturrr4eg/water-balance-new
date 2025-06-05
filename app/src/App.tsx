import { useRef, useEffect, useState } from 'react';
import { WaterTracker } from './components/WaterTracker/WaterTracker';
import { SberAssistant } from './components/SberAssistant';
import styles from './App.module.scss';

interface WaterTrackerMethods {
  addWater: (quantity?: number) => void;
  removeWater: (quanity?: number) => void;
  setGoal: (glasses: number) => void;
  subscribeToChanges: (callback: (state: { current: number; goal: number }) => void) => void;
}

export const App = () => {
  const waterTrackerRef = useRef<WaterTrackerMethods>(null);
  const [currentGlasses, setCurrentGlasses] = useState(0);
  const [goalGlasses, setGoalGlasses] = useState(8);

  useEffect(() => {
    if (waterTrackerRef.current) {
      // Подписываемся на изменения в WaterTracker
      waterTrackerRef.current.subscribeToChanges((state) => {
        setCurrentGlasses(state.current);
        setGoalGlasses(state.goal);
      });
    }
  }, []);

  const handleAddWater = (quantity?: number) => {
    waterTrackerRef.current?.addWater(quantity);
  };

  const handleRemoveWater = (quantity?: number) => {
    waterTrackerRef.current?.removeWater(quantity);
  };

  const handleSetGoal = (glasses: number) => {
    console.log('App.handleSetGoal вызван с:', glasses);
    waterTrackerRef.current?.setGoal(glasses);
  };

  return (
    <>
      <SberAssistant
        currentGlasses={currentGlasses}
        goalGlasses={goalGlasses}
        onAddWater={handleAddWater}
        onRemoveWater={handleRemoveWater}
        onSetGoal={handleSetGoal}
      />
      <div className={styles.app}>
        <WaterTracker ref={waterTrackerRef} />
      </div>
    </>
  );
};
