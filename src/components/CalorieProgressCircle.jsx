import React from 'react';

const CalorieProgressCircle = ({ totalCalories, dailyGoal, onGoalChange }) => {
    const circumference = 2 * Math.PI * 90;
    const progress = dailyGoal > 0 ? Math.min(totalCalories / dailyGoal, 1) : 0;
    const offset = circumference * (1 - progress);
    
    const handleGoalClick = () => {
        const newGoal = parseInt(prompt("Set your new daily calorie goal:", dailyGoal), 10);
        if (!isNaN(newGoal) && newGoal > 0) onGoalChange(newGoal);
    };

    return (
        <div className="relative flex items-center justify-center w-64 h-64">
            <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="128" cy="128" r="90" strokeWidth="20" className="text-slate-700" fill="transparent" />
                <circle
                    cx="128"
                    cy="128"
                    r="90"
                    strokeWidth="20"
                    className="text-blue-500 transition-all duration-1000 ease-out"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex flex-col items-center text-center">
                <span className="text-5xl font-bold text-slate-100">{totalCalories}</span>
                <span 
                    className="text-lg text-slate-400 hover:text-blue-400 cursor-pointer"
                    onClick={handleGoalClick}
                    title="Click to change goal"
                >
                    / {dailyGoal} kcal
                </span>
            </div>
        </div>
    );
};

export default CalorieProgressCircle;