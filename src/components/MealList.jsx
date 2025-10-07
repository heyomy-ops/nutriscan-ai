import React from 'react';
import { XIcon } from './Icons';

const MealList = ({ meals, onRemove }) => (
    <div className="w-full mt-8 space-y-4">
        <h2 className="text-2xl font-bold text-slate-200">Today's Meals</h2>
        {meals.length === 0 ? (
            <p className="text-center text-slate-400 py-4">No meals logged yet. Add one to get started!</p>
        ) : (
            <ul className="space-y-3">
                {meals.map((meal) => (
                    <li key={meal.id} className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700 hover:bg-slate-700/50 transition-colors animate-fade-in-up">
                        <div className="flex items-center space-x-4">
                             {meal.image && <img src={meal.image} alt={meal.name} className="w-16 h-16 object-cover rounded-lg" />}
                            <div>
                                <p className="font-semibold text-slate-100 capitalize">{meal.name}</p>
                                <p className="text-sm text-slate-400">{meal.calories} kcal</p>
                            </div>
                        </div>
                        <button onClick={() => onRemove(meal)} className="p-2 text-slate-500 rounded-full hover:bg-red-500/10 hover:text-red-400 transition-colors">
                            <XIcon />
                        </button>
                    </li>
                ))}
            </ul>
        )}
    </div>
);

export default MealList;