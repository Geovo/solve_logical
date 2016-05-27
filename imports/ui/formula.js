import { Template } from 'meteor/templating';

import { Formulas } from '../api/vars.js';

import './formula.html';

Template.formula.events({
    'click .delete'() {
        Formulas.remove(this._id);
    },
    /*'click .activate'(event) {
        event.preventDefault();
        const instance = Template.instance();
        // Get value from button element
        const target = event.target;

        const text = target.getAttribute("data-val");
        console.log(instance.curr_formula);
        instance.curr_formula = text;
        // put the right value into the input
        //document.getElementById("filler").value += " " + text + " ";
        //Activated = text;
        //console.log(Activated);
    }*/
});
