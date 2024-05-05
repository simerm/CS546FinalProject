// $('.thumbsUp').on('click', function() {
//     var postId = $(this).closest('.postDetails').attr('id'); // Get the post ID
//     $.post('/api/like', { postId: postId, action: 'like' }, function(data) {
//         // Update the like count on the page
//         $('#' + postId + ' .likes').text('Likes: ' + data.likes);
//     });
// });

// $('.thumbsDown').on('click', function() {
//     var postId = $(this).closest('.postDetails').attr('id'); // Get the post ID
//     $.post('/api/like', { postId: postId, action: 'dislike' }, function(data) {
//         // Update the dislike count on the page
//         $('#' + postId + ' .dislikes').text('Dislikes: ' + data.dislikes);
//     });
// });


