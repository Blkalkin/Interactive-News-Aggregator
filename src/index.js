import './index.scss';

document.addEventListener('DOMContentLoaded', () => {
    // Part 1: Create and append the welcoming headline
    const appContainer = document.getElementById('app'); // Ensure 'app' is the ID of your main container


    // Part 2: Draggable Divider Functionality
    const divider = document.getElementById('divider');
    const topicsPane = document.getElementById('topics-pane');

    let isDragging = false;

    const updateWidth = (e) => {
        const newWidth = e.clientX;
        const appWidth = app.offsetWidth;
        if (newWidth > 100 && newWidth < appWidth - 100) {
            topicsPane.style.width = `${newWidth}px`;
        }
    };

    divider.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = true;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            updateWidth(e);
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
        }
    });

    // Part 3: Fetching Articles and Rendering Topic Header/Menu
    fetchLatestArticles().then(() => {
        setTimeout(() => {
            console.log('Topic Header:', document.getElementById('topic-header'));
            console.log('Topics Menu:', document.getElementById('topics-menu'));
        }, 1000); // Adjust the timeout as needed
    });


});

// Fetches latest articles and initializes the topic header with menu
function fetchLatestArticles() {
    console.log('fetchLatestArticles started'); // Log when function starts
    return fetch('http://13.52.254.92:8000/latest_articles/')
        .then(response => {
            console.log('Response received'); // Log when response is received
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Data processed'); // Log when data is processed
            const topics = Object.keys(data);
            renderTopicHeader(topics, data);
            renderArticlesByTopic(topics[0], data);
            console.log('Topics Menu immediately after render:', document.getElementById('topics-menu'));
        })
        .catch(error => {
            console.error('Could not get articles:', error);
        });
}



// Renders the topic header and its menu
function renderTopicHeader(topics, articlesData) {
    console.log('renderTopicHeader started'); // Log when function starts

    const appContainer = document.getElementById('app');
    const topicHeader = document.createElement('div');
    topicHeader.id = 'topic-header';
    topicHeader.classList.add('topic-header');
    appContainer.insertBefore(topicHeader, appContainer.firstChild);

    const topicMenu = document.createElement('div');
    topicMenu.id = 'topics-menu';
    topicMenu.classList.add('topics-menu', 'hidden'); // Ensure this starts as hidden
    console.log("topic header",topicHeader);
    appContainer.appendChild(topicMenu);
    console.log("hello world",topicMenu);

    topicHeader.textContent = topics[0];
    topicHeader.addEventListener('click', () => {
        console.log('Topic header clicked'); // Log when topic header is clicked
        topicMenu.classList.toggle('hidden'); // This line toggles the visibility
        console.log('Topic menu class list:', topicMenu.classList); // Log the class list of the topic menu
    });

    topics.forEach(topic => {
        const topicOption = document.createElement('div');
        topicOption.textContent = topic;
        topicOption.classList.add('topic-option');
        topicOption.addEventListener('click', () => {
            console.log(`Topic option "${topic}" clicked`); // Log when a topic option is clicked
            renderArticlesByTopic(topic, articlesData);
            topicHeader.textContent = topic;
            topicMenu.classList.add('hidden'); // Hide the menu after selection
        });
        topicMenu.appendChild(topicOption);
    });

    console.log('renderTopicHeader completed'); // Log when function ends
}



// Renders articles filtered by topic
function renderArticlesByTopic(topic, articlesData) {
    const articlesByTopic = articlesData[topic];
    renderArticles(articlesByTopic);
}

// Renders articles to the DOM
function renderArticles(articles) {
    const topicsPane = document.getElementById('topics-pane');
    topicsPane.innerHTML = ''; // Clear existing articles

    articles.forEach(article => {
        const articleElement = document.createElement('div');
        articleElement.classList.add('article');

        const titleElement = document.createElement('h3');
        titleElement.textContent = article.title;
        titleElement.classList.add('article-title');

        const dateElement = document.createElement('i');
        dateElement.textContent = `Published on ${article.publish_date}`;
        dateElement.classList.add('article-date');

        const infoContainer = document.createElement('div');
        infoContainer.classList.add('info-container', 'hidden');

        const expandButton = document.createElement('button');
        expandButton.textContent = 'Expand Article';
        expandButton.classList.add('expand-article');

        const linkButton = document.createElement('a');
        linkButton.textContent = 'Go to Site';
        linkButton.href = article.url;
        linkButton.target = '_blank';
        linkButton.classList.add('go-to-site');

        const contentContainer = document.createElement('div');
        contentContainer.classList.add('content-container', 'hidden');

        const bodyElement = document.createElement('p');
        bodyElement.textContent = article.body;
        bodyElement.classList.add('article-body');

        contentContainer.appendChild(bodyElement);
        infoContainer.appendChild(expandButton);

        titleElement.addEventListener('click', () => {
            infoContainer.classList.toggle('hidden');
        });

        expandButton.addEventListener('click', (event) => {
            event.stopPropagation();
            contentContainer.classList.toggle('hidden');
            if (!contentContainer.classList.contains('hidden')) {
                infoContainer.appendChild(linkButton);
            } else {
                if (infoContainer.contains(linkButton)) {
                    infoContainer.removeChild(linkButton);
                }
            }
            expandButton.textContent = contentContainer.classList.contains('hidden') ? 'Expand Article' : 'Collapse Article';
        });

        articleElement.appendChild(titleElement);
        articleElement.appendChild(dateElement);
        articleElement.appendChild(infoContainer);
        articleElement.appendChild(contentContainer);
        topicsPane.appendChild(articleElement);
        // Set the article ID on the element for drag and drop
        articleElement.dataset.articleId = article.id;

        // Set up drag start event
        articleElement.setAttribute('draggable', true);
        articleElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.dataset.articleId);
        });

        // Append the articleElement to the topicsPane
        topicsPane.appendChild(articleElement);
    });

    // Initialize the drop zone
    initializeDropZone();
}

function initializeDropZone() {
    const responsePane = document.getElementById('response-pane');
    responsePane.addEventListener('dragover', (e) => {
        e.preventDefault(); // Necessary to allow drop
    });

    responsePane.addEventListener('drop', (e) => {
        e.preventDefault();
        const articleId = e.dataTransfer.getData('text/plain');
        responsePane.dataset.selectedArticleId = articleId; // Store the ID on the drop zone
        // You might want to do something with the dropped article here
    });
}


function analyzeArticle(articleId, questionText) {
    // Display the question in the chat
    addChatMessage(questionText, true);

    fetch('http://13.52.254.92:8000/analyze_article/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ article_id: articleId, question_text: questionText }),
    })
        .then(response => response.json())
        .then(data => {
            // Display the server's response in the chat
            console.log(data)
            addChatMessage(data.response.choices[0].message.content, false);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}


document.getElementById('submit-button').addEventListener('click', () => {
    const userInput = document.getElementById('user-input');
    const questionText = userInput.value;
    const articleId = document.getElementById('response-pane').dataset.selectedArticleId;

    if (questionText && articleId) {
        analyzeArticle(articleId, questionText);
        userInput.value = ''; // Clear the input field after submitting
    }
});

function addChatMessage(text, isQuestion) {
    const responsePane = document.getElementById('response-pane');
    const messageDiv = document.createElement('div');
    messageDiv.textContent = text;
    messageDiv.className = isQuestion ? 'chat-message question' : 'chat-message response';
    // Ensure the new message is added above the input container
    const inputContainer = document.getElementById('input-container');
    responsePane.insertBefore(messageDiv, inputContainer);
    // Scroll to the bottom of the response pane to show the latest message
    responsePane.scrollTop = responsePane.scrollHeight;
}
