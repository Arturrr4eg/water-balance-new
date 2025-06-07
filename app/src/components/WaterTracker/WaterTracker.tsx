import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import React from 'react';
import blackSvg from '../../assets/svg/black.svg';
import filledSvg from '../../assets/svg/filled.svg';
import { Statistics } from '../Statistics/Statistics';
import { MobileMenu } from '../MobileMenu/MobileMenu';
import { Help } from '../Help/Help';
import { useWaterProgress } from '../../hooks/useWaterProgress';
import styles from './WaterTracker.module.scss';

interface WaterTrackerMethods {
  addWater: (quantity?: number) => void;
  removeWater: (quantity?: number) => void;
  setGoal: (glasses: number) => void;
  subscribeToChanges: (callback: (state: { current: number; goal: number }) => void) => void;
}

export const WaterTracker = forwardRef<WaterTrackerMethods>((_, ref) => {
  const {
    dailyGoal,
    currentGlasses,
    statistics,
    isLoading,
    updateProgress,
    updateGoal,
    updateHistoricalProgress
  } = useWaterProgress(15);

  const [glassesToAdd, setGlassesToAdd] = useState(1);
  const [newGoal, setNewGoal] = useState(dailyGoal);

  // Синхронизируем newGoal с dailyGoal при загрузке и изменении цели
  useEffect(() => {
    console.log('useEffect: dailyGoal изменился на:', dailyGoal);
    setNewGoal(dailyGoal);
  }, [dailyGoal]);

  const fillPercentage = Math.min((currentGlasses / dailyGoal) * 100, 100);

  useImperativeHandle(ref, () => ({
    addWater: (quantity?: number) => {
      console.log('WaterTracker: addWater вызван с количеством:', quantity);
      const glassesToUpdate = quantity ?? glassesToAdd;
      console.log('WaterTracker: будет добавлено стаканов:', glassesToUpdate);

      if (!isNaN(glassesToUpdate) && glassesToUpdate > 0) {
        const newTotal = Math.min(currentGlasses + glassesToUpdate, dailyGoal);
        console.log('WaterTracker: обновляем прогресс до:', newTotal);
        updateProgress(newTotal);
      } else {
        console.log('WaterTracker: некорректное количество стаканов');
      }
    },
    removeWater: (quantity?: number) => {
      console.log('WaterTracker: removeWater вызван с количеством:', quantity);
      const glassesToUpdate = quantity ?? glassesToAdd;
      console.log('WaterTracker: будет удалено стаканов:', glassesToUpdate);

      if (!isNaN(glassesToUpdate) && glassesToUpdate > 0) {
        const newTotal = Math.max(currentGlasses - glassesToUpdate, 0);
        console.log('WaterTracker: обновляем прогресс до:', newTotal);
        updateProgress(newTotal);
      } else {
        console.log('WaterTracker: некорректное количество стаканов');
      }
    },
    setGoal: (glasses: number) => {
      console.log('setGoal вызван с параметром:', glasses);
      const newGoalValue = Number(glasses);
      console.log('setGoal: преобразованное значение:', newGoalValue);
      if (!isNaN(newGoalValue) && newGoalValue > 0) {
        console.log('setGoal: вызываем updateGoal с:', newGoalValue);
        updateGoal(newGoalValue);
      }
    },
    subscribeToChanges: (callback) => {
      callback({ current: currentGlasses, goal: dailyGoal });
    }
  }), [currentGlasses, dailyGoal, glassesToAdd, updateProgress, updateGoal]);

  const handleGoalChange = () => {
    console.log('handleGoalChange: текущее значение newGoal:', newGoal);
    if (newGoal > 0) {
      console.log('handleGoalChange: вызываем updateGoal с:', newGoal);
      updateGoal(newGoal);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidePanel}>
        <Statistics
          items={statistics}
          onUpdateProgress={updateHistoricalProgress}
        />
      </div>

      <div className={styles.mainContent}>
        <div
          className={styles.svgContainer}
          style={{ '--fill-percentage': `${100 - fillPercentage}%` } as React.CSSProperties}
        >
          <img src={blackSvg} alt="Empty state" />
          <img src={filledSvg} alt="Filled state" className={styles.filledSvg} />
        </div>

        <div className={styles.controls}>
          <div className={styles.inputGroup}>
            <input
              type="number"
              min="1"
              value={newGoal}
              onChange={(e) => setNewGoal(Math.max(1, parseInt(e.target.value) || 1))}
              placeholder="Дневная цель"
              className={styles.input}
            />
            <button onClick={handleGoalChange} className={`${styles.button} ${styles.addButton}`}>
              Изменить цель
            </button>
          </div>

          <div className={styles.stats}>
            <p>Дневная цель: {dailyGoal} стаканов</p>
            <p>Выпито сегодня: {currentGlasses} стаканов</p>
            <p>Прогресс: {Math.round(fillPercentage)}%</p>
          </div>

          <div className={styles.inputGroup}>
            <input
              type="number"
              min="1"
              max={dailyGoal - currentGlasses}
              value={glassesToAdd}
              onChange={(e) => setGlassesToAdd(Math.max(1, parseInt(e.target.value) || 0))}
              className={styles.input}
            />
            <div className={styles.buttonGroup}>
              <button
                onClick={() => updateProgress(Math.min(currentGlasses + glassesToAdd, dailyGoal))}
                className={`${styles.button} ${styles.addButton}`}
                disabled={currentGlasses >= dailyGoal}
              >
                Добавить стаканы
              </button>
              <button
                onClick={() => updateProgress(Math.max(currentGlasses - glassesToAdd, 0))}
                className={`${styles.button} ${styles.removeButton}`}
                disabled={currentGlasses === 0}
              >
                Убрать стаканы
              </button>
            </div>
          </div>
        </div>

        <MobileMenu
          statistics={statistics}
          onUpdateProgress={updateHistoricalProgress}
        />
      </div>

      <div className={styles.sidePanel}>
        <Help />
      </div>
    </div>
  );
});
