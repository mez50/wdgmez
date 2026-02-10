document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-message');
    
    // Clear previous errors
    errorMsg.classList.add('hidden');
    
    // Validate input
    if (!username || !password) {
        showError('Please fill in all fields!');
        return;
    }
    
    // Check credentials
    try {
        const isValid = await validateCredentials(username, password);
        
        if (isValid) {
            // Store session
            sessionStorage.setItem('loggedIn', 'true');
            sessionStorage.setItem('username', username);
            
            // Redirect to home
            window.location.href = 'home.html';
        } else {
            showError('Invalid username or password!');
        }
    } catch (error) {
        showError('Login error. Please try again.');
        console.error('Login error:', error);
    }
});

function showError(message) {
    const errorMsg = document.getElementById('error-message');
    errorMsg.textContent = message;
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
