import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import React from 'react';
import blackSvg from '../../assets/svg/black.svg';
import filledSvg from '../../assets/svg/filled.svg';
import { Statistics } from '../Statistics/Statistics';
import { MobileMenu } from '../MobileMenu/MobileMenu';
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
        <div className={styles.helpSection}>
          <h2>Справка</h2>
          <div className={styles.helpContent}>
            <h3>Нормы потребления воды</h3>
            <p>Рекомендуемая норма потребления воды зависит от нескольких факторов:</p>
            <ul>
              <li>30-35 мл воды на 1 кг веса тела</li>
              <li>При физических нагрузках: дополнительно 500-800 мл</li>
              <li>В жаркую погоду: дополнительно 500-1000 мл</li>
            </ul>

            <p className={styles.warning}>
              Внимание: Чрезмерное потребление воды (более 3 литров в короткий промежуток времени) может быть опасно для здоровья!
            </p>

            <h3>Рекомендации по потреблению</h3>
            <ul>
              <li>Начинайте день со стакана воды</li>
              <li>Пейте воду между приемами пищи</li>
              <li>Распределяйте потребление равномерно в течение дня</li>
              <li>Последний стакан воды - за 2 часа до сна</li>
            </ul>

            <h3>Как использовать приложение</h3>
            <ul>
              <li>Установите дневную цель (рекомендуется 8-12 стаканов, где 1 стакан = 250 мл)</li>
              <li>Добавляйте выпитые стаканы воды через интерфейс или голосом</li>
              <li>Следите за прогрессом через анимированную визуализацию</li>
              <li>Просматривайте историю в разделе статистики</li>
            </ul>

            <h3>Голосовые команды</h3>
            <ul>
              <li><strong>Добавление воды:</strong> "Добавь три стакана", "Выпил два стакана", "Налей четыре стакана воды"</li>
              <li><strong>Удаление воды:</strong> "Удали два стакана", "Убери три стакана воды"</li>
              <li><strong>Установка цели:</strong> "Установи цель восемь стаканов", "Задай норму шесть стаканов"</li>
              <li>Голосовые команды принимают числа от 1 до 50 как цифрами, так и словами</li>
              <li>Примеры слов: "один", "два", "пять", "двадцать пять" и т.д.</li>
            </ul>

            <h3>Дополнительные возможности</h3>
            <ul>
              <li>Редактирование количества выпитой воды за прошедшие дни в разделе статистики</li>
              <li>Визуальный прогресс-бар для отслеживания достижения дневной цели</li>
              <li>Мотивационные сообщения, зависящие от прогресса</li>
            </ul>

            <h3>Признаки недостаточного потребления воды</h3>
            <ul>
              <li>Темный цвет мочи</li>
              <li>Сухость во рту</li>
              <li>Головная боль</li>
              <li>Усталость</li>
              <li>Снижение концентрации</li>
            </ul>

            <p>Помните: вода - основа здоровья! Регулярное потребление воды помогает:</p>
            <ul>
              <li>Улучшить обмен веществ</li>
              <li>Поддерживать работу мозга</li>
              <li>Сохранять здоровье кожи</li>
              <li>Выводить токсины</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});
