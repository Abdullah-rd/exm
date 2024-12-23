'use client'

import React, { useEffect, useRef } from 'react';

export function PomodoroTimer({ onTimerComplete, selectedChapter, timerState, updateTimerState }) {
  const audioContextRef = useRef(null);
  const audioBufferRef = useRef(null);

  useEffect(() => {
    // Initialize AudioContext and load the bell sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioContext;

    fetch('/bell-sound.wav')
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        audioBufferRef.current = audioBuffer;
      })
      .catch(error => console.error('Error loading audio:', error));

    return () => {
      audioContext.close();
    };
  }, []);

  const playBellSound = () => {
    if (audioContextRef.current && audioBufferRef.current) {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(audioContextRef.current.destination);
      source.start();
    }
  };

  useEffect(() => {
    let interval = null;
    if (timerState.isActive) {
      interval = setInterval(() => {
        if (timerState.seconds > 0) {
          updateTimerState({
            ...timerState,
            seconds: timerState.seconds - 1
          });
        } else if (timerState.minutes > 0) {
          updateTimerState({
            ...timerState,
            minutes: timerState.minutes - 1,
            seconds: 59
          });
        } else {
          clearInterval(interval);
          updateTimerState({
            ...timerState,
            isActive: false
          });
          onTimerComplete(timerState.isBreak ? 5 : 25);
          playBellSound();
          if (!timerState.isBreak) {
            updateTimerState({
              minutes: 5,
              seconds: 0,
              isActive: false,
              isBreak: true
            });
          } else {
            updateTimerState({
              minutes: 25,
              seconds: 0,
              isActive: false,
              isBreak: false
            });
          }
        }
      }, 1000);
    } else if (!timerState.isActive && timerState.seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerState, updateTimerState, onTimerComplete]);

  const toggleTimer = () => {
    updateTimerState({
      ...timerState,
      isActive: !timerState.isActive
    });
  };

  const resetTimer = () => {
    updateTimerState({
      minutes: 0,
      seconds: 5,
      isActive: false,
      isBreak: false
    });
  };

  const skipBreak = () => {
    updateTimerState({
      minutes: 25,
      seconds: 0,
      isActive: false,
      isBreak: false
    });
  };

  const progress = ((timerState.isBreak ? 5 : 25) * 60 - (timerState.minutes * 60 + timerState.seconds)) / ((timerState.isBreak ? 5 : 25) * 60) * 100;

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Pomodoro Timer</h2>
        <p>Current Module: {selectedChapter}</p>
        <div className="text-4xl font-bold text-center my-4">
          {String(timerState.minutes).padStart(2, '0')}:{String(timerState.seconds).padStart(2, '0')}
        </div>
        <progress className="progress progress-primary w-full" value={progress} max="100"></progress>
        <div className="card-actions justify-center mt-4">
          <button className="btn btn-primary" onClick={toggleTimer}>
            {timerState.isActive ? 'Pause' : 'Start'}
          </button>
          <button className="btn btn-ghost" onClick={resetTimer}>
            Reset
          </button>
          {timerState.isBreak && (
            <button className="btn btn-secondary" onClick={skipBreak}>
              Skip Break
            </button>
          )}
        </div>
        <p className="text-center mt-2">{timerState.isBreak ? 'Break Time!' : 'Focus Time'}</p>
      </div>
    </div>
  );
}
