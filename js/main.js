// Wrapper to only run when the DOM has loaded
document.addEventListener("DOMContentLoaded", function(){

// Flag for log messages
var DEBUGGING = true; 


/*
==========================
 BODY PANEL CONTROL LOGIC
==========================
*/

var wrapper = document.getElementById("wrapper");
var panel_wrapper = document.getElementById("body-panel-wrapper");
var controls = document.querySelectorAll("[name=navbar-select]");
var panel_map = {}
var panel_names = {"navbar-1":"body-panel-1","navbar-2":"body-panel-2","navbar-3":"body-panel-3","navbar-4":"body-panel-4"}
var panel_order = ["navbar-1","navbar-2","navbar-3","navbar-4"] // Used for next/prev panel operations
var current_panel = ""
var on_phone = false // Flag for if using a phone or not

// Set the JS indicator
panel_wrapper.removeAttribute('nojs')
panel_wrapper.setAttribute('js', '')

// Find the currently active panel
for (var i = 0; i < controls.length; i++) {
	if (controls[i].getAttribute('checked') != null) {
		current_panel = controls[i].id;
		break;
	}
}

// Shadow all the other ones
shadowInactive()

// Function to set the relevant offsets
function setPanelMap() {
	// Get panel width
	var panel_width = wrapper.offsetWidth;

	// Build the panel offset map
	panel_map = {
		"navbar-1": 0,
		"navbar-2": 1,
		"navbar-3": 2,
		"navbar-4": 3
	}

	for (key in panel_map) {
		panel_map[key] = -panel_map[key]*panel_width + 'px';
	}

	// Manage the transition delay and set current
	panel_wrapper.style.transition = "none"; 
	panel_wrapper.style.marginLeft = panel_map[current_panel];
	setTimeout(function() { // Need timeout for previous change to take effect
		panel_wrapper.style.transition = "";
	}, 10);
}

// Listen for changes to the controls, and follow them up
document.body.addEventListener("change", function(event) {
	for (var i = 0; i < controls.length; i++) {
		if (event.target == controls[i]) {
			break;
		} else if (i == controls.length - 1) {
			return false;
		}
	}
	if (DEBUGGING) console.log(event.target.id);
	var last_panel = current_panel;
	
	current_panel = event.target.id;
	unshadowAll()
	panel_wrapper.style.marginLeft = panel_map[current_panel];
	setTimeout(function() {
		shadowInactive()
	}, 800)
})

// For hiding when not in view
function shadowPanel(panel_id) {
	var children = document.getElementById(panel_id).children;
	for (var i = 0; i < children.length; i++) {
		children[i].style.display = "none"
	}
}

function shadowInactive() {
	for (i in panel_names) {
		if (i != current_panel) {
			shadowPanel(panel_names[i])
		}
	}
}

// For showing when in view
function unshadowPanel(panel_id) {
	var children = document.getElementById(panel_id).children;
	for (var i = 0; i < children.length; i++) {
		children[i].style.display = ""
	}
}

function unshadowAll(panel_id) {
	for (i in panel_names) {
		unshadowPanel(panel_names[i])
	}
}

/* For dynamic update when resizing */
setPanelMap() // Once off on load
window.addEventListener("resize", setPanelMap); // Forever after that


/*
==========================
 PRICING TABLE INFO BOXES
==========================
*/

var price_table = document.getElementById("price-table");
var info_checkboxes = document.querySelectorAll("#price-table input[type=checkbox]");

// Uncheck all if we click away
document.getElementById("body-panel-2").addEventListener("click", function(event) {
	if(event.target.type != "checkbox" && event.target.tagName != "LABEL") {
		for (var i = 0; i < info_checkboxes.length; i++) {
			if (info_checkboxes[i].checked) {
				// Need this to fire event
				info_checkboxes[i].click();
			}
		}
	}
});

// Uncheck others if one is clicked
price_table.addEventListener("change", function(event) {
	if(event.target.type == "checkbox") {
		for (var i = 0; i < info_checkboxes.length; i++) {
			if(info_checkboxes[i].id != event.target.id) {
				if (info_checkboxes[i].checked) {
					// Need this to fire event
					info_checkboxes[i].click();
				}
			}
		}
	}
});

/*
=================
 SWIPE DETECTION
=================
*/

document.addEventListener('touchstart', handleTouchStart, false);        
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;                                                        
var yDown = null;                                                        

function handleTouchStart(evt) {                                         
    xDown = evt.touches[0].clientX;                                      
    yDown = evt.touches[0].clientY;
    
    if (!on_phone) {
	    on_phone = true;
    	setPhoneState();
    }
};                                                

function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    }

    var xUp = evt.touches[0].clientX;                                    
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) && Math.abs( xDiff ) > 10) {/*most significant*/
        if ( xDiff > 0 ) {
            nextPanel();
        } else {
            previousPanel();
        }                       
    }

    /* reset values */
    xDown = null;
    yDown = null;                                             
};

function nextPanel() {
	var next_panel_id;

	for (var i = 0; i < panel_order.length; i++) {
		if (panel_order[i] == current_panel && i + 1 < panel_order.length) {
			next_panel_id = panel_order[i + 1];
			break;
		} else if (panel_order[i] == current_panel && i + 1 >= panel_order.length) {
			next_panel_id = current_panel;
			break;
		}
	}

	setPanel(next_panel_id, false, 0);
}

function previousPanel() {
	var prev_panel_id;

	for (var i = 0; i < panel_order.length; i++) {
		if (panel_order[i] == current_panel && i - 1 >= 0) {
			prev_panel_id = panel_order[i - 1];
			break;
		} else if (panel_order[i] == current_panel && i < 0) {
			prev_panel_id = current_panel;
			break;
		}
	}

	setPanel(prev_panel_id, false, 0);
}


// Set certain things to be more phone-oriented
function setPhoneState() {
	var click_taps = document.querySelectorAll(".click-tap");
	for (var i = 0; i < click_taps.length; i++) {
		click_taps[i].innerHTML = "Tap";
	}
}

});


// Programatically Change the Panel
// Needs to be out of DOM scope for loading to work
function setPanel(id, scroll_top=true, delay=500) {
	var duration = delay;
	if (scroll_top) { scrollTo(document.documentElement, 0, duration) };
	setTimeout(function() {
		document.querySelector("input[name='navbar-select']#" + id).click();
	}, duration + 100)
}


// Scroll the window automatically (when switching tabs sometimes)
function scrollTo(element, to, duration) {
    var start = element.scrollTop,
        change = to - start,
        currentTime = 0,
        increment = 20;

    console.log(start, change, currentTime, increment)
        
    var animateScroll = function(){        
        currentTime += increment;
        var val = Math.easeInOutQuad(currentTime, start, change, duration);
        element.scrollTop = val;
        if(currentTime < duration) {
            setTimeout(animateScroll, increment);
        }
    };
    animateScroll();
}

//t = current time
//b = start value
//c = change in value
//d = duration
Math.easeInOutQuad = function (t, b, c, d) {
  t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};