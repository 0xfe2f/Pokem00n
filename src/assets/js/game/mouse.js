var timer;

var posx, posy;

function active() {
    $('body').css('cursor', `url("https://i.imgur.com/vdKTsFp.png"), auto`);
}

function inactive() {
    // console.log('inactive');
}

$("body").on("mousemove", function(cursor) {
    // var mouse = {
    //     x: cursor.clientX + "px",
    //     y: cursor.clientY + "px"
    //   };
    active();
    clearTimeout(timer);
    timer = setTimeout(inactive, 1000);
});