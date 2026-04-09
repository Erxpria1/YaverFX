"use client";

import { useEffect, useState } from "react";
import { getAppName, setAppName } from "../context/TimerContext";

interface Stats {
  focusTime: number;
  tasksDone: number;
  streak: number;
  points: number;
}

const POINTS_PER_LEVEL = 100;

export default function RewardSystem() {
  const [stats, setStats] = useState<Stats>({ focusTime: 0, tasksDone: 0, streak: 0, points: 0 });
  const [appName, setAppNameState] = useState(getAppName());
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState(appName);

  useEffect(() => {
    const update = () => {
      const stored = localStorage.getItem("yaverfx-stats");
      if (stored) setStats(JSON.parse(stored));
    };
    update();
    window.addEventListener("yaverfx-stats-update", update);
    
    const updateName = () => {
      setAppNameState(getAppName());
    };
    updateName();
    window.addEventListener("yaverfx-name-update", updateName);
    
    return () => {
      window.removeEventListener("yaverfx-stats-update", update);
      window.removeEventListener("yaverfx-name-update", updateName);
    };
  }, []);

  const handleNameSave = () => {
    if (tempName.trim()) {
      setAppName(tempName.trim());
    }
    setShowNameModal(false);
  };

  const level = Math.floor(stats.points / POINTS_PER_LEVEL) + 1;
  const progress = (stats.points % POINTS_PER_LEVEL);

  return (
    <>
      {/* Name Edit Button */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
        <button 
          onClick={() => { setTempName(appName); setShowNameModal(true); }}
          style={{ 
            background: 'var(--surface-light)', 
            padding: '8px 16px', 
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            color: 'var(--text-secondary)'
          }}
        >
          📝 İsim Değiştir
        </button>
      </div>

      <div className="reward-box animate-in">
        <div className="reward-top">
          <div className="reward-lvl">
            <span className="reward-val">{level}</span>
            <span className="reward-lbl">SEVİYE</span>
          </div>
          <div className="reward-pts">
            <span className="reward-val">{stats.points}</span>
            <span className="reward-lbl">TOPLAM PUAN</span>
          </div>
        </div>
        
        <div className="reward-bar">
          <div className="reward-fill" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="reward-stats">
          <div className="reward-stat">
            <span className="reward-icon">🔥</span>
            <div className="reward-num">{stats.streak}</div>
            <div className="reward-label">GÜN SERİSİ</div>
          </div>
          <div className="reward-stat">
            <span className="reward-icon">⏱️</span>
            <div className="reward-num">{Math.floor(stats.focusTime)}</div>
            <div className="reward-label">DAKİKA ODAK</div>
          </div>
          <div className="reward-stat">
            <span className="reward-icon">✅</span>
            <div className="reward-num">{stats.tasksDone}</div>
            <div className="reward-label">GÖREV BİTTİ</div>
          </div>
        </div>
      </div>

      {/* Name Edit Modal */}
      {showNameModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowNameModal(false)}
        >
          <div 
            style={{
              background: 'var(--surface)',
              border: 'var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              width: '100%',
              maxWidth: '320px'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>İsim Değiştir</h3>
            <input
              type="text"
              value={tempName}
              onChange={e => setTempName(e.target.value)}
              placeholder="Yeni isim..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg)',
                border: 'var(--border-light)',
                color: 'var(--text)',
                fontSize: '16px',
                marginBottom: '16px'
              }}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleNameSave()}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setShowNameModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface-light)',
                  color: 'var(--text-secondary)',
                  fontWeight: 'bold'
                }}
              >
                İptal
              </button>
              <button 
                onClick={handleNameSave}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent)',
                  color: 'var(--btn-text)',
                  fontWeight: 'bold'
                }}
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}