var numbers_table = ['0','1','2','3','4','5','6','7','8','9','0'];

var slots = new Array();
var margins = new Array();

var init_margin = -6;
var duration = 100;
var margin = 50;
var nb_slots = 4;

var number;
var current_value;

function initSlots(){
    current_value = 1;
    number = 0;
    addSlots($("#slots_5 .wrapper"));
    addSlots($("#slots_4 .wrapper"));
    addSlots($("#slots_3 .wrapper"));
    addSlots($("#slots_2 .wrapper"));
    addSlots($("#slots_1 .wrapper"));
    addSlots($("#slots_0 .wrapper"));

    slots[5] = $("#slots_5 .wrapper");
    slots[4] = $("#slots_4 .wrapper");
    slots[3] = $("#slots_3 .wrapper");
    slots[2] = $("#slots_2 .wrapper");
    slots[1] = $("#slots_1 .wrapper");
    slots[0] = $("#slots_0 .wrapper");

    for (var i = 0 ; i <= nb_slots ; ++i)
        margins[i] = init_margin;
}

function initSlots3(){
    current_value = 1;
    number = 0;
    addSlots($("#3slots_5 .wrapper"));
    addSlots($("#3slots_4 .wrapper"));
    addSlots($("#3slots_3 .wrapper"));
    addSlots($("#3slots_2 .wrapper"));
    addSlots($("#3slots_1 .wrapper"));
    addSlots($("#3slots_0 .wrapper"));

    slots[5] = $("#3slots_5 .wrapper");
    slots[4] = $("#3slots_4 .wrapper");
    slots[3] = $("#3slots_3 .wrapper");
    slots[2] = $("#3slots_2 .wrapper");
    slots[1] = $("#3slots_1 .wrapper");
    slots[0] = $("#3slots_0 .wrapper");

    for (var i = 0 ; i <= nb_slots ; ++i)
        margins[i] = init_margin;
}

function addSlots(jqo){
	for(var i = 0; i < numbers_table.length; i++){
		jqo.append("<div class='slot'>"+numbers_table[i]+"</div>");
	}
}

function resetCounter(){
    document.getElementById("time").innerHTML = "0";
    current_value = 0;
    number = 0;
    time_slot = 0;
    for (var i = 0 ; i <= nb_slots ; ++i)
		margins[i] = init_margin;
    for (var i = 0 ; i <= nb_slots ; ++i){
        slots[i].animate(
			{"margin-top":margins[i]+"px"}
			,{'duration' : duration 
			//,'easing' : "easeOutElastic"
			}
		);
    }
}

// Function called by client.js each second
function moveSlots(){
    while (current_value < number){
		moveSlot(0);
		++current_value;
	}
}

function moveSlot(slot_indice){
	if (margins[slot_indice] == init_margin){
		margins[slot_indice] -= margin;
		slots[slot_indice].animate(
			{"margin-top":margins[slot_indice]+"px"}
			,{'duration' : 0 
			//,'easing' : "easeOutElastic"
			}
		);
	}	
	else if ( margins[slot_indice] == -((9 * margin) - init_margin) ){
		margins[slot_indice] -= margin;
		moveSlot(slot_indice+1);
		slots[slot_indice].animate(
			{"margin-top":margins[slot_indice]+"px"}
			,{'duration' : duration 
			//,'easing' : "easeOutElastic"
			}
		);
		margins[slot_indice] = init_margin;
	}		
	else {
		margins[slot_indice] -= margin;
		slots[slot_indice].animate(
			{"margin-top":margins[slot_indice]+"px"}
			,{'duration' : duration 
			//,'easing' : "easeOutElastic"
			}
		);
	}
}

function calculSlots(transactions){
    number += parseInt(transactions[4][2]);
    //console.log("number: "+number);
}