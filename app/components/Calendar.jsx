import React, { useState } from 'react';

export const Calendar = ({ plan, onDayClick, selectedDay }) => {
  const weeks = Math.ceil(plan.length / 7);
  const [hoveredDay, setHoveredDay] = useState(null);

  return (
    <div className="grid grid-cols-7 gap-2">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div key={day} className="text-center font-bold">{day}</div>
      ))}
      {Array.from({ length: weeks * 7 }).map((_, index) => {
        const day = plan[index];
        return (
          <div
            key={index}
            className={`aspect-square flex items-center justify-center relative ${
              day ? 'cursor-pointer hover:bg-base-200' : ''
            } ${selectedDay === day?.day ? ' text-primary-content' : ''}`}
            onClick={() => day && onDayClick(day.day)}
            onMouseEnter={() => day && setHoveredDay(day.day)}
            onMouseLeave={() => setHoveredDay(null)}
          >
            {day && (
              <>
                <div className="text-center">
                  <div>{day.day}</div>
                  <progress
                    className="progress progress-primary w-8 h-2"
                    value={day.tasks.filter((t) => t.completed).length}
                    max={day.tasks.length}
                  ></progress>
                </div>
                {hoveredDay === day.day && (
                  <div className="absolute top-full left-0 z-10 bg-base-100 shadow-xl p-2 rounded-lg w-48">
                    <h4 className="font-bold">Day {day.day}</h4>
                    <p>Tasks: {day.tasks.length}</p>
                    <p>Completed: {day.tasks.filter((t) => t.completed).length}</p>
                    {day.reflection && (
                      <>
                        <p className="mt-2 font-semibold">Reflection:</p>
                        <p className="text-sm">{day.reflection.slice(0, 50)}...</p>
                        <div className="rating rating-sm mt-1">
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
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
