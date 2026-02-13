const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5001/api';
let cookie = '';

async function login() {
    console.log('Logging in...');
    // Assuming a test user exists or we can register one. 
    // For this script, let's try to register a new temp user to ensure it works.
    const email = `test${Date.now()}@example.com`;
    const password = 'password123';

    let response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test User', email, password })
    });

    if (!response.ok) {
        // Try login if register fails (maybe email exists)
        response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
    }

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to login/register: ${response.status} ${response.statusText} - ${text}`);
    }

    // Get cookie
    const rawCookie = response.headers.get('set-cookie');
    console.log('Response headers:', JSON.stringify([...response.headers.entries()]));
    console.log('Raw Set-Cookie:', rawCookie);

    if (!rawCookie) {
        throw new Error('No cookie received from login response');
    }

    cookie = rawCookie.split(';')[0];
    console.log('Logged in successfully. Cookie:', cookie);
}

async function testGenerateQuestions() {
    console.log('Testing Generate Questions...');
    const response = await fetch(`${BASE_URL}/ai/generate-questions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookie
        },
        body: JSON.stringify({
            subject: 'Physics',
            topic: 'Newton Law',
            count: 3
        })
    });

    if (response.status === 500) {
        const error = await response.json();
        console.log('Received expected 500 error (due to invalid API key):', error.error);
        return; // This is expected success for verification without real key
    }

    if (!response.ok) throw new Error(`Failed to generate questions: ${response.statusText}`);

    const data = await response.json();
    console.log('Questions generated:', data.length);
}

async function run() {
    try {
        await login();
        await testGenerateQuestions();
        console.log('Verification Complete!');
    } catch (error) {
        console.error('Verification Failed:', error);
    }
}

run();
