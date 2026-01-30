async function loadWords(level) {
    try {
        const answersResponse = await fetch(`word/${level}/answer.txt`);
        const answersText = await answersResponse.text();
        const answers = answersText.split('\n')
            .map(word => word.trim().toUpperCase())
            .filter(word => word.length > 0);
        
        const allowedResponse = await fetch(`word/${level}/allowed.txt`);
        const allowedText = await allowedResponse.text();
        const allowed = allowedText.split('\n')
            .map(word => word.trim().toUpperCase())
            .filter(word => word.length > 0);
        
        console.log(`Loaded ${answers.length} answer words and ${allowed.length} allowed words for ${level}`);
        
        return { answers, allowed };
    } catch (error) {
        console.error('Error loading word files:', error);
        alert(`Error loading word files for ${level}. Make sure the files exist in word/${level}/`);
        return { answers: [], allowed: [] };
    }
}