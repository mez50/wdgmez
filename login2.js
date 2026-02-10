document.getElementById('login-form-cyber').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username-cyber').value.trim();
    const password = document.getElementById('password-cyber').value;
    const errorMsg = document.getElementById('error-message-cyber');
    const errorText = errorMsg.querySelector('.error-text');
    const loadingBar = document.getElementById('loading-bar');
    
    // Clear previous errors
    errorMsg.classList.add('hidden');
    
    // Validate input
    if (!username || !password) {
        showError('SYSTEM_ERROR: ALL_FIELDS_REQUIRED');
        return;
    }
    
    // Show loading
    loadingBar.classList.remove('hidden');
    
    // Check credentials
    try {
        const isValid = await validateCredentials(username, password);
        
        if (isValid) {
            // Store session
            sessionStorage.setItem('loggedIn', 'true');
            sessionStorage.setItem('username', username);
            
            // Simulate cyber effect
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1500);
        } else {
            loadingBar.classList.add('hidden');
            showError('ACCESS_DENIED: INVALID_CREDENTIALS');
        }
    } catch (error) {
        loadingBar.classList.add('hidden');
        showError('CONNECTION_ERROR: RETRY_PROTOCOL');
        console.error('Login error:', error);
    }
});

function showError(message) {
    const errorMsg = document.getElementById('error-message-cyber');
    const errorText = errorMsg.querySelector('.error-text');
    errorText.textContent = message;
    errorMsg.classList.remove('hidden');
}

async function validateCredentials(username, password) {
    try {
        // Read credentials from users.txt file
        const response = await fetch('users/users.txt');
        const text = await response.text();
        
        // Parse credentials (format: username:password per line)
        const lines = text.split('\n');
        
        for (let line of lines) {
            const [storedUser, storedPass] = line.trim().split(':');
            if (storedUser === username && storedPass === password) {
                return true;
            }
        }
        
        return false;
    } catch (error) {
        console.error('Error reading credentials:', error);
        return false;
    }
}