import React from 'react';
import { FireIcon } from './Icons';

const StreakCounter = ({ streakData }) => {
    const [currentStreak, setCurrentStreak] = React.useState(0);

    React.useEffect(() => {
        const today = new Date();
        let streak = 0;
        for (let i = 0; ; i++) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            if (streakData[dateKey]) {
                streak++;
            } else {
                if (i > 0) break;
            }
            if (i > 365 * 5) break; // Safety break
        }
        setCurrentStreak(streak);
    }, [streakData]);

    const todayCompleted = streakData[new Date().toISOString().split('T')[0]] || false;

    return (
        <div className="flex items-center gap-2">
            <FireIcon lit={todayCompleted} />
            <div className="flex items-center gap-1">
                 <span className="text-2xl font-bold text-slate-200">{currentStreak}</span>
                 <span className="text-sm font-semibold text-slate-400 leading-tight">day<br/>streak</span>
            </div>
        </div>
    );
};

export default StreakCounter;
