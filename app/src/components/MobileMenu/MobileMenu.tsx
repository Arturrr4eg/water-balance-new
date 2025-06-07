import React, { useState } from 'react';
import styles from './MobileMenu.module.scss';
import { Statistics } from '../Statistics/Statistics';
import { DailyProgress } from '../../types/statistics';

interface MobileMenuProps {
  statistics: DailyProgress[];
  onUpdateProgress?: (date: string, glasses: number) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ statistics, onUpdateProgress }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'help'>('stats');

  return (
    <div className={styles.mobileMenu}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'stats' ? styles.active : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Статистика
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'help' ? styles.active : ''}`}
          onClick={() => setActiveTab('help')}
        >
          Справка
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'stats' ? (
          <Statistics items={statistics} onUpdateProgress={onUpdateProgress} />
        ) : (
          <div className={styles.help}>
            <h3>Нормы потребления воды</h3>
            <p>Рекомендуемая норма потребления воды зависит от нескольких факторов:</p>
            <ul>
              <li>30-35 мл воды на 1 кг веса тела</li>
              <li>При физических нагрузках: дополнительно 500-800 мл</li>
              <li>В жаркую погоду: дополнительно 500-1000 мл</li>
            </ul>

            <div className={styles.warning}>
              Внимание: Чрезмерное потребление воды может быть опасно для здоровья!
            </div>

            <h3>Рекомендации</h3>
            <ul>
              <li>Начинайте день со стакана воды</li>
              <li>Пейте воду между приемами пищи</li>
              <li>Распределяйте потребление равномерно</li>
              <li>Последний стакан - за 2 часа до сна</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
