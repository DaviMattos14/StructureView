import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

const Controls = ({ 
    isPlaying, 
    onPlayPause, 
    onStepForward, 
    onStepBackward, 
    onReset, 
    speed, 
    setSpeed 
}) => {
  
  return (
    <div style={{ 
        height: '70px', 
        background: 'white', 
        borderTop: '1px solid #e2e8f0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 2rem',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.03)'
    }}>
        {/* Esquerda: Velocidade */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#475569' }}>Velocidade</span>
            <input 
                type="range" 
                min="100" max="2000" step="100"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                style={{ width: '120px', accentColor: '#2563eb' }}
            />
        </div>

        {/* Centro: Playback */}
        <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onStepBackward} className="control-btn" title="Voltar">
                <SkipBack size={20} />
            </button>
            
            <button onClick={onPlayPause} className="control-btn primary" style={{ width: '50px' }}>
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <button onClick={onStepForward} className="control-btn" title="Avançar">
                <SkipForward size={20} />
            </button>
        </div>

        {/* Direita: Reset */}
        <button onClick={onReset} className="control-btn" title="Resetar">
            <RotateCcw size={18} style={{ marginRight: '5px' }}/> 
            Resetar
        </button>

        <style>{`
            .control-btn {
                display: flex; align-items: center; justify-content: center;
                background: #f1f5f9; border: 1px solid #cbd5e1;
                padding: 8px 12px; borderRadius: 6px; cursor: pointer;
                color: #475569; transition: all 0.2s;
            }
            .control-btn:hover { background: #e2e8f0; color: #1e293b; }
            .control-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            .control-btn.primary { background: #2563eb; color: white; border: none; }
            .control-btn.primary:hover { background: #1d4ed8; }
        `}</style>
    </div>
  );
};

export default Controls;