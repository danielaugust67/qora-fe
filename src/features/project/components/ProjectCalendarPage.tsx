import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { sprintApi } from '@/features/sprint/api/sprintApi';
import { ProjectChrome } from './ProjectChrome';

export const ProjectCalendarPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: sprints = [] } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => sprintApi.getSprints(projectId!),
    enabled: !!projectId,
  });

  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date());

  const getSprintsForDay = (day: number) => {
    const checkDate = new Date(year, month, day, 12, 0, 0).getTime();
    return sprints.filter((s) => {
      const start = new Date(s.start_date || '').getTime();
      const end = new Date(s.end_date || '').getTime();
      return checkDate >= start && checkDate <= end;
    });
  };

  const isToday = (day: number) => {
    const todayDate = new Date();
    return todayDate.getDate() === day && todayDate.getMonth() === month && todayDate.getFullYear() === year;
  };

  return (
    <ProjectChrome projectId={projectId!}>
      <div className="flex h-[calc(100vh-100px)] flex-col bg-white">
        <div className="flex items-center justify-between border-b border-[#dfe1e6] px-8 py-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold text-[#172b4d]">
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center overflow-hidden rounded border border-[#dfe1e6]">
              <button onClick={prevMonth} className="px-3 py-1 hover:bg-[#f1f2f4] text-[#44546f]">‹</button>
              <button onClick={today} className="border-l border-r border-[#dfe1e6] px-4 py-1 text-sm font-medium hover:bg-[#f1f2f4]">Today</button>
              <button onClick={nextMonth} className="px-3 py-1 hover:bg-[#f1f2f4] text-[#44546f]">›</button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-1 flex-col overflow-auto px-8 py-4">
          <div className="grid grid-cols-7 border-b border-[#dfe1e6]">
            {dayNames.map((day) => (
              <div key={day} className="py-2 text-center text-xs font-semibold uppercase text-[#626f86]">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid flex-1 grid-cols-7 auto-rows-[minmax(120px,1fr)] border-l border-[#dfe1e6]">
            {blanks.map((blank) => (
              <div key={`blank-${blank}`} className="border-b border-r border-[#dfe1e6] bg-[#f7f8f9]/50" />
            ))}
            
            {days.map((day) => {
              const daySprints = getSprintsForDay(day);
              const todayClass = isToday(day) ? "bg-primary text-white" : "text-[#172b4d]";
              
              return (
                <div key={`day-${day}`} className="border-b border-r border-[#dfe1e6] p-2 hover:bg-[#f7f8f9]/50">
                  <div className={`mb-1 mx-auto flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${todayClass}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {daySprints.map((sprint) => (
                      <div 
                        key={sprint.id} 
                        className="truncate rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20"
                        title={sprint.name}
                      >
                        {sprint.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ProjectChrome>
  );
};
