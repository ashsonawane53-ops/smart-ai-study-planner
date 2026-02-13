const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Generate Questions
exports.generateQuestions = async (subject, topic, count = 5, difficulty = 'medium', academicLevel = 'Class 10') => {
    try {
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_openai_api_key_here')) {
            throw new Error('AI API Key not configured. Please add a valid OpenAI API Key to the .env file.');
        }

        const prompt = `
        You are an expert educator. Generate ${count} multiple-choice questions (MCQs) for a student at the following academic level: "${academicLevel}".
        Subject: "${subject}".
        Specific Topic: "${topic}".
        Difficulty: ${difficulty}.
        
        Requirements:
        1. Accuracy: Questions must be factually 100% correct and relevant to the academic level.
        2. Format: Return strictly valid JSON as an array of objects.
        3. Structure: 
           [
               {
                   "question": "clear and precise question text",
                   "options": ["Option A", "Option B", "Option C", "Option D"],
                   "correctAnswer": 0 // index of correct option
               }
           ]
        Do not include any markdown or extra text.
        `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a professional exam setter and study assistant." }, { role: "user", content: prompt }],
            model: "gpt-3.5-turbo",
        });

        const content = completion.choices[0].message.content.trim();
        const jsonString = content.replace(/^```json\n|\n```$/g, '');

        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error generating questions:', error);
        if (error.code === 'invalid_api_key') {
            throw new Error('Invalid OpenAI API Key. Please check the .env file.');
        }
        throw new Error(error.message || 'Failed to generate questions from AI');
    }
};

// Generate Study Plan
exports.generateStudyPlan = async (subjects, availableHours, examDate, academicLevel = 'Class 10') => {
    try {
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_openai_api_key_here')) {
            throw new Error('AI API Key not configured. Please add a valid OpenAI API Key to the .env file.');
        }

        const prompt = `
        You are a professional study planner. Create a highly accurate 100% workable study plan for a student at the academic level: "${academicLevel}".
        Subjects: ${subjects.join(', ')}.
        Available study hours per day: ${availableHours}.
        Exam target date: ${examDate}.
        Today's date: ${new Date().toISOString().split('T')[0]}.

        Return the response in strictly valid JSON format:
        [
            {
                "date": "YYYY-MM-DD",
                "subject": "Subject Name",
                "topic": "Highly relevant topic for ${academicLevel}",
                "duration": 2 // hours
            }
        ]
        Generate tasks for the next 7 days.
        `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a professional academic consultant." }, { role: "user", content: prompt }],
            model: "gpt-3.5-turbo",
        });

        const content = completion.choices[0].message.content.trim();
        const jsonString = content.replace(/^```json\n|\n```$/g, '');

        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error generating study plan:', error);
        if (error.code === 'invalid_api_key') {
            throw new Error('Invalid OpenAI API Key. Please check the .env file.');
        }
        throw new Error(error.message || 'Failed to generate study plan from AI');
    }
};
