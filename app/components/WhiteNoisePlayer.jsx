'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

const audioTracks = [
  { title: 'Rain', src: '/musicAttachment/rain.mp3', image: '/musicAttachment/rain.jpg' },
  { title: 'White Noise', src: '/musicAttachment/white.mp3', image: '/musicAttachment/white.jpg' },
//   { title: 'Mountain Green', src: '/musicAttachment/green.mp3', image: '/musicAttachment/green.jpg' },

]

export function WhiteNoisePlayer() {
  const [currentTrack, setCurrentTrack] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [isLoaded, setIsLoaded] = useState(false)
  const audioContextRef = useRef(null)
  const audioBuffersRef = useRef([])
  const sourceNodeRef = useRef(null)
  const gainNodeRef = useRef(null)

  // Initialize audio context on first user interaction
  const initializeAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      gainNodeRef.current = audioContextRef.current.createGain()
      gainNodeRef.current.connect(audioContextRef.current.destination)
      
      // Load all audio tracks
      Promise.all(audioTracks.map((track, index) => 
        fetch(track.src)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.arrayBuffer();
          })
          .then(arrayBuffer => audioContextRef.current.decodeAudioData(arrayBuffer))
          .then(audioBuffer => {
            audioBuffersRef.current[index] = audioBuffer;
          })
      )).then(() => {
        setIsLoaded(true);
      }).catch(error => {
        console.error('Error loading audio:', error);
        alert('Error loading audio files. Please check the console for details.');
      });
    }
  }

  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  }, [])

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioContextRef.current.currentTime)
    }
  }, [volume])

  const playAudio = (trackIndex) => {
    if (!audioContextRef.current) {
      initializeAudioContext();
    }

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
    }

    if (audioContextRef.current && audioBuffersRef.current[trackIndex]) {
      sourceNodeRef.current = audioContextRef.current.createBufferSource()
      sourceNodeRef.current.buffer = audioBuffersRef.current[trackIndex]
      sourceNodeRef.current.connect(gainNodeRef.current)
      sourceNodeRef.current.loop = true
      sourceNodeRef.current.start()
      setIsPlaying(true)
    }
  }

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop()
      sourceNodeRef.current = null
      setIsPlaying(false)
    }
  }

  const handlePlayPause = () => {
    if (!audioContextRef.current) {
      initializeAudioContext();
    }
    
    if (isPlaying) {
      stopAudio()
    } else {
      playAudio(currentTrack)
    }
  }

  const handlePrevious = () => {
    const newTrack = currentTrack === 0 ? audioTracks.length - 1 : currentTrack - 1
    setCurrentTrack(newTrack)
    if (isPlaying) {
      stopAudio()
      playAudio(newTrack)
    }
  }

  const handleNext = () => {
    const newTrack = currentTrack === audioTracks.length - 1 ? 0 : currentTrack + 1
    setCurrentTrack(newTrack)
    if (isPlaying) {
      stopAudio()
      playAudio(newTrack)
    }
  }

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value))
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <figure className="px-10 pt-10">
        <Image
          src={audioTracks[currentTrack].image}
          alt={audioTracks[currentTrack].title}
          width={200}
          height={200}
          className="rounded-xl"
        />
      </figure>
      <div className="card-body items-center text-center">
        <h2 className="card-title">{audioTracks[currentTrack].title}</h2>
        <div className="card-actions flex flex-col items-center">
          <div className="flex items-center space-x-2 mb-4">
            <button className="btn btn-circle" onClick={handlePrevious}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="btn btn-circle btn-primary" onClick={handlePlayPause}>
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
            <button className="btn btn-circle" onClick={handleNext}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="range range-xs"
            />
          </div>
        </div>
      </div>
    </div>
  )
}