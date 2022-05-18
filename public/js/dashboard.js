

$(window).load(function () {
    $('.sidenav-close-btn').click(function () {
        $('body').removeClass('sidebar-open');
        $('body').addClass('sidebar-closed');
        $('body').addClass('sidebar-collapse');
    })

    $('.sidenav-option-list li').click(function () {
        $('body').removeClass('sidebar-open');
        $('body').addClass('sidebar-closed');
        $('body').addClass('sidebar-collapse');
        if ($(this).hasClass('active')) {
            $(this).removeClass('active')
            $('.sidenav-option-sublist').children().eq(childno).slideUp()
        } else {
            var childno = $(this).index();
            $('.sidenav-option-list > li').removeClass('active')
            $('.sidenav-option-sublist > li').slideUp()
            $(this).addClass('active')
            $('.sidenav-option-sublist').children().eq(childno).slideDown()
        }
    })
});