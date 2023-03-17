document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('word-finder-form');

    async function callOpenAI(apiKey, situationDescription, wordDescription) {
        const findWordsButton = document.getElementById('find-words-button');
        findWordsButton.disabled = true;
        findWordsButton.textContent = 'Waiting...';

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                {
                    role: 'system',
                    content: 'You are a reverse dictionary that can find a word from its description. The user explains the situation in which they want to use the word and the word\'s meaning. In the response, you return 3 most suitable words using the following JSON format: {\"words\": [{\"word\": \"word1\", \"definition\": \"definition1\", \"examples\": [\"example1\", \"example2\"], \"usage\": \"explain why the word is relevant\"}]}'
                },
                {
                    role: 'user',
                    content: `Situation ${situationDescription}\nWord ${wordDescription}`
                }
                ]
            })
            });

            const data = await response.json();

            const assistantMessage = data.choices[0].message.content;
            const parsedResults = JSON.parse(assistantMessage);
            const resultPlaceholder = document.getElementById('response-placeholder');

            if (parsedResults.words) {
                let resultHTML = '';

                for (const wordObj of parsedResults.words) {
                    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(wordObj.word)}+meaning`;

                    resultHTML += `<h3><a href="${googleSearchUrl}" target="_blank">${wordObj.word}</a></h3>`;
                    resultHTML += `<p><strong>Definition:</strong> ${wordObj.definition}</p>`;
                    resultHTML += `<p><strong>Examples:</strong><br/>${wordObj.examples.join('<br/>')}</p>`;
                    resultHTML += `<p><strong>Usage:</strong> ${wordObj.usage}</p>`;
                    resultHTML += '<hr>';
                }

                resultPlaceholder.innerHTML = resultHTML;
            } else {
                resultPlaceholder.innerHTML = '<p>No results found.</p>';
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong. Please check your API key and try again.');
        }
        finally {
            findWordsButton.disabled = false;
            findWordsButton.textContent = 'Find the words';
            }
    }


    form.addEventListener('submit', function(event) {
      event.preventDefault();

      const apiKey = document.getElementById('api-key').value;
      const situationDescription = document.getElementById('situation-description').value;
      const wordDescription = document.getElementById('word-description').value;

      callOpenAI(apiKey, situationDescription, wordDescription);
    });

    const currentYear = new Date().getFullYear();
    const copyrightNotice = document.getElementById('copyright-notice');
    copyrightNotice.innerHTML = `Copyright &copy; ${currentYear} <a href="https://mikulskibartosz.name">Bartosz Mikulski</a> | This website DOES NOT use cookies. | <a href="https://mikulskibartosz.name/pair-programming-with-ai-building-a-website-with-gpt-4" target="_blank">Read an article about the creation of this page.</a>`;
  });
