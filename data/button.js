function toggleComments() {
    var commentsDiv = document.getElementById('comments');
    commentsDiv.classList.toggle('comments-hidden');

    var toggleButton = document.getElementById('toggle-comments-btn');
    if (commentsDiv.classList.contains('comments-hidden')) {
        toggleButton.textContent = 'Click to Show Comments';
    } else {
        toggleButton.textContent = 'Click to Hide Comments';
    }
}