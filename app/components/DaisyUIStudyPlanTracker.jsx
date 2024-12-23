'use client'

import React, { useState, useEffect } from 'react'
import { studyPlan, milestones, daisyUIThemes, getSubjectColor } from '../Utils/studyPlanUtils'
import { useRouter } from 'next/navigation'
import { Calendar } from './Calendar'
import { PomodoroTimer } from './PomodoroTimer'
import { StudyStatistics } from './StudyStatistics'
// import { WhiteNoisePlayer } from './WhiteNoisePlayer'

export default function EnhancedStudyPlanTracker() {
  const [plan, setPlan] = useState(() => studyPlan.map(day => ({
    ...day,
    tasks: day.tasks.map(task => ({ ...task, completed: false })),
    reflection: null,
    rating: 0,
  })))
  
  const [theme, setTheme] = useState('light')
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [completedDay, setCompletedDay] = useState(0)
  const [showReflection, setShowReflection] = useState(false)
  const [reflection, setReflection] = useState('')
  const [rating, setRating] = useState(0)
  const [viewMode, setViewMode] = useState('list')
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState('')
  const [studySessions, setStudySessions] = useState([])
  const [timerState, setTimerState] = useState({
    minutes: 25,
    seconds: 0,
    isActive: false,
    isBreak: false,
  })

  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    
    const storedPlan = localStorage.getItem('enhancedStudyPlan')
    const storedTheme = localStorage.getItem('enhancedStudyPlanTheme') || 'light'
    const storedSessions = localStorage.getItem('studySessions')
    const storedTimerState = localStorage.getItem('timerState')
    
    if (storedPlan) {
      try {
        const parsedPlan = JSON.parse(storedPlan)
        if (Array.isArray(parsedPlan) && parsedPlan.length === studyPlan.length) {
          setPlan(parsedPlan)
        }
      } catch (error) {
        console.error('Error parsing stored plan:', error)
      }
    }
    
    if (storedSessions) {
      try {
        const parsedSessions = JSON.parse(storedSessions)
        if (Array.isArray(parsedSessions)) {
          setStudySessions(parsedSessions)
        }
      } catch (error) {
        console.error('Error parsing stored sessions:', error)
      }
    }
    
    if (storedTimerState) {
      try {
        const parsedTimerState = JSON.parse(storedTimerState)
        setTimerState(parsedTimerState)
      } catch (error) {
        console.error('Error parsing stored timer state:', error)
      }
    }
    
    setTheme(storedTheme)
    document.documentElement.setAttribute('data-theme', storedTheme)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('enhancedStudyPlan', JSON.stringify(plan))
      localStorage.setItem('studySessions', JSON.stringify(studySessions))
      localStorage.setItem('timerState', JSON.stringify(timerState))
    }
  }, [plan, studySessions, timerState, mounted])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('enhancedStudyPlanTheme', theme)
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme, mounted])

  const toggleTask = (dayIndex, taskIndex) => {
    setPlan(currentPlan => {
      const newPlan = [...currentPlan]
      newPlan[dayIndex] = {
        ...newPlan[dayIndex],
        tasks: [...newPlan[dayIndex].tasks]
      }
      
      if (taskIndex === -1) {
        const allCompleted = newPlan[dayIndex].tasks.every(task => task.completed)
        newPlan[dayIndex].tasks = newPlan[dayIndex].tasks.map(task => ({
          ...task,
          completed: !allCompleted
        }))
      } else {
        newPlan[dayIndex].tasks[taskIndex] = {
          ...newPlan[dayIndex].tasks[taskIndex],
          completed: !newPlan[dayIndex].tasks[taskIndex].completed
        }
      }

      if (newPlan[dayIndex].tasks.every(task => task.completed)) {
        setCompletedDay(dayIndex + 1)
        setShowReflection(true)
        celebrateCompletion(dayIndex)
      }

      return newPlan
    })
  }

  const getMilestone = (day) => {
    return milestones.find(milestone => milestone.day === day)
  }

  const getProgress = () => {
    const totalTasks = plan.reduce((acc, day) => acc + day.tasks.length, 0)
    const completedTasks = plan.reduce((acc, day) => acc + day.tasks.filter(task => task.completed).length, 0)
    return (completedTasks / totalTasks) * 100
  }

  const celebrateCompletion = (dayIndex) => {
    const card = document.querySelector(`[data-day="${dayIndex}"]`);
    if (card) {
      card.classList.add('celebrate');
      setTimeout(() => card.classList.remove('celebrate'), 1000);
    }
  }

  const submitReflection = () => {
    setPlan(currentPlan => {
      const newPlan = [...currentPlan]
      newPlan[completedDay - 1] = {
        ...newPlan[completedDay - 1],
        reflection,
        rating
      }
      return newPlan
    })
    setShowReflection(false)
    setShowModal(true)
  }

  const deleteReflection = (dayIndex) => {
    setPlan(currentPlan => {
      const newPlan = [...currentPlan]
      newPlan[dayIndex] = {
        ...newPlan[dayIndex],
        reflection: null,
        rating: 0
      }
      return newPlan
    })
  }

  const motivationalQuotes = [
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "The secret of getting ahead is getting started. - Mark Twain",
    "It always seems impossible until it's done. - Nelson Mandela",
    "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
    "The only limit to our realization of tomorrow will be our doubts of today. - Franklin D. Roosevelt",
    "Do what you can, with what you have, where you are. - Theodore Roosevelt",
    "Everything you've ever wanted is on the other side of fear. - George Addair",
    "Success is not how high you have climbed, but how you make a positive difference to the world. - Roy T. Bennett",
    "The way to get started is to quit talking and begin doing. - Walt Disney",
    "If you're going through hell, keep going. - Winston Churchill",
    "Strive not to be a success, but rather to be of value. - Albert Einstein",
    "I attribute my success to this: I never gave or took any excuse. - Florence Nightingale",
    "The mind is everything. What you think you become. - Buddha",
    "The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb",
    "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
    "Whether you think you can or you think you can't, you're right. - Henry Ford",
    "I am not a product of my circumstances. I am a product of my decisions. - Stephen Covey",
    "Every strike brings me closer to the next home run. - Babe Ruth",
    "I've missed more than 9000 shots in my career. I've lost almost 300 games. 26 times I've been trusted to take the game-winning shot and missed. I've failed over and over and over again in my life. And that is why I succeed. - Michael Jordan",
    "The only person you are destined to become is the person you decide to be. - Ralph Waldo Emerson",
    "Go confidently in the direction of your dreams. Live the life you have imagined. - Henry David Thoreau",
    "Few things can help an individual more than to place responsibility on him, and to let him know that you trust him. - Booker T. Washington",
    "Certain things catch your eye, but pursue only those that capture the heart. - Ancient Indian Proverb",
    "When everything seems to be going against you, remember that the airplane takes off against the wind, not with it. - Henry Ford",
    "Change your thoughts and you change your world. - Norman Vincent Peale",
    "Nothing is impossible, the word itself says 'I'm possible'! - Audrey Hepburn",
    "Don't wait for opportunity. Create it. - Anonymous",
    "The harder you work for something, the greater you'll feel when you achieve it. - Anonymous",
    "Success doesn't just find you. You have to go out and get it. - Anonymous",
    "The key to success is to focus on goals, not obstacles. - Anonymous",
    "Your only limit is your mind. - Anonymous",
    "Opportunities don't happen, you create them. - Chris Grosser",
    "Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful. - Albert Schweitzer",
    "Hardships often prepare ordinary people for an extraordinary destiny. - C.S. Lewis",
    "Dream big and dare to fail. - Norman Vaughan",
    "Success is walking from failure to failure with no loss of enthusiasm. - Winston Churchill",
    "Do not wait to strike till the iron is hot, but make it hot by striking. - William Butler Yeats"
  ];

  const getMotivationalMessage = () => {
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  };

  const filteredPlan = plan.filter(day => 
    day.tasks.some(task => 
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const handleDayClick = (day) => {
    setSelectedDay(day)
    setViewMode('list')
    setTimeout(() => {
      const dayElement = document.querySelector(`[data-day="${day - 1}"]`)
      if (dayElement) {
        dayElement.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  const handlePomodoroComplete = (duration) => {
    setStudySessions([...studySessions, { chapter: selectedChapter, duration, timestamp: Date.now() }])
  }

  const updateTimerState = (newState) => {
    setTimerState(newState)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <style jsx>{`
        @keyframes celebrate {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .celebrate {
          animation: celebrate 0.5s ease-in-out;
        }
      `}</style>
      <div className="navbar bg-base-100 rounded-box shadow-xl mb-4">
        <div className="flex-1">
          <span className="text-xl font-bold">20-Day Study Plan Tracker</span>
        </div>
        <div className="flex-none gap-2">
          <div className="form-control">
            <input
              type="text"
              placeholder="Search tasks"
              className="input input-bordered w-24 md:w-auto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="select select-bordered"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            {daisyUIThemes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <div className="btn-group">
            <button 
              className={`btn ${viewMode === 'list' ? 'btn-active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
            <button 
              className={`btn ${viewMode === 'calendar' ? 'btn-active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              Calendar
            </button>
            <button 
              className={`btn ${viewMode === 'pomodoro' ? 'btn-active' : ''}`}
              onClick={() => setViewMode('pomodoro')}
            >
              Pomodoro
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <progress className="progress progress-primary w-full" value={getProgress()} max="100"></progress>
        <p className="text-center mt-2">Overall Progress: {getProgress().toFixed(2)}%</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          {viewMode === 'list' && (
            <div className="grid gap-4">
              {filteredPlan.map((day, dayIndex) => (
                <div key={day.day} className="card bg-base-100 shadow-xl" data-day={dayIndex}>
                  <div className="card-body">
                    <h2 className="card-title flex justify-between items-center">
                      <span>Day {day.day}</span>
                      {getMilestone(day.day) && (
                        <span className="badge badge-lg badge-primary gap-2 p-4">
                          <span className="text-xl">🎉</span>
                          {getMilestone(day.day)?.description}
                        </span>
                      )}
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="table w-full">
                        <thead>
                          <tr>
                            <th style={{width: '20%'}}>Time</th>
                            <th style={{width: '60%'}}>Task</th>
                            <th style={{width: '20%'}}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {day.tasks.map((task, taskIndex) => (
                            <tr 
                              key={`${day.day}-${taskIndex}`}
                              className="hover cursor-pointer"
                              onClick={() => toggleTask(dayIndex, taskIndex)}
                            >
                              <td style={{width: '20%'}}>{task.time}</td>
                              <td 
                                style={{width: '60%', backgroundColor: getSubjectColor(task.description)}}
                                className={task.completed ? 'line-through' : ''}
                              >
                                {task.description}
                              </td>
                              <td style={{width: '20%'}}>
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  className="checkbox checkbox-primary"
                                  readOnly
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {day.reflection && (
                      <div className="mt-4">
                        <h3 className="font-bold">Reflection:</h3>
                        <p>{day.reflection}</p>
                        <div className="rating mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <input
                              key={star}
                              type="radio"
                              name={`rating-${day.day}`}
                              className="mask mask-star-2 bg-orange-400"
                              checked={day.rating === star}
                              readOnly
                            />
                          ))}
                        </div>
                        <button 
                          className="btn btn-xs btn-ghost opacity-15"
                          onClick={() => deleteReflection(dayIndex)}
                        >
                          X
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'calendar' && (
            <Calendar plan={plan} onDayClick={handleDayClick} selectedDay={selectedDay} />
          )}

          {viewMode === 'pomodoro' && (
            <StudyStatistics studySessions={studySessions} />
          )}
        </div>

        <div>
          <PomodoroTimer 
            onTimerComplete={handlePomodoroComplete} 
            selectedChapter={selectedChapter}
            timerState={timerState}
            updateTimerState={updateTimerState}
          />
          <select
            className="select select-bordered w-full mt-4"
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
          >
            <option value="">Select a module</option>
            {Array.from(new Set(plan.flatMap(day => day.tasks.map(task => task.description)))).map(chapter => (
              <option key={chapter} value={chapter}>{chapter}</option>
            ))}
          </select>
          <div className="mt-4">
            {/* <WhiteNoisePlayer /> */}
          </div>
        </div>
      </div>

      {showReflection && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Day {completedDay} Reflection</h3>
            <textarea
              className="textarea textarea-bordered w-full mt-4"
              placeholder="How did you feel about today's tasks? Any areas for improvement?"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
            ></textarea>
            <div className="rating mt-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <input
                  key={star}
                  type="radio"
                  name="rating-2"
                  className="mask mask-star-2 bg-orange-400"
                  checked={rating === star}
                  onChange={() => setRating(star)}
                />
              ))}
            </div>
            <div className="modal-action">
              <button className="btn btn-primary" onClick={submitReflection}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Congratulations!</h3>
            <p className="py-4">You've completed all tasks for Day {completedDay}!</p>
            <div className="divider"></div>
            <blockquote className="italic text-lg text-center">{getMotivationalMessage()}</blockquote>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

