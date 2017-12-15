$(document).ready(function(){
    $('.delete-article').on('click', function(e){
        $target = $(e.target);
        const id = $(this).attr('data-id');

        $.ajax({
            type: 'DELETE',
            url : '/article/'+id,
            success: function(res){
                alert("Deleting article!");
                window.location.href='/';
            },
            error: function(err){
                console.log(err);
            }
        });
        
    });
});