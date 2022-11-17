const PI = Math.PI
var canvas = document.querySelector("canvas");
var c = canvas.getContext("2d");
const WIDTH = 1428;
const HEIGHT = 682;
const ORIGIN = [714,341];
const E = Math.E
var screen = {
    x: 0,
    y: 682
}; // 21*11  every 68px shift in x axies, the x increase by 1 unit number
//every 62 px shift in y axies, y increase by a unit
var zoom = 1;

canvas.width = WIDTH;
canvas.height = HEIGHT;

var points_list = [];
var lines_list = [];
var transform = false;
var macro_transform = false;

var custom_expression = true;
var custom_expression_string = `x`;
var pre_defined_function = 1;

//===================================
function f(y = Complex) {
    let x = new Complex(y.re,y.im);
    //y.power(2);
    if (custom_expression == false) {
        //pre defined expression
        if (pre_defined_function == 1) {
            x.power(2);
        } else if (pre_defined_function == 2) {
            sin(x);
        } else if (pre_defined_function == 3) {
            cos(x);
        } else if (pre_defined_function == 4) {
            tan(x);
        }
        return x;
    } else {
        let x_str = x.string;
        let expression_string = custom_expression_string.replace(/x/g, x_str);
        //console.log(y,x_str,custom_expression_string,"debug 1");
        //console.log(x,custom_expression_string,"debug 2");
        let expression = new evaluation(expression_string);
        return expression.evaluate();
    }
}
var POINT_PER_LINE = 500;
//==================================
//toolbar
const POINT_BAR = document.querySelector(".points");
const LINE_BAR = document.querySelector(".lines");
var show_points = false;
document.getElementById("new_point").addEventListener("click",function(){

    var x = get_x(714)
    var y = get_y(341)
    const new_point = new Point(x,y,5,points_list.length)

    points_list.push(new_point);
    new_point.create_new_point();
    refresh_screen();
})
document.getElementById("new_line").addEventListener("click",function(){
    line_initialization(578,341,850,341);
})
function line_initialization(screen_x,screen_y,screen_x2,screen_y2) {
    let x1 = get_x(screen_x)
    let y1 = get_y(screen_y)
    let x2 = get_x(screen_x2)
    let y2 = get_y(screen_y2)

    const p1 = new Point(x1,y1,5,points_list.length)
    //points_list.push(p1);
    //p1.create_new_point();

    const p2 = new Point(x2,y2,5,points_list.length)
    //points_list.push(p2);
    //p2.create_new_point();

    const new_line = new Line(p1,p2,lines_list.length,assign_colours(lines_list.length),5);

    p1.line = new_line;
    p2.line = new_line;

    lines_list.push(new_line);
    new_line.create_new_line();
    refresh_screen();
}
function get_x(pixel) {
    return Number((((pixel-screen.x)/68 - 10.5)*zoom).toFixed(2));
}
function get_y(pixel) {
    return Number((-((pixel-screen.y)/62 + 5.5)*zoom).toFixed(2));
}
function get_x_pixel(x) {
    return x * 68/zoom + 714 + screen.x;
}
function get_y_pixel(y) {
    return -y * 62/zoom - 341 + screen.y;
}
function assign_colours(value) {
    //value between 0 - 100
    let add = value * 15.3;
    let rgb = [255,0,0];
    while (add > 0) {
        if (rgb[0] == 255 && rgb[1] == 0 && rgb[2] == 0) {
            if (add > 255) {
                rgb[1] = 255
                add -= 255
            }
            else {
                rgb[1] += add
                add = 0
            }
        }
        else if (rgb[0] == 255 && rgb[1] == 255 && rgb[2] == 0) {
            if (add > 255) {
                rgb[0] = 0
                add -= 255
            }
            else {
                rgb[0] -= add
                add = 0
            }
        }
        else if (rgb[0] == 0 && rgb[1] == 255 && rgb[2] == 0) {
            if (add > 255) {
                rgb[2] = 255
                add -= 255
            }
            else {
                rgb[2] += add
                add = 0
            }
        }
        else if (rgb[0] == 0 && rgb[1] == 255 && rgb[2] == 255) {
            if (add > 255) {
                rgb[1] = 0
                add -= 255
            }
            else {
                rgb[1] -= add
                add = 0
            }
        }
        else if (rgb[0] == 0 && rgb[1] == 0 && rgb[2] == 255) {
            if (add > 255) {
                rgb[0] = 255
                add -= 255
            }
            else {
                rgb[0] += add
                add = 0
            }
        }
        else {
            if (add > 255) {
                rgb[2] = 0
                add -= 255
            }
            else {
                rgb[2] -= add
                add = 0
            }
        }
    }
    return `rgb(${Number(rgb[0])},${Number(rgb[1])},${Number(rgb[2])})`;
}
var mouse = {
    x: undefined,
    y: undefined,
    buttons: undefined
}
var mouse_drag = {
    x_px: undefined,
    y_px: undefined,
    dx_px: undefined,
    dy_px: undefined,
    buttons: undefined
}
window.addEventListener("mousemove",function(event) {
    mouse_drag.buttons = event.buttons;
    refresh_screen();

    if (mouse_drag.buttons == 0) {
        mouse_drag.x_px = event.x;
        mouse_drag.y_px = event.y;
    }
    if (mouse_drag.buttons == 1) {
        mouse_drag.dx_px = event.x;
        mouse_drag.dy_px = event.y;
        screen.x += 2*(mouse_drag.dx_px - mouse_drag.x_px);
        screen.y += 2*(mouse_drag.dy_px - mouse_drag.y_px);
        mouse_drag.x_px = event.x;
        mouse_drag.y_px = event.y;
    }

    //console.log(event);
})
window.addEventListener("mousedown",function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
    mouse.buttons = event.buttons;
})

class Circle {
    constructor(x,y,r,color = "rbg(255,255,255)",fill = "rbg(255,255,255)") {
        this.x = x;
        this.y = y;
        this.r = r;
        this.color = color;
        this.fill = fill;
    }

    draw_circle() {
        c.beginPath();
        c.arc(get_x_pixel(this.x),get_y_pixel(this.y),this.r, 0, PI *2, false);
        c.fillStyle = this.fill;
        c.strokeStyle = this.color;
        c.stroke();

        c.fill();

        var str = "("+String(this.x) + ","+ String(this.y) + "i)"
        c.font = "20px Arial";
        c.fillStyle = "rgb(0,0,0)";
        c.fillText(str,get_x_pixel(this.x),get_y_pixel(this.y)-10);
    }

    new_cord(x,y) {
        this.x = x;
        this.y = y;
    }

    new_radius(r) {
        this.r = r;
    }
    fill_color(color) {
        this.fill = color;
    }
    is_clicked() {
        if (Math.abs(mouse.x-get_x_pixel(this.x))<this.r && Math.abs(mouse.y-get_y_pixel(this.y))<this.r) {
            return true
        }
        return false
    }


}
class Point extends Circle {
    constructor(x,y,r,index,line=undefined){
        super(x,y,r);
        this.clicked = false;
        this.active = false;
        this.html_element = document.createElement("input");
        this.div = document.createElement("div");
        this.index = index;
        this.line = line;
        this.function_coordinates = undefined;//pixel
        this.arrow = undefined;
    } 

    detect_click() {
        if (this.is_clicked() == true) {
            if (mouse.buttons == 1 && this.clicked == false && this.active == false) {
                mouse.buttons = 0; 
                this.active = true;
                this.clicked = true;
            } else if (mouse.buttons == 1 && this.active == true){
                mouse.buttons = 0; 
                this.active = false;
                this.clicked = true;
            }
        }
        if (mouse.buttons == 0) {
            this.clicked = false
        }
        if (this.active == true) {
            this.fill_color("rgb(255,0,0)");
            this.new_cord(get_x(mouse_drag.x_px),get_y(mouse_drag.y_px));
            this.function_coordinates = undefined;
            if (this.line == undefined) {
                this.html_element.value = "("+String(this.x) + "," +String(this.y)+")";
            } else {
                this.line.line_update_info();
            }
        } else {
            this.fill_color("rgb(0,0,0)");
        }
    }
    create_new_point() {

        this.html_element.value = "("+String(this.x) + "," +String(this.y)+")";
        POINT_BAR.appendChild(this.div);
        this.div.appendChild(this.html_element);

        const delete_btn = document.createElement("button");
        this.div.appendChild(delete_btn);
        delete_btn.innerHTML = "Delete";
        this.div.style = "z-index: 0";
        delete_btn.classList = "delete_btn";


        this.html_element.addEventListener("keyup", (event) => {
            if (event.key === "Enter") {
                let x = ""
                let y = ""
                let string = this.html_element.value
                let first_number = true
                for (i=0;i<this.html_element.value.length-1;i++) {
                    if (string[i] != "," && string[i] != "(" && first_number == true) {
                        x += string[i]
                    } else if (string[i] == ",") {
                        first_number = false;
                    } else if (string[i] != ")" && first_number == false) {
                        y += string[i]
                    }
                }
                this.new_cord(Number(x),Number(y));
                refresh_screen();
            }
        })
        delete_btn.addEventListener("click", () => {
            POINT_BAR.removeChild(this.div);
            points_list.splice(this.index,1);
            for (i=0;i<points_list.length;i++) {
                points_list[i].index = i
            }
            refresh_screen();
        })
    }
    delete_point() {
        POINT_BAR.removeChild(this.div);
    }
    plot_function() {
        if (this.function_coordinates == undefined) {
            let number = new Complex(this.x,this.y);
            let fnumber = f(number);
            let new_x = fnumber.re;
            let new_y = fnumber.im;
            this.arrow = new Arrow(this.x,this.y,new_x,new_y);
        } 
        this.arrow.drawArrowhead();
    }
}
class Line {
    constructor(p1 = Point, p2 = Point,index, color = "rgb(0,0,0)", width = 1) {
        this.p1 = p1;
        this.p2 = p2;
        this.color =color;
        this.width = width
        this.div = undefined;
        this.html_element = undefined;
        this.index = index;
        this.vector = {
            x : (p2.x-p1.x)/POINT_PER_LINE,
            y : (p2.y-p1.y)/POINT_PER_LINE
        }
        this.function_coordinates = [];
        this.hide = false;
    }
    get is_hidden() {
        return this.hide;
    }
    draw_line() {
        c.beginPath();
        let x1 = get_x_pixel(this.p1.x);
        let y1 = get_y_pixel(this.p1.y);
        let x2 = get_x_pixel(this.p2.x);
        let y2 = get_y_pixel(this.p2.y);
        c.moveTo(x1,y1);
        c.lineTo(x2,y2);
        c.lineWidth = this.width;
        c.strokeStyle = this.color
        c.stroke();
        c.lineWidth = 1;
        if (show_points == true) {
            this.p1.draw_circle();
            this.p2.draw_circle();
            this.p1.detect_click();
            this.p2.detect_click();
        }
        c.strokeStyle = "rgb(0,0,0)";
    }
    line_update_info() {
        this.function_coordinates = []
        this.html_element.value = "("+String(this.p1.x) + "," +String(this.p1.y)+"):("+String(this.p2.x)+","+String(this.p2.y)+")";
        this.update_vector();
    }
    update_vector() {
        this.vector = {
            x : (this.p2.x-this.p1.x)/POINT_PER_LINE,
            y : (this.p2.y-this.p1.y)/POINT_PER_LINE
        }
        this.function_coordinates = []
    }
    create_new_line() {
        this.html_element = document.createElement("input");
        this.div = document.createElement("div");
        const delete_btn = document.createElement("button");
        const hide_btn = document.createElement("button");
        LINE_BAR.appendChild(this.div);
        this.div.appendChild(this.html_element);
        this.div.appendChild(hide_btn);
        this.div.appendChild(delete_btn);
        delete_btn.innerHTML = "Delete";
        delete_btn.classList = "delete_btn";
        hide_btn.innerHTML = "Hide";
        hide_btn.classList = "hide_btn"
        this.html_element.classList = "line_input";
        this.div.classList = "line";
        this.html_element.value = "("+String(this.p1.x) + "," +String(this.p1.y)+"):("+String(this.p2.x)+","+String(this.p2.y)+")";
        this.html_element.addEventListener("keyup", (event) => {
            if (event.key === "Enter") {
                let x1 = "";
                let x2 = "";
                let y1 = "";
                let y2 = "";
                let string = this.html_element.value;
                let first_number = true;
                let first_point = true;
                for (i=0;i<this.html_element.value.length-1;i++) {
                    if (string[i] != "," && string[i] != "(" && first_number == true && string[i] != ":" && first_point == true) {
                        x1 += string[i];
                    } else if (string[i] == ",") {
                        first_number = false;
                    } else if (string[i] != ")" && first_number == false && first_point == true && string[i] != ":") {
                        y1 += string[i];
                    } else if (string[i] == ":") {
                        first_point = false;
                        first_number = true;
                    } else if (string[i] != "," && string[i] != "(" && first_number == true && string[i] != ":" && first_point == false) {
                        x2 += string[i];
                    } else if (string[i] != ")" && first_number == false && first_point == false && string[i] != ":") {
                        y2 += string[i];
                    }
                }
                this.p1.new_cord(Number(x1),Number(y1));
                this.p2.new_cord(Number(x2),Number(y2));
                this.update_vector();
                refresh_screen();
            }
        })
        delete_btn.addEventListener("click", () => {
            LINE_BAR.removeChild(this.div);
            lines_list.splice(this.index,1);
            for (i=0;i<lines_list.length;i++) {
                lines_list[i].index = i
            }
            refresh_screen();
        })
        hide_btn.addEventListener("click", () => {
            if (this.is_hidden == true) {
                this.hide = false;
                hide_btn.innerHTML = "Hide";
            } else {
                this.hide = true;
                hide_btn.innerHTML = "Show";
            }
            refresh_screen();
        })
    }
    delete_line() {
        LINE_BAR.removeChild(this.div);
    }
    plot_function() {
        var adjusted_vector = {
            x: this.vector.x,
            y: this.vector.y
        }
        if (this.function_coordinates.length == 0) {
        for (i=0;i<POINT_PER_LINE;i++) {
            let point_1 = new Complex(this.p1.x+i*this.vector.x,this.p1.y+i*this.vector.y);
            let point_2 = new Complex(point_1.re+this.vector.x,point_1.im+this.vector.y);
            let fpoint_1 = f(point_1);
            let fpoint_2 = f(point_2);
            let x1 = Math.ceil(get_x_pixel(fpoint_1.re));
            let y1 = Math.ceil(get_y_pixel(fpoint_1.im));
            let x2 = Math.ceil(get_x_pixel(fpoint_2.re));
            let y2 = Math.ceil(get_y_pixel(fpoint_2.im));
            let pixel_vector = {
                x: x2-x1,
                y: y2-y1
            }
            if (0 <= x1 <= WIDTH && 0 <= y1 <= HEIGHT) {
                while (Math.pow((Math.pow(pixel_vector.x,2)+Math.pow(pixel_vector.y,2)),0.5) > 5) {
                    adjusted_vector.x /= 2;
                    adjusted_vector.y /=2;
                    //console.log(adjusted_vector);
                    point_2 = new Complex(point_1.re+adjusted_vector.x,point_1.im+adjusted_vector.y);
                    fpoint_2 = f(point_2);
                    x2 = Math.ceil(get_x_pixel(fpoint_2.re));
                    y2 = Math.ceil(get_y_pixel(fpoint_2.im));
                    pixel_vector = {
                        x: x2-x1,
                        y: y2-y1
                    }
                }
                adjusted_vector = {
                    x: this.vector.x,
                    y: this.vector.y
                }
            //drawline
            c.beginPath();
            c.moveTo(x1,y1);
            c.lineTo(x2,y2);
            c.lineWidth = 5;
            c.strokeStyle = this.color
            c.stroke();
            c.lineWidth = 1;
            c.strokeStyle = "rgb(0,0,0)";
            }
            
            this.function_coordinates.push([fpoint_1.re,fpoint_1.im,fpoint_2.re,fpoint_2.im]);
        }
        } else {
            //console.log(this.function_coordinates[0]);
            for (let i=0;i<this.function_coordinates.length;i++) {
                let x1 = Math.ceil(get_x_pixel(this.function_coordinates[i][0]));
                let y1 = Math.ceil(get_y_pixel(this.function_coordinates[i][1]));
                let x2 = Math.ceil(get_x_pixel(this.function_coordinates[i][2]));
                let y2 = Math.ceil(get_y_pixel(this.function_coordinates[i][3]));
                //drawline
                c.beginPath();
                c.moveTo(x1,y1);
                c.lineTo(x2,y2);
                c.lineWidth = 5;
                c.strokeStyle = this.color
                c.stroke();
                c.lineWidth = 1;
                c.strokeStyle = "rgb(0,0,0)";
            }
        } 
    }
    plot_function_macro() {
        if (this.function_coordinates.length == 0) {
        for (i=0;i<POINT_PER_LINE;i++) {
            let point_1 = new Complex(this.p1.x+i*this.vector.x,this.p1.y+i*this.vector.y);
            let point_2 = new Complex(point_1.re+this.vector.x,point_1.im+this.vector.y);
            let fpoint_1 = f(point_1);
            let fpoint_2 = f(point_2);
            let x1 = Math.ceil(get_x_pixel(fpoint_1.re));
            let y1 = Math.ceil(get_y_pixel(fpoint_1.im));
            let x2 = Math.ceil(get_x_pixel(fpoint_2.re));
            let y2 = Math.ceil(get_y_pixel(fpoint_2.im));
            c.beginPath();
            c.moveTo(x1,y1);
            c.lineTo(x2,y2);
            c.lineWidth = 5;
            c.strokeStyle = this.color
            c.stroke();
            c.lineWidth = 1;
            c.strokeStyle = "rgb(0,0,0)";
            this.function_coordinates.push([fpoint_1.re,fpoint_1.im,fpoint_2.re,fpoint_2.im]);
            }
        } else {
            //console.log(this.function_coordinates[0]);
            for (let i=0;i<this.function_coordinates.length;i++) {
                let x1 = Math.ceil(get_x_pixel(this.function_coordinates[i][0]));
                let y1 = Math.ceil(get_y_pixel(this.function_coordinates[i][1]));
                let x2 = Math.ceil(get_x_pixel(this.function_coordinates[i][2]));
                let y2 = Math.ceil(get_y_pixel(this.function_coordinates[i][3]));
                //drawline
                c.beginPath();
                c.moveTo(x1,y1);
                c.lineTo(x2,y2);
                c.lineWidth = 5;
                c.strokeStyle = this.color
                c.stroke();
                c.lineWidth = 1;
                c.strokeStyle = "rgb(0,0,0)";
            }
        } 
    }
}
class Axies {
    constructor(number) {
        this.number = number;
        this.pixel = undefined;
    }

    draw_axies_x() {
        this.pixel = get_y_pixel(this.number*zoom);
        if (this.pixel < 0) {
            this.number -= 12;
        } else if (this.pixel > HEIGHT) {
            this.number += 12;
        }
        var str = String(this.number*zoom) + "i";
        c.font = "20px Arial";
        if (get_x_pixel(0) < 0){
            c.fillText(str,0,this.pixel);
        } else if (get_x_pixel(0) > WIDTH-30) {
            c.fillText(str,WIDTH-30,this.pixel);
        } else {
            c.fillText(str,get_x_pixel(0),this.pixel);
        }
        c.beginPath();
        c.moveTo(0,this.pixel);
        if (this.number == 0) {
            c.lineWidth = 3;
        } else {
            c.lineWidth = 1;
        }
        c.lineTo(WIDTH,this.pixel);
        c.stroke();
    }
    draw_axies_y() {
        this.pixel = get_x_pixel(this.number*zoom);
        if (this.pixel < 0) {
            this.number += 22;
        } else if (this.pixel > WIDTH) {
            this.number -= 22;
        }
        var str = String(this.number*zoom);
        c.font = "20px Arial";
        if (get_y_pixel(0) < 30){
            c.fillText(str,this.pixel,30);
        } else if (get_y_pixel(0) > HEIGHT) {
            c.fillText(str,this.pixel,HEIGHT);
        } else {
            c.fillText(str,this.pixel,get_y_pixel(0));
        }
        c.beginPath();
        c.moveTo(this.pixel,0);
        if (this.number == 0) {
            c.lineWidth = 3;
        } else {
            c.lineWidth = 1;
        }
        c.lineTo(this.pixel,HEIGHT);
        c.stroke();
    }
}
function draw_rect(x1,y1,x2,y2,color = "rgb(0,0,0)") {
    c.fillStyle = "rgb(0,0,0)";
    c.fillStyle = color;
    c.fillRect(x1,y1,x2,y2);
}
class Arrow {
    constructor(x1,y1,x2,y2) {
        //parameter takes in number instead of pixel!!
        this.point_1 = {
            x: get_x_pixel(x1),
            y: get_y_pixel(y1)
        };
        this.point_2 = {
            x: get_x_pixel(x2),
            y: get_y_pixel(y2)
        }
    }
    drawArrowhead() {
        
        var from = {
            x:this.point_1.x,
            y:this.point_1.y}
        var to = {
            x: this.point_2.x,
            y: this.point_2.y
        }
        var radius = 5

        var x_center = to.x;
        var y_center = to.y;

        var angle;
        var x;
        var y;
    
        c.beginPath();
    
        angle = Math.atan2(to.y - from.y, to.x - from.x)
        x = radius * Math.cos(angle) + x_center;
        y = radius * Math.sin(angle) + y_center;
    
        c.moveTo(x, y);
    
        angle += (1.0/3.0) * (2 * Math.PI)
        x = radius * Math.cos(angle) + x_center;
        y = radius * Math.sin(angle) + y_center;
    
        c.lineTo(x, y);
    
        angle += (1.0/3.0) * (2 * Math.PI)
        x = radius *Math.cos(angle) + x_center;
        y = radius *Math.sin(angle) + y_center;
    
        c.lineTo(x, y);

        c.closePath();
    
        c.fill();

        c.beginPath();
        c.moveTo(this.point_1.x,this.point_1.y);
        c.lineTo(this.point_2.x,this.point_2.y);
        c.stroke();
    }
}
var point = new Point(0,0,5);
var point2 = new Point(2,2,5);
var x_axiesArray = [];
for (let i = -6; i < 6; i++) {
    x_axiesArray.push(new Axies(i));
}
var y_axiesArray = [];
for (let i = -11; i < 11; i++) {
    y_axiesArray.push(new Axies(i));
}

function refresh_screen() {
    c.clearRect(0,0,innerWidth,innerHeight);
    
    update_axies();

    //points
    for (i=0;i<points_list.length;i++){
        if (show_points == true) {
            points_list[i].draw_circle();
            points_list[i].detect_click();
        } 
        if (transform == true) {
            points_list[i].plot_function();
        }
    }

    //lines
    if (macro_transform == true) {
        for (let i=0;i<lines_list.length;i++){
            let line = lines_list[i]
            if (line.is_hidden == false) {
                line.plot_function_macro();
            }
        }
    } else if (transform == true) {
        for (let i=0;i<lines_list.length;i++){
            let line = lines_list[i]
            if (line.is_hidden == false) {
                line.plot_function();
            }
        }
    } else {
        for (i=0;i<lines_list.length;i++) {
            let line = lines_list[i]
            if (line.is_hidden == false) {
                line.draw_line();
            }
        }
    }
}
function update_axies() {
    for (var i = 0; i < x_axiesArray.length; i++) {
        x_axiesArray[i].draw_axies_x();
    }
    for (var i = 0; i < y_axiesArray.length; i++) {
        y_axiesArray[i].draw_axies_y();
    }
}
refresh_screen();
document.getElementById("clear_graph").addEventListener("click",function(){
    for (i=0;i<lines_list.length;i++){
        lines_list[i].delete_line();
    }
    lines_list = []
    for (i=0;i<points_list.length;i++){
        points_list[i].delete_point();
    }
    points_list = []
    refresh_screen();
})
document.getElementById("transform").addEventListener("click",function(){
    transform = !transform;
    if (transform == true) {
        document.getElementById("transform").innerHTML = "Stop";
        macro_transform = false
        document.getElementById("macro_transform").innerHTML = "Macro Transform";
        for (i=0;i<lines_list.length;i++) {
            let line = lines_list[i]
            line.function_coordinates = [];
        }
    } else {
        document.getElementById("transform").innerHTML = "Transform";
    }
    refresh_screen();
})
document.getElementById("macro_transform").addEventListener("click",function(){
    macro_transform = !macro_transform;
    if (macro_transform == true) {
        document.getElementById("macro_transform").innerHTML = "Stop";
        transform = false
        document.getElementById("transform").innerHTML = "Transform";
        for (i=0;i<lines_list.length;i++) {
            let line = lines_list[i]
            line.function_coordinates = [];
        }
    } else {
        document.getElementById("macro_transform").innerHTML = "Macro Transform";
    }
    refresh_screen();
})
document.getElementById("hide_points").addEventListener("click",function(){
    show_points = !show_points;
    if (show_points == true) {
        document.getElementById("hide_points").innerHTML = "Hide Points";
    } else {
        document.getElementById("hide_points").innerHTML = "Show Points";
    }
    refresh_screen();
})
document.getElementById("zoom_in").addEventListener("click",function(){
    let screen_zoom_adjust = {
        x: screen.x,
        y: screen.y
    }
    zoom /= 2
    screen.x = screen_zoom_adjust.x
    screen.y = screen_zoom_adjust.y
    refresh_screen();
})
document.getElementById("zoom_out").addEventListener("click",function(){
    let screen_zoom_adjust = {
        x: screen.x,
        y: screen.y
    }
    zoom *= 2
    screen.x = screen_zoom_adjust.x
    screen.y = screen_zoom_adjust.y
    refresh_screen();
})
document.getElementById("new_grid").addEventListener("click", function() {
    for (let i = -6; i < 6; i++) {
        line_initialization(0,62*(i+6),WIDTH,62*(i+6));
    }
    for (let i = -11; i < 11; i++) {
        line_initialization(68*(i+11),0,68*(i+11),HEIGHT);
    }
    refresh_screen();
})
document.getElementById("precision").addEventListener("keyup", (event) => {
    let input = document.getElementById("precision");
    if (event.key === "Enter") {
        POINT_PER_LINE = Number(input.value);
        input.placeholder = "Precision: " + POINT_PER_LINE;
        input.value = "";
        for (let i=0;i<lines_list.length;i++) {
            lines_list[i].update_vector();
        }
        refresh_screen();
    }
})
class Complex {
    constructor(real,imaginary) {
        this.real = real;
        this.imaginary = imaginary;
    }

    get re() {
        return this.real;
    }
    get im() {
        return this.imaginary;
    }
    get abs() {
        return Math.pow((Math.pow(this.re,2)+Math.pow(this.im,2)),0.5);
    }
    get arg() {
        let y = this.imaginary
        let x = this.real
        if (x==0&&y>=0) {
            return PI/2;
        } else if (x<=0&&y==0) {
            return PI;
        } else if (x==0&&y<0) {
            return -PI/2;
        } else if (x>=0&&y==0) {
            return 0;
        } else if (x >= 0 && y >= 0) {
            return Math.atan(y/x);
        } else if (x<0&&y>=0) {
            return PI + Math.atan(y/x);
        } else if (x<0&&y<=0) {
            return -PI + Math.atan(y/x);
        } else {
            return Math.atan(y/x);
        }
    }
    get string() {
        return "("+String(this.real.toFixed(12))+"+"+String(this.imaginary.toFixed(12))+"i"+")";
    }
    plus(x) {
        this.real += x.real;
        this.imaginary += x.imaginary;
    }
    minus(x) {
        this.real -= x.real;
        this.imaginary -= x.imaginary
    }
    multiply_by(x) {
        let a = this.real;
        let b = this.imaginary;
        let c = x.real;
        let d = x.imaginary;
        this.real  = a*c-b*d;
        this.imaginary = a*d+c*b;
    }
    divide_by(x) {
        let a = this.real;
        let b = this.imaginary;
        let c = x.real;
        let d = x.imaginary;
        this.real = (a*c+d*b)/(Math.pow(c,2)+Math.pow(d,2))
        this.imaginary = (b*c-a*d)/(Math.pow(c,2)+Math.pow(d,2))
    }
    console_log_value() {
        console.log(String(this.real),"+",String(this.imaginary),"i");
    }
    power(x) {
        let polar = this.polar;
        if (typeof(x) == "object") {
            let r = polar.r;
            let phi = polar.phi;
            // real of x and imag of x:
            let re = x.real;
            let im = x.imaginary;
            //theta is a constant:
            let theta = im*Math.log(r)+phi*re;
            let rx = Math.pow(r,re)
            let denominator = Math.exp(phi*im);
            this.real = Number((rx*Math.cos(theta)/denominator).toFixed(12));
            this.imaginary = Number((rx*Math.sin(theta)/denominator).toFixed(12));
        } else if (typeof(x) == "number") {
            let r = Math.pow(polar.r,x);
            let phi = polar.phi * x;
            this.real = Number((r*Math.cos(phi)).toFixed(12));
            this.imaginary = Number((r*Math.sin(phi)).toFixed(12));
        }
    }
    get polar() {
        return {
            r: this.abs,
            phi: this.arg
        }
    }
    
}
function sin(x = Complex) {
    let re = x.re;
    let im = x.im;
    let real_part = Math.sin(re)*Math.cosh(im);
    let imag_part = Math.cos(re)*Math.sinh(im);
    x.real = real_part;
    x.imaginary = imag_part;
}
function cos(x = Complex) {
    let re = x.re;
    let im = x.im;
    let real_part = Math.cos(re)*Math.cosh(im);
    let imag_part = -Math.sin(re)*Math.sinh(im);
    x.real = real_part;
    x.imaginary = imag_part;
}
function tan(x = Complex) {
    let re = x.re;
    let im = x.im;
    let real_part = Number(Math.sin(2*re)/(Math.cos(2*re)+Math.cosh(2*im))).toFixed(12);
    let imag_part = Number(Math.sinh(2*im)/(Math.cos(2*re)+Math.cosh(2*im))).toFixed(12);
    x.real = real_part;
    x.imaginary = imag_part;
}
function exp(x = Complex) {
    let e = new Complex(E,0);
    e.power(x);
    x.real = e.re;
    x.imaginary = e.im;
}
class evaluation {
    constructor(string,a=undefined,b=undefined) {
        this.string = string;
        this.a = a;
        this.b = b;
        this.operation = undefined;
    }
    evaluate() {
        this.string = this.string.replace(/\s+/g,"");

        let test_operations = ["+","-","*","/","^"];
        for (let i=0;i<test_operations.length;i++) {
            if (this.operation == undefined) {
                if (this.have_operation(test_operations[i]) == true) {
                    this.operation = test_operations[i];
                    break
                }
            }
        }

        let bracket = 0;
        let first_bracket = false;
        if (this.operation == undefined) {
            if (this.string[0] == "-") {
                if (this.string.includes("i",this.string.length-1)) {
                    if (this.string.length == 2) {
                        this.string = "-1i";
                    }
                    this.a = new Complex(0,parseFloat(this.string.slice(0,-1)));
                } else {
                    this.a = new Complex(parseFloat(this.string),0);
                }
                return this.a;
            }
            if (this.string.includes("i",this.string.length-1)) {
                if (this.string.length == 1) {
                    this.string = "1i";
                }
                this.a = new Complex(0,parseFloat(this.string.slice(0,-1)))
                return this.a;
            } else {
                if (isNaN(this.string) == true) {
                    //special functions
                    this.a = this.string;
                    return this.calculate(undefined);
                } else {
                    this.a = new Complex(parseFloat(this.string),0)
                    return this.a
                }
            }
        }

        for (let i=0;i<this.string.length;i++) {
            let character = this.string[i];
            if (character == "(") {
                if (i==0) {
                    first_bracket = true;
                }
                bracket += 1;
            } else if (character == ")") {
                bracket -= 1;
            }
            if (first_bracket == true && i != this.string.length-1 && this.string[i] == ")" && bracket == 0) {
                first_bracket = false;
            }
            if (character == this.operation && bracket == 0 && i != 0) {
                this.a = this.string.substring(0,i);
                this.b = this.string.substring(i+1,this.string.length);
                break
            }
        }


        if (first_bracket == true) {
            this.string = this.string.substring(1,string.length-1);
        }



        this.re_evaluate();

        return this.calculate(this.operation);
    }
    have_operation(operation) {
        let bracket = 0
        let string = this.string
        for (let i=0; i<this.string.length; i++) {
            let character = string[i]
            if (character == "(") {
                bracket += 1;
            } else if (character == ")") {
                bracket -= 1;
            } else if (character == operation && bracket == 0) {
                if (!(operation == "-" && i ==0)) {
                    return true;
                }
            }
        }
        return false;
    }
    remove_bracket(string_) {
        let bracket = 0;
        let first_bracket = false;
        let string = string_;
        for (let i=0;i<string.length;i++) {
            let character = string[i];
            if (character == "(") {
                if (i == 0) {
                    first_bracket = true;
                }
                bracket += 1;
            }  else if (character == ")") {
                bracket -= 1;
            }
            if (first_bracket == true && i != string.length-1 && string[i] == ")" && bracket == 0) {
                first_bracket = false;
            }
        }
        if (first_bracket == true) {
            string = string.substring(1,string.length-1);
        }
        return string;
    }
    re_evaluate() {
        if (this.a != undefined) {
            this.a = this.remove_bracket(this.a);
            if (isNaN(this.a) == true && this.a instanceof Complex != true) {
                let new_expression = new evaluation(this.a);
                this.a = new_expression.evaluate();
            } else if (this.a instanceof Complex != true) {
                this.a = new Complex(parseFloat(this.a),0);
            }
        }
        if (this.b != undefined) {
            this.b = this.remove_bracket(this.b);
            if (isNaN(this.b) == true && this.b instanceof Complex != true) {
                let new_expression = new evaluation(this.b);
                this.b = new_expression.evaluate();
            } else if (this.b instanceof Complex != true) {
                this.b = new Complex(parseFloat(this.b),0);
            }
        }
    }
    calculate(operation) {
        if (this.a instanceof Complex != true) {
            if (this.a.substring(0,3) == "sin") {
                this.a = this.a.substring(4,this.a.length-1)
                this.re_evaluate()
                sin(this.a)
                return this.a
            }
            if (this.a.substring(0,3) == "cos") {
                this.a = this.a.substring(4,this.a.length-1)
                this.re_evaluate()
                cos(this.a)
                return this.a
            }
            if (this.a.substring(0,3) == "tan") {
                this.a = this.a.substring(4,this.a.length-1)
                this.re_evaluate()
                tan(this.a)
                return this.a
            }
            if (this.a.substring(0,1) == "e") {
                this.a = this.a.substring(2,this.a.length-1)
                this.re_evaluate()
                exp(this.a)
                return this.a
            }
        }


        if (operation == "+") {
            this.a.plus(this.b);
            return this.a
        } else if (operation == "-") {
            this.a.minus(this.b);
            return this.a;
        } else if (operation == "*") {
            this.a.multiply_by(this.b);
            return this.a;
        } else if (operation == "/") {
            this.a.divide_by(this.b);
            return this.a;
        } else if (operation == "^") {
            this.a.power(this.b);
            return this.a;
        }
    }
}
function interpret(expression) {
    expression = expression.replace("exp","e");
    return expression
}
var user_expression = "x"
document.getElementById("f1").addEventListener("click", function() {
    let input = document.getElementById("function_input")
    input.style = "border-color: red";
    user_expression += "x^()"
    input.value = "f(x) = " + user_expression;
})
document.getElementById("f2").addEventListener("click", function() {
    let input = document.getElementById("function_input")
    input.style = "border-color: red";
    user_expression += "sin()"
    input.value = "f(x) = " + user_expression;
})
document.getElementById("f3").addEventListener("click", function() {
    let input = document.getElementById("function_input")
    input.style = "border-color: red";
    user_expression += "cos()"
    input.value = "f(x) = " + user_expression;
})
document.getElementById("f4").addEventListener("click", function() {
    let input = document.getElementById("function_input")
    input.style = "border-color: red";
    user_expression += "tan()"
    input.value = "f(x) = " + user_expression;
})
document.getElementById("f5").addEventListener("click", function() {
    let input = document.getElementById("function_input")
    input.style = "border-color: red";
    user_expression += "exp()"
    input.value = "f(x) = " + user_expression;
})
//user_expression is used to display the expression to the user. after pressed enter, the user expression will be interpreted into custom_expression_string
document.getElementById("function_input").addEventListener("keyup", (event) => {
    let input = document.getElementById("function_input")
    if (event.key === "Enter") {
        //interpret
        user_expression = input.value.substring(7);
        console.log(user_expression)
        custom_expression_string = interpret(user_expression);
        custom_expression = true;
        input.style = "border-color: black";
        refresh_screen();
    } else if (event.key == "Backspace") {
        user_expression = user_expression.substring(0,user_expression.length-1);
    } else if (event.key != "Shift" && event.key != "Control" && event.key != "Alt" && event.key != "ArrowLeft" && event.key != "ArrowRight" && event.key != "ArrowUp" && event.key != "ArrowDown" && event.key != "="){
        input.style = "border-color: red";
    }
})
