import React from 'react';

const MonthlyCheckInModal = ({ isOpen, onClose, onUpdate, surveyHistory }) => {
    const [newWeight, setNewWeight] = React.useState(surveyHistory?.data?.weight || 0);
    const [recalculated, setRecalculated] = React.useState(null);
    
    React.useEffect(() => {
        if (surveyHistory?.data?.weight) {
            setNewWeight(surveyHistory.data.weight);
        }
    }, [surveyHistory]);

    if (!isOpen) return null;

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

    const calculatePredictedWeight = () => {
        const { data } = surveyHistory;
        const maintenance = calculateMaintenanceCalories(data);
        const goal = calculateFinalGoal(data);
        const dailyDelta = goal - maintenance;
        const weightChangePerDay = dailyDelta / 7700;
        return (data.weight + (weightChangePerDay * 30)).toFixed(1);
    };

    const handleRecalculate = () => {
        const updatedSurveyData = { ...surveyHistory.data, weight: newWeight };
        const newMaintenance = calculateMaintenanceCalories(updatedSurveyData);
        const newGoal = calculateFinalGoal(updatedSurveyData);
        setRecalculated({ goal: newGoal, maintenance: newMaintenance });
    };

    const handleUpdatePlan = () => {
        onUpdate({
            ...recalculated,
            newWeight: newWeight,
        });
        onClose();
    };
    
    const predictedWeight = calculatePredictedWeight();

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 text-slate-200 rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 ease-out scale-95 opacity-0 animate-fade-in-scale">
                <h2 className="text-3xl font-bold text-center text-slate-100 mb-4">Monthly Check-in!</h2>
                <p className="text-center text-slate-400 mb-6">It's been a month! Let's update your plan based on your progress.</p>
                
                <div className="text-center bg-slate-700/50 p-4 rounded-lg mb-6">
                    <p className="text-slate-300">Based on your plan, we predicted you would be around:</p>
                    <p className="text-2xl font-bold text-blue-400">{predictedWeight} kg</p>
                </div>

                <div className="space-y-4">
                    <label className="block text-lg font-semibold text-center">What is your current weight? (kg)</label>
                    <input 
                        type="number"
                        value={newWeight}
                        onChange={e => setNewWeight(parseInt(e.target.value) || 0)}
                        className="w-full mt-1 p-3 text-center text-xl bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-blue-500 outline-none"
                    />
                    <button onClick={handleRecalculate} className="w-full p-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-colors">
                        Recalculate My Goal
                    </button>
                </div>

                {recalculated && (
                    <div className="mt-6 text-center animate-fade-in-up">
                        <h3 className="text-xl font-bold mb-4">Your New Recommended Plan</h3>
                        <div className="bg-blue-900/50 p-4 rounded-xl mb-6">
                            <p className="text-lg">New Daily Intake:</p>
                            <span className="text-4xl font-extrabold text-blue-400">{recalculated.goal}</span>
                            <span className="text-xl text-slate-300"> kcal</span>
                        </div>
                        <button onClick={handleUpdatePlan} className="w-full p-4 bg-blue-600 text-white rounded-lg text-xl font-bold hover:bg-blue-500 transition-transform transform hover:scale-105">
                            Update My Plan
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MonthlyCheckInModal;