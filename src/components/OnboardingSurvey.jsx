import React from 'react';

const OnboardingSurvey = ({ onComplete }) => {
    const [step, setStep] = React.useState(0);
    const [surveyData, setSurveyData] = React.useState({
        goal: 'lose',
        gender: 'male',
        age: 25,
        weight: 70,
        height: 175,
        activityLevel: 'sedentary',
        targetWeight: 65,
    });
    
    const totalSteps = 7;

    const handleNext = () => setStep(s => Math.min(s + 1, totalSteps - 1));
    const handleBack = () => setStep(s => Math.max(s - 1, 0));
    const handleDataChange = (key, value) => setSurveyData(prev => ({ ...prev, [key]: value }));

    const calculateBMR = (data) => {
        const { gender, weight, height, age } = data;
        if (gender === 'male') return 10 * weight + 6.25 * height - 5 * age + 5;
        return 10 * weight + 6.25 * height - 5 * age - 161;
    };
    
    const calculateMaintenanceCalories = (data) => {
        const bmr = calculateBMR(data);
        const activityMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
        return Math.round(bmr * activityMultipliers[data.activityLevel]);
    };
    
    const calculateFinalGoal = (data) => {
        const maintenance = calculateMaintenanceCalories(data);
        switch (data.goal) {
            case 'lose': return Math.round((maintenance - 500) / 10) * 10;
            case 'gain': return Math.round((maintenance + 300) / 10) * 10;
            default: return Math.round(maintenance / 10) * 10;
        }
    };
    
    const handleFinish = () => {
        onComplete({ 
            goal: calculateFinalGoal(surveyData), 
            maintenance: calculateMaintenanceCalories(surveyData),
            initialSurvey: surveyData
        });
    };

    const renderStep = () => {
        switch (step) {
            case 0: // Goal
                return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-6">What's your primary goal?</h2>
                        <div className="space-y-3">
                            {['lose', 'maintain', 'gain'].map(g => (
                                <button key={g} onClick={() => { handleDataChange('goal', g); handleNext(); }} className={`w-full p-4 rounded-lg text-lg font-semibold transition-colors ${surveyData.goal === g ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                    {g.charAt(0).toUpperCase() + g.slice(1)} Weight
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 1: // Gender
                 return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-6">Which one are you?</h2>
                        <div className="grid grid-cols-2 gap-4">
                             <button onClick={() => { handleDataChange('gender', 'male'); handleNext(); }} className={`p-4 rounded-lg text-lg font-semibold transition-colors ${surveyData.gender === 'male' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>Male</button>
                             <button onClick={() => { handleDataChange('gender', 'female'); handleNext(); }} className={`p-4 rounded-lg text-lg font-semibold transition-colors ${surveyData.gender === 'female' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>Female</button>
                        </div>
                    </div>
                );
            case 2: // Age, Weight, Height
                return (
                     <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold mb-6">Tell us about yourself</h2>
                        <div>
                            <label className="block text-lg font-semibold">Age</label>
                            <input type="number" value={surveyData.age} onChange={e => handleDataChange('age', parseInt(e.target.value) || 0)} className="w-full mt-1 p-3 text-center text-xl bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-blue-500 outline-none"/>
                        </div>
                         <div>
                            <label className="block text-lg font-semibold">Weight (kg)</label>
                            <input type="number" value={surveyData.weight} onChange={e => handleDataChange('weight', parseInt(e.target.value) || 0)} className="w-full mt-1 p-3 text-center text-xl bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-blue-500 outline-none"/>
                        </div>
                         <div>
                            <label className="block text-lg font-semibold">Height (cm)</label>
                            <input type="number" value={surveyData.height} onChange={e => handleDataChange('height', parseInt(e.target.value) || 0)} className="w-full mt-1 p-3 text-center text-xl bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-blue-500 outline-none"/>
                        </div>
                    </div>
                );
            case 3: // Target Weight
                 return (
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold mb-6">What's your target weight?</h2>
                        <div>
                            <label className="block text-lg font-semibold">Target Weight (kg)</label>
                            <input
                                type="number"
                                value={surveyData.targetWeight}
                                onChange={e => handleDataChange('targetWeight', parseInt(e.target.value) || 0)}
                                className="w-full mt-1 p-3 text-center text-xl bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-blue-500 outline-none"
                            />
                        </div>
                        <p className="text-sm text-slate-400 pt-2">
                            Current weight: {surveyData.weight} kg.
                        </p>
                    </div>
                );
            case 4: // Activity Level
                 return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-6">How active are you?</h2>
                        <div className="space-y-3">
                             {[{id: 'sedentary', label: 'Sedentary (little or no exercise)'}, {id: 'light', label:'Light (exercise 1-3 days/week)'}, {id: 'moderate', label: 'Moderate (exercise 3-5 days/week)'}, {id: 'active', label: 'Active (exercise 6-7 days/week)'}].map(level => (
                                <button key={level.id} onClick={() => { handleDataChange('activityLevel', level.id); handleNext(); }} className={`w-full p-4 rounded-lg text-lg font-semibold transition-colors text-left ${surveyData.activityLevel === level.id ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                    {level.label}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 5: // Summary & Projection
                const goal = calculateFinalGoal(surveyData);
                const maintenance = calculateMaintenanceCalories(surveyData);
                const dailyDelta = goal - maintenance;
                const weightToChange = surveyData.weight - surveyData.targetWeight;
                const daysToGoal = Math.abs(Math.round((weightToChange * 7700) / dailyDelta));
                const weeksToGoal = Math.round(daysToGoal / 7);

                const weightChangePerDay = dailyDelta / 7700; // in kg

                const projections = [
                    { label: 'Now', weight: parseFloat(surveyData.weight) },
                    { label: '1 Month', weight: parseFloat(surveyData.weight) + (weightChangePerDay * 30) },
                    { label: '2 Months', weight: parseFloat(surveyData.weight) + (weightChangePerDay * 60) },
                    { label: '3 Months', weight: parseFloat(surveyData.weight) + (weightChangePerDay * 90) },
                ];
                
                return (
                     <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Your Personal Plan</h2>
                        <div className="bg-blue-900/50 p-4 rounded-xl mb-6">
                            <p className="text-lg">Recommended Daily Intake:</p>
                            <span className="text-4xl font-extrabold text-blue-400">{goal}</span>
                            <span className="text-xl text-slate-300"> kcal</span>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-4">Your Projected Journey</h3>
                        {isFinite(weeksToGoal) && weeksToGoal > 0 ? (
                             <p className="text-md text-slate-300 mb-6">
                                You could reach your goal of <strong>{surveyData.targetWeight} kg</strong> in approximately <strong>{weeksToGoal} weeks</strong>.
                            </p>
                        ) : (
                            <p className="text-md text-slate-300 mb-6">
                                You've set a maintenance goal. Stick to this calorie target to keep your current weight.
                            </p>
                        )}

                        <div className="w-full">
                            <div className="relative h-1 bg-slate-700 rounded-full">
                                <div className="absolute w-full -top-2.5 flex justify-between">
                                    {projections.map((p, i) => (
                                         <div key={i} className="w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-slate-800 transform -translate-x-1/2"></div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-between mt-4 text-sm font-semibold">
                                {projections.map((p, i) => (
                                    <div key={i} className="text-center w-1/4">
                                        <p>{p.label}</p>
                                        <p className="text-blue-400">{p.weight.toFixed(1)} kg</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
             case 6: // Final Confirmation
                 return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-6">Ready to Start?</h2>
                        <p className="text-lg mb-8">Let's begin your journey to a healthier you!</p>
                        <button onClick={handleFinish} className="w-full p-4 bg-blue-600 text-white rounded-lg text-xl font-bold hover:bg-blue-500 transition-transform transform hover:scale-105">
                            Let's Go!
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-slate-900 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 text-slate-200 rounded-2xl shadow-2xl w-full max-w-md mx-auto relative overflow-hidden">
                <div className="p-2">
                    <div className="flex items-center gap-2 mb-4">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div key={i} className="flex-1 h-1 rounded-full bg-slate-700">
                                <div
                                    className="h-1 rounded-full bg-blue-500 transition-all duration-300"
                                    style={{ width: i < step ? '100%' : i === step ? '50%' : '0%' }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-8 min-h-[450px] flex flex-col justify-center">
                    {renderStep()}
                </div>
                
                <div className="p-4 flex justify-between items-center">
                     <button onClick={handleBack} disabled={step === 0} className="px-6 py-2 rounded-lg font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">Back</button>
                     {step < totalSteps - 1 && <button onClick={handleNext} className="px-6 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-500">Next</button>}
                </div>
            </div>
        </div>
    );
};

export default OnboardingSurvey;